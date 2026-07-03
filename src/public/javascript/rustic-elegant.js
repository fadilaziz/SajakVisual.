document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || 'rustic-elegant';

  // Nama penerima dari URL parameter
  const recipient = urlParams.get('to') || urlParams.get('name') || urlParams.get('nama');
  if (recipient) {
    const recEl = document.getElementById('recipient-name');
    const recWrapper = document.getElementById('cover-recipient');
    if (recEl) recEl.textContent = recipient;
    if (recWrapper) recWrapper.style.display = 'block';
  }

  try {
    if (window.BACKEND_DATA && Object.keys(window.BACKEND_DATA).length > 0) {
      populateData(window.BACKEND_DATA);
    } else {
      const response = await fetch(`/undangan/data-invitation?slug=${slug}`);
      const result = await response.json();
      if (result.success && result.data) {
        populateData(result.data);
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  setupInteractions();
});

// ── Isi seluruh data ke template ──────────────────────────────────────────────
function populateData(data) {
  const pria = data.mempelai_pria?.nama_panggilan || '';
  const wanita = data.mempelai_wanita?.nama_panggilan || '';
  const names = `${pria} & ${wanita}`;

  // Cover & Hero names
  setText('cover-names', names);
  setText('hero-names', names);
  setText('footer-names', names);

  // Cover date
  setText('cover-date', data.acara?.akad?.tanggal || '');

  // Hero photo & date
  const heroImg = document.getElementById('hero-img');
  if (heroImg && data.foto_cover) heroImg.src = data.foto_cover;

  const heroDate = document.getElementById('hero-date-display');
  if (heroDate && data.acara?.countdown_target) {
    const d = new Date(data.acara.countdown_target);
    if (!isNaN(d)) {
      heroDate.textContent = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  // ── Mempelai ────────────────────────────────────────────────────────────────
  setText('nickname-pria', pria);
  setText('fullname-pria', data.mempelai_pria?.nama_lengkap || '');
  setText('parents-pria',
    `Bapak ${data.mempelai_pria?.nama_ayah || '...'} & Ibu ${data.mempelai_pria?.nama_ibu || '...'}`
  );
  const fotoPria = document.getElementById('photo-pria');
  if (fotoPria && data.mempelai_pria?.foto) fotoPria.src = data.mempelai_pria.foto;

  setText('nickname-wanita', wanita);
  setText('fullname-wanita', data.mempelai_wanita?.nama_lengkap || '');
  setText('parents-wanita',
    `Bapak ${data.mempelai_wanita?.nama_ayah || '...'} & Ibu ${data.mempelai_wanita?.nama_ibu || '...'}`
  );
  const fotoWanita = document.getElementById('photo-wanita');
  if (fotoWanita && data.mempelai_wanita?.foto) fotoWanita.src = data.mempelai_wanita.foto;

  // ── Acara (Timeline) ────────────────────────────────────────────────────────
  if (data.acara?.akad) {
    setText('time-akad', data.acara.akad.waktu || '');
    setText('date-akad', data.acara.akad.tanggal || '');
    setText('loc-akad', data.acara.akad.lokasi_nama || '');
  }
  if (data.acara?.resepsi) {
    setText('time-resepsi', data.acara.resepsi.waktu || '');
    setText('date-resepsi', data.acara.resepsi.tanggal || '');
    setText('loc-resepsi', data.acara.resepsi.lokasi_nama || '');
  }

  // ── Lokasi ──────────────────────────────────────────────────────────────────
  if (data.acara?.akad) {
    const locRaw = data.acara.akad.lokasi_nama || '';
    setText('loc-name', locRaw.split('(')[0].trim());
    setText('loc-address', locRaw + (data.acara.akad.lokasi_alamat ? ', ' + data.acara.akad.lokasi_alamat : ''));
    const btnMaps = document.getElementById('btn-maps');
    if (btnMaps && data.acara.akad.maps_url) btnMaps.href = data.acara.akad.maps_url;
  }

  // ── Audio ───────────────────────────────────────────────────────────────────
  if (data.bg_music) {
    document.getElementById('bg-audio').src = data.bg_music;
  }

  // ── Countdown ───────────────────────────────────────────────────────────────
  if (data.acara?.countdown_target) {
    startCountdown(data.acara.countdown_target);
    // Kalender dinamis berdasarkan tanggal akad
    const d = new Date(data.acara.countdown_target);
    if (!isNaN(d)) {
      generateCalendar(d.getFullYear(), d.getMonth(), d.getDate(), data.acara.akad.tanggal, data.acara.akad.waktu?.split('-')[0]?.trim() || '');
    }
  }

  // ── Galeri ──────────────────────────────────────────────────────────────────
  if (data.galeri_foto && data.galeri_foto.length > 0) {
    generateGallery(data.galeri_foto);
  }

  // ── Love Story ──────────────────────────────────────────────────────────────
  if (data.love_story && data.love_story.length > 0) {
    generateLoveStory(data.love_story);
  }

  // ── Hadiah / Rekening ───────────────────────────────────────────────────────
  if (data.rekening && data.rekening.length > 0) {
    generateGiftCards(data.rekening);
  }
}

// ── Helper setText ────────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Countdown ────────────────────────────────────────────────────────────────
function startCountdown(targetDateString) {
  const countDownDate = new Date(targetDateString).getTime();
  const timerInterval = setInterval(() => {
    const distance = countDownDate - Date.now();
    if (distance < 0) {
      clearInterval(timerInterval);
      ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'].forEach(id => setText(id, '00'));
      return;
    }
    setText('cd-days',    Math.floor(distance / 86400000).toString().padStart(2, '0'));
    setText('cd-hours',   Math.floor((distance % 86400000) / 3600000).toString().padStart(2, '0'));
    setText('cd-minutes', Math.floor((distance % 3600000) / 60000).toString().padStart(2, '0'));
    setText('cd-seconds', Math.floor((distance % 60000) / 1000).toString().padStart(2, '0'));
  }, 1000);
}

// ── Kalender ─────────────────────────────────────────────────────────────────
function generateCalendar(year, monthIndex, highlightDay, dateStr, timeStr) {
  const calGrid = document.querySelector('.cal-grid');
  if (!calGrid) return;

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  setText('cal-month-year', `${monthNames[monthIndex]}, ${year}`);

  const firstDay  = new Date(year, monthIndex, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // Adjust to Mon-start: Sun(0) → index 6
  const offset = (firstDay === 0) ? 6 : firstDay - 1;

  let html = '<div class="cal-head">M</div><div class="cal-head">S</div><div class="cal-head">S</div><div class="cal-head">R</div><div class="cal-head">K</div><div class="cal-head">J</div><div class="cal-head">S</div>';
  for (let i = 0; i < offset; i++) html += `<div class="cal-day empty"></div>`;
  for (let i = 1; i <= daysInMonth; i++) {
    html += `<div class="cal-day ${i === highlightDay ? 'highlight' : ''}">${i}</div>`;
  }
  calGrid.innerHTML = html;
  setText('cal-footer-text', `${highlightDay} ${monthNames[monthIndex]} ${year} • Hari Pernikahan Kami • ${timeStr}`);
}

// ── Galeri ───────────────────────────────────────────────────────────────────
function generateGallery(photos) {
  const container = document.getElementById('gallery-grid');
  if (!container) return;
  container.innerHTML = '';
  photos.forEach((photo, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-photo';
    item.setAttribute('data-aos', 'zoom-in');
    item.setAttribute('data-aos-delay', (i * 100).toString());
    item.innerHTML = `<img src="${photo}" alt="Memory ${i + 1}" />`;
    container.appendChild(item);
  });
}

// ── Love Story ───────────────────────────────────────────────────────────────
function generateLoveStory(stories) {
  const container = document.getElementById('love-story-container');
  if (!container) return;
  container.innerHTML = '';
  stories.forEach((item, i) => {
    if (i > 0) {
      const conn = document.createElement('div');
      conn.className = 'ls-connector';
      conn.innerHTML = '<i class="ph ph-heart-straight"></i>';
      container.appendChild(conn);
    }
    const el = document.createElement('div');
    el.className = 'ls-item';
    el.setAttribute('data-aos', 'fade-up');
    el.setAttribute('data-aos-delay', (i * 100 + 200).toString());
    el.innerHTML = `
      <span class="ls-year">${item.tahun || ''}</span>
      <div class="ls-content">
        <div class="ls-divider"></div>
        <h4>${item.judul || ''}</h4>
        <p>${item.cerita || ''}</p>
      </div>`;
    container.appendChild(el);
  });
}

// ── Hadiah / Rekening ────────────────────────────────────────────────────────
function generateGiftCards(rekenings) {
  const container = document.getElementById('gift-cards');
  if (!container) return;
  container.innerHTML = '';
  rekenings.forEach((rek, i) => {
    const card = document.createElement('div');
    card.className = 'gift-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (i * 100 + 200).toString());
    card.innerHTML = `
      <p class="gift-bank">${rek.bank || ''}</p>
      <p class="gift-name">${rek.nama || ''}</p>
      <div class="gift-norek-wrap">
        <span class="gift-norek" id="norek-${i}">${rek.nomor || ''}</span>
        <button class="btn-copy-rek" onclick="copyRek('norek-${i}')">
          <i class="ph ph-copy"></i> Salin
        </button>
      </div>`;
    container.appendChild(card);
  });
}

window.copyRek = function(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    showToast('Nomor rekening tersalin!');
  });
};

// ── RSVP & Komentar ──────────────────────────────────────────────────────────
function setupInteractions() {
  // Buka undangan
  const btnOpen    = document.getElementById('btn-open-invitation');
  const overlay    = document.getElementById('cover-overlay');
  const mainContent = document.getElementById('main-content');
  const audio      = document.getElementById('bg-audio');
  const musicControl = document.getElementById('music-control');
  const musicIcon  = musicControl?.querySelector('i');
  let isPlaying = false;

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.visibility = 'hidden';
        overlay.style.display = 'none';
        mainContent.style.display = 'block';
        void mainContent.offsetWidth;
        mainContent.style.opacity = '1';
        if (typeof AOS !== 'undefined') {
          AOS.init({ once: true, offset: 50, duration: 1200, easing: 'ease-out-cubic' });
        }
      }, 1000);

      audio?.play().then(() => {
        isPlaying = true;
        if (musicControl) musicControl.style.display = 'flex';
        musicIcon?.classList.replace('ph-play', 'ph-pause');
      }).catch(() => {});
    });
  }

  musicControl?.addEventListener('click', () => {
    if (isPlaying) { audio.pause(); musicIcon?.classList.replace('ph-pause', 'ph-play'); }
    else           { audio.play();  musicIcon?.classList.replace('ph-play', 'ph-pause'); }
    isPlaying = !isPlaying;
  });

  // RSVP form
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama  = document.getElementById('rsvp-name').value.trim();
      const hadir = document.querySelector('input[name="rsvp-hadir"]:checked')?.value;
      if (!nama) return;
      showToast(`Terima kasih, ${nama}! Konfirmasi Anda telah kami terima.`);
      rsvpForm.reset();
    });
  }

  // Komentar form
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama   = document.getElementById('comment-name').value.trim();
      const pesan  = document.getElementById('comment-message').value.trim();
      if (!nama || !pesan) return;
      addComment(nama, pesan);
      commentForm.reset();
    });
  }
}

function addComment(nama, pesan) {
  const list = document.getElementById('comment-list');
  if (!list) return;
  const item = document.createElement('div');
  item.className = 'comment-item';
  item.innerHTML = `
    <p class="comment-author">${escHtml(nama)}</p>
    <p class="comment-text">${escHtml(pesan)}</p>`;
  list.prepend(item);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showToast(msg) {
  let toast = document.getElementById('inv-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'inv-toast';
    toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:var(--primary-blue);color:#fff;padding:12px 24px;border-radius:30px;font-family:var(--font-body);font-size:0.85rem;z-index:9999;opacity:0;transition:opacity 0.3s ease;pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}
