import { Page, Layout, Card, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../shopify.server";
import { TemplateLibrary, TemplatePreview } from "../components/bars";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return Response.json({});
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
                    <Button
                      variant="primary"
                      fullWidth
                      size="large"
                      onClick={() => handleUseTemplate(selectedTemplate)}
                    >
                      Use This Template →
                    </Button>
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
