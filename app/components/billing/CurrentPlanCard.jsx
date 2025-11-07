import { Card, Text, LegacyStack, Badge, Button } from "@shopify/polaris";
import PropTypes from "prop-types";

export default function CurrentPlanCard({ merchant, plan, onUpgrade }) {
  const isFree = merchant.planName === 'free';
  const isActive = merchant.billingActivated;

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <LegacyStack vertical spacing="loose">
          <LegacyStack distribution="equalSpacing" alignment="center">
            <div>
              <Text variant="headingMd" as="h3">
                Current Plan
              </Text>
            </div>
            <Badge tone={isActive ? "success" : "info"}>
              {isActive ? "Active" : "Free"}
            </Badge>
          </LegacyStack>

          <div style={{ 
            padding: "20px", 
            backgroundColor: "#F6F6F7", 
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <Text variant="heading2xl" as="h2">
              {plan.name}
            </Text>
            <div style={{ marginTop: "8px" }}>
              <Text variant="headingLg" as="p">
                ${plan.price.toFixed(2)}
                {!isFree && <span style={{ fontSize: "14px", color: "#6D7175" }}>/month</span>}
              </Text>
            </div>
          </div>

          <div>
            <Text variant="headingSm" as="h4" fontWeight="semibold">
              Features:
            </Text>
            <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
              {plan.features.map((feature, index) => (
                <li key={index} style={{ marginBottom: "6px" }}>
                  <Text variant="bodyMd" as="span">
                    {feature}
                  </Text>
                </li>
              ))}
            </ul>
          </div>

          {merchant.currentPeriodEnd && (
            <div style={{ 
              padding: "12px", 
              backgroundColor: "#E3F2FD", 
              borderRadius: "8px" 
            }}>
              <Text variant="bodySm" as="p" color="subdued">
                📅 Next billing date: {new Date(merchant.currentPeriodEnd).toLocaleDateString()}
              </Text>
            </div>
          )}

          {!isFree && (
            <div style={{ marginTop: "8px" }}>
              <Button onClick={onUpgrade} fullWidth>
                Change Plan
              </Button>
            </div>
          )}
        </LegacyStack>
      </div>
    </Card>
  );
}

CurrentPlanCard.propTypes = {
  merchant: PropTypes.shape({
    planName: PropTypes.string.isRequired,
    planPrice: PropTypes.number.isRequired,
    billingActivated: PropTypes.bool.isRequired,
    currentPeriodEnd: PropTypes.string,
  }).isRequired,
  plan: PropTypes.shape({
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onUpgrade: PropTypes.func.isRequired,
};
