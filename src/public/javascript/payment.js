document.addEventListener('DOMContentLoaded', async () => {
  // Parse URL Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceParam = urlParams.get('invoice');
  let paymentData = null;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  if (invoiceParam) {
    try {
      const response = await fetch(`/api/handle-payment?invoice=${invoiceParam}`);
      const result = await response.json();
      if (result.success && result.data) {
        paymentData = result.data;
        console.log(result.data);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    }
  }

  // Extract Data
  const productName =
    urlParams.get('title') ||
    (paymentData ? `Template #${paymentData.template_id}` : 'Produk Tidak Diketahui');
  const rawPrice = paymentData ? paymentData.jumlah_total : urlParams.get('price') || '0';
  const productPrice = formatRupiah(rawPrice);

  const userName = paymentData ? paymentData.nama : urlParams.get('name') || '-';
  const userEmail = paymentData ? paymentData.email : urlParams.get('email') || '-';
  const userWa = paymentData ? paymentData.no_wa : urlParams.get('wa') || '-';
  const invoiceId = paymentData ? paymentData.no_invoice : invoiceParam || '-';

  // Generate Date Format
  let formattedDate = '-';
  if (paymentData && paymentData.tanggal) {
    const date = new Date(paymentData.tanggal);
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  } else {
    const date = new Date();
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  // Populate DOM
  const payAmountElem = document.getElementById('pay-amount');
  if (payAmountElem) payAmountElem.textContent = productPrice;
  document.getElementById('pay-invoice').textContent = invoiceId;
  document.getElementById('pay-date').textContent = formattedDate;
  document.getElementById('pay-name').textContent = userName;
  document.getElementById('pay-email').textContent = userEmail;
  document.getElementById('pay-wa').textContent = userWa;
  document.getElementById('pay-product').textContent = productName;
  document.getElementById('pay-total-bottom').textContent = productPrice;

  // Remove loading state after data is populated
  document.body.classList.remove('loading-state', 'manual-loading');

  // QRIS & Status Display
  const totalPembayaranContainer = document.getElementById('total-pembayaran-container');
  const qrisContainer = document.getElementById('qris-container');
  const qrisImg = document.getElementById('qris-img');
  const btnDownload = document.getElementById('btn-download-qris');
  const successMessage = document.getElementById('success-message');
  const expiredMessage = document.getElementById('expired-message');

  const updateStatusUI = (data) => {
    if (data && data.status === 'SUCCESS') {
      if (totalPembayaranContainer) totalPembayaranContainer.style.display = 'none';
      if (qrisContainer) qrisContainer.style.display = 'none';
      if (expiredMessage) expiredMessage.style.display = 'none';
      if (successMessage) successMessage.style.display = 'block';

      // Change button to "Cek Transaksi"
      const btnWa = document.getElementById('btn-wa');
      if (btnWa) {
        btnWa.innerHTML = 'Cek Transaksi';
        btnWa.removeAttribute('target');
        btnWa.onclick = (e) => {
          e.preventDefault();
          navigator.clipboard
            .writeText(invoiceId)
            .then(() => {
              const copyToast = document.getElementById('copy-toast');
              if (copyToast) {
                copyToast.textContent = 'No. Invoice disalin!';
                copyToast.classList.add('show');
                setTimeout(() => {
                  copyToast.classList.remove('show');
                  window.location.href = '/transaksi';
                }, 1500);
              } else {
                window.location.href = '/transaksi';
              }
            })
            .catch((err) => {
              console.error('Failed to copy: ', err);
              window.location.href = '/transaksi';
            });
        };
      }

      return 'SUCCESS';
    } else if (data && data.status === 'EXPIRED') {
      if (totalPembayaranContainer) totalPembayaranContainer.style.display = 'none';
      if (qrisContainer) qrisContainer.style.display = 'none';
      if (successMessage) successMessage.style.display = 'none';
      if (expiredMessage) expiredMessage.style.display = 'block';

      // Hide WhatsApp button
      const btnWa = document.getElementById('btn-wa');
      if (btnWa) btnWa.style.display = 'none';
      
      const instructionBox = document.querySelector('.payment-instruction-box');
      if (instructionBox) instructionBox.style.display = 'none';

      return 'EXPIRED';
    } else {
      if (totalPembayaranContainer) totalPembayaranContainer.style.display = 'block';
      if (data && data.qris_image) {
        if (qrisImg) {
          qrisImg.src = data.qris_image;
          qrisImg.style.display = 'block';
        }
        if (btnDownload) btnDownload.style.display = 'flex';
      }
      return false;
    }
  };

  const startCountdown = (createdAt) => {
    const timerEl = document.getElementById('countdown-timer');
    const qrisLabel = document.getElementById('qris-label');
    const qrisImg = document.getElementById('qris-img');
    const btnDownload = document.getElementById('btn-download-qris');

    if (!timerEl || !createdAt) return;

    const createdTime = new Date(createdAt).getTime();
    const expireTime = createdTime + 15 * 60 * 1000;

    timerEl.style.display = 'block';

    const countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expireTime - now;

      if (distance < 0) {
        clearInterval(countdownInterval);
        updateStatusUI({ status: 'EXPIRED' });
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timerEl.textContent = `Sisa Waktu: ${minutes}m ${seconds}s`;
      }
    }, 1000);
  };

  if (paymentData) {
    const statusResult = updateStatusUI(paymentData);
    
    if (statusResult !== 'SUCCESS' && statusResult !== 'EXPIRED' && paymentData.created_at) {
      startCountdown(paymentData.created_at);
    }

    // Auto-polling for status SUCCESS if not already success
    if (statusResult !== 'SUCCESS' && statusResult !== 'EXPIRED' && invoiceParam) {
      const pollingInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/handle-payment?invoice=${invoiceParam}`);
          const result = await response.json();
          if (result.success && result.data && result.data.status === 'SUCCESS') {
            updateStatusUI(result.data);
            clearInterval(pollingInterval);
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 5000); // Check every 5 seconds
    }
  }

  // Setup WhatsApp Link
  const adminNumber = '6281917536832'; // Placeholder Admin WA
  const waMessage = `Halo Admin *Sajak Visual*,%0A%0ASaya ingin mengonfirmasi pembayaran untuk pesanan undangan digital saya. Berikut adalah rincian pesanannya:%0A%0A==========================%0A*INFORMASI PESANAN*%0A==========================%0A*No. Invoice*  : ${invoiceId}%0A*Tanggal*      : ${formattedDate}%0A%0A--------------------------%0A*DATA PEMESAN*%0A--------------------------%0A*Nama*         : ${userName}%0A*Email*        : ${userEmail}%0A*No. WA*       : ${userWa}%0A%0A--------------------------%0A*DETAIL TAGIHAN*%0A--------------------------%0A*Produk*       : ${productName}%0A*Total Tagihan* : ${productPrice}%0A==========================%0A%0ABersama pesan ini, saya lampirkan bukti transfer pembayaran.%0A%0ATerima kasih banyak.`;
  const waUrl = `https://wa.me/${adminNumber}?text=${waMessage}`;

  document.getElementById('btn-wa').href = waUrl;

  // Copy Feature for Invoice
  const btnCopyInvoice = document.getElementById('btn-copy-invoice');
  const copyToast = document.getElementById('copy-toast');

  if (btnCopyInvoice) {
    btnCopyInvoice.addEventListener('click', () => {
      const invoiceText = document.getElementById('pay-invoice').textContent;
      navigator.clipboard
        .writeText(invoiceText)
        .then(() => {
          copyToast.classList.add('show');
          setTimeout(() => {
            copyToast.classList.remove('show');
          }, 2000);
        })
        .catch((err) => console.error('Failed to copy: ', err));
    });
  }

  // Download QRIS Feature
  const btnDownloadQris = document.getElementById('btn-download-qris');
  if (btnDownloadQris) {
    btnDownloadQris.addEventListener('click', () => {
      const qrisImg = document.getElementById('qris-img');
      if (qrisImg && qrisImg.src) {
        const a = document.createElement('a');
        a.href = qrisImg.src;
        a.download = `QRIS-${invoiceId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  }
});
console.log(`
╭──────────────────────────────────────────────────╮
│                                                  │
│   SajakVisual - SaaS Digital Invitation          │
│   Developed by: Muhamad Faidil Aziz              │
│   © 2026 SajakVisual. All rights reserved.       │
│   System is running smoothly...                  │
│                                                  │
╰──────────────────────────────────────────────────╯
`);
