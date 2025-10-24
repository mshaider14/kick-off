import { Card, LegacyStack, Text } from "@shopify/polaris";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

export function BarPreview({ formData }) {
  const {
    type = "announcement",
    message = "Your announcement message here",
    ctaText = "",
    backgroundColor = "#288d40",
    textColor = "#ffffff",
    fontSize = 14,
    position = "top",
    timerType,
    timerEndDate,
    timerDailyTime,
    timerDuration,
    timerFormat,
    shippingThreshold = 50,
    shippingCurrency = "USD",
    shippingGoalText = "Add {amount} more for free shipping!",
    shippingReachedText = "You've unlocked free shipping! 🎉",
    shippingProgressColor = "#4ade80",
    shippingShowIcon = true,
    // Email capture fields
    emailPlaceholder = "Enter your email",
    namePlaceholder = "Your name (optional)",
    nameFieldEnabled = false,
    submitButtonText = "Get My Discount",
    successMessage = "Thank you! Check your email for your discount code.",
    discountCode = "",
    privacyCheckboxEnabled = false,
    privacyCheckboxText = "I agree to receive marketing emails",
    // New design fields
    fontFamily = "system-ui, -apple-system, sans-serif",
    fontWeight = "normal",
    textAlign = "center",
    paddingTop = 12,
    paddingBottom = 12,
    paddingLeft = 20,
    paddingRight = 20,
    borderColor,
    borderWidth = 0,
    borderRadius = 0,
    buttonBgColor,
    buttonTextColor,
    buttonBorder,
    shadowStyle = "none",
  } = formData;

  const [countdownValues, setCountdownValues] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // Free shipping preview state - simulate cart values
  const [previewCartValue, setPreviewCartValue] = useState(25); // Default to 50% of threshold
  const [showSuccessState, setShowSuccessState] = useState(false);
  
  // Email capture preview state
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);

  // Parse timer format
  let format = { showDays: true, showHours: true, showMinutes: true, showSeconds: true };
  if (timerFormat) {
    try {
      format = JSON.parse(timerFormat);
    } catch (e) {
      // Use defaults
    }
  }

  // Update preview cart value for free shipping bars
  useEffect(() => {
    if (type !== "shipping") return;

    const interval = setInterval(() => {
      setPreviewCartValue((prev) => {
        // Cycle through different cart values for preview
        const threshold = parseFloat(shippingThreshold) || 50;
        const nextValue = prev + threshold * 0.15; // Increment by 15% of threshold
        if (nextValue >= threshold * 1.2) {
          setShowSuccessState(false);
          return threshold * 0.3; // Reset to 30%
        }
        if (nextValue >= threshold && !showSuccessState) {
          setShowSuccessState(true);
        }
        return nextValue;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [type, shippingThreshold, showSuccessState]);

  // Update countdown for preview
  useEffect(() => {
    if (type !== "countdown") return;

    let endTime;

    if (timerType === "fixed" && timerEndDate) {
      endTime = new Date(timerEndDate).getTime();
    } else if (timerType === "daily" && timerDailyTime) {
      const [hours, minutes] = timerDailyTime.split(":");
      const now = new Date();
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes)).getTime();
      if (endTime < Date.now()) {
        endTime += 24 * 60 * 60 * 1000; // Add a day if time has passed today
      }
    } else if (timerType === "evergreen" && timerDuration) {
      endTime = Date.now() + parseInt(timerDuration) * 60 * 1000;
    } else {
      // Default preview countdown
      endTime = Date.now() + 2 * 24 * 60 * 60 * 1000; // 2 days from now
    }

    const updateCountdown = () => {
      const distance = endTime - Date.now();

      if (distance < 0) {
        setCountdownValues({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdownValues({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [type, timerType, timerEndDate, timerDailyTime, timerDuration]);

  // Helper to get shadow style
  const getShadowStyle = (style) => {
    switch (style) {
      case "subtle":
        return "0 1px 3px rgba(0, 0, 0, 0.1)";
      case "medium":
        return "0 4px 12px rgba(0, 0, 0, 0.15)";
      case "strong":
        return "0 10px 25px rgba(0, 0, 0, 0.25)";
      default:
        return "none";
    }
  };

  // Helper to get font weight value
  const getFontWeight = (weight) => {
    switch (weight) {
      case "normal":
        return "400";
      case "medium":
        return "500";
      case "bold":
        return "700";
      default:
        return "400";
    }
  };

  const barStyle = {
    backgroundColor,
    color: textColor,
    padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
    fontSize: `${fontSize}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
    gap: "20px",
    minHeight: "56px",
    flexWrap: "wrap",
    fontFamily: fontFamily,
    fontWeight: getFontWeight(fontWeight),
    lineHeight: "1.4",
    textAlign: textAlign,
    border: borderWidth > 0 && borderColor ? `${borderWidth}px solid ${borderColor}` : "none",
    borderRadius: `${borderRadius}px`,
    boxShadow: getShadowStyle(shadowStyle),
  };

  const buttonStyle = {
    backgroundColor: buttonBgColor || textColor,
    color: buttonTextColor || backgroundColor,
    border: buttonBorder ? `${buttonBorder} ${buttonTextColor || backgroundColor}` : "none",
    padding: "10px 24px",
    borderRadius: "6px",
    fontSize: `${fontSize - 1}px`,
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const timerStyle = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  };

  const timeUnitStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const timeValueStyle = {
    fontSize: `${fontSize + 6}px`,
    fontWeight: "700",
    fontVariantNumeric: "tabular-nums",
    lineHeight: "1",
  };

  const timeLabelStyle = {
    fontSize: `${fontSize - 4}px`,
    opacity: 0.8,
  };

  // Free shipping bar calculations
  const threshold = parseFloat(shippingThreshold) || 50;
  const cartValue = showSuccessState ? threshold : Math.min(previewCartValue, threshold);
  const progressPercentage = Math.min((cartValue / threshold) * 100, 100);
  const remaining = Math.max(threshold - cartValue, 0);
  
  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$",
      JPY: "¥", NZD: "NZ$", INR: "₹", SGD: "S$", HKD: "HK$"
    };
    return symbols[currency] || "$";
  };

  const formatAmount = (amount, currency) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  };

  const shippingMessage = showSuccessState 
    ? shippingReachedText 
    : shippingGoalText.replace("{amount}", formatAmount(remaining, shippingCurrency));


  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <LegacyStack vertical spacing="tight">
          <Text variant="headingMd" as="h3">
            Preview
          </Text>
          <Text variant="bodySm" as="p" color="subdued">
            Position: {position === "top" ? "Top of page" : "Bottom of page"}
          </Text>

          <div
            style={{
              border: "2px dashed #e0e0e0",
              borderRadius: "8px",
              overflow: "hidden",
              marginTop: "12px",
            }}
            role="region"
            aria-label="Bar preview"
          >
            <div style={barStyle}>
              {type === "shipping" ? (
                // Free Shipping Progress Bar
                <div style={{ width: "100%", maxWidth: "600px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px",
                    marginBottom: "8px"
                  }}>
                    {shippingShowIcon && (
                      <span style={{ fontSize: "20px" }}>🚚</span>
                    )}
                    <span style={{ 
                      fontWeight: showSuccessState ? "700" : "600",
                      flex: 1
                    }}>
                      {shippingMessage}
                    </span>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <div style={{
                      width: `${progressPercentage}%`,
                      height: "100%",
                      backgroundColor: shippingProgressColor,
                      borderRadius: "6px",
                      transition: "width 0.5s ease-out",
                      boxShadow: showSuccessState ? "0 0 10px rgba(74, 222, 128, 0.5)" : "none"
                    }} />
                  </div>
                  {!showSuccessState && (
                    <div style={{ 
                      marginTop: "6px", 
                      fontSize: `${fontSize - 2}px`,
                      opacity: 0.9,
                      textAlign: "center"
                    }}>
                      {formatAmount(cartValue, shippingCurrency)} / {formatAmount(threshold, shippingCurrency)}
                    </div>
                  )}
                </div>
              ) : type === "email" ? (
                // Email Capture Bar
                <div style={{ width: "100%", maxWidth: "600px" }}>
                  <div style={{ marginBottom: "12px", fontWeight: "600" }}>
                    {message}
                  </div>
                  
                  {!showEmailSuccess ? (
                    // Form view
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <input
                          type="email"
                          placeholder={emailPlaceholder}
                          style={{
                            flex: 1,
                            minWidth: "200px",
                            padding: "10px 14px",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "6px",
                            fontSize: `${fontSize}px`,
                            background: "rgba(255, 255, 255, 0.15)",
                            color: textColor,
                            outline: "none",
                          }}
                          disabled
                        />
                        {nameFieldEnabled && (
                          <input
                            type="text"
                            placeholder={namePlaceholder}
                            style={{
                              flex: "0.8",
                              minWidth: "180px",
                              padding: "10px 14px",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              borderRadius: "6px",
                              fontSize: `${fontSize}px`,
                              background: "rgba(255, 255, 255, 0.15)",
                              color: textColor,
                              outline: "none",
                            }}
                            disabled
                          />
                        )}
                      </div>
                      
                      {privacyCheckboxEnabled && (
                        <div style={{ 
                          display: "flex", 
                          alignItems: "flex-start", 
                          gap: "8px",
                          fontSize: `${fontSize - 2}px`
                        }}>
                          <input 
                            type="checkbox" 
                            style={{ marginTop: "2px" }}
                            disabled
                          />
                          <span>{privacyCheckboxText}</span>
                        </div>
                      )}
                      
                      <button
                        style={{
                          padding: "12px 28px",
                          background: buttonBgColor || "rgba(255, 255, 255, 0.95)",
                          color: buttonTextColor || "#000000",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: `${fontSize}px`,
                          fontWeight: "600",
                          cursor: "pointer",
                          alignSelf: "flex-start",
                          whiteSpace: "nowrap",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowEmailSuccess(true);
                          setTimeout(() => setShowEmailSuccess(false), 5000);
                        }}
                      >
                        {submitButtonText}
                      </button>
                    </div>
                  ) : (
                    // Success view
                    <div style={{ 
                      textAlign: "center",
                      padding: "12px",
                      animation: "fadeIn 0.4s ease"
                    }}>
                      <div style={{ fontSize: "36px", marginBottom: "8px" }}>✓</div>
                      <div style={{ fontSize: `${fontSize}px`, fontWeight: "600", marginBottom: "12px" }}>
                        {successMessage}
                      </div>
                      {discountCode && (
                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 20px",
                          background: "rgba(255, 255, 255, 0.2)",
                          border: "2px dashed rgba(255, 255, 255, 0.5)",
                          borderRadius: "8px",
                          marginTop: "8px",
                        }}>
                          <span style={{ fontSize: `${fontSize - 1}px`, opacity: 0.9 }}>Your Code:</span>
                          <span style={{ 
                            fontSize: `${fontSize + 4}px`, 
                            fontWeight: "700",
                            letterSpacing: "1px",
                            fontFamily: "monospace"
                          }}>
                            {discountCode}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Announcement or Countdown Bar
                <>
                  <span>{message}</span>

                  {type === "countdown" && (
                    <div style={timerStyle}>
                      {format.showDays && (
                        <>
                          <div style={timeUnitStyle}>
                            <span style={timeValueStyle}>{countdownValues.days}</span>
                            <span style={timeLabelStyle}>Days</span>
                          </div>
                          <span>:</span>
                        </>
                      )}
                      {format.showHours && (
                        <>
                          <div style={timeUnitStyle}>
                            <span style={timeValueStyle}>{countdownValues.hours}</span>
                            <span style={timeLabelStyle}>Hours</span>
                          </div>
                          <span>:</span>
                        </>
                      )}
                      {format.showMinutes && (
                        <>
                          <div style={timeUnitStyle}>
                            <span style={timeValueStyle}>{countdownValues.minutes}</span>
                            <span style={timeLabelStyle}>Mins</span>
                          </div>
                          <span>:</span>
                        </>
                      )}
                      {format.showSeconds && (
                        <div style={timeUnitStyle}>
                          <span style={timeValueStyle}>{countdownValues.seconds}</span>
                          <span style={timeLabelStyle}>Secs</span>
                        </div>
                      )}
                    </div>
                  )}

                  {ctaText && <button style={buttonStyle}>{ctaText}</button>}
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
            <Text variant="bodySm" as="p" color="subdued">
              💡 <strong>Preview Tip:</strong> {type === "shipping" 
                ? "The progress bar animates through different cart values. In production, it will sync with the actual cart value." 
                : "This is how your bar will appear on your storefront. Colors, text, and spacing will match this preview exactly."}
            </Text>
          </div>
        </LegacyStack>
      </div>
    </Card>
  );
}

BarPreview.propTypes = {
  formData: PropTypes.shape({
    type: PropTypes.string,
    message: PropTypes.string,
    ctaText: PropTypes.string,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.number,
    position: PropTypes.string,
    timerType: PropTypes.string,
    timerEndDate: PropTypes.string,
    timerDailyTime: PropTypes.string,
    timerDuration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    timerFormat: PropTypes.string,
    shippingThreshold: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shippingCurrency: PropTypes.string,
    shippingGoalText: PropTypes.string,
    shippingReachedText: PropTypes.string,
    shippingProgressColor: PropTypes.string,
    shippingShowIcon: PropTypes.bool,
    fontFamily: PropTypes.string,
    fontWeight: PropTypes.string,
    textAlign: PropTypes.string,
    paddingTop: PropTypes.number,
    paddingBottom: PropTypes.number,
    paddingLeft: PropTypes.number,
    paddingRight: PropTypes.number,
    borderColor: PropTypes.string,
    borderWidth: PropTypes.number,
    borderRadius: PropTypes.number,
    buttonBgColor: PropTypes.string,
    buttonTextColor: PropTypes.string,
    buttonBorder: PropTypes.string,
    shadowStyle: PropTypes.string,
  }).isRequired,
};
