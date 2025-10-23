import db from "../db.server";

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

/**
 * GET/POST /api/schedule/check
 * 
 * This endpoint is called by a cron job to check and update bar schedules.
 * It automatically activates bars that should start and deactivates bars that should end.
 * 
 * Security: Should be called internally or with proper authentication in production
 * 
 * Returns:
 * {
 *   success: boolean,
 *   activated: number,
 *   deactivated: number,
 *   message: string
 * }
 */
export const loader = async ({ request }) => {
  return await checkSchedules(request);
};

export const action = async ({ request }) => {
  return await checkSchedules(request);
};

async function checkSchedules(request) {
  try {
    // In production, you should verify this request comes from your cron service
    // For now, we'll add a simple token check
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    
    // You should set CRON_SECRET_TOKEN in your environment variables
    // eslint-disable-next-line no-undef
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    if (expectedToken && token !== expectedToken) {
      return json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    let activatedCount = 0;
    let deactivatedCount = 0;

    // Get all shops to process their bars
    const shops = await db.bar.findMany({
      select: { shop: true },
      distinct: ['shop'],
    });

    for (const { shop } of shops) {
      // Process bars that should be activated
      const barsToActivate = await db.bar.findMany({
        where: {
          shop,
          isActive: false,
          AND: [
            {
              OR: [
                {
                  // Bars with immediate start that haven't been activated yet
                  scheduleStartImmediate: true,
                },
                {
                  // Bars with a scheduled start time that has passed
                  scheduleStartImmediate: false,
                  startDate: {
                    lte: now,
                  },
                },
              ],
            },
            {
              // Must not have ended yet
              OR: [
                {
                  scheduleEndNever: true,
                },
                {
                  scheduleEndNever: false,
                  endDate: null,
                },
                {
                  scheduleEndNever: false,
                  endDate: {
                    gte: now,
                  },
                },
              ],
            },
          ],
        },
      });

      // Activate each bar (deactivating others in the shop)
      for (const bar of barsToActivate) {
        await db.$transaction([
          // Deactivate all other bars for this shop
          db.bar.updateMany({
            where: { 
              shop: bar.shop, 
              isActive: true, 
              NOT: { id: bar.id } 
            },
            data: { isActive: false },
          }),
          // Activate this bar
          db.bar.update({
            where: { id: bar.id },
            data: { isActive: true },
          }),
        ]);
        activatedCount++;
      }

      // Process bars that should be deactivated
      const barsToDeactivate = await db.bar.findMany({
        where: {
          shop,
          isActive: true,
          scheduleEndNever: false,
          endDate: {
            lt: now,
          },
        },
      });

      for (const bar of barsToDeactivate) {
        await db.bar.update({
          where: { id: bar.id },
          data: { isActive: false },
        });
        deactivatedCount++;
      }
    }

    return json({
      success: true,
      activated: activatedCount,
      deactivated: deactivatedCount,
      message: `Schedule check completed: ${activatedCount} activated, ${deactivatedCount} deactivated`,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Schedule check error:", error);
    return json(
      {
        success: false,
        error: error.message,
        activated: 0,
        deactivated: 0,
      },
      { status: 500 }
    );
  }
}
