(function() {
  'use strict';

  const bar = document.getElementById('countdown-cta-bar');
  if (!bar) return;

  const shop = bar.getAttribute('data-shop');
  let countdownInterval;

  function getSessionKey(message) {
    return `barClosed_${message.replace(/\s+/g, '_').slice(0, 30)}`;
  }

  function applyCommonStyles(settings) {
    bar.style.backgroundColor = settings.barColor || '#288d40';
    bar.style.color = settings.textColor || '#ffffff';
    bar.className = `countdown-bar countdown-bar--${settings.barPosition || 'top'}`;

    const messageEl = bar.querySelector('.countdown-bar__message');
    if (messageEl) messageEl.textContent = settings.barMessage;

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

  function handleAnnouncementBar(settings) {
    const timerEl = document.getElementById('countdown-timer');
    if (timerEl) timerEl.style.display = 'none';
    bar.style.display = 'flex';
  }

  function handleCountdownBar(settings) {
    const timerEl = document.getElementById('countdown-timer');
    if (!timerEl) return;

    let endTime;
    const evergreenKey = `evergreen_end_time_${settings.barMessage.slice(0, 20)}`;

    if (settings.timerType === 'fixed') {
      endTime = new Date(settings.timerEndDate).getTime();
    } else if (settings.timerType === 'daily') {
      const [hours, minutes] = settings.timerDailyTime.split(':');
      const now = new Date();
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes)).getTime();
      if (endTime < Date.now()) endTime += 24 * 60 * 60 * 1000;
    } else if (settings.timerType === 'evergreen') {
      const storedEndTime = localStorage.getItem(evergreenKey);
      if (storedEndTime) {
        endTime = parseInt(storedEndTime, 10);
      } else {
        endTime = Date.now() + (settings.timerDuration * 60 * 1000);
        localStorage.setItem(evergreenKey, endTime);
      }
    }

    if (!endTime || isNaN(endTime)) {
        bar.style.display = 'none';
        return;
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

  // Main fetch logic
  const proxyBase = '/apps/countdown';
  fetch(`${proxyBase}/settings?shop=${encodeURIComponent(shop)}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!data.success || !data.settings) {
        console.warn('Bar: No active bar found.');
        return bar.style.display = 'none';
      }

      const settings = data.settings;
      const sessionKey = getSessionKey(settings.barMessage);

      if (sessionStorage.getItem(sessionKey) === 'true') {
        return bar.style.display = 'none';
      }

      applyCommonStyles(settings);

      if (settings.type === 'countdown') {
        handleCountdownBar(settings);
      } else {
        handleAnnouncementBar(settings);
      }

      const closeBtn = document.getElementById('close-bar');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          bar.style.display = 'none';
          sessionStorage.setItem(sessionKey, 'true');
          if (countdownInterval) clearInterval(countdownInterval);
        });
      }
    })
    .catch(error => {
      console.error('Bar fetch error:', error);
      bar.style.display = 'none';
    });
})();