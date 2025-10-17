(function() {
  'use strict';
  
  const bar = document.getElementById('countdown-cta-bar');
  if (!bar) return;
  
  const shop = bar.getAttribute('data-shop');
  
  // Check if bar was closed by user
  const barClosed = sessionStorage.getItem('countdownBarClosed');
  if (barClosed === 'true') {
    bar.style.display = 'none';
    return;
  }
  
  // Close button functionality
  const closeBtn = document.getElementById('close-bar');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      bar.style.display = 'none';
      sessionStorage.setItem('countdownBarClosed', 'true');
    });
  }
  
  // If you configured an App Proxy with subpath "apps/countdown"
  const proxyBase = '/apps/countdown';
  fetch(`${proxyBase}/settings?shop=${encodeURIComponent(shop)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.success || !data.settings) {
        console.warn('Countdown bar: No settings found');
        bar.style.display = 'none';
        return;
      }
      
      const settings = data.settings;
      
      // Apply settings to bar
      bar.style.backgroundColor = settings.barColor || '#288d40';
      const pos = Array.isArray(settings.barPosition) ? settings.barPosition[0] : (settings.barPosition || 'top');
      bar.className = `countdown-bar countdown-bar--${pos}`;

      // Update message
      const messageEl = bar.querySelector('.countdown-bar__message');
      if (messageEl) {
        messageEl.textContent = settings.barMessage || 'Flash Sale Ends In...';
      }
      
      // Update button
      const buttonEl = document.getElementById('cta-button');
      if (buttonEl) {
        if (settings.buttonText && settings.buttonLink) {
          buttonEl.textContent = settings.buttonText;
          buttonEl.href = settings.buttonLink;
          buttonEl.rel = 'noopener noreferrer';
          buttonEl.style.display = 'block';
        } else {
          buttonEl.style.display = 'none';
        }
      }

      // Apply timer format settings
      const timerFormat = settings.timerFormat || { showDays: true, showHours: true, showMinutes: true, showSeconds: true };
      const timerEl = document.getElementById('countdown-timer');
      if (timerEl) {
        const daysUnit = timerEl.querySelector('#days')?.parentElement?.parentElement;
        const hoursUnit = timerEl.querySelector('#hours')?.parentElement?.parentElement;
        const minutesUnit = timerEl.querySelector('#minutes')?.parentElement?.parentElement;
        const secondsUnit = timerEl.querySelector('#seconds')?.parentElement?.parentElement;
        
        if (daysUnit) daysUnit.style.display = timerFormat.showDays ? 'flex' : 'none';
        if (hoursUnit) hoursUnit.style.display = timerFormat.showHours ? 'flex' : 'none';
        if (minutesUnit) minutesUnit.style.display = timerFormat.showMinutes ? 'flex' : 'none';
        if (secondsUnit) secondsUnit.style.display = timerFormat.showSeconds ? 'flex' : 'none';
        
        // Hide separators for hidden units
        const separators = timerEl.querySelectorAll('.countdown-bar__separator');
        separators.forEach((sep, idx) => {
          const units = [timerFormat.showDays, timerFormat.showHours, timerFormat.showMinutes, timerFormat.showSeconds];
          // Only show separator if both surrounding units are visible
          let showSep = false;
          if (idx === 0) showSep = units[0] && units[1]; // Between days and hours
          else if (idx === 1) showSep = units[1] && units[2]; // Between hours and minutes
          else if (idx === 2) showSep = units[2] && units[3]; // Between minutes and seconds
          sep.style.display = showSep ? 'inline' : 'none';
        });
      }

      // Show bar
      bar.style.display = 'block';
      
      // Start countdown based on timer type
      const timerType = settings.timerType || 'fixed';
      const timerEndAction = settings.timerEndAction || 'hide';
      const timerEndMessage = settings.timerEndMessage || '';
      
      if (timerType === 'fixed' && settings.timerEndDate) {
        startCountdown(settings.timerEndDate, timerEndAction, timerEndMessage);
      } else if (timerType === 'daily' && settings.timerDailyTime) {
        startDailyCountdown(settings.timerDailyTime);
      } else if (timerType === 'evergreen' && settings.timerDuration) {
        startEvergreenCountdown(settings.timerDuration, timerEndAction, timerEndMessage);
      } else {
        console.warn('Countdown bar: Invalid timer configuration');
      }
    })
    .catch(error => {
      console.error('Countdown bar fetch error:', error);
      bar.style.display = 'none';
    });
  
  // Fixed timer - counts down to a specific date/time
  function startCountdown(endDateStr, endAction, customMessage) {
    const endDate = new Date(endDateStr).getTime();
    
    if (isNaN(endDate)) {
      console.error('Countdown bar: Invalid end date format');
      return;
    }
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const timerEl = document.getElementById('countdown-timer');
    const messageEl = bar.querySelector('.countdown-bar__message');
    
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = endDate - now;
      
      if (distance < 0) {
        handleCountdownEnd(endAction, customMessage, messageEl, timerEl);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    window.addEventListener('beforeunload', function() {
      clearInterval(interval);
    });
  }
  
  // Daily recurring timer - resets every day at specific time
  function startDailyCountdown(dailyTime) {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    function getNextResetTime() {
      const [targetHours, targetMinutes] = dailyTime.split(':').map(Number);
      const now = new Date();
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHours, targetMinutes, 0);
      
      // If target time has passed today, set it for tomorrow
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      
      return target.getTime();
    }
    
    function updateCountdown() {
      const endDate = getNextResetTime();
      const now = new Date().getTime();
      const distance = endDate - now;
      
      if (distance < 0) {
        // This shouldn't happen with daily recurring, but handle it
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    window.addEventListener('beforeunload', function() {
      clearInterval(interval);
    });
  }
  
  // Evergreen timer - starts from first view, unique per visitor
  function startEvergreenCountdown(durationMinutes, endAction, customMessage) {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const timerEl = document.getElementById('countdown-timer');
    const messageEl = bar.querySelector('.countdown-bar__message');
    
    const storageKey = 'evergreenTimerEnd_' + shop;
    let endTime = localStorage.getItem(storageKey);
    
    if (!endTime) {
      // First visit - set the end time
      endTime = Date.now() + (durationMinutes * 60 * 1000);
      localStorage.setItem(storageKey, endTime);
    } else {
      endTime = parseInt(endTime, 10);
    }
    
    function updateCountdown() {
      const now = Date.now();
      const distance = endTime - now;
      
      if (distance < 0) {
        handleCountdownEnd(endAction, customMessage, messageEl, timerEl);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    window.addEventListener('beforeunload', function() {
      clearInterval(interval);
    });
  }
  
  // Handle what happens when countdown ends
  function handleCountdownEnd(endAction, customMessage, messageEl, timerEl) {
    if (endAction === 'hide') {
      bar.style.display = 'none';
    } else if (endAction === 'show_message' && customMessage) {
      if (messageEl) messageEl.textContent = customMessage;
      if (timerEl) timerEl.style.display = 'none';
    } else {
      // Default: hide timer but keep bar visible
      if (timerEl) timerEl.style.display = 'none';
    }
  }
})();