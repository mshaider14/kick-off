# Bar Scheduling System - Testing Checklist

This document provides a comprehensive checklist for testing the bar scheduling system implementation.

## Prerequisites

Before testing, ensure:
- [ ] Database migrations have been applied (`npm run setup`)
- [ ] Application is running (`npm run dev`)
- [ ] You have access to the Shopify admin interface

## Frontend Tests

### Schedule Options

#### Start Options
- [ ] **Test 1: Immediate Start Checkbox**
  - Navigate to "Create New Bar" → Schedule step
  - Check "Start immediately when published" checkbox
  - Verify that the "Start Date & Time" field is hidden
  - Verify schedule summary shows "Immediately upon publishing"
  - Create and publish the bar
  - Verify bar becomes active immediately

- [ ] **Test 2: Scheduled Start**
  - Navigate to "Create New Bar" → Schedule step
  - Uncheck "Start immediately" if checked
  - Set a start date/time in the future (e.g., tomorrow at 10:00 AM)
  - Verify schedule summary shows the selected date/time
  - Verify the date appears in the format display
  - Save as draft
  - Verify bar is not active yet

- [ ] **Test 3: Past Start Date Validation**
  - Try to set a start date in the past
  - Verify validation error appears: "Start date cannot be in the past"
  - Verify cannot proceed to publish with past date

#### End Options
- [ ] **Test 4: Never End Checkbox**
  - Navigate to "Create New Bar" → Schedule step
  - Check "Never end (run indefinitely)" checkbox
  - Verify that the "End Date & Time" field is hidden
  - Verify schedule summary shows "Never (runs indefinitely)"
  - Save the bar
  - Verify endDate is null in database

- [ ] **Test 5: Scheduled End**
  - Navigate to "Create New Bar" → Schedule step
  - Uncheck "Never end" if checked
  - Set an end date/time in the future
  - Verify schedule summary shows the selected end date/time
  - Save the bar
  - Verify endDate is stored in database

- [ ] **Test 6: End Before Start Validation**
  - Set a start date (e.g., tomorrow at 10:00 AM)
  - Set an end date before the start date (e.g., today at 9:00 AM)
  - Verify validation error: "End date must be after start date"
  - Verify cannot save with invalid date range

### Timezone Selection

- [ ] **Test 7: Timezone Dropdown**
  - Navigate to "Create New Bar" → Schedule step
  - Verify timezone dropdown is visible
  - Verify default timezone is "UTC"
  - Select a different timezone (e.g., "America/New_York")
  - Verify schedule summary shows selected timezone
  - Save the bar
  - Verify timezone is stored in database

- [ ] **Test 8: Timezone Display**
  - Set a start date with timezone "America/New_York"
  - Verify the display format includes timezone information
  - Verify schedule summary correctly shows: "(America/New_York)"

### Schedule Preview/Summary

- [ ] **Test 9: Summary Banner Visibility**
  - Navigate to "Create New Bar" → Schedule step
  - Verify summary banner is hidden when no schedule is set
  - Set a start date
  - Verify summary banner appears with start info
  - Set an end date
  - Verify summary banner shows both start and end
  - Verify duration calculation appears

- [ ] **Test 10: Summary Content**
  - Create a bar with immediate start and never end
  - Verify summary shows: "Start: Immediately upon publishing"
  - Verify summary shows: "End: Never (runs indefinitely)"
  - Create a bar with scheduled dates
  - Verify summary shows formatted dates
  - Verify summary shows timezone
  - Verify summary shows calculated duration

### Date/Time Pickers

- [ ] **Test 11: Date Picker Functionality**
  - Click on the "Start Date & Time" field
  - Verify browser's native datetime picker opens
  - Select a date and time
  - Verify selected value appears in the field
  - Verify the value is properly formatted

- [ ] **Test 12: Minimum Date Constraint**
  - Open the start date picker
  - Verify you cannot select dates in the past
  - Open the end date picker (with start date set)
  - Verify you cannot select dates before the start date

## Backend Tests

### Database

- [ ] **Test 13: Schedule Fields Saved**
  - Create a bar with all schedule options
  - Use database client or Prisma Studio to verify:
    - `startDate` is saved correctly
    - `endDate` is saved correctly
    - `timezone` is saved correctly
    - `scheduleStartImmediate` is saved correctly
    - `scheduleEndNever` is saved correctly

### API Endpoints

#### Active Bars API

- [ ] **Test 14: Schedule Filtering**
  - Create a bar with start date in the future
  - Call `/api/bars/active?shop=YOUR_SHOP`
  - Verify bar is not returned (not yet active)
  - Create a bar with immediate start
  - Call the API again
  - Verify bar is returned

- [ ] **Test 15: Never End Filtering**
  - Create an active bar with `scheduleEndNever: true`
  - Call `/api/bars/active?shop=YOUR_SHOP`
  - Verify bar is returned
  - Check days later, verify bar is still returned

#### Schedule Check API

- [ ] **Test 16: Schedule Check Endpoint**
  - Set environment variable: `CRON_SECRET_TOKEN=test-token`
  - Run: `./scripts/test-schedule-check.sh http://localhost:3000 test-token`
  - Verify response includes:
    - `success: true`
    - `activated` count
    - `deactivated` count
    - `timestamp`

- [ ] **Test 17: Authentication**
  - Call `/api/schedule/check` without token
  - Verify 401 Unauthorized response
  - Call with wrong token
  - Verify 401 Unauthorized response
  - Call with correct token
  - Verify 200 OK response

#### Schedule Status API

- [ ] **Test 18: Bar Schedule Status**
  - Create a bar with specific schedule
  - Call `/api/bars/BAR_ID/schedule-status?shop=YOUR_SHOP`
  - Verify response includes:
    - `isScheduled`
    - `isActive`
    - `shouldBeActive`
    - `schedule` object with all details
    - `message` explaining status

## Edit Functionality

- [ ] **Test 19: Edit Existing Bar**
  - Create a bar and save it
  - Navigate to bars list
  - Click Actions → Edit
  - Verify form is pre-populated with existing data
  - Verify schedule fields show current schedule
  - Modify the schedule
  - Save changes
  - Verify schedule is updated in database

- [ ] **Test 20: Edit Schedule Only**
  - Edit an existing bar
  - Navigate to Schedule step
  - Change only the timezone
  - Save changes
  - Verify only timezone is updated
  - Verify other fields remain unchanged

## Integration Tests

### Automatic Activation

- [ ] **Test 21: Bar Activates Automatically**
  - Create a bar with start date 2 minutes in the future
  - Set up cron job or manually call schedule check every minute
  - Wait for scheduled time
  - Verify bar becomes active automatically
  - Check database: `isActive` should be `true`

- [ ] **Test 22: Bar Deactivates Automatically**
  - Create an active bar with end date 2 minutes in the future
  - Set up cron job or manually call schedule check every minute
  - Wait for scheduled time
  - Verify bar becomes inactive automatically
  - Check database: `isActive` should be `false`

### Multiple Bars

- [ ] **Test 23: Only One Active Bar**
  - Create multiple bars with overlapping schedules
  - Run schedule check
  - Verify only one bar is active at a time
  - Verify the most recently updated bar takes priority

## UI/UX Tests

### Visual Display

- [ ] **Test 24: Schedule Info in List**
  - Navigate to bars list
  - Verify bars with schedules show schedule info:
    - ⚡ icon for immediate start
    - 📅 dates for scheduled bars
    - ∞ symbol for never-ending bars
  - Verify format is readable and concise

### Navigation

- [ ] **Test 25: Step Navigation**
  - Create a new bar
  - Navigate through all steps
  - Verify step indicator updates
  - Verify "Previous" works correctly
  - Verify "Next" validates current step
  - Verify cannot skip steps

### Error Handling

- [ ] **Test 26: Validation Messages**
  - Try to proceed without selecting start option
  - Verify error toast appears with clear message
  - Fix the error
  - Verify can proceed after fixing

- [ ] **Test 27: API Error Handling**
  - Simulate network error (disconnect internet)
  - Try to save a bar
  - Verify error message is displayed
  - Verify bar is not saved

## Performance Tests

- [ ] **Test 28: Large Number of Bars**
  - Create 50+ bars with various schedules
  - Run schedule check
  - Verify operation completes in reasonable time (<5 seconds)
  - Verify correct bars are activated/deactivated

## Browser Compatibility

Test in multiple browsers:
- [ ] **Chrome/Edge** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest, macOS/iOS)

For each browser, verify:
- Date/time pickers work correctly
- Schedule summary displays properly
- All form elements are functional

## Mobile Responsiveness

- [ ] **Test 29: Mobile View**
  - Open app on mobile device or resize browser to mobile width
  - Verify schedule form is usable
  - Verify date/time pickers work on mobile
  - Verify schedule summary is readable
  - Verify edit functionality works on mobile

## Regression Tests

- [ ] **Test 30: Existing Bars Not Affected**
  - Verify existing bars (created before scheduling feature) still work
  - Verify they display correctly in list
  - Verify they can be edited
  - Verify default schedule values are applied

## Cron Job Setup

Choose one method and complete:

### Vercel Cron
- [ ] Deploy to Vercel
- [ ] Verify `vercel.json` includes cron configuration
- [ ] Check Vercel dashboard for cron job status
- [ ] Verify cron runs every 5 minutes
- [ ] Check logs for successful executions

### GitHub Actions
- [ ] Rename `.github/workflows/schedule-check.yml.example`
- [ ] Add `APP_URL` secret to repository
- [ ] Add `CRON_SECRET_TOKEN` secret to repository
- [ ] Enable Actions in repository settings
- [ ] Manually trigger workflow to test
- [ ] Verify workflow runs on schedule

### System Cron (Linux/Unix)
- [ ] Add cron job with `crontab -e`
- [ ] Verify cron syntax is correct
- [ ] Check cron logs for execution
- [ ] Verify schedule check is called successfully

## Documentation

- [ ] Review `docs/SCHEDULING.md`
- [ ] Verify all examples work as documented
- [ ] Verify API documentation is accurate
- [ ] Verify cron setup instructions are clear

## Final Verification

- [ ] All test items above are completed
- [ ] No critical bugs found
- [ ] All validation errors are user-friendly
- [ ] Performance is acceptable
- [ ] Documentation is complete and accurate
- [ ] Cron job is properly configured

## Sign-off

- **Tester Name:** ___________________
- **Date:** ___________________
- **Version:** ___________________
- **Status:** [ ] Pass  [ ] Fail
- **Notes:** ___________________
