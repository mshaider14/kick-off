# Admin Dashboard Layout - Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ app.jsx (Root Route)                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ PolarisProvider (Shopify Polaris UI Framework)          │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ AppProvider (Shopify App Bridge)                    │ │ │
│ │ │ ┌─────────────────────────────────────────────────┐ │ │ │
│ │ │ │ <s-app-nav> (Shopify App Bridge Navigation)    │ │ │ │
│ │ │ │ • Dashboard                                     │ │ │ │
│ │ │ │ • Bars                                          │ │ │ │
│ │ │ │ • Analytics                                     │ │ │ │
│ │ │ │ • Settings                                      │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ │ ┌─────────────────────────────────────────────────┐ │ │ │
│ │ │ │ ErrorBoundary (Error Handling Wrapper)          │ │ │ │
│ │ │ │ ┌─────────────────────────────────────────────┐ │ │ │ │
│ │ │ │ │ AdminLayout                                 │ │ │ │ │
│ │ │ │ │ ┌─────────────────────────────────────────┐ │ │ │ │ │
│ │ │ │ │ │ Frame (Polaris Layout Container)        │ │ │ │ │ │
│ │ │ │ │ │ ┌───────────────────────────────────────┐│ │ │ │ │ │
│ │ │ │ │ │ │ TopNavigation                         ││ │ │ │ │ │
│ │ │ │ │ │ │ ┌───────────────────────────────────┐ ││ │ │ │ │ │
│ │ │ │ │ │ │ │ TopBar                            │ ││ │ │ │ │ │
│ │ │ │ │ │ │ │ • Mobile Nav Toggle               │ ││ │ │ │ │ │
│ │ │ │ │ │ │ │ • User Menu (Merchant Info)       │ ││ │ │ │ │ │
│ │ │ │ │ │ │ └───────────────────────────────────┘ ││ │ │ │ │ │
│ │ │ │ │ │ └───────────────────────────────────────┘│ │ │ │ │ │
│ │ │ │ │ │ ┌───────────────────────────────────────┐│ │ │ │ │ │
│ │ │ │ │ │ │ SidebarNavigation                     ││ │ │ │ │ │
│ │ │ │ │ │ │ ┌───────────────────────────────────┐ ││ │ │ │ │ │
│ │ │ │ │ │ │ │ Navigation                        │ ││ │ │ │ │ │
│ │ │ │ │ │ │ │ • 🏠 Dashboard (active highlight) │ ││ │ │ │ │ │
│ │ │ │ │ │ │ │ • 📊 Bars                         │ ││ │ │ │ │ │
│ │ │ │ │ │ │ │ • 📈 Analytics                    │ ││ │ │ │ │ │
│ │ │ │ │ │ │ │ • ⚙️  Settings                     │ ││ │ │ │ │ │
│ │ │ │ │ │ │ └───────────────────────────────────┘ ││ │ │ │ │ │
│ │ │ │ │ │ └───────────────────────────────────────┘│ │ │ │ │ │
│ │ │ │ │ │ ┌───────────────────────────────────────┐│ │ │ │ │ │
│ │ │ │ │ │ │ Page Content (Outlet)                 ││ │ │ │ │ │
│ │ │ │ │ │ │ • app._index.jsx (Dashboard)          ││ │ │ │ │ │
│ │ │ │ │ │ │ • app.bars.jsx                        ││ │ │ │ │ │
│ │ │ │ │ │ │ • app.analytics.jsx                   ││ │ │ │ │ │
│ │ │ │ │ │ │ • app.settings.jsx                    ││ │ │ │ │ │
│ │ │ │ │ │ └───────────────────────────────────────┘│ │ │ │ │ │
│ │ │ │ │ └─────────────────────────────────────────┘ │ │ │ │ │
│ │ │ │ └─────────────────────────────────────────────┘ │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Layout Features

### Desktop View
- **Top Bar**: Fixed header with merchant info and branding
- **Sidebar**: Left navigation panel with menu items
- **Content Area**: Main scrollable content region

### Mobile View
- **Top Bar**: Fixed header with hamburger menu
- **Sidebar**: Collapsible drawer navigation
- **Content Area**: Full-width scrollable content

### Responsive Breakpoints
- Polaris Frame automatically handles responsive behavior
- Mobile navigation toggles at Polaris default breakpoint (~768px)

## Component Interactions

### Navigation Flow
1. User clicks navigation item in sidebar
2. React Router updates URL
3. SidebarNavigation highlights active route
4. Outlet renders new page component
5. Layout remains consistent

### Error Handling Flow
1. Component throws error
2. ErrorBoundary catches error
3. Error UI displays with details
4. User can dismiss and retry
5. Error logged to console

### Loading Flow
1. Route loader starts fetching data
2. LoadingState component shows skeleton
3. Data loads
4. Content renders
5. Skeleton removed

### Empty State Flow
1. Route checks for data
2. No data found
3. EmptyState component displays
4. User clicks action button
5. Navigates to creation flow

## Data Flow

```
┌──────────────┐
│   Shopify    │
│   Session    │
└──────┬───────┘
       │
       v
┌──────────────┐     ┌──────────────┐
│   app.jsx    │────>│   merchant   │
│   loader     │     │     info     │
└──────┬───────┘     └──────┬───────┘
       │                    │
       v                    v
┌──────────────┐     ┌──────────────┐
│  AdminLayout │<────│ TopNavigation│
└──────┬───────┘     └──────────────┘
       │
       v
┌──────────────┐
│Page Component│
│  (Outlet)    │
└──────────────┘
```

## Styling

- **Framework**: Shopify Polaris Design System
- **CSS**: Polaris built-in styles (automatically imported)
- **Theme**: Shopify default theme (with dark mode support)
- **Icons**: @shopify/polaris-icons package
- **Accessibility**: WCAG 2.0 Level AA compliant (via Polaris)

## Routes

| Path              | Component         | Description                    |
|-------------------|-------------------|--------------------------------|
| `/app`            | app._index.jsx    | Main dashboard (countdown bar) |
| `/app/bars`       | app.bars.jsx      | Manage countdown bars          |
| `/app/analytics`  | app.analytics.jsx | Performance metrics (TBD)      |
| `/app/settings`   | app.settings.jsx  | App configuration              |

## State Management

- **Navigation State**: Managed by SidebarNavigation (useLocation)
- **Mobile Menu State**: Managed by AdminLayout (useState)
- **Loading State**: Managed by individual page components
- **Error State**: Managed by ErrorBoundary (component state)
- **Form State**: Managed by individual page components

## Performance Considerations

- **Code Splitting**: Routes are lazy-loaded by React Router
- **Skeleton Loading**: LoadingState provides instant feedback
- **Optimistic UI**: Navigation updates immediately
- **Error Boundaries**: Prevent cascading failures
- **Memoization**: Components re-render only when props change
