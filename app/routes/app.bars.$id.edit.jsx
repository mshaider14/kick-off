import {
  Page,
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
  useLoaderData,
  useNavigation,
  useNavigate,
  useSubmit,
  Form,
  useParams,
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

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;
  
  const bar = await db.bar.findFirst({
    where: { id, shop: session.shop },
  });
  
  if (!bar) {
    throw new Response("Bar not found", { status: 404 });
  }
  
  return json({ bar });
};

// Validation function (same as in app.new.jsx)
function validateBarData(data, currentStep) {
  const errors = {};

  if (currentStep === 2) {
    if (data.type === "announcement") {
      if (!data.message || data.message.trim() === "") {
        errors.message = "Message is required for announcement bars";
      }
      if (data.ctaText && data.ctaText.trim() !== "") {
        if (!data.ctaLink || data.ctaLink.trim() === "") {
          errors.ctaLink = "Button link is required when button text is provided";
        } else if (!data.ctaLink.match(/^(https?:\/\/|\/)/)) {
          errors.ctaLink = "Link must start with http://, https://, or /";
        }
      }
    } else if (data.type === "countdown") {
      if (!data.timerType) {
        errors.timerType = "Please select a timer type (Fixed, Daily, or Evergreen)";
      }
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
      if (data.timerType === "daily" && !data.timerDailyTime) {
        errors.timerDailyTime = "Daily reset time is required for recurring countdown";
      }
      if (data.timerType === "evergreen") {
        if (!data.timerDuration || parseInt(data.timerDuration, 10) <= 0) {
          errors.timerDuration = "Duration must be at least 1 minute for evergreen timer";
        } else if (parseInt(data.timerDuration, 10) > 10080) {
          errors.timerDuration = "Duration cannot exceed 7 days (10,080 minutes)";
        }
      }
    } else if (data.type === "shipping") {
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

  if (currentStep === 3) {
    if (!data.backgroundColor || !data.backgroundColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.backgroundColor = "Valid background color is required (e.g., #288d40)";
    }
    if (!data.textColor || !data.textColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.textColor = "Valid text color is required (e.g., #ffffff)";
    }
  }

  if (currentStep === 4) {
    if (!data.scheduleStartImmediate && !data.scheduleEndNever && data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end <= start) {
        errors.endDate = "End date must be after start date";
      }
    }
    if (!data.scheduleStartImmediate && data.startDate) {
      const start = new Date(data.startDate);
      const now = new Date();
      if (start < now) {
        errors.startDate = "Start date cannot be in the past";
      }
    }
    if (!data.scheduleStartImmediate && !data.startDate) {
      errors.startDate = "Please select a start date or choose 'Start immediately'";
    }
  }

  return errors;
}

export const action = async ({ request, params }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const { id } = params;

    const formData = await request.formData();
    const actionType = formData.get("actionType");

    const scheduleStartImmediate = formData.get("scheduleStartImmediate") === "true";
    const scheduleEndNever = formData.get("scheduleEndNever") === "true";
    
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
      startDate: scheduleStartImmediate ? null : (formData.get("startDate") ? new Date(formData.get("startDate")) : null),
      endDate: scheduleEndNever ? null : (formData.get("endDate") ? new Date(formData.get("endDate")) : null),
      timezone: formData.get("timezone") || "UTC",
      scheduleStartImmediate: scheduleStartImmediate,
      scheduleEndNever: scheduleEndNever,
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

    // Update bar in database with transaction
    const bar = await db.$transaction(async (tx) => {
      // If publishing (activating), deactivate all other bars first
      if (actionType === "publish") {
        await tx.bar.updateMany({
          where: { shop, isActive: true, NOT: { id } },
          data: { isActive: false },
        });
      }

      // Update the bar
      return await tx.bar.update({
        where: { id, shop },
        data: barData,
      });
    });

    return json({
      success: true,
      bar,
      message: actionType === "publish" ? "Bar updated and published!" : "Bar updated successfully!",
    });
  } catch (error) {
    console.error("Action error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

export default function EditBarPage() {
  const navigate = useNavigate();
  const { bar: loadedBar } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const submit = useSubmit();

  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Initialize form data from loaded bar
  const [formData, setFormData] = useState({
    type: loadedBar.type || "announcement",
    message: loadedBar.message || "",
    ctaText: loadedBar.ctaText || "",
    ctaLink: loadedBar.ctaLink || "",
    backgroundColor: loadedBar.backgroundColor || "#288d40",
    textColor: loadedBar.textColor || "#ffffff",
    fontSize: loadedBar.fontSize || 14,
    position: loadedBar.position || "top",
    startDate: loadedBar.startDate ? new Date(loadedBar.startDate).toISOString().slice(0, 16) : "",
    endDate: loadedBar.endDate ? new Date(loadedBar.endDate).toISOString().slice(0, 16) : "",
    timezone: loadedBar.timezone || "UTC",
    scheduleStartImmediate: loadedBar.scheduleStartImmediate || false,
    scheduleEndNever: loadedBar.scheduleEndNever || false,
    timerType: loadedBar.timerType || "fixed",
    timerEndDate: loadedBar.timerEndDate ? new Date(loadedBar.timerEndDate).toISOString().slice(0, 16) : "",
    timerDailyTime: loadedBar.timerDailyTime || "",
    timerDuration: loadedBar.timerDuration || "",
    timerFormat: loadedBar.timerFormat || JSON.stringify({ showDays: true, showHours: true, showMinutes: true, showSeconds: true }),
    timerEndAction: loadedBar.timerEndAction || "hide",
    timerEndMessage: loadedBar.timerEndMessage || "",
    shippingThreshold: loadedBar.shippingThreshold || 50,
    shippingCurrency: loadedBar.shippingCurrency || "USD",
    shippingGoalText: loadedBar.shippingGoalText || "Add {amount} more for free shipping!",
    shippingReachedText: loadedBar.shippingReachedText || "You've unlocked free shipping! 🎉",
    shippingProgressColor: loadedBar.shippingProgressColor || "#4ade80",
    shippingShowIcon: loadedBar.shippingShowIcon !== false,
    fontFamily: loadedBar.fontFamily || "system-ui, -apple-system, sans-serif",
    fontWeight: loadedBar.fontWeight || "normal",
    textAlign: loadedBar.textAlign || "center",
    paddingTop: loadedBar.paddingTop || 12,
    paddingBottom: loadedBar.paddingBottom || 12,
    paddingLeft: loadedBar.paddingLeft || 20,
    paddingRight: loadedBar.paddingRight || 20,
    borderColor: loadedBar.borderColor || null,
    borderWidth: loadedBar.borderWidth || 0,
    borderRadius: loadedBar.borderRadius || 0,
    buttonBgColor: loadedBar.buttonBgColor || null,
    buttonTextColor: loadedBar.buttonTextColor || null,
    buttonBorder: loadedBar.buttonBorder || null,
    shadowStyle: loadedBar.shadowStyle || "none",
    targetDevices: loadedBar.targetDevices || "both",
    targetPages: loadedBar.targetPages || "all",
    targetSpecificUrls: loadedBar.targetSpecificUrls || "",
    targetUrlPattern: loadedBar.targetUrlPattern || JSON.stringify({ type: "contains", value: "" }),
    displayFrequency: loadedBar.displayFrequency || "always",
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
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
      const errors = validateBarData(formData, 4);
      if (Object.keys(errors).length > 0) {
        const errorMsg = Object.values(errors).join(", ");
        setToastMessage(`Please fix errors: ${errorMsg}`);
        setToastError(true);
        setShowToast(true);
        return;
      }

      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== "") {
          if (typeof value === "boolean") {
            formDataToSubmit.append(key, value ? "true" : "false");
          } else {
            formDataToSubmit.append(key, value.toString());
          }
        }
      });
      formDataToSubmit.append("actionType", actionType);
      
      submit(formDataToSubmit, { method: "post" });
    },
    [formData, submit]
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BarTypeSelection
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value })}
          />
        );
      case 2:
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
      title={`Edit Bar: ${loadedBar.type === "countdown" 
        ? "Countdown Timer" 
        : loadedBar.type === "shipping" 
        ? "Free Shipping Bar" 
        : (loadedBar.message || "Untitled Bar")}`}
      titleMetadata={
        <LegacyStack spacing="tight" alignment="center">
          <Text variant="bodyMd" as="span" color="subdued">
            Step {currentStep} of {steps.length}
          </Text>
        </LegacyStack>
      }
    >
      <TitleBar title="Edit Bar" />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 400px",
        gap: "20px",
        alignItems: "start",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 20px"
      }}>
        <div>
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

          <Form method="post" style={{ marginTop: "16px" }}>
            {renderStep()}

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
                        Update & Publish
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

        <div style={{ 
          position: "sticky", 
          top: "100px",
          height: "fit-content"
        }}>
          <BarPreview formData={formData} />
        </div>
      </div>

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
