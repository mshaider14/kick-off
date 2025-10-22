# Analytics Testing Guide

## Quick Start Testing

### Prerequisites
1. Kick-Off app installed in Shopify store
2. Database migration applied
3. At least one active bar configured
4. Storefront with bar visible

## Testing Steps

### 1. Database Migration ✅

```bash
cd /home/runner/work/kick-off/kick-off
npx prisma migrate deploy
npx prisma generate
```

**Expected Result:** Migration runs successfully, BarView and BarClick tables created.

**Verify:**
```bash
npx prisma studio
# Check that BarView and BarClick tables exist
```

### 2. Build & Deploy ✅

```bash
npm run build
npm run deploy
```

**Expected Result:** Build completes without errors.

**Check for:**
- No TypeScript errors
- No linting errors
- All analytics routes compiled

### 3. Test Analytics Dashboard (Admin)

#### Access Dashboard
1. Open Shopify admin
2. Navigate to Apps → Kick-Off
3. Click "Analytics" in navigation

**Expected Result:** Dashboard loads without errors.

#### Date Range Selector
1. Click date range button
2. Select custom start and end dates
3. Click outside or press Enter

**Expected Result:** 
- Calendar picker opens
- Dates can be selected
- Dashboard updates with new data

#### Overview Cards
**Check these metrics:**
- Total Views (number, formatted with commas)
- Total Clicks (number, formatted with commas)
- Click-Through Rate (percentage with 2 decimals)
- Conversion Rate (shows 0% with "Coming soon")

**Expected Result:** All cards display numbers correctly.

#### Bar Performance Table
**Verify table shows:**
- Column headers: Bar Name, Type, Views, Clicks, CTR, Status
- One row per bar
- Active/Inactive badges with correct colors
- CTR formatted as percentage (e.g., "8.50%")

**Expected Result:** Table displays all bars with accurate data.

#### Views Over Time Chart
**Check chart displays:**
- Bar chart with daily view counts
- Scaled bars (taller = more views)
- Date labels below bars (e.g., "Oct 15")
- View count labels on bars (if bar tall enough)

**Expected Result:** Chart renders without errors, shows daily breakdown.

#### CSV Export
1. Click "Export CSV" button
2. Check downloaded file

**Expected Result:**
- File downloads as `analytics-{date-range}.csv`
- Opens in Excel/Google Sheets
- Contains all table data
- Headers: Bar Name, Type, Status, Views, Clicks, CTR (%)

### 4. Test Storefront Tracking

#### View Tracking (Impression)

**Test Steps:**
1. Open your storefront in incognito/private window
2. Navigate to a page where bar should appear
3. Open browser developer console
4. Look for bar display

**Expected Result:**
- Bar displays on page
- Console shows no errors
- Network tab shows POST to `/apps/countdown/analytics/track-view`
- Request body includes: `{ shop, barId }`
- Response: `{ success: true }`

**Verify in Database:**
```bash
npx prisma studio
# Check BarView table
# Should have new entry with:
# - barId matching your bar
# - shop matching your store
# - timestamp of view
```

#### Click Tracking

**Test Steps:**
1. Ensure bar has a CTA button
2. Click the CTA button
3. Check browser console and network tab

**Expected Result:**
- Network tab shows POST to `/apps/countdown/analytics/track-click`
- Request body includes: `{ shop, barId, ctaLink }`
- Response: `{ success: true }`
- Browser navigates to CTA link

**Verify in Database:**
```bash
npx prisma studio
# Check BarClick table
# Should have new entry with:
# - barId matching your bar
# - shop matching your store
# - ctaLink matching button URL
# - timestamp of click
```

#### Test Multiple Bars

**Test Steps:**
1. Create 3 different bars
2. Activate them one at a time
3. View each bar on storefront
4. Click CTA on each bar (if applicable)

**Expected Result:**
- Each bar tracked independently
- Dashboard shows separate rows for each
- Metrics calculated correctly per bar

### 5. Test Date Filtering

**Test Steps:**
1. Set date range to last 7 days
2. Note the metrics
3. Change to last 30 days
4. Compare metrics

**Expected Result:**
- Metrics increase (more data in 30 days)
- Chart shows more days
- Table data updates
- No errors

### 6. Test Edge Cases

#### No Data Scenario
**Test Steps:**
1. Select future date range (e.g., next month)
2. Check dashboard

**Expected Result:**
- All metrics show 0
- Chart shows "No data available"
- Table shows "No bars found"
- No errors

#### Bar Without CTA
**Test Steps:**
1. Create announcement bar without CTA
2. View on storefront
3. Check dashboard

**Expected Result:**
- Views tracked
- Clicks = 0 (no CTA to click)
- CTR = 0.00%
- Dashboard shows bar in table

#### Inactive Bar
**Test Steps:**
1. Deactivate a bar
2. Check dashboard

**Expected Result:**
- Bar still appears in table
- Shows "Inactive" badge
- Historical metrics preserved
- No new views/clicks tracked

### 7. Test CTR Calculation

**Manual Verification:**

Example data:
- Bar A: 100 views, 5 clicks
- Expected CTR: 5.00%

Formula: `(clicks / views) × 100`

**Test Steps:**
1. Record views and clicks from table
2. Calculate CTR manually
3. Compare with dashboard

**Expected Result:** CTR matches manual calculation.

### 8. Performance Testing

#### Load Test
**Test Steps:**
1. Create 50 bars
2. Generate 10,000 view events
3. Open analytics dashboard
4. Change date ranges

**Expected Result:**
- Page loads in < 3 seconds
- No timeouts
- Smooth date range changes
- No browser lag

#### Network Test
**Test Steps:**
1. Open Network tab in dev tools
2. Load dashboard
3. Check API requests

**Expected Result:**
- Only 1 API call to `/api/analytics/data`
- Response time < 1 second
- Response size reasonable (< 100KB for typical data)

### 9. Browser Compatibility

Test in these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

**Expected Result:** Dashboard works identically in all browsers.

### 10. Error Handling

#### Network Error
**Test Steps:**
1. Disconnect internet
2. Try to load dashboard

**Expected Result:**
- Error message displays
- Page doesn't crash
- Retry button works when reconnected

#### Invalid Date Range
**Test Steps:**
1. Open browser console
2. Try: `fetch('/api/analytics/data?startDate=invalid&endDate=invalid')`

**Expected Result:**
- 400 Bad Request
- Clear error message

## Acceptance Criteria Checklist

### Dashboard UI ✓
- [ ] Dashboard loads without errors
- [ ] Date range selector is functional
- [ ] All 4 overview cards display correctly
- [ ] Bar performance table shows all bars
- [ ] Chart renders with proper scaling
- [ ] CSV export works
- [ ] Loading states work
- [ ] Error states work

### Backend API ✓
- [ ] `/api/analytics/data` returns correct data
- [ ] Date filtering works
- [ ] CTR calculated correctly
- [ ] Per-bar metrics accurate
- [ ] Chart data grouped by day
- [ ] Authentication required

### Storefront Tracking ✓
- [ ] View tracking fires on bar display
- [ ] Click tracking fires on CTA click
- [ ] Events include shop and barId
- [ ] Tracking doesn't block page load
- [ ] Works across all bar types
- [ ] CORS configured correctly

### Data Persistence ✓
- [ ] BarView records created
- [ ] BarClick records created
- [ ] Timestamps accurate
- [ ] Shop association correct
- [ ] Data persists after page refresh
- [ ] Old data retained correctly

### CSV Export ✓
- [ ] File downloads successfully
- [ ] Filename includes date range
- [ ] All columns present
- [ ] Data matches table
- [ ] Opens in Excel/Sheets
- [ ] Special characters handled

## Common Issues & Solutions

### Issue: Dashboard shows 0 for all metrics
**Solution:** 
- Check date range (may be in future)
- Verify bars were active during period
- Check database has data

### Issue: Tracking not working
**Solution:**
- Verify app proxy configured in Shopify
- Check CORS headers in response
- Ensure `shop` field in bar settings
- Check browser console for errors

### Issue: Wrong CTR calculation
**Solution:**
- Verify views > 0 (division by zero)
- Check both views and clicks counted
- Verify date range includes both events

### Issue: CSV export fails
**Solution:**
- Check popup blocker
- Verify data exists for date range
- Try different browser

### Issue: Chart not rendering
**Solution:**
- Check data.length > 0
- Verify date range has data
- Check console for React errors

## Performance Benchmarks

### Expected Performance
- Dashboard load: < 2 seconds
- Date range change: < 1 second
- CSV export: < 500ms
- API response: < 500ms
- Tracking request: < 100ms

### Database Query Performance
- 1,000 events: < 100ms
- 10,000 events: < 500ms
- 100,000 events: < 2 seconds

## Security Testing

### Test Authentication
**Test Steps:**
1. Open `/api/analytics/data` without auth
2. Try to access with invalid token

**Expected Result:**
- 401 Unauthorized
- Redirects to login

### Test Authorization
**Test Steps:**
1. Login as Shop A
2. Try to view Shop B's analytics

**Expected Result:**
- Only Shop A's data returned
- Shop B's data hidden

### Test Input Validation
**Test Steps:**
1. Send malformed date range
2. Send SQL injection attempts
3. Send XSS payloads

**Expected Result:**
- 400 Bad Request for invalid input
- Prisma prevents SQL injection
- React escapes XSS

## Regression Testing

After any changes, verify:
- [ ] Existing bars still work
- [ ] Dashboard still loads
- [ ] Tracking still fires
- [ ] Data still persists
- [ ] Export still works

## Sign-Off

### Developer Testing ✅
- [ ] All unit tests pass
- [ ] Build successful
- [ ] No linting errors
- [ ] Manual testing complete

### QA Testing
- [ ] Dashboard functionality verified
- [ ] Storefront tracking verified
- [ ] Edge cases tested
- [ ] Performance acceptable

### Product Owner Approval
- [ ] Requirements met
- [ ] User experience acceptable
- [ ] Ready for production

## Production Deployment

### Pre-Deploy Checklist
- [ ] Database migration prepared
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Team notified

### Deploy Steps
1. Run migration on production DB
2. Deploy app code
3. Deploy storefront extension
4. Clear CDN cache
5. Test in production
6. Monitor logs

### Post-Deploy Verification
- [ ] Dashboard accessible
- [ ] Tracking working
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Users notified

## Support

For issues:
1. Check browser console
2. Check server logs
3. Verify database migration
4. Review documentation
5. Contact development team

---

**Testing Status:** Ready for QA  
**Last Updated:** October 22, 2025  
**Version:** 1.0.0
