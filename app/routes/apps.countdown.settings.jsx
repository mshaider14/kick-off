import db from "../db.server";

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json({ success: false, error: "Shop parameter required" }, { status: 400 });
    }

    // Find the most recently updated ACTIVE bar of ANY type.
    const bar = await db.bar.findFirst({
      where: { shop, isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!bar) {
      return json({ success: false, message: "No active bar found." });
    }

    // Check schedule with timezone awareness
    const now = new Date();
    if (bar.startDate) {
      const startDate = new Date(bar.startDate);
      if (now < startDate) {
        return json({ success: false, message: "Bar is not within its scheduled time." });
      }
    }
    if (bar.endDate) {
      const endDate = new Date(bar.endDate);
      if (now > endDate) {
        return json({ success: false, message: "Bar is not within its scheduled time." });
      }
    }
    
    // Validate countdown timer data for production
    if (bar.type === "countdown") {
      if (!bar.timerType) {
        console.error(`Bar ${bar.id} has invalid timer configuration`);
        return json({ success: false, message: "Invalid countdown configuration." });
      }
      
      // Additional validation based on timer type
      if (bar.timerType === "fixed" && !bar.timerEndDate) {
        return json({ success: false, message: "Invalid countdown configuration." });
      }
      if (bar.timerType === "daily" && !bar.timerDailyTime) {
        return json({ success: false, message: "Invalid countdown configuration." });
      }
      if (bar.timerType === "evergreen" && (!bar.timerDuration || bar.timerDuration <= 0)) {
        return json({ success: false, message: "Invalid countdown configuration." });
      }
    }

    // Validate free shipping data for production
    if (bar.type === "shipping") {
      if (!bar.shippingThreshold || bar.shippingThreshold <= 0) {
        console.error(`Bar ${bar.id} has invalid shipping threshold`);
        return json({ success: false, message: "Invalid shipping threshold." });
      }
      if (!bar.shippingGoalText || !bar.shippingReachedText) {
        console.error(`Bar ${bar.id} has missing shipping messages`);
        return json({ success: false, message: "Invalid shipping configuration." });
      }
    }

    // Format the settings to be sent to the storefront.
    const settings = {
      id: bar.id,
      shop: bar.shop,
      type: bar.type,
      barMessage: bar.message,
      buttonText: bar.ctaText,
      buttonLink: bar.ctaLink,
      // Multi-message rotation fields
      messages: bar.messages,
      rotationSpeed: bar.rotationSpeed,
      transitionType: bar.transitionType,
      barColor: bar.backgroundColor,
      textColor: bar.textColor,
      barPosition: bar.position,
      // Advanced design settings
      fontFamily: bar.fontFamily,
      fontWeight: bar.fontWeight,
      textAlign: bar.textAlign,
      fontSize: bar.fontSize,
      paddingTop: bar.paddingTop,
      paddingBottom: bar.paddingBottom,
      paddingLeft: bar.paddingLeft,
      paddingRight: bar.paddingRight,
      borderColor: bar.borderColor,
      borderWidth: bar.borderWidth,
      borderRadius: bar.borderRadius,
      buttonBgColor: bar.buttonBgColor,
      buttonTextColor: bar.buttonTextColor,
      buttonBorder: bar.buttonBorder,
      shadowStyle: bar.shadowStyle,
      // Targeting rules settings
      targetDevices: bar.targetDevices || "both",
      targetPages: bar.targetPages || "all",
      targetSpecificUrls: bar.targetSpecificUrls,
      targetUrlPattern: bar.targetUrlPattern,
      displayFrequency: bar.displayFrequency || "always",
      // Conditionally add timer settings ONLY if it's a countdown bar
      ...(bar.type === "countdown" && {
        timerType: bar.timerType,
        timerEndDate: bar.timerEndDate ? bar.timerEndDate.toISOString() : null,
        timerDailyTime: bar.timerDailyTime,
        timerDuration: bar.timerDuration,
        timerFormat: bar.timerFormat ? JSON.parse(bar.timerFormat) : {},
        timerEndAction: bar.timerEndAction,
        timerEndMessage: bar.timerEndMessage,
      }),
      // Conditionally add shipping settings ONLY if it's a shipping bar
      ...(bar.type === "shipping" && {
        shippingThreshold: bar.shippingThreshold,
        shippingCurrency: bar.shippingCurrency || "USD",
        shippingGoalText: bar.shippingGoalText,
        shippingReachedText: bar.shippingReachedText,
        shippingProgressColor: bar.shippingProgressColor || "#4ade80",
        shippingShowIcon: bar.shippingShowIcon !== false,
      }),
      // Conditionally add email settings ONLY if it's an email bar
      ...(bar.type === "email" && {
        emailPlaceholder: bar.emailPlaceholder || "Enter your email",
        namePlaceholder: bar.namePlaceholder || "Your name (optional)",
        nameFieldEnabled: bar.nameFieldEnabled || false,
        submitButtonText: bar.submitButtonText,
        successMessage: bar.successMessage,
        discountCode: bar.discountCode || null,
        privacyCheckboxEnabled: bar.privacyCheckboxEnabled || false,
        privacyCheckboxText: bar.privacyCheckboxText || "I agree to receive marketing emails",
      }),
    };

    return json({ success: true, settings }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    console.error("Proxy settings error:", e);
    return json({ success: false, error: e.message }, { status: 500 });
  }
};