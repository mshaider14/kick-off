(function() {
  'use strict';

  const bar = document.getElementById('free-shipping-bar');
  if (!bar) return;

  const shop = bar.getAttribute('data-shop');
  let currentSettings = null;

  // Creates a unique, reliable session key based on the bar's database ID.
  function getSessionKey(id) {
    return `barClosed_${id}`;
  }

  // Get cart total from Shopify
  async function getCartTotal() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      return cart.total_price / 100; // Shopify returns price in cents
    } catch (error) {
      console.error('Error fetching cart:', error);
      return 0;
    }
  }

  // Get currency symbol
  function getCurrencySymbol(currency) {
    const symbols = {
      USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$",
      JPY: "¥", NZD: "NZ$", INR: "₹", SGD: "S$", HKD: "HK$"
    };
    return symbols[currency] || "$";
  }

  // Format amount with currency
  function formatAmount(amount, currency) {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }

  // Apply settings and update display
  function applySettings(settings) {
    currentSettings = settings;
    
    bar.style.backgroundColor = settings.barColor || '#288d40';
    bar.style.color = settings.textColor || '#ffffff';
    bar.className = `free-shipping-bar free-shipping-bar--${settings.barPosition || 'top'}`;

    const iconEl = document.getElementById('shipping-icon');
    if (iconEl) {
      iconEl.style.display = settings.shippingShowIcon ? 'inline' : 'none';
    }

    const progressFill = document.getElementById('progress-fill');
    if (progressFill && settings.shippingProgressColor) {
      progressFill.style.backgroundColor = settings.shippingProgressColor;
    }
  }

  // Update progress bar based on cart value
  async function updateProgress() {
    if (!currentSettings) return;

    const cartTotal = await getCartTotal();
    const threshold = parseFloat(currentSettings.shippingThreshold) || 50;
    const currency = currentSettings.shippingCurrency || 'USD';
    
    const progressPercentage = Math.min((cartTotal / threshold) * 100, 100);
    const remaining = Math.max(threshold - cartTotal, 0);
    const isSuccess = cartTotal >= threshold;

    const messageEl = document.getElementById('shipping-message');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (messageEl) {
      if (isSuccess) {
        messageEl.textContent = currentSettings.shippingReachedText || "You've unlocked free shipping! 🎉";
        messageEl.classList.add('success');
      } else {
        const message = (currentSettings.shippingGoalText || "Add {amount} more for free shipping!")
          .replace('{amount}', formatAmount(remaining, currency));
        messageEl.textContent = message;
        messageEl.classList.remove('success');
      }
    }

    if (progressFill) {
      progressFill.style.width = `${progressPercentage}%`;
      if (isSuccess) {
        progressFill.classList.add('success');
      } else {
        progressFill.classList.remove('success');
      }
    }

    if (progressText) {
      if (isSuccess) {
        progressText.style.display = 'none';
      } else {
        progressText.style.display = 'block';
        progressText.textContent = `${formatAmount(cartTotal, currency)} / ${formatAmount(threshold, currency)}`;
      }
    }

    // Track progress milestone
    try {
      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
          'event': 'free_shipping_progress',
          'bar_id': currentSettings.id,
          'progress_percentage': Math.round(progressPercentage),
          'cart_value': cartTotal,
          'threshold': threshold,
          'is_success': isSuccess
        });
      }
    } catch (e) {
      // Silent fail for analytics
    }
  }

  // Handle bar initialization
  function initializeBar(settings) {
    const sessionKey = getSessionKey(settings.id);
    const isClosed = sessionStorage.getItem(sessionKey) === 'true';

    if (isClosed) {
      console.log(`Free shipping bar with ID ${settings.id} was previously closed in this session. Hiding.`);
      return bar.style.display = 'none';
    }

    applySettings(settings);
    updateProgress();
    bar.style.display = 'flex';

    // Track bar impression
    try {
      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
          'event': 'bar_impression',
          'bar_type': 'shipping',
          'bar_id': settings.id,
          'bar_position': settings.barPosition
        });
      }
    } catch (e) {
      // Silent fail
    }

    // Setup close button
    const closeBtn = document.getElementById('close-shipping-bar');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        // Track bar close
        try {
          if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({
              'event': 'bar_closed',
              'bar_type': 'shipping',
              'bar_id': settings.id
            });
          }
        } catch (e) {
          // Silent fail
        }
        
        bar.style.display = 'none';
        sessionStorage.setItem(sessionKey, 'true');
      });
    }
  }

  // Listen for cart updates (Shopify theme events)
  function setupCartListeners() {
    // Listen for cart changes via theme events
    document.addEventListener('cart:updated', () => {
      updateProgress();
    });

    // Fallback: Listen for any fetch requests to cart endpoints
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && (url.includes('/cart') || url.includes('cart.js'))) {
        return originalFetch.apply(this, args).then(response => {
          // Clone response so we can read it
          const clonedResponse = response.clone();
          clonedResponse.json().then(() => {
            // Small delay to ensure cart is updated
            setTimeout(() => updateProgress(), 100);
          }).catch(() => {});
          return response;
        });
      }
      return originalFetch.apply(this, args);
    };
  }

  // Main execution
  const proxyBase = '/apps/countdown';
  let retryCount = 0;
  const maxRetries = 3;
  
  function fetchBarSettings() {
    fetch(`${proxyBase}/settings?shop=${encodeURIComponent(shop)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("FREE SHIPPING BAR DATA RECEIVED:", data);
        
        if (!data.success || !data.settings) {
          console.warn('Free shipping bar: No active bar found.');
          return bar.style.display = 'none';
        }

        const settings = data.settings;
        
        // Only show if it's a free shipping bar type
        if (settings.type !== 'shipping') {
          console.log('Bar type is not shipping, hiding free shipping bar.');
          return bar.style.display = 'none';
        }

        initializeBar(settings);
        setupCartListeners();
      })
      .catch(error => {
        console.error('Free shipping bar fetch error:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying... (${retryCount}/${maxRetries})`);
          setTimeout(fetchBarSettings, 1000 * retryCount); // Exponential backoff
        } else {
          console.error('Max retries reached. Hiding free shipping bar.');
          bar.style.display = 'none';
        }
      });
  }
  
  // Start initial fetch
  fetchBarSettings();
})();
