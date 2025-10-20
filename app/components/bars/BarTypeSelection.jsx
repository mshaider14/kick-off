import { Card, RadioButton, LegacyStack, Text } from "@shopify/polaris";
import { useState } from "react";
import PropTypes from "prop-types";

export function BarTypeSelection({ value, onChange }) {
  const [selectedType, setSelectedType] = useState(value || "announcement");

  const handleChange = (newValue) => {
    setSelectedType(newValue);
    onChange(newValue);
  };

  return (
    <Card sectioned>
      <LegacyStack vertical spacing="loose">
        <Text variant="headingLg" as="h2">
          Select Bar Type
        </Text>
        <Text variant="bodyMd" as="p" color="subdued">
          Choose the type of bar you want to create for your store.
        </Text>

        <LegacyStack vertical spacing="tight">
          <Card>
            <div style={{ padding: "16px" }}>
              <RadioButton
                label="Announcement Bar"
                helpText="Display important messages and promotional content with an optional call-to-action button"
                checked={selectedType === "announcement"}
                id="announcement"
                name="barType"
                onChange={() => handleChange("announcement")}
              />
            </div>
          </Card>

          <Card>
            <div style={{ padding: "16px" }}>
              <RadioButton
                label="Countdown Timer"
                helpText="Create urgency with a countdown timer for sales and promotions"
                checked={selectedType === "countdown"}
                id="countdown"
                name="barType"
                onChange={() => handleChange("countdown")}
              />
            </div>
          </Card>

          <Card>
            <div style={{ padding: "16px" }}>
              <RadioButton
                label="Free Shipping Progress Bar"
                helpText="Show a progress bar for free shipping threshold with dynamic cart value tracking"
                checked={selectedType === "shipping"}
                id="shipping"
                name="barType"
                onChange={() => handleChange("shipping")}
              />
            </div>
          </Card>
        </LegacyStack>
      </LegacyStack>
    </Card>
  );
}

BarTypeSelection.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
