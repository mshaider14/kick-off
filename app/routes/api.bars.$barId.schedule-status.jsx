import db from "../db.server";

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

/**
 * GET /api/bars/:barId/schedule-status
 * 
 * Check if a bar is currently within its scheduled time window.
 * 
 * Query Parameters:
 * - shop (required): The shop domain
 * 
 * Returns:
 * {
 *   success: boolean,
 *   barId: string,
 *   isScheduled: boolean,
 *   isActive: boolean,
 *   shouldBeActive: boolean,
 *   schedule: {
 *     startDate: string | null,
 *     endDate: string | null,
 *     timezone: string,
 *     startImmediate: boolean,
 *     endNever: boolean
 *   },
 *   message: string
 * }
 */
export const loader = async ({ request, params }) => {
  try {
    const { barId } = params;
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json({ success: false, error: "Shop parameter required" }, { status: 400 });
    }

    if (!barId) {
      return json({ success: false, error: "Bar ID required" }, { status: 400 });
    }

    // Find the bar
    const bar = await db.bar.findFirst({
      where: {
        id: barId,
        shop,
      },
    });

    if (!bar) {
      return json({ success: false, error: "Bar not found" }, { status: 404 });
    }

    const now = new Date();
    let shouldBeActive = false;
    let message = "";

    // Check if bar should be active based on schedule
    if (bar.scheduleStartImmediate) {
      // Immediate start - should be active if published
      shouldBeActive = bar.isActive;
      message = "Bar is set to start immediately";
    } else if (bar.startDate) {
      const startDate = new Date(bar.startDate);
      
      if (now < startDate) {
        shouldBeActive = false;
        message = `Bar is scheduled to start on ${startDate.toISOString()}`;
      } else {
        // Start date has passed, check end date
        if (bar.scheduleEndNever) {
          shouldBeActive = true;
          message = "Bar is scheduled to run indefinitely";
        } else if (bar.endDate) {
          const endDate = new Date(bar.endDate);
          if (now <= endDate) {
            shouldBeActive = true;
            message = `Bar is scheduled until ${endDate.toISOString()}`;
          } else {
            shouldBeActive = false;
            message = `Bar schedule ended on ${endDate.toISOString()}`;
          }
        } else {
          shouldBeActive = true;
          message = "Bar is scheduled with no end date";
        }
      }
    } else {
      // No start date and not immediate - shouldn't be active
      shouldBeActive = false;
      message = "Bar has no schedule configured";
    }

    return json({
      success: true,
      barId: bar.id,
      isScheduled: !!(bar.startDate || bar.scheduleStartImmediate),
      isActive: bar.isActive,
      shouldBeActive,
      schedule: {
        startDate: bar.startDate ? bar.startDate.toISOString() : null,
        endDate: bar.endDate ? bar.endDate.toISOString() : null,
        timezone: bar.timezone || "UTC",
        startImmediate: bar.scheduleStartImmediate || false,
        endNever: bar.scheduleEndNever || false,
      },
      message,
    });
  } catch (error) {
    console.error("Schedule status check error:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
};
