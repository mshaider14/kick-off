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

    // Check schedule with timezone awareness
    const now = new Date();
    if (bar.startDate) {
      const startDate = new Date(bar.startDate);
      if (now < startDate) {
        return json({ success: false, message: "Bar is not within its scheduled time." });
      }
    }
    if (bar.endDate) {
      const endDate = new Date(bar.endDate);
      if (now > endDate) {
        return json({ success: false, message: "Bar is not within its scheduled time." });
      }
    }
    
    // Validate countdown timer data for production
    if (bar.type === "countdown") {
      if (!bar.timerType) {
        console.error(`Bar ${bar.id} has invalid timer configuration`);
        return json({ success: false, message: "Invalid countdown configuration." });
      }
      
      // Additional validation based on timer type
      if (bar.timerType === "fixed" && !bar.timerEndDate) {
        return json({ success: false, message: "Invalid countdown configuration." });
      }
      if (bar.timerType === "daily" && !bar.timerDailyTime) {
        return json({ success: false, message: "Invalid countdown configuration." });
      }
      if (bar.timerType === "evergreen" && (!bar.timerDuration || bar.timerDuration <= 0)) {
        return json({ success: false, message: "Invalid countdown configuration." });
      }
    }

    // Format the settings to be sent to the storefront.
    const settings = {
      id: bar.id,
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
        timerEndDate: bar.timerEndDate ? bar.timerEndDate.toISOString() : null,
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