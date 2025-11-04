import db from "../db.server";

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

/**
 * GET /api/bars/active
 * 
 * Fetch active bars for a given shop, sorted by priority (1=highest).
 * Supports multiple bars for priority-based display on the storefront.
 * 
 * Query Parameters:
 * - shop (required): The shop domain (e.g., "mystore.myshopify.com")
 * - limit (optional): Maximum number of bars to return (default: 1)
 * 
 * Returns:
 * {
 *   success: boolean,
 *   bars: Array<Bar> | null,  // Sorted by priority ASC, then createdAt ASC
 *   message?: string
 * }
 */
export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    const limit = parseInt(url.searchParams.get("limit") || "1", 10);

    if (!shop) {
      return json({ success: false, error: "Shop parameter required" }, { status: 400 });
    }

    // Find active bars, ordered by priority (1=highest), then createdAt (oldest first for equal priority)
    const bars = await db.bar.findMany({
      where: { 
        shop, 
        isActive: true 
      },
      orderBy: [
        { priority: "asc" },  // Lower number = higher priority
        { createdAt: "asc" }  // Equal priority: show oldest first (creation order)
      ],
      take: limit,
    });

    if (!bars || bars.length === 0) {
      return json({ 
        success: false, 
        bars: null,
        message: "No active bars found." 
      });
    }

    // Filter bars based on schedule
    const now = new Date();
    const validBars = bars.filter(bar => {
      // If scheduleStartImmediate is true, bar should be active immediately
      if (bar.scheduleStartImmediate) {
        // Only check end date in this case
        if (bar.scheduleEndNever) {
          return true; // Runs indefinitely
        }
        if (bar.endDate) {
          const endDate = new Date(bar.endDate);
          if (now > endDate) {
            return false;
          }
        }
        return true;
      }
      
      // Check start date
      if (bar.startDate) {
        const startDate = new Date(bar.startDate);
        if (now < startDate) {
          return false;
        }
      } else {
        // No start date and not immediate start - shouldn't be shown
        return false;
      }
      
      // Check end date
      if (bar.scheduleEndNever) {
        return true; // Runs indefinitely
      }
      if (bar.endDate) {
        const endDate = new Date(bar.endDate);
        if (now > endDate) {
          return false;
        }
      }
      
      // Validate countdown timer configuration
      if (bar.type === "countdown") {
        if (!bar.timerType) return false;
        
        if (bar.timerType === "fixed" && !bar.timerEndDate) return false;
        if (bar.timerType === "daily" && !bar.timerDailyTime) return false;
        if (bar.timerType === "evergreen" && (!bar.timerDuration || bar.timerDuration <= 0)) return false;
      }
      
      // Validate shipping bar configuration
      if (bar.type === "shipping") {
        if (!bar.shippingThreshold || bar.shippingThreshold <= 0) return false;
        if (!bar.shippingGoalText || !bar.shippingReachedText) return false;
      }
      
      // Validate email capture bar configuration
      if (bar.type === "email") {
        if (!bar.submitButtonText) return false;
        if (!bar.successMessage) return false;
      }
      
      return true;
    });

    if (validBars.length === 0) {
      return json({ 
        success: false, 
        bars: null,
        message: "No valid active bars found for current time." 
      });
    }

    // Format bars for storefront consumption
    const formattedBars = validBars.map(bar => ({
      id: bar.id,
      shop: bar.shop,
      type: bar.type,
      message: bar.message,
      ctaText: bar.ctaText,
      ctaLink: bar.ctaLink,
      backgroundColor: bar.backgroundColor,
      textColor: bar.textColor,
      fontSize: bar.fontSize,
      position: bar.position,
      priority: bar.priority || 5, // Include priority for reference
      
      // Multi-message rotation fields
      messages: bar.messages,
      rotationSpeed: bar.rotationSpeed,
      transitionType: bar.transitionType,
      
      // Advanced design settings
      fontFamily: bar.fontFamily,
      fontWeight: bar.fontWeight,
      textAlign: bar.textAlign,
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
      
      // Targeting rules
      targetDevices: bar.targetDevices || "both",
      targetPages: bar.targetPages || "all",
      targetSpecificUrls: bar.targetSpecificUrls,
      targetUrlPattern: bar.targetUrlPattern,
      displayFrequency: bar.displayFrequency || "always",
      
      // Geo-targeting rules
      geoTargetingEnabled: bar.geoTargetingEnabled || false,
      geoTargetingMode: bar.geoTargetingMode || "all",
      geoTargetedCountries: bar.geoTargetedCountries,
      
      // Schedule information
      timezone: bar.timezone || "UTC",
      scheduleStartImmediate: bar.scheduleStartImmediate || false,
      scheduleEndNever: bar.scheduleEndNever || false,
      
      // Countdown timer settings (only for countdown bars)
      ...(bar.type === "countdown" && {
        timerType: bar.timerType,
        timerEndDate: bar.timerEndDate ? bar.timerEndDate.toISOString() : null,
        timerDailyTime: bar.timerDailyTime,
        timerDuration: bar.timerDuration,
        timerFormat: bar.timerFormat ? JSON.parse(bar.timerFormat) : {},
        timerEndAction: bar.timerEndAction,
        timerEndMessage: bar.timerEndMessage,
      }),
      
      // Shipping settings (only for shipping bars)
      ...(bar.type === "shipping" && {
        shippingThreshold: bar.shippingThreshold,
        shippingCurrency: bar.shippingCurrency || "USD",
        shippingGoalText: bar.shippingGoalText,
        shippingReachedText: bar.shippingReachedText,
        shippingProgressColor: bar.shippingProgressColor || "#4ade80",
        shippingShowIcon: bar.shippingShowIcon !== false,
      }),
      
      // Email capture settings (only for email bars)
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
      
      // Close button configuration
      closeButtonEnabled: bar.closeButtonEnabled ?? true, // Default to true
      closeButtonPosition: bar.closeButtonPosition || "right",
      dismissBehavior: bar.dismissBehavior || "session",
      closeIconStyle: bar.closeIconStyle || "x",
    }));

    return json({ 
      success: true, 
      bars: formattedBars 
    }, { 
      headers: { 
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*"
      } 
    });
  } catch (error) {
    console.error("API bars/active error:", error);
    return json({ 
      success: false, 
      bars: null,
      error: error.message 
    }, { status: 500 });
  }
};

// Handle CORS preflight
export const OPTIONS = () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
