// No changes to imports
import { EmptyState as PolarisEmptyState } from "@shopify/polaris";
import PropTypes from "prop-types";

export default function EmptyState({ 
  heading = "Get started with your first countdown bar",
  children,
  action, // This prop now supports { content, url, onAction }
  image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
}) {
  return (
    <PolarisEmptyState
      heading={heading}
      action={action} // Polaris EmptyState handles this automatically
      image={image}
    >
      {children || (
        <>
          <p>
            Create urgency and boost conversions with professional announcement bars and countdown timers.
          </p>
          <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px", textAlign: "left" }}>
            <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>✨ What you can create:</p>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li>📢 Promotional announcements</li>
              <li>⏱️ Flash sale countdown timers</li>
              <li>🎯 Targeted CTAs with custom styling</li> 
              <li>📅 Scheduled campaigns</li> 
            </ul> 
          </div> 
        </> 
      )} 
    </PolarisEmptyState>
  );
}

EmptyState.propTypes = {
  heading: PropTypes.string,
  children: PropTypes.node,
  // Update the shape of the action prop
  action: PropTypes.shape({
    content: PropTypes.string.isRequired,
    url: PropTypes.string,
    onAction: PropTypes.func,
  }),
  image: PropTypes.string,
};
