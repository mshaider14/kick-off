# Countdown Timer Testing Guide

## Prerequisites
- Database migration must be applied: `20251017130000_add_countdown_timer_fields`
- App must be running with proper Shopify authentication
- App Proxy should be configured with path `/apps/countdown`

## Test Scenarios

### 1. Timer Type Selection
**Steps:**
1. Navigate to "Create Bar"
2. Select "Countdown Timer" as bar type
3. Proceed to configuration step

**Expected:**
- ✅ Countdown Timer option is enabled (not grayed out)
- ✅ Countdown Timer can be selected
- ✅ Configuration step shows CountdownConfiguration component

### 2. Fixed Timer Configuration
**Steps:**
1. Select "Fixed Date/Time" timer type
2. Set end date to 2 days from now at 14:00
3. Keep all time units enabled
4. Select "Hide the bar" end action
5. View preview

**Expected:**
- ✅ Date/time picker appears and accepts future dates
- ✅ Past dates are rejected with validation error
- ✅ Preview shows countdown with approximately 2 days remaining
- ✅ Countdown updates every second
- ✅ All time units (days, hours, minutes, seconds) are visible

### 3. Daily Recurring Timer Configuration
**Steps:**
1. Select "Daily Recurring" timer type
2. Set daily reset time to 23:59 (11:59 PM)
3. Select time units to show (e.g., only hours, minutes, seconds)
4. Select "Show a custom message" end action
5. Enter custom message: "Come back tomorrow for new deals!"

**Expected:**
- ✅ Time picker appears (24-hour format)
- ✅ Preview shows countdown to tonight at 23:59
- ✅ Only selected time units are visible in preview
- ✅ Custom message field is required and accepts text

### 4. Evergreen Timer Configuration
**Steps:**
1. Select "Evergreen" timer type
2. Set duration to 60 minutes
3. Toggle format to hide days and hours
4. Select "Hide the bar" end action

**Expected:**
- ✅ Duration field accepts positive integers only
- ✅ Zero or negative values are rejected
- ✅ Preview shows ~60 minutes countdown
- ✅ Only minutes and seconds are visible in preview

### 5. Timer Format Customization
**Steps:**
1. Create a fixed timer
2. Uncheck "Days" checkbox
3. Uncheck "Seconds" checkbox
4. Keep "Hours" and "Minutes" checked

**Expected:**
- ✅ Preview immediately updates to hide days and seconds
- ✅ Only hours and minutes are displayed
- ✅ Separators between units adjust correctly

### 6. Validation Testing
**Test Case A: Missing Required Fields**
1. Select Fixed timer type
2. Leave end date empty
3. Try to proceed to next step

**Expected:** ✅ Validation error: "End date and time is required"

**Test Case B: Invalid End Date**
1. Select Fixed timer type
2. Set end date to yesterday
3. Try to proceed

**Expected:** ✅ Validation error: "End date must be in the future"

**Test Case C: Missing Custom Message**
1. Configure any timer type
2. Select "Show a custom message" end action
3. Leave message field empty
4. Try to save

**Expected:** ✅ Validation error: "End message is required"

### 7. Form Submission & Persistence
**Steps:**
1. Configure a countdown bar with all fields filled
2. Add message: "Flash Sale Ends Soon!"
3. Add CTA button: "Shop Now" → "/collections/sale"
4. Set colors and design
5. Click "Publish Bar"

**Expected:**
- ✅ Form submits successfully
- ✅ Success toast appears
- ✅ Redirects to bars list
- ✅ New bar appears in list with type "Countdown"
- ✅ Bar status shows as "Active"

### 8. Storefront Display - Fixed Timer
**Steps:**
1. Create and publish a fixed timer bar
2. Open storefront in browser
3. Add countdown bar liquid block to theme
4. View page

**Expected:**
- ✅ Bar appears at configured position (top/bottom)
- ✅ Countdown displays correct remaining time
- ✅ Timer updates every second
- ✅ Colors and styling match configuration
- ✅ CTA button appears if configured

### 9. Storefront Display - Daily Recurring
**Steps:**
1. Create daily recurring timer set to reset at 00:00 (midnight)
2. Publish and view on storefront at 23:30 (11:30 PM)

**Expected:**
- ✅ Timer shows approximately 30 minutes remaining
- ✅ Timer continues counting down
- ✅ After midnight, timer resets to 24 hours

### 10. Storefront Display - Evergreen
**Steps:**
1. Create evergreen timer with 30-minute duration
2. Publish bar
3. Open storefront in incognito/private browsing
4. Note the time remaining
5. Refresh page multiple times
6. Close browser and reopen in new incognito window

**Expected:**
- ✅ Timer starts at 30 minutes on first view
- ✅ Timer persists across page refreshes (uses localStorage)
- ✅ New incognito session starts fresh 30-minute countdown
- ✅ Different browser/device gets its own countdown

### 11. End Action - Hide Bar
**Steps:**
1. Create fixed timer ending in 2 minutes
2. Set end action to "Hide the bar"
3. Publish and view on storefront
4. Wait for countdown to reach zero

**Expected:**
- ✅ Bar is visible during countdown
- ✅ When timer reaches 00:00:00, bar disappears completely
- ✅ Bar remains hidden on page refresh

### 12. End Action - Show Custom Message
**Steps:**
1. Create fixed timer ending in 2 minutes
2. Set end action to "Show a custom message"
3. Set message: "Thanks for shopping! Sale has ended."
4. Publish and view on storefront
5. Wait for countdown to reach zero

**Expected:**
- ✅ During countdown, timer is visible
- ✅ When timer reaches zero, timer disappears
- ✅ Custom message appears in place of timer
- ✅ Bar remains visible with message
- ✅ CTA button still works if configured

### 13. Schedule Integration
**Steps:**
1. Create countdown bar with fixed timer
2. Set start date to tomorrow
3. Publish bar
4. Check storefront today

**Expected:**
- ✅ Bar does not appear before start date
- ✅ Bar appears after start date
- ✅ Countdown functions normally after start date

### 14. Close Button Functionality
**Steps:**
1. View countdown bar on storefront
2. Click close button (X)
3. Refresh page

**Expected:**
- ✅ Bar disappears when close button is clicked
- ✅ Bar remains hidden on page refresh (sessionStorage)
- ✅ Bar reappears in new browser session

### 15. Multiple Bar Types Coexistence
**Steps:**
1. Create and publish an announcement bar
2. Create and publish a countdown timer bar
3. Ensure only one is active at a time

**Expected:**
- ✅ Announcement bars work as before
- ✅ Countdown bars display timer correctly
- ✅ Type selection works correctly for both
- ✅ Configuration screens are appropriate for each type

## API Endpoint Testing

### Test API Response
**Request:**
```bash
curl 'http://your-app-url/apps/countdown/settings?shop=your-shop.myshopify.com'
```

**Expected Response:**
```json
{
  "success": true,
  "settings": {
    "barMessage": "Flash Sale Ends Soon!",
    "buttonText": "Shop Now",
    "buttonLink": "/collections/sale",
    "barColor": "#288d40",
    "barPosition": "top",
    "timerType": "fixed",
    "timerEndDate": "2025-10-20T14:00:00.000Z",
    "timerDailyTime": null,
    "timerDuration": null,
    "timerFormat": {
      "showDays": true,
      "showHours": true,
      "showMinutes": true,
      "showSeconds": true
    },
    "timerEndAction": "hide",
    "timerEndMessage": null
  }
}
```

## Performance Testing

### Page Load Impact
- ✅ Countdown bar loads without blocking page render
- ✅ JavaScript execution is minimal (~5-10ms)
- ✅ No memory leaks from interval timers

### Timer Accuracy
- ✅ Timer updates consistently every second
- ✅ No drift over extended periods
- ✅ Proper cleanup on page navigation

## Browser Compatibility
Test countdown functionality in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Edge Cases

### 1. No Active Countdown Bar
**Test:** Request storefront with no active countdown bars
**Expected:** Bar doesn't appear, no JavaScript errors

### 2. Invalid Timer Configuration
**Test:** Bar with missing timerType in database
**Expected:** Bar doesn't appear, warning logged to console

### 3. Expired Fixed Timer
**Test:** Fixed timer with end date in the past
**Expected:** Bar doesn't appear (filtered by API endpoint)

### 4. Invalid Daily Time Format
**Test:** Daily time set to invalid format (e.g., "25:00")
**Expected:** Validation prevents saving, or defaults to 00:00

### 5. Negative Evergreen Duration
**Test:** Try to set negative or zero duration
**Expected:** Validation error prevents submission

## Accessibility Testing
- ✅ Timer is readable with screen readers
- ✅ Countdown has appropriate ARIA labels
- ✅ Close button has aria-label="Close"
- ✅ Keyboard navigation works for close button

## Success Criteria Summary
All checkboxes (✅) in this document should be verified before considering the feature complete and ready for production deployment.
