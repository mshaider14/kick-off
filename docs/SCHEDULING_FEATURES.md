# Bar Scheduling System - Features Overview

This document provides a visual overview of the implemented scheduling features.

## Overview

The Bar Scheduling System allows you to automatically activate and deactivate announcement bars based on configured schedules. This ensures your bars appear at the right time without manual intervention.

## Key Features

### 1. Start Options

#### Option A: Start Immediately
```
☑️ Start immediately when published
```
- Bar becomes active as soon as you click "Publish"
- No waiting for a scheduled time
- Perfect for urgent announcements

**UI Component:**
- Simple checkbox
- When checked, hides the date/time picker
- Schedule summary shows: "Start: Immediately upon publishing"

#### Option B: Scheduled Start
```
📅 Start Date & Time: [2025-10-24 10:00]
```
- Select a specific date and time for bar to activate
- Validation prevents selecting past dates
- Schedule summary shows: "Start: Oct 24, 2025, 10:00 AM"

**UI Component:**
- HTML5 datetime-local picker
- Min date constraint (cannot pick past dates)
- Formatted display with timezone

### 2. End Options

#### Option A: Never End
```
☑️ Never end (run indefinitely)
```
- Bar continues displaying until manually deactivated
- No automatic end date
- Perfect for permanent announcements

**UI Component:**
- Simple checkbox
- When checked, hides the date/time picker
- Schedule summary shows: "End: Never (runs indefinitely)"

#### Option B: Scheduled End
```
📅 End Date & Time: [2025-10-25 23:59]
```
- Select a specific date and time for bar to deactivate
- Validation ensures end is after start
- Schedule summary shows: "End: Oct 25, 2025, 11:59 PM"

**UI Component:**
- HTML5 datetime-local picker
- Min date constraint (must be after start date)
- Formatted display with timezone

### 3. Timezone Selection

```
🌍 Timezone: [America/New_York (Eastern Time)]
```

**Available Timezones:**
- UTC (Coordinated Universal Time)
- America/New_York (Eastern Time)
- America/Chicago (Central Time)
- America/Denver (Mountain Time)
- America/Los_Angeles (Pacific Time)
- America/Phoenix (Arizona)
- America/Anchorage (Alaska)
- Pacific/Honolulu (Hawaii)
- Europe/London (UK)
- Europe/Paris (Central Europe)
- Europe/Berlin (Germany)
- Asia/Dubai (UAE)
- Asia/Kolkata (India)
- Asia/Shanghai (China)
- Asia/Tokyo (Japan)
- Australia/Sydney (Australia)

**Purpose:**
- Ensures schedules work correctly across different time zones
- All times are interpreted in the selected timezone
- Stores in database for accurate future activations

### 4. Schedule Summary

A comprehensive banner that shows all schedule configuration:

```
┌─────────────────────────────────────┐
│ 📊 Schedule Summary                 │
├─────────────────────────────────────┤
│ Start: Oct 24, 2025, 10:00 AM      │
│ End: Oct 25, 2025, 11:59 PM        │
│ Timezone: America/New_York          │
│ Duration: 1 day 13 hours            │
└─────────────────────────────────────┘
```

**Shows:**
- Formatted start date/time (or "Immediately upon publishing")
- Formatted end date/time (or "Never (runs indefinitely)")
- Selected timezone
- Calculated duration (when both dates are set)

### 5. Schedule Display in Bars List

Each bar in the list shows its schedule status:

```
Announcement Bar Name
⚡ Immediate → ∞              (Immediate start, never ends)

Flash Sale Bar
📅 Oct 24 → Oct 25            (Scheduled dates)

Limited Offer Bar
📅 Oct 24 → ∞                 (Scheduled start, never ends)
```

**Indicators:**
- ⚡ = Immediate start
- 📅 = Scheduled date
- ∞ = Never ends
- Date format: Short date display

### 6. Edit Functionality

Complete edit capability for existing bars:

```
Actions → Edit
  ├─ Edit bar content
  ├─ Edit design
  ├─ Edit schedule ✨
  └─ Update & Publish
```

**Features:**
- Pre-populated with existing schedule
- Same validation as create flow
- Can modify schedule without changing other settings
- Preserves schedule timezone

### 7. Automatic Schedule Management

Backend cron job that runs periodically (e.g., every 5 minutes):

```
Cron Job → /api/schedule/check
  ├─ Find bars that should start → Activate
  ├─ Find bars that should end → Deactivate
  └─ Return: {activated: 2, deactivated: 1}
```

**Logic:**
- Checks all bars across all shops
- Activates bars when start time has passed
- Deactivates bars when end time has passed
- Respects "immediate start" and "never end" settings
- Ensures only one bar is active per shop

### 8. Schedule Status API

Check if a bar is currently within its schedule:

```
GET /api/bars/:barId/schedule-status?shop=myshop.myshopify.com

Response:
{
  "isScheduled": true,
  "isActive": true,
  "shouldBeActive": true,
  "schedule": {
    "startDate": "2025-10-24T10:00:00Z",
    "endDate": "2025-10-25T23:59:00Z",
    "timezone": "America/New_York",
    "startImmediate": false,
    "endNever": false
  },
  "message": "Bar is scheduled until 2025-10-25T23:59:00Z"
}
```

## Usage Examples

### Example 1: Flash Sale (24 Hours)
```
Type: Countdown Timer
Start: Immediately ✓
End: Tomorrow at 11:59 PM
Timezone: America/New_York

Result: Bar activates instantly and deactivates in 24 hours
```

### Example 2: Seasonal Campaign
```
Type: Announcement
Start: December 1, 2025 at 12:00 AM
End: December 31, 2025 at 11:59 PM
Timezone: America/Los_Angeles

Result: Bar runs entire month of December in Pacific time
```

### Example 3: Permanent Free Shipping
```
Type: Free Shipping Bar
Start: Immediately ✓
End: Never ✓
Timezone: UTC

Result: Bar is always active until manually deactivated
```

### Example 4: Weekend Sale
```
Type: Announcement
Start: Friday at 6:00 PM
End: Sunday at 11:59 PM
Timezone: America/Chicago

Result: Bar shows only on weekend in Central time
```

## Validation Rules

The system enforces these validation rules:

1. **Past Date Prevention:**
   - Cannot set start date in the past
   - Error: "Start date cannot be in the past"

2. **Date Range Validation:**
   - End date must be after start date
   - Error: "End date must be after start date"

3. **Required Fields:**
   - Must select either "Start immediately" OR specific start date
   - Error: "Please select a start date or choose 'Start immediately'"

4. **Timezone:**
   - Defaults to UTC if not specified
   - All calculations use selected timezone

## Technical Details

### Database Schema

```prisma
model Bar {
  // ... other fields ...
  
  startDate              DateTime? // When to start
  endDate                DateTime? // When to end
  timezone               String?   @default("UTC") // IANA timezone
  scheduleStartImmediate Boolean   @default(false) // Start now?
  scheduleEndNever       Boolean   @default(false) // Never end?
}
```

### Schedule Logic

**When bar should be active:**
```javascript
if (scheduleStartImmediate) {
  // Active immediately when published
  if (scheduleEndNever) return true;
  if (!endDate) return true;
  return now <= endDate;
}

if (startDate && now >= startDate) {
  // Start date has passed
  if (scheduleEndNever) return true;
  if (!endDate) return true;
  return now <= endDate;
}

return false; // Not active
```

## Benefits

### For Merchants
- ✅ Set and forget - bars activate automatically
- ✅ No need to manually enable/disable
- ✅ Perfect for time-sensitive promotions
- ✅ Works across different time zones
- ✅ Can schedule weeks in advance

### For Users
- ✅ Always see relevant, timely messages
- ✅ No outdated promotions
- ✅ Consistent experience across time zones

### For Developers
- ✅ Clean API for schedule management
- ✅ Extensible for future features
- ✅ Well-documented with examples
- ✅ Multiple cron setup options

## Future Enhancements

Potential features for future versions:

1. **Recurring Schedules**
   - Weekly patterns (e.g., every Friday-Sunday)
   - Monthly patterns (e.g., first week of every month)

2. **Visual Calendar**
   - Interactive calendar view for selecting dates
   - See all scheduled bars in calendar format

3. **Schedule Templates**
   - Save common schedule patterns
   - Quick apply to new bars

4. **Schedule Conflicts**
   - Detect overlapping schedules
   - Suggest resolution

5. **Notifications**
   - Email when bar activates
   - Email when bar deactivates
   - Slack/Discord webhooks

6. **Multiple Active Bars**
   - Support for multiple simultaneous bars
   - Priority ordering
   - Position management (top vs bottom)

7. **Schedule History**
   - Audit log of schedule changes
   - History of activations/deactivations

8. **Advanced Timezone Features**
   - Automatic daylight saving time handling
   - Display times in user's local timezone
   - Timezone-aware analytics

## See Also

- [Complete Documentation](SCHEDULING.md) - Full technical documentation
- [Testing Checklist](TESTING_CHECKLIST.md) - Comprehensive test scenarios
- [README](../README.md) - Project overview
