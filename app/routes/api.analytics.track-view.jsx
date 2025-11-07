import db from "../db.server";
import { getCurrentMonthKey, hasReachedViewLimit } from "../utils/plans";

function json(data, init) {
  return Response.json(data, init);
}

export const action = async ({ request }) => {
  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await request.json();
    const { shop, barId } = body;
    const userAgent = request.headers.get("user-agent");

    if (!shop || !barId) {
      return json({ error: "Shop and barId are required" }, { 
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }

    // Get merchant and check plan limits
    let merchant = await db.merchant.findUnique({
      where: { shop }
    });

    if (!merchant) {
      // Create free plan merchant if not exists
      merchant = await db.merchant.create({
        data: {
          shop,
          planName: 'free',
          planPrice: 0,
          billingActivated: true,
        }
      });
    }

    // Get current month's usage
    const currentMonth = getCurrentMonthKey();
    let viewUsage = await db.viewUsage.findUnique({
      where: {
        shop_month: {
          shop,
          month: currentMonth,
        }
      }
    });

    if (!viewUsage) {
      viewUsage = await db.viewUsage.create({
        data: {
          shop,
          month: currentMonth,
          viewCount: 0,
        }
      });
    }

    // Check if limit is reached
    if (hasReachedViewLimit(viewUsage.viewCount, merchant.planName)) {
      return json({ 
        error: "View limit reached",
        limitReached: true,
        planName: merchant.planName,
        viewCount: viewUsage.viewCount
      }, { 
        status: 429,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }

    // Verify bar exists
    const bar = await db.bar.findFirst({
      where: { id: barId, shop }
    });

    if (!bar) {
      return json({ error: "Bar not found" }, { 
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }

    // Track view and increment usage count in a transaction
    await db.$transaction([
      db.barView.create({
        data: {
          barId,
          shop,
          userAgent
        }
      }),
      db.viewUsage.update({
        where: {
          shop_month: {
            shop,
            month: currentMonth,
          }
        },
        data: {
          viewCount: {
            increment: 1
          }
        }
      })
    ]);

    return json({ success: true }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Track view error:", error);
    return json({ error: error.message }, { 
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  }
};

// Handle CORS preflight
export const OPTIONS = () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
