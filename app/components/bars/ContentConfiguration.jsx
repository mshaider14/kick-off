import { Card, FormLayout, TextField, LegacyStack, Text } from "@shopify/polaris";
import PropTypes from "prop-types";

export function ContentConfiguration({ formData, onChange }) {
  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <Card sectioned>
      <LegacyStack vertical spacing="loose">
        <Text variant="headingLg" as="h2">
          Configure Content
        </Text>
        <Text variant="bodyMd" as="p" color="subdued">
          Set up the message and call-to-action for your announcement bar.
        </Text>

        <FormLayout>
          <TextField
            label="Bar Message"
            value={formData.message || ""}
            onChange={handleFieldChange("message")}
            placeholder="Summer Sale - 20% Off All Items!"
            helpText="The main message displayed in your announcement bar"
            autoComplete="off"
            maxLength={200}
          />

          <TextField
            label="Call-to-Action Button Text (Optional)"
            value={formData.ctaText || ""}
            onChange={handleFieldChange("ctaText")}
            placeholder="Shop Now"
            helpText="Text for the button. Leave empty to hide the button."
            autoComplete="off"
            maxLength={50}
          />

          {formData.ctaText && (
            <TextField
              label="Button Link URL"
              value={formData.ctaLink || ""}
              onChange={handleFieldChange("ctaLink")}
              placeholder="/collections/sale"
              helpText="Where the button will redirect. Use relative URLs (e.g., /collections/sale) or full URLs."
              autoComplete="off"
              type="url"
            />
          )}
        </FormLayout>
      </LegacyStack>
    </Card>
  );
}

ContentConfiguration.propTypes = {
  formData: PropTypes.shape({
    message: PropTypes.string,
    ctaText: PropTypes.string,
    ctaLink: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
