import { resetMonthlyViewCounts, cleanupOldViewUsage } from "../utils/viewUsageReset.server";

function json(data, init) {
  return Response.json(data, init);
}

/**
 * This endpoint should be called by a cron job (e.g., Vercel Cron Jobs)
 * at the start of each month to reset view counts
 * 
 * To secure this endpoint, you should add an authorization token check
 * Example: Authorization: Bearer YOUR_CRON_SECRET_TOKEN
 */
export const action = async ({ request }) => {
  try {
    // Check authorization header for security
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET_TOKEN;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting monthly view count reset...");

    // Reset view counts
    const resetResult = await resetMonthlyViewCounts();

    // Clean up old records
    const cleanupResult = await cleanupOldViewUsage();

    return json({
      success: true,
      message: "Monthly view counts reset successfully",
      ...resetResult,
      ...cleanupResult,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return json({
      success: false,
      error: error.message || "Failed to reset view counts"
    }, { status: 500 });
  }
};
