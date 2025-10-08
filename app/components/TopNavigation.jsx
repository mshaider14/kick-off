import { TopBar } from "@shopify/polaris";
import PropTypes from "prop-types";

export default function TopNavigation({ merchant, onNavigationToggle }) {
  const userMenuMarkup = (
    <TopBar.UserMenu
      name={merchant?.shop || "Merchant"}
      detail={merchant?.shop || ""}
      initials={merchant?.shop?.charAt(0).toUpperCase() || "M"}
    />
  );

  return (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      onNavigationToggle={onNavigationToggle}
    />
  );
}

TopNavigation.propTypes = {
  merchant: PropTypes.object,
  onNavigationToggle: PropTypes.func,
};
