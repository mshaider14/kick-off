import {
  Card,
  Text,
  LegacyStack,
  TextField,
  ButtonGroup,
  Button,
  Badge,
  Icon,
} from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  TEMPLATE_CATEGORIES,
  CATEGORY_LABELS,
  searchTemplates,
  filterTemplatesByCategory,
} from "../data/barTemplates";

export function TemplateLibrary({ onSelectTemplate, currentBarType }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Get filtered templates based on search and category
  const getFilteredTemplates = useCallback(() => {
    let templates = [];
    
    // First filter by search query
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    } else {
      // Then filter by category
      templates = filterTemplatesByCategory(selectedCategory);
    }

    // If a bar type is selected, only show compatible templates
    if (currentBarType) {
      templates = templates.filter((t) => t.type === currentBarType);
    }

    return templates;
  }, [searchQuery, selectedCategory, currentBarType]);

  const filteredTemplates = getFilteredTemplates();

  // Category filter buttons
  const categories = [
    { id: "all", label: "All Templates" },
    ...Object.keys(TEMPLATE_CATEGORIES).map((key) => ({
      id: TEMPLATE_CATEGORIES[key],
      label: CATEGORY_LABELS[TEMPLATE_CATEGORIES[key]],
    })),
  ];

  const handleTemplateClick = (template) => {
    setSelectedTemplateId(template.id);
  };

  const handleUseTemplate = (template) => {
    onSelectTemplate(template);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "announcement":
        return "📢";
      case "countdown":
        return "⏱️";
      case "shipping":
        return "🚚";
      case "email":
        return "📧";
      default:
        return "📋";
    }
  };

  const getTypeBadge = (type) => {
    const labels = {
      announcement: "Announcement",
      countdown: "Countdown",
      shipping: "Free Shipping",
      email: "Email Capture",
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <div style={{ padding: "20px" }}>
        <LegacyStack vertical spacing="loose">
          {/* Header */}
          <LegacyStack distribution="equalSpacing" alignment="center">
            <div>
              <Text variant="headingLg" as="h2">
                Template Library
              </Text>
              <Text variant="bodyMd" as="p" color="subdued">
                Choose from {filteredTemplates.length} professionally designed templates
              </Text>
            </div>
          </LegacyStack>

          {/* Search Bar */}
          <TextField
            placeholder="Search templates by name, description, or keywords..."
            value={searchQuery}
            onChange={setSearchQuery}
            autoComplete="off"
            prefix={<Icon source={SearchMinor} />}
            clearButton
            onClearButtonClick={() => setSearchQuery("")}
          />

          {/* Category Filter Buttons */}
          <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
            <ButtonGroup segmented>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  pressed={selectedCategory === category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSearchQuery(""); // Clear search when changing category
                  }}
                  size="slim"
                >
                  {category.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          {/* Results Count */}
          {(searchQuery || selectedCategory !== "all") && (
            <Text variant="bodyMd" as="p" color="subdued">
              {filteredTemplates.length === 0
                ? "No templates found"
                : `Showing ${filteredTemplates.length} template${filteredTemplates.length === 1 ? "" : "s"}`}
            </Text>
          )}

          {/* Template Grid */}
          {filteredTemplates.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
              }}
            >
              <Text variant="bodyLg" as="p" color="subdued">
                No templates match your criteria
              </Text>
              <div style={{ marginTop: "8px" }}>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  sectioned
                  subdued={selectedTemplateId !== template.id}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleTemplateClick(template)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleTemplateClick(template);
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {/* Template Preview Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: "60px",
                        backgroundColor: template.backgroundColor,
                        color: template.textColor,
                        borderRadius: "8px",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px",
                        fontSize: template.fontSize || 14,
                        fontWeight: template.fontWeight || "normal",
                        textAlign: "center",
                        overflow: "hidden",
                        boxShadow:
                          selectedTemplateId === template.id
                            ? "0 0 0 2px #008060"
                            : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      <Text
                        variant="bodyMd"
                        as="span"
                        style={{
                          color: template.textColor,
                          fontSize: template.fontSize,
                          fontWeight: template.fontWeight,
                        }}
                      >
                        {template.message?.substring(0, 50) ||
                          template.shippingGoalText?.substring(0, 50) ||
                          template.name}
                      </Text>
                    </div>

                    {/* Template Info */}
                    <LegacyStack vertical spacing="tight">
                      <LegacyStack distribution="equalSpacing" alignment="center">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "18px" }}>
                            {getTypeIcon(template.type)}
                          </span>
                          <Text variant="bodyMd" as="p" fontWeight="semibold">
                            {template.name}
                          </Text>
                        </div>
                        <Badge size="small">{getTypeBadge(template.type)}</Badge>
                      </LegacyStack>

                      <Text variant="bodySm" as="p" color="subdued">
                        {template.description}
                      </Text>

                      <div style={{ marginTop: "8px" }}>
                        <Button
                          variant={selectedTemplateId === template.id ? "primary" : undefined}
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                        >
                          Use Template
                        </Button>
                      </div>
                    </LegacyStack>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Help Text */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              border: "1px solid #86efac",
              marginTop: "16px",
            }}
          >
            <Text variant="bodyMd" as="p">
              💡 <strong>Pro Tip:</strong> Templates include pre-written copy, professional
              styling, and suggested targeting rules. You can customize any template in the
              next steps.
            </Text>
          </div>
        </LegacyStack>
      </div>
    </Card>
  );
}

TemplateLibrary.propTypes = {
  onSelectTemplate: PropTypes.func.isRequired,
  currentBarType: PropTypes.string,
};
