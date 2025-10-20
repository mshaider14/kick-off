# Free Shipping Progress Bar Feature

## Overview

The Free Shipping Progress Bar is a dynamic, cart-aware announcement bar that displays progress toward a free shipping threshold. It encourages customers to add more items to their cart to qualify for free shipping, thereby increasing Average Order Value (AOV).

## Key Features

### Admin Features
- ✅ Configurable threshold amount
- ✅ Multi-currency support (10 currencies)
- ✅ Customizable progress bar color
- ✅ Custom messages (before & after threshold)
- ✅ Optional shipping truck icon
- ✅ Live preview with animation
- ✅ Quick-start templates
- ✅ Full design customization
- ✅ Scheduling support

### Customer Features
- ✅ Real-time progress updates
- ✅ Dynamic cart tracking
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Session persistence
- ✅ Close/dismiss option

## Technical Architecture

### Database Schema

```prisma
model Bar {
  // ... existing fields ...
  
  // Free shipping fields
  shippingThreshold     Float?   // Threshold amount
  shippingCurrency      String?  // Currency code (USD, EUR, etc.)
  shippingGoalText      String?  // Message before threshold
  shippingReachedText   String?  // Message after threshold
  shippingProgressColor String?  // Progress bar fill color
  shippingShowIcon      Boolean  @default(true) // Show icon
}
```

### Components

#### Admin UI Components
- `FreeShippingConfiguration.jsx` - Configuration form
- `BarTypeSelection.jsx` - Bar type selector (updated)
- `BarPreview.jsx` - Live preview (updated)
- `app.new.jsx` - Bar creation page (updated)
- `app._index.jsx` - Bar list page (updated)

#### Storefront Components
- `free-shipping-bar.liquid` - Liquid template
- `free-shipping-bar.js` - JavaScript handler
- `free-shipping-bar.css` - Styles

### API Endpoints

#### Settings Endpoint
**GET** `/apps/countdown/settings?shop={shop_domain}`

Response for shipping bars:
```json
{
  "success": true,
  "settings": {
    "id": "clxxx",
    "type": "shipping",
    "barColor": "#288d40",
    "textColor": "#ffffff",
    "barPosition": "top",
    "shippingThreshold": 50,
    "shippingCurrency": "USD",
    "shippingGoalText": "Add {amount} more for free shipping!",
    "shippingReachedText": "You've unlocked free shipping! 🎉",
    "shippingProgressColor": "#4ade80",
    "shippingShowIcon": true
  }
}
```

## Configuration Options

### Threshold Configuration
- **Amount**: Any positive decimal value
- **Currency**: USD, EUR, GBP, CAD, AUD, JPY, NZD, INR, SGD, HKD
- **Validation**: Must be > 0

### Message Configuration
- **Goal Message**: Up to 150 characters, must include `{amount}` placeholder
  - Example: "Add {amount} more for free shipping!"
  - The `{amount}` will be replaced with the remaining amount

- **Success Message**: Up to 150 characters
  - Example: "You've unlocked free shipping! 🎉"

### Design Configuration
- **Background Color**: Hex color code
- **Text Color**: Hex color code
- **Progress Bar Color**: Hex color code
- **Font Size**: 12-20px
- **Position**: Top or Bottom
- **Show Icon**: Toggle shipping truck emoji

## How It Works

### Cart Tracking

The JavaScript handler uses multiple methods to track cart changes:

1. **Theme Events**: Listens for `cart:updated` event
2. **Fetch Interception**: Monitors cart API calls
3. **Polling**: Periodic checks (fallback)

```javascript
// Cart tracking example
async function getCartTotal() {
  const response = await fetch('/cart.js');
  const cart = await response.json();
  return cart.total_price / 100; // Convert from cents
}
```

### Progress Calculation

```javascript
const progressPercentage = Math.min((cartTotal / threshold) * 100, 100);
const remaining = Math.max(threshold - cartTotal, 0);
```

### Message Replacement

```javascript
const message = goalText.replace('{amount}', formatAmount(remaining, currency));
```

## User Flow

### Admin Setup
1. Navigate to "Create New Bar"
2. Select "Free Shipping Progress Bar"
3. Choose a template (optional)
4. Configure threshold and messages
5. Customize design
6. Set schedule (optional)
7. Publish

### Customer Experience
1. Customer lands on store → Bar appears
2. Customer adds product → Progress updates
3. Cart reaches 50% → Visual encouragement
4. Cart reaches threshold → Success celebration! 🎉
5. Customer proceeds to checkout → Increased AOV ✅

## Templates

### Standard Free Shipping ($50)
```json
{
  "name": "Standard Free Shipping",
  "shippingThreshold": 50,
  "shippingCurrency": "USD",
  "shippingGoalText": "Add {amount} more for free shipping!",
  "shippingReachedText": "You've unlocked free shipping! 🎉",
  "backgroundColor": "#0066cc",
  "shippingProgressColor": "#4ade80"
}
```

### Premium Threshold ($75)
```json
{
  "name": "Premium Threshold",
  "shippingThreshold": 75,
  "shippingGoalText": "Spend {amount} more to unlock FREE shipping! 🚚",
  "shippingReachedText": "Congrats! You earned free shipping! 🎊",
  "backgroundColor": "#6b46c1",
  "shippingProgressColor": "#fbbf24"
}
```

### Minimal Theme ($35)
```json
{
  "name": "Minimal Theme",
  "shippingThreshold": 35,
  "shippingGoalText": "{amount} away from free delivery",
  "shippingReachedText": "Free shipping unlocked ✓",
  "backgroundColor": "#1f2937",
  "shippingProgressColor": "#10b981",
  "shippingShowIcon": false
}
```

## Best Practices

### Threshold Selection
- **Research**: Check competitor thresholds
- **Testing**: A/B test different amounts
- **Sweet Spot**: Most merchants succeed with $50-$75
- **Consideration**: Factor in average order value and margins

### Message Crafting
- **Clear**: Use simple, direct language
- **Urgent**: Create sense of proximity to goal
- **Celebratory**: Make success feel rewarding
- **Branded**: Match your store's voice

### Design Tips
- **Contrast**: Ensure text is readable
- **Progress Color**: Use attention-grabbing color (green/gold)
- **Position**: Top works best for visibility
- **Icon**: Use icon for brand consistency

### Technical Optimization
- **Cache**: API responses cached for 60 seconds
- **Performance**: Progress updates are debounced
- **Fallback**: Works even if cart events don't fire
- **Session**: Remembers if user closed the bar

## Troubleshooting

### Bar Not Appearing
1. Check bar is active in admin
2. Verify threshold is > 0
3. Check schedule dates
4. Clear browser cache
5. Check browser console for errors

### Progress Not Updating
1. Verify cart.js is accessible
2. Check for CORS issues
3. Verify theme supports cart events
4. Check fetch interception is working

### Incorrect Amounts
1. Verify currency matches store currency
2. Check cart.js returns correct format
3. Verify threshold saved correctly
4. Check for decimal precision issues

### Styling Issues
1. Check for CSS conflicts
2. Verify custom theme styles
3. Test responsive breakpoints
4. Check z-index conflicts

## Migration Guide

If upgrading from a previous version:

1. Run database migration:
```bash
npx prisma migrate deploy
```

2. Update API endpoint if customized

3. Clear storefront cache:
```bash
shopify app deploy
```

4. Test on staging environment first

## Analytics & Tracking

The feature includes built-in Google Analytics 4 events:

### Events Tracked
- `bar_impression` - When bar is displayed
- `free_shipping_progress` - Progress milestones
- `bar_closed` - When user dismisses bar

### Event Data
```javascript
{
  'event': 'free_shipping_progress',
  'bar_id': 'clxxx',
  'progress_percentage': 75,
  'cart_value': 37.50,
  'threshold': 50,
  'is_success': false
}
```

## Performance Metrics

### Load Time
- Bar initialization: < 100ms
- First render: < 500ms
- Progress update: < 50ms

### Bundle Size
- JavaScript: ~7.8KB (minified)
- CSS: ~4.2KB (minified)
- Total: ~12KB (compressed ~4KB)

### API Calls
- Initial load: 1 request
- Updates: 0 (uses local cart.js)
- Retry on failure: Max 3 attempts

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation support
- ✅ High contrast mode compatible
- ✅ Focus indicators
- ✅ Semantic HTML

## Security

- ✅ Input validation on server
- ✅ SQL injection protection (Prisma)
- ✅ XSS prevention (escaped output)
- ✅ CORS headers configured
- ✅ Rate limiting on API

## Future Enhancements

Potential features for future versions:

- [ ] Tiered shipping (different thresholds)
- [ ] Product-specific progress tracking
- [ ] A/B testing built-in
- [ ] Advanced analytics dashboard
- [ ] Geolocation-based thresholds
- [ ] Multi-language support
- [ ] Email capture at threshold
- [ ] Social share functionality

## Support

For issues or questions:
1. Check the testing guide: `docs/free-shipping-testing-guide.md`
2. Review browser console logs
3. Check API response format
4. Verify database schema is up to date

## Credits

Developed as part of the Kick-off Shopify App.
Built with React Router, Prisma, and Shopify App Bridge.
