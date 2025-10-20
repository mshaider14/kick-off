import { Card, FormLayout, TextField, Select, Checkbox, LegacyStack, Text, Banner } from "@shopify/polaris";
import PropTypes from "prop-types";

export function FreeShippingConfiguration({ formData, onChange }) {
  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  const currencyOptions = [
    { label: "USD - US Dollar", value: "USD" },
    { label: "EUR - Euro", value: "EUR" },
    { label: "GBP - British Pound", value: "GBP" },
    { label: "CAD - Canadian Dollar", value: "CAD" },
    { label: "AUD - Australian Dollar", value: "AUD" },
    { label: "JPY - Japanese Yen", value: "JPY" },
    { label: "NZD - New Zealand Dollar", value: "NZD" },
    { label: "INR - Indian Rupee", value: "INR" },
    { label: "SGD - Singapore Dollar", value: "SGD" },
    { label: "HKD - Hong Kong Dollar", value: "HKD" },
  ];

  return (
    <Card sectioned>
      <LegacyStack vertical spacing="loose">
        <div>
          <Text variant="headingLg" as="h2">
            Free Shipping Configuration
          </Text>
          <div style={{ marginTop: "8px" }}>
            <Text variant="bodyMd" as="p" color="subdued">
              Set up your free shipping threshold and customize the progress bar messages.
            </Text>
          </div>
        </div>

        <Banner status="info">
          <p>
            The progress bar will dynamically update based on the customer's cart value. 
            When they reach your threshold, they'll see the success message!
          </p>
        </Banner>

        <FormLayout>
          <FormLayout.Group>
            <TextField
              label="Free Shipping Threshold"
              type="number"
              value={formData.shippingThreshold?.toString() || ""}
              onChange={handleFieldChange("shippingThreshold")}
              placeholder="50.00"
              helpText="The minimum cart value required for free shipping"
              autoComplete="off"
              min="0"
              step="0.01"
              prefix="$"
              error={!formData.shippingThreshold || parseFloat(formData.shippingThreshold) <= 0 
                ? "Threshold must be greater than 0" 
                : undefined}
            />

            <Select
              label="Currency"
              options={currencyOptions}
              value={formData.shippingCurrency || "USD"}
              onChange={handleFieldChange("shippingCurrency")}
              helpText="Select your store's currency"
            />
          </FormLayout.Group>

          <TextField
            label="Progress Message (Before Threshold)"
            value={formData.shippingGoalText || ""}
            onChange={handleFieldChange("shippingGoalText")}
            placeholder="Add {amount} more for free shipping!"
            helpText="Use {amount} as a placeholder for the remaining amount. Example: 'Add {amount} more for free shipping!'"
            autoComplete="off"
            maxLength={150}
            showCharacterCount
            error={!formData.shippingGoalText || formData.shippingGoalText.trim() === "" 
              ? "Goal message is required" 
              : !formData.shippingGoalText.includes("{amount}") 
              ? "Message must include {amount} placeholder" 
              : undefined}
          />

          <TextField
            label="Success Message (After Threshold)"
            value={formData.shippingReachedText || ""}
            onChange={handleFieldChange("shippingReachedText")}
            placeholder="You've unlocked free shipping! 🎉"
            helpText="Message shown when the customer reaches the free shipping threshold"
            autoComplete="off"
            maxLength={150}
            showCharacterCount
            error={!formData.shippingReachedText || formData.shippingReachedText.trim() === "" 
              ? "Success message is required" 
              : undefined}
          />

          <TextField
            label="Progress Bar Color"
            type="color"
            value={formData.shippingProgressColor || "#4ade80"}
            onChange={handleFieldChange("shippingProgressColor")}
            helpText="Choose the color for the progress bar fill"
            autoComplete="off"
          />

          <Checkbox
            label="Show shipping truck icon"
            checked={formData.shippingShowIcon !== false}
            onChange={handleFieldChange("shippingShowIcon")}
            helpText="Display a shipping truck icon next to the message"
          />
        </FormLayout>

        <Banner status="success">
          <p>
            <strong>💡 Pro Tip:</strong> Test different threshold amounts to find what works best for your store. 
            Most merchants see success with thresholds between $50-$75.
          </p>
        </Banner>
      </LegacyStack>
    </Card>
  );
}

FreeShippingConfiguration.propTypes = {
  formData: PropTypes.shape({
    shippingThreshold: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shippingCurrency: PropTypes.string,
    shippingGoalText: PropTypes.string,
    shippingReachedText: PropTypes.string,
    shippingProgressColor: PropTypes.string,
    shippingShowIcon: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
