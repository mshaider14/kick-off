import {
  Page,
  Layout,
  Card,
  Text,
  FormLayout,
  Select,
  Checkbox,
  Toast,
  LegacyStack,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import {
  useLoaderData,
  useActionData,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { authenticate } from "../shopify.server";
import db from "../db.server";

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

    let settings = DEFAULT_SETTINGS;
    if (savedSetting && savedSetting.value) {
      const parsedSettings = JSON.parse(savedSetting.value);
      // Merge with defaults to ensure all fields exist
      settings = { ...DEFAULT_SETTINGS, ...parsedSettings };
    }

    return json({
      merchant: {
        shop: session.shop,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
      },
      settings,
    });
  } catch (error) {
    console.error("Settings loader error:", error);
    return json({
      merchant: { shop: "N/A" },
      settings: DEFAULT_SETTINGS,
      error: error.message,
    });
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
    console.error("Settings action error:", error);
    return json({ success: false, error: error.message }, { status: 400 });
  }
};

// Validation function
function validateSettings(settings) {
  const errors = {};

  if (!settings.timezone || settings.timezone.trim() === "") {
    errors.timezone = "Timezone is required";
  }

  if (!["top", "bottom"].includes(settings.defaultBarPosition)) {
    errors.defaultBarPosition = "Bar position must be 'top' or 'bottom'";
  }

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

// Timezone options (common timezones)
const TIMEZONE_OPTIONS = [
  { label: "Eastern Time (US & Canada)", value: "America/New_York" },
  { label: "Central Time (US & Canada)", value: "America/Chicago" },
  { label: "Mountain Time (US & Canada)", value: "America/Denver" },
  { label: "Pacific Time (US & Canada)", value: "America/Los_Angeles" },
  { label: "Alaska", value: "America/Anchorage" },
  { label: "Hawaii", value: "Pacific/Honolulu" },
  { label: "London (GMT)", value: "Europe/London" },
  { label: "Paris", value: "Europe/Paris" },
  { label: "Berlin", value: "Europe/Berlin" },
  { label: "Moscow", value: "Europe/Moscow" },
  { label: "Dubai", value: "Asia/Dubai" },
  { label: "Mumbai", value: "Asia/Kolkata" },
  { label: "Bangkok", value: "Asia/Bangkok" },
  { label: "Singapore", value: "Asia/Singapore" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
  { label: "Auckland", value: "Pacific/Auckland" },
  { label: "UTC", value: "UTC" },
];

const BAR_POSITION_OPTIONS = [
  { label: "Top of page", value: "top" },
  { label: "Bottom of page", value: "bottom" },
];

export default function SettingsPage() {
  const { merchant, settings: initialSettings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Form state
  const [formData, setFormData] = useState(initialSettings);

  // Update form data when initial settings change
  useEffect(() => {
    setFormData(initialSettings);
  }, [initialSettings]);

  // Handle action response
  useEffect(() => {
    if (actionData?.success) {
      setToastMessage("✅ " + actionData.message);
      setToastError(false);
      setShowToast(true);
      // Update form data with saved settings
      if (actionData.settings) {
        setFormData(actionData.settings);
      }
    } else if (actionData?.error || actionData?.errors) {
      const errorMsg = actionData.error || Object.values(actionData.errors).join(", ");
      setToastMessage("❌ Error: " + errorMsg);
      setToastError(true);
      setShowToast(true);
    }
  }, [actionData]);

  const handleSubmit = useCallback(() => {
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("timezone", formData.timezone);
    formDataToSubmit.append("defaultBarPosition", formData.defaultBarPosition);
    formDataToSubmit.append("enableViewTracking", String(formData.enableViewTracking));
    formDataToSubmit.append("enableClickTracking", String(formData.enableClickTracking));
    formDataToSubmit.append("emailNotifications", String(formData.emailNotifications));
    formDataToSubmit.append("weeklySummaryReports", String(formData.weeklySummaryReports));
    submit(formDataToSubmit, { method: "post" });
  }, [formData, submit]);

  return (
    <Page
      title="Settings"
      primaryAction={{
        content: "Save Settings",
        onAction: handleSubmit,
        loading: isSubmitting,
        disabled: isSubmitting,
      }}
    >
      <TitleBar title="Settings" />
      
      <Layout>
        {/* Account Information */}
        <Layout.Section>
          <Card>
            <div style={{ padding: "16px" }}>
              <LegacyStack vertical spacing="loose">
                <Text variant="headingMd" as="h2">
                  Account Information
                </Text>
                <LegacyStack vertical spacing="tight">
                  <LegacyStack distribution="equalSpacing">
                    <Text variant="bodyMd" as="p" color="subdued">
                      Store:
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      {merchant.shop}
                    </Text>
                  </LegacyStack>
                  {merchant.email && (
                    <LegacyStack distribution="equalSpacing">
                      <Text variant="bodyMd" as="p" color="subdued">
                        Email:
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {merchant.email}
                      </Text>
                    </LegacyStack>
                  )}
                  {(merchant.firstName || merchant.lastName) && (
                    <LegacyStack distribution="equalSpacing">
                      <Text variant="bodyMd" as="p" color="subdued">
                        Name:
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {merchant.firstName} {merchant.lastName}
                      </Text>
                    </LegacyStack>
                  )}
                </LegacyStack>
              </LegacyStack>
            </div>
          </Card>
        </Layout.Section>

        {/* General Settings */}
        <Layout.Section>
          <Card>
            <div style={{ padding: "16px" }}>
              <LegacyStack vertical spacing="loose">
                <Text variant="headingMd" as="h2">
                  General Settings
                </Text>
                <FormLayout>
                  <Select
                    label="Store Timezone"
                    options={TIMEZONE_OPTIONS}
                    value={formData.timezone}
                    onChange={(value) =>
                      setFormData({ ...formData, timezone: value })
                    }
                    helpText="Set your store's timezone for scheduling and reports"
                  />

                  <Select
                    label="Default Bar Position"
                    options={BAR_POSITION_OPTIONS}
                    value={formData.defaultBarPosition}
                    onChange={(value) =>
                      setFormData({ ...formData, defaultBarPosition: value })
                    }
                    helpText="Choose where announcement bars appear by default"
                  />

                  <div style={{ marginTop: "16px" }}>
                    <Text variant="headingSm" as="h3">
                      Tracking Preferences
                    </Text>
                    <div style={{ marginTop: "12px" }}>
                      <LegacyStack vertical spacing="tight">
                        <Checkbox
                          label="Enable view tracking"
                          checked={formData.enableViewTracking}
                          onChange={(value) =>
                            setFormData({ ...formData, enableViewTracking: value })
                          }
                          helpText="Track how many times announcement bars are viewed"
                        />
                        <Checkbox
                          label="Enable click tracking"
                          checked={formData.enableClickTracking}
                          onChange={(value) =>
                            setFormData({ ...formData, enableClickTracking: value })
                          }
                          helpText="Track clicks on announcement bar call-to-action buttons"
                        />
                      </LegacyStack>
                    </div>
                  </div>
                </FormLayout>
              </LegacyStack>
            </div>
          </Card>
        </Layout.Section>

        {/* Notification Preferences */}
        <Layout.Section>
          <Card>
            <div style={{ padding: "16px" }}>
              <LegacyStack vertical spacing="loose">
                <Text variant="headingMd" as="h2">
                  Notification Preferences
                </Text>
                <Text variant="bodyMd" as="p" color="subdued">
                  Manage how you receive updates about your announcement bars
                </Text>

                <div style={{ marginTop: "12px" }}>
                  <LegacyStack vertical spacing="tight">
                    <Checkbox
                      label="Email notifications for bar performance"
                      checked={formData.emailNotifications}
                      onChange={(value) =>
                        setFormData({ ...formData, emailNotifications: value })
                      }
                      helpText="Receive email alerts when bars reach performance milestones"
                    />
                    <Checkbox
                      label="Weekly summary reports"
                      checked={formData.weeklySummaryReports}
                      onChange={(value) =>
                        setFormData({ ...formData, weeklySummaryReports: value })
                      }
                      helpText="Get a weekly email with your announcement bar analytics"
                    />
                  </LegacyStack>
                </div>
              </LegacyStack>
            </div>
          </Card>
        </Layout.Section>

        {/* Info Banner */}
        <Layout.Section>
          <Banner tone="info">
            <p>
              Changes to tracking preferences will apply to new bars and data collected going forward.
              Existing analytics data will not be affected.
            </p>
          </Banner>
        </Layout.Section>
      </Layout>

      {showToast && (
        <Toast
          content={toastMessage}
          error={toastError}
          onDismiss={() => setShowToast(false)}
          duration={4000}
        />
      )}
    </Page>
  );
}
