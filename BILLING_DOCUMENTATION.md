# Billing & Plan Management Documentation

## Overview

This implementation provides a complete billing and plan management system for the Kick-off Shopify app, integrated with Shopify's Billing API.

## Plans & Features

### Free Plan ($0/month)
- 2,500 views/month
- Basic announcement bars
- Countdown timers
- Free shipping bars
- Email capture

### Starter Plan ($5.99/month)
- 15,000 views/month
- All Free features
- Advanced targeting
- Geo-targeting
- Priority support

### Pro Plan ($11.99/month)
- 100,000 views/month
- All Starter features
- Multi-message rotation
- Advanced analytics
- Custom scheduling

### Scale Plan ($19.99/month)
- Unlimited views
- All Pro features
- White-label options
- Dedicated support
- Custom integrations

## Architecture

### Database Models

#### Merchant
Stores merchant subscription information:
- `shop`: Shop domain (unique)
- `planName`: Current plan (free, starter, pro, scale)
- `planPrice`: Monthly price
- `chargeId`: Shopify recurring charge ID
- `chargeStatus`: Charge status (pending, active, declined, cancelled)
- `billingActivated`: Whether billing is active
- `currentPeriodEnd`: End date of current billing period

#### ViewUsage
Tracks monthly view usage per merchant:
- `shop`: Shop domain
- `month`: Month in YYYY-MM format
- `viewCount`: Number of views this month
- `lastResetAt`: When the count was last reset

#### BillingHistory
Records billing transactions:
- `shop`: Shop domain
- `chargeId`: Shopify charge ID
- `planName`: Plan name at time of charge
- `amount`: Charge amount
- `status`: Transaction status
- `billingOn`, `activatedOn`, `cancelledOn`: Timestamps

### API Routes

#### `/api/billing/create` (POST)
Creates a new recurring charge for a plan upgrade.

**Request:**
```
POST /api/billing/create
FormData: { planName: 'starter' | 'pro' | 'scale' | 'free' }
```

**Response:**
```json
{
  "success": true,
  "confirmationUrl": "https://shop.myshopify.com/admin/charges/...",
  "chargeId": "gid://shopify/..."
}
```

#### `/api/billing/confirm` (GET)
Handles billing confirmation callback from Shopify.

**Query Params:**
- `charge_id`: Shopify charge ID
- `planName`: Plan name

#### `/api/billing/status` (GET)
Gets current plan and usage information.

**Response:**
```json
{
  "success": true,
  "merchant": {
    "shop": "example.myshopify.com",
    "planName": "starter",
    "planPrice": 5.99,
    "billingActivated": true,
    "currentPeriodEnd": "2025-12-07T00:00:00.000Z"
  },
  "plan": {
    "name": "Starter",
    "price": 5.99,
    "viewLimit": 15000,
    "features": [...]
  },
  "usage": {
    "viewCount": 1250,
    "viewLimit": 15000,
    "percentage": 8.33,
    "month": "2025-11"
  }
}
```

#### `/api/billing/history` (GET)
Gets billing transaction history.

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": "...",
      "shop": "example.myshopify.com",
      "chargeId": "gid://shopify/...",
      "planName": "starter",
      "amount": 5.99,
      "status": "active",
      "createdAt": "2025-11-01T00:00:00.000Z"
    }
  ]
}
```

#### `/api/cron/reset-views` (POST)
Resets monthly view counts (called by cron job).

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET_TOKEN
```

### View Limit Enforcement

The `/api/analytics/track-view` endpoint has been enhanced to:
1. Check the merchant's current plan
2. Get the current month's view usage
3. Verify if the view limit has been reached
4. Return error 429 if limit is reached
5. Increment view count atomically if within limit

### Monthly Reset

A cron job runs on the 1st of each month (configured in `vercel.json`):
```json
{
  "path": "/api/cron/reset-views",
  "schedule": "0 0 1 * *"
}
```

This:
- Creates new `ViewUsage` records for the new month
- Cleans up old usage data (>6 months)

### Frontend Components

#### `<UsageMeter />`
Displays current month's view usage with a progress bar and warnings when approaching limits.

#### `<CurrentPlanCard />`
Shows the merchant's current plan details, features, and next billing date.

#### `<PricingCard />`
Individual plan card with features, pricing, and upgrade button.

#### `<BillingHistoryCard />`
Table showing past billing transactions.

### Pricing Page (`/app/pricing`)

Main page that:
- Shows current plan and usage
- Displays all available plans
- Handles plan upgrades/downgrades
- Shows billing history

## Billing Flow

### Upgrade Flow
1. User clicks "Upgrade Now" on a plan card
2. App calls `/api/billing/create` with selected plan
3. Backend creates Shopify recurring charge
4. User is redirected to Shopify billing confirmation page
5. User approves/declines charge
6. Shopify redirects back to `/app/billing/confirm`
7. App verifies charge status and updates database
8. User is redirected to `/app/pricing` with success/error message

### Downgrade to Free
1. User clicks "Downgrade to Free"
2. App calls `/api/billing/create` with `planName: 'free'`
3. Backend updates merchant record directly (no charge needed)
4. Success message displayed

## Webhooks

### `app_subscriptions/update`
Handles subscription status changes:
- Subscription activated
- Subscription cancelled
- Subscription expired

Updates merchant record and billing history accordingly.

## Environment Variables

Add to your `.env` file:

```env
# Optional: Secure the cron endpoint
CRON_SECRET_TOKEN=your-random-secret-token
```

## Testing Checklist

- [ ] Pricing page displays all plans correctly
- [ ] Current plan shows with accurate information
- [ ] Usage meter displays view count and percentage
- [ ] Upgrade button redirects to Shopify billing
- [ ] Charge acceptance updates plan correctly
- [ ] Charge decline shows error message
- [ ] View limit enforcement works (429 error when exceeded)
- [ ] Free tier limited to 2,500 views
- [ ] Billing history shows past transactions
- [ ] Downgrade to free plan works
- [ ] Webhook updates subscription status

## Security Considerations

1. **CRON Endpoint**: The `/api/cron/reset-views` endpoint should be secured with a bearer token to prevent unauthorized access.

2. **Shopify Billing**: All charges are created with `test: true` in development. Remove this for production.

3. **View Limit**: Enforced server-side to prevent bypassing.

## Future Enhancements

- Annual billing option (discounted)
- Trial period support
- Overage pricing for Scale plan
- Email notifications for limit warnings
- Usage analytics dashboard
- Custom enterprise plans
