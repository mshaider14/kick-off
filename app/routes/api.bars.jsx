import { authenticate } from "../shopify.server";
import db from "../db.server";

function json(data, init) {
  return Response.json(data, init);
}

// Validation function
function validateBarData(data) {
  const errors = {};

  // Required fields
  if (!data.message || typeof data.message !== "string" || data.message.trim() === "") {
    errors.message = "Message is required and must be a non-empty string";
  }

  // Type validation
  if (!data.type || !["announcement", "countdown", "shipping"].includes(data.type)) {
    errors.type = "Invalid bar type. Must be: announcement, countdown, or shipping";
  }

  // CTA validation
  if (data.ctaText && !data.ctaLink) {
    errors.ctaLink = "Link URL is required when button text is provided";
  }

  // Color validation
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (data.backgroundColor && !hexColorRegex.test(data.backgroundColor)) {
    errors.backgroundColor = "Background color must be a valid hex color (e.g., #288d40)";
  }
  if (data.textColor && !hexColorRegex.test(data.textColor)) {
    errors.textColor = "Text color must be a valid hex color (e.g., #ffffff)";
  }

  // Font size validation
  if (data.fontSize !== undefined) {
    const size = parseInt(data.fontSize, 10);
    if (isNaN(size) || size < 10 || size > 24) {
      errors.fontSize = "Font size must be a number between 10 and 24";
    }
  }

  // Position validation
  if (data.position && !["top", "bottom"].includes(data.position)) {
    errors.position = "Position must be either 'top' or 'bottom'";
  }

  // Date validation
  if (data.startDate) {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      errors.startDate = "Invalid start date format";
    }
  }

  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      errors.endDate = "Invalid end date format";
    }

    if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (endDate <= startDate) {
        errors.endDate = "End date must be after start date";
      }
    }
  }

  return errors;
}

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // GET /api/bars - List all bars for the shop
    const bars = await db.bar.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
    });

    return json({ success: true, bars });
  } catch (error) {
    console.error("API GET error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    if (request.method !== "POST") {
      return json({ success: false, error: "Method not allowed" }, { status: 405 });
    }

    // Parse request body
    const body = await request.json();

    // Prepare bar data with defaults
    const barData = {
      type: body.type || "announcement",
      message: body.message || "",
      ctaText: body.ctaText || null,
      ctaLink: body.ctaLink || null,
      backgroundColor: body.backgroundColor || "#288d40",
      textColor: body.textColor || "#ffffff",
      fontSize: body.fontSize ? parseInt(body.fontSize, 10) : 14,
      position: body.position || "top",
      isActive: body.isActive === true || body.isActive === "true",
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    };

    // Validate bar data
    const errors = validateBarData(barData);
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
      message: "Bar created successfully",
    });
  } catch (error) {
    console.error("API POST error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};
