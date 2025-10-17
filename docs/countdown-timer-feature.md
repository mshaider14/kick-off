# Countdown Timer Feature

## Overview
The countdown timer feature allows merchants to create urgency-driven bars with countdown timers for sales, promotions, and time-sensitive offers.

## Timer Types

### 1. Fixed Date/Time Timer
- Counts down to a specific date and time
- One-time countdown that ends at the specified moment
- Best for: Flash sales, product launches, event deadlines

**Configuration:**
- Select "Fixed Date/Time" as timer type
- Set the end date and time using the datetime picker
- Timer will show remaining time until that moment

### 2. Daily Recurring Timer
- Resets every day at a specific time
- Automatically restarts the countdown at midnight or specified time
- Best for: Daily deals, recurring promotions

**Configuration:**
- Select "Daily Recurring" as timer type
- Set the daily reset time (e.g., 23:59 for midnight sales)
- Timer counts down to that time each day and automatically resets

### 3. Evergreen Timer
- Starts countdown from first view for each visitor
- Unique timer per visitor using localStorage
- Best for: Personalized urgency, first-time visitor offers

**Configuration:**
- Select "Evergreen" as timer type
- Set duration in minutes (e.g., 60 for 1-hour countdown)
- Each visitor gets their own countdown starting from their first view

## Timer Display Options

Merchants can customize which time units to display:
- ☑️ Days
- ☑️ Hours
- ☑️ Minutes
- ☑️ Seconds

## End Actions

When the timer reaches zero, choose what happens:

1. **Hide the bar**: The entire bar disappears
2. **Show custom message**: Replace timer with a custom message (e.g., "Sale has ended - Thanks for shopping!")

## Technical Implementation

### Database Schema
New fields added to the `Bar` model:
- `timerType`: "fixed", "daily", or "evergreen"
- `timerEndDate`: DateTime for fixed timer
- `timerDailyTime`: HH:MM string for daily timer
- `timerDuration`: Integer (minutes) for evergreen timer
- `timerFormat`: JSON string with display options
- `timerEndAction`: "hide" or "show_message"
- `timerEndMessage`: Custom message text

### Frontend Components
- **CountdownConfiguration.jsx**: Timer setup UI
- **BarPreview.jsx**: Live countdown preview with all timer types
- Updated **BarTypeSelection.jsx**: Enabled countdown option

### Storefront Integration
- **countdown-bar.js**: Client-side timer logic
  - Fixed timer: Calculates time remaining to target date
  - Daily recurring: Calculates time to next reset, auto-resets daily
  - Evergreen: Uses localStorage to track per-visitor countdown
- **apps.countdown.settings.jsx**: API endpoint serving timer configuration

### API Endpoint
`GET /apps/countdown/settings?shop={shop}`

Returns active countdown bar configuration including:
- Timer type and configuration
- Display format options
- End action settings
- Bar styling (colors, position, etc.)

## Usage Example

### Creating a Flash Sale Timer

1. Navigate to "Create Bar"
2. Select "Countdown Timer" as bar type
3. Configure timer:
   - Type: Fixed Date/Time
   - End Date: Set to sale end date/time
   - Message: "Flash Sale - 50% Off Everything!"
   - Display: Show all units (days, hours, minutes, seconds)
   - End Action: Hide bar
4. Customize design (colors, position)
5. Set schedule if needed
6. Publish

The bar will display with a live countdown and automatically hide when the sale ends.

## Testing Checklist

- [x] Fixed timer counts down correctly to specified date
- [x] Daily recurring timer resets at specified time each day
- [x] Evergreen timer starts fresh for each visitor
- [x] Timer format options control display units
- [x] Hide action removes bar when timer ends
- [x] Show message action displays custom text when timer ends
- [x] Timer persists across page reloads (evergreen uses localStorage)
- [x] Preview shows live countdown matching configuration
- [x] API endpoint returns correct timer configuration
- [x] Validation ensures required fields are filled