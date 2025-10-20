# Free Shipping Progress Bar - Test & Verification Guide

## Admin UI Testing

### 1. Bar Type Selection
- [ ] Navigate to "Create New Bar"
- [ ] Verify "Free Shipping Progress Bar" option is visible and enabled
- [ ] Select the free shipping bar type
- [ ] Verify it shows description: "Show a progress bar for free shipping threshold with dynamic cart value tracking"

### 2. Quick Start Templates
- [ ] After selecting shipping bar type, verify 3 templates are shown:
  - Standard Free Shipping ($50 threshold)
  - Premium Threshold ($75 threshold)
  - Minimal Theme ($35 threshold)
- [ ] Click each template and verify settings are applied correctly
- [ ] Verify toast notification appears: "✨ Template [name] applied!"

### 3. Configuration Form
- [ ] **Threshold Amount**
  - [ ] Enter threshold value (e.g., 50.00)
  - [ ] Verify error message if value is 0 or negative
  - [ ] Verify it accepts decimal values
  
- [ ] **Currency Selection**
  - [ ] Verify dropdown shows multiple currencies (USD, EUR, GBP, CAD, AUD, JPY, NZD, INR, SGD, HKD)
  - [ ] Select different currencies
  - [ ] Verify selected currency is reflected in preview

- [ ] **Progress Message (Before Threshold)**
  - [ ] Enter message with {amount} placeholder
  - [ ] Verify error if message is empty
  - [ ] Verify error if {amount} placeholder is missing
  - [ ] Verify character count (max 150)

- [ ] **Success Message (After Threshold)**
  - [ ] Enter success message
  - [ ] Verify error if message is empty
  - [ ] Verify character count (max 150)

- [ ] **Progress Bar Color**
  - [ ] Click color picker
  - [ ] Select different colors
  - [ ] Verify color is shown in preview

- [ ] **Show Shipping Icon**
  - [ ] Toggle checkbox on/off
  - [ ] Verify icon visibility changes in preview

### 4. Preview Functionality
- [ ] Verify preview shows animated progress bar
- [ ] Verify progress cycles through different cart values every 3 seconds
- [ ] Verify message updates with correct remaining amount
- [ ] Verify progress bar fills proportionally
- [ ] Verify success state shows when threshold is reached
- [ ] Verify progress text shows current/threshold amounts
- [ ] Verify icon appears/disappears based on toggle
- [ ] Verify preview tip changes for shipping bar type

### 5. Design Customization
- [ ] Select background color
- [ ] Select text color
- [ ] Adjust font size
- [ ] Select position (top/bottom)
- [ ] Verify all settings are reflected in preview
- [ ] Verify contrast warning appears if colors are too similar

### 6. Scheduling & Targeting
- [ ] Set start date (optional)
- [ ] Set end date (optional)
- [ ] Verify validation: end date must be after start date
- [ ] Verify validation: start date cannot be in past

### 7. Save & Publish
- [ ] Click "Save as Draft"
  - [ ] Verify bar is saved with isActive = false
  - [ ] Verify success message appears
  - [ ] Verify redirect to main list
  
- [ ] Click "Publish Bar"
  - [ ] Verify bar is saved with isActive = true
  - [ ] Verify other bars are deactivated
  - [ ] Verify success message appears
  - [ ] Verify redirect to main list

### 8. Bar List Display
- [ ] Verify free shipping bars show 🚚 icon
- [ ] Verify type displays as "Shipping"
- [ ] Verify name shows "Free Shipping Bar"
- [ ] Verify status badge shows correctly (Active/Draft)
- [ ] Verify actions menu works (Activate/Deactivate/Delete)

## Backend/API Testing

### 9. Database Schema
- [ ] Verify migration was created: `20251020141057_add_free_shipping_fields`
- [ ] Verify new columns exist in Bar table:
  - shippingThreshold (Float)
  - shippingCurrency (Text)
  - shippingGoalText (Text)
  - shippingReachedText (Text)
  - shippingProgressColor (Text)
  - shippingShowIcon (Boolean, default true)

### 10. API Endpoint (`/apps/countdown/settings`)
- [ ] Create active shipping bar
- [ ] Call API: `/apps/countdown/settings?shop={shop_domain}`
- [ ] Verify response includes:
  ```json
  {
    "success": true,
    "settings": {
      "id": "...",
      "type": "shipping",
      "barColor": "#...",
      "textColor": "#...",
      "barPosition": "top",
      "shippingThreshold": 50,
      "shippingCurrency": "USD",
      "shippingGoalText": "...",
      "shippingReachedText": "...",
      "shippingProgressColor": "#4ade80",
      "shippingShowIcon": true
    }
  }
  ```
- [ ] Verify validation errors for invalid configurations:
  - Missing threshold
  - Threshold <= 0
  - Missing goal text
  - Missing reached text

### 11. Data Validation
- [ ] Try saving bar without threshold → verify error
- [ ] Try saving bar with threshold = 0 → verify error
- [ ] Try saving bar without goal message → verify error
- [ ] Try saving bar without {amount} placeholder → verify error
- [ ] Try saving bar without success message → verify error
- [ ] Verify all validations work at each step

## Storefront Testing

### 12. Free Shipping Bar Display
- [ ] Install theme extension on test store
- [ ] Activate free shipping bar in admin
- [ ] Visit storefront
- [ ] Verify bar appears in correct position (top/bottom)
- [ ] Verify colors match configuration
- [ ] Verify icon appears if enabled
- [ ] Verify message displays correctly

### 13. Progress Bar Functionality
- [ ] Start with empty cart
- [ ] Verify progress bar is at 0%
- [ ] Verify message shows: "Add $50.00 more for free shipping!" (or configured amount)
- [ ] Add product to cart
- [ ] Verify progress bar updates automatically
- [ ] Verify message updates with new remaining amount
- [ ] Verify progress text shows: "$25.00 / $50.00" (example)

### 14. Threshold Achievement
- [ ] Add products until cart total reaches threshold
- [ ] Verify progress bar reaches 100%
- [ ] Verify success message displays
- [ ] Verify progress text hides
- [ ] Verify success animation plays

### 15. Cart Updates
- [ ] Update product quantity in cart
- [ ] Verify progress bar updates in real-time
- [ ] Remove product from cart
- [ ] Verify progress bar decreases
- [ ] Verify message reverts to goal state if below threshold

### 16. Multiple Currency Support
- [ ] Create bars with different currencies
- [ ] Verify correct currency symbol displays:
  - USD: $
  - EUR: €
  - GBP: £
  - CAD: CA$
  - AUD: A$
  - JPY: ¥
- [ ] Verify amounts format correctly

### 17. Close/Dismiss Functionality
- [ ] Click close button (X)
- [ ] Verify bar hides
- [ ] Refresh page
- [ ] Verify bar stays hidden (session storage)
- [ ] Open new browser tab/incognito
- [ ] Verify bar appears again

### 18. Responsive Design
- [ ] Test on desktop (1920px+)
- [ ] Test on tablet (768px-1024px)
- [ ] Test on mobile (320px-480px)
- [ ] Verify bar layout adapts correctly
- [ ] Verify text remains readable
- [ ] Verify progress bar remains functional

### 19. Browser Compatibility
- [ ] Test on Chrome/Edge
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Verify animations work
- [ ] Verify cart updates work

### 20. Schedule & Timing
- [ ] Set future start date
- [ ] Verify bar doesn't appear before start
- [ ] Wait for start time
- [ ] Verify bar appears
- [ ] Set end date
- [ ] Wait for end time
- [ ] Verify bar disappears

## Performance Testing

### 21. Load Time
- [ ] Verify bar appears within 1 second of page load
- [ ] Verify no layout shift when bar appears
- [ ] Verify smooth animations

### 22. Cart Sync
- [ ] Add multiple items quickly
- [ ] Verify progress updates don't lag
- [ ] Verify no duplicate API calls
- [ ] Verify retry logic works if API fails

## Edge Cases

### 23. Invalid Configurations
- [ ] Bar with no threshold → should not display
- [ ] Bar with negative threshold → should not display
- [ ] Bar with malformed messages → should not display
- [ ] Expired bar → should not display

### 24. Special Characters
- [ ] Use emoji in messages ✅
- [ ] Use special characters: &, <, >, "
- [ ] Verify proper escaping/rendering

### 25. Very Large/Small Values
- [ ] Test with threshold = 0.01
- [ ] Test with threshold = 9999.99
- [ ] Test with cart value > threshold * 2
- [ ] Verify no visual breaks

## Checklist Summary

Total Tests: 25 categories, ~150 individual checks

✅ All tests passing = Feature ready for production
⚠️ Some tests failing = Review and fix issues
❌ Many tests failing = Significant rework needed

## Notes for Developers

- Free shipping bars use cart.js API to get cart totals
- Progress updates via cart event listeners and fetch interceptor
- Session storage key format: `barClosed_{bar_id}`
- API endpoint: `/apps/countdown/settings?shop={shop}`
- Bar type identifier: `type: "shipping"`
- Default progress color: #4ade80 (green)
- Animation duration: 0.5s for progress, 0.6s for success pulse
