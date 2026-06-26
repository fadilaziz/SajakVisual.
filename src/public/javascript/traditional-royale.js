document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || 'slug';

  try {
    // Fetch data from API
    const response = await fetch(`${BASE_URL_SAJAKVISUAL}/undangan/data-invitation?slug=${slug}`);
    const result = await response.json();
    console.log(result);

    if (result.success && result.data) {
      populateData(result.data);
    } else {
      console.error('Failed to load invitation data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  setupInteractions();
  setupScrollReveal();
});

function populateData(data) {
  // Basic Info
  const pria = data.mempelai_pria.nama_panggilan;
  const wanita = data.mempelai_wanita.nama_panggilan;

  document.getElementById('cover-names').innerHTML = `${pria}<br>&<br>${wanita}`;
  document.getElementById('hero-img').src = data.foto_cover;

  // Using location city (Yogyakarta) for the hero text
  const city = data.acara.akad.lokasi_alamat.split(',').pop().trim();
  document.getElementById('hero-location').textContent = city || 'Yogyakarta';

  // Parents
  document.getElementById('parents-text').innerHTML = `
        Son of ${data.mempelai_pria.ayah} & ${data.mempelai_pria.ibu}<br>
        and<br>
        Daughter of ${data.mempelai_wanita.ayah} & ${data.mempelai_wanita.ibu}
    `;

  // Event Details (Using Akad)
  document.getElementById('detail-date').textContent = data.acara.akad.tanggal;
  document.getElementById('detail-time').textContent = data.acara.akad.waktu;
  document.getElementById('detail-location').textContent = data.acara.akad.lokasi_nama;
  document.getElementById('detail-address').textContent = data.acara.akad.lokasi_alamat;
  document.getElementById('btn-maps').href = data.acara.akad.maps_url;

  // Gallery
  if (data.galeri_foto && data.galeri_foto.length > 0) {
    const galleryGrid = document.getElementById('gallery-grid');
    data.galeri_foto.forEach((foto) => {
      const img = document.createElement('img');
      img.src = foto;
      img.className = 'gallery-item section-reveal';
      galleryGrid.appendChild(img);
    });
  }

  // Monogram
  document.getElementById('monogram').textContent = `${pria.charAt(0)} & ${wanita.charAt(0)}`;

  // Audio
  if (data.bg_music) {
    document.getElementById('bg-audio').src = data.bg_music;
  }

  // Countdown Timer
  if (data.acara.countdown_target) {
    startCountdown(data.acara.countdown_target);
  }
}

function startCountdown(targetDateString) {
  const countDownDate = new Date(targetDateString).getTime();

  const timerInterval = setInterval(function () {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) {
      clearInterval(timerInterval);
      document.getElementById('cd-days').innerText = '00';
      document.getElementById('cd-hours').innerText = '00';
      document.getElementById('cd-minutes').innerText = '00';
      document.getElementById('cd-seconds').innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    // const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('cd-days').innerText = days.toString().padStart(2, '0');
    document.getElementById('cd-hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('cd-minutes').innerText = minutes.toString().padStart(2, '0');
    // document.getElementById('cd-seconds').innerText = seconds.toString().padStart(2, '0');
  }, 1000);
}

function setupInteractions() {
  const btnOpen = document.getElementById('btn-open-invitation');
  const overlay = document.getElementById('cover-overlay');
  const mainContent = document.getElementById('main-content');
  const audio = document.getElementById('bg-audio');
  const musicControl = document.getElementById('music-control');
  const musicIcon = musicControl.querySelector('i');

  let isPlaying = false;

  btnOpen.addEventListener('click', () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.visibility = 'hidden';
      overlay.style.display = 'none';
      mainContent.style.display = 'block';

      // Fade in main content
      setTimeout(() => {
        mainContent.style.opacity = '1';
        // Trigger reveal for first section
        triggerReveal();
      }, 50);
    }, 1000);

    // Play Music
    audio
      .play()
      .then(() => {
        isPlaying = true;
        musicControl.style.display = 'flex';
        musicIcon.classList.replace('ph-play', 'ph-pause');
      })
      .catch((err) => console.log('Audio autoplay prevented by browser'));
  });

  musicControl.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      musicIcon.classList.replace('ph-pause', 'ph-play');
    } else {
      audio.play();
      musicIcon.classList.replace('ph-play', 'ph-pause');
    }
    isPlaying = !isPlaying;
  });
}

function setupScrollReveal() {
  window.addEventListener('scroll', triggerReveal);
  // Initial check
  triggerReveal();
}

function triggerReveal() {
  const reveals = document.querySelectorAll('.section-reveal');
  const windowHeight = window.innerHeight;
  const elementVisible = 100;

  reveals.forEach((reveal) => {
    const elementTop = reveal.getBoundingClientRect().top;
    if (elementTop < windowHeight - elementVisible) {
      reveal.classList.add('active');
    }
  });
}
