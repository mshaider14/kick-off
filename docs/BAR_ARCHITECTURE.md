# Bar Creation Flow Architecture

## Component Structure

```
app/routes/app.bars.new.jsx (Main Page)
├── Step Progress Indicator
│   └── Shows current step (1-4)
│
├── Multi-Step Form
│   ├── Step 1: BarTypeSelection
│   │   └── Radio buttons (announcement, countdown*, shipping*)
│   │
│   ├── Step 2: ContentConfiguration
│   │   ├── Message text field
│   │   ├── CTA text field (optional)
│   │   └── CTA link field (conditional)
│   │
│   ├── Step 3: DesignCustomization
│   │   ├── Background color picker
│   │   ├── Text color picker
│   │   ├── Font size selector
│   │   └── Position choice list
│   │
│   └── Step 4: TargetingSchedule
│       ├── Start date/time (optional)
│       └── End date/time (optional)
│
├── Navigation Controls
│   ├── Previous button (disabled on step 1)
│   └── Next button OR Save buttons (on step 4)
│       ├── Save as Draft
│       └── Publish Bar
│
└── BarPreview (Sidebar)
    └── Real-time preview of bar appearance
```

## Data Flow

```
User Input → Form State → Preview Component
                ↓
          Validation Check
                ↓
        Form Submission (POST)
                ↓
        API Endpoint (/api/bars)
                ↓
        Backend Validation
                ↓
        Database (Bar model)
                ↓
        Response → Success/Error Toast
                ↓
        Redirect to /app/bars
```

## API Endpoints

```
POST /api/bars
├── Authentication: Shopify admin session
├── Validation: Comprehensive field validation
├── Action: Create new bar in database
└── Response: Bar object with ID

GET /api/bars
├── Authentication: Shopify admin session
├── Action: List all bars for shop
└── Response: Array of bar objects
```

## Database Schema

```
Bar Model
├── id (String, cuid, Primary Key)
├── shop (String, indexed)
├── type (String, default: "announcement")
├── message (String, required)
├── ctaText (String, optional)
├── ctaLink (String, optional)
├── backgroundColor (String, default: "#288d40")
├── textColor (String, default: "#ffffff")
├── fontSize (Int, default: 14)
├── position (String, default: "top")
├── isActive (Boolean, default: false)
├── startDate (DateTime, optional)
├── endDate (DateTime, optional)
├── createdAt (DateTime, auto)
└── updatedAt (DateTime, auto)

Indexes:
├── [shop]
└── [shop, isActive]
```

## Validation Rules

### Message
- Required
- Non-empty string
- Max 200 characters (frontend)

### Type
- Required
- One of: "announcement", "countdown", "shipping"

### CTA
- ctaText: Optional, max 50 characters
- ctaLink: Required if ctaText is provided

### Colors
- backgroundColor: Valid hex color (#RRGGBB)
- textColor: Valid hex color (#RRGGBB)

### Font Size
- Integer between 10 and 24

### Position
- One of: "top", "bottom"

### Dates
- startDate: Valid ISO datetime (optional)
- endDate: Valid ISO datetime (optional)
- endDate must be after startDate

## User Journey

```
1. Navigate to /app/bars
   └── Shows list of bars or empty state

2. Click "Create Bar"
   └── Redirects to /app/bars/new

3. Step 1: Select Bar Type
   └── Choose "Announcement"
   └── Click "Next"

4. Step 2: Configure Content
   └── Enter message: "Summer Sale - 20% Off!"
   └── Enter CTA text: "Shop Now"
   └── Enter CTA link: "/collections/sale"
   └── Preview updates in real-time →
   └── Click "Next"

5. Step 3: Customize Design
   └── Select background color (color picker)
   └── Select text color (color picker)
   └── Choose font size: 14px
   └── Choose position: Top
   └── Preview updates in real-time →
   └── Click "Next"

6. Step 4: Set Schedule
   └── (Optional) Set start date
   └── (Optional) Set end date
   └── Click "Save as Draft" or "Publish Bar"

7. Success
   └── Toast: "Bar published successfully!"
   └── Redirect to /app/bars
   └── See new bar in list
```

## Preview Component Behavior

The BarPreview component updates instantly when:
- Message changes
- CTA text changes
- Background color changes
- Text color changes
- Font size changes
- Position changes

Preview shows:
- Exact bar appearance
- Message text
- CTA button (if text provided)
- All styling (colors, font size)
- Position indicator (top/bottom)

## Error Handling

### Frontend Errors
- Displayed as Toast notifications
- Prevent navigation to next step
- Highlight problematic fields

### Backend Errors
- Validation errors: 400 status with error details
- Server errors: 500 status with error message
- Authentication errors: 401 status

### Example Error Response
```json
{
  "success": false,
  "errors": {
    "message": "Message is required",
    "ctaLink": "Link URL is required when button text is provided"
  }
}
```

## State Management

Form state managed in main component:
```javascript
const [formData, setFormData] = useState({
  type: "announcement",
  message: "",
  ctaText: "",
  ctaLink: "",
  backgroundColor: "#288d40",
  textColor: "#ffffff",
  fontSize: 14,
  position: "top",
  startDate: "",
  endDate: "",
});
```

State preserved when:
- Navigating between steps
- Updating any field
- Preview updates

State submitted when:
- Clicking "Save as Draft" (isActive: false)
- Clicking "Publish Bar" (isActive: true)

## Security Considerations

1. Authentication: All routes require Shopify admin session
2. Authorization: Users can only access bars for their shop
3. Validation: Both frontend and backend validation
4. SQL Injection: Protected by Prisma ORM
5. XSS: React escapes content by default

## Performance Optimizations

1. Database indexes on frequently queried fields
2. Real-time preview uses React state (no API calls)
3. Form validation runs before submission
4. Efficient Prisma queries with where clauses

## Accessibility

- Form labels for all inputs
- Error messages clearly associated with fields
- Keyboard navigation supported
- Color contrast meets WCAG standards
- Screen reader friendly (Polaris components)
