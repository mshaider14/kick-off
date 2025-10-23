# Settings API Testing Guide

## API Endpoints

### 1. Admin Settings API (Protected)

#### GET Settings
```bash
# Requires admin authentication
GET /api/settings
```

**Expected Response:**
```json
{
  "success": true,
  "settings": {
    "timezone": "America/New_York",
    "defaultBarPosition": "top",
    "enableViewTracking": true,
    "enableClickTracking": true,
    "emailNotifications": true,
    "weeklySummaryReports": true
  }
}
```

#### POST/UPDATE Settings
```bash
# Requires admin authentication
POST /api/settings

FormData:
- timezone: "America/Los_Angeles"
- defaultBarPosition: "bottom"
- enableViewTracking: "true"
- enableClickTracking: "false"
- emailNotifications: "true"
- weeklySummaryReports: "false"
```

**Expected Success Response:**
```json
{
  "success": true,
  "settings": {
    "timezone": "America/Los_Angeles",
    "defaultBarPosition": "bottom",
    "enableViewTracking": true,
    "enableClickTracking": false,
    "emailNotifications": true,
    "weeklySummaryReports": false
  },
  "message": "Settings saved successfully!"
}
```

**Expected Error Response (Validation):**
```json
{
  "success": false,
  "errors": {
    "defaultBarPosition": "Bar position must be 'top' or 'bottom'"
  }
}
```

### 2. Storefront Settings API (Public)

#### GET Settings
```bash
# Public endpoint, no authentication required
GET /api/storefront/settings?shop=your-shop.myshopify.com
```

**Expected Response:**
```json
{
  "success": true,
  "settings": {
    "timezone": "America/New_York",
    "defaultBarPosition": "top",
    "enableViewTracking": true,
    "enableClickTracking": true,
    "emailNotifications": true,
    "weeklySummaryReports": true
  }
}
```

**Notes:**
- Returns default settings if no settings are saved
- Includes CORS headers for cross-origin access
- Cached for 60 seconds

## Testing with cURL

### Get Settings (Storefront)
```bash
curl -X GET "http://localhost:3000/api/storefront/settings?shop=test-shop.myshopify.com"
```

### Save Settings (Admin - requires session)
```bash
# This requires a valid Shopify admin session
# Test through the UI at /app/settings
```

## Testing with the UI

### Manual Testing Steps

1. **Initial Load**
   - Navigate to `/app/settings`
   - Verify default settings are displayed
   - Check that all fields are populated

2. **Change Settings**
   - Select a different timezone
   - Change bar position to "bottom"
   - Toggle tracking switches
   - Toggle notification preferences

3. **Save Settings**
   - Click "Save Settings" button
   - Verify loading state appears
   - Check for success toast notification
   - Verify button returns to normal state

4. **Verify Persistence**
   - Refresh the page
   - Verify all settings are still set to your changes
   - Check database to confirm settings are saved

5. **Test Validation**
   - Try submitting with invalid data (through browser dev tools)
   - Verify error messages appear

## Database Verification

### Check Saved Settings
```sql
-- Connect to your database
SELECT * FROM "Setting" WHERE shop = 'your-shop.myshopify.com';

-- View the settings JSON
SELECT shop, value FROM "Setting" WHERE shop = 'your-shop.myshopify.com';
```

**Expected Data Format:**
```json
{
  "timezone": "America/New_York",
  "defaultBarPosition": "top",
  "enableViewTracking": true,
  "enableClickTracking": true,
  "emailNotifications": true,
  "weeklySummaryReports": true
}
```

## Validation Rules

| Field | Type | Validation |
|-------|------|------------|
| timezone | string | Required, non-empty |
| defaultBarPosition | string | Must be "top" or "bottom" |
| enableViewTracking | boolean | Must be true or false |
| enableClickTracking | boolean | Must be true or false |
| emailNotifications | boolean | Must be true or false |
| weeklySummaryReports | boolean | Must be true or false |

## Error Scenarios

### Invalid Bar Position
```json
{
  "success": false,
  "errors": {
    "defaultBarPosition": "Bar position must be 'top' or 'bottom'"
  }
}
```

### Missing Timezone
```json
{
  "success": false,
  "errors": {
    "timezone": "Timezone is required"
  }
}
```

### Invalid Boolean
```json
{
  "success": false,
  "errors": {
    "enableViewTracking": "View tracking must be a boolean value"
  }
}
```

## Integration Testing

### Test New Merchant Flow
1. Create a new merchant (or clear settings)
2. Access `/app/settings`
3. Verify default settings are applied
4. Make changes and save
5. Verify settings are persisted

### Test Settings Update Flow
1. Load existing settings
2. Make changes to multiple fields
3. Save settings
4. Verify all changes are persisted
5. Check that other settings remain unchanged

### Test Concurrent Updates
1. Open settings in two tabs
2. Make different changes in each tab
3. Save in first tab
4. Save in second tab
5. Verify last save wins (expected behavior)

## Performance Considerations

- Settings are cached on the storefront API for 60 seconds
- Settings are stored as JSON for flexibility
- Single upsert operation for save (atomic)
- No pagination needed (single settings object per merchant)

## Future Testing Needs

- Automated API tests
- Integration tests with Shopify
- Load testing for high-traffic stores
- Settings migration tests
- Backward compatibility tests
