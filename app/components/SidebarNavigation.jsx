import { Navigation } from "@shopify/polaris";
import { HomeIcon, ChartVerticalIcon, ChartLineIcon, SettingsIcon } from "@shopify/polaris-icons";
import { useLocation } from "react-router";

export default function SidebarNavigation() {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Dashboard",
      icon: HomeIcon,
      url: "/app",
      exactMatch: true,
      selected: location.pathname === "/app",
    },
    {
      label: "Bars",
      icon: ChartVerticalIcon,
      url: "/app/bars",
      selected: location.pathname.startsWith("/app/bars"),
    },
    {
      label: "Analytics",
      icon: ChartLineIcon,
      url: "/app/analytics",
      selected: location.pathname.startsWith("/app/analytics"),
    },
    {
      label: "Settings",
      icon: SettingsIcon,
      url: "/app/settings",
      selected: location.pathname.startsWith("/app/settings"),
    },
  ];

  return (
    <Navigation location={location.pathname}>
      <Navigation.Section items={navigationItems} />
    </Navigation>
  );
}
