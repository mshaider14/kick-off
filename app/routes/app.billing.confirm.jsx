import { redirect } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getCurrentSubscription } from "../utils/billing.server";

export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;

    const url = new URL(request.url);
    const chargeId = url.searchParams.get("charge_id");
    const planName = url.searchParams.get("planName");

    if (!chargeId) {
      console.error("No charge_id provided");
      return redirect("/app/pricing?error=missing_charge_id");
    }

    // Get current subscription to verify status
    const subscription = await getCurrentSubscription(admin);

    if (!subscription || subscription.id !== chargeId) {
      // Charge was declined or doesn't exist
      await db.merchant.updateMany({
        where: { shop, chargeId },
        data: {
          chargeStatus: 'declined',
          billingActivated: false,
        },
      });

      await db.billingHistory.updateMany({
        where: { shop, chargeId },
        data: {
          status: 'declined',
        },
      });

      return redirect("/app/pricing?error=charge_declined");
    }

    // Charge was accepted
    const amount = parseFloat(subscription.lineItems[0]?.plan?.pricingDetails?.price?.amount || 0);

    await db.merchant.upsert({
      where: { shop },
      create: {
        shop,
        planName: planName || 'starter',
        planPrice: amount,
        chargeId: subscription.id,
        chargeStatus: 'active',
        billingActivated: true,
        currentPeriodEnd: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null,
      },
      update: {
        planName: planName || 'starter',
        planPrice: amount,
        chargeId: subscription.id,
        chargeStatus: 'active',
        billingActivated: true,
        currentPeriodEnd: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null,
      },
    });

    await db.billingHistory.updateMany({
      where: { shop, chargeId: subscription.id },
      data: {
        status: 'active',
        activatedOn: new Date(),
      },
    });

    return redirect("/app/pricing?success=true");
  } catch (error) {
    console.error("Billing confirmation error:", error);
    return redirect("/app/pricing?error=confirmation_failed");
  }
};
