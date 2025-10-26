# Bar Templates Library

## Overview
The Bar Templates Library provides 35 professionally designed, pre-configured bar templates organized into 5 categories to help merchants quickly create effective announcement bars without starting from scratch.

## Template Categories

### 1. Sales & Promotions (10 templates)
- Summer Sale
- Flash Sale 24H
- Weekend Special
- Clearance Event
- First Purchase Discount
- Bundle & Save
- VIP Members Sale
- Category Sale
- Seasonal Clearance
- Limited Stock Alert

### 2. Announcements (5 templates)
- New Collection Launch
- Store Update
- Holiday Hours
- Back in Stock
- Sustainability Initiative

### 3. Countdown Events (5 templates)
- Flash Sale Timer
- Daily Deal Reset
- Product Launch Countdown
- Limited Offer Timer
- Black Friday Countdown

### 4. Free Shipping (5 templates)
- Standard Free Shipping
- Premium Threshold
- Minimal Theme
- Express Shipping Upgrade
- Eco-Friendly Shipping

### 5. Email Capture (10 templates)
- Welcome Discount
- Newsletter Signup
- Early Access VIP
- Flash Sale Alert
- Birthday Club
- Exit Intent Offer
- Product Launch Notify
- Loyalty Program
- Back in Stock Alert
- Style Quiz Offer

## Features

### Template Library UI
- **Location**: Accessible from:
  - Bar creation flow (Step 1 - Bar Type Selection)
  - Standalone page at `/app/templates`
  - "Browse Templates" button on main bars list page

### Search & Filter
- **Search**: Full-text search across template name, description, keywords, and message content
- **Category Filter**: Quick filter buttons for each category + "All Templates"
- **Type Filter**: When creating a bar, templates are automatically filtered by selected bar type
- **Results Count**: Shows number of matching templates

### Template Preview
- **Visual Preview**: Live preview of bar appearance with actual colors, fonts, and content
- **Template Details**: Shows template name, description, and type badge
- **Settings Preview**: Displays included settings (colors, position, font size, type-specific settings)
- **Targeting Info**: Shows suggested targeting rules (pages, devices)

### Template Application
- **Use Template Button**: One-click to apply template to current bar
- **Form Population**: Automatically fills in:
  - Message/content
  - Design settings (colors, fonts, padding)
  - Type-specific configurations (timer settings, shipping thresholds, email fields)
  - Suggested targeting rules
- **Customization**: All template-based bars are fully customizable after application
- **Toast Notification**: Confirms template application with template name

### Template Structure
Each template includes:
- **Pre-written copy**: Professional, engaging messages with emojis
- **Design styling**: Carefully chosen color schemes, fonts, and layouts
- **Suggested targeting**: Recommended page and device targeting
- **Type-specific settings**: 
  - Countdown timers: Timer type, duration, end actions
  - Shipping bars: Threshold, currency, progress colors
  - Email capture: Placeholder text, button text, discount codes
  - Announcements: CTA buttons, links

## User Experience

### Workflow 1: Create Bar with Template
1. Click "Create Bar" from main page
2. Select bar type (Announcement, Countdown, Shipping, or Email)
3. Browse filtered templates for selected type
4. Click template card to preview
5. Click "Use Template" to apply
6. Customize in following steps if needed
7. Configure schedule and targeting
8. Publish

### Workflow 2: Browse All Templates
1. Click "Browse Templates" from main page
2. Browse all 35 templates across categories
3. Use search to find specific templates
4. Filter by category
5. Select template to preview
6. Click "Use This Template" to start creating bar with that template

### Workflow 3: Quick Start from Template
1. Navigate directly to `/app/templates`
2. Search for specific need (e.g., "flash sale")
3. Preview template
4. Use template to jump to bar creation with pre-filled data

## Technical Implementation

### Data Structure
- **Location**: `/app/data/barTemplates.js`
- **Exports**:
  - `TEMPLATE_CATEGORIES`: Category constants
  - `CATEGORY_LABELS`: Human-readable category names
  - `BAR_TEMPLATES`: Template data organized by category
  - `getAllTemplates()`: Returns flat array of all templates
  - `searchTemplates(query)`: Search templates by keyword
  - `filterTemplatesByCategory(category)`: Filter by category
  - `getTemplateById(id)`: Get specific template

### Components

#### TemplateLibrary
- **Location**: `/app/components/bars/TemplateLibrary.jsx`
- **Props**:
  - `onSelectTemplate`: Callback when template is selected
  - `currentBarType`: Optional - filters templates by type
- **Features**:
  - Search field with clear button
  - Category filter buttons
  - Grid layout with template cards
  - Click to select/highlight
  - Use Template button on each card
  - Empty state when no results

#### TemplatePreview
- **Location**: `/app/components/bars/TemplatePreview.jsx`
- **Props**:
  - `template`: Template object to preview
- **Features**:
  - Live bar preview with actual styling
  - Template name and description
  - Type badge
  - Settings preview table
  - Type-specific details (timer, shipping, email)
  - Suggested targeting info

### Routes

#### /app/templates
- **Location**: `/app/routes/app.templates.jsx`
- **Purpose**: Standalone template browser
- **Features**:
  - Full template library
  - Sidebar preview (sticky)
  - "Use This Template" button
  - Navigates to bar creation with template pre-loaded

#### /app/new
- **Location**: `/app/routes/app.new.jsx`
- **Enhancements**:
  - Integrated TemplateLibrary in Step 1
  - Accepts template via navigation state
  - Auto-applies template on load if provided

## Template Quality Standards

All templates meet these standards:
- ✅ Professional, engaging copy
- ✅ High-contrast, accessible color combinations
- ✅ Appropriate emojis for visual appeal
- ✅ Realistic default values
- ✅ Clear calls-to-action
- ✅ Proper targeting suggestions
- ✅ Complete configuration (no missing required fields)

## Keyboard Accessibility
- Template cards are keyboard navigable (Tab, Enter, Space)
- Search field is keyboard accessible
- Category filters are keyboard accessible

## Future Enhancements
- Template favorites/bookmarks
- Custom template creation and saving
- Template usage analytics
- A/B testing template variations
- Template sharing between stores
- Industry-specific template packs
