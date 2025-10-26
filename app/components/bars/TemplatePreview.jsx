import { Card, Text, LegacyStack, Badge } from "@shopify/polaris";
import PropTypes from "prop-types";

export function TemplatePreview({ template }) {
  if (!template) {
    return null;
  }

  const getTypeLabel = (type) => {
    const labels = {
      announcement: "Announcement Bar",
      countdown: "Countdown Timer",
      shipping: "Free Shipping Bar",
      email: "Email Capture Bar",
    };
    return labels[type] || type;
  };

  const renderBarContent = () => {
    switch (template.type) {
      case "countdown":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
            <span>{template.message}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  minWidth: "40px",
                  textAlign: "center",
                }}
              >
                00:00:00
              </div>
            </div>
          </div>
        );

      case "shipping":
        return (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: "8px", textAlign: "center" }}>
              {template.shippingGoalText?.replace("{amount}", "$25.00")}
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: template.shippingProgressColor || "#4ade80",
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        );

      case "email":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", width: "100%" }}>
            <span>{template.message}</span>
            <input
              type="email"
              placeholder={template.emailPlaceholder}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                minWidth: "180px",
              }}
              disabled
            />
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: template.buttonBgColor || "rgba(255, 255, 255, 0.9)",
                color: template.buttonTextColor || "#000",
                cursor: "pointer",
                fontWeight: "600",
              }}
              disabled
            >
              {template.submitButtonText}
            </button>
          </div>
        );

      default:
        // Announcement bar
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
            <span>{template.message}</span>
            {template.ctaText && (
              <button
                style={{
                  padding: "6px 16px",
                  borderRadius: "4px",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: template.textColor,
                  cursor: "pointer",
                  fontWeight: "600",
                }}
                disabled
              >
                {template.ctaText}
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <div style={{ padding: "20px" }}>
        <LegacyStack vertical spacing="loose">
          <LegacyStack distribution="equalSpacing" alignment="center">
            <Text variant="headingMd" as="h3">
              Template Preview
            </Text>
            <Badge>{getTypeLabel(template.type)}</Badge>
          </LegacyStack>

          {/* Live Preview */}
          <div
            style={{
              width: "100%",
              minHeight: "80px",
              backgroundColor: template.backgroundColor,
              color: template.textColor,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: `${template.paddingTop || 12}px ${template.paddingLeft || 20}px ${template.paddingBottom || 12}px ${template.paddingRight || 20}px`,
              fontSize: template.fontSize || 14,
              fontWeight: template.fontWeight || "normal",
              textAlign: template.textAlign || "center",
              fontFamily: template.fontFamily || "system-ui, -apple-system, sans-serif",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {renderBarContent()}
          </div>

          {/* Template Details */}
          <div>
            <Text variant="headingMd" as="h4">
              {template.name}
            </Text>
            <Text variant="bodyMd" as="p" color="subdued" style={{ marginTop: "4px" }}>
              {template.description}
            </Text>
          </div>

          {/* Template Settings Preview */}
          <Card sectioned>
            <LegacyStack vertical spacing="tight">
              <Text variant="headingSm" as="h5">
                Included Settings
              </Text>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <Text variant="bodySm" as="p" color="subdued">
                    Background Color
                  </Text>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: template.backgroundColor,
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Text variant="bodyMd" as="span">
                      {template.backgroundColor}
                    </Text>
                  </div>
                </div>

                <div>
                  <Text variant="bodySm" as="p" color="subdued">
                    Text Color
                  </Text>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: template.textColor,
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Text variant="bodyMd" as="span">
                      {template.textColor}
                    </Text>
                  </div>
                </div>

                <div>
                  <Text variant="bodySm" as="p" color="subdued">
                    Position
                  </Text>
                  <Text variant="bodyMd" as="p">
                    {template.position === "top" ? "Top" : "Bottom"}
                  </Text>
                </div>

                <div>
                  <Text variant="bodySm" as="p" color="subdued">
                    Font Size
                  </Text>
                  <Text variant="bodyMd" as="p">
                    {template.fontSize || 14}px
                  </Text>
                </div>
              </div>

              {/* Type-specific settings */}
              {template.type === "countdown" && template.timerType && (
                <div style={{ marginTop: "8px" }}>
                  <Text variant="bodySm" as="p" color="subdued">
                    Timer Type
                  </Text>
                  <Text variant="bodyMd" as="p">
                    {template.timerType === "fixed"
                      ? "Fixed Date"
                      : template.timerType === "daily"
                      ? "Daily Reset"
                      : "Evergreen"}
                  </Text>
                </div>
              )}

              {template.type === "shipping" && template.shippingThreshold && (
                <div style={{ marginTop: "8px" }}>
                  <Text variant="bodySm" as="p" color="subdued">
                    Free Shipping Threshold
                  </Text>
                  <Text variant="bodyMd" as="p">
                    {template.shippingCurrency} ${template.shippingThreshold}
                  </Text>
                </div>
              )}

              {template.type === "email" && template.discountCode && (
                <div style={{ marginTop: "8px" }}>
                  <Text variant="bodySm" as="p" color="subdued">
                    Discount Code
                  </Text>
                  <Text variant="bodyMd" as="p">
                    {template.discountCode}
                  </Text>
                </div>
              )}
            </LegacyStack>
          </Card>

          {/* Targeting Info */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
            }}
          >
            <Text variant="bodySm" as="p">
              <strong>Suggested Targeting:</strong> Display on {template.targetPages === "all" ? "all pages" : template.targetPages} • {template.targetDevices === "both" ? "All devices" : template.targetDevices}
            </Text>
          </div>
        </LegacyStack>
      </div>
    </Card>
  );
}

TemplatePreview.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    message: PropTypes.string,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.number,
    fontWeight: PropTypes.string,
    position: PropTypes.string,
    ctaText: PropTypes.string,
    targetPages: PropTypes.string,
    targetDevices: PropTypes.string,
    timerType: PropTypes.string,
    shippingThreshold: PropTypes.number,
    shippingCurrency: PropTypes.string,
    shippingGoalText: PropTypes.string,
    shippingProgressColor: PropTypes.string,
    discountCode: PropTypes.string,
    submitButtonText: PropTypes.string,
    emailPlaceholder: PropTypes.string,
    buttonBgColor: PropTypes.string,
    buttonTextColor: PropTypes.string,
    paddingTop: PropTypes.number,
    paddingBottom: PropTypes.number,
    paddingLeft: PropTypes.number,
    paddingRight: PropTypes.number,
    fontFamily: PropTypes.string,
    textAlign: PropTypes.string,
  }),
};
