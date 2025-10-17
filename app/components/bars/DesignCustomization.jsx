import {
  Card,
  FormLayout,
  LegacyStack,
  Text,
  ColorPicker,
  Select,
  ChoiceList,
} from "@shopify/polaris";
import PropTypes from "prop-types";

// Color conversion helpers
function hexToHsb(hex) {
  if (!hex) hex = "#000000";
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  let r = ((num >> 16) & 255) / 255;
  let g = ((num >> 8) & 255) / 255;
  let b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let hue = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        hue = ((g - b) / d) % 6;
        break;
      case g:
        hue = (b - r) / d + 2;
        break;
      case b:
        hue = (r - g) / d + 4;
        break;
      default:
        break;
    }
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  const brightness = max;
  const saturation = max === 0 ? 0 : d / max;

  return { hue, saturation, brightness };
}

function hsbToHex({ hue = 0, saturation = 0, brightness = 0 }) {
  const h = (hue % 360 + 360) % 360;
  const s = Math.min(Math.max(saturation, 0), 1);
  const v = Math.min(Math.max(brightness, 0), 1);

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rp = 0,
    gp = 0,
    bp = 0;
  if (h < 60) {
    rp = c;
    gp = x;
    bp = 0;
  } else if (h < 120) {
    rp = x;
    gp = c;
    bp = 0;
  } else if (h < 180) {
    rp = 0;
    gp = c;
    bp = x;
  } else if (h < 240) {
    rp = 0;
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    gp = 0;
    bp = c;
  } else {
    rp = c;
    gp = 0;
    bp = x;
  }

  const r = Math.round((rp + m) * 255);
  const g = Math.round((gp + m) * 255);
  const b = Math.round((bp + m) * 255);

  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
}

export function DesignCustomization({ formData, onChange }) {
  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleColorChange = (field) => (hsb) => {
    const hex = hsbToHex(hsb);
    onChange({ ...formData, [field]: hex });
  };

  return (
    <Card sectioned>
      <LegacyStack vertical spacing="loose">
        <Text variant="headingLg" as="h2">
          Customize Design
        </Text>
        <Text variant="bodyMd" as="p" color="subdued">
          Choose colors, font size, and position for your announcement bar.
        </Text>

        <FormLayout>
          <div>
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              Background Color
            </Text>
            <div style={{ marginTop: "8px" }}>
              <ColorPicker
                onChange={handleColorChange("backgroundColor")}
                color={hexToHsb(formData.backgroundColor || "#288d40")}
              />
            </div>
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: formData.backgroundColor,
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              <Text
                variant="bodyMd"
                as="p"
                style={{ color: formData.textColor || "#ffffff" }}
              >
                Preview: {formData.backgroundColor || "#288d40"}
              </Text>
            </div>
          </div>

          <div>
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              Text Color
            </Text>
            <div style={{ marginTop: "8px" }}>
              <ColorPicker
                onChange={handleColorChange("textColor")}
                color={hexToHsb(formData.textColor || "#ffffff")}
              />
            </div>
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "#f4f4f4",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              <Text
                variant="bodyMd"
                as="p"
                style={{ color: formData.textColor || "#ffffff" }}
              >
                Preview: {formData.textColor || "#ffffff"}
              </Text>
            </div>
          </div>

          <Select
            label="Font Size"
            options={[
              { label: "Small (12px)", value: "12" },
              { label: "Medium (14px)", value: "14" },
              { label: "Large (16px)", value: "16" },
              { label: "Extra Large (18px)", value: "18" },
            ]}
            value={String(formData.fontSize || 14)}
            onChange={(value) =>
              handleFieldChange("fontSize")(parseInt(value, 10))
            }
          />

          <ChoiceList
            title="Bar Position"
            choices={[
              { label: "Top of page", value: "top" },
              { label: "Bottom of page", value: "bottom" },
            ]}
            selected={[formData.position || "top"]}
            onChange={(value) => handleFieldChange("position")(value[0])}
          />
        </FormLayout>
      </LegacyStack>
    </Card>
  );
}

DesignCustomization.propTypes = {
  formData: PropTypes.shape({
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.number,
    position: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
