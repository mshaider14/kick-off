# Admin Dashboard Layout Components

This directory contains the main admin dashboard layout components for the Kick-Off Shopify app.

## Components

### AdminLayout
Main layout wrapper that provides the Polaris Frame with top navigation and sidebar.

**Props:**
- `children`: React nodes to render inside the layout
- `merchant`: Merchant information object (shop, email, firstName, lastName)

**Features:**
- Responsive mobile navigation
- Integrated top bar and sidebar navigation
- Polaris Frame for consistent UI

### TopNavigation
Top navigation bar component with merchant info and mobile menu toggle.

**Props:**
- `merchant`: Merchant information object
- `onNavigationToggle`: Function to toggle mobile navigation

**Features:**
- Displays merchant shop name and initials
- User menu with merchant details
- Mobile navigation toggle button

### SidebarNavigation
Sidebar navigation menu with main app sections.

**Features:**
- Dashboard link (home page)
- Bars link (countdown bars management)
- Analytics link (performance tracking)
- Settings link (app configuration)
- Active route highlighting
- Icons for each menu item

### EmptyState
Reusable empty state component for showing when no data exists.

**Props:**
- `heading`: Main heading text (default: "Get started with your first countdown bar")
- `children`: Custom description content
- `action`: Action button configuration
- `image`: Empty state illustration URL

**Usage:**
```jsx
<EmptyState
  heading="No countdown bars yet"
  action={{ content: "Create bar", url: "/app" }}
>
  <p>Create your first countdown bar to get started.</p>
</EmptyState>
```

### LoadingState
Skeleton loading state component.

**Props:**
- `pageTitle`: Page title to display (default: "Loading...")

**Features:**
- Skeleton cards with placeholder content
- Responsive layout with main and aside sections
- Polaris SkeletonPage wrapper

### ErrorBoundary
React error boundary component for catching and displaying errors.

**Features:**
- Catches React component errors
- Displays user-friendly error message
- Shows error details and stack trace (for debugging)
- Dismissible error banner
- Prevents entire app from crashing

## Usage

### In app.jsx (Root Layout)
```jsx
import { AdminLayout, ErrorBoundary } from "../components";

<ErrorBoundary>
  <AdminLayout merchant={merchant}>
    <Outlet />
  </AdminLayout>
</ErrorBoundary>
```

### In Page Components
```jsx
import { EmptyState, LoadingState } from "../components";

// Show loading state
if (loading) {
  return <LoadingState pageTitle="Loading bars..." />;
}

// Show empty state
if (!hasBars) {
  return <EmptyState heading="No bars found" />;
}
```

## Layout Structure

The admin dashboard layout follows this hierarchy:

```
PolarisProvider (app.jsx)
  └── AppProvider (Shopify App Bridge)
      └── ErrorBoundary
          └── AdminLayout
              ├── TopBar (TopNavigation)
              ├── Navigation (SidebarNavigation)
              └── Page Content (Outlet)
```

## Navigation Items

1. **Dashboard** (/) - Main overview page with countdown bar configuration
2. **Bars** (/app/bars) - Manage all countdown bars
3. **Analytics** (/app/analytics) - View performance metrics (coming soon)
4. **Settings** (/app/settings) - App configuration options

## Responsive Behavior

- Desktop: Shows sidebar navigation and top bar
- Mobile: Sidebar collapses, shows hamburger menu in top bar
- Touch-friendly navigation toggle
- Polaris Frame handles responsive behavior automatically

## Error Handling

The ErrorBoundary component wraps the entire admin layout to catch and handle errors gracefully:

- Displays user-friendly error message
- Provides option to dismiss and retry
- Logs error details to console
- Shows stack trace for debugging (can be hidden in production)

## Theming

All components use Shopify Polaris design system:
- Consistent spacing and typography
- Built-in accessibility features
- Dark mode support (via Polaris)
- Shopify design guidelines compliance
