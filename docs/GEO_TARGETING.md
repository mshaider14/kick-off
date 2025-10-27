# Geo-Targeting Feature Documentation

## Overview

The geo-targeting feature allows you to show or hide announcement bars based on the visitor's country. This is useful for running location-specific campaigns, complying with regional regulations, or personalizing content for different markets.

## Features

- **Country Detection**: Automatically detects visitor's country using IP-based geolocation
- **Include/Exclude Modes**: Show bars only in specific countries or hide them in specific countries
- **Multi-Country Selection**: Select multiple countries for targeting
- **Popular Countries Quick-Select**: Quickly select common countries (US, CA, GB, AU, etc.)
- **Graceful Fallback**: If country detection fails, bars show/hide based on safe defaults
- **Zero Configuration**: Works out of the box with Cloudflare, Vercel, and other common hosting providers

## How It Works

### Backend

1. **Country Detection API** (`/api/geo/detect`)
   - Reads country from request headers (CloudFlare, Vercel, etc.)
   - Returns ISO country code (e.g., "US", "CA", "GB")
   - Returns `null` if detection is unavailable

2. **Bar Filtering** (`/api/bars/active`)
   - Includes geo-targeting settings in bar data
   - No server-side filtering (allows client-side flexibility)

### Frontend (Admin UI)

The `GeoTargeting` component provides:
- Enable/disable checkbox
- Mode selector (all countries, include, exclude)
- Country multi-select dropdown
- Popular countries quick-select button
- Clear all button
- Visual tag display of selected countries

### Frontend (Storefront)

The `matchesGeoTarget()` function in `countdown-bar.js`:
- Fetches visitor's country from `/api/geo/detect`
- Compares against targeted countries
- Applies include/exclude logic
- Uses safe fallback if detection fails

## Usage

### Creating a Geo-Targeted Bar

1. Go to **Create New Bar** or edit an existing bar
2. Navigate to the **Targeting & Schedule** step
3. Find the **Geo-Targeting** section
4. Check **Enable geo-targeting**
5. Select targeting mode:
   - **All countries**: Show to everyone (default, no geo-targeting)
   - **Only show in selected countries**: Include mode
   - **Hide in selected countries**: Exclude mode
6. Add countries:
   - Use the dropdown to select individual countries
   - Click **Select Popular Countries** for quick selection
   - Click **Clear All** to remove all selections
7. Save the bar

### Example Use Cases

#### 1. US & Canada Only Promotion
```
Mode: Only show in selected countries
Countries: United States, Canada
```

#### 2. GDPR Compliance (Hide in EU)
```
Mode: Hide in selected countries
Countries: Germany, France, Italy, Spain, Netherlands, etc.
```

#### 3. Asia-Pacific Campaign
```
Mode: Only show in selected countries
Countries: Australia, Japan, Singapore, New Zealand, etc.
```

## Fallback Behavior

When country detection fails (e.g., VPN users, privacy tools, unsupported hosting):

- **Include mode**: Bar does NOT show (safe default - better to miss a few impressions than show to wrong audience)
- **Exclude mode**: Bar DOES show (safe default - better to show than accidentally hide from valid users)

This ensures the best user experience while respecting targeting rules.

## Supported Countries

The geo-targeting feature supports all countries using ISO 3166-1 alpha-2 codes. Some examples:

| Country | Code | Country | Code |
|---------|------|---------|------|
| United States | US | Canada | CA |
| United Kingdom | GB | Australia | AU |
| Germany | DE | France | FR |
| Italy | IT | Spain | ES |
| Japan | JP | China | CN |
| India | IN | Brazil | BR |

For the complete list, see the `ALL_COUNTRIES` array in `app/components/bars/GeoTargeting.jsx`.

## Popular Countries

The quick-select feature includes these popular e-commerce markets:
- United States (US)
- Canada (CA)
- United Kingdom (GB)
- Australia (AU)
- Germany (DE)
- France (FR)
- Italy (IT)
- Spain (ES)
- Netherlands (NL)
- Sweden (SE)
- Norway (NO)
- Denmark (DK)
- Finland (FI)
- Japan (JP)
- China (CN)
- India (IN)
- Brazil (BR)
- Mexico (MX)
- New Zealand (NZ)
- Singapore (SG)

## Country Detection Sources

The system automatically detects country from these header sources (in order of priority):

1. **CloudFlare**: `CF-IPCountry` header
2. **Vercel**: `X-Vercel-IP-Country` header
3. **Generic**: `X-Country-Code` header
4. **CloudFront**: `CloudFront-Viewer-Country` header

No additional configuration is needed - it works automatically on supported platforms.

## Database Schema

The following fields are added to the `Bar` model:

```prisma
geoTargetingEnabled Boolean  @default(false)
geoTargetingMode    String?  @default("all")
geoTargetedCountries String? // JSON array of ISO country codes
```

## API Reference

### GET /api/geo/detect

Detects visitor's country from IP address.

**Response:**
```json
{
  "success": true,
  "country": "US"
}
```

Or if detection fails:
```json
{
  "success": true,
  "country": null,
  "message": "Country detection not available (showing all bars)"
}
```

### GET /api/bars/active

Returns active bars including geo-targeting settings.

**Geo-Targeting Fields in Response:**
```json
{
  "geoTargetingEnabled": true,
  "geoTargetingMode": "include",
  "geoTargetedCountries": "[\"US\",\"CA\",\"GB\"]"
}
```

## Testing

### Manual Testing Checklist

- [ ] Country selector shows all countries
- [ ] Can select multiple countries
- [ ] Include/exclude toggle works
- [ ] "Select Popular Countries" selects popular countries
- [ ] "Clear All" removes all selections
- [ ] Geo rules save correctly
- [ ] Visitor country detected accurately
- [ ] Bar shows only in targeted countries (include mode)
- [ ] Bar hides in excluded countries (exclude mode)
- [ ] Works gracefully when detection fails
- [ ] Fallback behavior works correctly

### Testing with VPN/Proxy

1. **Include Mode Test**:
   - Set mode to "Only show in selected countries"
   - Add your country to the list
   - Verify bar shows
   - Use VPN to switch to different country
   - Verify bar hides

2. **Exclude Mode Test**:
   - Set mode to "Hide in selected countries"
   - Add a country to exclude list
   - Verify bar shows in other countries
   - Use VPN to switch to excluded country
   - Verify bar hides

3. **Fallback Test**:
   - Test on localhost (no geo headers)
   - Verify include mode doesn't show bar
   - Verify exclude mode shows bar

## Troubleshooting

### Bar not showing when it should

1. Check if geo-targeting is enabled
2. Verify country is in the selected list (include mode)
3. Check browser console for geo-targeting logs
4. Test country detection: visit `/api/geo/detect`

### Bar showing when it shouldn't

1. Check targeting mode (include vs exclude)
2. Verify country is in the excluded list (exclude mode)
3. Check if country detection is working
4. Review fallback behavior

### Country not detected

1. Check if hosting provider supports geo headers
2. Test the `/api/geo/detect` endpoint
3. Review server logs for errors
4. Verify the bar uses safe fallback behavior

## Performance

- Country detection is cached for 5 minutes
- Bar filtering happens client-side (no server load)
- Minimal JavaScript overhead (~1KB additional code)
- Async detection doesn't block bar rendering

## Security & Privacy

- No personal data is stored
- Only country code is detected (not precise location)
- Detection happens at request level (standard HTTP headers)
- Users can bypass with VPN (expected behavior)
- Fallback ensures accessibility

## Backward Compatibility

- Existing bars without geo-targeting continue to work
- Default mode is "all countries" (no targeting)
- Schema migration is non-breaking
- Old bar configurations are unaffected

## Future Enhancements

Potential improvements for future versions:

- Region/state targeting (e.g., California, Texas)
- City-level targeting
- Timezone-based targeting
- IP range whitelisting/blacklisting
- Third-party geo-IP services integration
- A/B testing by country
- Analytics by country

## Summary

The geo-targeting feature provides a powerful, user-friendly way to target announcement bars by country. With automatic detection, safe fallbacks, and comprehensive UI controls, merchants can easily create location-specific campaigns while maintaining a great user experience for all visitors.

For questions or issues, please refer to the troubleshooting section or contact support.

