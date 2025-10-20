# Free Shipping Progress Bar - Visual Flow

## Admin Configuration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Create New Bar                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Select Bar Type                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ 📢 Announcement│  │ ⏱️ Countdown   │  │ 🚚 Free Ship  │   │
│  │     Bar        │  │     Timer      │  │ Progress Bar   │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                   ▲              │
│                                                   │ (Selected)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Quick Start Templates (Optional)                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ Standard $50   │  │ Premium $75    │  │ Minimal $35    │   │
│  │ ━━━━━━━━━━━━━━│  │ ━━━━━━━━━━━━━━│  │ ━━━━━━━━━━━━━━│   │
│  │ 🔵 Blue theme  │  │ 🟣 Purple theme│  │ ⚫ Dark theme  │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Configure Free Shipping Settings                      │
│                                                                 │
│  Threshold Amount: [___$50.00____] Currency: [USD ▼]          │
│                                                                 │
│  Progress Message:                                              │
│  [Add {amount} more for free shipping!____________]           │
│                                                                 │
│  Success Message:                                               │
│  [You've unlocked free shipping! 🎉_____________]             │
│                                                                 │
│  Progress Color: [🎨 #4ade80]  Icon: [✓] Show truck icon     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Design Customization                                  │
│                                                                 │
│  Background: [🎨 #288d40]  Text: [🎨 #ffffff]                 │
│  Font Size: [14px ▼]      Position: [⬆️ Top] [⬇️ Bottom]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Schedule (Optional)                                   │
│                                                                 │
│  Start Date: [📅 Optional]  End Date: [📅 Optional]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │ Save Draft   │    │ Publish Bar  │
          └──────────────┘    └──────────────┘
```

## Customer Experience Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Customer Lands on Store                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Bar Appears (if active & within schedule)                      │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ 🚚 Add $50.00 more for free shipping!          [×]    │     │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │     │
│  │ $0.00 / $50.00                                        │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Customer Adds Product ($25) to Cart                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Automatic Update)
┌─────────────────────────────────────────────────────────────────┐
│  Progress Bar Updates                                           │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ 🚚 Add $25.00 more for free shipping!          [×]    │     │
│  │ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │     │
│  │ $25.00 / $50.00                                       │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Customer Adds More Products ($30)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Reaches Threshold!)
┌─────────────────────────────────────────────────────────────────┐
│  Success State Animation                                        │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ 🚚 You've unlocked free shipping! 🎉          [×]     │     │
│  │ ████████████████████████████████████████████████████  │     │
│  │                                                       │     │
│  └───────────────────────────────────────────────────────┘     │
│  [Success pulse animation plays]                               │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Data Flow

```
┌─────────────────┐
│   Admin UI      │
│   (React)       │
└────────┬────────┘
         │ POST /app/new
         ▼
┌─────────────────┐
│   API Route     │
│   (React Router)│
└────────┬────────┘
         │ Validate & Save
         ▼
┌─────────────────┐
│   Database      │
│   (PostgreSQL)  │
└────────┬────────┘
         │ Query active bar
         ▼
┌─────────────────┐
│  Settings API   │
│  /apps/countdown│
│  /settings      │
└────────┬────────┘
         │ JSON Response
         ▼
┌─────────────────┐
│  Storefront JS  │
│  (Vanilla JS)   │
└────────┬────────┘
         │ Fetch cart.js
         ▼
┌─────────────────┐
│  Shopify Cart   │
│  API (cart.js)  │
└────────┬────────┘
         │ Cart total
         ▼
┌─────────────────┐
│  Update UI      │
│  (DOM updates)  │
└─────────────────┘
```

## Progress Calculation Logic

```javascript
// Input
const cartTotal = 25.00;      // Current cart value
const threshold = 50.00;      // Free shipping threshold

// Calculate
const progress = (cartTotal / threshold) * 100;  // = 50%
const remaining = threshold - cartTotal;          // = $25.00

// Output
progressBar.style.width = `${progress}%`;        // Visual: 50% filled
message.text = `Add $${remaining} more...`;      // Message: "Add $25.00 more..."
```

## State Transitions

```
Initial State (Empty Cart)
     │
     │ Add item ($25)
     ▼
Progress State (Below Threshold)
     │ Cart: $25 / $50
     │ Progress: 50%
     │ Message: "Add $25.00 more..."
     │
     │ Add item ($30)
     ▼
Success State (At/Above Threshold)
     │ Cart: $55 / $50
     │ Progress: 100%
     │ Message: "You've unlocked free shipping! 🎉"
     │
     │ Remove item
     ▼
Progress State (Back Below Threshold)
     │ Cart: $30 / $50
     │ Progress: 60%
     │ Message: "Add $20.00 more..."
```

## Session Persistence

```
┌─────────────────────────────────────────────────────────────┐
│  User closes bar                                            │
│  sessionStorage.setItem('barClosed_xyz123', 'true')         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  User navigates to another page                             │
│  Bar checks: sessionStorage.getItem('barClosed_xyz123')     │
│  Returns: 'true' → Bar stays hidden                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  User opens new tab / incognito                             │
│  Bar checks: sessionStorage.getItem('barClosed_xyz123')     │
│  Returns: null → Bar appears again                          │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

```
Desktop (1920px+)
┌────────────────────────────────────────────────────────────────┐
│ 🚚 Add $25.00 more for free shipping!                    [×] │
│ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ $25.00 / $50.00                                                │
└────────────────────────────────────────────────────────────────┘

Tablet (768px)
┌──────────────────────────────────────────────┐
│ 🚚 Add $25.00 more for free shipping!  [×] │
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ $25.00 / $50.00                              │
└──────────────────────────────────────────────┘

Mobile (480px)
┌─────────────────────────────────┐
│ 🚚 Add $25.00 more         [×] │
│    for free shipping!           │
│ ██████████░░░░░░░░░░░░░░░░░░░░ │
│ $25.00 / $50.00                 │
└─────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│  Fetch Settings │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │Success?│
    └───┬──┬─┘
        │  │
    No  │  │ Yes
        │  │
        ▼  ▼
    ┌───────┐  ┌──────────┐
    │ Retry │  │ Show Bar │
    │ Max 3x│  └──────────┘
    └───┬───┘
        │
        ▼
    ┌───────┐
    │ Hide  │
    │ Bar   │
    └───────┘
```

## Animation Timeline

```
Bar Appearance (0.6s)
├─ 0.0s: translateY(-100%) opacity(0)
├─ 0.3s: translateY(-50%) opacity(0.5)
└─ 0.6s: translateY(0) opacity(1)

Progress Update (0.5s)
├─ 0.0s: width(current%)
├─ 0.25s: width(mid%)
└─ 0.5s: width(target%)

Success Animation (0.6s)
├─ 0.0s: box-shadow(none)
├─ 0.3s: box-shadow(max) scale(1.05)
└─ 0.6s: box-shadow(glow) scale(1)
```

## Multi-Currency Support

```
┌─────────────────────────────────────────────────────────────┐
│  Currency      Symbol    Example Display                    │
├─────────────────────────────────────────────────────────────┤
│  USD           $         Add $25.00 more...                 │
│  EUR           €         Add €25.00 more...                 │
│  GBP           £         Add £25.00 more...                 │
│  CAD           CA$       Add CA$25.00 more...               │
│  AUD           A$        Add A$25.00 more...                │
│  JPY           ¥         Add ¥2500 more...                  │
│  NZD           NZ$       Add NZ$25.00 more...               │
│  INR           ₹         Add ₹2000.00 more...               │
│  SGD           S$        Add S$25.00 more...                │
│  HKD           HK$       Add HK$200.00 more...              │
└─────────────────────────────────────────────────────────────┘
```
