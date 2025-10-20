import { Card, FormLayout, TextField, LegacyStack, Text } from "@shopify/polaris";
import PropTypes from "prop-types";

export function TargetingSchedule({ formData, onChange }) {
  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
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
          Targeting &amp; Schedule
        </Text>
        <Text variant="bodyMd" as="p" color="subdued">
          Set when your announcement bar should be displayed (optional).
        </Text>

        <FormLayout>
          <div>
            <TextField
              label="Start Date & Time (Optional)"
              value={formData.startDate || ""}
              onChange={handleFieldChange("startDate")}
              type="datetime-local"
              helpText="When the bar should start displaying. Leave empty to show immediately."
              min={minDateTime}
            />
            {formData.startDate && (
              <div style={{ marginTop: "8px", padding: "8px 12px", backgroundColor: "#f0fdf4", borderRadius: "6px", border: "1px solid #86efac" }}>
                <Text variant="bodySm" as="p" color="success">
                  Will start: {formatDateForDisplay(formData.startDate)}
                </Text>
              </div>
            )}
          </div>

          <div>
            <TextField
              label="End Date & Time (Optional)"
              value={formData.endDate || ""}
              onChange={handleFieldChange("endDate")}
              type="datetime-local"
              helpText="When the bar should stop displaying. Leave empty for no end date."
              min={formData.startDate || minDateTime}
            />
            {formData.endDate && (
              <div style={{ marginTop: "8px", padding: "8px 12px", backgroundColor: "#fef2f2", borderRadius: "6px", border: "1px solid #fca5a5" }}>
                <Text variant="bodySm" as="p" color="critical">
                  Will end: {formatDateForDisplay(formData.endDate)}
                </Text>
              </div>
            )}
            {formData.startDate && formData.endDate && (
              <div style={{ marginTop: "8px", padding: "8px 12px", backgroundColor: "#f0f9ff", borderRadius: "6px", border: "1px solid #93c5fd" }}>
                <Text variant="bodySm" as="p">
                  ⏱️ Duration: {calculateDuration(formData.startDate, formData.endDate)}
                </Text>
              </div>
            )}
          </div>

          <Text variant="bodyMd" as="p" color="subdued">
            <strong>Note:</strong> Advanced targeting options (specific pages,
            customer segments, etc.) will be available in a future update.
          </Text>
        </FormLayout>
      </LegacyStack>
    </Card>
  );
}

TargetingSchedule.propTypes = {
  formData: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
