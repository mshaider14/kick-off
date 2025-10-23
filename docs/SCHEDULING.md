# Bar Scheduling System

## Overview

The bar scheduling system allows automatic activation and deactivation of announcement bars based on configured schedules. This ensures bars appear and disappear at the right times without manual intervention.

## Features

### Frontend Features
- **Start Options:**
  - Start immediately when published
  - Start at a specific date and time
- **End Options:**
  - Never end (run indefinitely)
  - End at a specific date and time
- **Timezone Selection:** Choose from common timezones
- **Schedule Preview:** View a summary of your schedule before publishing
- **Validation:** Prevent scheduling errors (past dates, end before start, etc.)

### Backend Features
- **Automatic Activation:** Bars automatically become active at their scheduled start time
- **Automatic Deactivation:** Bars automatically deactivate at their scheduled end time
- **Schedule Status API:** Check if a bar is currently scheduled and should be active
- **Timezone Support:** All schedules respect the configured timezone

## Database Schema

The following fields are added to the `Bar` model:

```prisma
model Bar {
  // ... other fields ...
  
  startDate              DateTime? // When the bar should start displaying
  endDate                DateTime? // When the bar should stop displaying
  timezone               String?   @default("UTC") // IANA timezone
  scheduleStartImmediate Boolean   @default(false) // Start immediately when published
  scheduleEndNever       Boolean   @default(false) // Run indefinitely
}
```

## Setting Up the Cron Job

To enable automatic schedule checking, you need to set up a cron job that periodically calls the schedule check endpoint.

### Environment Variable

Set the following environment variable for security:

```bash
CRON_SECRET_TOKEN=your-random-secret-token-here
```

### Cron Job Configuration

#### Option 1: System Cron (Linux/Unix)

Add this to your crontab (`crontab -e`):

```bash
# Check schedules every 5 minutes
*/5 * * * * curl -X POST "https://your-app-domain.com/api/schedule/check?token=your-random-secret-token-here" > /dev/null 2>&1
```

#### Option 2: Vercel Cron Jobs

If deploying on Vercel, add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/schedule/check?token=your-random-secret-token-here",
    "schedule": "*/5 * * * *"
  }]
}
```

#### Option 3: GitHub Actions

Create `.github/workflows/schedule-check.yml`:

```yaml
name: Bar Schedule Check
on:
  schedule:
    # Run every 5 minutes
    - cron: '*/5 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  check-schedules:
    runs-on: ubuntu-latest
    steps:
      - name: Call schedule check endpoint
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/schedule/check?token=${{ secrets.CRON_SECRET_TOKEN }}"
```

#### Option 4: Heroku Scheduler

If deploying on Heroku, install the Heroku Scheduler add-on:

```bash
heroku addons:create scheduler:standard
```

Then add a job in the Heroku dashboard:
- Command: `curl -X POST "https://your-app.herokuapp.com/api/schedule/check?token=$CRON_SECRET_TOKEN"`
- Frequency: Every 10 minutes (or your preference)

#### Option 5: Node.js Cron (if running your own server)

Install node-cron:

```bash
npm install node-cron
```

Create `app/services/scheduler.server.js`:

```javascript
import cron from 'node-cron';

export function startScheduler() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const response = await fetch(
        `${process.env.APP_URL}/api/schedule/check?token=${process.env.CRON_SECRET_TOKEN}`,
        { method: 'POST' }
      );
      const data = await response.json();
      console.log('Schedule check:', data);
    } catch (error) {
      console.error('Schedule check failed:', error);
    }
  });
  
  console.log('Scheduler started - checking schedules every 5 minutes');
}
```

Then import and call `startScheduler()` in your server entry point.

## API Endpoints

### Check All Schedules

**Endpoint:** `POST /api/schedule/check`

**Query Parameters:**
- `token` (required): Secret token for authentication

**Response:**
```json
{
  "success": true,
  "activated": 2,
  "deactivated": 1,
  "message": "Schedule check completed: 2 activated, 1 deactivated",
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

### Check Bar Schedule Status

**Endpoint:** `GET /api/bars/:barId/schedule-status`

**Query Parameters:**
- `shop` (required): Shop domain

**Response:**
```json
{
  "success": true,
  "barId": "bar123",
  "isScheduled": true,
  "isActive": true,
  "shouldBeActive": true,
  "schedule": {
    "startDate": "2025-10-23T10:00:00.000Z",
    "endDate": "2025-10-24T10:00:00.000Z",
    "timezone": "America/New_York",
    "startImmediate": false,
    "endNever": false
  },
  "message": "Bar is scheduled until 2025-10-24T10:00:00.000Z"
}
```

## Usage Examples

### Creating a Bar with Immediate Start

1. Go to "Create New Bar"
2. Configure your bar content
3. On the Schedule step:
   - Check "Start immediately when published"
   - Choose your timezone
   - Optionally set an end date or check "Never end"
4. Click "Publish Bar"

The bar will become active immediately.

### Creating a Bar with Scheduled Start

1. Go to "Create New Bar"
2. Configure your bar content
3. On the Schedule step:
   - Select your timezone
   - Set a "Start Date & Time" in the future
   - Optionally set an "End Date & Time"
4. Click "Publish Bar"

The bar will automatically activate at the scheduled time (handled by the cron job).

### Creating a Bar that Runs Indefinitely

1. Go to "Create New Bar"
2. Configure your bar content
3. On the Schedule step:
   - Check "Start immediately when published" OR set a start date
   - Check "Never end (run indefinitely)"
   - Select your timezone
4. Click "Publish Bar"

The bar will continue displaying until you manually deactivate it.

## Timezone Handling

All schedules are stored in the database as UTC timestamps but are interpreted based on the configured timezone. This ensures:
- Consistent behavior across different server locations
- Accurate scheduling for users in different timezones
- Easy conversion for display purposes

## Testing

### Manual Testing Checklist

- [ ] Schedule options are selectable
- [ ] Date/time pickers work correctly
- [ ] Timezone selection updates times
- [ ] Schedule summary displays correctly
- [ ] Scheduled bars activate automatically (via cron)
- [ ] Scheduled bars deactivate automatically (via cron)
- [ ] Schedule saves to database
- [ ] Can edit schedule after creation
- [ ] Immediate start activates bar instantly
- [ ] Past dates show validation error

### Testing the Cron Job

To manually test the schedule check endpoint:

```bash
curl -X POST "http://localhost:3000/api/schedule/check?token=your-token"
```

You should see a response indicating how many bars were activated or deactivated.

## Troubleshooting

### Bars Not Activating Automatically

1. Check if the cron job is running:
   - Verify cron job logs
   - Manually call the schedule check endpoint
   
2. Verify the schedule configuration:
   - Check the bar's `startDate`, `endDate`, and `timezone` in the database
   - Use the schedule status API to see if the bar should be active
   
3. Check server time:
   - Ensure your server's clock is accurate
   - Verify timezone settings

### Bars Activating at Wrong Time

1. Check timezone configuration:
   - Verify the `timezone` field in the database
   - Ensure the cron job is running frequently enough
   
2. Check schedule dates:
   - View the schedule summary before publishing
   - Verify dates are in the correct timezone

## Future Enhancements

Potential improvements for the scheduling system:

- Visual calendar view for scheduling
- Recurring schedules (weekly, monthly patterns)
- Schedule templates
- Schedule history/audit log
- Email notifications when bars activate/deactivate
- Multiple active bars with priority ordering
- Schedule conflicts detection
