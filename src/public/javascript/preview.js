/**
 * preview.js — JavaScript untuk halaman Preview Undangan
 */
(function () {
  'use strict';

  function initDeviceToggle() {
    const btnMobile  = document.getElementById('btn-mobile');
    const btnDesktop = document.getElementById('btn-desktop');
    const phoneMkp   = document.getElementById('phone-mockup');
    const deskMkp    = document.getElementById('desktop-mockup');

    if (!btnMobile || !btnDesktop) return;

    function setDevice(device) {
      const isMobile = device === 'mobile';
      btnMobile.classList.toggle('active', isMobile);
      btnDesktop.classList.toggle('active', !isMobile);

      if (phoneMkp) {
        phoneMkp.style.display = isMobile ? '' : 'none';
        if (isMobile) phoneMkp.style.animation = 'none',
          requestAnimationFrame(() => phoneMkp.style.animation = '');
      }
      if (deskMkp) {
        deskMkp.style.display = isMobile ? 'none' : '';
        if (!isMobile) deskMkp.style.animation = 'none',
          requestAnimationFrame(() => deskMkp.style.animation = '');
      }
    }

    btnMobile.addEventListener('click',  () => setDevice('mobile'));
    btnDesktop.addEventListener('click', () => setDevice('desktop'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDeviceToggle();
  });
})();
