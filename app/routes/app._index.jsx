
import {
  Page,
  Layout,
  Card,
  Text,
  LegacyStack,
  Badge,
  DataTable,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "react-router-dom";
import { EmptyState } from "../components";
import db from "../db.server";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Fetch all bars for this shop
    const bars = await db.bar.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
    });

    return json({ bars });
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Failed to load bars", { status: 500 });
  }
};

export default function BarsPage() {
  const { bars } = useLoaderData();
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const rows = bars.map((bar) => [
    bar.message.substring(0, 50) + (bar.message.length > 50 ? "..." : ""),
    bar.type.charAt(0).toUpperCase() + bar.type.slice(1),
    <Badge key={`badge-${bar.id}`} status={bar.isActive ? "success" : "info"}>
      {bar.isActive ? "Active" : "Draft"}
    </Badge>,
    bar.position.charAt(0).toUpperCase() + bar.position.slice(1),
    formatDate(bar.createdAt),
  ]);

  return (
    <Page
      title="Announcement Bars"
      primaryAction={{
        content: "Create Bar",
        onAction: () => {
          console.log("Navigating to /app/bars/new");
          navigate("/app/new");
        },
      }}
    >
      <TitleBar title="Announcement Bars" />
      <Layout>
        <Layout.Section>
          {bars.length === 0 ? (
            <EmptyState
              heading="Create your first announcement bar"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Display important messages, promotions, and calls-to-action with
                customizable announcement bars. Get started by creating your first bar.
              </p>
            </EmptyState>
          ) : (
            <Card>
              <div style={{ padding: "16px" }}>
                <LegacyStack vertical spacing="loose">
                  <LegacyStack distribution="equalSpacing" alignment="center">
                    <Text variant="headingMd" as="h2">
                      Your Bars
                    </Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                      {bars.length} {bars.length === 1 ? "bar" : "bars"}
                    </Text>
                  </LegacyStack>

                  <DataTable
                    columnContentTypes={["text", "text", "text", "text", "text"]}
                    headings={["Message", "Type", "Status", "Position", "Created"]}
                    rows={rows}
                  />
                </LegacyStack>
              </div>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
