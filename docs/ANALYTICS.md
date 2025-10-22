# Analytics Dashboard - Basic Metrics

## Overview
The Analytics Dashboard provides comprehensive insights into the performance of your announcement bars, countdown timers, and free shipping bars. Track views, clicks, and engagement metrics to optimize your bar campaigns.

## Features

### 1. Date Range Selection
- Flexible date range picker
- Quick access to common date ranges
- Filter analytics data by specific time periods
- Visual calendar interface for easy selection

### 2. Overview Metrics Cards

#### Total Views (Impressions)
- Count of how many times bars were displayed to visitors
- Tracks each unique page load where a bar was shown
- Includes all bar types (announcement, countdown, shipping)

#### Total Clicks
- Number of times visitors clicked on bar CTAs
- Only tracks clicks on bars with CTA buttons
- Excludes close button clicks

#### Click-Through Rate (CTR)
- Percentage of views that resulted in clicks
- Formula: `(Total Clicks / Total Views) × 100`
- Key performance indicator for bar effectiveness
- Higher CTR indicates more engaging content

#### Conversion Rate
- Placeholder for future e-commerce conversion tracking
- Will track cart additions and checkout completions
- Coming soon in future updates

### 3. Bar Performance Table

View detailed metrics for each bar:
- **Bar Name** - Message or bar type identifier
- **Type** - Bar type (announcement, countdown, shipping)
- **Views** - Number of impressions for this specific bar
- **Clicks** - Number of CTA clicks for this bar
- **CTR** - Click-through rate for this bar
- **Status** - Active or inactive badge

### 4. Views Over Time Chart
- Visual line/bar chart showing view trends
- Daily breakdown of impressions
- Helps identify peak engagement periods
- Updates dynamically with date range selection

### 5. CSV Export
- Export all analytics data to CSV format
- Includes all metrics from the bar performance table
- File name includes date range for easy organization
- Use for external analysis or reporting

## Technical Implementation

### Database Schema

```prisma
model BarView {
  id        String   @id @default(cuid())
  barId     String
  bar       Bar      @relation(fields: [barId], references: [id], onDelete: Cascade)
  shop      String
  timestamp DateTime @default(now())
  userAgent String?
  
  @@index([barId])
  @@index([shop])
  @@index([timestamp])
  @@index([shop, timestamp])
}

model BarClick {
  id        String   @id @default(cuid())
  barId     String
  bar       Bar      @relation(fields: [barId], references: [id], onDelete: Cascade)
  shop      String
  ctaLink   String?
  timestamp DateTime @default(now())
  userAgent String?
  
  @@index([barId])
  @@index([shop])
  @@index([timestamp])
  @@index([shop, timestamp])
}
```

### API Endpoints

#### Admin API (Authentication Required)

**GET /api/analytics/data**
- Fetches aggregated analytics data
- Query parameters:
  - `startDate` (required) - ISO 8601 date string
  - `endDate` (required) - ISO 8601 date string
- Returns:
  ```json
  {
    "overview": {
      "totalViews": 1250,
      "totalClicks": 87,
      "ctr": 6.96,
      "conversionRate": 0
    },
    "barMetrics": [
      {
        "id": "bar-id",
        "name": "Free Shipping Promo",
        "type": "announcement",
        "isActive": true,
        "views": 500,
        "clicks": 45,
        "ctr": 9.0
      }
    ],
    "chartData": [
      { "date": "2024-10-15", "views": 150 },
      { "date": "2024-10-16", "views": 200 }
    ]
  }
  ```

#### Storefront API (App Proxy - No Authentication)

**POST /apps/countdown/analytics/track-view**
- Tracks bar impressions from storefront
- Body:
  ```json
  {
    "shop": "store.myshopify.com",
    "barId": "bar-id"
  }
  ```
- Returns: `{ "success": true }`

**POST /apps/countdown/analytics/track-click**
- Tracks CTA clicks from storefront
- Body:
  ```json
  {
    "shop": "store.myshopify.com",
    "barId": "bar-id",
    "ctaLink": "https://example.com/sale"
  }
  ```
- Returns: `{ "success": true }`

### Storefront Integration

The storefront script (`countdown-bar.js`) automatically tracks:

1. **View Tracking (Impression)**
   - Triggered when bar is displayed to visitor
   - Happens after targeting rules validation
   - Sent once per page load
   - Uses `keepalive: true` for reliability

2. **Click Tracking**
   - Triggered when visitor clicks CTA button
   - Includes the CTA link URL
   - Only tracked for bars with CTA buttons
   - Close button clicks are not tracked

Example tracking code:
```javascript
// Track analytics events
function trackEvent(eventType, settings, extraData = {}) {
  const proxyBase = '/apps/countdown';
  const endpoint = eventType === 'bar_impression' 
    ? `${proxyBase}/analytics/track-view`
    : `${proxyBase}/analytics/track-click`;

  const data = {
    shop: settings.shop || shop,
    barId: settings.id,
    ...extraData
  };

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    keepalive: true
  }).catch(err => {
    console.error('Analytics tracking error:', err);
  });
}
```

## Usage Guide

### Accessing the Analytics Dashboard
1. Navigate to the Kick-Off app in your Shopify admin
2. Click "Analytics" in the navigation menu
3. Dashboard loads with default date range (last 30 days)

### Selecting a Date Range
1. Click the date range button (shows current range)
2. Use the calendar picker to select start and end dates
3. Choose "Apply" or click outside to confirm
4. Dashboard updates with filtered data

### Interpreting Metrics

#### High CTR (>5%)
- Indicates engaging content and effective CTAs
- Consider using similar messaging in other bars
- Good alignment with visitor interests

#### Low CTR (<2%)
- May need to improve CTA clarity
- Test different button text or positioning
- Verify targeting rules are reaching intended audience

#### Views but No Clicks
- Bar may not have a CTA button (announcement only)
- CTA may not be compelling enough
- Consider A/B testing different CTAs

### Exporting Data
1. Select your desired date range
2. Click "Export CSV" button
3. File downloads as `analytics-{date-range}.csv`
4. Open in Excel, Google Sheets, or other tools

### Best Practices

#### Regular Monitoring
- Check analytics weekly for active campaigns
- Compare performance across different bar types
- Track trends over time to identify patterns

#### Optimization
- Test different messages and CTAs
- Compare performance by bar type
- Adjust targeting rules based on engagement data

#### Data-Driven Decisions
- Use CTR to evaluate effectiveness
- Identify high-performing bars for replication
- Pause or modify underperforming bars

## Performance Considerations

### Database Optimization
- Indexes on `barId`, `shop`, and `timestamp` for fast queries
- Date range queries are optimized for common ranges
- Cascade deletes ensure data cleanup when bars are removed

### API Rate Limits
- Analytics tracking uses app proxy (no auth required)
- Tracking is fire-and-forget (doesn't block page rendering)
- Failed tracking attempts are logged but don't affect user experience

### Data Retention
- Analytics data persists indefinitely by default
- Consider implementing data retention policies for compliance
- Future: Auto-archive old data for performance

## Future Enhancements

### Planned Features
- **Conversion Tracking** - Track cart additions and checkouts
- **Attribution** - Link sales to specific bars
- **A/B Testing** - Compare performance of different bar variants
- **Geographic Analytics** - Views and clicks by country/region
- **Device Analytics** - Performance breakdown by device type
- **Time-based Analytics** - Views by hour/day of week
- **Goal Tracking** - Set and monitor performance targets
- **Email Reports** - Scheduled analytics summaries
- **Real-time Dashboard** - Live view counts and clicks
- **Comparison Views** - Compare time periods side-by-side

### Advanced Metrics
- Engagement rate (views / unique visitors)
- Average time to click
- Click heatmaps for different bar positions
- Bounce rate correlation
- Revenue attribution

## Troubleshooting

### No Data Showing
- Ensure bars have been active during selected date range
- Verify storefront integration is working
- Check browser console for tracking errors
- Confirm database migration has been applied

### Tracking Not Working
- Verify app proxy is configured correctly
- Check that bar includes `shop` field in settings
- Ensure tracking endpoints are accessible
- Review server logs for errors

### Incorrect Metrics
- Verify date range timezone handling
- Check for duplicate tracking events
- Ensure bar IDs match between admin and storefront
- Review user agent filtering if implemented

## Support

For issues or questions:
1. Check server logs for error messages
2. Verify database schema is up to date
3. Test tracking in browser developer tools
4. Review app proxy configuration in Shopify admin

## Migration Guide

If upgrading from a version without analytics:

1. **Update Database Schema**
   ```bash
   npx prisma migrate deploy
   ```

2. **Verify API Endpoints**
   - Test `/api/analytics/data`
   - Test `/apps/countdown/analytics/track-view`
   - Test `/apps/countdown/analytics/track-click`

3. **Update Theme Extension**
   - Deploy updated `countdown-bar.js`
   - Verify tracking functions are present

4. **Test Tracking**
   - View a bar on storefront
   - Click CTA button
   - Check analytics dashboard for data

## Conclusion

The Analytics Dashboard provides essential insights into bar performance, helping you make data-driven decisions to improve engagement and conversions. Regular monitoring and optimization based on these metrics will maximize the effectiveness of your announcement bars.
