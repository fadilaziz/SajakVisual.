document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || 'rustic-elegant';

  try {
    // Fetch data from API
    const response = await fetch(`${BASE_URL_SAJAKVISUAL}/undangan/data-invitation?slug=${slug}`);
    const result = await response.json();

    if (result.success && result.data) {
      populateData(result.data);
    } else {
      console.error('Failed to load invitation data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  setupInteractions();
});

function populateData(data) {
  const pria = data.mempelai_pria.nama_panggilan;
  const wanita = data.mempelai_wanita.nama_panggilan;
  const names = `${pria} & ${wanita}`;

  // Names
  document.getElementById('cover-names').textContent = names;
  document.getElementById('hero-names').textContent = names;
  document.getElementById('footer-names').textContent = names;

  // Cover & Hero
  document.getElementById('cover-date').textContent = data.acara.akad.tanggal;
  document.getElementById('hero-img').src = data.foto_cover;
  
  const heroDateDisplay = document.getElementById('hero-date-display');
  if (heroDateDisplay && data.acara.countdown_target) {
    const d = new Date(data.acara.countdown_target);
    if (!isNaN(d)) {
      heroDateDisplay.textContent = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    }
  }

  // Location
  document.getElementById('loc-name').textContent = data.acara.akad.lokasi_nama.split('(')[0].trim();
  document.getElementById('loc-address').textContent = data.acara.akad.lokasi_nama + ', ' + data.acara.akad.lokasi_alamat;
  
  // Timeline times & details
  if (data.acara && data.acara.akad) {
    const timeAkad = document.getElementById('time-akad');
    const dateAkad = document.getElementById('date-akad');
    const locAkad = document.getElementById('loc-akad');
    if (timeAkad) timeAkad.textContent = data.acara.akad.waktu;
    if (dateAkad) dateAkad.textContent = data.acara.akad.tanggal;
    if (locAkad) locAkad.textContent = data.acara.akad.lokasi_nama;
  }
  if (data.acara && data.acara.resepsi) {
    const timeResepsi = document.getElementById('time-resepsi');
    const dateResepsi = document.getElementById('date-resepsi');
    const locResepsi = document.getElementById('loc-resepsi');
    if (timeResepsi) timeResepsi.textContent = data.acara.resepsi.waktu;
    if (dateResepsi) dateResepsi.textContent = data.acara.resepsi.tanggal;
    if (locResepsi) locResepsi.textContent = data.acara.resepsi.lokasi_nama;
  }

  // Audio
  if (data.bg_music) {
    document.getElementById('bg-audio').src = data.bg_music;
  }

  // Countdown
  if (data.acara.countdown_target) {
    startCountdown(data.acara.countdown_target);
  }

  // Generate Calendar for July 2026
  generateCalendar(2026, 6, 12, data.acara.akad.tanggal, data.acara.akad.waktu.split('-')[0].trim());

  // Generate Gallery Journey
  if (data.galeri_foto && data.galeri_foto.length > 0) {
    generateGallery(data.galeri_foto);
  }
}

function startCountdown(targetDateString) {
  const countDownDate = new Date(targetDateString).getTime();

  const timerInterval = setInterval(function () {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) {
      clearInterval(timerInterval);
      ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'].forEach(id => {
        document.getElementById(id).innerText = '00';
      });
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('cd-days').innerText = days.toString().padStart(2, '0');
    document.getElementById('cd-hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('cd-minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('cd-seconds').innerText = seconds.toString().padStart(2, '0');
  }, 1000);
}

function generateCalendar(year, monthIndex, highlightDay, dateStr, timeStr) {
  const calGrid = document.querySelector('.cal-grid');
  // First day of month (0 = Sun, 1 = Mon, etc)
  const firstDay = new Date(year, monthIndex, 1).getDay(); 
  // Adjusted for Monday start (M S S R K J S) -> wait, standard is S S R K J S M? The HTML is M S S R K J S (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu)
  // Let's use simple numbers 1-31. July 2026 has 31 days. July 1, 2026 is a Wednesday.
  // In M S S R K J S grid: Wed is index 2.
  const daysInMonth = 31;
  let html = '';
  
  // Empty slots for Wed start (Mon=0, Tue=1)
  for(let i = 0; i < 2; i++) {
    html += `<div class="cal-day empty"></div>`;
  }
  
  for(let i = 1; i <= daysInMonth; i++) {
    const highlight = i === highlightDay ? 'highlight' : '';
    html += `<div class="cal-day ${highlight}">${i}</div>`;
  }
  
  // Append after headers
  const headers = `<div class="cal-head">M</div><div class="cal-head">S</div><div class="cal-head">S</div><div class="cal-head">R</div><div class="cal-head">K</div><div class="cal-head">J</div><div class="cal-head">S</div>`;
  calGrid.innerHTML = headers + html;
  
  // Footer text
  document.getElementById('cal-footer-text').textContent = `${highlightDay} Juli ${year} • Hari Pernikahan Kami • ${timeStr}`;
}

function generateGallery(photos) {
  const container = document.getElementById('gallery-grid');

  photos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-photo';
    item.setAttribute('data-aos', 'zoom-in');
    item.setAttribute('data-aos-delay', (index * 100).toString());
    
    item.innerHTML = `
      <img src="${photo}" alt="Memory ${index + 1}" />
    `;
    container.appendChild(item);
  });
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
      
      setTimeout(() => {
        mainContent.style.opacity = '1';
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      }, 50);
    }, 1000);

    audio.play().then(() => {
      isPlaying = true;
      musicControl.style.display = 'flex';
      musicIcon.classList.replace('ph-play', 'ph-pause');
    }).catch(err => console.log('Autoplay prevented'));
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
