# Settings Feature - Quick Reference

## Overview

The Settings feature allows merchants to configure app preferences and notifications for their announcement bars.

## Quick Start

### For Developers

1. **View the Settings Page**
   ```bash
   npm run dev
   # Navigate to: http://localhost:3000/app/settings
   ```

2. **Run Verification**
   ```bash
   ./scripts/verify-settings.sh
   ```

3. **Read Documentation**
   - Overview: `docs/SETTINGS_SUMMARY.md`
   - Implementation: `docs/SETTINGS_IMPLEMENTATION.md`
   - API Testing: `docs/SETTINGS_API_TEST.md`
   - Architecture: `docs/SETTINGS_ARCHITECTURE.md`

### For Merchants

Navigate to **Settings** in the app navigation to:
- Set your store timezone
- Choose default bar position (top/bottom)
- Enable/disable view tracking
- Enable/disable click tracking
- Configure email notifications
- Enable weekly summary reports

## Features

### General Settings
- **Store Timezone**: 18 timezone options covering major regions
- **Default Bar Position**: Choose top or bottom for new bars
- **View Tracking**: Track how many times bars are viewed
- **Click Tracking**: Track clicks on CTA buttons

### Notification Preferences
- **Email Notifications**: Get alerts when bars reach milestones
- **Weekly Reports**: Receive weekly analytics summaries

### Account Information
- View your store domain
- View your email address
- View your merchant name

## API Endpoints

### Admin API
```
GET  /api/settings       - Get settings (requires auth)
POST /app/settings       - Save settings (requires auth)
```

### Storefront API
```
GET  /api/storefront/settings?shop=xxx  - Get settings (public)
```

## Files

### Implementation
- `app/routes/app.settings.jsx` - Settings page UI
- `app/routes/api.settings.jsx` - Admin API
- `app/routes/api.storefront.settings.jsx` - Public API

### Documentation
- `docs/SETTINGS_SUMMARY.md` - Complete overview
- `docs/SETTINGS_IMPLEMENTATION.md` - Technical details
- `docs/SETTINGS_API_TEST.md` - Testing guide
- `docs/SETTINGS_UI_MOCKUP.txt` - UI layout
- `docs/SETTINGS_ARCHITECTURE.md` - Architecture diagrams
- `docs/SETTINGS_README.md` - This file

### Tools
- `scripts/verify-settings.sh` - Verification script

## Settings Fields

| Field | Type | Default | Options |
|-------|------|---------|---------|
| timezone | String | America/New_York | 18 timezones |
| defaultBarPosition | String | top | top, bottom |
| enableViewTracking | Boolean | true | true, false |
| enableClickTracking | Boolean | true | true, false |
| emailNotifications | Boolean | true | true, false |
| weeklySummaryReports | Boolean | true | true, false |

## Timezone Options

- Eastern Time (US & Canada)
- Central Time (US & Canada)
- Mountain Time (US & Canada)
- Pacific Time (US & Canada)
- Alaska
- Hawaii
- London (GMT)
- Paris
- Berlin
- Moscow
- Dubai
- Mumbai
- Bangkok
- Singapore
- Tokyo
- Sydney
- Auckland
- UTC

## Validation Rules

- **Timezone**: Required, non-empty string
- **Bar Position**: Must be "top" or "bottom"
- **Boolean Fields**: Must be true or false

## Database

Settings are stored in the `Setting` model:

```prisma
model Setting {
  id        Int      @id @default(autoincrement())
  shop      String   @unique
  value     String   // JSON
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Settings are stored as JSON in the `value` field:

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

## Testing

### Automated Testing
```bash
./scripts/verify-settings.sh
```

### Manual Testing
1. Start app: `npm run dev`
2. Navigate to `/app/settings`
3. Change settings
4. Click "Save Settings"
5. Verify success message
6. Refresh page
7. Verify settings persisted

See `docs/SETTINGS_API_TEST.md` for detailed testing procedures.

## Troubleshooting

### Settings not saving
- Check authentication is valid
- Check database connection
- Check validation errors in toast
- Check browser console for errors

### Settings not loading
- Check database has `Setting` table
- Check shop parameter is correct
- Check API endpoint is accessible

### UI not displaying correctly
- Clear browser cache
- Check Polaris CSS is loaded
- Check for JavaScript errors

## Development

### Adding New Settings

1. **Update DEFAULT_SETTINGS** in both:
   - `app/routes/api.settings.jsx`
   - `app/routes/app.settings.jsx`
   - `app/routes/api.storefront.settings.jsx`

2. **Add validation** in `validateSettings()`:
   ```javascript
   if (!settings.newField) {
     errors.newField = "Error message";
   }
   ```

3. **Add UI component** in `app/routes/app.settings.jsx`:
   ```jsx
   <Checkbox
     label="New Setting"
     checked={formData.newField}
     onChange={(value) =>
       setFormData({ ...formData, newField: value })
     }
   />
   ```

4. **Update documentation** in all docs files

### Code Style

- Use Shopify Polaris components
- Follow existing patterns
- Add help text to all fields
- Validate both client and server side
- Show toast notifications for feedback

## Support

For issues or questions:
1. Check documentation in `docs/` folder
2. Review code comments
3. Run verification script
4. Check error logs

## License

Same as main project.

---

**Status**: ✅ Production Ready
**Version**: 1.0
**Last Updated**: 2025-10-23
