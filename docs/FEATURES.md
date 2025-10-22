# Kick-Off - Announcement Bar Features

## Overview
Kick-Off is a Shopify app for creating customizable announcement bars with advanced targeting and scheduling capabilities.

## Core Features

### 1. Bar Types
- **Announcement Bars** - Display messages, promotions, and CTAs
- **Countdown Timers** - Create urgency with fixed, daily recurring, or evergreen timers
- **Free Shipping Progress** - Dynamic progress bars showing cart value towards free shipping

### 2. Design Customization
- Color customization (background, text, buttons)
- Font family, weight, and size controls
- Text alignment options
- Custom padding and spacing
- Border styling (color, width, radius)
- Shadow effects (none, subtle, medium, strong)
- Button styling (colors, borders)
- Position control (top or bottom of page)

### 3. Targeting Rules ✨ NEW

#### Device Targeting
Control which devices display your bar:
- All devices (Desktop & Mobile)
- Desktop only
- Mobile only

Uses user agent detection to identify mobile devices and tablets.

#### Page Targeting
Choose where your bars appear:

**Predefined Options:**
- All pages
- Homepage only
- Product pages
- Collection pages
- Cart page

**Advanced Options:**
- **Specific URLs** - Define exact list of pages
  - Add multiple URLs with tag interface
  - Supports exact and prefix matching
  - Visual management with easy removal
  
- **URL Pattern Matching** - Dynamic targeting with patterns
  - **Contains** - Match URLs containing text (e.g., "sale")
  - **Starts with** - Match URL prefixes (e.g., "/collections")
  - **Ends with** - Match URL suffixes (e.g., ".html")
  - Live examples showing match behavior

#### Display Frequency
Control how often visitors see your bar:

- **Always** - Show on every page load (default)
- **Once per session** - Show once until browser closes
  - Uses sessionStorage
  - Resets when browser session ends
  
- **Once per visitor** - Show once and remember forever
  - Uses cookies with 365-day expiry
  - Persists across browser sessions
  - Only resets if visitor clears cookies

### 4. Scheduling
Set when bars should be active:
- Optional start date/time
- Optional end date/time
- Automatic activation and deactivation
- Duration calculator
- Timezone-aware scheduling

### 5. Templates
Quick start with pre-built templates:
- Free Shipping Promo
- Sale Announcement
- New Arrival
- Flash Sale Timer
- Daily Deal
- Limited Offer
- Standard Free Shipping
- Premium Threshold
- Minimal Theme

## Technical Implementation

### Database Schema
```prisma
model Bar {
  // Bar configuration
  id              String   @id @default(cuid())
  shop            String
  type            String   @default("announcement")
  message         String
  ctaText         String?
  ctaLink         String?
  
  // Design
  backgroundColor String   @default("#288d40")
  textColor       String   @default("#ffffff")
  fontSize        Int      @default(14)
  position        String   @default("top")
  
  // Scheduling
  isActive        Boolean  @default(false)
  startDate       DateTime?
  endDate         DateTime?
  
  // Targeting Rules
  targetDevices      String?  @default("both")
  targetPages        String?  @default("all")
  targetSpecificUrls String?  // JSON array
  targetUrlPattern   String?  // JSON object
  displayFrequency   String?  @default("always")
  
  // ... other fields
}
```

### Storefront Integration
The bar is rendered via a Shopify theme app extension:
- Fetches active bar configuration via API
- Validates targeting rules client-side
- Manages display frequency with browser storage
- Respects device and page targeting
- Handles countdown timers and shipping progress

### API Endpoints
- `GET /apps/countdown/settings?shop={shop}` - Fetch active bar configuration
- Includes all bar settings and targeting rules
- Returns 404 if no active bar or targeting rules don't match
- Cached for 60 seconds

## User Interface

### Step-by-Step Creation Flow
1. **Bar Type** - Select bar type and optional template
2. **Content** - Configure message, CTA, and type-specific settings
3. **Design** - Customize colors, fonts, spacing, and effects
4. **Targeting & Schedule** - Set targeting rules and scheduling

### Targeting Rules UI
- Intuitive dropdowns for device and page targeting
- Tag-based URL manager for specific URLs
- Pattern matcher with live examples
- Frequency selector with helpful descriptions
- Inline validation and error messages
- Context-aware help text

## Testing

### Validation Tests
Run automated targeting rules tests:
```bash
node docs/test-targeting-rules.js
```

Tests cover:
- ✅ Device targeting logic (all combinations)
- ✅ Page targeting (all page types)
- ✅ Specific URL matching
- ✅ URL pattern matching (contains, starts with, ends with)
- ✅ Display frequency tracking

### Manual Testing Checklist
See [TARGETING_RULES.md](./TARGETING_RULES.md) for comprehensive testing guide.

## Documentation

- **[TARGETING_RULES.md](./TARGETING_RULES.md)** - Complete targeting rules documentation
- **[test-targeting-rules.js](./test-targeting-rules.js)** - Automated validation tests
- **[test-validation.js](./test-validation.js)** - Form validation tests

## Best Practices

### Device Targeting
- Test on real mobile devices when possible
- Use browser dev tools to simulate mobile viewports
- Consider tablet users (detected as mobile)

### Page Targeting
- Use "All pages" for general announcements
- Target specific pages for promotions (e.g., product pages for product-specific offers)
- Use patterns for flexible targeting across similar pages
- Test URL patterns thoroughly to avoid unintended matches

### Display Frequency
- Use "Always" for critical information
- Use "Once per session" for non-intrusive notifications
- Use "Once per visitor" sparingly to avoid permanent dismissal
- Be aware of cookie consent requirements in your region

### Scheduling
- Schedule sales and promotions in advance
- Use end dates to automatically deactivate expired offers
- Test timezone handling with your target audience
- Combine with targeting rules for maximum control

### 6. Analytics Dashboard ✨ NEW

Track bar performance with comprehensive analytics:

#### Overview Metrics
- **Total Views** - Count of bar impressions
- **Total Clicks** - Number of CTA clicks
- **Click-Through Rate (CTR)** - Percentage of views resulting in clicks
- **Conversion Rate** - Coming soon for e-commerce tracking

#### Bar Performance Table
View detailed metrics for each bar:
- Views, clicks, and CTR per bar
- Active/inactive status indicators
- Bar type and name identification

#### Views Over Time Chart
- Visual chart showing daily view trends
- Helps identify peak engagement periods
- Updates dynamically with date range selection

#### Features
- **Date Range Selector** - Filter data by custom time periods
- **CSV Export** - Download analytics data for external analysis
- **Real-time Tracking** - Automatic tracking on storefront
- **Detailed Insights** - Per-bar performance metrics

See [ANALYTICS.md](./ANALYTICS.md) for complete analytics documentation.

## Future Enhancements

Potential features for future releases:
- Customer segment targeting (logged in vs guest)
- Geographic targeting (by country/region)
- Time-based targeting (day of week, time of day)
- Cart value targeting
- Traffic source targeting (organic, paid, direct)
- A/B testing capabilities
- Conversion tracking and revenue attribution
- Advanced analytics (engagement rate, time-to-click, heatmaps)

## Support

For issues or feature requests, please refer to the repository issues page.

## License

This project is built using the Shopify App Template for React Router.
