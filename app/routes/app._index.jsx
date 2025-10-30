import {
  Page,
  Layout,
  Card,
  Text,
  LegacyStack,
  Badge,
  DataTable,
  Button,
  Popover,
  ActionList,
} from "@shopify/polaris";
import { useState } from "react";
import PropTypes from "prop-types";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useNavigation,
} from "react-router-dom";
import { EmptyState, DeleteConfirmationModal } from "../components";
import db from "../db.server";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Fetch all bars for this shop, with priority-based ordering
    const bars = await db.bar.findMany({
      where: { shop },
      orderBy: [
        { isActive: "desc" }, // Active bars first
        { priority: "asc" },  // Then by priority (1=highest)
        { createdAt: "desc" } // Finally by creation date
      ],
    });

    return json({ bars });
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Failed to load bars", { status: 500 });
  }
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const action = formData.get("_action");
  const barId = formData.get("id");

  switch (action) {
    case "delete":
      await db.bar.delete({ where: { id: barId, shop } });
      return json({ success: true, message: "Bar deleted." });

    case "setStatus": {
      const newStatus = formData.get("status") === "true";

      if (newStatus) {
        // This transaction ensures only one bar can be active at a time.
        await db.$transaction([
          db.bar.updateMany({
            where: { shop: shop, isActive: true, NOT: { id: barId } },
            data: { isActive: false },
          }),
          db.bar.update({
            where: { id: barId, shop },
            data: { isActive: true },
          }),
        ]);
        return json({ success: true, message: "Bar activated." });
      } else {
        // Simple deactivation
        await db.bar.update({
          where: { id: barId, shop },
          data: { isActive: false },
        });
        return json({ success: true, message: "Bar deactivated." });
      }
    }

    default:
      return json({ success: false, error: "Unknown action" }, { status: 400 });
  }
};

export default function BarsPage() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isProcessing = navigation.state !== "idle";

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [barToDeleteId, setBarToDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setBarToDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const formData = new FormData();
    formData.append("_action", "delete");
    formData.append("id", barToDeleteId);
    submit(formData, { method: "post" });
    setDeleteModalOpen(false);
  };

  const { bars } = useLoaderData();
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const rows = bars.map((bar) => [
    <div key={`name-${bar.id}`} style={{ maxWidth: "300px" }}>
      <Text variant="bodyMd" as="p" fontWeight="semibold">
        {bar.type === "countdown" 
          ? "Countdown Timer" 
          : bar.type === "shipping" 
          ? "Free Shipping Bar" 
          : (bar.message || "Untitled Bar")}
      </Text>
      {(bar.type === "countdown" || bar.type === "shipping") && bar.message && (
        <Text variant="bodySm" as="p" color="subdued" truncate>
          {bar.message}
        </Text>
      )}
      {/* Show schedule info */}
      {(bar.scheduleStartImmediate || bar.startDate || bar.endDate || bar.scheduleEndNever) && (
        <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: "4px" }}>
          {bar.scheduleStartImmediate ? "⚡ Immediate" : bar.startDate ? `📅 ${new Date(bar.startDate).toLocaleDateString()}` : ""} 
          {bar.scheduleEndNever ? " → ∞" : bar.endDate ? ` → ${new Date(bar.endDate).toLocaleDateString()}` : ""}
        </Text>
      )}
    </div>,
    <div key={`type-${bar.id}`} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontSize: "16px" }}>
        {bar.type === "countdown" ? "⏱️" : bar.type === "shipping" ? "🚚" : "📢"}
      </span>
      <Text variant="bodyMd" as="span">
        {bar.type.charAt(0).toUpperCase() + bar.type.slice(1)}
      </Text>
    </div>,
    <div key={`status-${bar.id}`}>
      <Badge tone={bar.isActive ? "success" : undefined}>
        {bar.isActive ? "● Active" : "○ Draft"}
      </Badge>
    </div>,
    <div key={`priority-${bar.id}`} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {bar.priority <= 3 && <span style={{ fontSize: "14px" }}>⭐</span>}
      <Text variant="bodyMd" as="span" fontWeight={bar.priority <= 5 ? "semibold" : "regular"}>
        {bar.priority || 5}
      </Text>
      <Text variant="bodySm" as="span" color="subdued">
        {bar.priority === 1 ? "(Highest)" : bar.priority <= 3 ? "(High)" : bar.priority === 5 ? "(Normal)" : "(Low)"}
      </Text>
    </div>,
    <div key={`position-${bar.id}`}>
      <Text variant="bodyMd" as="span">
        {bar.position === "top" ? "⬆️ Top" : "⬇️ Bottom"}
      </Text>
    </div>,
    <Text variant="bodySm" as="span" color="subdued" key={`date-${bar.id}`}>
      {formatDate(bar.createdAt)}
    </Text>,
    <BarActions
      key={`actions-${bar.id}`}
      bar={bar}
      onDelete={() => handleDeleteClick(bar.id)}
      isProcessing={isProcessing}
    />,
  ]);

  return (
    <Page
      title="Announcement Bars"
      primaryAction={{
        content: "Create Bar",
        onAction: () => {
          navigate("/app/new");
        },
      }}
      secondaryActions={[
        {
          content: "Browse Templates",
          onAction: () => {
            navigate("/app/templates");
          },
        },
      ]}
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
                    columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                    headings={["Name / Message", "Type", "Status", "Priority", "Position", "Created", "Actions"]}
                    rows={rows}
                  />
                </LegacyStack>
              </div>
            </Card>
          )}
        </Layout.Section>
      </Layout>
        <DeleteConfirmationModal
          open={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          loading={isProcessing}
          itemName="bar"
        />
    </Page>
  );
}

// --- Helper component for the actions in each row ---
function BarActions({ bar, onDelete, isProcessing }) {
  const [popoverActive, setPopoverActive] = useState(false);
  const submit = useSubmit();
  const navigate = useNavigate();

  const handleToggleStatus = () => {
    const formData = new FormData();
    formData.append("_action", "setStatus");
    formData.append("id", bar.id);
    formData.append("status", String(!bar.isActive));
    submit(formData, { method: "post" });
    setPopoverActive(false);
  };

  const handleEdit = () => {
    navigate(`/app/bars/${bar.id}/edit`);
    setPopoverActive(false);
  };

  return (
    <Popover
      active={popoverActive}
      activator={
        <Button onClick={() => setPopoverActive(!popoverActive)} disclosure>
          Actions
        </Button>
      }
      onClose={() => setPopoverActive(false)}
    >
      <ActionList
        items={[
          {
            content: "Edit",
            onAction: handleEdit,
            disabled: isProcessing,
          },
          {
            content: bar.isActive ? "Deactivate" : "Activate",
            onAction: handleToggleStatus,
            disabled: isProcessing,
          },
          {
            content: "Delete",
            destructive: true,
            onAction: onDelete,
            disabled: isProcessing,
          },
        ]}
      />
    </Popover>
  );
}
BarActions.propTypes = {
  bar: PropTypes.shape({
    id: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool.isRequired,
};
