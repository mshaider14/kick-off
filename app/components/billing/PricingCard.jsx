import { Card, Text, Button, LegacyStack, Badge } from "@shopify/polaris";
import PropTypes from "prop-types";

export default function PricingCard({ 
  planKey, 
  planName, 
  price, 
  viewLimit, 
  features, 
  isCurrentPlan, 
  isPopular,
  onSelect,
  loading 
}) {
  const isFree = price === 0;

  return (
    <Card>
      <div style={{ 
        padding: "24px",
        position: "relative",
        border: isPopular ? "2px solid #008060" : "1px solid #E1E3E5",
        borderRadius: "8px"
      }}>
        {isPopular && (
          <div style={{ 
            position: "absolute", 
            top: "-12px", 
            left: "50%", 
            transform: "translateX(-50%)",
            backgroundColor: "#008060",
            color: "white",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            MOST POPULAR
          </div>
        )}

        <LegacyStack vertical spacing="loose">
          <div style={{ textAlign: "center" }}>
            <Text variant="headingLg" as="h3">
              {planName}
            </Text>
          </div>

          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <Text variant="heading2xl" as="p">
              ${price.toFixed(2)}
            </Text>
            {!isFree && (
              <Text variant="bodySm" as="p" color="subdued">
                per month
              </Text>
            )}
          </div>

          <div style={{ 
            padding: "12px", 
            backgroundColor: "#F6F6F7", 
            borderRadius: "6px",
            textAlign: "center"
          }}>
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              {viewLimit === Infinity ? 'Unlimited' : viewLimit.toLocaleString()} views/month
            </Text>
          </div>

          <div style={{ minHeight: "180px" }}>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {features.map((feature, index) => (
                <li key={index} style={{ 
                  padding: "8px 0",
                  display: "flex",
                  alignItems: "flex-start"
                }}>
                  <span style={{ color: "#008060", marginRight: "8px", fontSize: "16px" }}>✓</span>
                  <Text variant="bodyMd" as="span">
                    {feature}
                  </Text>
                </li>
              ))}
            </ul>
          </div>

          {isCurrentPlan ? (
            <Badge tone="success" size="large">
              <div style={{ padding: "4px 8px", textAlign: "center", width: "100%" }}>
                Current Plan
              </div>
            </Badge>
          ) : (
            <Button
              primary={isPopular}
              onClick={() => onSelect(planKey)}
              fullWidth
              loading={loading}
            >
              {isFree ? 'Downgrade to Free' : 'Upgrade Now'}
            </Button>
          )}
        </LegacyStack>
      </div>
    </Card>
  );
}

PricingCard.propTypes = {
  planKey: PropTypes.string.isRequired,
  planName: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  viewLimit: PropTypes.number.isRequired,
  features: PropTypes.arrayOf(PropTypes.string).isRequired,
  isCurrentPlan: PropTypes.bool.isRequired,
  isPopular: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
