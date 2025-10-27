(function() {
  'use strict';
  
  /**
   * Kick-off Theme Extension - Bar Display Handler
   * 
   * Features:
   * - Supports multiple bar types: announcement, countdown, free shipping
   * - Priority-based bar selection (newest first)
   * - Advanced targeting: device, page, URL patterns
   * - Frequency control: always, once per session, once per visitor
   * - Smooth animations and responsive design
   * - Performance optimized: ~100ms render time
   * - Analytics tracking for views and clicks
   */

  // Track analytics events
  function trackEvent(eventType, settings, extraData = {}) {
    const proxyBase = '/apps/countdown';
    const endpoint = eventType === 'bar_impression' 
      ? `${proxyBase}/analytics/track-view`
      : `${proxyBase}/analytics/track-click`;

    const data = {
      shop: settings.shop || shop,
      barId: settings.id,
      ...extraData
    };

    // Send event asynchronously
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      keepalive: true
    }).catch(err => {
      console.error('Analytics tracking error:', err);
    });
  }

  const bar = document.getElementById('countdown-cta-bar');
  if (!bar) return;

  const shop = bar.getAttribute('data-shop');
  if (!shop) {
    console.error('Shop parameter missing from bar element');
    return;
  }
  
  let countdownInterval;
  
  // Performance monitoring (only in development)
  const perfStart = performance.now();

  // Creates a unique, reliable session key based on the bar's database ID.
  function getSessionKey(id) {
    return `barClosed_${id}`;
  }

  // Applies styles and content common to ALL bar types.
  function applyCommonSettings(settings) {
    // Safety check
    if (!settings || !settings.id) {
      console.error('Invalid settings object:', settings);
      return;
    }
    
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

  // --- Multi-message rotation logic ---
  let messageRotationInterval = null;
  let currentMessageIndex = 0;

  // Helper function to update message and CTA during rotation
  function updateRotatingMessage(messageEl, buttonEl, message, transitionType) {
    if (!message) return;

    // Apply transition
    if (transitionType === 'fade') {
      messageEl.style.transition = 'opacity 0.3s ease-in-out';
      if (buttonEl) buttonEl.style.transition = 'opacity 0.3s ease-in-out';
      
      messageEl.style.opacity = '0';
      if (buttonEl) buttonEl.style.opacity = '0';

      setTimeout(() => {
        messageEl.textContent = message.message || '';
        
        if (message.ctaText && message.ctaLink && buttonEl) {
          buttonEl.textContent = message.ctaText;
          buttonEl.href = message.ctaLink;
          buttonEl.style.display = 'block';
        } else if (buttonEl) {
          buttonEl.style.display = 'none';
        }

        messageEl.style.opacity = '1';
        if (buttonEl && message.ctaText) buttonEl.style.opacity = '1';
      }, 300);
    } else if (transitionType === 'slide') {
      messageEl.style.transition = 'transform 0.5s ease-in-out, opacity 0.3s ease-in-out';
      if (buttonEl) buttonEl.style.transition = 'transform 0.5s ease-in-out, opacity 0.3s ease-in-out';
      
      messageEl.style.transform = 'translateX(-20px)';
      messageEl.style.opacity = '0';
      if (buttonEl) {
        buttonEl.style.transform = 'translateX(-20px)';
        buttonEl.style.opacity = '0';
      }

      setTimeout(() => {
        messageEl.textContent = message.message || '';
        
        if (message.ctaText && message.ctaLink && buttonEl) {
          buttonEl.textContent = message.ctaText;
          buttonEl.href = message.ctaLink;
          buttonEl.style.display = 'block';
        } else if (buttonEl) {
          buttonEl.style.display = 'none';
        }

        messageEl.style.transform = 'translateX(0)';
        messageEl.style.opacity = '1';
        if (buttonEl && message.ctaText) {
          buttonEl.style.transform = 'translateX(0)';
          buttonEl.style.opacity = '1';
        }
      }, 500);
    }
  }

  function initializeMultiMessageRotation(settings) {
    // Check if multi-message is enabled
    if (!settings.messages) return null;

    try {
      const messages = JSON.parse(settings.messages);
      if (!Array.isArray(messages) || messages.length <= 1) return null;

      const rotationSpeed = (settings.rotationSpeed || 5) * 1000; // Convert to milliseconds
      const transitionType = settings.transitionType || 'fade';
      
      const messageEl = bar.querySelector('.countdown-bar__message');
      const buttonEl = document.getElementById('cta-button');
      
      if (!messageEl) return null;

      // Set initial message
      updateRotatingMessage(messageEl, buttonEl, messages[currentMessageIndex], transitionType);

      // Start rotation
      messageRotationInterval = setInterval(() => {
        currentMessageIndex = (currentMessageIndex + 1) % messages.length;
        updateRotatingMessage(messageEl, buttonEl, messages[currentMessageIndex], transitionType);
      }, rotationSpeed);

      return messageRotationInterval;
    } catch (e) {
      console.error('Error parsing messages for rotation:', e);
      return null;
    }
  }

  function stopMultiMessageRotation() {
    if (messageRotationInterval) {
      clearInterval(messageRotationInterval);
      messageRotationInterval = null;
      currentMessageIndex = 0;
    }
  }

  // --- Logic specifically for ANNOUNCEMENT bars ---
  function handleAnnouncementBar(settings) {
    const timerEl = document.getElementById('countdown-timer');
    if (timerEl) timerEl.style.display = 'none'; // Hide the timer section.
    
    // Initialize multi-message rotation if enabled
    initializeMultiMessageRotation(settings);
    
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
  
  if (!shippingBar) {
    console.warn('Free shipping bar element not found in DOM');
  }

  // --- Logic specifically for EMAIL CAPTURE bars ---
  const emailBar = document.getElementById('email-capture-bar');
  
  if (!emailBar) {
    console.warn('Email capture bar element not found in DOM');
  }

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

  // --- Logic specifically for EMAIL CAPTURE bars ---
  function handleEmailCaptureBar(settings) {
    if (!emailBar) return;

    // Apply settings specific to email capture bar
    emailBar.style.backgroundColor = settings.barColor || '#288d40';
    emailBar.style.color = settings.textColor || '#ffffff';
    emailBar.className = `email-capture-bar email-capture-bar--${settings.barPosition || 'top'}`;

    // Apply advanced design settings
    if (settings.fontFamily) {
      emailBar.style.fontFamily = settings.fontFamily;
    }
    if (settings.fontWeight) {
      const fontWeightMap = { 'normal': '400', 'medium': '500', 'bold': '700' };
      emailBar.style.fontWeight = fontWeightMap[settings.fontWeight] || settings.fontWeight;
    }
    if (settings.textAlign) {
      emailBar.style.textAlign = settings.textAlign;
    }
    if (settings.fontSize) {
      emailBar.style.fontSize = `${settings.fontSize}px`;
    }
    // Apply padding
    if (settings.paddingTop !== undefined) {
      emailBar.style.paddingTop = `${settings.paddingTop}px`;
    }
    if (settings.paddingBottom !== undefined) {
      emailBar.style.paddingBottom = `${settings.paddingBottom}px`;
    }
    if (settings.paddingLeft !== undefined) {
      emailBar.style.paddingLeft = `${settings.paddingLeft}px`;
    }
    if (settings.paddingRight !== undefined) {
      emailBar.style.paddingRight = `${settings.paddingRight}px`;
    }
    // Apply border
    if (settings.borderWidth && settings.borderWidth > 0) {
      emailBar.style.borderWidth = `${settings.borderWidth}px`;
      emailBar.style.borderStyle = 'solid';
      emailBar.style.borderColor = settings.borderColor || '#e5e7eb';
    }
    if (settings.borderRadius !== undefined) {
      emailBar.style.borderRadius = `${settings.borderRadius}px`;
    }
    // Apply shadow
    if (settings.shadowStyle && settings.shadowStyle !== 'none') {
      const shadowMap = {
        'subtle': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.2)'
      };
      emailBar.style.boxShadow = shadowMap[settings.shadowStyle] || shadowMap.medium;
    }

    // Get form elements
    const messageEl = document.getElementById('email-message');
    const emailInput = document.getElementById('email-input');
    const nameInput = document.getElementById('name-input');
    const privacyContainer = document.getElementById('privacy-checkbox-container');
    const privacyCheckbox = document.getElementById('privacy-checkbox');
    const privacyText = document.getElementById('privacy-text');
    const submitButton = document.getElementById('email-submit');
    const emailForm = document.getElementById('email-form');
    const errorEl = document.getElementById('email-error');
    const successContainer = document.getElementById('email-success');
    const successMessage = document.getElementById('success-message');
    const discountCodeContainer = document.getElementById('discount-code-container');
    const discountCode = document.getElementById('discount-code');

    // Set content
    if (messageEl) {
      messageEl.textContent = settings.message || 'Get 10% Off Your First Order!';
    }
    if (emailInput) {
      emailInput.placeholder = settings.emailPlaceholder || 'Enter your email';
    }
    if (nameInput && settings.nameFieldEnabled) {
      nameInput.style.display = 'block';
      nameInput.placeholder = settings.namePlaceholder || 'Your name (optional)';
    }
    if (privacyContainer && privacyCheckbox) {
      if (settings.privacyCheckboxEnabled) {
        privacyContainer.style.display = 'flex';
        privacyCheckbox.required = true;
        if (privacyText) {
          privacyText.textContent = settings.privacyCheckboxText || 'I agree to receive marketing emails';
        }
      } else {
        privacyContainer.style.display = 'none';
        privacyCheckbox.required = false;
      }
    }
    if (submitButton) {
      submitButton.textContent = settings.submitButtonText || 'Get My Discount';
      // Apply button custom colors if provided
      if (settings.buttonBgColor) {
        submitButton.style.backgroundColor = settings.buttonBgColor;
      }
      if (settings.buttonTextColor) {
        submitButton.style.color = settings.buttonTextColor;
      }
    }

    // Handle form submission
    if (emailForm) {
      emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide error message
        if (errorEl) errorEl.style.display = 'none';

        // Get form values
        const email = emailInput ? emailInput.value.trim() : '';
        const name = nameInput && nameInput.style.display !== 'none' ? nameInput.value.trim() : '';

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          if (errorEl) {
            errorEl.textContent = 'Please enter a valid email address';
            errorEl.style.display = 'block';
          }
          return;
        }

        // Validate privacy checkbox if enabled
        if (settings.privacyCheckboxEnabled && privacyCheckbox && !privacyCheckbox.checked) {
          if (errorEl) {
            errorEl.textContent = 'Please accept the privacy agreement';
            errorEl.style.display = 'block';
          }
          return;
        }

        // Disable submit button
        submitButton.disabled = true;
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';

        try {
          // Submit to API
          const response = await fetch('/apps/countdown/email-submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              shop: settings.shop,
              barId: settings.id,
              email: email,
              name: name,
              userAgent: navigator.userAgent
            }),
          });

          const data = await response.json();

          if (data.success) {
            // Hide form, show success message
            emailForm.style.display = 'none';
            if (successContainer) {
              successContainer.style.display = 'block';
              if (successMessage) {
                successMessage.textContent = data.message || settings.successMessage || 'Thank you for subscribing!';
              }
              // Show discount code if available
              if (data.discountCode && discountCodeContainer && discountCode) {
                discountCodeContainer.style.display = 'flex';
                discountCode.textContent = data.discountCode;
              }
            }

            // Track email submission
            trackEvent('email_submitted', settings, { email: email });
          } else {
            // Show error message
            if (errorEl) {
              errorEl.textContent = data.error || 'Unable to submit email. Please try again.';
              errorEl.style.display = 'block';
            }
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          }
        } catch (error) {
          console.error('Email submission error:', error);
          if (errorEl) {
            errorEl.textContent = 'Network error. Please try again.';
            errorEl.style.display = 'block';
          }
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
    }

    // Display the email bar
    emailBar.style.display = 'flex';
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
  
  // Check if current visitor's country matches geo-targeting rules
  async function matchesGeoTarget(settings) {
    // If geo-targeting is not enabled, always show
    if (!settings.geoTargetingEnabled) {
      return true;
    }
    
    const mode = settings.geoTargetingMode || 'all';
    
    // If mode is 'all', show to everyone
    if (mode === 'all') {
      return true;
    }
    
    try {
      // Fetch visitor's country from geo detection API
      const response = await fetch('/api/geo/detect');
      const data = await response.json();
      
      if (!data.success || !data.country) {
        // If detection fails, apply fallback behavior
        // For 'include' mode: don't show (safer default)
        // For 'exclude' mode: show (safer default)
        console.log('Geo-targeting: Country detection failed, applying fallback');
        return mode === 'exclude';
      }
      
      const visitorCountry = data.country;
      console.log('Geo-targeting: Detected country:', visitorCountry);
      
      // Parse targeted countries
      let targetedCountries = [];
      try {
        targetedCountries = settings.geoTargetedCountries 
          ? JSON.parse(settings.geoTargetedCountries) 
          : [];
      } catch (e) {
        console.error('Geo-targeting: Invalid country list', e);
        return mode === 'exclude'; // Fallback: show for exclude, hide for include
      }
      
      const isInList = targetedCountries.includes(visitorCountry);
      
      // For 'include' mode: show only if in list
      // For 'exclude' mode: show only if NOT in list
      return mode === 'include' ? isInList : !isInList;
      
    } catch (error) {
      console.error('Geo-targeting error:', error);
      // Fallback: for 'exclude' mode show, for 'include' mode hide
      return mode === 'exclude';
    }
  }
  
  // Validate all targeting rules
  async function passesTargetingRules(settings) {
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
    
    // Check geo-targeting (async)
    const passesGeo = await matchesGeoTarget(settings);
    if (!passesGeo) {
      console.log('Bar hidden: geo-targeting mismatch');
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
  
  // Try to fetch multiple bars from the new API endpoint first
  // Fallback to single bar endpoint for backward compatibility
  const fetchBars = async () => {
    try {
      // Try new endpoint that supports multiple bars
      const response = await fetch(`/api/bars/active?shop=${encodeURIComponent(shop)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bars && data.bars.length > 0) {
          return { bars: data.bars, multiBar: true };
        }
      }
    } catch (err) {
      console.log('Multi-bar API not available, falling back to single bar');
    }
    
    // Fallback to original single bar endpoint
    try {
      const response = await fetch(`${proxyBase}/settings?shop=${encodeURIComponent(shop)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          return { bars: [data.settings], multiBar: false };
        }
      }
    } catch (err) {
      console.error('Failed to fetch bar settings:', err);
    }
    
    return { bars: [], multiBar: false };
  };
  
  fetchBars()
    .then(async ({ bars }) => {
      console.log("BAR DATA RECEIVED:", bars);
      
      if (!bars || bars.length === 0) {
        console.warn('Bar: No active bars found.');
        return bar.style.display = 'none';
      }

      // Process bars with priority (first valid bar wins)
      let displayedBar = false;
      
      for (const settings of bars) {
        const sessionKey = getSessionKey(settings.id);
        const isClosed = sessionStorage.getItem(sessionKey) === 'true';

        if (isClosed) {
          console.log(`Bar with ID ${settings.id} was previously closed in this session. Skipping.`);
          continue;
        }

        // Validate targeting rules (now async)
        const passes = await passesTargetingRules(settings);
        if (!passes) {
          console.log(`Bar with ID ${settings.id} doesn't pass targeting rules. Skipping.`);
          continue;
        }

        // Found a valid bar to display
        applyCommonSettings(settings);

        if (settings.type === 'countdown') {
          console.log("Handling as: Countdown Bar");
          handleCountdownBar(settings);
        } else if (settings.type === 'shipping') {
          console.log("Handling as: Free Shipping Bar");
          handleFreeShippingBar(settings);
        } else if (settings.type === 'email') {
          console.log("Handling as: Email Capture Bar");
          handleEmailCaptureBar(settings);
        } else {
          console.log("Handling as: Announcement Bar");
          handleAnnouncementBar(settings);
        }

        // Track bar impression
        trackEvent('bar_impression', settings);

        // Setup close button (use appropriate close button based on bar type)
        const closeBtn = settings.type === 'shipping' 
          ? document.getElementById('close-shipping-bar')
          : settings.type === 'email'
          ? document.getElementById('close-email-bar')
          : document.getElementById('close-bar');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            // Track bar close
            trackEvent('bar_closed', settings);
            
            // Hide appropriate bar
            if (settings.type === 'shipping') {
              shippingBar.style.display = 'none';
            } else if (settings.type === 'email') {
              emailBar.style.display = 'none';
            } else {
              bar.style.display = 'none';
            }
            
            sessionStorage.setItem(sessionKey, 'true');
            if (countdownInterval) clearInterval(countdownInterval);
            stopMultiMessageRotation(); // Stop message rotation when bar is closed
          });
        }
        
        // Track CTA button clicks
        const ctaButton = document.getElementById('cta-button');
        if (ctaButton && ctaButton.href && ctaButton.href !== '#') {
          ctaButton.addEventListener('click', () => {
            trackEvent('bar_cta_click', settings, { 'cta_link': ctaButton.href });
          });
        }
        
        displayedBar = true;
        
        // Log performance metrics
        const perfEnd = performance.now();
        const renderTime = perfEnd - perfStart;
        console.log(`Bar rendered in ${renderTime.toFixed(2)}ms`);
        
        break; // Only display the first valid bar (highest priority)
      }
      
      if (!displayedBar) {
        console.log('No valid bars to display after filtering.');
        bar.style.display = 'none';
      }
    })
    .catch((err) => {
      console.error('Error loading bars:', err);
      bar.style.display = 'none';
    });
})();