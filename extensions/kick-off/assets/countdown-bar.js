(function() {
  'use strict';

  const bar = document.getElementById('countdown-cta-bar');
  if (!bar) return;

  const shop = bar.getAttribute('data-shop');

  // Creates a unique session key for each bar to avoid conflicts.
  function getSessionKey(barMessage) {
    return `barClosed_${barMessage.replace(/\s+/g, '_').slice(0, 30)}`;
  }

  const proxyBase = '/apps/countdown';
  fetch(`${proxyBase}/settings?shop=${encodeURIComponent(shop)}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!data.success || !data.settings) {
        console.warn('Announcement bar: No active bar found.');
        bar.style.display = 'none';
        return;
      }

      const settings = data.settings;
      const sessionKey = getSessionKey(settings.barMessage);

      if (sessionStorage.getItem(sessionKey) === 'true') {
        bar.style.display = 'none';
        return;
      }

      // Apply settings to the bar
      bar.style.backgroundColor = settings.barColor || '#288d40';
      const pos = settings.barPosition || 'top';
      bar.className = `countdown-bar countdown-bar--${pos}`;

      // Update message
      const messageEl = bar.querySelector('.countdown-bar__message');
      if (messageEl) {
        messageEl.textContent = settings.barMessage;
      }

      // Update button
      const buttonEl = document.getElementById('cta-button');
      if (buttonEl) {
        if (settings.buttonText && settings.buttonLink) {
            buttonEl.textContent = settings.buttonText;
            buttonEl.href = settings.buttonLink;
            buttonEl.style.display = 'block';
        } else {
            buttonEl.style.display = 'none';
        }
      }

      // Attach close functionality
      const closeBtn = document.getElementById('close-bar');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          bar.style.display = 'none';
          sessionStorage.setItem(sessionKey, 'true');
        });
      }

      // Finally, show the bar
      bar.style.display = 'flex'; // Use flex to align items
    })
    .catch(error => {
      console.error('Announcement bar fetch error:', error);
      bar.style.display = 'none';
    });
})();