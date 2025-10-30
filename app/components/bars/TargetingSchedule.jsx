import { Card, FormLayout, TextField, LegacyStack, Text, Checkbox, Select, Banner } from "@shopify/polaris";
import PropTypes from "prop-types";

// Common timezone options
const TIMEZONE_OPTIONS = [
  { label: "UTC (Coordinated Universal Time)", value: "UTC" },
  { label: "America/New_York (Eastern Time)", value: "America/New_York" },
  { label: "America/Chicago (Central Time)", value: "America/Chicago" },
  { label: "America/Denver (Mountain Time)", value: "America/Denver" },
  { label: "America/Los_Angeles (Pacific Time)", value: "America/Los_Angeles" },
  { label: "America/Phoenix (Arizona)", value: "America/Phoenix" },
  { label: "America/Anchorage (Alaska)", value: "America/Anchorage" },
  { label: "Pacific/Honolulu (Hawaii)", value: "Pacific/Honolulu" },
  { label: "Europe/London (UK)", value: "Europe/London" },
  { label: "Europe/Paris (Central Europe)", value: "Europe/Paris" },
  { label: "Europe/Berlin (Germany)", value: "Europe/Berlin" },
  { label: "Asia/Dubai (UAE)", value: "Asia/Dubai" },
  { label: "Asia/Kolkata (India)", value: "Asia/Kolkata" },
  { label: "Asia/Shanghai (China)", value: "Asia/Shanghai" },
  { label: "Asia/Tokyo (Japan)", value: "Asia/Tokyo" },
  { label: "Australia/Sydney (Australia)", value: "Australia/Sydney" },
];

export function TargetingSchedule({ formData, onChange }) {
  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleCheckboxChange = (field) => (value) => {
    const updates = { ...formData, [field]: value };
    
    // If "Start immediately" is checked, clear startDate
    if (field === "scheduleStartImmediate" && value) {
      updates.startDate = "";
    }
    
    // If "End never" is checked, clear endDate
    if (field === "scheduleEndNever" && value) {
      updates.endDate = "";
    }
    
    onChange(updates);
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    } else {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }
  };

  // Get current date and time in the format required by datetime-local
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  
  // Format dates for better display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card sectioned>
      <LegacyStack vertical spacing="loose">
        <Text variant="headingLg" as="h2">
          Schedule
        </Text>
        <Text variant="bodyMd" as="p" color="subdued">
          Set when your announcement bar should be displayed.
        </Text>

        <FormLayout>
          {/* Priority Selection */}
          <Select
            label="Priority Level"
            options={[
              { label: "1 - Highest Priority", value: "1" },
              { label: "2 - Very High", value: "2" },
              { label: "3 - High", value: "3" },
              { label: "4 - Above Normal", value: "4" },
              { label: "5 - Normal (Default)", value: "5" },
              { label: "6 - Below Normal", value: "6" },
              { label: "7 - Low", value: "7" },
              { label: "8 - Very Low", value: "8" },
              { label: "9 - Minimal", value: "9" },
              { label: "10 - Lowest Priority", value: "10" },
            ]}
            value={String(formData.priority || 5)}
            onChange={(value) => handleFieldChange("priority")(parseInt(value, 10))}
            helpText="When multiple bars are active, higher priority bars (lower numbers) display first. Bars with equal priority display in creation order."
          />
          
          {formData.priority !== 5 && (
            <div style={{ marginTop: "-12px", padding: "12px", backgroundColor: "#fef3c7", borderRadius: "6px", border: "1px solid #fbbf24" }}>
              <Text variant="bodySm" as="p">
                <strong>ℹ️ Priority Behavior:</strong> This bar has {formData.priority < 5 ? "higher" : "lower"} than normal priority.
                {formData.priority < 5 
                  ? " It will display before bars with normal or lower priority."
                  : " It will only display if no higher priority bars are active."}
              </Text>
            </div>
          )}

          {/* Timezone Selection */}
          <Select
            label="Timezone"
            options={TIMEZONE_OPTIONS}
            value={formData.timezone || "UTC"}
            onChange={handleFieldChange("timezone")}
            helpText="Select the timezone for your schedule. All times will be interpreted in this timezone."
          />

          {/* Start Schedule Options */}
          <div>
            <Checkbox
              label="Start immediately when published"
              checked={formData.scheduleStartImmediate || false}
              onChange={handleCheckboxChange("scheduleStartImmediate")}
              helpText="The bar will become active as soon as you publish it"
            />
          </div>

          {!formData.scheduleStartImmediate && (
            <div>
              <TextField
                label="Start Date & Time"
                value={formData.startDate || ""}
                onChange={handleFieldChange("startDate")}
                type="datetime-local"
                helpText={`When the bar should start displaying (in ${formData.timezone || "UTC"})`}
                min={minDateTime}
              />
              {formData.startDate && (
                <div style={{ marginTop: "8px", padding: "8px 12px", backgroundColor: "#f0fdf4", borderRadius: "6px", border: "1px solid #86efac" }}>
                  <Text variant="bodySm" as="p" color="success">
                    Will start: {formatDateForDisplay(formData.startDate)} ({formData.timezone || "UTC"})
                  </Text>
                </div>
              )}
            </div>
          )}

          {/* End Schedule Options */}
          <div>
            <Checkbox
              label="Never end (run indefinitely)"
              checked={formData.scheduleEndNever || false}
              onChange={handleCheckboxChange("scheduleEndNever")}
              helpText="The bar will continue displaying until you manually deactivate it"
            />
          </div>

          {!formData.scheduleEndNever && (
            <div>
              <TextField
                label="End Date & Time"
                value={formData.endDate || ""}
                onChange={handleFieldChange("endDate")}
                type="datetime-local"
                helpText={`When the bar should stop displaying (in ${formData.timezone || "UTC"})`}
                min={formData.startDate || minDateTime}
              />
              {formData.endDate && (
                <div style={{ marginTop: "8px", padding: "8px 12px", backgroundColor: "#fef2f2", borderRadius: "6px", border: "1px solid #fca5a5" }}>
                  <Text variant="bodySm" as="p" color="critical">
                    Will end: {formatDateForDisplay(formData.endDate)} ({formData.timezone || "UTC"})
                  </Text>
                </div>
              )}
            </div>
          )}

          {/* Schedule Summary */}
          {(formData.scheduleStartImmediate || formData.startDate || formData.scheduleEndNever || formData.endDate) && (
            <Banner tone="info" title="Schedule Summary">
              <LegacyStack vertical spacing="tight">
                <Text variant="bodyMd" as="p">
                  <strong>Start:</strong>{" "}
                  {formData.scheduleStartImmediate
                    ? "Immediately upon publishing"
                    : formData.startDate
                    ? formatDateForDisplay(formData.startDate)
                    : "Not scheduled"}
                </Text>
                <Text variant="bodyMd" as="p">
                  <strong>End:</strong>{" "}
                  {formData.scheduleEndNever
                    ? "Never (runs indefinitely)"
                    : formData.endDate
                    ? formatDateForDisplay(formData.endDate)
                    : "Not scheduled"}
                </Text>
                <Text variant="bodyMd" as="p">
                  <strong>Timezone:</strong> {formData.timezone || "UTC"}
                </Text>
                {formData.startDate && formData.endDate && !formData.scheduleStartImmediate && !formData.scheduleEndNever && (
                  <Text variant="bodyMd" as="p">
                    <strong>Duration:</strong> {calculateDuration(formData.startDate, formData.endDate)}
                  </Text>
                )}
              </LegacyStack>
            </Banner>
          )}

          <Text variant="bodyMd" as="p" color="subdued">
            <strong>💡 Tip:</strong> Use the Targeting Rules section above to control which pages and devices display your bar.
          </Text>
        </FormLayout>
      </LegacyStack>
    </Card>
  );
}

TargetingSchedule.propTypes = {
  formData: PropTypes.shape({
    priority: PropTypes.number,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    timezone: PropTypes.string,
    scheduleStartImmediate: PropTypes.bool,
    scheduleEndNever: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
