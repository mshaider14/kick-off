import { getPlanByName } from "./plans.js";

/**
 * Create a recurring application charge for a shop
 * @param {Object} admin - Shopify admin API client
 * @param {String} shop - Shop domain
 * @param {String} planName - Name of the plan to subscribe to
 * @param {String} returnUrl - URL to redirect after billing approval
 * @returns {Object} Charge object with confirmationUrl
 */
export async function createRecurringCharge(admin, shop, planName, returnUrl) {
  const plan = getPlanByName(planName);
  
  if (plan.price === 0) {
    throw new Error("Cannot create charge for free plan");
  }

  // Use test mode in development, production mode in production
  const isTestMode = process.env.NODE_ENV !== 'production';

  const response = await admin.graphql(
    `#graphql
      mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $lineItems: [AppSubscriptionLineItemInput!]!, $test: Boolean) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          lineItems: $lineItems
          test: $test
        ) {
          appSubscription {
            id
            name
            test
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        name: `${plan.name} Plan`,
        returnUrl: returnUrl,
        test: isTestMode,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: plan.price, currencyCode: "USD" },
                interval: "EVERY_30_DAYS"
              }
            }
          }
        ]
      }
    }
  );

  const data = await response.json();
  
  if (data.data.appSubscriptionCreate.userErrors?.length > 0) {
    throw new Error(data.data.appSubscriptionCreate.userErrors[0].message);
  }

  return {
    id: data.data.appSubscriptionCreate.appSubscription.id,
    confirmationUrl: data.data.appSubscriptionCreate.confirmationUrl,
    test: data.data.appSubscriptionCreate.appSubscription.test
  };
}

/**
 * Get the current active subscription for a shop
 * @param {Object} admin - Shopify admin API client
 * @returns {Object|null} Current subscription or null
 */
export async function getCurrentSubscription(admin) {
  const response = await admin.graphql(
    `#graphql
      query {
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
            test
            lineItems {
              id
              plan {
                pricingDetails {
                  ... on AppRecurringPricing {
                    price {
                      amount
                      currencyCode
                    }
                    interval
                  }
                }
              }
            }
            createdAt
            currentPeriodEnd
          }
        }
      }`
  );

  const data = await response.json();
  const subscriptions = data.data.currentAppInstallation?.activeSubscriptions || [];
  
  return subscriptions.length > 0 ? subscriptions[0] : null;
}

/**
 * Cancel the current subscription
 * @param {Object} admin - Shopify admin API client
 * @param {String} subscriptionId - ID of the subscription to cancel
 * @returns {Object} Cancellation result
 */
export async function cancelSubscription(admin, subscriptionId) {
  const response = await admin.graphql(
    `#graphql
      mutation AppSubscriptionCancel($id: ID!) {
        appSubscriptionCancel(id: $id) {
          appSubscription {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        id: subscriptionId
      }
    }
  );

  const data = await response.json();
  
  if (data.data.appSubscriptionCancel.userErrors?.length > 0) {
    throw new Error(data.data.appSubscriptionCancel.userErrors[0].message);
  }

  return data.data.appSubscriptionCancel.appSubscription;
}

/**
 * Extract plan name from subscription price
 * @param {Number} price - Price in dollars
 * @returns {String} Plan name
 */
export function getPlanNameFromPrice(price) {
  const priceNum = parseFloat(price);
  
  if (priceNum === 0) return 'free';
  if (priceNum === 5.99) return 'starter';
  if (priceNum === 11.99) return 'pro';
  if (priceNum === 19.99) return 'scale';
  
  return 'free';
}
