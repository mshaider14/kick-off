# Kick-off Theme App Extension

A Shopify theme app extension for displaying announcement bars, countdown timers, and free shipping progress bars on your storefront.

## Features

### Bar Types
- **Announcement Bars**: Simple promotional messages with optional CTA buttons
- **Countdown Bars**: Time-sensitive offers with countdown timers (fixed, daily recurring, evergreen)
- **Free Shipping Bars**: Dynamic progress bars showing cart value progress toward free shipping

### Targeting & Display Rules
- **Device Targeting**: Desktop only, mobile only, or both
- **Page Targeting**: Homepage, product pages, collection pages, cart, specific URLs, or URL patterns
- **Display Frequency**: Always, once per session, or once per visitor (with cookie persistence)

### Design Features
- Fully customizable colors, fonts, padding, borders, and shadows
- Smooth slide-in/slide-out animations
- Responsive design with mobile-first approach
- Close button with session persistence
- No layout shift on load (performance optimized)

### Analytics
- View tracking (impression events)
- Click tracking (CTA button clicks)
- Close button tracking

## Installation

The theme extension is automatically available when the Kick-off app is installed on your Shopify store. To activate it:

1. Go to your Shopify admin
2. Navigate to **Online Store > Themes**
3. Click **Customize** on your active theme
4. Add the **Countdown & CTA Bar** app block to your theme
5. The bar will appear based on your configured settings in the Kick-off app

## API Endpoints

### GET /api/bars/active

Fetches active bars for a shop with priority-based ordering.

**Query Parameters:**
- `shop` (required): Shop domain (e.g., "mystore.myshopify.com")
- `limit` (optional): Maximum number of bars to return (default: 1, max: 5)

**Response:**
```json
{
  "success": true,
  "bars": [
    {
      "id": "clx123abc",
      "shop": "mystore.myshopify.com",
      "type": "announcement",
      "message": "Free shipping on orders over $50!",
      "ctaText": "Shop Now",
      "ctaLink": "/collections/all",
      "backgroundColor": "#288d40",
      "textColor": "#ffffff",
      "position": "top",
      "targetDevices": "both",
      "targetPages": "all",
      "displayFrequency": "always"
    }
  ]
}
```

### GET /apps/countdown/settings

App proxy endpoint for fetching a single active bar (backward compatible).

**Query Parameters:**
- `shop` (required): Shop domain

**Response:**
```json
{
  "success": true,
  "settings": {
    "id": "clx123abc",
    "type": "countdown",
    "barMessage": "Sale ends in:",
    "timerType": "fixed",
    "timerEndDate": "2024-12-31T23:59:59.000Z"
  }
}
```

### POST /apps/countdown/analytics/track-view

Track when a bar is viewed (impression).

**Request Body:**
```json
{
  "shop": "mystore.myshopify.com",
  "barId": "clx123abc"
}
```

### POST /apps/countdown/analytics/track-click

Track when a CTA button is clicked.

**Request Body:**
```json
{
  "shop": "mystore.myshopify.com",
  "barId": "clx123abc",
  "ctaLink": "/products/featured"
}
```

## Configuration

Bars are configured through the Kick-off app admin interface. See the main app documentation for details on:

- Creating and editing bars
- Setting up targeting rules
- Configuring countdown timers
- Setting up free shipping thresholds
- Viewing analytics

## Performance

The theme extension is optimized for performance:

- **Render time**: < 100ms typical
- **CSS containment**: Prevents layout thrashing
- **Lazy evaluation**: Targeting rules evaluated client-side
- **Cached API responses**: 60-second cache on bar data
- **Minimal DOM manipulation**: Single paint/reflow cycle

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Troubleshooting

### Bar not showing
1. Check that the bar is active in the Kick-off app admin
2. Verify the bar's schedule (start/end dates)
3. Check targeting rules (device, page, frequency)
4. Look for JavaScript errors in browser console
5. Verify the theme block is added to the theme

### Performance issues
1. Check browser console for render time logs
2. Ensure only one bar is active at a time
3. Verify bar content is not too large
4. Check for conflicts with other apps

### Analytics not tracking
1. Verify app proxy is configured correctly in `shopify.app.toml`
2. Check network requests in browser dev tools
3. Ensure bar ID is valid and exists in database
4. Check for CORS or CSP issues

## Development

### File Structure
```
extensions/kick-off/
├── assets/
│   ├── countdown-bar.js    # Main JavaScript logic
│   ├── countdown-bar.css   # Styles and animations
│   └── thumbs-up.png       # Assets
├── blocks/
│   └── countdown-bar.liquid # Liquid template
├── locales/               # Translations
└── shopify.extension.toml # Extension config
```

### Local Development

1. Run the Shopify CLI:
   ```bash
   npm run dev
   ```

2. Theme extension automatically loads in preview

3. Make changes to files in `extensions/kick-off/`

4. Changes hot-reload in the theme preview

### Testing

Test the extension by:
1. Creating test bars in the app admin
2. Viewing the storefront in different devices/browsers
3. Testing different targeting rules
4. Verifying analytics in app admin

## License

Part of the Kick-off Shopify app.
