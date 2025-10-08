import { Page, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { EmptyState } from "../components";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

export default function AnalyticsPage() {
  return (
    <Page>
      <TitleBar title="Analytics" />
      <Layout>
        <Layout.Section>
          <EmptyState
            heading="Analytics coming soon"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              Track the performance of your countdown bars with detailed analytics.
              This feature is coming soon!
            </p>
          </EmptyState>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
