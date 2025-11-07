import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getCurrentMonthKey, getPlanByName, getViewLimit } from "../utils/plans";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Get or create merchant record
    let merchant = await db.merchant.findUnique({
      where: { shop },
    });

    if (!merchant) {
      merchant = await db.merchant.create({
        data: {
          shop,
          planName: 'free',
          planPrice: 0,
          billingActivated: true,
        },
      });
    }

    // Get current month's usage
    const currentMonth = getCurrentMonthKey();
    let viewUsage = await db.viewUsage.findUnique({
      where: {
        shop_month: {
          shop,
          month: currentMonth,
        },
      },
    });

    if (!viewUsage) {
      viewUsage = await db.viewUsage.create({
        data: {
          shop,
          month: currentMonth,
          viewCount: 0,
        },
      });
    }

    const plan = getPlanByName(merchant.planName);
    const viewLimit = getViewLimit(merchant.planName);

    return json({
      success: true,
      merchant: {
        shop: merchant.shop,
        planName: merchant.planName,
        planPrice: merchant.planPrice,
        billingActivated: merchant.billingActivated,
        currentPeriodEnd: merchant.currentPeriodEnd,
      },
      plan: {
        name: plan.name,
        price: plan.price,
        viewLimit: viewLimit === Infinity ? 'unlimited' : viewLimit,
        features: plan.features,
      },
      usage: {
        viewCount: viewUsage.viewCount,
        viewLimit: viewLimit === Infinity ? 'unlimited' : viewLimit,
        percentage: viewLimit === Infinity ? 0 : Math.min(100, (viewUsage.viewCount / viewLimit) * 100),
        month: currentMonth,
      },
    });
  } catch (error) {
    console.error("Plan status error:", error);
    return json({ 
      error: error.message || "Failed to fetch plan status" 
    }, { status: 500 });
  }
};
