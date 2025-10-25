import { 
  Card, 
  FormLayout, 
  TextField, 
  LegacyStack, 
  Text, 
  Button,
  Select,
  Banner,
  Icon
} from "@shopify/polaris";
import { DeleteMinor, DragHandleMinor } from "@shopify/polaris-icons";
import PropTypes from "prop-types";
import { useState, useCallback } from "react";

export function MultiMessageConfiguration({ formData, onChange }) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Parse messages from JSON string or use default
  const messages = formData.messages 
    ? (typeof formData.messages === 'string' ? JSON.parse(formData.messages) : formData.messages)
    : [{ message: formData.message || "", ctaText: formData.ctaText || "", ctaLink: formData.ctaLink || "" }];

  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0);

  const handleAddMessage = useCallback(() => {
    const newMessages = [...messages, { message: "", ctaText: "", ctaLink: "" }];
    onChange({ 
      ...formData, 
      messages: JSON.stringify(newMessages)
    });
    setSelectedMessageIndex(newMessages.length - 1);
  }, [messages, formData, onChange]);

  const handleDeleteMessage = useCallback((index) => {
    if (messages.length <= 1) return; // Keep at least one message
    const newMessages = messages.filter((_, i) => i !== index);
    onChange({ 
      ...formData, 
      messages: JSON.stringify(newMessages)
    });
    if (selectedMessageIndex >= newMessages.length) {
      setSelectedMessageIndex(Math.max(0, newMessages.length - 1));
    }
  }, [messages, formData, onChange, selectedMessageIndex]);

  const handleMessageChange = useCallback((index, field, value) => {
    const newMessages = [...messages];
    newMessages[index] = { ...newMessages[index], [field]: value };
    onChange({ 
      ...formData, 
      messages: JSON.stringify(newMessages)
    });
  }, [messages, formData, onChange]);

  const handleRotationSpeedChange = useCallback((value) => {
    const speed = parseInt(value, 10);
    if (speed >= 3 && speed <= 30) {
      onChange({ ...formData, rotationSpeed: speed });
    }
  }, [formData, onChange]);

  const handleTransitionChange = useCallback((value) => {
    onChange({ ...formData, transitionType: value });
  }, [formData, onChange]);

  // Drag and drop handlers
  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newMessages = [...messages];
    const draggedItem = newMessages[draggedIndex];
    newMessages.splice(draggedIndex, 1);
    newMessages.splice(index, 0, draggedItem);
    
    onChange({ 
      ...formData, 
      messages: JSON.stringify(newMessages)
    });
    setDraggedIndex(index);
  }, [draggedIndex, messages, formData, onChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const transitionOptions = [
    { label: "Fade", value: "fade" },
    { label: "Slide", value: "slide" }
  ];

  const currentMessage = messages[selectedMessageIndex] || messages[0];

  return (
    <LegacyStack vertical spacing="loose">
      <Card sectioned>
        <LegacyStack vertical spacing="loose">
          <Text variant="headingLg" as="h2">
            Multiple Messages
          </Text>
          <Text variant="bodyMd" as="p" color="subdued">
            Create a rotating bar with multiple messages. Messages will cycle automatically.
          </Text>

          <Banner>
            <Text variant="bodyMd" as="p">
              💡 You have <strong>{messages.length}</strong> message{messages.length !== 1 ? 's' : ''}. 
              Drag messages to reorder them, or click to edit.
            </Text>
          </Banner>

          {/* Message List */}
          <div style={{ 
            border: "1px solid #e0e0e0", 
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedMessageIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedMessageIndex(index);
                  }
                }}
                style={{
                  padding: "12px 16px",
                  backgroundColor: selectedMessageIndex === index ? "#f0f8ff" : "#ffffff",
                  borderBottom: index < messages.length - 1 ? "1px solid #e0e0e0" : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "background-color 0.2s",
                  opacity: draggedIndex === index ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (selectedMessageIndex !== index) {
                    e.currentTarget.style.backgroundColor = "#f9f9f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMessageIndex !== index) {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }
                }}
              >
                <div style={{ cursor: "grab", color: "#666" }}>
                  <Icon source={DragHandleMinor} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text variant="bodyMd" as="p" fontWeight={selectedMessageIndex === index ? "semibold" : "regular"}>
                    {msg.message || `Message ${index + 1}`}
                  </Text>
                  {msg.ctaText && (
                    <Text variant="bodySm" as="p" color="subdued">
                      Button: {msg.ctaText}
                    </Text>
                  )}
                </div>
                <div style={{ 
                  padding: "4px 8px", 
                  backgroundColor: "#f0f0f0",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666"
                }}>
                  #{index + 1}
                </div>
                {messages.length > 1 && (
                  <Button
                    plain
                    destructive
                    icon={DeleteMinor}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(index);
                    }}
                    accessibilityLabel={`Delete message ${index + 1}`}
                  />
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleAddMessage} fullWidth>
            Add Message
          </Button>
        </LegacyStack>
      </Card>

      {/* Edit Selected Message */}
      <Card sectioned>
        <LegacyStack vertical spacing="loose">
          <Text variant="headingMd" as="h3">
            Edit Message #{selectedMessageIndex + 1}
          </Text>

          <FormLayout>
            <TextField
              label="Message Text"
              value={currentMessage.message || ""}
              onChange={(value) => handleMessageChange(selectedMessageIndex, "message", value)}
              placeholder="Summer Sale - 20% Off All Items!"
              helpText={`The message displayed in the bar (${(currentMessage.message || "").length}/200 characters)`}
              autoComplete="off"
              maxLength={200}
              showCharacterCount
            />

            <TextField
              label="Call-to-Action Button Text (Optional)"
              value={currentMessage.ctaText || ""}
              onChange={(value) => handleMessageChange(selectedMessageIndex, "ctaText", value)}
              placeholder="Shop Now"
              helpText="Text for the button. Leave empty to hide the button"
              autoComplete="off"
              maxLength={50}
            />

            {currentMessage.ctaText && (
              <TextField
                label="Button Link URL"
                value={currentMessage.ctaLink || ""}
                onChange={(value) => handleMessageChange(selectedMessageIndex, "ctaLink", value)}
                placeholder="/collections/sale"
                helpText="Where the button will redirect"
                autoComplete="off"
                type="url"
              />
            )}
          </FormLayout>
        </LegacyStack>
      </Card>

      {/* Rotation Settings */}
      <Card sectioned>
        <LegacyStack vertical spacing="loose">
          <Text variant="headingMd" as="h3">
            Rotation Settings
          </Text>

          <FormLayout>
            <TextField
              label="Rotation Speed (seconds)"
              type="number"
              value={formData.rotationSpeed?.toString() || "5"}
              onChange={handleRotationSpeedChange}
              min={3}
              max={30}
              helpText="How long each message displays before rotating to the next (3-30 seconds)"
              autoComplete="off"
            />

            <Select
              label="Transition Animation"
              options={transitionOptions}
              value={formData.transitionType || "fade"}
              onChange={handleTransitionChange}
              helpText="Animation style when switching between messages"
            />
          </FormLayout>

          <Banner status="info">
            <Text variant="bodyMd" as="p">
              💡 Messages will rotate every <strong>{formData.rotationSpeed || 5} seconds</strong> with a{" "}
              <strong>{formData.transitionType || "fade"}</strong> transition.
            </Text>
          </Banner>
        </LegacyStack>
      </Card>
    </LegacyStack>
  );
}

MultiMessageConfiguration.propTypes = {
  formData: PropTypes.shape({
    message: PropTypes.string,
    ctaText: PropTypes.string,
    ctaLink: PropTypes.string,
    messages: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    rotationSpeed: PropTypes.number,
    transitionType: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
