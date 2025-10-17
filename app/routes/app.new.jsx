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
  DesignCustomization,
  TargetingSchedule,
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
        errors.message = "Message is required";
      }
    } else if (data.type === "countdown") {
      // Rule for Countdown Bars: A timer type must be selected.
      if (!data.timerType) {
        errors.timerType = "A timer type must be selected";
      }
      // Add checks for the specific timer type fields if needed
      if (data.timerType === "fixed" && !data.timerEndDate) {
        errors.timerEndDate = "End date is required for a fixed timer";
      }
      if (data.timerType === "daily" && !data.timerDailyTime) {
        errors.timerDailyTime = "Daily reset time is required";
      }
      if (data.timerType === "evergreen" && (!data.timerDuration || parseInt(data.timerDuration, 10) <= 0)) {
        errors.timerDuration = "A positive duration is required for an evergreen timer";
      }
    }
  }

  // --- STEP 3 VALIDATION ---
  if (currentStep === 3) {
    // These rules apply to all bar types
    if (!data.backgroundColor || !data.backgroundColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.backgroundColor = "Valid background color is required";
    }
    if (!data.textColor || !data.textColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.textColor = "Valid text color is required";
    }
  }

  // --- STEP 4 VALIDATION ---
  if (currentStep === 4) {
     if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (end <= start) {
          errors.endDate = "End date must be after start date";
        }
      }
  }

  return errors;
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
    };

    // Validate
    const errors = validateBarData(barData, 4);
    if (Object.keys(errors).length > 0) {
      return json({ success: false, errors }, { status: 400 });
    }

    // Create bar in database
    const bar = await db.bar.create({
      data: {
        shop,
        ...barData,
      },
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
  });

  const steps = [
    { id: 1, title: "Bar Type" },
    { id: 2, title: "Content" },
    { id: 3, title: "Design" },
    { id: 4, title: "Schedule" },
  ];

  useEffect(() => {
    if (actionData?.success) {
      setToastMessage(actionData.message);
      setToastError(false);
      setShowToast(true);
      // Redirect to bars list after a short delay
      setTimeout(() => {
        navigate("/app");
      }, 2000);
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
      const errorMsg = Object.values(errors).join(", ");
      setToastMessage(`Please fix errors: ${errorMsg}`);
      setToastError(true);
      setShowToast(true);
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, formData]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(
    (actionType) => {
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
        // Show countdown configuration for countdown bars, regular content for others
        if (formData.type === "countdown") {
          return (
            <CountdownConfiguration
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
          <TargetingSchedule
            formData={formData}
            onChange={setFormData}
          />
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
        <Text variant="bodyMd" as="span" color="subdued">
          Step {currentStep} of {steps.length}
        </Text>
      }
    >
      <TitleBar title="Create New Bar" />

      <Layout>
        <Layout.Section>
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
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BarPreview formData={formData} />
        </Layout.Section>
      </Layout>

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
