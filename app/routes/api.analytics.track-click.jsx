import db from "../db.server";

function json(data, init) {
  return Response.json(data, init);
}

export const action = async ({ request }) => {
  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await request.json();
    const { shop, barId, ctaLink } = body;
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

    // Track click
    await db.barClick.create({
      data: {
        barId,
        shop,
        ctaLink,
        userAgent
      }
    });

    return json({ success: true }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Track click error:", error);
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
