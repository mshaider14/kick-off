import db from "../db.server";

// json helper for responses
function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json({ success: false, error: "Shop parameter required" }, { status: 400 });
    }

    // Find active countdown bar for this shop
    const bar = await db.bar.findFirst({
      where: {
        shop,
        type: "countdown",
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!bar) {
      return json({ success: false, message: "No active countdown bar found" });
    }

    // Check if bar should be displayed based on schedule
    const now = new Date();
    if (bar.startDate && now < bar.startDate) {
      return json({ success: false, message: "Bar not yet started" });
    }
    if (bar.endDate && now > bar.endDate) {
      return json({ success: false, message: "Bar has ended" });
    }

    // Parse timer format
    let timerFormat = { showDays: true, showHours: true, showMinutes: true, showSeconds: true };
    if (bar.timerFormat) {
      try {
        timerFormat = JSON.parse(bar.timerFormat);
      } catch (e) {
        console.error("Error parsing timer format:", e);
      }
    }

    // Build settings object for frontend
    const settings = {
      barMessage: bar.message,
      buttonText: bar.ctaText,
      buttonLink: bar.ctaLink,
      barColor: bar.backgroundColor,
      barPosition: bar.position,
      timerType: bar.timerType,
      timerEndDate: bar.timerEndDate?.toISOString(),
      timerDailyTime: bar.timerDailyTime,
      timerDuration: bar.timerDuration,
      timerFormat,
      timerEndAction: bar.timerEndAction,
      timerEndMessage: bar.timerEndMessage,
    };

    return json({ success: true, settings }, {
      headers: {
        "Cache-Control": "public, max-age=60"
      }
    });
  } catch (e) {
    console.error("Proxy settings error:", e);
    return json({ success: false, error: e.message }, { status: 500 });
  }
};