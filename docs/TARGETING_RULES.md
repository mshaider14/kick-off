# Targeting Rules Documentation

## Overview
The Targeting Rules feature allows you to control where, when, and how often your announcement bars appear to visitors. This provides fine-grained control over bar visibility based on device type, page location, and display frequency.

## Features

### 1. Device Targeting
Control which devices display your bar:
- **All devices (Desktop & Mobile)** - Default. Shows on all devices.
- **Desktop only** - Shows only on desktop browsers.
- **Mobile only** - Shows only on mobile devices (phones, tablets).

**Implementation:**
- Uses user agent detection to identify mobile devices
- Mobile detection regex: `/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i`

### 2. Page Targeting
Control which pages display your bar:

#### All Pages
Default behavior. Bar appears on every page of the store.

#### Homepage Only
Bar appears only on the homepage (`/` or empty path).

#### Product Pages
Bar appears on all product detail pages (URLs containing `/products/`).

#### Collection Pages
Bar appears on all collection pages (URLs containing `/collections/`).

#### Cart Page
Bar appears on the cart page (URLs containing `/cart`).

#### Specific URLs
Define an exact list of URLs where the bar should appear.
- Enter relative URLs (e.g., `/collections/sale`, `/pages/about`)
- Supports exact match and prefix matching
- Add multiple URLs as needed
- Visual tag interface for easy management

**Example:**
```json
["/collections/sale", "/pages/about", "/products/featured"]
```

#### URL Pattern Matching
Use pattern matching rules to target pages dynamically:

**Pattern Types:**
1. **Contains** - Bar shows on URLs containing the specified text
   - Example: Pattern value `sale` matches `/collections/sale`, `/products/sale-item`
   
2. **Starts with** - Bar shows on URLs starting with the specified text
   - Example: Pattern value `/collections` matches `/collections/sale`, `/collections/new`
   
3. **Ends with** - Bar shows on URLs ending with the specified text
   - Example: Pattern value `.html` matches `/products/item.html`, `/pages/about.html`

**Pattern Configuration (stored as JSON):**
```json
{
  "type": "contains",  // or "starts_with", "ends_with"
  "value": "sale"
}
```

### 3. Display Frequency
Control how often visitors see your bar:

#### Always Show
Default behavior. Bar displays on every page load for every visitor.

#### Once Per Session
Bar displays only once during a browser session.
- Uses `sessionStorage` to track display state
- Resets when the browser is closed or the session ends
- Key format: `barShown_session_{barId}`

**Implementation:**
```javascript
sessionStorage.setItem(`barShown_session_${barId}`, 'true');
```

#### Once Per Visitor (Cookie)
Bar displays only once per visitor, persisting across sessions.
- Uses browser cookies with 365-day expiry
- Persists even after browser is closed
- Resets only if visitor clears cookies
- Key format: `barShown_visitor_{barId}`

**Implementation:**
```javascript
const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 365);
document.cookie = `barShown_visitor_${barId}=true; expires=${expiryDate.toUTCString()}; path=/`;
```

## Database Schema

### Bar Model Fields
```prisma
model Bar {
  // ... existing fields ...
  
  // Targeting rules fields
  targetDevices      String?  @default("both")      // "desktop", "mobile", "both"
  targetPages        String?  @default("all")       // "all", "homepage", "product", "collection", "cart", "specific", "pattern"
  targetSpecificUrls String?                        // JSON array of URLs
  targetUrlPattern   String?                        // JSON: {"type": "...", "value": "..."}
  displayFrequency   String?  @default("always")    // "always", "once_per_session", "once_per_visitor"
}
```

## API Response

### Settings Object
The targeting rules are included in the storefront settings API response:

```javascript
{
  id: "bar_id",
  type: "announcement",
  // ... other settings ...
  
  // Targeting settings
  targetDevices: "both",
  targetPages: "pattern",
  targetSpecificUrls: null,
  targetUrlPattern: '{"type":"contains","value":"sale"}',
  displayFrequency: "once_per_session"
}
```

## Frontend Implementation

### Validation Flow
The storefront JavaScript validates targeting rules in this order:

1. **Device Targeting** - Check if current device matches target
2. **Page Targeting** - Check if current page matches target
3. **Display Frequency** - Check if bar should be shown based on frequency settings

If any check fails, the bar is hidden.

### Example Implementation
```javascript
function passesTargetingRules(settings) {
  // Check device targeting
  if (!matchesDeviceTarget(settings.targetDevices)) {
    console.log('Bar hidden: device targeting mismatch');
    return false;
  }
  
  // Check page targeting
  if (!matchesPageTarget(settings)) {
    console.log('Bar hidden: page targeting mismatch');
    return false;
  }
  
  // Check display frequency
  if (!shouldShowBasedOnFrequency(settings)) {
    console.log('Bar hidden: display frequency limit reached');
    return false;
  }
  
  return true;
}
```

## UI Components

### TargetingRules Component
Located at: `app/components/bars/TargetingRules.jsx`

**Features:**
- Device targeting dropdown
- Page targeting options with dynamic inputs
- URL tag manager for specific URLs
- Pattern matching with live examples
- Display frequency selector with helpful hints
- Validation and error handling

**Props:**
```javascript
{
  formData: {
    targetDevices: string,
    targetPages: string,
    targetSpecificUrls: string,  // JSON
    targetUrlPattern: string,     // JSON
    displayFrequency: string
  },
  onChange: function,
  errors: object
}
```

## Validation Rules

### Backend Validation (app.new.jsx)
```javascript
// Specific URLs validation
if (targetPages === "specific") {
  const urls = JSON.parse(targetSpecificUrls);
  if (urls.length === 0) {
    errors.targetPages = "Please add at least one URL";
  }
}

// URL Pattern validation
if (targetPages === "pattern") {
  const pattern = JSON.parse(targetUrlPattern);
  if (!pattern.value || pattern.value.trim() === "") {
    errors.targetUrlPattern = "Please enter a URL pattern value";
  }
}
```

## Testing

### Manual Testing Checklist
- [ ] Device targeting: Test on mobile and desktop browsers
- [ ] Homepage targeting: Verify bar shows only on homepage
- [ ] Product page targeting: Verify bar shows on product pages
- [ ] Collection page targeting: Verify bar shows on collection pages
- [ ] Cart page targeting: Verify bar shows on cart page
- [ ] Specific URLs: Add multiple URLs and verify exact matching
- [ ] URL pattern (contains): Test with partial URL matches
- [ ] URL pattern (starts with): Test with URL prefix matches
- [ ] URL pattern (ends with): Test with URL suffix matches
- [ ] Display frequency (always): Verify bar shows on every page load
- [ ] Display frequency (session): Verify bar shows once, then hidden in same session
- [ ] Display frequency (visitor): Verify bar shows once, persists after browser restart

### Automated Tests
Run targeting rules validation:
```bash
node docs/test-targeting-rules.js
```

## Migration

### Database Migration
Migration file: `prisma/migrations/20251021152747_add_targeting_rules/migration.sql`

```sql
ALTER TABLE "Bar" ADD COLUMN "targetDevices" TEXT DEFAULT 'both',
ADD COLUMN "targetPages" TEXT DEFAULT 'all',
ADD COLUMN "targetSpecificUrls" TEXT,
ADD COLUMN "targetUrlPattern" TEXT,
ADD COLUMN "displayFrequency" TEXT DEFAULT 'always';
```

## Best Practices

1. **Default to All Pages** - Start with broad targeting and narrow down as needed
2. **Test Thoroughly** - Always test targeting rules on a staging environment first
3. **Mobile Testing** - Use browser dev tools or real devices to test mobile targeting
4. **URL Patterns** - Use specific patterns to avoid unintended matches
5. **Frequency Settings** - Consider user experience when using frequency limits
6. **Cookie Consent** - Be aware of cookie consent requirements when using "once per visitor"

## Troubleshooting

### Bar Not Showing
1. Check if device targeting matches your current device
2. Verify the current page matches the page targeting rules
3. Check browser console for targeting validation logs
4. For frequency limits, clear sessionStorage or cookies and reload

### Pattern Not Matching
1. Verify the pattern value doesn't have leading/trailing spaces
2. Check if the pattern type is correct (contains vs starts_with vs ends_with)
3. Test pattern matching with the validation script
4. Review browser console logs for pattern matching details

### Cookies Not Working
1. Verify cookies are enabled in the browser
2. Check for cookie consent requirements in your region
3. Ensure the bar ID is consistent across deployments
4. Clear cookies and test again

## Future Enhancements
- Customer segment targeting (logged in vs guest)
- Geographic targeting (by country/region)
- Time-based targeting (day of week, time of day)
- Cart value targeting (for shipping bars)
- Traffic source targeting (organic, paid, direct)
- A/B testing capabilities
