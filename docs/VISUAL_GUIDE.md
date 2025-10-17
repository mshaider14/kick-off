# Bar Creation Flow - Visual Guide

## 1. Bar List Page (`/app/bars`)

### Empty State
```
┌─────────────────────────────────────────────────────────────┐
│ Announcement Bars                         [Create Bar]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    📋 Create your first                      │
│                    announcement bar                          │
│                                                              │
│   Display important messages, promotions, and calls-to-      │
│   action with customizable announcement bars. Get started    │
│   by creating your first bar.                                │
│                                                              │
│                   [Create Bar]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### With Bars
```
┌─────────────────────────────────────────────────────────────┐
│ Announcement Bars                         [Create Bar]      │
├─────────────────────────────────────────────────────────────┤
│ Your Bars                                    3 bars          │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Message           Type         Status    Position  Date  │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ Summer Sale...    Announcement [Active]   Top     Jan 1  │ │
│ │ Free Shipping...  Announcement [Draft]    Bottom  Jan 2  │ │
│ │ New Collection... Announcement [Active]   Top     Jan 3  │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 2. Bar Creation Page (`/app/bars/new`)

### Step Progress
```
┌─────────────────────────────────────────────────────────────┐
│ ← Bars    Create New Bar                  Step 1 of 4      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Bar Type    Content    Design    Schedule                  │
│  ━━━━━━━━    ────────    ──────    ────────                 │
│  (active)    (future)   (future)  (future)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Step 1: Bar Type Selection
```
┌─────────────────────────────────────┬───────────────────────┐
│                                     │                       │
│  Select Bar Type                    │  Preview              │
│                                     │  ┌─────────────────┐  │
│  Choose the type of bar you want   │  │ Position: Top    │  │
│  to create for your store.          │  └─────────────────┘  │
│                                     │                       │
│  ◉ Announcement Bar                 │  ┌─────────────────┐  │
│    Display important messages       │  │ Your message    │  │
│    and promotional content with     │  │ here            │  │
│    an optional call-to-action       │  └─────────────────┘  │
│    button                           │                       │
│                                     │  This is how your   │
│  ○ Countdown Timer (Coming Soon)    │  bar will appear    │
│    Create urgency with a countdown  │  on your storefront │
│    timer for sales and promotions   │                       │
│                                     │                       │
│  ○ Free Shipping Bar (Coming Soon)  │                       │
│    Show a progress bar for free     │                       │
│    shipping threshold                │                       │
│                                     │                       │
│                                     │                       │
│  [Previous] (disabled)      [Next]  │                       │
│                                     │                       │
└─────────────────────────────────────┴───────────────────────┘
```

### Step 2: Content Configuration
```
┌─────────────────────────────────────┬───────────────────────┐
│                                     │                       │
│  Configure Content                  │  Preview              │
│                                     │  ┌─────────────────┐  │
│  Set up the message and call-to-    │  │ Position: Top    │  │
│  action for your announcement bar.  │  └─────────────────┘  │
│                                     │                       │
│  Bar Message                        │  ┌─────────────────┐  │
│  ┌───────────────────────────────┐  │  │ Summer Sale -   │  │
│  │ Summer Sale - 20% Off!        │  │  │ 20% Off!        │  │
│  └───────────────────────────────┘  │  │  [Shop Now]     │  │
│  The main message displayed         │  └─────────────────┘  │
│                                     │                       │
│  Call-to-Action Button Text         │  This is how your   │
│  ┌───────────────────────────────┐  │  bar will appear    │
│  │ Shop Now                      │  │  on your storefront │
│  └───────────────────────────────┘  │                       │
│  Text for the button                │                       │
│                                     │                       │
│  Button Link URL                    │                       │
│  ┌───────────────────────────────┐  │                       │
│  │ /collections/sale             │  │                       │
│  └───────────────────────────────┘  │                       │
│  Where the button will redirect    │                       │
│                                     │                       │
│  [Previous]                 [Next]  │                       │
│                                     │                       │
└─────────────────────────────────────┴───────────────────────┘
```

### Step 3: Design Customization
```
┌─────────────────────────────────────┬───────────────────────┐
│                                     │                       │
│  Customize Design                   │  Preview              │
│                                     │  ┌─────────────────┐  │
│  Choose colors, font size, and      │  │ Position: Top    │  │
│  position for your announcement.    │  └─────────────────┘  │
│                                     │                       │
│  Background Color                   │  ┌─────────────────┐  │
│  ┌─────────────────────┐            │  │░░░░░░░░░░░░░░░░░│  │
│  │ [Color Picker UI]   │            │  │░ Summer Sale - ░│  │
│  │     🎨              │            │  │░ 20% Off!      ░│  │
│  └─────────────────────┘            │  │░  [Shop Now]   ░│  │
│  Preview: #288d40                   │  │░░░░░░░░░░░░░░░░░│  │
│                                     │  └─────────────────┘  │
│  Text Color                         │                       │
│  ┌─────────────────────┐            │  This is how your   │
│  │ [Color Picker UI]   │            │  bar will appear    │
│  │     🎨              │            │  on your storefront │
│  └─────────────────────┘            │                       │
│  Preview: #ffffff                   │                       │
│                                     │                       │
│  Font Size                          │                       │
│  ┌───────────────────────────────┐  │                       │
│  │ Medium (14px)            ▼    │  │                       │
│  └───────────────────────────────┘  │                       │
│                                     │                       │
│  Bar Position                       │                       │
│  ◉ Top of page                      │                       │
│  ○ Bottom of page                   │                       │
│                                     │                       │
│  [Previous]                 [Next]  │                       │
│                                     │                       │
└─────────────────────────────────────┴───────────────────────┘
```

### Step 4: Targeting & Schedule
```
┌─────────────────────────────────────┬───────────────────────┐
│                                     │                       │
│  Targeting & Schedule               │  Preview              │
│                                     │  ┌─────────────────┐  │
│  Set when your announcement bar     │  │ Position: Top    │  │
│  should be displayed (optional).    │  └─────────────────┘  │
│                                     │                       │
│  Start Date & Time (Optional)       │  ┌─────────────────┐  │
│  ┌───────────────────────────────┐  │  │░░░░░░░░░░░░░░░░░│  │
│  │ 2024-01-01  09:00 AM     🗓️  │  │  │░ Summer Sale - ░│  │
│  └───────────────────────────────┘  │  │░ 20% Off!      ░│  │
│  When the bar should start          │  │░  [Shop Now]   ░│  │
│  displaying. Leave empty to show    │  │░░░░░░░░░░░░░░░░░│  │
│  immediately.                        │  └─────────────────┘  │
│                                     │                       │
│  End Date & Time (Optional)         │  This is how your   │
│  ┌───────────────────────────────┐  │  bar will appear    │
│  │ 2024-12-31  11:59 PM     🗓️  │  │  on your storefront │
│  └───────────────────────────────┘  │                       │
│  When the bar should stop           │                       │
│  displaying. Leave empty for no     │                       │
│  end date.                          │                       │
│                                     │                       │
│  Note: Advanced targeting options   │                       │
│  (specific pages, customer          │                       │
│  segments, etc.) will be available  │                       │
│  in a future update.                │                       │
│                                     │                       │
│  [Previous]  [Save as Draft]        │                       │
│              [Publish Bar] ←─────────────────── Primary     │
│                                     │                       │
└─────────────────────────────────────┴───────────────────────┘
```

### Success Toast
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                 ✓ Bar published successfully!                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 3. Form Validation Examples

### Missing Required Field
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│          ⚠️ Please fix errors: Message is required           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### CTA Without Link
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   ⚠️ Please fix errors: Link URL is required when button    │
│      text is provided                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 4. Real Preview Updates

The preview on the right side updates in real-time as you:

✅ Type in the message field
✅ Add/remove CTA text
✅ Change background color
✅ Change text color  
✅ Adjust font size
✅ Switch position (top/bottom)

**No page refresh needed!** 🎉

## 5. Navigation Flow

```
Start: /app/bars
   │
   ├─ Click "Create Bar"
   │
   ▼
/app/bars/new (Step 1)
   │
   ├─ Select bar type
   ├─ Click "Next"
   │
   ▼
/app/bars/new (Step 2)
   │
   ├─ Enter message
   ├─ Add CTA (optional)
   ├─ Watch preview update
   ├─ Click "Next"
   │
   ▼
/app/bars/new (Step 3)
   │
   ├─ Pick colors
   ├─ Set font size
   ├─ Choose position
   ├─ Watch preview update
   ├─ Click "Next"
   │
   ▼
/app/bars/new (Step 4)
   │
   ├─ Set dates (optional)
   ├─ Click "Publish Bar"
   │
   ▼
Success! → Back to /app/bars
   │
   ▼
See your new bar in the list! ✨
```

## 6. Color Picker UI

When clicking on a color picker, Polaris provides:

```
┌──────────────────────┐
│                      │
│  🎨 Color Spectrum   │
│  ┌────────────────┐  │
│  │  [Gradient]    │  │
│  │  [   UI   ]    │  │
│  └────────────────┘  │
│                      │
│  Hue Slider:         │
│  ├────●────────────┤ │
│                      │
│  Result: #288d40     │
│                      │
└──────────────────────┘
```

## 7. Data Table (Bar List)

```
┌──────────────────────────────────────────────────────────────┐
│ Message            Type          Status      Position   Date  │
├──────────────────────────────────────────────────────────────┤
│ Summer Sale - 2... Announcement  [Active]   Top        Jan 1 │
│ Free Shipping...   Announcement  [Draft]    Bottom     Jan 2 │
│ New Collection...  Announcement  [Active]   Top        Jan 3 │
└──────────────────────────────────────────────────────────────┘
```

Status badges:
- [Active] = Green badge (isActive: true)
- [Draft] = Blue badge (isActive: false)

## 8. Mobile Responsive

The layout adapts on smaller screens:
- Preview moves below form
- Step indicator becomes compact
- Buttons stack vertically
- Form fields use full width

## Key UI Elements

**Colors Used:**
- Primary Green: `#288d40` (default background)
- White: `#ffffff` (default text)
- Success: Green badges
- Info: Blue badges
- Error: Red toasts

**Typography:**
- Headings: Shopify Polaris headingLg, headingMd
- Body: Polaris bodyMd
- Subdued text: color="subdued"

**Components:**
- Polaris Page, Layout, Card
- Polaris Form, TextField, Select
- Polaris ColorPicker, ChoiceList
- Polaris Button, ButtonGroup
- Polaris Toast, Badge
- Polaris DataTable

All following Shopify Polaris design system! 🎨
