# Bar Creation Feature

## Overview
The bar creation feature allows merchants to create customizable announcement bars for their Shopify stores. This includes a multi-step form for configuration, real-time preview, and full backend support.

## Features

### Frontend Components

#### 1. Multi-Step Form (`/app/bars/new`)
The bar creation flow is divided into 4 steps:
- **Step 1: Bar Type Selection** - Choose between announcement, countdown, or shipping bars
- **Step 2: Content Configuration** - Set message text, CTA button text, and link URL
- **Step 3: Design Customization** - Customize colors, font size, and position
- **Step 4: Targeting & Schedule** - Set start and end dates (optional)

#### 2. Real-Time Preview
A live preview component shows how the bar will appear on the storefront as the merchant makes changes.

#### 3. Bar List View (`/app/bars`)
Displays all created bars in a data table with:
- Message preview
- Bar type
- Status (Active/Draft)
- Position
- Creation date

### Backend API

#### POST /api/bars
Creates a new bar with validation.

**Request Body:**
```json
{
  "type": "announcement",
  "message": "Summer Sale - 20% Off!",
  "ctaText": "Shop Now",
  "ctaLink": "/collections/sale",
  "backgroundColor": "#288d40",
  "textColor": "#ffffff",
  "fontSize": 14,
  "position": "top",
  "isActive": true,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "bar": {
    "id": "...",
    "shop": "...",
    "type": "announcement",
    "message": "Summer Sale - 20% Off!",
    ...
  },
  "message": "Bar created successfully"
}
```

#### GET /api/bars
Returns all bars for the authenticated shop.

**Response:**
```json
{
  "success": true,
  "bars": [
    {
      "id": "...",
      "message": "...",
      "type": "announcement",
      "isActive": true,
      ...
    }
  ]
}
```

### Database Schema

The `Bar` model in Prisma:

```prisma
model Bar {
  id              String   @id @default(cuid())
  shop            String
  type            String   @default("announcement")
  message         String
  ctaText         String?
  ctaLink         String?
  backgroundColor String   @default("#288d40")
  textColor       String   @default("#ffffff")
  fontSize        Int      @default(14)
  position        String   @default("top")
  isActive        Boolean  @default(false)
  startDate       DateTime?
  endDate         DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([shop])
  @@index([shop, isActive])
}
```

## Validation Rules

### Frontend & Backend Validation
- **Message**: Required, non-empty string
- **CTA Link**: Required if CTA text is provided
- **Background Color**: Must be valid hex color (#RRGGBB)
- **Text Color**: Must be valid hex color (#RRGGBB)
- **Font Size**: Must be between 10 and 24 pixels
- **Position**: Must be "top" or "bottom"
- **Type**: Must be "announcement", "countdown", or "shipping"
- **End Date**: Must be after start date if both are provided

## Usage

### Creating a Bar

1. Navigate to `/app/bars`
2. Click "Create Bar" button
3. Follow the 4-step wizard:
   - Select bar type
   - Configure content
   - Customize design
   - Set schedule (optional)
4. Preview updates in real-time on the right side
5. Click "Save as Draft" or "Publish Bar"

### Form Navigation
- Use "Previous" and "Next" buttons to navigate between steps
- Validation errors are shown as toasts
- All form data is preserved when navigating between steps

## Components

### Bar Components (`app/components/bars/`)
- `BarTypeSelection.jsx` - Radio button selection for bar types
- `ContentConfiguration.jsx` - Text fields for message and CTA
- `DesignCustomization.jsx` - Color pickers and style options
- `TargetingSchedule.jsx` - Date/time pickers for scheduling
- `BarPreview.jsx` - Real-time preview component
- `index.js` - Component exports

### Routes
- `app/routes/app.bars.jsx` - Bar list page
- `app/routes/app.bars.new.jsx` - Bar creation page with multi-step form
- `app/routes/api.bars.jsx` - API endpoint for CRUD operations

## Testing

### Manual Testing Checklist
- [ ] Form loads without errors
- [ ] All fields are editable
- [ ] Preview updates in real-time
- [ ] Color pickers work correctly
- [ ] Validation shows errors for required fields
- [ ] Save as draft creates inactive bar (isActive: false)
- [ ] Publish creates active bar (isActive: true)
- [ ] API returns created bar data
- [ ] Bar saves to database correctly
- [ ] Can navigate back and forth in form steps
- [ ] Navigation preserves form data
- [ ] Bar list page shows created bars
- [ ] Error messages display properly

### API Testing

**Note:** The API endpoints require Shopify app authentication. These examples are for reference only. In practice, you would test these through the Shopify admin interface or using tools like Postman with proper authentication setup.

Test POST endpoint (conceptual example):
```bash
# This requires authentication headers - use through Shopify admin or authenticated tools
POST /api/bars
Content-Type: application/json

{
  "message": "Test Bar",
  "type": "announcement",
  "backgroundColor": "#288d40",
  "textColor": "#ffffff",
  "fontSize": 14,
  "position": "top",
  "isActive": true
}
```

Test GET endpoint (conceptual example):
```bash
# This requires authentication headers - use through Shopify admin or authenticated tools
GET /api/bars
```

## Future Enhancements
- Edit existing bars
- Delete bars
- Duplicate bars
- Advanced targeting (specific pages, customer segments)
- A/B testing
- Analytics and conversion tracking
- More bar types (countdown timers, free shipping progress)
