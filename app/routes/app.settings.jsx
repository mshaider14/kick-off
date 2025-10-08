import { Page, Layout, Card, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return json({ merchant: { shop: session.shop } });
};

export default function SettingsPage() {
  return (
    <Page>
      <TitleBar title="Settings" />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              App Settings
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <Text as="p">
                Configure your app settings and preferences here.
              </Text>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
