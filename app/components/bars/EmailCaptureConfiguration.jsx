import {
  Card,
  LegacyStack,
  TextField,
  Text,
  Checkbox,
  Banner,
} from "@shopify/polaris";
import { useState } from "react";
import PropTypes from "prop-types";

export function EmailCaptureConfiguration({ formData, onChange }) {
  const [localFormData, setLocalFormData] = useState(formData);

  const handleChange = (field, value) => {
    const updatedData = { ...localFormData, [field]: value };
    setLocalFormData(updatedData);
    onChange(updatedData);
  };

  return (
    <LegacyStack vertical spacing="loose">
      <Card sectioned>
        <LegacyStack vertical spacing="loose">
          <Text variant="headingLg" as="h2">
            Email Capture Configuration
          </Text>
          <Text variant="bodyMd" as="p" color="subdued">
            Configure your email capture form to collect visitor emails and optionally reveal a discount code.
          </Text>
        </LegacyStack>
      </Card>

      <Card sectioned>
        <LegacyStack vertical spacing="loose">
          <Text variant="headingMd" as="h3">
            Form Headline
          </Text>
          <TextField
            label="Headline Message"
            value={localFormData.message || ""}
            onChange={(value) => handleChange("message", value)}
            placeholder="e.g., Get 10% Off Your First Order!"
            helpText="The main message shown above the email form"
            autoComplete="off"
          />
        </LegacyStack>
      </Card>

      <Card sectioned>
        <LegacyStack vertical spacing="loose">
          <Text variant="headingMd" as="h3">
            Form Fields
          </Text>

          <TextField
            label="Email Field Placeholder"
            value={localFormData.emailPlaceholder || ""}
            onChange={(value) => handleChange("emailPlaceholder", value)}
            placeholder="Enter your email"
            helpText="Placeholder text for the email input field"
            autoComplete="off"
          />

          <Checkbox
            label="Enable Name Field (Optional)"
            checked={localFormData.nameFieldEnabled || false}
            onChange={(value) => handleChange("nameFieldEnabled", value)}
            helpText="Add an optional name field to collect visitor names"
          />

          {localFormData.nameFieldEnabled && (
            <TextField
              label="Name Field Placeholder"
              value={localFormData.namePlaceholder || ""}
              onChange={(value) => handleChange("namePlaceholder", value)}
              placeholder="Your name (optional)"
              helpText="Placeholder text for the name input field"
              autoComplete="off"
            />
          )}
        </LegacyStack>
      </Card>

      <Card sectioned>
        <LegacyStack vertical spacing="loose">
          <Text variant="headingMd" as="h3">
            Privacy Compliance
          </Text>

          <Checkbox
            label="Require Privacy Checkbox"
            checked={localFormData.privacyCheckboxEnabled || false}
            onChange={(value) => handleChange("privacyCheckboxEnabled", value)}
            helpText="Require visitors to consent before submitting (recommended for GDPR compliance)"
          />

          {localFormData.privacyCheckboxEnabled && (
            <TextField
              label="Privacy Checkbox Text"
              value={localFormData.privacyCheckboxText || ""}
              onChange={(value) => handleChange("privacyCheckboxText", value)}
              placeholder="I agree to receive marketing emails"
              helpText="The consent text shown next to the checkbox"
              autoComplete="off"
            />
          )}

          {localFormData.privacyCheckboxEnabled && (
            <Banner status="info">
              The privacy checkbox will be required before the form can be submitted.
              Make sure your privacy text complies with local regulations (GDPR, CCPA, etc.).
            </Banner>
          )}
        </LegacyStack>
      </Card>

      <Card sectioned>
        <LegacyStack vertical spacing="loose">
          <Text variant="headingMd" as="h3">
            Submit Button
          </Text>

          <TextField
            label="Submit Button Text"
            value={localFormData.submitButtonText || ""}
            onChange={(value) => handleChange("submitButtonText", value)}
            placeholder="Get My Discount"
            helpText="Text shown on the submit button"
            autoComplete="off"
            requiredIndicator
          />
        </LegacyStack>
      </Card>

      <Card sectioned>
        <LegacyStack vertical spacing="loose">
          <Text variant="headingMd" as="h3">
            Success State
          </Text>

          <TextField
            label="Success Message"
            value={localFormData.successMessage || ""}
            onChange={(value) => handleChange("successMessage", value)}
            placeholder="Thank you! Check your email for your discount code."
            helpText="Message shown after successful email submission"
            autoComplete="off"
            requiredIndicator
          />

          <TextField
            label="Discount Code"
            value={localFormData.discountCode || ""}
            onChange={(value) => handleChange("discountCode", value)}
            placeholder="WELCOME10"
            helpText="Optional: Discount code to reveal after submission. Leave empty if not offering a discount."
            autoComplete="off"
          />

          {localFormData.discountCode && (
            <Banner status="success">
              The discount code will be revealed to visitors after they submit their email.
              Make sure this discount code exists in your Shopify admin.
            </Banner>
          )}
        </LegacyStack>
      </Card>

      <Card sectioned>
        <Banner status="info">
          <Text variant="bodyMd" as="p">
            <strong>Email Collection:</strong> Submitted emails are stored in your database
            and can be viewed in the analytics section. For advanced features like sending
            confirmation emails or creating Shopify customers, consider using Shopify Flow
            or a third-party email marketing app.
          </Text>
        </Banner>
      </Card>
    </LegacyStack>
  );
}

EmailCaptureConfiguration.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
