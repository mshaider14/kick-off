import db from "../db.server";

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

/**
 * POST /api/bars/email-submit
 * 
 * Submit email for email capture bar
 * 
 * Body Parameters:
 * - shop (required): The shop domain
 * - barId (required): The bar ID
 * - email (required): Email address
 * - name (optional): Visitor name
 * - userAgent (optional): User agent string
 * 
 * Returns:
 * {
 *   success: boolean,
 *   message: string,
 *   discountCode?: string,
 *   error?: string
 * }
 */
export const action = async ({ request }) => {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { shop, barId, email, name, userAgent } = body;

    // Validate required fields
    if (!shop || !barId || !email) {
      return json(
        { success: false, error: "Missing required fields: shop, barId, email" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if bar exists and is active
    const bar = await db.bar.findFirst({
      where: { id: barId, shop, isActive: true, type: "email" },
    });

    if (!bar) {
      return json(
        { success: false, error: "Bar not found or inactive" },
        { status: 404 }
      );
    }

    // Check for duplicate email submission for this bar and shop
    const existingSubmission = await db.emailSubmission.findFirst({
      where: {
        barId,
        shop,
        email: email.toLowerCase(),
      },
    });

    if (existingSubmission) {
      return json(
        { success: false, error: "Email already submitted" },
        { status: 409 }
      );
    }

    // Store email submission
    await db.emailSubmission.create({
      data: {
        barId,
        shop,
        email: email.toLowerCase(),
        name: name || null,
        userAgent: userAgent || null,
      },
    });

    // Return success with discount code if available
    const response = {
      success: true,
      message: bar.successMessage || "Thank you for subscribing!",
    };

    if (bar.discountCode) {
      response.discountCode = bar.discountCode;
    }

    return json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Email submission error:", error);
    return json(
      { success: false, error: "Failed to submit email" },
      { status: 500 }
    );
  }
};

// Handle CORS preflight
export const OPTIONS = () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
