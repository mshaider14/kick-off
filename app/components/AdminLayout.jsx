import { Frame } from "@shopify/polaris";
import { useState } from "react";
import PropTypes from "prop-types";
import TopNavigation from "./TopNavigation";
import SidebarNavigation from "./SidebarNavigation";

export default function AdminLayout({ children, merchant }) {
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const toggleMobileNavigationActive = () => {
    setMobileNavigationActive(!mobileNavigationActive);
  };

  return (
    <Frame
      topBar={
        <TopNavigation
          merchant={merchant}
          onNavigationToggle={toggleMobileNavigationActive}
        />
      }
      navigation={<SidebarNavigation />}
      showMobileNavigation={mobileNavigationActive}
      onNavigationDismiss={toggleMobileNavigationActive}
    >
      {children}
    </Frame>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node,
  merchant: PropTypes.object,
};
