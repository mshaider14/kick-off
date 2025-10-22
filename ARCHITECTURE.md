# Architecture Overview - Kick-off Theme App Extension

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Shopify Storefront                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Theme App Extension (Liquid Template)           │    │
│  │  - countdown-bar.liquid (HTML structure)                │    │
│  │  - Embedded in theme via App Blocks                     │    │
│  └──────────────────┬─────────────────────────────────────┘    │
│                     │                                             │
│                     │ Loads Assets                                │
│                     ▼                                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Frontend Assets (Static)                   │    │
│  │  - countdown-bar.css (Styling & Animations)             │    │
│  │  - countdown-bar.js (Logic & API Calls)                 │    │
│  └──────────────────┬─────────────────────────────────────┘    │
│                     │                                             │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      │ API Calls
                      │
    ┌─────────────────┴─────────────────┐
    │                                     │
    ▼                                     ▼
┌──────────────────┐              ┌─────────────────┐
│  GET /api/bars/  │              │ App Proxy URLs  │
│     active       │              │ /apps/countdown │
│                  │              │                 │
│ - Multi-bar     │              │ - /settings     │
│   support       │              │ - /analytics/   │
│ - Priority      │              │   track-view    │
│   ordering      │              │ - /analytics/   │
│ - Validation    │              │   track-click   │
└────────┬─────────┘              └────────┬────────┘
         │                                  │
         └─────────────┬────────────────────┘
                       │
                       │ Server-side Routes
                       ▼
        ┌──────────────────────────┐
        │   React Router App       │
        │   (Node.js Backend)      │
        │                          │
        │  Routes:                 │
        │  - api.bars.active.jsx   │
        │  - apps.countdown.       │
        │    settings.jsx          │
        │  - apps.countdown.       │
        │    analytics.*.jsx       │
        └──────────┬───────────────┘
                   │
                   │ Database Queries
                   ▼
        ┌─────────────────────┐
        │   PostgreSQL DB      │
        │   (Prisma ORM)       │
        │                      │
        │  Tables:             │
        │  - Bar              │
        │  - BarView          │
        │  - BarClick         │
        │  - Session          │
        │  - Setting          │
        └─────────────────────┘
```

## Data Flow

### 1. Bar Display Flow

```
Storefront Page Load
        │
        ├─> Liquid template renders bar HTML structure
        │   (Initially hidden with display: none)
        │
        ├─> CSS loads (styling, animations, responsive)
        │
        └─> JavaScript executes
            │
            ├─> Extract shop parameter from DOM
            │
            ├─> Fetch active bars from API
            │   ├─> Try /api/bars/active (multi-bar endpoint)
            │   └─> Fallback to /apps/countdown/settings
            │
            ├─> Validate each bar:
            │   ├─> Check if previously closed (sessionStorage)
            │   ├─> Validate device targeting
            │   ├─> Validate page targeting
            │   └─> Check display frequency
            │
            ├─> Select highest priority valid bar
            │
            ├─> Apply bar settings:
            │   ├─> Set colors, fonts, padding
            │   ├─> Handle bar type (announcement/countdown/shipping)
            │   └─> Setup event listeners
            │
            ├─> Display bar with animation
            │
            └─> Track impression (POST to analytics API)
```

### 2. Bar Interaction Flow

```
User Interacts with Bar
        │
        ├─> Clicks CTA Button
        │   ├─> Track click event (POST /analytics/track-click)
        │   └─> Navigate to CTA link
        │
        ├─> Clicks Close Button
        │   ├─> Track close event
        │   ├─> Hide bar with animation
        │   ├─> Store closed state (sessionStorage)
        │   └─> Stop countdown timer (if applicable)
        │
        └─> Cart Updates (for shipping bars)
            ├─> Detect cart change (fetch intercept)
            ├─> Recalculate progress
            └─> Update progress bar and message
```

### 3. API Request Flow

```
GET /api/bars/active?shop=example.myshopify.com&limit=5
        │
        ├─> Authenticate shop parameter
        │
        ├─> Query database for active bars
        │   ├─> Filter: shop matches
        │   ├─> Filter: isActive = true
        │   ├─> Order by: updatedAt DESC
        │   └─> Limit: specified number
        │
        ├─> Validate schedule for each bar
        │   ├─> Check startDate <= now
        │   └─> Check endDate >= now
        │
        ├─> Validate configuration
        │   ├─> Countdown bars: timer settings
        │   └─> Shipping bars: threshold settings
        │
        ├─> Format bars for frontend
        │   ├─> Include all design settings
        │   ├─> Include targeting rules
        │   ├─> Parse JSON fields
        │   └─> Convert dates to ISO strings
        │
        └─> Return JSON response with cache headers
```

## Component Breakdown

### Frontend Components

#### 1. Liquid Template (`countdown-bar.liquid`)
- **Purpose**: HTML structure for bar display
- **Elements**:
  - Countdown bar container
  - Free shipping bar container
  - Timer elements (days, hours, minutes, seconds)
  - Progress bar elements
  - Close buttons
  - CTA buttons
- **Data**: Shop domain from Liquid context

#### 2. CSS (`countdown-bar.css`)
- **Purpose**: Styling and animations
- **Features**:
  - Responsive breakpoints (480px, 768px)
  - Slide-in/out animations
  - Bar positioning (top/bottom)
  - Progress bar animations
  - Button hover effects
  - CSS containment for performance
- **Size**: ~8KB gzipped

#### 3. JavaScript (`countdown-bar.js`)
- **Purpose**: Logic and interactivity
- **Features**:
  - Multi-bar API fetching
  - Targeting rule validation
  - Countdown timer logic (3 types)
  - Free shipping calculations
  - Analytics tracking
  - Session/cookie management
  - Performance monitoring
- **Size**: ~6KB gzipped

### Backend Components

#### 1. API Routes
- **`api.bars.active.jsx`**: Multi-bar endpoint (new)
- **`apps.countdown.settings.jsx`**: Single bar endpoint (legacy)
- **`apps.countdown.analytics.track-view.jsx`**: Impression tracking
- **`apps.countdown.analytics.track-click.jsx`**: Click tracking

#### 2. Database Schema (Prisma)
```prisma
model Bar {
  id                    String   @id @default(cuid())
  shop                  String
  type                  String   // announcement, countdown, shipping
  message               String
  isActive              Boolean
  
  // Design
  backgroundColor       String
  textColor             String
  fontSize              Int
  position              String
  
  // Targeting
  targetDevices         String
  targetPages           String
  targetSpecificUrls    String?
  targetUrlPattern      String?
  displayFrequency      String
  
  // Timer fields (countdown bars)
  timerType             String?
  timerEndDate          DateTime?
  timerDailyTime        String?
  timerDuration         Int?
  
  // Shipping fields (shipping bars)
  shippingThreshold     Float?
  shippingCurrency      String?
  
  // Relations
  views                 BarView[]
  clicks                BarClick[]
}
```

## Targeting System

### Device Targeting
```javascript
function matchesDeviceTarget(targetDevices) {
  if (targetDevices === 'both') return true;
  
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  
  return (targetDevices === 'mobile' && isMobile) ||
         (targetDevices === 'desktop' && !isMobile);
}
```

### Page Targeting
```javascript
function matchesPageTarget(settings) {
  const targetPages = settings.targetPages;
  const currentPath = window.location.pathname;
  
  switch(targetPages) {
    case 'all': return true;
    case 'homepage': return currentPath === '/';
    case 'product': return currentPath.includes('/products/');
    case 'collection': return currentPath.includes('/collections/');
    case 'cart': return currentPath.includes('/cart');
    case 'specific': return matchesSpecificUrls(settings);
    case 'pattern': return matchesUrlPattern(settings);
  }
}
```

### Frequency Control
```javascript
function shouldShowBasedOnFrequency(settings) {
  const frequency = settings.displayFrequency;
  
  switch(frequency) {
    case 'always': 
      return true;
    
    case 'once_per_session':
      return !sessionStorage.getItem(`barShown_${settings.id}`);
    
    case 'once_per_visitor':
      return !document.cookie.includes(`barShown_${settings.id}`);
  }
}
```

## Performance Optimizations

### 1. CSS Optimizations
- **CSS Containment**: `contain: layout style;` prevents layout thrashing
- **Hardware Acceleration**: `transform` and `opacity` for animations
- **Minimal Repaints**: Single display change to show bar

### 2. JavaScript Optimizations
- **Single API Call**: Fetch all needed data at once
- **Early Returns**: Exit fast if targeting doesn't match
- **Debounced Cart Updates**: Prevent excessive API calls
- **Lazy Timer Updates**: Only update visible elements

### 3. Network Optimizations
- **API Caching**: 60-second cache on bar data
- **CORS Headers**: Allow storefront access
- **Compression**: Gzipped assets
- **CDN Ready**: Static assets can be CDN served

### 4. Load Strategy
```
Page Load
    ↓
HTML Parsed (bar hidden)
    ↓
CSS Loaded (styling ready)
    ↓
JS Loads Async (non-blocking)
    ↓
API Call (cached)
    ↓
Bar Display (<100ms from JS start)
    ↓
Page Interactive (no CLS)
```

## Security Considerations

1. **Shop Validation**: All API requests validate shop parameter
2. **CORS**: Controlled access with proper headers
3. **XSS Prevention**: No `eval()` or `innerHTML` with user data
4. **CSRF**: Uses Shopify app proxy for authentication
5. **SQL Injection**: Prisma ORM prevents SQL injection
6. **Rate Limiting**: API cache reduces server load

## Monitoring & Analytics

### Tracked Events
1. **Bar Impressions**: When bar becomes visible
2. **CTA Clicks**: When user clicks call-to-action
3. **Close Actions**: When user dismisses bar

### Performance Metrics
1. **Render Time**: Logged to console (development)
2. **API Response Time**: Tracked server-side
3. **CLS Score**: Can be measured with Lighthouse

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| iOS Safari | 14+ | ✅ Full |
| Chrome Mobile | 90+ | ✅ Full |

## Future Enhancements

Potential improvements for v2:
1. **Multiple Simultaneous Bars**: Stack multiple bars
2. **A/B Testing**: Test different bar variants
3. **Advanced Triggers**: Scroll depth, exit intent
4. **Geolocation**: Show bars based on user location
5. **Personalization**: Content based on user data
6. **Animation Library**: More animation options
7. **Template Editor**: Visual bar builder
8. **Real-time Updates**: WebSocket for live changes

## Deployment Checklist

Before deploying:
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] Theme extension installed
- [ ] Analytics verified
- [ ] Performance benchmarked
- [ ] Browser testing complete
- [ ] Mobile responsive verified
- [ ] Documentation updated
- [ ] Monitoring configured
