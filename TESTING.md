# Testing Guide - Kick-off Theme App Extension

This guide provides step-by-step instructions for testing all features of the Kick-off theme app extension.

## Prerequisites

1. Kick-off app installed on a Shopify development store
2. Theme app extension added to your theme (via Theme Customizer)
3. At least one active bar configured in the Kick-off app admin

## Test Scenarios

### 1. Theme Extension Installation

**Test:** Verify theme extension installs on store

**Steps:**
1. Go to Shopify Admin > Online Store > Themes
2. Click "Customize" on your active theme
3. In the theme editor, look for "Apps" section
4. Find "Countdown & CTA Bar" app block
5. Add it to your theme layout (e.g., header or body)
6. Save the theme

**Expected Result:** App block appears in theme customizer without errors

---

### 2. Active Bar Fetching

**Test:** Active bars fetch from API

**Steps:**
1. In Kick-off app admin, create a new bar and set it to "Active"
2. Visit your storefront
3. Open browser DevTools > Console
4. Look for log message: "BAR DATA RECEIVED:"
5. Check Network tab for API request to `/api/bars/active` or `/apps/countdown/settings`

**Expected Result:** 
- API request succeeds (200 status)
- Console shows bar data
- API response includes bar configuration

---

### 3. Page Targeting

**Test:** Bars display on correct pages

**Steps:**
1. Create a bar with "Target Pages" set to "Homepage only"
2. Visit homepage - bar should display
3. Visit a product page - bar should NOT display
4. Create another bar with "Target Pages" set to "Product pages"
5. Visit a product page - bar should display
6. Visit homepage - bar should NOT display

**Expected Result:** Bar only appears on targeted pages

**Test All Page Types:**
- [ ] All pages
- [ ] Homepage only
- [ ] Product pages only
- [ ] Collection pages only
- [ ] Cart page only
- [ ] Specific URLs
- [ ] URL pattern matching

---

### 4. Device Targeting

**Test:** Device targeting works on storefront

**Steps:**
1. Create a bar with "Target Devices" set to "Desktop only"
2. Visit storefront on desktop - bar should display
3. Visit storefront on mobile (or use responsive design mode) - bar should NOT display
4. Change bar to "Mobile only"
5. Visit on mobile - bar should display
6. Visit on desktop - bar should NOT display

**Expected Result:** Bar respects device targeting rules

**Device Tests:**
- [ ] Desktop only
- [ ] Mobile only  
- [ ] Both devices

---

### 5. Bar Rendering & Styling

**Test:** Bars render with correct styling

**Steps:**
1. Create bar with custom colors (background, text)
2. Set custom font size and padding
3. Visit storefront
4. Inspect bar element with DevTools
5. Verify applied styles match configuration

**Expected Result:** All custom styles are correctly applied

**Styling Tests:**
- [ ] Background color
- [ ] Text color
- [ ] Font size
- [ ] Font family
- [ ] Font weight
- [ ] Text alignment
- [ ] Padding (top, bottom, left, right)
- [ ] Border (color, width, radius)
- [ ] Shadow style
- [ ] Button colors (background, text)
- [ ] Position (top, bottom)

---

### 6. Animations

**Test:** Animations work smoothly

**Steps:**
1. Visit storefront (bar should be active)
2. Observe bar entrance animation
3. Click close button
4. Observe bar exit animation
5. Check DevTools Performance tab during animation

**Expected Result:** 
- Smooth slide-in animation from top/bottom
- Smooth fade-out on close
- No janky animations or dropped frames
- Animations use CSS transforms (hardware accelerated)

---

### 7. Close Button

**Test:** Close button hides bar

**Steps:**
1. Visit storefront with active bar
2. Click the close button (X icon)
3. Bar should disappear with animation
4. Refresh the page
5. Bar should remain hidden (session storage)
6. Open in incognito/private window
7. Bar should appear again

**Expected Result:** 
- Close button hides bar
- State persists in session
- New session shows bar again

---

### 8. Click Tracking

**Test:** Click tracking records clicks

**Steps:**
1. Create bar with CTA button (text + link)
2. Visit storefront
3. Open DevTools > Network tab
4. Click the CTA button
5. Look for POST request to `/apps/countdown/analytics/track-click`

**Expected Result:**
- Network request shows successful tracking (200 status)
- Click data appears in Kick-off analytics dashboard
- Request includes barId, shop, and ctaLink

---

### 9. View Tracking

**Test:** View tracking records views

**Steps:**
1. Create an active bar
2. Clear browser cache/storage
3. Visit storefront
4. Open DevTools > Network tab
5. Look for POST request to `/apps/countdown/analytics/track-view`

**Expected Result:**
- Network request shows successful tracking (200 status)
- View (impression) appears in analytics dashboard
- Request includes barId and shop

---

### 10. Multiple Bars Priority

**Test:** Multiple bars show with priority

**Steps:**
1. Create 3 active bars with different messages
2. Note the creation/update times (newest = highest priority)
3. Visit storefront
4. Only the newest bar should display
5. Close that bar
6. Refresh page
7. Next priority bar should display

**Expected Result:** 
- Only one bar displays at a time
- Newest bar has priority
- After closing, next bar appears on new session

---

### 11. Mobile Responsive Design

**Test:** Mobile responsive design works

**Steps:**
1. Visit storefront on mobile device (or use DevTools responsive mode)
2. Test various screen sizes (320px, 375px, 425px, 768px)
3. Verify bar text is readable
4. Verify buttons are tappable
5. Verify countdown timer fits properly
6. Verify progress bar is visible

**Expected Result:**
- Bar adapts to screen size
- Text wraps appropriately
- Buttons remain accessible
- No horizontal scrolling
- Touch targets are at least 44x44px

**Breakpoints to Test:**
- [ ] < 480px (extra small)
- [ ] 480px - 768px (mobile)
- [ ] 768px+ (tablet/desktop)

---

### 12. Countdown Timer

**Test:** Countdown timers count down live

**Steps:**
1. Create countdown bar with "Fixed" timer ending in 5 minutes
2. Visit storefront
3. Observe timer counting down in real-time
4. Verify days, hours, minutes, seconds update correctly
5. Wait for timer to reach zero
6. Verify end action (hide or show message)

**Expected Result:**
- Timer updates every second
- Time displays correctly
- End action triggers as configured

**Timer Types to Test:**
- [ ] Fixed timer (specific date/time)
- [ ] Daily recurring (resets each day)
- [ ] Evergreen (countdown per visitor)

**Timer Format Tests:**
- [ ] Show all units (days, hours, minutes, seconds)
- [ ] Hide days
- [ ] Hide seconds
- [ ] Custom combinations

---

### 13. Free Shipping Bar

**Test:** Free shipping bar updates with cart

**Steps:**
1. Create shipping bar with threshold (e.g., $50)
2. Visit storefront with empty cart
3. Observe initial message and progress bar
4. Add product to cart (value < threshold)
5. Observe progress bar update
6. Add more products to exceed threshold
7. Observe success message

**Expected Result:**
- Progress bar updates dynamically
- Message changes based on cart value
- Success state shows when threshold reached
- Calculations are accurate

**Shipping Bar Tests:**
- [ ] Progress bar fills correctly
- [ ] Message updates with cart changes
- [ ] Success state displays
- [ ] Icon shows/hides based on config
- [ ] Currency formats correctly

---

### 14. Layout Shift Prevention

**Test:** No layout shift on bar load

**Steps:**
1. Visit storefront
2. Open DevTools > Performance
3. Record page load
4. Look for Cumulative Layout Shift (CLS) metrics
5. Verify bar doesn't cause content jump

**Expected Result:**
- CLS score remains low (< 0.1)
- Bar appears smoothly without moving page content
- CSS containment prevents layout thrashing

---

### 15. Performance

**Test:** Performance is acceptable (<100ms render)

**Steps:**
1. Visit storefront
2. Open DevTools > Console
3. Look for performance log: "Bar rendered in Xms"
4. Verify render time is under 100ms
5. Test on slower network (throttle to 3G)
6. Test on low-end device (CPU throttling)

**Expected Result:**
- Render time < 100ms typical
- No significant performance degradation
- Bar loads quickly even on slow connections

**Performance Tests:**
- [ ] Initial load time
- [ ] Time to interactive
- [ ] Memory usage
- [ ] CPU usage during animations
- [ ] Network payload size

---

### 16. Display Frequency

**Test:** Frequency control works correctly

**Steps:**
1. Create bar with "Once per session" frequency
2. Visit storefront - bar displays
3. Close bar
4. Navigate to another page - bar should NOT display
5. Close browser and open new session
6. Visit storefront - bar displays again

**Expected Result:** Frequency rules are enforced correctly

**Frequency Tests:**
- [ ] Always (shows every page load)
- [ ] Once per session (shows once, hides on close until new session)
- [ ] Once per visitor (shows once, uses cookie for 365 days)

---

### 17. Schedule Validation

**Test:** Bar respects start/end dates

**Steps:**
1. Create bar with start date in future
2. Visit storefront - bar should NOT display
3. Change start date to past
4. Visit storefront - bar should display
5. Set end date to past
6. Visit storefront - bar should NOT display

**Expected Result:** Bars only display within scheduled timeframe

---

### 18. Error Handling

**Test:** Graceful error handling

**Steps:**
1. Disconnect from internet
2. Visit storefront
3. Bar should fail silently (no errors in console)
4. Reconnect internet
5. Refresh page
6. Bar should load normally

**Expected Result:**
- No JavaScript errors shown to user
- Graceful degradation when API fails
- Console logs errors for debugging

---

## Performance Benchmarks

| Metric | Target | Notes |
|--------|--------|-------|
| Render Time | < 100ms | From API fetch to display |
| API Response | < 500ms | Including database query |
| CLS Score | < 0.1 | No layout shift |
| Asset Size | < 50KB | CSS + JS combined |
| Time to Interactive | < 2s | On 3G connection |

---

## Browser Compatibility

Test on the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari (latest)
- [ ] Chrome Mobile (latest)

---

## Reporting Issues

When reporting issues, include:

1. Browser and version
2. Device type (desktop/mobile)
3. Screen size
4. Bar configuration (type, targeting, etc.)
5. Console errors (if any)
6. Network requests (screenshot)
7. Steps to reproduce

---

## Automation

For automated testing, consider:

1. **E2E Tests**: Playwright/Cypress for user flows
2. **Visual Regression**: Percy/Chromatic for UI changes
3. **Performance Tests**: Lighthouse CI for metrics
4. **API Tests**: Jest/Supertest for endpoint validation

---

## Sign-off Checklist

Before considering testing complete, verify:

- [ ] All 18 test scenarios passed
- [ ] All browsers tested
- [ ] Mobile and desktop tested
- [ ] Performance meets benchmarks
- [ ] No console errors
- [ ] Analytics tracking verified
- [ ] Documentation reviewed
- [ ] Edge cases handled
- [ ] Accessibility checked (keyboard navigation, screen readers)
- [ ] WCAG 2.1 AA compliance verified

---

## Notes

- Test on a development/staging store before production
- Use realistic test data (actual products, prices)
- Test with multiple bar configurations simultaneously
- Verify database records are created for analytics
- Check that cookies/localStorage work across domains
- Test theme compatibility with popular Shopify themes

---

## Support

For issues or questions:
1. Check the main README.md
2. Review browser console logs
3. Check Shopify app logs
4. Contact development team
