import { Card, Text, DataTable } from "@shopify/polaris";
import PropTypes from "prop-types";

export default function BillingHistoryCard({ history }) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <div style={{ padding: "16px", textAlign: "center" }}>
          <Text variant="bodyMd" as="p" color="subdued">
            No billing history yet
          </Text>
        </div>
      </Card>
    );
  }

  const rows = history.map((item) => [
    new Date(item.createdAt).toLocaleDateString(),
    item.planName.charAt(0).toUpperCase() + item.planName.slice(1),
    `$${item.amount.toFixed(2)}`,
    <span key={`status-${item.id}`}>
      <span style={{
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        marginRight: "6px",
        backgroundColor: 
          item.status === 'active' ? '#008060' : 
          item.status === 'pending' ? '#FFA500' :
          item.status === 'declined' ? '#D72C0D' : '#6D7175'
      }} />
      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
    </span>
  ]);

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <Text variant="headingMd" as="h3" fontWeight="semibold">
          Billing History
        </Text>
        <div style={{ marginTop: "16px" }}>
          <DataTable
            columnContentTypes={["text", "text", "text", "text"]}
            headings={["Date", "Plan", "Amount", "Status"]}
            rows={rows}
          />
        </div>
      </div>
    </Card>
  );
}

BillingHistoryCard.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      planName: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
};
