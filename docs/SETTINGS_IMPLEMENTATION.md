# Settings Page Implementation

## Overview
This document describes the implementation of the Settings page for merchant preferences and app configuration.

## Features Implemented

### Backend (API Endpoints)

#### File: `app/routes/api.settings.jsx`
- **GET Endpoint**: Retrieves settings for the current merchant
  - Returns default settings for new merchants
  - Merges saved settings with defaults to ensure all fields exist
- **POST Endpoint**: Saves/updates settings
  - Validates all settings fields
  - Uses `upsert` to create or update settings
  - Returns success message with updated settings

#### Default Settings
```javascript
{
  timezone: "America/New_York",
  defaultBarPosition: "top",
  enableViewTracking: true,
  enableClickTracking: true,
  emailNotifications: true,
  weeklySummaryReports: true
}
```

#### Validation
- Timezone: Required, non-empty string
- Bar Position: Must be "top" or "bottom"
- Boolean fields: Must be true/false
- Returns detailed error messages for invalid inputs

### Frontend (Settings Page UI)

#### File: `app/routes/app.settings.jsx`

#### Sections Implemented

1. **Account Information**
   - Display store name (shop domain)
   - Display email address
   - Display merchant name (first and last name)
   - Read-only information

2. **General Settings**
   - **Store Timezone**: Select dropdown with 18 timezone options
     - Includes US, European, Asian, and Pacific timezones
     - Help text: "Set your store's timezone for scheduling and reports"
   - **Default Bar Position**: Select dropdown
     - Options: Top of page, Bottom of page
     - Help text: "Choose where announcement bars appear by default"
   - **Tracking Preferences**: Two checkboxes
     - Enable view tracking (with help text)
     - Enable click tracking (with help text)

3. **Notification Preferences**
   - **Email notifications for bar performance**: Checkbox
     - Help text: "Receive email alerts when bars reach performance milestones"
   - **Weekly summary reports**: Checkbox
     - Help text: "Get a weekly email with your announcement bar analytics"

4. **Info Banner**
   - Informs users that tracking changes apply to new bars only

#### User Experience Features
- **Save Button**: Primary action button at top of page
  - Shows loading state while saving
  - Disabled during submission
- **Toast Notifications**: 
  - Success: "✅ Settings saved successfully!"
  - Error: "❌ Error: [error message]"
  - Auto-dismisses after 4 seconds
- **Form State Management**: 
  - All form fields are controlled components
  - Real-time updates as user makes changes
  - Settings persist after save

#### Timezone Options (18 total)
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

## Database Schema

### Existing `Setting` Model (Prisma)
```prisma
model Setting {
  id        Int      @id @default(autoincrement())
  shop      String   @unique
  value     String   // JSON string containing settings
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Settings are stored as JSON in the `value` field, allowing flexibility for future additions.

## API Usage

### Get Settings
```
GET /api/settings
Response: { success: true, settings: {...} }
```

### Save Settings
```
POST /app/settings
FormData: {
  timezone: string,
  defaultBarPosition: "top" | "bottom",
  enableViewTracking: "true" | "false",
  enableClickTracking: "true" | "false",
  emailNotifications: "true" | "false",
  weeklySummaryReports: "true" | "false"
}
Response: { success: true, settings: {...}, message: "Settings saved successfully!" }
```

## Error Handling
- Invalid timezone: "Timezone is required"
- Invalid position: "Bar position must be 'top' or 'bottom'"
- Invalid boolean values: Specific error for each field
- Database errors: Returns error message with 500 status
- Display errors in toast notifications

## Validation Checklist

### Requirements Met
✅ Frontend - General settings section
  ✅ Store timezone selector
  ✅ Default bar position selector
  ✅ Enable/disable view tracking checkbox
  ✅ Enable/disable click tracking checkbox

✅ Frontend - Notification preferences section
  ✅ Email notifications checkbox
  ✅ Weekly summary reports checkbox

✅ Frontend - Account information display
  ✅ Store name
  ✅ Email address
  ✅ Merchant name

✅ Frontend - Save settings button
  ✅ Primary action button
  ✅ Loading state
  ✅ Disabled during submission

✅ Backend - Settings API endpoints
  ✅ GET endpoint for retrieving settings
  ✅ POST endpoint for saving settings
  ✅ Settings stored per merchant (by shop)
  ✅ Default settings for new merchants

✅ Backend - Settings validation
  ✅ Timezone validation
  ✅ Bar position validation
  ✅ Boolean field validation
  ✅ Error messages for invalid inputs

✅ Settings form components
  ✅ Timezone selector with 18 options
  ✅ Toggle switches (checkboxes) for preferences
  ✅ Select dropdown for bar position
  ✅ All fields with help text

## Testing Checklist

To manually test the implementation:

1. ✓ Settings page loads correctly
   - Navigate to `/app/settings`
   - Verify page renders without errors

2. ✓ All settings fields are editable
   - Try changing timezone
   - Try changing bar position
   - Toggle all checkboxes

3. ✓ Timezone selector shows options
   - Open timezone dropdown
   - Verify all 18 timezones are present

4. ✓ Toggle switches work correctly
   - Click each checkbox
   - Verify state changes

5. ✓ Save button updates settings
   - Make changes to settings
   - Click "Save Settings"
   - Verify API call is made

6. ✓ Success message appears on save
   - After saving, look for green toast notification
   - Should say "Settings saved successfully!"

7. ✓ Settings persist after page reload
   - Save settings
   - Refresh page
   - Verify settings are loaded correctly

8. ✓ Default settings apply to new merchants
   - First time accessing settings
   - Should show default values

9. ✓ Settings update in database
   - Check database after save
   - Verify JSON value is updated

10. ✓ Invalid inputs show errors
    - (Backend validation in place)
    - Try submitting invalid data via API

## Future Enhancements
- Additional timezone options
- More granular notification settings
- Theme preferences
- Language preferences
- Export/import settings
- Settings version control
