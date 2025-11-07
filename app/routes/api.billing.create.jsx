import { authenticate } from "../shopify.server";
import db from "../db.server";
import { createRecurringCharge } from "../utils/billing.server";
import { getPlanByName } from "../utils/plans";

function json(data, init) {
  return Response.json(data, init);
}

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;

    const formData = await request.formData();
    const planName = formData.get("planName");

    if (!planName || !['free', 'starter', 'pro', 'scale'].includes(planName)) {
      return json({ error: "Invalid plan name" }, { status: 400 });
    }

    const plan = getPlanByName(planName);

    // Handle free plan - no charge needed
    if (plan.price === 0) {
      // Update or create merchant record
      await db.merchant.upsert({
        where: { shop },
        create: {
          shop,
          planName: 'free',
          planPrice: 0,
          billingActivated: true,
        },
        update: {
          planName: 'free',
          planPrice: 0,
          billingActivated: true,
          chargeId: null,
          chargeStatus: null,
        },
      });

      return json({ 
        success: true, 
        plan: 'free',
        message: 'Downgraded to free plan' 
      });
    }

    // Create recurring charge for paid plans
    const appUrl = process.env.SHOPIFY_APP_URL || "";
    const returnUrl = `${appUrl}/app/billing/confirm?planName=${planName}`;

    const charge = await createRecurringCharge(admin, shop, planName, returnUrl);

    // Save pending charge to database
    await db.merchant.upsert({
      where: { shop },
      create: {
        shop,
        planName,
        planPrice: plan.price,
        chargeId: charge.id,
        chargeStatus: 'pending',
        billingActivated: false,
      },
      update: {
        planName,
        planPrice: plan.price,
        chargeId: charge.id,
        chargeStatus: 'pending',
        billingActivated: false,
      },
    });

    // Record in billing history
    await db.billingHistory.create({
      data: {
        shop,
        chargeId: charge.id,
        planName,
        amount: plan.price,
        status: 'pending',
      },
    });

    return json({ 
      success: true, 
      confirmationUrl: charge.confirmationUrl,
      chargeId: charge.id 
    });
  } catch (error) {
    console.error("Billing creation error:", error);
    return json({ 
      error: error.message || "Failed to create billing charge" 
    }, { status: 500 });
  }
};
