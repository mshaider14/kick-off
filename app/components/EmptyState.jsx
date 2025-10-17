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
        <p>
          Create urgency and drive sales with customizable countdown timers on your store.
          Get started by configuring your first countdown bar.
        </p>
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
