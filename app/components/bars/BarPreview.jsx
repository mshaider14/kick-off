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
  } = formData;

  const [countdownValues, setCountdownValues] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // Parse timer format
  let format = { showDays: true, showHours: true, showMinutes: true, showSeconds: true };
  if (timerFormat) {
    try {
      format = JSON.parse(timerFormat);
    } catch (e) {
      // Use defaults
    }
  }

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

  const barStyle = {
    backgroundColor,
    color: textColor,
    padding: "12px 20px",
    fontSize: `${fontSize}px`,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    minHeight: "50px",
    flexWrap: "wrap",
  };

  const buttonStyle = {
    backgroundColor: textColor,
    color: backgroundColor,
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: `${fontSize - 2}px`,
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
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
    fontSize: `${fontSize + 4}px`,
    fontWeight: "bold",
  };

  const timeLabelStyle = {
    fontSize: `${fontSize - 4}px`,
    opacity: 0.8,
  };

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
            </div>
          </div>

          <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: "8px" }}>
            This is how your bar will appear on your storefront.
          </Text>
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
  }).isRequired,
};
