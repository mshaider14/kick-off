(function() {
  'use strict';

  function trackEvent() {}

  const bar = document.getElementById('countdown-cta-bar');
  if (!bar) return;

  const shop = bar.getAttribute('data-shop');
  let countdownInterval;

  // Creates a unique, reliable session key based on the bar's database ID.
  function getSessionKey(id) {
    return `barClosed_${id}`;
  }

  // Applies styles and content common to ALL bar types.
  function applyCommonSettings(settings) {
    // Hide all bar containers initially, the specific handler will show the correct one
    document.getElementById('countdown-cta-bar').style.display = 'none';
    document.getElementById('free-shipping-bar').style.display = 'none';
    
    bar.style.backgroundColor = settings.barColor || '#288d40';
    bar.style.color = settings.textColor || '#ffffff';
    bar.className = `countdown-bar countdown-bar--${settings.barPosition || 'top'}`;

    // Apply advanced design settings
    if (settings.fontFamily) {
      bar.style.fontFamily = settings.fontFamily;
    }
    if (settings.fontWeight) {
      const fontWeightMap = { 'normal': '400', 'medium': '500', 'bold': '700' };
      bar.style.fontWeight = fontWeightMap[settings.fontWeight] || settings.fontWeight;
    }
    if (settings.textAlign) {
      bar.style.textAlign = settings.textAlign;
    }
    if (settings.fontSize) {
      bar.style.fontSize = `${settings.fontSize}px`;
    }
    // Apply padding
    if (settings.paddingTop !== undefined) {
      bar.style.paddingTop = `${settings.paddingTop}px`;
    }
    if (settings.paddingBottom !== undefined) {
      bar.style.paddingBottom = `${settings.paddingBottom}px`;
    }
    if (settings.paddingLeft !== undefined) {
      bar.style.paddingLeft = `${settings.paddingLeft}px`;
    }
    if (settings.paddingRight !== undefined) {
      bar.style.paddingRight = `${settings.paddingRight}px`;
    }
    // Apply border
    if (settings.borderWidth && settings.borderWidth > 0) {
      bar.style.borderWidth = `${settings.borderWidth}px`;
      bar.style.borderStyle = 'solid';
      bar.style.borderColor = settings.borderColor || '#e5e7eb';
    }
    if (settings.borderRadius !== undefined) {
      bar.style.borderRadius = `${settings.borderRadius}px`;
    }
    // Apply shadow
    if (settings.shadowStyle) {
      const shadowMap = {
        'none': 'none',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'strong': '0 10px 25px rgba(0, 0, 0, 0.25)'
      };
      bar.style.boxShadow = shadowMap[settings.shadowStyle] || shadowMap.medium;
    }

    const messageEl = bar.querySelector('.countdown-bar__message');
    if (messageEl) {
      messageEl.textContent = settings.barMessage || '';
      // Hide message container if empty for countdown bars
      if (!settings.barMessage && settings.type === 'countdown') {
        messageEl.style.display = 'none';
      }
    }

    const buttonEl = document.getElementById('cta-button');
    if (buttonEl) {
      if (settings.buttonText && settings.buttonLink) {
        buttonEl.textContent = settings.buttonText;
        buttonEl.href = settings.buttonLink;
        // Apply custom button styling if provided
        buttonEl.style.backgroundColor = settings.buttonBgColor || settings.textColor || '#ffffff';
        buttonEl.style.color = settings.buttonTextColor || settings.barColor || '#000000';
        if (settings.buttonBorder) {
          buttonEl.style.border = `${settings.buttonBorder} ${settings.buttonTextColor || settings.barColor || '#000000'}`;
        }
        buttonEl.style.display = 'block';
      } else {
        buttonEl.style.display = 'none';
      }
    }
  }

  // --- Logic specifically for ANNOUNCEMENT bars ---
  function handleAnnouncementBar() {
    const timerEl = document.getElementById('countdown-timer');
    if (timerEl) timerEl.style.display = 'none'; // Hide the timer section.
    bar.style.display = 'flex';
  }

  // --- Logic specifically for FREE SHIPPING bars ---
  // Get cart total from Shopify
  async function getct() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      return cart.total_price / 100; // Shopify returns price in cents
    } catch (error) {
      console.error('Error fetching cart:', error);
      return 0;
    }
  }

  function getcuSymbol(c) {
    const s = {USD:"$",EUR:"€",GBP:"£",CAD:"CA$",AUD:"A$",JPY:"¥",NZD:"NZ$",INR:"₹",SGD:"S$",HKD:"HK$"};
    return s[c] || "$";
  }

  // Format amount with cu
  function formatAmount(a, c) {
    return `${getcuSymbol(c)}${a.toFixed(2)}`;
  }

  // --- Logic specifically for COUNTDOWN bars ---
  function handleCountdownBar(settings) {
    const timerEl = document.getElementById('countdown-timer');
    if (!timerEl) return;
    timerEl.style.display = 'flex'; // Ensure the timer section is visible.

    let endTime;
    const evergreenKey = `evergreen_end_time_${(settings.barMessage || settings.type).slice(0, 20)}`;

    // --- START: THE DEFINITIVE FIX ---
    // This new structure safely handles each timer type in its own isolated block,
    // preventing any possibility of a script-crashing TypeError.
    if (settings.timerType === 'fixed') {
      if (!settings.timerEndDate) {
        console.warn("Countdown bar error: Type is 'fixed' but no end date is set.");
        return bar.style.display = 'none';
      }
      endTime = new Date(settings.timerEndDate).getTime();
    } else if (settings.timerType === 'daily') {
      if (!settings.timerDailyTime) {
        console.warn("Countdown bar error: Type is 'daily' but no daily time is set.");
        return bar.style.display = 'none';
      }
      const [hours, minutes] = settings.timerDailyTime.split(':');
      const now = new Date();
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes)).getTime();
      if (endTime < Date.now()) {
        endTime += 24 * 60 * 60 * 1000;
      }
    } else if (settings.timerType === 'evergreen') {
      if (!settings.timerDuration) {
        console.warn("Countdown bar error: Type is 'evergreen' but no duration is set.");
        return bar.style.display = 'none';
      }
      const storedEndTime = localStorage.getItem(evergreenKey);
      if (storedEndTime) {
        endTime = parseInt(storedEndTime, 10);
      } else {
        endTime = Date.now() + (settings.timerDuration * 60 * 1000);
        localStorage.setItem(evergreenKey, endTime);
      }
    } else {
      console.warn(`Countdown bar error: Unknown timerType '${settings.timerType}'.`);
      // Fallback: show as announcement bar instead
      const timerEl = document.getElementById('countdown-timer');
      if (timerEl) timerEl.style.display = 'none';
      bar.style.display = 'flex';
      return;
    }
    // --- END: THE DEFINITIVE FIX ---

    if (!endTime || isNaN(endTime)) {
      console.warn("Countdown bar error: Could not determine a valid end time.");
      return bar.style.display = 'none';
    }

    const format = settings.timerFormat || {};
    document.getElementById('days-container').style.display = format.showDays ? 'flex' : 'none';
    document.getElementById('hours-container').style.display = format.showHours ? 'flex' : 'none';
    document.getElementById('mins-container').style.display = format.showMinutes ? 'flex' : 'none';
    document.getElementById('secs-container').style.display = format.showSeconds ? 'flex' : 'none';

    function updateCountdown() {
      const distance = endTime - Date.now();

      if (distance < 0) {
        clearInterval(countdownInterval);
        handleCountdownEnd(settings);
        return;
      }

      document.getElementById('days').textContent = String(Math.floor(distance / (1000*60*60*24))).padStart(2,'0');
      document.getElementById('hours').textContent = String(Math.floor((distance % (1000*60*60*24)) / (1000*60*60))).padStart(2,'0');
      document.getElementById('minutes').textContent = String(Math.floor((distance % (1000*60*60)) / (1000*60))).padStart(2,'0');
      document.getElementById('seconds').textContent = String(Math.floor((distance % (1000*60)) / 1000)).padStart(2,'0');
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
    bar.style.display = 'flex';
  }

  // --- Logic specifically for FREE SHIPPING bars ---
  const shippingBar = document.getElementById('free-shipping-bar');

  // Update progress bar based on cart value
  async function updateShippingProgress(settings) {
    if (!settings || settings.type !== 'shipping') return;

    const ct = await getct();
    const th = parseFloat(settings.shippingth) || 50;
    const cu = settings.shippingcu || 'USD';
    
    const pp = Math.min((ct / th) * 100, 100);
    const remaining = Math.max(th - ct, 0);
    const isSuccess = ct >= th;

    const messageEl = document.getElementById('shipping-message');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (messageEl) {
      if (isSuccess) {
        messageEl.textContent = settings.shippingReachedText || "You've unlocked free shipping! 🎉";
        messageEl.classList.add('success');
      } else {
        const message = (settings.shippingGoalText || "Add {amount} more for free shipping!")
          .replace('{amount}', formatAmount(remaining, cu));
        messageEl.textContent = message;
        messageEl.classList.remove('success');
      }
    }

    if (progressFill) {
      progressFill.style.width = `${pp}%`;
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
        progressText.textContent = `${formatAmount(ct, cu)} / ${formatAmount(th, cu)}`;
      }
    }
  }

  // Handle bar initialization for shipping bar
  function handleFreeShippingBar(settings) {
    if (!shippingBar) return;

    // Apply settings specific to shipping bar
    shippingBar.style.backgroundColor = settings.barColor || '#288d40';
    shippingBar.style.color = settings.textColor || '#ffffff';
    shippingBar.className = `free-shipping-bar free-shipping-bar--${settings.barPosition || 'top'}`;

    // Apply advanced design settings to shipping bar
    if (settings.fontFamily) {
      shippingBar.style.fontFamily = settings.fontFamily;
    }
    if (settings.fontWeight) {
      const fontWeightMap = { 'normal': '400', 'medium': '500', 'bold': '700' };
      shippingBar.style.fontWeight = fontWeightMap[settings.fontWeight] || settings.fontWeight;
    }
    if (settings.textAlign) {
      shippingBar.style.textAlign = settings.textAlign;
    }
    if (settings.fontSize) {
      shippingBar.style.fontSize = `${settings.fontSize}px`;
    }
    // Apply padding
    if (settings.paddingTop !== undefined) {
      shippingBar.style.paddingTop = `${settings.paddingTop}px`;
    }
    if (settings.paddingBottom !== undefined) {
      shippingBar.style.paddingBottom = `${settings.paddingBottom}px`;
    }
    if (settings.paddingLeft !== undefined) {
      shippingBar.style.paddingLeft = `${settings.paddingLeft}px`;
    }
    if (settings.paddingRight !== undefined) {
      shippingBar.style.paddingRight = `${settings.paddingRight}px`;
    }
    // Apply border
    if (settings.borderWidth && settings.borderWidth > 0) {
      shippingBar.style.borderWidth = `${settings.borderWidth}px`;
      shippingBar.style.borderStyle = 'solid';
      shippingBar.style.borderColor = settings.borderColor || '#e5e7eb';
    }
    if (settings.borderRadius !== undefined) {
      shippingBar.style.borderRadius = `${settings.borderRadius}px`;
    }
    // Apply shadow
    if (settings.shadowStyle) {
      const shadowMap = {
        'none': 'none',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'strong': '0 10px 25px rgba(0, 0, 0, 0.25)'
      };
      shippingBar.style.boxShadow = shadowMap[settings.shadowStyle] || shadowMap.medium;
    }

    const iconEl = document.getElementById('shipping-icon');
    if (iconEl) {
      iconEl.style.display = settings.shippingShowIcon ? 'inline' : 'none';
    }

    const progressFill = document.getElementById('progress-fill');
    if (progressFill && settings.shippingProgressColor) {
      progressFill.style.backgroundColor = settings.shippingProgressColor;
    }

    updateShippingProgress(settings);
    shippingBar.style.display = 'flex';

    // Listen for cart updates (Shopify theme events)
    const setupCartListeners = () => {
      document.addEventListener('cart:updated', () => updateShippingProgress(settings));
      const of = window.fetch;
      window.fetch = function(...a) {
        const u = a[0];
        if (typeof u === 'string' && (u.includes('/cart') || u.includes('cart.js'))) {
          return of.apply(this, a).then(r => {
            r.clone().json().then(() => setTimeout(() => updateShippingProgress(settings), 100)).catch(() => {});
            return r;
          });
        }
        return of.apply(this, a);
      };
    };
    setupCartListeners();

    // Setup close button
    const closeBtn = document.getElementById('close-shipping-bar');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        // Track bar close
        trackEvent('bar_closed', settings);
        
        shippingBar.style.display = 'none';
        sessionStorage.setItem(getSessionKey(settings.id), 'true');
      });
    }
  }

  function handleCountdownEnd(settings) {
    const timerEl = document.getElementById('countdown-timer');
    const messageEl = bar.querySelector('.countdown-bar__message');
    if (settings.timerEndAction === 'hide') {
      bar.style.display = 'none';
    } else if (settings.timerEndAction === 'show_message' && messageEl) {
      if (timerEl) timerEl.style.display = 'none';
      messageEl.textContent = settings.timerEndMessage;
    }
  }

  // --- Targeting validation functions ---
  
  // Check if current device matches targeting
  function matchesDeviceTarget(targetDevices) {
    if (!targetDevices || targetDevices === 'both') return true;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (targetDevices === 'mobile' && isMobile) return true;
    if (targetDevices === 'desktop' && !isMobile) return true;
    
    return false;
  }
  
  // Check if current page matches targeting
  function matchesPageTarget(settings) {
    const targetPages = settings.targetPages || 'all';
    
    if (targetPages === 'all') return true;
    
    const currentPath = window.location.pathname;
    
    // Homepage targeting
    if (targetPages === 'homepage') {
      return currentPath === '/' || currentPath === '';
    }
    
    // Product page targeting
    if (targetPages === 'product') {
      return currentPath.includes('/products/');
    }
    
    // Collection page targeting
    if (targetPages === 'collection') {
      return currentPath.includes('/collections/');
    }
    
    // Cart page targeting
    if (targetPages === 'cart') {
      return currentPath.includes('/cart');
    }
    
    // Specific URLs targeting
    if (targetPages === 'specific') {
      try {
        const specificUrls = settings.targetSpecificUrls ? JSON.parse(settings.targetSpecificUrls) : [];
        return specificUrls.some(url => currentPath === url || currentPath.startsWith(url));
      } catch (e) {
        console.error('Invalid targetSpecificUrls:', e);
        return false;
      }
    }
    
    // URL pattern matching
    if (targetPages === 'pattern') {
      try {
        const pattern = settings.targetUrlPattern ? JSON.parse(settings.targetUrlPattern) : null;
        if (!pattern || !pattern.value) return false;
        
        const patternValue = pattern.value;
        const patternType = pattern.type || 'contains';
        
        if (patternType === 'contains') {
          return currentPath.includes(patternValue);
        } else if (patternType === 'starts_with') {
          return currentPath.startsWith(patternValue);
        } else if (patternType === 'ends_with') {
          return currentPath.endsWith(patternValue);
        }
      } catch (e) {
        console.error('Invalid targetUrlPattern:', e);
        return false;
      }
    }
    
    return false;
  }
  
  // Check display frequency and manage cookies/session
  function shouldShowBasedOnFrequency(settings) {
    const frequency = settings.displayFrequency || 'always';
    const barId = settings.id;
    
    if (frequency === 'always') return true;
    
    if (frequency === 'once_per_session') {
      const sessionKey = `barShown_session_${barId}`;
      if (sessionStorage.getItem(sessionKey) === 'true') {
        return false;
      }
      // Mark as shown in session
      sessionStorage.setItem(sessionKey, 'true');
      return true;
    }
    
    if (frequency === 'once_per_visitor') {
      const cookieKey = `barShown_visitor_${barId}`;
      // Check if cookie exists
      if (document.cookie.split('; ').find(row => row.startsWith(`${cookieKey}=`))) {
        return false;
      }
      // Set cookie for 365 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 365);
      document.cookie = `${cookieKey}=true; expires=${expiryDate.toUTCString()}; path=/`;
      return true;
    }
    
    return true;
  }
  
  // Validate all targeting rules
  function passesTargetingRules(settings) {
    // Check device targeting
    if (!matchesDeviceTarget(settings.targetDevices)) {
      console.log('Bar hidden: device targeting mismatch');
      return false;
    }
    
    // Check page targeting
    if (!matchesPageTarget(settings)) {
      console.log('Bar hidden: page targeting mismatch');
      return false;
    }
    
    // Check display frequency
    if (!shouldShowBasedOnFrequency(settings)) {
      console.log('Bar hidden: display frequency limit reached');
      return false;
    }
    
    return true;
  }

  // --- Main execution starts here ---
  const proxyBase = '/apps/countdown';
  
  fetch(`${proxyBase}/settings?shop=${encodeURIComponent(shop)}`)
    .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("BAR DATA RECEIVED:", data);
      if (!data.success || !data.settings) {
        console.warn('Bar: No active bar found.');
        return bar.style.display = 'none';
      }

      const settings = data.settings;
      const sessionKey = getSessionKey(settings.id);
      const isClosed = sessionStorage.getItem(sessionKey) === 'true';

      if (isClosed) {
        console.log(`Bar with ID ${settings.id} was previously closed in this session. Hiding.`);
        return bar.style.display = 'none';
      }

      // Validate targeting rules
      if (!passesTargetingRules(settings)) {
        return bar.style.display = 'none';
      }

      applyCommonSettings(settings);

      if (settings.type === 'countdown') {
        console.log("Handling as: Countdown Bar");
        handleCountdownBar(settings);
      } else if (settings.type === 'shipping') {
        console.log("Handling as: Free Shipping Bar");
        handleFreeShippingBar(settings);
      } else {
        console.log("Handling as: Announcement Bar");
        handleAnnouncementBar(settings);
      }

      // Track bar impression (placeholder for analytics)
      trackEvent('bar_impression', settings);

      const closeBtn = document.getElementById('close-bar');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          
          bar.style.display = 'none';
          sessionStorage.setItem(sessionKey, 'true');
          if (countdownInterval) clearInterval(countdownInterval);
        });
      }
      
      // Track CTA button clicks
      const ctaButton = document.getElementById('cta-button');
      if (ctaButton && ctaButton.href && ctaButton.href !== '#') {
        ctaButton.addEventListener('click', () => {
          trackEvent('bar_cta_click', settings, { 'cta_link': ctaButton.href });
        });
      }
    }).catch(() => bar.style.display = 'none');
})();