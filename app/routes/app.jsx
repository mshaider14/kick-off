import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react"; // Shopify App Bridge provider
import { authenticate } from "../shopify.server";

// ⚠️ NEW IMPORTS: Polaris AppProvider and English translations
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";

// --- START: CORRECT STYLING INJECTION ---
import styles from "@shopify/polaris/build/esm/styles.css";

export const links = () => [
  { rel: "stylesheet", href: styles }
];
// --- END: CORRECT STYLING INJECTION ---


export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    // 👈 WRAP the entire application with the Polaris provider and i18n prop
    <PolarisProvider i18n={en}>
      <AppProvider embedded apiKey={apiKey}>
        <s-app-nav>
          <s-link href="/app">Home</s-link>
          <s-link href="/app/additional">Additional page</s-link>
        </s-app-nav>
        <Outlet />
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