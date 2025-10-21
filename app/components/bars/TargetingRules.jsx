import { 
  Card, 
  FormLayout, 
  Select, 
  TextField, 
  LegacyStack, 
  Text,
  Banner,
  Tag,
  Button,
} from "@shopify/polaris";
import { useState } from "react";
import PropTypes from "prop-types";

export function TargetingRules({ formData, onChange, errors }) {
  const [urlInputValue, setUrlInputValue] = useState("");

  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  // Parse specific URLs from JSON string
  const getSpecificUrls = () => {
    try {
      return formData.targetSpecificUrls 
        ? JSON.parse(formData.targetSpecificUrls) 
        : [];
    } catch {
      return [];
    }
  };

  // Add a URL to the specific URLs list
  const handleAddUrl = () => {
    if (!urlInputValue.trim()) return;
    
    const currentUrls = getSpecificUrls();
    if (!currentUrls.includes(urlInputValue.trim())) {
      const updatedUrls = [...currentUrls, urlInputValue.trim()];
      onChange({ 
        ...formData, 
        targetSpecificUrls: JSON.stringify(updatedUrls) 
      });
    }
    setUrlInputValue("");
  };

  // Remove a URL from the specific URLs list
  const handleRemoveUrl = (urlToRemove) => {
    const currentUrls = getSpecificUrls();
    const updatedUrls = currentUrls.filter(url => url !== urlToRemove);
    onChange({ 
      ...formData, 
      targetSpecificUrls: JSON.stringify(updatedUrls) 
    });
  };

  // Parse URL pattern from JSON string
  const getUrlPattern = () => {
    try {
      return formData.targetUrlPattern 
        ? JSON.parse(formData.targetUrlPattern) 
        : { type: "contains", value: "" };
    } catch {
      return { type: "contains", value: "" };
    }
  };

  // Update URL pattern
  const handlePatternChange = (field) => (value) => {
    const currentPattern = getUrlPattern();
    const updatedPattern = { ...currentPattern, [field]: value };
    onChange({ 
      ...formData, 
      targetUrlPattern: JSON.stringify(updatedPattern) 
    });
  };

  const deviceOptions = [
    { label: "All devices (Desktop & Mobile)", value: "both" },
    { label: "Desktop only", value: "desktop" },
    { label: "Mobile only", value: "mobile" },
  ];

  const pageTargetOptions = [
    { label: "All pages", value: "all" },
    { label: "Homepage only", value: "homepage" },
    { label: "Product pages", value: "product" },
    { label: "Collection pages", value: "collection" },
    { label: "Cart page", value: "cart" },
    { label: "Specific URLs", value: "specific" },
    { label: "URL pattern matching", value: "pattern" },
  ];

  const patternTypeOptions = [
    { label: "URL contains", value: "contains" },
    { label: "URL starts with", value: "starts_with" },
    { label: "URL ends with", value: "ends_with" },
  ];

  const frequencyOptions = [
    { label: "Always show", value: "always" },
    { label: "Once per session", value: "once_per_session" },
    { label: "Once per visitor (cookie)", value: "once_per_visitor" },
  ];

  const specificUrls = getSpecificUrls();
  const urlPattern = getUrlPattern();

  return (
    <Card sectioned>
      <LegacyStack vertical spacing="loose">
        <Text variant="headingLg" as="h2">
          Targeting Rules
        </Text>
        <Text variant="bodyMd" as="p" color="subdued">
          Control where and how often your bar appears.
        </Text>

        <FormLayout>
          {/* Device Targeting */}
          <Select
            label="Device targeting"
            options={deviceOptions}
            value={formData.targetDevices || "both"}
            onChange={handleFieldChange("targetDevices")}
            helpText="Choose which devices should display the bar"
          />

          {/* Page Targeting */}
          <Select
            label="Page targeting"
            options={pageTargetOptions}
            value={formData.targetPages || "all"}
            onChange={handleFieldChange("targetPages")}
            helpText="Choose which pages should display the bar"
            error={errors?.targetPages}
          />

          {/* Specific URLs Input */}
          {formData.targetPages === "specific" && (
            <div>
              <LegacyStack vertical spacing="tight">
                <Text variant="bodyMd" as="p" fontWeight="medium">
                  Specific URLs
                </Text>
                <LegacyStack>
                  <div style={{ flex: 1 }}>
                    <TextField
                      value={urlInputValue}
                      onChange={setUrlInputValue}
                      placeholder="/collections/sale"
                      autoComplete="off"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleAddUrl}>Add URL</Button>
                </LegacyStack>
                <Text variant="bodySm" as="p" color="subdued">
                  Enter relative URLs (e.g., /collections/sale, /pages/about)
                </Text>
                {specificUrls.length > 0 && (
                  <LegacyStack spacing="tight">
                    {specificUrls.map((url) => (
                      <Tag key={url} onRemove={() => handleRemoveUrl(url)}>
                        {url}
                      </Tag>
                    ))}
                  </LegacyStack>
                )}
                {specificUrls.length === 0 && (
                  <Banner status="warning">
                    Add at least one URL for the bar to appear
                  </Banner>
                )}
              </LegacyStack>
            </div>
          )}

          {/* URL Pattern Matching */}
          {formData.targetPages === "pattern" && (
            <div>
              <LegacyStack vertical spacing="tight">
                <Text variant="bodyMd" as="p" fontWeight="medium">
                  URL Pattern Matching
                </Text>
                <Select
                  label="Pattern type"
                  options={patternTypeOptions}
                  value={urlPattern.type || "contains"}
                  onChange={handlePatternChange("type")}
                />
                <TextField
                  label="Pattern value"
                  value={urlPattern.value || ""}
                  onChange={handlePatternChange("value")}
                  placeholder="e.g., /products/, sale, .html"
                  helpText={
                    urlPattern.type === "contains" 
                      ? "Bar shows on URLs containing this text"
                      : urlPattern.type === "starts_with"
                      ? "Bar shows on URLs starting with this text"
                      : "Bar shows on URLs ending with this text"
                  }
                  error={errors?.targetUrlPattern}
                />
                {urlPattern.value && (
                  <Banner status="info">
                    <p style={{ marginBottom: "8px" }}>
                      <strong>Example matches:</strong>
                    </p>
                    {urlPattern.type === "contains" && (
                      <p>✓ /products/{urlPattern.value}/item<br />
                      ✓ /pages/about-{urlPattern.value}</p>
                    )}
                    {urlPattern.type === "starts_with" && (
                      <p>✓ {urlPattern.value}/item<br />
                      ✗ /products{urlPattern.value}</p>
                    )}
                    {urlPattern.type === "ends_with" && (
                      <p>✓ /products/item{urlPattern.value}<br />
                      ✗ {urlPattern.value}/products</p>
                    )}
                  </Banner>
                )}
              </LegacyStack>
            </div>
          )}

          {/* Display Frequency */}
          <Select
            label="Display frequency"
            options={frequencyOptions}
            value={formData.displayFrequency || "always"}
            onChange={handleFieldChange("displayFrequency")}
            helpText={
              formData.displayFrequency === "once_per_session"
                ? "Bar will show once per browser session (until browser is closed)"
                : formData.displayFrequency === "once_per_visitor"
                ? "Bar will show once per visitor (uses cookies, persists across sessions)"
                : "Bar will show on every page load"
            }
          />

          {formData.displayFrequency === "once_per_visitor" && (
            <Banner status="info">
              This uses browser cookies to remember visitors. The bar will show once and won&apos;t appear again unless the visitor clears their cookies.
            </Banner>
          )}
        </FormLayout>
      </LegacyStack>
    </Card>
  );
}

TargetingRules.propTypes = {
  formData: PropTypes.shape({
    targetDevices: PropTypes.string,
    targetPages: PropTypes.string,
    targetSpecificUrls: PropTypes.string,
    targetUrlPattern: PropTypes.string,
    displayFrequency: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
};
