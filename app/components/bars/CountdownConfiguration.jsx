import {
  Card,
  FormLayout,
  TextField,
  LegacyStack,
  Text,
  RadioButton,
  ChoiceList,
  Checkbox,
} from "@shopify/polaris";
import PropTypes from "prop-types";
import { useState, useCallback, useEffect } from "react";

export function CountdownConfiguration({ formData, onChange }) {
  const [timerType, setTimerType] = useState(formData.timerType || "");
  const [showDays, setShowDays] = useState(
    formData.timerFormat ? JSON.parse(formData.timerFormat).showDays : true
  );
  const [showHours, setShowHours] = useState(
    formData.timerFormat ? JSON.parse(formData.timerFormat).showHours : true
  );
  const [showMinutes, setShowMinutes] = useState(
    formData.timerFormat ? JSON.parse(formData.timerFormat).showMinutes : true
  );

  const [showSeconds, setShowSeconds] = useState(
    formData.timerFormat ? JSON.parse(formData.timerFormat).showSeconds : true
  );

  // Initialize parent formData with default timer type if empty
  useEffect(() => {
    if (!formData.timerType) {
      setTimerType("fixed");
      onChange({ ...formData, timerType: "fixed" });
    } else {
      setTimerType(formData.timerType);
    }
  }, [formData.timerType]); // Add dependency to sync state

  const handleTimerTypeChange = useCallback(
    (newType) => {
      setTimerType(newType);
      onChange({ ...formData, timerType: newType });
    },
    [formData, onChange]
  );

  const handleFieldChange = useCallback(
    (field) => (value) => {
      onChange({ ...formData, [field]: value });
    },
    [formData, onChange]
  );

  const handleFormatChange = useCallback(
    (field, value) => {
      const format = {
        showDays: field === "showDays" ? value : showDays,
        showHours: field === "showHours" ? value : showHours,
        showMinutes: field === "showMinutes" ? value : showMinutes,
        showSeconds: field === "showSeconds" ? value : showSeconds,
      };

      if (field === "showDays") setShowDays(value);
      if (field === "showHours") setShowHours(value);
      if (field === "showMinutes") setShowMinutes(value);
      if (field === "showSeconds") setShowSeconds(value);

      onChange({ ...formData, timerFormat: JSON.stringify(format) });
    },
    [formData, onChange, showDays, showHours, showMinutes, showSeconds]
  );

  // Get current date and time in the format required by datetime-local
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <Card sectioned>
      <LegacyStack vertical spacing="loose">
        <Text variant="headingLg" as="h2">
          Configure Countdown Timer
        </Text>
        <Text variant="bodyMd" as="p" color="subdued">
          Set up your countdown timer to create urgency for sales and promotions. Choose a timer type below to get started.
        </Text>
        
        {!timerType && (
          <div style={{ padding: "12px", backgroundColor: "#FFF4E5", borderRadius: "8px", border: "1px solid #FFD79D" }}>
            <Text variant="bodyMd" as="p" color="warning">
              ⚠️ Please select a timer type to continue
            </Text>
          </div>
        )}

        {/* Optional Message Field */}
        <TextField
          label="Bar Message (Optional)"
          value={formData.message || ""}
          onChange={handleFieldChange("message")}
          placeholder="Limited Time Offer!"
          helpText="Optional message to display alongside the countdown timer"
          autoComplete="off"
          maxLength={200}
        />

        {/* Timer Type Selection */}
        <LegacyStack vertical spacing="tight">
          <Text variant="headingMd" as="h3">
            Timer Type
          </Text>
          <Card>
            <div style={{ padding: "16px" }}>
              <RadioButton
                label="Fixed Date/Time (one-time countdown)"
                helpText="Counts down to a specific date and time"
                checked={timerType === "fixed"}
                id="fixed"
                name="timerType"
                onChange={() => handleTimerTypeChange("fixed")}
              />
            </div>
          </Card>
          <Card>
            <div style={{ padding: "16px" }}>
              <RadioButton
                label="Daily Recurring (resets every day)"
                helpText="Counts down to the same time each day"
                checked={timerType === "daily"}
                id="daily"
                name="timerType"
                onChange={() => handleTimerTypeChange("daily")}
              />
            </div>
          </Card>
          <Card>
            <div style={{ padding: "16px" }}>
              <RadioButton
                label="Evergreen (per-visitor countdown)"
                helpText="Starts countdown from first view for each visitor"
                checked={timerType === "evergreen"}
                id="evergreen"
                name="timerType"
                onChange={() => handleTimerTypeChange("evergreen")}
              />
            </div>
          </Card>
        </LegacyStack>

        {/* Timer Type Explanation Cards */}
        {timerType && (
          <div style={{ padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <LegacyStack vertical spacing="tight">
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                {timerType === "fixed" && "🎯 Fixed Timer Example"}
                {timerType === "daily" && "🔄 Daily Recurring Example"}
                {timerType === "evergreen" && "⏳ Evergreen Timer Example"}
              </Text>
              <Text variant="bodySm" as="p" color="subdued">
                {timerType === "fixed" && "Perfect for: Black Friday sales, product launches, limited-time offers with a specific deadline"}
                {timerType === "daily" && "Perfect for: Daily flash sales (e.g., 'Ends at midnight'), happy hour deals, daily promotions"}
                {timerType === "evergreen" && "Perfect for: First-time visitor offers, personalized urgency, continuous campaigns"}
              </Text>
            </LegacyStack>
          </div>
        )}
        
        <FormLayout>
          {/* Fixed Timer Configuration */}
          {timerType === "fixed" && (
            <TextField
              label="End Date & Time"
              value={formData.timerEndDate || ""}
              onChange={handleFieldChange("timerEndDate")}
              type="datetime-local"
              helpText="The countdown will end at this specific date and time"
              min={minDateTime}
            />
          )}

          {/* Daily Recurring Timer Configuration */}
          {timerType === "daily" && (
            <TextField
              label="Daily Reset Time"
              value={formData.timerDailyTime || ""}
              onChange={handleFieldChange("timerDailyTime")}
              type="time"
              helpText="The countdown will reset to this time every day (24-hour format)"
            />
          )}

          {/* Evergreen Timer Configuration */}
          {timerType === "evergreen" && (
            <TextField
              label="Timer Duration (minutes)"
              value={formData.timerDuration || ""}
              onChange={handleFieldChange("timerDuration")}
              type="number"
              min="1"
              helpText="How many minutes each visitor's countdown should last"
              placeholder="60"
            />
          )}

          {/* Timer Display Format */}
          <div>
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              Timer Display Format
            </Text>
            <Text variant="bodySm" as="p" color="subdued" style={{ marginBottom: "8px" }}>
              Choose which time units to display
            </Text>
            <LegacyStack spacing="tight" wrap={false}>
              <Checkbox
                label="Days"
                checked={showDays}
                onChange={(value) => handleFormatChange("showDays", value)}
              />
              <Checkbox
                label="Hours"
                checked={showHours}
                onChange={(value) => handleFormatChange("showHours", value)}
              />
              <Checkbox
                label="Minutes"
                checked={showMinutes}
                onChange={(value) => handleFormatChange("showMinutes", value)}
              />
              <Checkbox
                label="Seconds"
                checked={showSeconds}
                onChange={(value) => handleFormatChange("showSeconds", value)}
              />
            </LegacyStack>
          </div>

          {/* Timer End Action */}
          <ChoiceList
            title="When Timer Ends"
            choices={[
              { label: "Hide the bar", value: "hide" },
              { label: "Show a custom message", value: "show_message" },
            ]}
            selected={[formData.timerEndAction || "hide"]}
            onChange={(value) => handleFieldChange("timerEndAction")(value[0])}
          />

          {/* Custom End Message */}
          {formData.timerEndAction === "show_message" && (
            <TextField
              label="Custom End Message"
              value={formData.timerEndMessage || ""}
              onChange={handleFieldChange("timerEndMessage")}
              placeholder="Sale has ended - Thanks for shopping!"
              helpText="This message will be displayed when the countdown reaches zero"
              maxLength={200}
            />
          )}
        </FormLayout>
      </LegacyStack>
    </Card>
  );
}

CountdownConfiguration.propTypes = {
  formData: PropTypes.shape({
    timerType: PropTypes.string,
    timerEndDate: PropTypes.string,
    timerDailyTime: PropTypes.string,
    timerDuration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    timerFormat: PropTypes.string,
    timerEndAction: PropTypes.string,
    timerEndMessage: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};