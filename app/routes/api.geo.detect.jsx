/**
 * GET /api/geo/detect
 * 
 * Detect visitor's country from their IP address
 * 
 * Returns:
 * {
 *   success: boolean,
 *   country: string (ISO country code, e.g., "US", "CA", "GB"),
 *   countryName?: string,
 *   message?: string
 * }
 */

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

/**
 * Get country from IP using Cloudflare headers (if available) or fallback methods
 */
function getCountryFromRequest(request) {
  // Try Cloudflare header first (works on Cloudflare-based deployments)
  const cfCountry = request.headers.get('CF-IPCountry');
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry;
  }

  // Try other common headers
  const headers = [
    'X-Vercel-IP-Country',
    'X-Country-Code',
    'CloudFront-Viewer-Country',
  ];

  for (const header of headers) {
    const country = request.headers.get(header);
    if (country && country !== 'XX') {
      return country;
    }
  }

  // No country detected
  return null;
}

export const loader = async ({ request }) => {
  try {
    const country = getCountryFromRequest(request);

    if (!country) {
      // Return a default value when country cannot be detected
      // This allows bars with geo-targeting to use a fallback
      return json({
        success: true,
        country: null,
        message: "Country detection not available (showing all bars)"
      }, {
        headers: {
          "Cache-Control": "public, max-age=300", // 5 minutes cache
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return json({
      success: true,
      country: country
    }, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minutes cache
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Geo detection error:", error);
    return json({
      success: true,
      country: null,
      message: "Country detection failed (showing all bars)"
    }, {
      status: 200, // Still return 200 to allow graceful fallback
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

// Handle CORS preflight
export const OPTIONS = () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
