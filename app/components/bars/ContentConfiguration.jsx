import { Card, FormLayout, TextField, LegacyStack, Text, Checkbox } from "@shopify/polaris";
import PropTypes from "prop-types";

export function ContentConfiguration({ formData, onChange }) {
  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleMultiMessageToggle = (value) => {
    if (value) {
      // Enable multi-message mode: Convert current message to messages array
      const messages = [{
        message: formData.message || "",
        ctaText: formData.ctaText || "",
        ctaLink: formData.ctaLink || ""
      }];
      onChange({ 
        ...formData, 
        useMultiMessage: true,
        messages: JSON.stringify(messages),
        rotationSpeed: formData.rotationSpeed || 5,
        transitionType: formData.transitionType || "fade"
      });
    } else {
      // Disable multi-message mode: Keep first message only
      const messages = formData.messages 
        ? (typeof formData.messages === 'string' ? JSON.parse(formData.messages) : formData.messages)
        : [];
      const firstMessage = messages[0] || { message: "", ctaText: "", ctaLink: "" };
      onChange({ 
        ...formData, 
        useMultiMessage: false,
        message: firstMessage.message,
        ctaText: firstMessage.ctaText,
        ctaLink: firstMessage.ctaLink
      });
    }
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

        <Checkbox
          label="Enable multiple rotating messages"
          checked={formData.useMultiMessage || false}
          onChange={handleMultiMessageToggle}
          helpText="Create a bar that rotates through multiple messages automatically"
        />

        {!formData.useMultiMessage && (
          <FormLayout>
            <TextField
              label="Bar Message"
              value={formData.message || ""}
              onChange={handleFieldChange("message")}
              placeholder="Summer Sale - 20% Off All Items!"
              helpText={`The main message displayed in your announcement bar (${(formData.message || "").length}/200 characters)`}
              autoComplete="off"
              maxLength={200}
              showCharacterCount
              error={formData.message && formData.message.trim() === "" ? "Message cannot be empty" : undefined}
            />

            <TextField
              label="Call-to-Action Button Text (Optional)"
              value={formData.ctaText || ""}
              onChange={handleFieldChange("ctaText")}
              placeholder="Shop Now"
              helpText={`Text for the button. Leave empty to hide the button (${(formData.ctaText || "").length}/50 characters)`}
              autoComplete="off"
              maxLength={50}
              showCharacterCount
            />

            {formData.ctaText && (
              <TextField
                label="Button Link URL"
                value={formData.ctaLink || ""}
                onChange={handleFieldChange("ctaLink")}
                placeholder="/collections/sale"
                helpText="Where the button will redirect. Use relative URLs (e.g., /collections/sale) or full URLs (https://...)"
                autoComplete="off"
                type="url"
                prefix={formData.ctaLink && !formData.ctaLink.startsWith("http") ? "🏠" : "🌐"}
                error={formData.ctaText && (!formData.ctaLink || formData.ctaLink.trim() === "") ? "Link is required when button text is provided" : undefined}
              />
            )}
          </FormLayout>
        )}
      </LegacyStack>
    </Card>
  );
}

ContentConfiguration.propTypes = {
  formData: PropTypes.shape({
    message: PropTypes.string,
    ctaText: PropTypes.string,
    ctaLink: PropTypes.string,
    useMultiMessage: PropTypes.bool,
    messages: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    rotationSpeed: PropTypes.number,
    transitionType: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};