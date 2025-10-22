import { authenticate } from "../shopify.server";
import db from "../db.server";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!startDate || !endDate) {
      return json({ error: "Start date and end date are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full end date

    // Get all bars for the shop
    const bars = await db.bar.findMany({
      where: { shop },
      select: {
        id: true,
        message: true,
        type: true,
        isActive: true,
        createdAt: true,
        position: true,
      }
    });

    // Get views and clicks for each bar
    const barIds = bars.map(bar => bar.id);
    
    const [views, clicks] = await Promise.all([
      db.barView.findMany({
        where: {
          shop,
          barId: { in: barIds },
          timestamp: {
            gte: start,
            lte: end
          }
        },
        orderBy: { timestamp: "asc" }
      }),
      db.barClick.findMany({
        where: {
          shop,
          barId: { in: barIds },
          timestamp: {
            gte: start,
            lte: end
          }
        },
        orderBy: { timestamp: "asc" }
      })
    ]);

    // Calculate metrics per bar
    const barMetrics = bars.map(bar => {
      const barViews = views.filter(v => v.barId === bar.id);
      const barClicks = clicks.filter(c => c.barId === bar.id);
      const viewCount = barViews.length;
      const clickCount = barClicks.length;
      const ctr = viewCount > 0 ? ((clickCount / viewCount) * 100).toFixed(2) : "0.00";

      return {
        id: bar.id,
        name: bar.message || `${bar.type} bar`,
        type: bar.type,
        isActive: bar.isActive,
        views: viewCount,
        clicks: clickCount,
        ctr: parseFloat(ctr),
        createdAt: bar.createdAt,
        position: bar.position,
      };
    });

    // Calculate overall metrics
    const totalViews = views.length;
    const totalClicks = clicks.length;
    const overallCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";

    // Group views and clicks by date for chart
    const viewsByDate = {};
    const clicksByDate = {};

    views.forEach(view => {
      const date = view.timestamp.toISOString().split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    clicks.forEach(click => {
      const date = click.timestamp.toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    // Combine dates from both views and clicks
    const allDates = new Set([...Object.keys(viewsByDate), ...Object.keys(clicksByDate)]);
    const chartData = Array.from(allDates).sort().map(date => ({
      date,
      views: viewsByDate[date] || 0,
      clicks: clicksByDate[date] || 0
    }));

    return json({
      overview: {
        totalViews,
        totalClicks,
        ctr: parseFloat(overallCtr),
        conversionRate: 0 // Placeholder for future conversion tracking
      },
      barMetrics,
      chartData
    });
  } catch (error) {
    console.error("Analytics data error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
