import { Card, LegacyStack, Text } from "@shopify/polaris";
import PropTypes from "prop-types";

export function BarPreview({ formData }) {
  const {
    message = "Your announcement message here",
    ctaText = "",
    backgroundColor = "#288d40",
    textColor = "#ffffff",
    fontSize = 14,
    position = "top",
  } = formData;

  const barStyle = {
    backgroundColor,
    color: textColor,
    padding: "12px 20px",
    fontSize: `${fontSize}px`,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    minHeight: "50px",
    flexWrap: "wrap",
  };

  const buttonStyle = {
    backgroundColor: textColor,
    color: backgroundColor,
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: `${fontSize - 2}px`,
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <LegacyStack vertical spacing="tight">
          <Text variant="headingMd" as="h3">
            Preview
          </Text>
          <Text variant="bodySm" as="p" color="subdued">
            Position: {position === "top" ? "Top of page" : "Bottom of page"}
          </Text>

          <div
            style={{
              border: "2px dashed #e0e0e0",
              borderRadius: "8px",
              overflow: "hidden",
              marginTop: "12px",
            }}
            role="region"
            aria-label="Bar preview"
          >
            <div style={barStyle}>
              <span>{message}</span>
              {ctaText && <button style={buttonStyle}>{ctaText}</button>}
            </div>
          </div>

          <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: "8px" }}>
            This is how your bar will appear on your storefront.
          </Text>
        </LegacyStack>
      </div>
    </Card>
  );
}

BarPreview.propTypes = {
  formData: PropTypes.shape({
    message: PropTypes.string,
    ctaText: PropTypes.string,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.number,
    position: PropTypes.string,
  }).isRequired,
};
