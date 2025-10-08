import { Page, Layout, Card, Text, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";
import { EmptyState } from "../components";
import db from "../db.server";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Check if there are any bars configured
    const savedSetting = await db.setting.findUnique({
      where: { shop: shop }
    });

    const hasBars = savedSetting && savedSetting.value;

    return json({ hasBars });
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Failed to load bars", { status: 500 });
  }
};

export default function BarsPage() {
  const { hasBars } = useLoaderData();

  return (
    <Page>
      <TitleBar title="Countdown Bars" />
      <Layout>
        <Layout.Section>
          {!hasBars ? (
            <EmptyState
              heading="Create your first countdown bar"
              action={{
                content: "Create countdown bar",
                url: "/app",
              }}
            >
              <p>
                Create urgency and drive sales with customizable countdown timers.
                Get started by configuring your first countdown bar.
              </p>
            </EmptyState>
          ) : (
            <Card sectioned>
              <Text variant="headingMd" as="h2">
                Your Countdown Bars
              </Text>
              <div style={{ marginTop: "1rem" }}>
                <Text as="p">
                  You have configured countdown bars. Visit the dashboard to manage them.
                </Text>
                <div style={{ marginTop: "1rem" }}>
                  <Button url="/app">Go to Dashboard</Button>
                </div>
              </div>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
