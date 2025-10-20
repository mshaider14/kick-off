(function() {
  'use strict';

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
    bar.style.backgroundColor = settings.barColor || '#288d40';
    bar.style.color = settings.textColor || '#ffffff';
    bar.className = `countdown-bar countdown-bar--${settings.barPosition || 'top'}`;

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
        buttonEl.style.backgroundColor = settings.textColor || '#ffffff';
        buttonEl.style.color = settings.barColor || '#000000';
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

  // --- Main execution starts here ---
  const proxyBase = '/apps/countdown';
  
  // Add retry logic for better reliability
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

      applyCommonSettings(settings);

      if (settings.type === 'countdown') {
        console.log("Handling as: Countdown Bar");
        handleCountdownBar(settings);
      } else {
        console.log("Handling as: Announcement Bar");
        handleAnnouncementBar(settings);
      }

      // Track bar impression (placeholder for analytics)
      try {
        if (typeof window.dataLayer !== 'undefined') {
          window.dataLayer.push({
            'event': 'bar_impression',
            'bar_type': settings.type,
            'bar_id': settings.id,
            'bar_position': settings.barPosition
          });
        }
      } catch (e) {
        // Silent fail for analytics
      }

      const closeBtn = document.getElementById('close-bar');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          // Track bar close (placeholder for analytics)
          try {
            if (typeof window.dataLayer !== 'undefined') {
              window.dataLayer.push({
                'event': 'bar_closed',
                'bar_type': settings.type,
                'bar_id': settings.id
              });
            }
          } catch (e) {
            // Silent fail
          }
          
          bar.style.display = 'none';
          sessionStorage.setItem(sessionKey, 'true');
          if (countdownInterval) clearInterval(countdownInterval);
        });
      }
      
      // Track CTA button clicks
      const ctaButton = document.getElementById('cta-button');
      if (ctaButton && ctaButton.href && ctaButton.href !== '#') {
        ctaButton.addEventListener('click', () => {
          try {
            if (typeof window.dataLayer !== 'undefined') {
              window.dataLayer.push({
                'event': 'bar_cta_click',
                'bar_type': settings.type,
                'bar_id': settings.id,
                'cta_link': ctaButton.href
              });
            }
          } catch (e) {
            // Silent fail
          }
        });
      }
    })
    .catch(error => {
        console.error('Bar fetch error:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying... (${retryCount}/${maxRetries})`);
          setTimeout(fetchBarSettings, 1000 * retryCount); // Exponential backoff
        } else {
          console.error('Max retries reached. Hiding bar.');
          bar.style.display = 'none';
        }
      });
  }
  
  // Start initial fetch
  fetchBarSettings();
})();