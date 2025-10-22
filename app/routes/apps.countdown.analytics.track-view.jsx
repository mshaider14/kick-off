import db from "../db.server";

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
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
      return json({ error: "Shop and barId are required" }, { status: 400 });
    }

    // Verify bar exists
    const bar = await db.bar.findFirst({
      where: { id: barId, shop }
    });

    if (!bar) {
      return json({ error: "Bar not found" }, { status: 404 });
    }

    // Track view
    await db.barView.create({
      data: {
        barId,
        shop,
        userAgent
      }
    });

    return json({ success: true });
  } catch (error) {
    console.error("Track view error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
