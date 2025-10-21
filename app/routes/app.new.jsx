import {
  Page,
  Layout,
  LegacyStack,
  Button,
  Toast,
  ButtonGroup,
  Card,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import {
  useActionData,
  useNavigation,
  useNavigate,
  useSubmit,
  Form,
} from "react-router-dom";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  BarTypeSelection,
  ContentConfiguration,
  CountdownConfiguration,
  FreeShippingConfiguration,
  DesignCustomization,
  TargetingSchedule,
  TargetingRules,
  BarPreview,
} from "../components/bars";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({}); // We don't need to load data, just authenticate
};

// Validation function
function validateBarData(data, currentStep) {
  const errors = {};

  // --- STEP 2 VALIDATION ---
  if (currentStep === 2) {
    if (data.type === "announcement") {
      // Rule for Announcement Bars: Message is required.
      if (!data.message || data.message.trim() === "") {
        errors.message = "Message is required for announcement bars";
      }
      // Validate CTA link if CTA text is provided
      if (data.ctaText && data.ctaText.trim() !== "") {
        if (!data.ctaLink || data.ctaLink.trim() === "") {
          errors.ctaLink = "Button link is required when button text is provided";
        } else if (!data.ctaLink.match(/^(https?:\/\/|\/)/)) {
          errors.ctaLink = "Link must start with http://, https://, or /";
        }
      }
    } else if (data.type === "countdown") {
      // Rule for Countdown Bars: A timer type must be selected.
      if (!data.timerType) {
        errors.timerType = "Please select a timer type (Fixed, Daily, or Evergreen)";
      }
      // Add checks for the specific timer type fields
      if (data.timerType === "fixed") {
        if (!data.timerEndDate) {
          errors.timerEndDate = "End date is required for fixed countdown timer";
        } else {
          const endDate = new Date(data.timerEndDate);
          if (endDate <= new Date()) {
            errors.timerEndDate = "End date must be in the future";
          }
        }
      }
      if (data.timerType === "daily") {
        if (!data.timerDailyTime) {
          errors.timerDailyTime = "Daily reset time is required for recurring countdown";
        }
      }
      if (data.timerType === "evergreen") {
        if (!data.timerDuration || parseInt(data.timerDuration, 10) <= 0) {
          errors.timerDuration = "Duration must be at least 1 minute for evergreen timer";
        } else if (parseInt(data.timerDuration, 10) > 10080) {
          errors.timerDuration = "Duration cannot exceed 7 days (10,080 minutes)";
        }
      }
      // Validate timer format - at least one unit must be shown
      if (data.timerFormat) {
        try {
          const format = JSON.parse(data.timerFormat);
          if (!format.showDays && !format.showHours && !format.showMinutes && !format.showSeconds) {
            errors.timerFormat = "At least one time unit must be displayed";
          }
        } catch (e) {
          errors.timerFormat = "Invalid timer format configuration";
        }
      }
      // Validate custom end message if selected
      if (data.timerEndAction === "show_message") {
        if (!data.timerEndMessage || data.timerEndMessage.trim() === "") {
          errors.timerEndMessage = "Custom end message is required when 'Show message' is selected";
        }
      }
    } else if (data.type === "shipping") {
      // Rule for Free Shipping Bars: Threshold and messages are required
      if (!data.shippingThreshold || parseFloat(data.shippingThreshold) <= 0) {
        errors.shippingThreshold = "Free shipping threshold must be greater than 0";
      }
      if (!data.shippingGoalText || data.shippingGoalText.trim() === "") {
        errors.shippingGoalText = "Goal message is required for free shipping bars";
      } else if (!data.shippingGoalText.includes("{amount}")) {
        errors.shippingGoalText = "Goal message must include {amount} placeholder";
      }
      if (!data.shippingReachedText || data.shippingReachedText.trim() === "") {
        errors.shippingReachedText = "Success message is required for free shipping bars";
      }
      if (!data.shippingCurrency || data.shippingCurrency.trim() === "") {
        errors.shippingCurrency = "Currency is required for free shipping bars";
      }
    }
  }

  // --- STEP 3 VALIDATION ---
  if (currentStep === 3) {
    // These rules apply to all bar types
    if (!data.backgroundColor || !data.backgroundColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.backgroundColor = "Valid background color is required (e.g., #288d40)";
    }
    if (!data.textColor || !data.textColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.textColor = "Valid text color is required (e.g., #ffffff)";
    }
    // Check for sufficient contrast
    if (data.backgroundColor && data.textColor) {
      const bgBrightness = getColorBrightness(data.backgroundColor);
      const textBrightness = getColorBrightness(data.textColor);
      if (Math.abs(bgBrightness - textBrightness) < 125) {
        errors.contrast = "Low contrast detected. Please choose colors that are easier to read";
      }
    }
  }

  // --- STEP 4 VALIDATION ---
  if (currentStep === 4) {
    // Validate schedule dates
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end <= start) {
        errors.endDate = "End date must be after start date";
      }
    }
    // Validate that start date is not in the past
    if (data.startDate) {
      const start = new Date(data.startDate);
      const now = new Date();
      if (start < now) {
        errors.startDate = "Start date cannot be in the past";
      }
    }
    
    // Validate targeting rules
    if (data.targetPages === "specific") {
      // Validate that at least one URL is provided
      try {
        const urls = data.targetSpecificUrls ? JSON.parse(data.targetSpecificUrls) : [];
        if (urls.length === 0) {
          errors.targetPages = "Please add at least one URL for specific page targeting";
        }
      } catch (e) {
        errors.targetPages = "Invalid URL list format";
      }
    }
    
    if (data.targetPages === "pattern") {
      // Validate that pattern value is provided
      try {
        const pattern = data.targetUrlPattern ? JSON.parse(data.targetUrlPattern) : { type: "contains", value: "" };
        if (!pattern.value || pattern.value.trim() === "") {
          errors.targetUrlPattern = "Please enter a URL pattern value";
        }
      } catch (e) {
        errors.targetUrlPattern = "Invalid URL pattern format";
      }
    }
  }

  return errors;
}

// Pre-built templates for quick start
const BAR_TEMPLATES = {
  announcement: [
    {
      name: "Free Shipping Promo",
      message: "🚚 Free Shipping on Orders Over $50!",
      ctaText: "Shop Now",
      ctaLink: "/collections/all",
      backgroundColor: "#0066cc",
      textColor: "#ffffff",
    },
    {
      name: "Sale Announcement",
      message: "🎉 Summer Sale - Up to 50% Off!",
      ctaText: "View Sale",
      ctaLink: "/collections/sale",
      backgroundColor: "#d72c0d",
      textColor: "#ffffff",
    },
    {
      name: "New Arrival",
      message: "✨ New Collection Just Dropped!",
      ctaText: "Explore Now",
      ctaLink: "/collections/new",
      backgroundColor: "#6b46c1",
      textColor: "#ffffff",
    },
  ],
  countdown: [
    {
      name: "Flash Sale Timer",
      message: "⚡ Flash Sale Ends Soon!",
      ctaText: "Shop Flash Sale",
      ctaLink: "/collections/flash-sale",
      backgroundColor: "#ff8c00",
      textColor: "#ffffff",
      timerType: "fixed",
      timerEndAction: "hide",
    },
    {
      name: "Daily Deal",
      message: "💎 Today's Deal Won't Last!",
      ctaText: "Grab Deal",
      ctaLink: "/collections/daily-deals",
      backgroundColor: "#288d40",
      textColor: "#ffffff",
      timerType: "daily",
      timerDailyTime: "23:59",
      timerEndAction: "hide",
    },
    {
      name: "Limited Offer",
      message: "🔥 Exclusive Offer Just For You!",
      ctaText: "Claim Offer",
      ctaLink: "/collections/limited",
      backgroundColor: "#1e3a8a",
      textColor: "#ffffff",
      timerType: "evergreen",
      timerDuration: "60",
      timerEndAction: "show_message",
      timerEndMessage: "Offer expired - Check back soon!",
    },
  ],
  shipping: [
    {
      name: "Standard Free Shipping",
      shippingThreshold: 50,
      shippingCurrency: "USD",
      shippingGoalText: "Add {amount} more for free shipping!",
      shippingReachedText: "You've unlocked free shipping! 🎉",
      backgroundColor: "#0066cc",
      textColor: "#ffffff",
      shippingProgressColor: "#4ade80",
      shippingShowIcon: true,
    },
    {
      name: "Premium Threshold",
      shippingThreshold: 75,
      shippingCurrency: "USD",
      shippingGoalText: "Spend {amount} more to unlock FREE shipping! 🚚",
      shippingReachedText: "Congrats! You earned free shipping! 🎊",
      backgroundColor: "#6b46c1",
      textColor: "#ffffff",
      shippingProgressColor: "#fbbf24",
      shippingShowIcon: true,
    },
    {
      name: "Minimal Theme",
      shippingThreshold: 35,
      shippingCurrency: "USD",
      shippingGoalText: "{amount} away from free delivery",
      shippingReachedText: "Free shipping unlocked ✓",
      backgroundColor: "#1f2937",
      textColor: "#ffffff",
      shippingProgressColor: "#10b981",
      shippingShowIcon: false,
    },
  ],
};

// Helper function for contrast validation
function getColorBrightness(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// Helper function to get template description
function getTemplateDescription(template) {
  if (template.message) {
    return template.message.substring(0, 30) + "...";
  }
  if (template.shippingGoalText) {
    return template.shippingGoalText.substring(0, 30) + "...";
  }
  return "Free shipping progress bar";
}

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const formData = await request.formData();
    const actionType = formData.get("actionType");

    const barData = {
      type: formData.get("type") || "announcement",
      message: formData.get("message") || "",
      ctaText: formData.get("ctaText") || null,
      ctaLink: formData.get("ctaLink") || null,
      backgroundColor: formData.get("backgroundColor") || "#288d40",
      textColor: formData.get("textColor") || "#ffffff",
      fontSize: parseInt(formData.get("fontSize") || "14", 10),
      position: formData.get("position") || "top",
      isActive: actionType === "publish",
      startDate: formData.get("startDate") ? new Date(formData.get("startDate")) : null,
      endDate: formData.get("endDate") ? new Date(formData.get("endDate")) : null,
      timerType: formData.get("timerType") || null,
      timerEndDate: formData.get("timerEndDate") ? new Date(formData.get("timerEndDate")) : null,
      timerDailyTime: formData.get("timerDailyTime") || null,
      timerDuration: formData.get("timerDuration") ? parseInt(formData.get("timerDuration"), 10) : null,
      timerFormat: formData.get("timerFormat") || null,
      timerEndAction: formData.get("timerEndAction") || null,
      timerEndMessage: formData.get("timerEndMessage") || null,
      shippingThreshold: formData.get("shippingThreshold") ? parseFloat(formData.get("shippingThreshold")) : null,
      shippingCurrency: formData.get("shippingCurrency") || null,
      shippingGoalText: formData.get("shippingGoalText") || null,
      shippingReachedText: formData.get("shippingReachedText") || null,
      shippingProgressColor: formData.get("shippingProgressColor") || null,
      shippingShowIcon: formData.get("shippingShowIcon") === "true",
      // Advanced design fields
      fontFamily: formData.get("fontFamily") || "system-ui, -apple-system, sans-serif",
      fontWeight: formData.get("fontWeight") || "normal",
      textAlign: formData.get("textAlign") || "center",
      paddingTop: formData.get("paddingTop") ? parseInt(formData.get("paddingTop"), 10) : 12,
      paddingBottom: formData.get("paddingBottom") ? parseInt(formData.get("paddingBottom"), 10) : 12,
      paddingLeft: formData.get("paddingLeft") ? parseInt(formData.get("paddingLeft"), 10) : 20,
      paddingRight: formData.get("paddingRight") ? parseInt(formData.get("paddingRight"), 10) : 20,
      borderColor: formData.get("borderColor") || null,
      borderWidth: formData.get("borderWidth") ? parseInt(formData.get("borderWidth"), 10) : 0,
      borderRadius: formData.get("borderRadius") ? parseInt(formData.get("borderRadius"), 10) : 0,
      buttonBgColor: formData.get("buttonBgColor") || null,
      buttonTextColor: formData.get("buttonTextColor") || null,
      buttonBorder: formData.get("buttonBorder") || null,
      shadowStyle: formData.get("shadowStyle") || "none",
      // Targeting rules fields
      targetDevices: formData.get("targetDevices") || "both",
      targetPages: formData.get("targetPages") || "all",
      targetSpecificUrls: formData.get("targetSpecificUrls") || null,
      targetUrlPattern: formData.get("targetUrlPattern") || null,
      displayFrequency: formData.get("displayFrequency") || "always",
    };

    // Validate
    const errors = validateBarData(barData, 4);
    if (Object.keys(errors).length > 0) {
      return json({ success: false, errors }, { status: 400 });
    }

    // Create bar in database with transaction to ensure only one active bar
    const bar = await db.$transaction(async (tx) => {
      // If publishing (activating), deactivate all other bars first
      if (actionType === "publish") {
        await tx.bar.updateMany({
          where: { shop, isActive: true },
          data: { isActive: false },
        });
      }

      // Create the new bar
      return await tx.bar.create({
        data: {
          shop,
          ...barData,
        },
      });
    });

    return json({
      success: true,
      bar,
      message: actionType === "publish" ? "Bar published successfully!" : "Bar saved as draft!",
    });
  } catch (error) {
    console.error("Action error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

export default function NewBarPage() {
  const navigate = useNavigate();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const submit = useSubmit();

  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  const [formData, setFormData] = useState({
    type: "announcement",
    message: "",
    ctaText: "",
    ctaLink: "",
    backgroundColor: "#288d40",
    textColor: "#ffffff",
    fontSize: 14,
    position: "top",
    startDate: "",
    endDate: "",
    timerType: "fixed",
    timerEndDate: "",
    timerDailyTime: "",
    timerDuration: "",
    timerFormat: JSON.stringify({ showDays: true, showHours: true, showMinutes: true, showSeconds: true }),
    timerEndAction: "hide",
    timerEndMessage: "",
    shippingThreshold: 50,
    shippingCurrency: "USD",
    shippingGoalText: "Add {amount} more for free shipping!",
    shippingReachedText: "You've unlocked free shipping! 🎉",
    shippingProgressColor: "#4ade80",
    shippingShowIcon: true,
    // Advanced design fields
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontWeight: "normal",
    textAlign: "center",
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    borderColor: null,
    borderWidth: 0,
    borderRadius: 0,
    buttonBgColor: null,
    buttonTextColor: null,
    buttonBorder: null,
    shadowStyle: "none",
    // Targeting rules fields
    targetDevices: "both",
    targetPages: "all",
    targetSpecificUrls: "",
    targetUrlPattern: JSON.stringify({ type: "contains", value: "" }),
    displayFrequency: "always",
  });

  const steps = [
    { id: 1, title: "Bar Type" },
    { id: 2, title: "Content" },
    { id: 3, title: "Design" },
    { id: 4, title: "Schedule" },
  ];

  useEffect(() => {
    if (actionData?.success) {
      setToastMessage(`✅ ${actionData.message}`);
      setToastError(false);
      setShowToast(true);
      // Redirect to bars list after a short delay
      setTimeout(() => {
        navigate("/app");
      }, 1500);
    } else if (actionData?.error || actionData?.errors) {
      const errorMsg = actionData.error || Object.values(actionData.errors).join(", ");
      setToastMessage(`Error: ${errorMsg}`);
      setToastError(true);
      setShowToast(true);
    }
  }, [actionData, navigate]);

  const handleNext = useCallback(() => {
    const errors = validateBarData(formData, currentStep);
    if (Object.keys(errors).length > 0) {
      const errorMsg = Object.values(errors).join(" • ");
      setToastMessage(`Please fix the following: ${errorMsg}`);
      setToastError(true);
      setShowToast(true);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      // Scroll to top for next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, formData]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(
    (actionType) => {
      // Final validation before submit
      const errors = validateBarData(formData, 4);
      if (Object.keys(errors).length > 0) {
        const errorMsg = Object.values(errors).join(", ");
        setToastMessage(`Please fix errors: ${errorMsg}`);
        setToastError(true);
        setShowToast(true);
        return;
      }

      // Additional validation for countdown bars
      if (formData.type === "countdown") {
        if (!formData.timerType) {
          setToastMessage("Please configure countdown timer settings");
          setToastError(true);
          setShowToast(true);
          return;
        }
        
        if (formData.timerType === "fixed" && !formData.timerEndDate) {
          setToastMessage("Please set an end date for the countdown timer");
          setToastError(true);
          setShowToast(true);
          return;
        }
        
        if (formData.timerType === "daily" && !formData.timerDailyTime) {
          setToastMessage("Please set a daily reset time for the countdown timer");
          setToastError(true);
          setShowToast(true);
          return;
        }
        
        if (formData.timerType === "evergreen" && (!formData.timerDuration || parseInt(formData.timerDuration, 10) <= 0)) {
          setToastMessage("Please set a duration for the evergreen countdown timer");
          setToastError(true);
          setShowToast(true);
          return;
        }
      }

      const formDataToSubmit = new FormData();
      formDataToSubmit.append("type", formData.type);
      formDataToSubmit.append("message", formData.message);
      formDataToSubmit.append("ctaText", formData.ctaText || "");
      formDataToSubmit.append("ctaLink", formData.ctaLink || "");
      formDataToSubmit.append("backgroundColor", formData.backgroundColor);
      formDataToSubmit.append("textColor", formData.textColor);
      formDataToSubmit.append("fontSize", formData.fontSize.toString());
      formDataToSubmit.append("position", formData.position);
      formDataToSubmit.append("actionType", actionType);
      if (formData.startDate) {
        formDataToSubmit.append("startDate", formData.startDate);
      }
      if (formData.endDate) {
        formDataToSubmit.append("endDate", formData.endDate);
      }
      // Countdown timer fields
      if (formData.type === "countdown") {
        formDataToSubmit.append("timerType", formData.timerType || "");
        formDataToSubmit.append("timerEndDate", formData.timerEndDate || "");
        formDataToSubmit.append("timerDailyTime", formData.timerDailyTime || "");
        formDataToSubmit.append("timerDuration", formData.timerDuration || "");
        formDataToSubmit.append("timerFormat", formData.timerFormat || "");
        formDataToSubmit.append("timerEndAction", formData.timerEndAction || "");
        formDataToSubmit.append("timerEndMessage", formData.timerEndMessage || "");
      }
      // Free shipping fields
      if (formData.type === "shipping") {
        formDataToSubmit.append("shippingThreshold", formData.shippingThreshold || "");
        formDataToSubmit.append("shippingCurrency", formData.shippingCurrency || "USD");
        formDataToSubmit.append("shippingGoalText", formData.shippingGoalText || "");
        formDataToSubmit.append("shippingReachedText", formData.shippingReachedText || "");
        formDataToSubmit.append("shippingProgressColor", formData.shippingProgressColor || "#4ade80");
        formDataToSubmit.append("shippingShowIcon", formData.shippingShowIcon ? "true" : "false");
      }
      // Advanced design fields
      formDataToSubmit.append("fontFamily", formData.fontFamily || "system-ui, -apple-system, sans-serif");
      formDataToSubmit.append("fontWeight", formData.fontWeight || "normal");
      formDataToSubmit.append("textAlign", formData.textAlign || "center");
      formDataToSubmit.append("paddingTop", formData.paddingTop?.toString() || "12");
      formDataToSubmit.append("paddingBottom", formData.paddingBottom?.toString() || "12");
      formDataToSubmit.append("paddingLeft", formData.paddingLeft?.toString() || "20");
      formDataToSubmit.append("paddingRight", formData.paddingRight?.toString() || "20");
      if (formData.borderColor) {
        formDataToSubmit.append("borderColor", formData.borderColor);
      }
      formDataToSubmit.append("borderWidth", formData.borderWidth?.toString() || "0");
      formDataToSubmit.append("borderRadius", formData.borderRadius?.toString() || "0");
      if (formData.buttonBgColor) {
        formDataToSubmit.append("buttonBgColor", formData.buttonBgColor);
      }
      if (formData.buttonTextColor) {
        formDataToSubmit.append("buttonTextColor", formData.buttonTextColor);
      }
      if (formData.buttonBorder) {
        formDataToSubmit.append("buttonBorder", formData.buttonBorder);
      }
      formDataToSubmit.append("shadowStyle", formData.shadowStyle || "none");
      // Targeting rules fields
      formDataToSubmit.append("targetDevices", formData.targetDevices || "both");
      formDataToSubmit.append("targetPages", formData.targetPages || "all");
      formDataToSubmit.append("targetSpecificUrls", formData.targetSpecificUrls || "");
      formDataToSubmit.append("targetUrlPattern", formData.targetUrlPattern || "");
      formDataToSubmit.append("displayFrequency", formData.displayFrequency || "always");
      submit(formDataToSubmit, { method: "post" });
    },
    [formData, submit]
  );

  // Keyboard shortcuts for better UX - placed after all handlers are defined
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Prevent shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Alt/Option + N: Next step
      if (e.altKey && e.key === 'n' && currentStep < 4 && !isSubmitting) {
        e.preventDefault();
        handleNext();
      }
      
      // Alt/Option + P: Previous step
      if (e.altKey && e.key === 'p' && currentStep > 1 && !isSubmitting) {
        e.preventDefault();
        handlePrevious();
      }
      
      // Alt/Option + S: Save as draft (on final step)
      if (e.altKey && e.key === 's' && currentStep === 4 && !isSubmitting) {
        e.preventDefault();
        handleSubmit('draft');
      }
      
      // Alt/Option + Enter: Publish (on final step)
      if (e.altKey && e.key === 'Enter' && currentStep === 4 && !isSubmitting) {
        e.preventDefault();
        handleSubmit('publish');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, isSubmitting]); // Removed function dependencies to avoid issues

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <BarTypeSelection
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value })}
            />
            
            {/* Template Selector */}
            {formData.type && (
              <Card sectioned>
                <LegacyStack vertical spacing="loose">
                  <Text variant="headingMd" as="h3">
                    Quick Start Templates
                  </Text>
                  <Text variant="bodyMd" as="p" color="subdued">
                    Choose a template to get started faster, or start from scratch
                  </Text>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                    {BAR_TEMPLATES[formData.type]?.map((template) => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, ...template });
                          setToastMessage(`✨ Template "${template.name}" applied!`);
                          setToastError(false);
                          setShowToast(true);
                        }}
                        style={{
                          padding: "16px",
                          borderRadius: "8px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#008060";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 128, 96, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div style={{
                          width: "100%",
                          height: "40px",
                          backgroundColor: template.backgroundColor,
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }} />
                        <Text variant="bodyMd" as="p" fontWeight="semibold">
                          {template.name}
                        </Text>
                        <Text variant="bodySm" as="p" color="subdued">
                          {getTemplateDescription(template)}
                        </Text>
                      </button>
                    ))}
                  </div>
                  
                  <Text variant="bodySm" as="p" color="subdued">
                    💡 You can customize any template in the next steps
                  </Text>
                </LegacyStack>
              </Card>
            )}
          </>
        );
      case 2:
        // Show appropriate configuration based on bar type
        if (formData.type === "countdown") {
          return (
            <CountdownConfiguration
              formData={formData}
              onChange={setFormData}
            />
          );
        } else if (formData.type === "shipping") {
          return (
            <FreeShippingConfiguration
              formData={formData}
              onChange={setFormData}
            />
          );
        }
        return (
          <ContentConfiguration
            formData={formData}
            onChange={setFormData}
          />
        );
      case 3:
        return (
          <DesignCustomization
            formData={formData}
            onChange={setFormData}
          />
        );
      case 4:
        return (
          <>
            <TargetingRules
              formData={formData}
              onChange={setFormData}
            />
            <div style={{ marginTop: "16px" }}>
              <TargetingSchedule
                formData={formData}
                onChange={setFormData}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Page
      backAction={{ content: "Bars", onAction: () => navigate("/app") }}
      title="Create New Bar"
      titleMetadata={
        <LegacyStack spacing="tight" alignment="center">
          <Text variant="bodyMd" as="span" color="subdued">
            Step {currentStep} of {steps.length}
          </Text>
          <div style={{ 
            padding: "4px 8px", 
            backgroundColor: "#f0fdf4", 
            borderRadius: "4px",
            border: "1px solid #86efac"
          }}>
            <Text variant="bodySm" as="span" color="success">
              💡 Tip: Use Alt+N for Next, Alt+P for Previous
            </Text>
          </div>
        </LegacyStack>
      }
    >
      <TitleBar title="Create New Bar" />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 400px",
        gap: "20px",
        alignItems: "start",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 20px"
      }}>
        {/* Left Column - Form Content */}
        <div>
          {/* Step Progress Indicator */}
          <Card>
            <div style={{ padding: "16px" }}>
              <LegacyStack distribution="equalSpacing">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      paddingBottom: "8px",
                      borderBottom:
                        step.id === currentStep
                          ? "3px solid #008060"
                          : step.id < currentStep
                          ? "3px solid #b5b5b5"
                          : "3px solid #e0e0e0",
                    }}
                  >
                    <Text
                      variant="bodyMd"
                      as="p"
                      fontWeight={step.id === currentStep ? "semibold" : "regular"}
                      color={step.id <= currentStep ? undefined : "subdued"}
                    >
                      {step.title}
                    </Text>
                  </div>
                ))}
              </LegacyStack>
            </div>
          </Card>

          {/* Form Step Content */}
          <Form method="post" style={{ marginTop: "16px" }}>
            {isSubmitting && (
              <div style={{ 
                position: "fixed", 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: "rgba(255, 255, 255, 0.9)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                zIndex: 10000,
                backdropFilter: "blur(4px)"
              }}>
                <Card>
                  <div style={{ padding: "32px", textAlign: "center" }}>
                    <div style={{ marginBottom: "16px" }}>
                      <div className="loading-spinner" style={{
                        width: "48px",
                        height: "48px",
                        border: "4px solid #e5e7eb",
                        borderTop: "4px solid #008060",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        margin: "0 auto"
                      }}></div>
                    </div>
                    <Text variant="headingMd" as="h3">
                      {currentStep === 4 ? "Publishing your bar..." : "Processing..."}
                    </Text>
                    <Text variant="bodyMd" as="p" color="subdued" style={{ marginTop: "8px" }}>
                      Please wait while we save your settings
                    </Text>
                  </div>
                </Card>
              </div>
            )}
            {renderStep()}

            {/* Navigation Buttons */}
            <Card sectioned>
              <LegacyStack distribution="equalSpacing">
                <Button onClick={handlePrevious} disabled={currentStep === 1}>
                  Previous
                </Button>

                <LegacyStack spacing="tight">
                  {currentStep === 4 ? (
                    <ButtonGroup>
                      <Button
                        onClick={() => handleSubmit("draft")}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                      >
                        Save as Draft
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleSubmit("publish")}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                      >
                        Publish Bar
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <Button variant="primary" onClick={handleNext}>
                      Next
                    </Button>
                  )}
                </LegacyStack>
              </LegacyStack>
            </Card>
          </Form>
        </div>

        {/* Right Column - Sticky Preview */}
        <div style={{ 
          position: "sticky", 
          top: "100px",
          height: "fit-content"
        }}>
          <BarPreview formData={formData} />
        </div>
      </div>

      {/* Responsive: Stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky"] {
            position: relative !important;
            top: auto !important;
          }
        }
      `}</style>

      {showToast && (
        <Toast
          content={toastMessage}
          error={toastError}
          onDismiss={() => setShowToast(false)}
          duration={4000}
        />
      )}
    </Page>
  );
}
