import db from "../db.server";
import { getCurrentMonthKey } from "./plans";

/**
 * Reset view counts for all merchants at the start of a new month
 * This should be called by a cron job or scheduled task
 */
export async function resetMonthlyViewCounts() {
  try {
    const currentMonth = getCurrentMonthKey();

    console.log(`Resetting view counts for month: ${currentMonth}`);

    // Get all merchants
    const merchants = await db.merchant.findMany({
      select: { shop: true }
    });

    // Create new ViewUsage records for the current month if they don't exist
    for (const merchant of merchants) {
      await db.viewUsage.upsert({
        where: {
          shop_month: {
            shop: merchant.shop,
            month: currentMonth,
          }
        },
        create: {
          shop: merchant.shop,
          month: currentMonth,
          viewCount: 0,
          lastResetAt: new Date(),
        },
        update: {
          // If it already exists for this month, just update the reset time
          lastResetAt: new Date(),
        }
      });
    }

    console.log(`Successfully reset view counts for ${merchants.length} merchants`);
    return { success: true, merchantsProcessed: merchants.length };
  } catch (error) {
    console.error("Error resetting monthly view counts:", error);
    throw error;
  }
}

/**
 * Clean up old view usage records (older than 6 months)
 * to keep the database lean
 */
export async function cleanupOldViewUsage() {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoffMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

    const deleted = await db.viewUsage.deleteMany({
      where: {
        month: {
          lt: cutoffMonth
        }
      }
    });

    console.log(`Cleaned up ${deleted.count} old view usage records`);
    return { success: true, deletedCount: deleted.count };
  } catch (error) {
    console.error("Error cleaning up old view usage:", error);
    throw error;
  }
}
