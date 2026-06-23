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

//Get payment data from orders database
const getDataPayment = async (invoice) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('no_invoice', invoice)
    .single();
  if (error) {
    throw Error('Gagal mengambil data pembayaran');
  }
  return orders;
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
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Nunito', ui-sans-serif, sans-serif; line-height: 1.6; color: #1a1a1a; background: #f5f5f5; -webkit-font-smoothing: antialiased; margin: 0; padding: 0; }
                .wrapper { width: 100%; background: #f5f5f5; padding: 0; }
                .container { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5; overflow: hidden; }

                /* Header */
                .header { background: #ffffff; border-bottom: 1px solid #e5e5e5; text-align: center; padding: 20px 16px; }
                .logo-img { height: 32px; width: auto; max-width: 100%; display: block; margin: 0 auto; outline: none; text-decoration: none; }

                .content { padding: 24px 16px; }

                /* Status badge */
                .status-badge {
                    display: inline-block;
                    padding: 6px 14px;
                    background: #f5f5f5;
                    color: #1a1a1a;
                    border: 1px solid #e5e5e5;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 24px;
                }

                .greeting { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
                .subtext { font-size: 14px; color: #737373; margin-bottom: 24px; }

                /* Invoice info box */
                .invoice-box { background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 8px; padding: 0 16px; margin-bottom: 24px; width: 100%; box-sizing: border-box; }
                .info-row { padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; }
                .info-row:last-child { border-bottom: none; }
                .info-label { color: #737373; margin-bottom: 4px; font-size: 12px; display: block; }
                .info-value { font-weight: 700; color: #1a1a1a; display: block; word-break: break-word; }
                .info-value-danger { font-weight: 700; color: #1a1a1a; display: block; }

                /* Product table */
                .product-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                .product-table-header-left { text-align: left; font-size: 12px; color: #737373; text-transform: uppercase; font-weight: 700; padding-bottom: 12px; border-bottom: 1px solid #e5e5e5; }
                .product-table-header-right { text-align: right; font-size: 12px; color: #737373; text-transform: uppercase; font-weight: 700; padding-bottom: 12px; border-bottom: 1px solid #e5e5e5; }
                .product-table-cell { padding: 16px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top; }
                .product-name { font-weight: 700; font-size: 15px; color: #1a1a1a; margin-bottom: 4px; }
                .product-sub { font-size: 13px; color: #737373; }
                .product-price { font-weight: 700; font-size: 15px; color: #1a1a1a; text-align: right; white-space: nowrap; padding: 16px 0 16px 12px; vertical-align: top; }

                /* Total */
                .total-section { background: #1b1b1b; color: #fafafa; border-radius: 8px; margin-bottom: 24px; width: 100%; border-collapse: collapse; overflow: hidden; }
                .total-label { font-size: 14px; color: rgba(250,250,250,0.7); padding: 16px; }
                .total-amount { font-size: 20px; font-weight: 800; color: #fafafa; text-align: right; padding: 16px; }

                /* Button */
                .btn-primary {
                    display: block;
                    width: 100%;
                    text-align: center;
                    background: #1b1b1b;
                    color: #fafafa;
                    text-decoration: none;
                    padding: 14px 0;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    margin-bottom: 20px;
                    box-sizing: border-box;
                }

                .note { font-size: 12px; color: #737373; text-align: center; font-style: italic; }

                /* Footer */
                .footer { text-align: center; padding: 24px 16px; font-size: 12px; color: #737373; background: #fafafa; border-top: 1px solid #e5e5e5; line-height: 1.8; }
                .footer a { color: #1a1a1a; text-decoration: none; font-weight: 600; }

                /* Mobile Responsiveness */
                @media only screen and (max-width: 600px) {
                    .container { border-left: none; border-right: none; }
                }
            </style>
        </head>
        <body style="background-color: #f5f5f5; margin: 0; padding: 0;">
            <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; margin: 0; padding: 0;">
            <tr><td align="center">
            <table class="container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">

                <!-- Header / Logo -->
                <tr>
                    <td class="header" style="padding: 20px 16px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                        <img src="cid:logo_sajakvisual" alt="SajakVisual" class="logo-img">
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td class="content" style="padding: 24px 16px;">
                        <div style="text-align: center;">
                            <span class="status-badge">Menunggu Pembayaran</span>
                        </div>

                        <p class="greeting">Halo, ${data.nama}</p>
                        <p class="subtext">Pesanan Anda telah kami terima. Silakan selesaikan pembayaran untuk mengaktifkan layanan Anda.</p>

                        <!-- Invoice Info -->
                        <div class="invoice-box">
                            <div class="info-row">
                                <div class="info-label">Nomor Invoice</div>
                                <div class="info-value">${data.no_invoice}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">Metode Pembayaran</div>
                                <div class="info-value">QRIS / Transfer Bank</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">Batas Waktu Pembayaran</div>
                                <div class="info-value-danger">${new Date(data.expired_at).toLocaleString('id-ID')}</div>
                            </div>
                        </div>

                        <!-- Product -->
                        <table class="product-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <thead>
                                <tr>
                                    <th class="product-table-header-left">Detail Pesanan</th>
                                    <th class="product-table-header-right">Harga</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="product-table-cell">
                                        <div class="product-name">Template #${data.template_id}</div>
                                        <div class="product-sub">Layanan Undangan Digital</div>
                                    </td>
                                    <td class="product-price">${formatRupiah(data.jumlah_total)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Total -->
                        <table class="total-section" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #1b1b1b; border-radius: 8px;">
                            <tr>
                                <td class="total-label" style="padding: 16px;">Total Pembayaran</td>
                                <td class="total-amount" style="padding: 16px; text-align: right;">${formatRupiah(data.jumlah_total)}</td>
                            </tr>
                        </table>

                        <a href="http://localhost:3000/payment?invoice=${data.no_invoice}" class="btn-primary">Bayar Sekarang</a>

                        <p class="note">Pesanan Anda akan diproses otomatis setelah pembayaran berhasil dikonfirmasi.</p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td class="footer" style="padding: 24px 16px; text-align: center; background: #fafafa; border-top: 1px solid #e5e5e5;">
                        &copy; 2026 <strong>SajakVisual</strong> &mdash; SaaS Digital Invitation.<br>
                        Butuh bantuan? Hubungi kami di <a href="mailto:support@sajakvisual.com" style="color: #1a1a1a; font-weight: 600;">support@sajakvisual.com</a>
                    </td>
                </tr>

            </table>
            </td></tr>
            </table>
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

export default {
  captureData,
  validateData,
  getPrice,
  createCheckout,
  getDataPayment,
  sendEmail,
};
