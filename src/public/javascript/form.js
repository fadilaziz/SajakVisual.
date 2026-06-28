document.addEventListener('DOMContentLoaded', () => {
  // --- Dynamic Events ---
  const eventsContainer = document.getElementById('events-container');
  const btnAddEvent = document.getElementById('btn-add-event');
  let eventIndex = 0;

  const createEventItem = () => {
    const idx = eventIndex++;
    const html = `
      <div class="dynamic-item" id="event-${idx}">
        <button type="button" class="btn-remove-item" onclick="removeEvent(${idx})" aria-label="Hapus Acara">
          <i class="ph ph-trash"></i>
        </button>
        <h3 class="item-title">Acara ${idx + 1}</h3>
        
        <div class="grid-2">
          <div class="input-group">
            <label for="event_tipe_${idx}">Tipe Acara</label>
            <div class="input-wrapper">
              <i class="ph ph-tag input-icon"></i>
              <input type="text" id="event_tipe_${idx}" name="wedding_events[${idx}][tipe_acara]" class="form-input" placeholder="contoh: Akad Nikah / Resepsi" required />
            </div>
          </div>
          
          <div class="input-group">
            <label for="event_tanggal_${idx}">Tanggal</label>
            <div class="input-wrapper">
              <i class="ph ph-calendar input-icon"></i>
              <input type="text" id="event_tanggal_${idx}" name="wedding_events[${idx}][tanggal]" class="form-input" placeholder="contoh: 25 Desember 2026" required />
            </div>
          </div>
        </div>

        <div class="grid-2" style="margin-top: 16px;">
          <div class="input-group">
            <label for="event_waktu_${idx}">Waktu</label>
            <div class="input-wrapper">
              <i class="ph ph-clock input-icon"></i>
              <input type="text" id="event_waktu_${idx}" name="wedding_events[${idx}][waktu]" class="form-input" placeholder="contoh: 08:00 - 10:00 WIB" required />
            </div>
          </div>
          
          <div class="input-group">
            <label for="event_lokasinama_${idx}">Nama Lokasi</label>
            <div class="input-wrapper">
              <i class="ph ph-buildings input-icon"></i>
              <input type="text" id="event_lokasinama_${idx}" name="wedding_events[${idx}][lokasi_nama]" class="form-input" placeholder="contoh: Masjid Agung / Gedung X" required />
            </div>
          </div>
        </div>

        <div class="input-group" style="margin-top: 16px;">
          <label for="event_lokasialamat_${idx}">Alamat Lengkap</label>
          <div class="input-wrapper">
            <i class="ph ph-map-pin input-icon"></i>
            <input type="text" id="event_lokasialamat_${idx}" name="wedding_events[${idx}][lokasi_alamat]" class="form-input" placeholder="contoh: Jl. Raya Lintas..." required />
          </div>
        </div>

        <div class="input-group" style="margin-top: 16px;">
          <label for="event_mapsurl_${idx}">Link Google Maps</label>
          <div class="input-wrapper">
            <i class="ph ph-link input-icon"></i>
            <input type="url" id="event_mapsurl_${idx}" name="wedding_events[${idx}][maps_url]" class="form-input" placeholder="https://goo.gl/maps/..." required />
          </div>
        </div>
      </div>
    `;
    eventsContainer.insertAdjacentHTML('beforeend', html);
  };

  window.removeEvent = (idx) => {
    const item = document.getElementById(`event-${idx}`);
    if (item) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
      setTimeout(() => item.remove(), 200);
    }
  };

  btnAddEvent.addEventListener('click', createEventItem);
  
  // Add 1 default event
  createEventItem();


  // --- Dynamic Gallery ---
  const galleryContainer = document.getElementById('gallery-container');
  const btnAddGallery = document.getElementById('btn-add-gallery');
  let galleryIndex = 0;

  const createGalleryItem = () => {
    const idx = galleryIndex++;
    const html = `
      <div class="dynamic-item" id="gallery-${idx}">
        <button type="button" class="btn-remove-item" onclick="removeGallery(${idx})" aria-label="Hapus Foto">
          <i class="ph ph-trash"></i>
        </button>
        <h3 class="item-title">Foto ${idx + 1}</h3>
        
        <div class="input-group">
          <label>Unggah Foto</label>
          <div class="input-wrapper">
            <i class="ph ph-image input-icon" style="z-index: 1;"></i>
            <input type="file" id="gallery_file_${idx}" name="wedding_galleries[${idx}][foto_file]" accept="image/*" class="form-file-hidden" required />
            <label for="gallery_file_${idx}" class="form-input file-upload-label">
              <span class="file-btn">Pilih Gambar</span>
              <span class="file-name">Belum ada gambar</span>
            </label>
          </div>
        </div>
      </div>
    `;
    galleryContainer.insertAdjacentHTML('beforeend', html);
  };

  window.removeGallery = (idx) => {
    const item = document.getElementById(`gallery-${idx}`);
    if (item) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
      setTimeout(() => item.remove(), 200);
    }
  };

  btnAddGallery.addEventListener('click', createGalleryItem);

  // Add 1 default gallery
  createGalleryItem();

  // --- Custom File Input Change Listener ---
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('form-file-hidden')) {
      const label = e.target.nextElementSibling;
      if (label && label.classList.contains('file-upload-label')) {
        const fileNameSpan = label.querySelector('.file-name');
        if (fileNameSpan) {
          if (e.target.files.length > 0) {
            fileNameSpan.textContent = e.target.files[0].name;
            fileNameSpan.style.color = 'var(--form-text)';
          } else {
            fileNameSpan.textContent = 'Belum ada gambar';
            fileNameSpan.style.color = 'var(--form-text-muted)';
          }
        }
      }
    }
  });

  // --- Form Submission ---
  const form = document.getElementById('invitation-form');
  const btnSubmit = document.getElementById('btn-submit-form');
  const toast = document.getElementById('toast-notification');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI Loading state
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Menyimpan...';
    btnSubmit.disabled = true;

    try {
      const formData = new FormData(form);
      const payload = {
        template_id: 0, // Set defaults or parse from URL if needed
        status: "published",
        wedding_events: [],
        wedding_galleries: []
      };

      const eventMap = {};
      const galleryMap = {};

      for (let [key, value] of formData.entries()) {
        if (key.startsWith('wedding_events')) {
          // Parse: wedding_events[0][tipe_acara]
          const match = key.match(/wedding_events\[(\d+)\]\[(.+)\]/);
          if (match) {
            const idx = match[1];
            const prop = match[2];
            if (!eventMap[idx]) eventMap[idx] = {};
            eventMap[idx][prop] = value;
          }
        } else if (key.startsWith('wedding_galleries')) {
          // Parse: wedding_galleries[0][foto_url]
          const match = key.match(/wedding_galleries\[(\d+)\]\[(.+)\]/);
          if (match) {
            const idx = match[1];
            const prop = match[2];
            if (!galleryMap[idx]) galleryMap[idx] = {};
            galleryMap[idx][prop] = value;
          }
        } else {
          // General properties
          payload[key] = value;
        }
      }

      // Convert map to array
      payload.wedding_events = Object.values(eventMap);
      payload.wedding_galleries = Object.values(galleryMap);

      // Append date created_at to payload
      payload.created_at = new Date().toISOString();

      // Ensure target date format is compatible (ISO)
      if (payload.countdown_target) {
        payload.countdown_target = new Date(payload.countdown_target).toISOString();
      }

      console.log('Payload siap dikirim:', payload);

      // Simulate API Call for now since backend is not fully connected to this DB schema yet
      const response = await fetch('/api/form/edit', {
        method: 'POST',
        body: formData // Send as multipart/form-data for file uploads
      });

      // Show toast on success
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);

    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      // Restore UI
      btnSubmit.innerHTML = originalBtnText;
      btnSubmit.disabled = false;
    }
  });

});

// Add spin animation dynamically if it doesn't exist
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
