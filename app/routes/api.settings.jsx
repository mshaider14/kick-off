import { authenticate } from "../shopify.server";
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
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const savedSetting = await db.setting.findUnique({
      where: { shop: shop }
    });

    if (savedSetting && savedSetting.value) {
      const settings = JSON.parse(savedSetting.value);
      // Merge with defaults to ensure all fields exist
      return json({ success: true, settings: { ...DEFAULT_SETTINGS, ...settings } });
    }

    // Return default settings for new merchants
    return json({ success: true, settings: DEFAULT_SETTINGS });
  } catch (error) {
    console.error("API Settings error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const formData = await request.formData();
    const settingsData = {
      timezone: formData.get("timezone") || DEFAULT_SETTINGS.timezone,
      defaultBarPosition: formData.get("defaultBarPosition") || DEFAULT_SETTINGS.defaultBarPosition,
      enableViewTracking: formData.get("enableViewTracking") === "true",
      enableClickTracking: formData.get("enableClickTracking") === "true",
      emailNotifications: formData.get("emailNotifications") === "true",
      weeklySummaryReports: formData.get("weeklySummaryReports") === "true",
    };

    // Validate settings
    const errors = validateSettings(settingsData);
    if (Object.keys(errors).length > 0) {
      return json({ success: false, errors }, { status: 400 });
    }

    // Save or update settings
    const savedSetting = await db.setting.upsert({
      where: { shop },
      update: {
        value: JSON.stringify(settingsData),
        updatedAt: new Date(),
      },
      create: {
        shop,
        value: JSON.stringify(settingsData),
      },
    });

    return json({
      success: true,
      settings: JSON.parse(savedSetting.value),
      message: "Settings saved successfully!",
    });
  } catch (error) {
    console.error("API Settings save error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

// Validation function
function validateSettings(settings) {
  const errors = {};

  // Validate timezone (basic check)
  if (!settings.timezone || settings.timezone.trim() === "") {
    errors.timezone = "Timezone is required";
  }

  // Validate bar position
  if (!["top", "bottom"].includes(settings.defaultBarPosition)) {
    errors.defaultBarPosition = "Bar position must be 'top' or 'bottom'";
  }

  // Validate boolean fields
  if (typeof settings.enableViewTracking !== "boolean") {
    errors.enableViewTracking = "View tracking must be a boolean value";
  }
  if (typeof settings.enableClickTracking !== "boolean") {
    errors.enableClickTracking = "Click tracking must be a boolean value";
  }
  if (typeof settings.emailNotifications !== "boolean") {
    errors.emailNotifications = "Email notifications must be a boolean value";
  }
  if (typeof settings.weeklySummaryReports !== "boolean") {
    errors.weeklySummaryReports = "Weekly summary reports must be a boolean value";
  }

  return errors;
}