import db from "../db.server";

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json({ success: false, error: "Shop parameter required" }, { status: 400 });
    }

    // --- THE FIX ---
    // 1. Query the new `Bar` model.
    // 2. Find the most recently updated bar that is currently ACTIVE.
    const activeBar = await db.bar.findFirst({
      where: {
        shop: shop,
        isActive: true, // Only serve bars that the merchant has published.
      },
      orderBy: {
        updatedAt: "desc", // If multiple are active, show the newest one.
      },
    });

    if (activeBar) {
      // 3. Map the fields from our new `Bar` model to the structure
      //    the storefront script expects.
      const settings = {
        barMessage: activeBar.message,
        buttonText: activeBar.ctaText,
        buttonLink: activeBar.ctaLink,
        barColor: activeBar.backgroundColor,
        textColor: activeBar.textColor,
        barPosition: activeBar.position,
      };

      return json({ success: true, settings }, {
        headers: {
          "Cache-Control": "public, max-age=60", // Cache for 1 minute.
        },
      });
    }

    // 4. If no active bar is found, explicitly say so.
    return json({ success: false, message: "No active announcement bar found." });
  } catch (e) {
    console.error("Proxy settings error:", e);
    return json({ success: false, error: e.message }, { status: 500 });
  }
};