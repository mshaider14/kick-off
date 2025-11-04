# Close/Dismiss Button Configuration

## Overview

This feature allows merchants to configure the close button behavior and appearance for announcement bars, including:
- Enabling/disabling the close button
- Positioning (left or right)
- Dismiss behavior (session, 24 hours, or permanent)
- Icon style options

## Database Schema

New fields added to the `Bar` model:

```prisma
closeButtonEnabled  Boolean  @default(true)   // Enable/disable close button
closeButtonPosition String?  @default("right") // "left" or "right"
dismissBehavior     String?  @default("session") // "session", "24hours", "permanent"
closeIconStyle      String?  @default("x")    // "x", "cross", "times", "close"
```

## Admin UI Components

### CloseButtonConfiguration Component

Located at: `app/components/bars/CloseButtonConfiguration.jsx`

The component provides:
1. **Close Button Toggle**: Enable/disable the close button
2. **Position Selector**: Choose between left or right positioning
3. **Dismiss Behavior Options**:
   - **Session**: Bar reappears when visitor reopens their browser
   - **24 hours**: Bar stays hidden for 1 day
   - **Permanent**: Bar never appears again (uses cookies)
4. **Icon Style Options**: Choose from different visual styles (X, Times, Cross, Close text)

### Integration

The component is included in Step 3 (Design) of both:
- Bar creation flow (`app/routes/app.new.jsx`)
- Bar editing flow (`app/routes/app.bars.$id.edit.jsx`)

## Storefront Implementation

### JavaScript Functions

Located at: `extensions/kick-off/assets/countdown-bar.js`

#### Key Functions:

1. **`isBarDismissed(settings)`**
   - Checks if a bar was previously dismissed
   - Respects the configured dismiss behavior (session/24hours/permanent)
   - Returns: `boolean`

2. **`storeDismiss(settings)`**
   - Stores the dismiss preference based on configured behavior
   - Uses sessionStorage for "session" behavior
   - Uses cookies for "24hours" and "permanent" behaviors

3. **`configureCloseButton(closeBtn, settings)`**
   - Configures the close button appearance
   - Handles show/hide based on `closeButtonEnabled`
   - Positions button left or right
   - Applies icon style

### Cookie/Storage Keys

- **Session dismiss**: `sessionStorage.setItem('barClosed_${barId}', 'true')`
- **24-hour dismiss**: Cookie `barDismissed_24h_${barId}` with 1-day expiry
- **Permanent dismiss**: Cookie `barDismissed_permanent_${barId}` with 365-day expiry

## CSS Styling

Close button styling in: `extensions/kick-off/assets/countdown-bar.css`

The close button is positioned absolutely within its container:
- Default position: right side (12px from right edge)
- Left position: 12px from left edge
- Vertically centered using `transform: translateY(-50%)`
- Smooth hover effects with rotation animation
- Responsive design maintained for mobile devices

## API Endpoints

The following endpoints have been updated to include close button configuration:

1. **`/apps/countdown/settings`** (`apps.countdown.settings.jsx`)
   - Returns bar settings including close button config

2. **`/api/bars/active`** (`api.bars.active.jsx`)
   - Returns active bars with close button configuration
   - Supports multi-bar display with priority

## Usage Example

### Admin Configuration

When creating or editing a bar, merchants can:

1. Navigate to Step 3 (Design)
2. Find the "Close Button Settings" card
3. Configure:
   - Toggle close button on/off
   - Select position (left/right)
   - Choose dismiss behavior
   - Select icon style

### Storefront Behavior

**Session Dismiss (Default)**:
- User clicks close button
- Bar disappears
- Bar reappears when user closes and reopens browser

**24-Hour Dismiss**:
- User clicks close button
- Bar disappears
- Cookie is set with 1-day expiry
- Bar reappears after 24 hours

**Permanent Dismiss**:
- User clicks close button
- Bar disappears forever
- Cookie is set with 365-day expiry
- Bar won't appear again unless cookie is cleared

## Migration

To apply the database changes:

```bash
npx prisma migrate deploy
```

Or if developing locally:

```bash
npx prisma migrate dev
```

The migration file is located at:
`prisma/migrations/20251104063000_add_close_button_configuration/migration.sql`

## Testing Checklist

- [x] Close button toggle works in admin UI
- [x] Button position changes correctly (left/right)
- [x] Dismiss behavior options save to database
- [x] Close button configuration renders on storefront
- [ ] "Session" dismiss hides until browser close (requires manual test)
- [ ] "24 hours" dismiss hides for 1 day (requires manual test)
- [ ] "Permanent" dismiss hides forever (requires manual test)
- [ ] Cookie stores dismiss preference (requires manual test)
- [ ] Icon style options apply correctly (requires manual test)
- [ ] Closed bars don't reappear per settings (requires manual test)

## Browser Compatibility

The implementation uses:
- `sessionStorage` (supported in all modern browsers)
- Cookies with standard `document.cookie` API
- CSS absolute positioning and transforms
- ES6+ JavaScript features

Minimum browser requirements:
- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 15+

## Security Considerations

1. **Cookie Scope**: Cookies are set with `path=/` to work across the entire site
2. **Cookie Expiry**: Properly configured expiry dates prevent indefinite storage
3. **No Sensitive Data**: Only bar IDs and boolean flags are stored
4. **Client-Side Only**: No server-side session management required

## Future Enhancements

Potential improvements:
1. Custom dismiss durations (e.g., 7 days, 30 days)
2. More icon style variations with custom SVG paths
3. Dismiss button size customization
4. Dismiss button color customization
5. Animation options for dismiss action
6. Analytics tracking for dismiss rates
