import supabase from '../../../database/supabase.js';
import crypto from 'crypto';
import { send_email } from '../email/send_email.js';
import path from 'path';

//Capture data
const captureData = async (data) => {
  const { title, price, name, email, no_wa } = data;

  return data;
};

//Validation data
const validateData = async (data) => {
  const errors = [];

  //1. Validationn Full Name
  const namaRegex = /^[a-zA-Z\s.,']+$/;
  if (!data.name || data.name.trim().length < 3 || data.name.trim().length > 100) {
    throw new Error('Nama lengkap harus antara 3 - 100 karakter.');
  } else if (!namaRegex.test(data.name.trim())) {
    throw new Error('Nama hanya boleh berisi huruf, spasi, titik, atau koma (gelar).');
  }

  // 2. Validation Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim().toLowerCase())) {
    throw new Error('Format email tidak valid.');
  }

  // 3. Validation WhatsApp Number
  const waRegex = /^(\+62|62|0)[8][0-9]{8,11}$/;
  if (!data.no_wa || !waRegex.test(data.no_wa)) {
    throw new Error('Nomor WhatsApp tidak valid. Gunakan format 08... atau 628...');
  }

  return data;
};

//Get price from database to calculate total
const getPrice = async (data) => {
  const { data: price, error } = await supabase
    .from('templates')
    .select('harga')
    .eq('id', data.product_id);
  if (error) {
    throw Error('Gagal mengambil harga');
  }
  data.price = price[0].harga;

  return data;
};

//Create checkout
const createCheckout = async (data) => {
  try {
    //1.Ganerate Invoice number
    const prefix = 'SJV';

    // Generate uniq code
    const uniqueCode = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5);

    // Generate date (Format: YYYYMMDD)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const invoiceNumber = `${prefix}-${uniqueCode}-${dateString}`;
    data.invoice_number = invoiceNumber;

    //2.Hit Api KlikQris
    const url = `${process.env.KLIKQRIS_BASE_URL}/qris/create`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.KLIKQRIS_API_KEY,
        id_merchant: process.env.KLIKQRIS_ID_MERCHANT,
      },
      body: JSON.stringify({
        order_id: data.invoice_number,
        id_merchant: process.env.KLIKQRIS_ID_MERCHANT,
        amount: data.price,
        keterangan: `Pembayaran Invoice ${data.invoice_number}`,
      }),
    };
    const response = await fetch(url, options);
    const result = await response.json();

    //Create expiretime
    const currenttime = new Date();
    const expired = parseInt(result.data.expired_menit);
    const expiredtime = new Date(currenttime.getTime() + expired * 60000);

    //Capture order data for save to supabase
    const dataOrder = {
      no_invoice: data.invoice_number,
      nama: data.name,
      email: data.email,
      no_wa: data.no_wa,
      template_id: data.product_id,
      status: result.data.status,
      jumlah_total: data.price,
      signature: result.data.signature,
      qris_url: result.data.qris_url,
      qris_image: result.data.qris_image,
      created_at: result.data.created_at,
      expired_at: expiredtime,
      tanggal: result.data.tanggal,
    };

    // 3.Save data to supabase
    const { data: savedOrder, error: saveError } = await supabase
      .from('orders')
      .insert([dataOrder]);

    if (saveError) {
      throw saveError;
    }

    return dataOrder;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//Send invoice to user email
export const sendEmail = async (data) => {
  console.log(data.email);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Send Email
  const email_message = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f4f4f5; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; padding: 32px 24px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7; }
        .logo { max-height: 20px; }
        .content { padding: 32px 24px; color: #3f3f46; }
        .badge { display: inline-block; padding: 6px 12px; background-color: #fef08a; color: #854d0e; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 24px; letter-spacing: 0.5px; }
        .title { font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 8px 0; }
        .text { font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; }
        .invoice-card { background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .row { display: table; width: 100%; margin-bottom: 12px; }
        .row:last-child { margin-bottom: 0; }
        .col-left { display: table-cell; font-size: 14px; color: #71717a; }
        .col-right { display: table-cell; font-size: 14px; color: #18181b; font-weight: 600; text-align: right; }
        .text-danger { color: #dc2626; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .table th { padding: 12px 0; border-bottom: 2px solid #e4e4e7; font-size: 12px; color: #71717a; text-transform: uppercase; text-align: left; }
        .table th.right { text-align: right; }
        .table td { padding: 16px 0; border-bottom: 1px solid #e4e4e7; }
        .table td.right { text-align: right; font-weight: 600; color: #18181b; }
        .item-name { font-size: 15px; font-weight: 600; color: #18181b; margin: 0 0 4px 0; }
        .item-desc { font-size: 13px; color: #71717a; margin: 0; }
        .total-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 32px; display: table; width: 100%; box-sizing: border-box; }
        .total-label { display: table-cell; font-size: 16px; font-weight: 500; color: #0f172a; vertical-align: middle; }
        .total-amount { display: table-cell; font-size: 24px; font-weight: 700; color: #16a34a; text-align: right; vertical-align: middle; }
        .btn { display: block; width: 100%; text-align: center; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 8px; font-size: 16px; font-weight: 600; margin-bottom: 24px; box-sizing: border-box; }
        .footer { text-align: center; padding: 24px; font-size: 13px; color: #a1a1aa; background-color: #ffffff; }
        .footer a { color: #18181b; text-decoration: none; font-weight: 500; }
        @media only screen and (max-width: 600px) {
            .wrapper { padding: 0; }
            .container { border-radius: 0; box-shadow: none; }
            .content { padding: 24px 16px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <img src="cid:logo_sajakvisual" alt="Sajak Visual" class="logo">
            </div>
            <div class="content">
                <div style="text-align: center;">
                    <span class="badge">MENUNGGU PEMBAYARAN</span>
                    <h1 class="title">Halo, ${data.nama}</h1>
                    <p class="text">Pesanan Anda telah kami terima. Silakan selesaikan pembayaran sebelum batas waktu berakhir untuk mengaktifkan layanan undangan digital Anda.</p>
                </div>

                <div class="invoice-card">
                    <div class="row">
                        <div class="col-left">Nomor Invoice</div>
                        <div class="col-right">${data.no_invoice}</div>
                    </div>
                    <div class="row">
                        <div class="col-left">Metode Pembayaran</div>
                        <div class="col-right">QRIS</div>
                    </div>
                    <div class="row">
                        <div class="col-left">Batas Waktu</div>
                        <div class="col-right text-danger">${new Date(data.expired_at).toLocaleString('id-ID')}</div>
                    </div>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Detail Pesanan</th>
                            <th class="right">Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <p class="item-name">Template #${data.template_id}</p>
                                <p class="item-desc">Layanan Undangan Digital</p>
                            </td>
                            <td class="right">${formatRupiah(data.jumlah_total)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="total-box">
                    <div class="total-label">Total Tagihan</div>
                    <div class="total-amount">${formatRupiah(data.jumlah_total)}</div>
                </div>

                <a href="${process.env.BASE_URL_SAJAKVISUAL || 'https://sajak-visual.vercel.app'}/payment?invoice=${data.no_invoice}" class="btn">Bayar Sekarang</a>

                <p class="text" style="text-align: center; font-size: 13px; color: #71717a; margin-bottom: 0;">
                    Invoice ini akan otomatis dibatalkan jika melewati batas waktu pembayaran.
                </p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Sajak Visual &mdash; SaaS Digital Invitation.<br>
                Butuh bantuan? <a href="mailto:support@sajakvisual.com">Hubungi Kami</a>
            </div>
        </div>
    </div>
</body>
</html>`;

  const data_email = {
    subject: 'Detail Pesanan Undangan Digital - ' + data.no_invoice,
    message: email_message,
    destination: data.email,
    attachments: [
      {
        filename: 'logo_sajakvisual.webp',
        path: path.join(process.cwd(), 'src', 'public', 'img', 'logo_sajakvisual.webp'),
        cid: 'logo_sajakvisual',
      },
    ],
  };
  send_email(data_email);
  return data;
};

//Handle Payment Call Back
export const handlePaymentCallback = async (data) => {
  try {
    //1. Get status, signture cplumn from orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, signature')
      .eq('no_invoice', data.order_id);

    //2. Compare Signature
    if (orders[0].signature === data.signature) {
      //if data.status = PAID, update status to SUCCESS
      if (data.status === 'PAID') {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'SUCCESS' })
          .eq('no_invoice', data.order_id);
        // if data.status = EXPIRED, update to EXPIRED
      } else if (data.status == 'EXPIRED') {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'EXPIRED' })
          .eq('no_invoice', data.order_id);
      } else {
        return res.json({
          status: 400,
          success: false,
          message: 'Status tidak valid',
        });
      }
    } else {
      return res.json({
        status: 400,
        success: false,
        message: 'Signature tidak valid',
      });
    }

    return data;
  } catch (error) {
    throw error;
  }
};

//Send SUCCESS paymenr message, product link and instruction to user
const sendEmailSuccess = async (data) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('no_invoice', data.order_id);

    if (error || !orders || orders.length === 0) {
      console.error('Order not found for email notification');
      return;
    }

    const orderInfo = orders[0];
    console.log(orderInfo);

    const formatRupiah = (number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(number);
    };

    const email_message = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .wrapper { width: 100%; background-color: #f4f4f5; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
            .header { text-align: center; padding: 32px 24px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7; }
            .logo { max-height: 20px; }
            .content { padding: 32px 24px; color: #3f3f46; }
            .badge { display: inline-block; padding: 6px 12px; background-color: #dcfce7; color: #166534; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 24px; letter-spacing: 0.5px; }
            .title { font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 8px 0; }
            .text { font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; }
            .invoice-card { background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
            .row { display: table; width: 100%; margin-bottom: 12px; }
            .row:last-child { margin-bottom: 0; }
            .col-left { display: table-cell; font-size: 14px; color: #71717a; }
            .col-right { display: table-cell; font-size: 14px; color: #18181b; font-weight: 600; text-align: right; }
            .btn { display: block; width: 100%; text-align: center; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 8px; font-size: 16px; font-weight: 600; margin-bottom: 16px; box-sizing: border-box; }
            .btn-outline { display: block; width: 100%; text-align: center; background-color: transparent; border: 1px solid #d4d4d8; color: #18181b; text-decoration: none; padding: 16px; border-radius: 8px; font-size: 16px; font-weight: 600; margin-bottom: 24px; box-sizing: border-box; }
            .footer { text-align: center; padding: 24px; font-size: 13px; color: #a1a1aa; background-color: #ffffff; }
            .footer a { color: #18181b; text-decoration: none; font-weight: 500; }
            .instruction-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
            .instruction-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0; }
            .instruction-list { margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6; }
            .instruction-list li { margin-bottom: 8px; }
            @media only screen and (max-width: 600px) {
                .wrapper { padding: 0; }
                .container { border-radius: 0; box-shadow: none; }
                .content { padding: 24px 16px; }
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <img src="cid:logo_sajakvisual" alt="Sajak Visual" class="logo">
                </div>
                <div class="content">
                    <div style="text-align: center;">
                        <span class="badge">PEMBAYARAN BERHASIL</span>
                        <h1 class="title">Terima Kasih, ${orderInfo.nama}!</h1>
                        <p class="text">Pembayaran untuk pesanan Anda telah berhasil dikonfirmasi. Layanan undangan digital Anda kini sedang kami persiapkan.</p>
                    </div>

                    <div class="invoice-card">
                        <div class="row">
                            <div class="col-left">Nomor Invoice</div>
                            <div class="col-right">${orderInfo.no_invoice}</div>
                        </div>
                        <div class="row">
                            <div class="col-left">Tanggal Pembayaran</div>
                            <div class="col-right">${new Date().toLocaleString('id-ID')}</div>
                        </div>
                        <div class="row">
                            <div class="col-left">Jumlah Dibayar</div>
                            <div class="col-right" style="color: #16a34a; font-size: 16px;">${formatRupiah(orderInfo.jumlah_total)}</div>
                        </div>
                    </div>

                    <div class="instruction-box">
                        <h3 class="instruction-title">Langkah Selanjutnya:</h3>
                        <ul class="instruction-list">
                            <li>Hubungi tim admin melalui WhatsApp untuk mengisi detail mempelai dan acara.</li>
                            <li>Siapkan foto-foto galeri yang ingin ditampilkan pada undangan.</li>
                            <li>Proses pengerjaan akan memakan waktu 1-2 hari kerja.</li>
                        </ul>
                    </div>

                    <a href="https://wa.me/6281917536832?text=Halo%20Admin%2C%20saya%20sudah%20membayar%20invoice%20${orderInfo.no_invoice}.%20Mohon%20info%20langkah%20selanjutnya." class="btn">Konfirmasi via WhatsApp</a>

                    <a href="${process.env.BASE_URL_SAJAKVISUAL || 'https://sajak-visual.vercel.app'}/transaksi" class="btn-outline">Cek Status Pesanan</a>

                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Sajak Visual &mdash; SaaS Digital Invitation.<br>
                    Butuh bantuan? <a href="mailto:support@sajakvisual.com">Hubungi Kami</a>
                </div>
            </div>
        </div>
    </body>
    </html>`;

    const data_email = {
      subject: 'Pembayaran Berhasil - ' + orderInfo.no_invoice,
      message: email_message,
      destination: orderInfo.email,
      attachments: [
        {
          filename: 'logo_sajakvisual.webp',
          path: path.join(process.cwd(), 'src', 'public', 'img', 'logo_sajakvisual.webp'),
          cid: 'logo_sajakvisual',
        },
      ],
    };
    send_email(data_email);
    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  captureData,
  validateData,
  getPrice,
  createCheckout,
  sendEmail,
  handlePaymentCallback,
  sendEmailSuccess,
};
