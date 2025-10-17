import db from "../db.server";

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json({ success: false, error: "Shop parameter required" }, { status: 400 });
    }

    // Find the most recently updated ACTIVE bar of ANY type.
    const bar = await db.bar.findFirst({
      where: { shop, isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!bar) {
      return json({ success: false, message: "No active bar found." });
    }

    // Check schedule
    const now = new Date();
    if ((bar.startDate && now < bar.startDate) || (bar.endDate && now > bar.endDate)) {
      return json({ success: false, message: "Bar is not within its scheduled time." });
    }

    // Format the settings to be sent to the storefront.
    const settings = {
      type: bar.type,
      barMessage: bar.message,
      buttonText: bar.ctaText,
      buttonLink: bar.ctaLink,
      barColor: bar.backgroundColor,
      textColor: bar.textColor,
      barPosition: bar.position,
      // Conditionally add timer settings ONLY if it's a countdown bar
      ...(bar.type === "countdown" && {
        timerType: bar.timerType,
        timerEndDate: bar.timerEndDate,
        timerDailyTime: bar.timerDailyTime,
        timerDuration: bar.timerDuration,
        timerFormat: bar.timerFormat ? JSON.parse(bar.timerFormat) : {},
        timerEndAction: bar.timerEndAction,
        timerEndMessage: bar.timerEndMessage,
      }),
    };

    return json({ success: true, settings }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    console.error("Proxy settings error:", e);
    return json({ success: false, error: e.message }, { status: 500 });
  }
};