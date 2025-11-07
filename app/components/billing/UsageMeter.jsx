import { Card, ProgressBar, Text, LegacyStack, Badge } from "@shopify/polaris";
import PropTypes from "prop-types";

export default function UsageMeter({ usage }) {
  const { viewCount, viewLimit, percentage } = usage;
  
  const isUnlimited = viewLimit === 'unlimited';
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && percentage >= 100;

  const progressTone = isAtLimit ? "critical" : isNearLimit ? "attention" : "success";

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <LegacyStack vertical spacing="tight">
          <LegacyStack distribution="equalSpacing" alignment="center">
            <Text variant="headingMd" as="h3">
              Monthly Usage
            </Text>
            {isAtLimit && (
              <Badge tone="critical">Limit Reached</Badge>
            )}
            {isNearLimit && !isAtLimit && (
              <Badge tone="attention">Near Limit</Badge>
            )}
          </LegacyStack>

          <div style={{ marginTop: "12px" }}>
            <LegacyStack distribution="equalSpacing">
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                {viewCount.toLocaleString()} views
              </Text>
              <Text variant="bodyMd" as="p" color="subdued">
                {isUnlimited ? 'Unlimited' : `of ${viewLimit.toLocaleString()}`}
              </Text>
            </LegacyStack>
          </div>

          {!isUnlimited && (
            <div style={{ marginTop: "8px" }}>
              <ProgressBar 
                progress={percentage} 
                tone={progressTone}
                size="small"
              />
            </div>
          )}

          {isAtLimit && (
            <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#FFF4E5", borderRadius: "8px" }}>
              <Text variant="bodySm" as="p">
                ⚠️ You&apos;ve reached your monthly view limit. Upgrade your plan to continue showing announcement bars to your customers.
              </Text>
            </div>
          )}

          {isNearLimit && !isAtLimit && (
            <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#F6F6F7", borderRadius: "8px" }}>
              <Text variant="bodySm" as="p" color="subdued">
                💡 You&apos;re using {percentage.toFixed(0)}% of your monthly views. Consider upgrading to avoid hitting the limit.
              </Text>
            </div>
          )}
        </LegacyStack>
      </div>
    </Card>
  );
}

UsageMeter.propTypes = {
  usage: PropTypes.shape({
    viewCount: PropTypes.number.isRequired,
    viewLimit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    percentage: PropTypes.number.isRequired,
  }).isRequired,
};
