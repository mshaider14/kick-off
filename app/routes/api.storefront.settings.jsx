import db from "../db.server";

// json helper for responses
function json(data, init) {
  return Response.json(data, init);
}

// Default settings for new merchants
const DEFAULT_SETTINGS = {
  timezone: "America/New_York",
  defaultBarPosition: "top",
  enableViewTracking: true,
  enableClickTracking: true,
  emailNotifications: true,
  weeklySummaryReports: true,
};

export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    
    if (!shop) {
      return json({ error: "Shop parameter required" }, { 
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }

    const savedSetting = await db.setting.findUnique({
      where: { shop: shop }
    });

    let settings = DEFAULT_SETTINGS;
    if (savedSetting && savedSetting.value) {
      const parsedSettings = JSON.parse(savedSetting.value);
      // Merge with defaults to ensure all fields exist
      settings = { ...DEFAULT_SETTINGS, ...parsedSettings };
    }

    return json({ success: true, settings }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60"
      }
    });
  } catch (error) {
    console.error("API Storefront error:", error);
    return json({ success: false, error: error.message }, { 
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};