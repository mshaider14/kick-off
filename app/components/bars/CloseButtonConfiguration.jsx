import {
  Card,
  FormLayout,
  Checkbox,
  Select,
  Text,
  BlockStack,
  InlineStack,
  Icon,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { XIcon } from "@shopify/polaris-icons";

/**
 * CloseButtonConfiguration Component
 * 
 * Provides configuration options for the close/dismiss button on announcement bars:
 * - Enable/disable close button
 * - Position (left/right)
 * - Dismiss behavior (session, 24 hours, permanent)
 * - Icon style
 */
export function CloseButtonConfiguration({ formData, onChange }) {
  const [closeButtonEnabled, setCloseButtonEnabled] = useState(
    formData.closeButtonEnabled ?? true
  );
  const [closeButtonPosition, setCloseButtonPosition] = useState(
    formData.closeButtonPosition || "right"
  );
  const [dismissBehavior, setDismissBehavior] = useState(
    formData.dismissBehavior || "session"
  );
  const [closeIconStyle, setCloseIconStyle] = useState(
    formData.closeIconStyle || "x"
  );

  // Handle close button enabled toggle
  const handleCloseButtonEnabledChange = useCallback((value) => {
    setCloseButtonEnabled(value);
    onChange("closeButtonEnabled", value);
  }, [onChange]);

  // Handle position change
  const handlePositionChange = useCallback((value) => {
    setCloseButtonPosition(value);
    onChange("closeButtonPosition", value);
  }, [onChange]);

  // Handle dismiss behavior change
  const handleDismissBehaviorChange = useCallback((value) => {
    setDismissBehavior(value);
    onChange("dismissBehavior", value);
  }, [onChange]);

  // Handle icon style change
  const handleIconStyleChange = useCallback((value) => {
    setCloseIconStyle(value);
    onChange("closeIconStyle", value);
  }, [onChange]);

  const positionOptions = [
    { label: "Right", value: "right" },
    { label: "Left", value: "left" },
  ];

  const dismissBehaviorOptions = [
    { label: "Hide for session (until browser closes)", value: "session" },
    { label: "Hide for 24 hours", value: "24hours" },
    { label: "Hide permanently (forever)", value: "permanent" },
  ];

  const iconStyleOptions = [
    { label: "X (Simple)", value: "x" },
    { label: "× (Times)", value: "times" },
    { label: "✕ (Cross)", value: "cross" },
    { label: "Close Text", value: "close" },
  ];

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <Text variant="headingMd" as="h2">
            Close Button Settings
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            Configure the close/dismiss button behavior for your announcement bar
          </Text>
        </BlockStack>

        <FormLayout>
          <Checkbox
            label="Enable close button"
            checked={closeButtonEnabled}
            onChange={handleCloseButtonEnabledChange}
            helpText="Allow visitors to dismiss/close the announcement bar"
          />

          {closeButtonEnabled && (
            <>
              <Select
                label="Close button position"
                options={positionOptions}
                value={closeButtonPosition}
                onChange={handlePositionChange}
                helpText="Choose where the close button appears on the bar"
              />

              <Select
                label="Dismiss behavior"
                options={dismissBehaviorOptions}
                value={dismissBehavior}
                onChange={handleDismissBehaviorChange}
                helpText="How long should the bar stay hidden after a visitor closes it?"
              />

              <Select
                label="Close icon style"
                options={iconStyleOptions}
                value={closeIconStyle}
                onChange={handleIconStyleChange}
                helpText="Choose the appearance of the close button icon"
              />

              <BlockStack gap="200">
                <Text variant="bodyMd" as="p" tone="subdued">
                  <strong>Dismiss Behavior Explained:</strong>
                </Text>
                <BlockStack gap="100">
                  <Text variant="bodyMd" as="p" tone="subdued">
                    • <strong>Session:</strong> Bar reappears when visitor reopens their browser
                  </Text>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    • <strong>24 hours:</strong> Bar stays hidden for 1 day, then reappears
                  </Text>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    • <strong>Permanent:</strong> Bar never appears again for that visitor (uses cookies)
                  </Text>
                </BlockStack>
              </BlockStack>
            </>
          )}
        </FormLayout>
      </BlockStack>
    </Card>
  );
}

CloseButtonConfiguration.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
