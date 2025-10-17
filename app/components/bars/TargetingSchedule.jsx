import { Card, FormLayout, TextField, LegacyStack, Text } from "@shopify/polaris";
import PropTypes from "prop-types";

export function TargetingSchedule({ formData, onChange }) {
  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  // Get current date and time in the format required by datetime-local
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

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
          <TextField
            label="Start Date & Time (Optional)"
            value={formData.startDate || ""}
            onChange={handleFieldChange("startDate")}
            type="datetime-local"
            helpText="When the bar should start displaying. Leave empty to show immediately."
            min={minDateTime}
          />

          <TextField
            label="End Date & Time (Optional)"
            value={formData.endDate || ""}
            onChange={handleFieldChange("endDate")}
            type="datetime-local"
            helpText="When the bar should stop displaying. Leave empty for no end date."
            min={formData.startDate || minDateTime}
          />

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
