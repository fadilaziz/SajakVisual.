import crypto from 'crypto';

//Email Message for pending payment
export const emailMessagePending = (data) => {
  try {
    const formatRupiah = (number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(number);
    };

    const invoiceNumber = data?.no_invoice || 'SJV-XXXXXX';
    const customerName = data?.nama || 'Pelanggan';
    const totalAmount = data?.jumlah_total ? formatRupiah(data.jumlah_total) : 'Rp -';
    const purchaseDate = data?.created_at
      ? new Date(data.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-';
    const productName = `Template #${data?.template_id || ''} - Layanan Undangan Digital`;
    const paymentLink = `${process.env.BASE_URL_SAJAKVISUAL}payment?invoice=${invoiceNumber}`;
    const expiredDateStr = data?.expired_at
      ? new Date(data.expired_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      : '-';

    const message = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menunggu Pembayaran - Sajak Visual</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    /* Internal CSS - Sajak Visual Monochrome Design */
    body {
      font-family: 'Nunito', ui-sans-serif, sans-serif, system-ui;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      background-color: #f5f5f5;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 0.625rem;
      overflow: hidden;
      box-shadow: 0 1px 3px 0px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1);
    }
    .email-header {
      background-color: #ffffff;
      border-bottom: 1px solid #e5e5e5;
      padding: 30px 20px;
      text-align: center;
    }
    .email-header img {
      height: 40px;
      width: auto;
      margin-bottom: 15px;
    }
    .logo-gray {
      /* Mengubah gambar apapun menjadi abu-abu netral (50% gray) */
      filter: brightness(0) invert(0.5);
      /* Fallback untuk beberapa email client */
      opacity: 0.6;
    }
    .header-badge {
      display: inline-block;
      background-color: #fef08a;
      color: #854d0e;
      padding: 6px 12px;
      border-radius: 0.625rem;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid #fde047;
    }
    .email-body {
      padding: 35px 32px;
      color: #1a1a1a;
    }
    .greeting {
      font-size: 22px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
      color: #1a1a1a;
    }
    .success-text {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 30px;
      color: #737373;
    }
    .details-card {
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 0.625rem;
      padding: 24px;
      margin-bottom: 30px;
    }
    .details-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1a1a1a;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 12px;
    }
    .detail-table {
      width: 100%;
      border-collapse: collapse;
    }
    .detail-table td {
      padding: 6px 0;
      font-size: 14px;
    }
    .detail-label {
      color: #737373;
      width: 40%;
    }
    .detail-value {
      font-weight: 600;
      color: #1a1a1a;
      text-align: right;
      width: 60%;
    }
    .cta-container {
      display: block;
      margin-top: 24px;
      margin-bottom: 10px;
    }
    .btn-primary {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px;
      background: linear-gradient(to bottom, #3c3c3c, #1e1e1e);
      color: #fafafa;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
    }
    .btn-secondary {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px;
      background-color: #ffffff;
      color: #1b1b1b;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      border: 1px solid #e5e5e5;
    }
    .btn-margin {
      margin-bottom: 12px;
    }
    .divider {
      height: 1px;
      background-color: #e5e5e5;
      margin: 10px 0;
    }
    .total-value {
      font-size: 16px;
    }
    .text-danger {
      color: #dc2626;
    }
    .email-footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e5e5e5;
    }
    .email-footer p {
      font-size: 12px;
      color: #737373;
      margin: 4px 0;
    }

    /* Mobile Responsiveness */
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 0; background-color: #ffffff; }
      .email-container { border-radius: 0; border: none; box-shadow: none; }
      .email-header { padding: 20px 15px; }
      .email-body { padding: 20px 15px; }
      .greeting { font-size: 18px; }
      .success-text { font-size: 14px; margin-bottom: 24px; }
      .details-card { padding: 20px 16px; margin-bottom: 24px; }
      .detail-table td { font-size: 13px; }
      .total-value { font-size: 14px; }
      .btn-primary, .btn-secondary { font-size: 14px; padding: 12px; margin-bottom: 12px !important; }
      .email-footer { padding: 15px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- Header -->
      <div class="email-header">
        <img src="${process.env.BASE_URL_SAJAKVISUAL || 'https://sajak-visual.vercel.app'}/img/logo%20and%20text%20Sajakvisual..png" alt="Sajak Visual" class="logo-gray">
        <div>
          <span class="header-badge">Menunggu Pembayaran</span>
        </div>
      </div>

      <!-- Body -->
      <div class="email-body">
        <h2 class="greeting">Halo, ${customerName},</h2>
        <p class="success-text">
          Pesanan Anda telah kami terima. Silakan selesaikan pembayaran sebelum batas waktu berakhir untuk mengaktifkan layanan undangan digital Anda.
        </p>

        <!-- Rincian Pembelian (Purchase Details) -->
        <div class="details-card">
          <h3 class="details-title">Rincian Pembelian</h3>
          <table class="detail-table">
            <tr>
              <td class="detail-label">No. Invoice</td>
              <td class="detail-value">${invoiceNumber}</td>
            </tr>
            <tr>
              <td class="detail-label">Tanggal</td>
              <td class="detail-value">${purchaseDate}</td>
            </tr>
            <tr>
              <td class="detail-label">Produk</td>
              <td class="detail-value">${productName}</td>
            </tr>
            <tr>
              <td class="detail-label">Metode Pembayaran</td>
              <td class="detail-value">QRIS</td>
            </tr>
            <tr>
              <td class="detail-label">Batas Waktu</td>
              <td class="detail-value"><span class="text-danger">${expiredDateStr}</span></td>
            </tr>
            <tr>
              <td colspan="2"><div class="divider"></div></td>
            </tr>
            <tr>
              <td class="detail-label">Total Pembayaran</td>
              <td class="detail-value total-value">${totalAmount}</td>
            </tr>
          </table>
        </div>

        <!-- Call to Action -->
        <div class="cta-container">
          <a href="${paymentLink}" class="btn-primary btn-margin">Bayar Sekarang</a>
          <a href="https://wa.me/6282229482731?text=Halo%20Admin%2C%20saya%20butuh%20bantuan%20terkait%20pesanan%20dengan%20invoice%20${invoiceNumber}." class="btn-secondary btn-margin">Hubungi Admin via WhatsApp</a>
        </div>

        <p class="success-text" style="text-align: center; margin-top: 20px; font-size: 13px;">
          Invoice ini akan otomatis dibatalkan jika melewati batas waktu pembayaran.
        </p>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p>&copy; ${new Date().getFullYear()} Sajak Visual. Semua hak cipta dilindungi.</p>
        <p>Email ini dihasilkan secara otomatis, mohon tidak membalas email ini.</p>
      </div>

    </div>
  </div>
</body>
</html>`;
    return message;
  } catch (error) {
    console.error('error', error);
  }
};

//Email message for payment Success
export const emailMessagesSuccess = (orderData) => {
  try {
    const formatRupiah = (number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(number);
    };

    const invoiceNumber = orderData?.no_invoice || 'SJV-XXXXXX';
    const customerName = orderData?.nama || 'Pelanggan';
    const token = orderData?.token;
    const invitationlink = `${process.env.BASE_URL_SAJAKVISUAL}form/${invoiceNumber}?token=${token}`;
    const totalAmount = orderData?.jumlah_total ? formatRupiah(orderData.jumlah_total) : 'Rp -';
    const purchaseDate = orderData?.created_at
      ? new Date(orderData.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-';
    const productName = orderData?.template_name || 'Undangan Digital Premium';

    const message = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pembayaran Berhasil - Sajak Visual</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    /* Internal CSS - Sajak Visual Monochrome Design */
    body {
      font-family: 'Nunito', ui-sans-serif, sans-serif, system-ui;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      background-color: #f5f5f5;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 0.625rem;
      overflow: hidden;
      box-shadow: 0 1px 3px 0px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1);
    }
    .email-header {
      background-color: #ffffff;
      border-bottom: 1px solid #e5e5e5;
      padding: 30px 20px;
      text-align: center;
    }
    .email-header img {
      height: 40px;
      width: auto;
      margin-bottom: 15px;
    }
    .logo-gray {
      /* Mengubah gambar apapun menjadi abu-abu netral (50% gray) */
      filter: brightness(0) invert(0.5);
      /* Fallback untuk beberapa email client */
      opacity: 0.6;
    }
    .header-badge {
      display: inline-block;
      background-color: #ecfdf5;
      color: #059669;
      padding: 6px 12px;
      border-radius: 0.625rem;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid #a7f3d0;
    }
    .email-body {
      padding: 35px 32px;
      color: #1a1a1a;
    }
    .greeting {
      font-size: 22px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
      color: #1a1a1a;
    }
    .success-text {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 30px;
      color: #737373;
    }
    .details-card {
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 0.625rem;
      padding: 24px;
      margin-bottom: 30px;
    }
    .details-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1a1a1a;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 12px;
    }
    .detail-table {
      width: 100%;
      border-collapse: collapse;
    }
    .detail-table td {
      padding: 6px 0;
      font-size: 14px;
    }
    .detail-label {
      color: #737373;
      width: 40%;
    }
    .detail-value {
      font-weight: 600;
      color: #1a1a1a;
      text-align: right;
      width: 60%;
    }
    .steps-container {
      margin-bottom: 30px;
    }
    .steps-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .step-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .step-table td {
      vertical-align: top;
    }
    .step-icon-td {
      width: 35px;
    }
    .step-icon {
      background-color: #f5f5f5;
      color: #1a1a1a;
      border: 1px solid #e5e5e5;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      font-weight: 700;
      font-size: 12px;
      display: inline-block;
    }
    .step-text {
      font-size: 14px;
      line-height: 1.6;
      color: #737373;
      margin: 0;
      padding-top: 2px;
    }
    .cta-container {
      display: block;
      margin-top: 24px;
      margin-bottom: 10px;
    }
    .btn-primary {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px;
      background: linear-gradient(to bottom, #3c3c3c, #1e1e1e);
      color: #fafafa;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
    }
    .btn-secondary {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px;
      background-color: #ffffff;
      color: #1b1b1b;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      border: 1px solid #e5e5e5;
    }
    .btn-margin {
      margin-bottom: 12px;
    }
    .divider {
      height: 1px;
      background-color: #e5e5e5;
      margin: 10px 0;
    }
    .total-value {
      font-size: 16px;
    }
    .text-strong {
      color: #1a1a1a;
    }
    .email-footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e5e5e5;
    }
    .email-footer p {
      font-size: 12px;
      color: #737373;
      margin: 4px 0;
    }

    /* Mobile Responsiveness */
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 0; background-color: #ffffff; }
      .email-container { border-radius: 0; border: none; box-shadow: none; }
      .email-header { padding: 20px 15px; }
      .email-body { padding: 20px 15px; }
      .greeting { font-size: 18px; }
      .success-text { font-size: 14px; margin-bottom: 24px; }
      .details-card { padding: 20px 16px; margin-bottom: 24px; }
      .detail-table td { font-size: 13px; }
      .total-value { font-size: 14px; }
      .steps-title { font-size: 15px; margin-bottom: 12px; }
      .step-text { font-size: 13px; }
      .btn-primary, .btn-secondary { font-size: 14px; padding: 12px; margin-bottom: 12px !important; }
      .email-footer { padding: 15px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- Header -->
      <div class="email-header">
        <img src="${process.env.BASE_URL_SAJAKVISUAL || 'https://sajak-visual.vercel.app'}/img/logo%20and%20text%20Sajakvisual..png" alt="Sajak Visual" class="logo-gray">
        <div>
          <span class="header-badge">Pembayaran Berhasil</span>
        </div>
      </div>

      <!-- Body -->
      <div class="email-body">
        <h2 class="greeting">Terima Kasih, ${customerName}!</h2>
        <p class="success-text">
          Pembayaran untuk pesanan Anda telah berhasil dikonfirmasi.
        </p>

        <!-- Rincian Pembelian (Purchase Details) -->
        <div class="details-card">
          <h3 class="details-title">Rincian Pembelian</h3>
          <table class="detail-table">
            <tr>
              <td class="detail-label">No. Invoice</td>
              <td class="detail-value">${invoiceNumber}</td>
            </tr>
            <tr>
              <td class="detail-label">Tanggal</td>
              <td class="detail-value">${purchaseDate}</td>
            </tr>
            <tr>
              <td class="detail-label">Produk</td>
              <td class="detail-value">${productName}</td>
            </tr>
            <tr>
              <td colspan="2"><div class="divider"></div></td>
            </tr>
            <tr>
              <td class="detail-label">Total Pembayaran</td>
              <td class="detail-value total-value">${totalAmount}</td>
            </tr>
          </table>
        </div>

        <!-- Langkah Selanjutnya (Next Steps) -->
        <div class="steps-container">
          <h3 class="steps-title">Langkah Selanjutnya</h3>

          <table class="step-table">
            <tr>
              <td class="step-icon-td"><div class="step-icon">1</div></td>
              <td><p class="step-text"><strong class="text-strong">Pengeditan data Undangan:</strong> Klik Tombol <b>Edit Data Undangan</b> dibawah ini untuk diarahkan ke form pengeditan data undangan digital anda.</p></td>
            </tr>
          </table>

          <table class="step-table">
            <tr>
              <td class="step-icon-td"><div class="step-icon">2</div></td>
              <td><p class="step-text"><strong class="text-strong">Isi Form Pengeditan:</strong> Isi formulir detail mempelai, rangkaian acara, dan foto-foto galeri yang akan ditampilkan pada undangan.</p></td>
            </tr>
          </table>

          <table class="step-table">
            <tr>
              <td class="step-icon-td"><div class="step-icon">3</div></td>
              <td><p class="step-text"><strong class="text-strong">Simpan Data Undangan:</strong> Data undangan akan diubah secara otomatis setelah anda menekan tombol <b>Simpan Data Undangan</b>.</p></td>
            </tr>
          </table>
          <table class="step-table">
            <tr>
              <td class="step-icon-td"><div class="step-icon">4</div></td>
              <td><p class="step-text"><strong class="text-strong">Link Undangan:</strong> silahkan tekan tombol <b>Salin Link Undangan</b> untuk menyalin link undangan, atau tekan tombol <b>Lihat Undangan</b> untuk melihat terlebih dahulu undangan digital anda.</p></td>
            </tr>
          </table>
        </div>

        <!-- Call to Action -->
        <div class="cta-container">
          <a href="${invitationlink}" class="btn-primary btn-margin">Edit Data Undangan</a>
          <a href="#" class="btn-primary btn-margin">Lihat Undangan</a>
          <a href="https://wa.me/6282229482731?text=Halo%20Admin%2C%20saya%20sudah%20membayar%20invoice%20${invoiceNumber}.%20Mohon%20info%20langkah%20selanjutnya." class="btn-secondary btn-margin">Konfirmasi via WhatsApp</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p>&copy; ${new Date().getFullYear()} Sajak Visual. Semua hak cipta dilindungi.</p>
        <p>Email ini dihasilkan secara otomatis, mohon tidak membalas email ini.</p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
    console.log('ini pesan email succes', message);

    return message;
  } catch (error) {
    console.error('error', error);
  }
};

//Email message for payment Expired
export const emailMessagesExpired = (orderData) => {
  try {
    const formatRupiah = (number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(number);
    };

    const invoiceNumber = orderData?.no_invoice || 'SJV-XXXXXX';
    const customerName = orderData?.nama || 'Pelanggan';
    const token = orderData?.token;
    const invitationlink = `${process.env.BASE_URL_SAJAKVISUAL || 'https://sajak-visual.vercel.app'}/edit/${invoiceNumber}?token=${token}`;
    const totalAmount = orderData?.jumlah_total ? formatRupiah(orderData.jumlah_total) : 'Rp -';
    const purchaseDate = orderData?.created_at
      ? new Date(orderData.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-';
    const productName = orderData?.template_name || 'Undangan Digital Premium';

    const message = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pesanan Kedaluwarsa - Sajak Visual</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    /* Internal CSS - Sajak Visual Monochrome Design */
    body {
      font-family: 'Nunito', ui-sans-serif, sans-serif, system-ui;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      background-color: #f5f5f5;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 0.625rem;
      overflow: hidden;
      box-shadow: 0 1px 3px 0px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1);
    }
    .email-header {
      background-color: #ffffff;
      border-bottom: 1px solid #e5e5e5;
      padding: 30px 20px;
      text-align: center;
    }
    .email-header img {
      height: 40px;
      width: auto;
      margin-bottom: 15px;
    }
    .logo-gray {
      /* Mengubah gambar apapun menjadi abu-abu netral (50% gray) */
      filter: brightness(0) invert(0.5);
      /* Fallback untuk beberapa email client */
      opacity: 0.6;
    }
    .header-badge {
      display: inline-block;
      background-color: #fef2f2;
      color: #dc2626;
      padding: 6px 12px;
      border-radius: 0.625rem;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid #fecaca;
    }
    .email-body {
      padding: 35px 32px;
      color: #1a1a1a;
    }
    .greeting {
      font-size: 22px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
      color: #1a1a1a;
    }
    .success-text {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 30px;
      color: #737373;
    }
    .details-card {
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 0.625rem;
      padding: 24px;
      margin-bottom: 30px;
    }
    .details-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1a1a1a;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 12px;
    }
    .detail-table {
      width: 100%;
      border-collapse: collapse;
    }
    .detail-table td {
      padding: 6px 0;
      font-size: 14px;
    }
    .detail-label {
      color: #737373;
      width: 40%;
    }
    .detail-value {
      font-weight: 600;
      color: #1a1a1a;
      text-align: right;
      width: 60%;
    }
    .steps-container {
      margin-bottom: 30px;
    }
    .steps-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .step-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .step-table td {
      vertical-align: top;
    }
    .step-icon-td {
      width: 35px;
    }
    .step-icon {
      background-color: #f5f5f5;
      color: #1a1a1a;
      border: 1px solid #e5e5e5;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      font-weight: 700;
      font-size: 12px;
      display: inline-block;
    }
    .step-text {
      font-size: 14px;
      line-height: 1.6;
      color: #737373;
      margin: 0;
      padding-top: 2px;
    }
    .cta-container {
      display: block;
      margin-top: 24px;
      margin-bottom: 10px;
    }
    .btn-primary {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px;
      background: linear-gradient(to bottom, #3c3c3c, #1e1e1e);
      color: #fafafa;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
    }
    .btn-secondary {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px;
      background-color: #ffffff;
      color: #1b1b1b;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      border: 1px solid #e5e5e5;
    }
    .btn-margin {
      margin-bottom: 12px;
    }
    .divider {
      height: 1px;
      background-color: #e5e5e5;
      margin: 10px 0;
    }
    .total-value {
      font-size: 16px;
    }
    .text-strong {
      color: #1a1a1a;
    }
    .email-footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e5e5e5;
    }
    .email-footer p {
      font-size: 12px;
      color: #737373;
      margin: 4px 0;
    }

    /* Mobile Responsiveness */
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 0; background-color: #ffffff; }
      .email-container { border-radius: 0; border: none; box-shadow: none; }
      .email-header { padding: 20px 15px; }
      .email-body { padding: 20px 15px; }
      .greeting { font-size: 18px; }
      .success-text { font-size: 14px; margin-bottom: 24px; }
      .details-card { padding: 20px 16px; margin-bottom: 24px; }
      .detail-table td { font-size: 13px; }
      .total-value { font-size: 14px; }
      .steps-title { font-size: 15px; margin-bottom: 12px; }
      .step-text { font-size: 13px; }
      .btn-primary, .btn-secondary { font-size: 14px; padding: 12px; margin-bottom: 12px !important; }
      .email-footer { padding: 15px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- Header -->
      <div class="email-header">
        <img src="${process.env.BASE_URL_SAJAKVISUAL || 'https://sajak-visual.vercel.app'}/img/logo%20and%20text%20Sajakvisual..png" alt="Sajak Visual" class="logo-gray">
        <div>
          <span class="header-badge">Pesanan Kedaluwarsa</span>
        </div>
      </div>

      <!-- Body -->
      <div class="email-body">
        <h2 class="greeting">Halo, ${customerName},</h2>
        <p class="success-text">
          Maaf, batas waktu pembayaran untuk pesanan Anda (<strong>${invoiceNumber}</strong>) telah berakhir karena belum ada pembayaran yang diterima.
        </p>

        <!-- Rincian Pembelian (Purchase Details) -->
        <div class="details-card">
          <h3 class="details-title">Rincian Pembelian</h3>
          <table class="detail-table">
            <tr>
              <td class="detail-label">No. Invoice</td>
              <td class="detail-value">${invoiceNumber}</td>
            </tr>
            <tr>
              <td class="detail-label">Tanggal</td>
              <td class="detail-value">${purchaseDate}</td>
            </tr>
            <tr>
              <td class="detail-label">Produk</td>
              <td class="detail-value">${productName}</td>
            </tr>
            <tr>
              <td colspan="2"><div class="divider"></div></td>
            </tr>
            <tr>
              <td class="detail-label">Total Pembayaran</td>
              <td class="detail-value total-value">${totalAmount}</td>
            </tr>
          </table>
        </div>

        <!-- Langkah Selanjutnya (Next Steps) -->
        <div class="steps-container">
          <h3 class="steps-title">Apa yang harus dilakukan selanjutnya?</h3>

          <table class="step-table">
            <tr>
              <td class="step-icon-td"><div class="step-icon">1</div></td>
              <td><p class="step-text"><strong class="text-strong">Buat Pesanan Baru:</strong> Pesanan ini otomatis dibatalkan oleh sistem. Silakan buat pemesanan ulang melalui website kami jika Anda masih ingin melanjutkan.</p></td>
            </tr>
          </table>

          <table class="step-table">
            <tr>
              <td class="step-icon-td"><div class="step-icon">2</div></td>
              <td><p class="step-text"><strong class="text-strong">Butuh Bantuan?:</strong> Jika Anda mengalami kendala saat pembayaran sebelumnya, Anda dapat langsung menghubungi Admin kami.</p></td>
            </tr>
          </table>
        </div>

        <!-- Call to Action -->
        <div class="cta-container">
          <a href="${process.env.BASE_URL_SAJAKVISUAL || 'https://sajak-visual.vercel.app'}" class="btn-primary btn-margin">Buat Pesanan Baru</a>
          <a href="https://wa.me/6281917536832?text=Halo%20Admin%2C%20pesanan%20saya%20dengan%20invoice%20${invoiceNumber}%20sudah%20kedaluwarsa.%20Mohon%20bantuannya." class="btn-secondary btn-margin">Hubungi Admin via WhatsApp</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p>&copy; ${new Date().getFullYear()} Sajak Visual. Semua hak cipta dilindungi.</p>
        <p>Email ini dihasilkan secara otomatis, mohon tidak membalas email ini.</p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
    console.log('ini pesan email expired', message);

    return message;
  } catch (error) {
    console.error('error', error);
  }
};

//Ganerate token form
export const ganerateToken = async () => {
  const token = crypto.randomBytes(10).toString('hex');
  return token;
};
