document.addEventListener('DOMContentLoaded', () => {
  // Dynamic Events have been replaced with static Akad and Resepsi toggles in HTML

  // --- Dynamic Gallery ---
  const galleryContainer = document.getElementById('gallery-container');
  const btnAddGallery = document.getElementById('btn-add-gallery');
  let galleryIndex = 0;
  let galleryCount = 0;
  const MAX_GALLERY = 4;

  const createGalleryItem = () => {
    if (galleryCount >= MAX_GALLERY) {
      alert(`Maksimal ${MAX_GALLERY} foto yang diizinkan dalam galeri.`);
      return;
    }

    const idx = galleryIndex++;
    galleryCount++;

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

    if (galleryCount >= MAX_GALLERY) {
      btnAddGallery.style.display = 'none';
    }
  };

  window.removeGallery = (idx) => {
    const item = document.getElementById(`gallery-${idx}`);
    if (item) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        item.remove();
        galleryCount--;
        if (galleryCount < MAX_GALLERY) {
          btnAddGallery.style.display = 'inline-flex';
        }
      }, 200);
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
    btnSubmit.innerHTML =
      '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Menyimpan...';
    btnSubmit.disabled = true;

    try {
      const formData = new FormData(form);
      const payload = {
        template_id: 0, // Set defaults or parse from URL if needed
        status: 'published',
        wedding_events: [],
        wedding_galleries: [],
      };

      const eventMap = {};
      const galleryMap = {};

      for (let [key, value] of formData.entries()) {
        // Abaikan file dari object payload teks
        if (value instanceof File) continue;

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

      // Append identifier so the backend knows which data to update
      if (window.INITIAL_DATA) {
        if (window.INITIAL_DATA.invoice_order) {
          payload.invoice_order = window.INITIAL_DATA.invoice_order;
        }
        if (window.INITIAL_DATA.id) {
          payload.id = window.INITIAL_DATA.id;
        }
        if (window.INITIAL_DATA.template_id !== undefined) {
          payload.template_id = window.INITIAL_DATA.template_id;
        }
      }

      // C. Kumpulkan URL galeri lama dari layar
      const galleryInputs = document.querySelectorAll('input[type="file"][id^="gallery_file_"]');
      const galeriLama = [];

      galleryInputs.forEach((input) => {
        if (!input.files || input.files.length === 0) {
          const label = input.nextElementSibling;
          if (label) {
            const fileNameSpan = label.querySelector('.file-name');
            if (
              fileNameSpan &&
              fileNameSpan.textContent !== 'Belum ada gambar' &&
              fileNameSpan.textContent.trim() !== ''
            ) {
              galeriLama.push(fileNameSpan.textContent.trim());
            }
          }
        }
      });

      // Tambahkan galeri lama ke object teks
      payload.galeri_lama = galeriLama;

      console.log('Payload teks siap dikirim:', payload);

      // 2. Bungkus ke dalam FormData baru
      const finalFormData = new FormData();

      // A. Masukkan data teks (kita ubah jadi 1 string)
      finalFormData.append('data_undangan', JSON.stringify(payload));

      // B. Masukkan File Foto Cover
      const inputCover = document.getElementById('foto_cover');
      if (inputCover && inputCover.files[0]) {
        finalFormData.append('foto_cover', inputCover.files[0]);
      }

      // C. Masukkan File Galeri (foto baru yang diunggah)
      galleryInputs.forEach((input) => {
        if (input.files && input.files.length > 0) {
          finalFormData.append('foto_galeri', input.files[0]);
        }
      });

      // API Call to backend
      const response = await fetch('/api/edit', {
        method: 'POST',
        body: finalFormData,
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Gagal menyimpan data undangan.');
      }

      // Tampilkan Modal Success
      const modal = document.getElementById('success-modal');
      const linkText = document.getElementById('modal-link-text');
      const btnCopy = document.getElementById('btn-copy-link');
      const btnClose = document.getElementById('btn-close-modal');

      const invitationUrl = `${window.location.origin}/invitation/${result.data}`;
      linkText.textContent = invitationUrl;

      modal.classList.add('active');

      // Fungsi copy link
      btnCopy.onclick = async () => {
        try {
          await navigator.clipboard.writeText(invitationUrl);
          const icon = btnCopy.querySelector('i');
          icon.classList.replace('ph-copy', 'ph-check');
          icon.style.color = 'var(--success)';
          setTimeout(() => {
            icon.classList.replace('ph-check', 'ph-copy');
            icon.style.color = '';
          }, 2000);
        } catch (err) {
          console.error('Gagal menyalin tautan', err);
          alert('Gagal menyalin tautan');
        }
      };

      // Tutup modal
      const closeModal = () => {
        modal.classList.remove('active');
      };

      // Salin & Tutup modal
      btnClose.onclick = async () => {
        try {
          await navigator.clipboard.writeText(invitationUrl);
        } catch (err) {
          console.error('Gagal menyalin tautan', err);
        } finally {
          closeModal();
        }
      };

      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
    } catch (error) {
      console.error('Error saat menyimpan form:', error);
      alert('Terjadi kesalahan saat menyimpan data: ' + error.message);
    } finally {
      // Restore UI
      btnSubmit.innerHTML = originalBtnText;
      btnSubmit.disabled = false;
    }
  });

  // --- Populate Initial Data ---
  if (window.INITIAL_DATA && Object.keys(window.INITIAL_DATA).length > 0) {
    const data = window.INITIAL_DATA;

    // 1. Pengaturan Utama
    if (data.countdown_target) {
      const d = new Date(data.countdown_target);
      // Adjust to local timezone for datetime-local
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      document.getElementById('countdown_target').value = d.toISOString().slice(0, 16);
    }

    if (data.foto_cover) {
      const coverLabel = document.querySelector('label[for="foto_cover"] .file-name');
      if (coverLabel) {
        coverLabel.textContent = data.foto_cover;
        coverLabel.style.color = 'var(--form-text)';
      }
      document.getElementById('foto_cover').required = false;
    }

    // 2. Mempelai Pria
    if (data.pria_nama_lengkap)
      document.getElementById('pria_nama_lengkap').value = data.pria_nama_lengkap;
    if (data.pria_nama_panggilan)
      document.getElementById('pria_nama_panggilan').value = data.pria_nama_panggilan;
    if (data.pria_ayah) document.getElementById('pria_ayah').value = data.pria_ayah;
    if (data.pria_ibu) document.getElementById('pria_ibu').value = data.pria_ibu;

    // 3. Mempelai Wanita
    if (data.wanita_nama_lengkap)
      document.getElementById('wanita_nama_lengkap').value = data.wanita_nama_lengkap;
    if (data.wanita_nama_panggilan)
      document.getElementById('wanita_nama_panggilan').value = data.wanita_nama_panggilan;
    if (data.wanita_ayah) document.getElementById('wanita_ayah').value = data.wanita_ayah;
    if (data.wanita_ibu) document.getElementById('wanita_ibu').value = data.wanita_ibu;

    // 4. Events
    if (data.wedding_events && data.wedding_events.length > 0) {
      // By default HTML has both checked, so we uncheck them first if we have data to process
      document.getElementById('enable_akad').checked = false;
      if (typeof toggleEventInputs === 'function') toggleEventInputs('akad', false);

      document.getElementById('enable_resepsi').checked = false;
      if (typeof toggleEventInputs === 'function') toggleEventInputs('resepsi', false);

      data.wedding_events.forEach((event) => {
        let prefix = '';
        const tipe = event.tipe_acara.toLowerCase();

        if (tipe.includes('akad')) {
          prefix = '0';
          document.getElementById('enable_akad').checked = true;
          if (typeof toggleEventInputs === 'function') toggleEventInputs('akad', true);
        } else if (tipe.includes('resepsi')) {
          prefix = '1';
          document.getElementById('enable_resepsi').checked = true;
          if (typeof toggleEventInputs === 'function') toggleEventInputs('resepsi', true);
        }

        if (prefix) {
          const tgl = document.querySelector(`input[name="wedding_events[${prefix}][tanggal]"]`);
          if (tgl) tgl.value = event.tanggal || '';

          const wkt = document.querySelector(`input[name="wedding_events[${prefix}][waktu]"]`);
          if (wkt) wkt.value = event.waktu || '';

          const lNama = document.querySelector(
            `input[name="wedding_events[${prefix}][lokasi_nama]"]`
          );
          if (lNama) lNama.value = event.lokasi_nama || '';

          const lAlmt = document.querySelector(
            `input[name="wedding_events[${prefix}][lokasi_alamat]"]`
          );
          if (lAlmt) lAlmt.value = event.lokasi_alamat || '';

          const map = document.querySelector(`input[name="wedding_events[${prefix}][maps_url]"]`);
          if (map) map.value = event.maps_url || '';
        }
      });
    }

    // 5. Gallery
    if (data.wedding_galleries && data.wedding_galleries.length > 0) {
      // Clear the default gallery item added by createGalleryItem() above
      galleryContainer.innerHTML = '';
      galleryCount = 0;
      galleryIndex = 0;

      data.wedding_galleries.forEach((gallery) => {
        if (galleryCount < MAX_GALLERY) {
          createGalleryItem();
          const idx = galleryIndex - 1;
          const label = document.querySelector(`label[for="gallery_file_${idx}"] .file-name`);
          if (label) {
            label.textContent = gallery.foto_url;
            label.style.color = 'var(--form-text)';
          }
          const input = document.getElementById(`gallery_file_${idx}`);
          if (input) {
            input.required = false;
          }
        }
      });
    }
  }
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
