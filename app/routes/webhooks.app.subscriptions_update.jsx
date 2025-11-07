import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getPlanNameFromPrice } from "../utils/billing.server";

function json(data, init) {
  return Response.json(data, init);
}

export const action = async ({ request }) => {
  try {
    const { topic, shop, session, payload } = await authenticate.webhook(request);

    console.log(`Received webhook: ${topic} for shop: ${shop}`);

    if (topic === "APP_SUBSCRIPTIONS_UPDATE") {
      const subscription = payload.app_subscription;
      
      if (!subscription) {
        return json({ success: true });
      }

      const status = subscription.status?.toLowerCase();
      const price = parseFloat(subscription.line_items?.[0]?.plan?.pricing_details?.price?.amount || 0);
      const planName = getPlanNameFromPrice(price);

      // Update merchant record based on subscription status
      await db.merchant.upsert({
        where: { shop },
        create: {
          shop,
          planName: status === 'active' ? planName : 'free',
          planPrice: status === 'active' ? price : 0,
          chargeId: subscription.id,
          chargeStatus: status,
          billingActivated: status === 'active',
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : null,
        },
        update: {
          planName: status === 'active' ? planName : 'free',
          planPrice: status === 'active' ? price : 0,
          chargeId: subscription.id,
          chargeStatus: status,
          billingActivated: status === 'active',
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : null,
        },
      });

      // Update billing history
      await db.billingHistory.updateMany({
        where: {
          shop,
          chargeId: subscription.id,
        },
        data: {
          status,
          activatedOn: status === 'active' ? new Date() : undefined,
          cancelledOn: status === 'cancelled' ? new Date() : undefined,
        },
      });

      console.log(`Updated subscription for ${shop}: ${status}`);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Billing webhook error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
