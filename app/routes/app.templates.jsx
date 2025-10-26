import { Page, Layout, Card } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../shopify.server";
import { TemplateLibrary, TemplatePreview } from "../components/bars";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({}); // We don't need to load data, just authenticate
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = (template) => {
    // Navigate to the new bar page with template data as state
    navigate("/app/new", { state: { template } });
  };

  return (
    <Page
      backAction={{ content: "Bars", onAction: () => navigate("/app") }}
      title="Bar Templates"
      subtitle="Browse and preview professionally designed bar templates"
    >
      <TitleBar title="Bar Templates" />
      <Layout>
        <Layout.Section>
          <TemplateLibrary
            onSelectTemplate={handleSelectTemplate}
            currentBarType={null} // Show all templates
          />
        </Layout.Section>
        
        {selectedTemplate && (
          <Layout.Section variant="oneThird">
            <div style={{ position: "sticky", top: "100px" }}>
              <TemplatePreview template={selectedTemplate} />
              <div style={{ marginTop: "16px" }}>
                <Card>
                  <div style={{ padding: "16px" }}>
                    <button
                      onClick={() => handleUseTemplate(selectedTemplate)}
                      style={{
                        width: "100%",
                        padding: "12px 24px",
                        backgroundColor: "#008060",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#006e52";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#008060";
                      }}
                    >
                      Use This Template →
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
