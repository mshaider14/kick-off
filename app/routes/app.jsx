import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react"; // Shopify App Bridge provider
import { authenticate } from "../shopify.server";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";
import { useState, useEffect } from "react";
import { AdminLayout, ErrorBoundary as ErrorBoundaryComponent } from "../components";

export const links = () => [
  { rel: "stylesheet", href: styles }
];
// --- END: CORRECT STYLING INJECTION ---


export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return { 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    merchant: {
      shop: session.shop,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
    }
  };
};


export default function App() {
  const { apiKey, merchant } = useLoaderData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PolarisProvider i18n={en}>
      <AppProvider embedded apiKey={apiKey}>
        {mounted && (
          <s-app-nav>
            <s-link href="/app">Dashboard</s-link>
            <s-link href="/app/bars">Bars</s-link>
            <s-link href="/app/analytics">Analytics</s-link>
            <s-link href="/app/settings">Settings</s-link>
          </s-app-nav>
        )}
        <ErrorBoundaryComponent>
          <AdminLayout merchant={merchant}>
            <Outlet />
          </AdminLayout>
        </ErrorBoundaryComponent>
      </AppProvider>
    </PolarisProvider>
  );
}
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};