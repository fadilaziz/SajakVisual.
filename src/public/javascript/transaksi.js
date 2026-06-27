document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cek-transaksi');
  const invoiceInput = document.getElementById('invoice-input');
  const btnSubmit = document.querySelector('.btn-submit-transaksi');
  const resultContainer = document.getElementById('transaction-result');
  const loadingOverlay = document.getElementById('loading-overlay');

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const invoice = invoiceInput.value.trim();
    if (!invoice) return;

    // Show loading
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = 'Mencari...';
    btnSubmit.disabled = true;
    if (loadingOverlay) loadingOverlay.classList.add('active');
    
    // Hide previous result if any
    resultContainer.classList.remove('show');
    resultContainer.classList.remove('active');

    try {
      const response = await fetch('/api/transection/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ no_invoice: invoice })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        
        // Populate UI
        document.getElementById('res-template-name').textContent = data.templates?.nama_template || 'Produk Custom';
        document.getElementById('res-category').textContent = data.templates?.kategori || '-';
        
        const templateImg = document.getElementById('res-template-image');
        if (data.templates?.sample_preview) {
          templateImg.src = `/img/template/${data.templates.sample_preview}.webp`;
          templateImg.style.display = 'block';
        } else {
          templateImg.style.display = 'none';
        }
        
        // Status Badge
        const badgeEl = document.getElementById('res-status');
        badgeEl.textContent = data.status;
        badgeEl.className = 'badge'; // reset
        if (data.status === 'SUCCESS') badgeEl.classList.add('badge-success');
        else if (data.status === 'EXPIRED') badgeEl.classList.add('badge-expired');
        else badgeEl.classList.add('badge-pending'); // default PENDING

        // Details
        document.getElementById('res-invoice').textContent = data.no_invoice;
        document.getElementById('res-date').textContent = formatDate(data.tanggal);
        document.getElementById('res-name').textContent = data.nama;
        document.getElementById('res-email').textContent = data.email;
        document.getElementById('res-wa').textContent = data.no_wa;
        document.getElementById('res-amount').textContent = formatRupiah(data.jumlah_total);

        // Actions
        const actionsContainer = document.getElementById('res-actions');
        actionsContainer.innerHTML = ''; // clear

        if (data.status === 'PENDING') {
          const btnPay = document.createElement('a');
          btnPay.href = `/payment?invoice=${data.no_invoice}`;
          btnPay.className = 'btn-primary-action';
          btnPay.innerHTML = '<i class="ph ph-wallet"></i> Lanjutkan Pembayaran';
          actionsContainer.appendChild(btnPay);
        } else if (data.status === 'SUCCESS') {
          const infoText = document.createElement('p');
          infoText.style.textAlign = 'center';
          infoText.style.fontSize = '0.9rem';
          infoText.style.color = 'var(--text-secondary)';
          infoText.innerHTML = 'Pembayaran berhasil. Silakan cek email Anda atau hubungi admin via WhatsApp.';
          actionsContainer.appendChild(infoText);
        } else if (data.status === 'EXPIRED') {
          const btnNew = document.createElement('a');
          btnNew.href = '/';
          btnNew.className = 'btn-primary-action';
          btnNew.style.backgroundColor = '#ef4444';
          btnNew.innerHTML = '<i class="ph ph-shopping-cart"></i> Buat Pesanan Baru';
          actionsContainer.appendChild(btnNew);
        }

        // Show result
        resultContainer.classList.add('active');
        setTimeout(() => {
          resultContainer.classList.add('show');
        }, 50);
      } else {
        alert(result.message || 'Invoice tidak ditemukan.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menghubungi server.');
    } finally {
      // Hide loading
      btnSubmit.textContent = originalText;
      btnSubmit.disabled = false;
      if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
  });
});
