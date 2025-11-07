import { authenticate } from "../shopify.server";
import db from "../db.server";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const billingHistory = await db.billingHistory.findMany({
      where: { shop },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return json({
      success: true,
      history: billingHistory,
    });
  } catch (error) {
    console.error("Billing history error:", error);
    return json({ 
      error: error.message || "Failed to fetch billing history" 
    }, { status: 500 });
  }
};
