# Targeting Rules - Example Usage Scenarios

## Scenario 1: Flash Sale on Mobile Devices

**Goal**: Show a flash sale announcement only to mobile users browsing product pages.

**Configuration**:
- Device Targeting: **Mobile only**
- Page Targeting: **Product pages**
- Display Frequency: **Always**

**Use Case**: Mobile shoppers browsing product pages see the flash sale bar encouraging immediate purchase.

**Expected Behavior**:
- ✅ Shows on mobile when viewing `/products/shoes`
- ✅ Shows on mobile when viewing `/products/jacket`
- ❌ Hidden on desktop (any page)
- ❌ Hidden on mobile homepage
- ❌ Hidden on mobile cart page

---

## Scenario 2: New Collection Launch - Homepage Banner

**Goal**: Announce a new collection launch only on the homepage for first-time visitors.

**Configuration**:
- Device Targeting: **All devices**
- Page Targeting: **Homepage only**
- Display Frequency: **Once per visitor**

**Use Case**: Drive awareness of new collection without annoying repeat visitors.

**Expected Behavior**:
- ✅ Shows to new visitors on homepage
- ❌ Never shows again to same visitor (even after browser restart)
- ❌ Hidden on all other pages
- ✅ Shows to different visitors on different devices

---

## Scenario 3: Free Shipping Threshold - Cart Page Only

**Goal**: Display free shipping progress bar only on the cart page.

**Configuration**:
- Device Targeting: **All devices**
- Page Targeting: **Cart page**
- Display Frequency: **Always**
- Bar Type: **Free Shipping**

**Use Case**: Show shipping progress exactly when customers are reviewing their cart.

**Expected Behavior**:
- ✅ Shows on `/cart` page
- ✅ Updates dynamically as cart value changes
- ❌ Hidden on all other pages
- ✅ Shows every time cart page is visited

---

## Scenario 4: Sale Collection Promotion

**Goal**: Promote sale items only when viewing sale-related pages.

**Configuration**:
- Device Targeting: **All devices**
- Page Targeting: **Specific URLs**
  - `/collections/sale`
  - `/collections/clearance`
  - `/collections/outlet`
- Display Frequency: **Once per session**

**Use Case**: Encourage purchases in sale sections without overwhelming shoppers.

**Expected Behavior**:
- ✅ Shows on `/collections/sale`
- ✅ Shows on `/collections/clearance`
- ✅ Shows on `/collections/outlet`
- ❌ Hidden on `/collections/new-arrivals`
- ❌ After closing, hidden for remainder of session

---

## Scenario 5: Holiday Countdown - All Product Pages

**Goal**: Create urgency with countdown timer on all product pages during holiday sale.

**Configuration**:
- Device Targeting: **All devices**
- Page Targeting: **URL Pattern**
  - Type: **Contains**
  - Value: `/products/`
- Display Frequency: **Always**
- Bar Type: **Countdown Timer**

**Use Case**: Show time-sensitive offer on all product pages to drive conversions.

**Expected Behavior**:
- ✅ Shows on `/products/shoes`
- ✅ Shows on `/products/clothing/jacket`
- ✅ Shows on `/products/accessories/watch`
- ❌ Hidden on `/collections/all`
- ❌ Hidden on homepage
- ✅ Countdown updates in real-time

---

## Scenario 6: Desktop-Only Announcement with Schedule

**Goal**: Show desktop users a special promotion during specific dates.

**Configuration**:
- Device Targeting: **Desktop only**
- Page Targeting: **All pages**
- Display Frequency: **Always**
- Schedule: **Start Date**: Dec 1, 2024 - **End Date**: Dec 25, 2024

**Use Case**: Desktop-exclusive promotion for holiday shopping season.

**Expected Behavior**:
- ✅ Shows on desktop after Dec 1, 2024
- ✅ Shows on all pages (desktop)
- ❌ Hidden on mobile devices
- ❌ Automatically deactivated after Dec 25, 2024
- ✅ Reappears if end date is removed/extended

---

## Scenario 7: Smart Collection Pages - Pattern Matching

**Goal**: Target all collection pages without manually listing each one.

**Configuration**:
- Device Targeting: **All devices**
- Page Targeting: **URL Pattern**
  - Type: **Starts with**
  - Value: `/collections`
- Display Frequency: **Once per session**

**Use Case**: Promote collection browsing across all collections.

**Expected Behavior**:
- ✅ Shows on `/collections/all`
- ✅ Shows on `/collections/new-arrivals`
- ✅ Shows on `/collections/sale`
- ✅ Shows on `/collections/mens/shoes` (subdirectories)
- ❌ Hidden on `/products/item`
- ❌ Shows once per browsing session

---

## Scenario 8: Pre-Order Campaign - Specific Products

**Goal**: Show pre-order message only on specific product pages.

**Configuration**:
- Device Targeting: **All devices**
- Page Targeting: **Specific URLs**
  - `/products/new-phone`
  - `/products/new-laptop`
  - `/products/new-tablet`
- Display Frequency: **Always**

**Use Case**: Inform customers about pre-order availability for new products.

**Expected Behavior**:
- ✅ Shows on `/products/new-phone`
- ✅ Shows on `/products/new-laptop`
- ✅ Shows on `/products/new-tablet`
- ❌ Hidden on all other product pages
- ✅ Shows on every page load

---

## Scenario 9: Newsletter Signup - First Visit Only

**Goal**: Encourage newsletter signups for new visitors across entire site.

**Configuration**:
- Device Targeting: **All devices**
- Page Targeting: **All pages**
- Display Frequency: **Once per visitor**

**Use Case**: Build email list without annoying existing subscribers.

**Expected Behavior**:
- ✅ Shows to new visitors on any page
- ❌ Never shows again to same visitor (cookie persists 365 days)
- ✅ Resets if visitor clears cookies
- ✅ Different devices treated as different visitors

---

## Scenario 10: Checkout Abandonment Recovery

**Goal**: Show cart reminder only to visitors who viewed cart but didn't checkout.

**Configuration** (Current Implementation):
- Device Targeting: **All devices**
- Page Targeting: **Cart page**
- Display Frequency: **Once per session**

**Future Enhancement** (Not yet implemented):
Could add custom logic to track:
- Cart abandonment behavior
- Previous page visits
- Time on site

**Expected Behavior**:
- ✅ Shows on cart page
- ❌ Hidden after first view in session
- ✅ Reappears in new session if cart still has items

---

## Scenario 11: HTML/Static Page Targeting

**Goal**: Show announcement only on static info pages (About, Contact, etc).

**Configuration**:
- Device Targeting: **All devices**
- Page Targeting: **URL Pattern**
  - Type: **Ends with**
  - Value: `.html`
- Display Frequency: **Always**

**Use Case**: Target legacy static pages with specific messaging.

**Expected Behavior**:
- ✅ Shows on `/pages/about.html`
- ✅ Shows on `/pages/contact.html`
- ❌ Hidden on `/products/item` (no .html)
- ❌ Hidden on `/collections/all`

---

## Advanced Combinations

### Multi-Condition Targeting

**Scenario**: Mobile users, product pages only, once per session
```
Device: Mobile only
Pages: Product pages
Frequency: Once per session
```

**Scenario**: Desktop users, specific sale collections, always show
```
Device: Desktop only
Pages: Specific URLs - /collections/sale, /collections/clearance
Frequency: Always
```

**Scenario**: All devices, homepage + cart, once per visitor
```
Device: All devices
Pages: Specific URLs - /, /cart
Frequency: Once per visitor
```

### Combining with Scheduling

**Black Friday Campaign**:
```
Device: All devices
Pages: All pages
Frequency: Always
Schedule: Nov 24 00:00 - Nov 27 23:59
Bar Type: Countdown Timer (ends Nov 27)
```

**Product Launch**:
```
Device: All devices
Pages: Specific URLs - /products/new-product
Frequency: Once per visitor
Schedule: Jan 1 00:00 - Jan 31 23:59
```

---

## Testing Recommendations

For each scenario:

1. **Document Expected Behavior** - Write down what should/shouldn't show
2. **Test All Conditions** - Verify each targeting rule works independently
3. **Test Edge Cases** - Try unusual URL patterns, clear cookies, etc.
4. **Test Combinations** - Verify rules work together correctly
5. **Check Console Logs** - Review JavaScript console for targeting validation
6. **Cross-Device Testing** - Test on real mobile and desktop browsers
7. **Clear Storage** - Test with fresh sessionStorage and cookies

---

## Troubleshooting Guide

### Bar Not Showing?

**Check Device Targeting**:
- Am I using the correct device type?
- Is mobile detection working? (Check user agent)

**Check Page Targeting**:
- Does current URL match the targeting rule?
- For patterns: Is the pattern type correct?
- For specific URLs: Is URL exactly matching?

**Check Display Frequency**:
- Have I already closed this bar in this session?
- Do I have a visitor cookie set?
- Try clearing storage/cookies

**Check Schedule**:
- Is current date/time within scheduled period?
- Check timezone settings

**Check Browser Console**:
- Look for targeting validation logs
- Check for JavaScript errors

### Pattern Not Matching?

**Common Issues**:
- Leading/trailing spaces in pattern value
- Wrong pattern type (contains vs starts_with vs ends_with)
- Case sensitivity (patterns are case-sensitive)
- URL encoding issues

**Solutions**:
- Trim whitespace from pattern values
- Test with simple patterns first
- Use browser console to verify current path
- Check targeting validation logs

---

## Best Practices Summary

1. **Start Broad, Then Narrow**: Begin with "All pages" and refine based on data
2. **Test Thoroughly**: Test all conditions before going live
3. **Use Frequency Wisely**: Balance visibility with user experience
4. **Monitor Performance**: Track which targeting rules drive conversions
5. **Document Your Rules**: Keep notes on why each rule was chosen
6. **Review Regularly**: Update targeting as your strategy evolves

---

## Next Steps

After implementing basic targeting rules, consider:

1. **Analytics Integration**: Track which targeting rules perform best
2. **A/B Testing**: Test different targeting strategies
3. **Segment Expansion**: Add customer segments, geolocation, etc.
4. **Automation**: Automatically adjust targeting based on performance
5. **Personalization**: Combine targeting with user behavior data
