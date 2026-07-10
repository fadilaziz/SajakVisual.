/**
 * kirim.js — JavaScript untuk halaman Kirim Undangan
 * Berdiri sendiri, tidak bergantung pada file JS lain selain main-website.js
 */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  let recipientIndex = 0;
  const manualRecipients = [];
  let excelRecipients = [];

  // ── Mode Switch (Manual / Excel) ───────────────────────────────────────────
  window.switchMode = function (mode) {
    document.querySelectorAll('.kirim-tab').forEach(btn => {
      btn.classList.toggle('active', btn.id === 'tab-' + mode);
    });
    const pManual = document.getElementById('panel-manual');
    const pExcel  = document.getElementById('panel-excel');
    if (pManual) pManual.style.display = mode === 'manual' ? '' : 'none';
    if (pExcel)  pExcel.style.display  = mode === 'excel'  ? '' : 'none';

    // re-trigger animation
    const active = document.getElementById('panel-' + mode);
    if (active) {
      active.style.animation = 'none';
      requestAnimationFrame(() => { active.style.animation = ''; });
    }
  };

  // ── Manual Recipients ──────────────────────────────────────────────────────
  function addRow(data = {}) {
    const id   = recipientIndex++;
    const list = document.getElementById('recipient-list');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'recipient-row';
    row.id = 'row-' + id;
    row.innerHTML = `
      <input type="text"  placeholder="Nama penerima"    value="${esc(data.nama  || '')}" autocomplete="off" />
      <input type="tel"   placeholder="08xxxxxxxxxx"     value="${esc(data.phone || '')}" autocomplete="off" />
      <input type="email" placeholder="email@contoh.com" value="${esc(data.email || '')}" autocomplete="off" />
      <div class="row-actions">
        <button type="button" class="btn-row-send" onclick="sendSingleRow(${id})" aria-label="Kirim">
          <i class="ph ph-paper-plane-tilt"></i>
          <span>Kirim</span>
        </button>
        <button type="button" class="btn-row-delete" onclick="removeRow(${id})" aria-label="Hapus">
          <i class="ph ph-trash"></i>
        </button>
      </div>
    `;

    const inputs = row.querySelectorAll('input');
    inputs.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        const rec = manualRecipients.find(r => r.id === id);
        if (!rec) return;
        if (i === 0) rec.nama  = inp.value.trim();
        if (i === 1) rec.phone = inp.value.trim();
        if (i === 2) rec.email = inp.value.trim();
      });
    });

    list.appendChild(row);
    manualRecipients.push({ id, nama: data.nama || '', email: data.email || '', phone: data.phone || '' });

    if (!data.nama) setTimeout(() => row.querySelector('input')?.focus(), 40);
  }

  window.removeRow = function (id) {
    const row = document.getElementById('row-' + id);
    if (!row) return;
    row.style.cssText += ';opacity:0;transform:translateX(8px);transition:opacity 0.15s,transform 0.15s;';
    setTimeout(() => {
      row.remove();
      const idx = manualRecipients.findIndex(r => r.id === id);
      if (idx !== -1) manualRecipients.splice(idx, 1);
    }, 150);
  };

  // Kirim data baris manual tunggal
  window.sendSingleRow = function (id) {
    const rec = manualRecipients.find(r => r.id === id);
    if (!rec || !rec.nama || !rec.email) {
      toast('Nama dan Email harus diisi untuk mengirim undangan.');
      return;
    }
    console.log('[Kirim Single Row]', rec);
    toast(`Mengirim undangan ke ${rec.nama} (${rec.email})…`);
    // TODO: fetch('/api/send-single', { method: 'POST', body: JSON.stringify(rec) });
  };

  // ── Excel / CSV Upload ─────────────────────────────────────────────────────
  function initExcel() {
    const dropZone  = document.getElementById('excel-drop-zone');
    const fileInput = document.getElementById('excel-file-input');
    const btnRemove = document.getElementById('btn-remove-excel');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    });

    if (btnRemove) btnRemove.addEventListener('click', resetExcel);
  }

  function resetExcel() {
    excelRecipients = [];
    const fi = document.getElementById('excel-file-input');
    const pv = document.getElementById('excel-preview');
    const dz = document.getElementById('excel-drop-zone');
    if (fi) fi.value = '';
    if (pv) pv.style.display = 'none';
    if (dz) dz.style.display = '';
    const etw = document.getElementById('excel-template-wrapper');
    if (etw) etw.style.display = '';
    ['excel-recipient-list','excel-row-count','excel-file-name'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }

  function handleFile(file) {
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      toast('Format tidak didukung. Gunakan .xlsx, .xls, atau .csv');
      return;
    }
    const fn = document.getElementById('excel-file-name');
    if (fn) fn.textContent = file.name;

    const invoice = window.INITIAL_DATA?.invoice_order;
    if (!invoice) {
      toast('Invoice ID tidak ditemukan.');
      return;
    }

    toast('Mengunggah dan membaca file excel...');

    const formData = new FormData();
    formData.append('file', file);

    fetch(`/form/${invoice}/excel`, {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          // Petakan data dari backend ke field nama, email, phone
          excelRecipients = resData.data.map(row => {
            let nama = '';
            let email = '';
            let phone = '';
            for (let key in row) {
              const k = key.toLowerCase().trim();
              if (k.includes('nama') || k.includes('name')) {
                nama = String(row[key] || '').trim();
              } else if (k.includes('email')) {
                email = String(row[key] || '').trim();
              } else if (
                k.includes('hp') ||
                k.includes('phone') ||
                k.includes('wa') ||
                k.includes('telp') ||
                k.includes('nomor') ||
                k.includes('no')
              ) {
                phone = String(row[key] || '').trim();
              }
            }
            return {
              nama,
              email,
              phone,
              invitation_id: row.invitation_id
            };
          }).filter(r => r.nama || r.email);

          renderExcel();
          toast('File excel berhasil diimpor.');
        } else {
          toast(resData.message || 'Gagal memproses file excel.');
        }
      })
      .catch(err => {
        console.error('Error uploading file:', err);
        toast('Terjadi kesalahan saat mengunggah file.');
      });
  }

  function renderExcel() {
    const list = document.getElementById('excel-recipient-list');
    const prev = document.getElementById('excel-preview');
    const dz   = document.getElementById('excel-drop-zone');
    const cnt  = document.getElementById('excel-row-count');
    if (!list) return;

    list.innerHTML = '';
    excelRecipients.forEach((rec, i) => {
      const row = document.createElement('div');
      row.className = 'recipient-row';
      row.innerHTML = `
        <input type="text"  value="${esc(rec.nama)}"  placeholder="Nama penerima"    oninput="excelRecipients[${i}].nama=this.value" />
        <input type="tel"   value="${esc(rec.phone)}" placeholder="08xxxxxxxxxx"     oninput="excelRecipients[${i}].phone=this.value" />
        <input type="email" value="${esc(rec.email)}" placeholder="email@contoh.com" oninput="excelRecipients[${i}].email=this.value" />
        <div class="row-actions">
          <button type="button" class="btn-row-send" onclick="sendSingleExcel(${i})" aria-label="Kirim">
            <i class="ph ph-paper-plane-tilt"></i>
            <span>Kirim</span>
          </button>
          <button type="button" class="btn-row-delete" onclick="removeExcelRow(${i})" aria-label="Hapus">
            <i class="ph ph-trash"></i>
          </button>
        </div>
      `;
      list.appendChild(row);
    });

    if (cnt)  cnt.textContent = `${excelRecipients.length} penerima ditemukan`;
    if (prev) prev.style.display = '';
    if (dz)   dz.style.display   = 'none';
    const etw = document.getElementById('excel-template-wrapper');
    if (etw) etw.style.display = 'none';
  }

  window.removeExcelRow = function (idx) {
    excelRecipients.splice(idx, 1);
    renderExcel();
  };

  window.excelRecipients = excelRecipients;

  // Kirim data baris Excel tunggal
  window.sendSingleExcel = function (idx) {
    const rec = excelRecipients[idx];
    if (!rec || !rec.nama || !rec.email) {
      toast('Nama dan Email harus diisi untuk mengirim undangan.');
      return;
    }
    console.log('[Kirim Single Excel Row]', rec);
    toast(`Mengirim undangan ke ${rec.nama} (${rec.email})…`);
    // TODO: fetch('/api/send-single', { method: 'POST', body: JSON.stringify(rec) });
  };

  // Unduh templat data CSV
  window.downloadTemplate = function (e) {
    e.preventDefault();
    const csvContent = "data:text/csv;charset=utf-8,Nama,No WA,Email\nRomeo Montague,081234567890,romeo@gmail.com\nJuliet Capulet,089876543210,juliet@gmail.com";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "templat_penerima_undangan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Toast ──────────────────────────────────────────────────────────────────
  function toast(msg) {
    const el = document.getElementById('toast-notification');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
  }

  // ── Helper ─────────────────────────────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
      .replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const btnAdd = document.getElementById('btn-add-recipient');
    if (btnAdd) btnAdd.addEventListener('click', () => addRow());
    addRow(); // 1 baris default

    initExcel();
  });

})();
