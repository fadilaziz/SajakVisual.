import supabase from '../../../database/supabase.js';
import crypto from 'crypto';

//Ambil data template dari Supabase
const getAllTemplates = async () => {
  const { data: template, error } = await supabase
    .from('templates')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return template;
};

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

    return dataOrder.no_invoice;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//Send invoice to user email
export const checkout_send_queue = async (payload) => {
  console.log('ini queue', payload);
  //Ambil data products
  const product_data = await sql`
    SELECT product_name
    FROM products
    WHERE id = ${payload.product_id}`;
  payload.product_name = product_data[0].product_name;

  //Mengambil data user
  const user_data = await sql`
    SELECT full_name, email
    FROM users
    WHERE id = ${payload.user_id}`;
  payload.full_name = user_data[0].full_name;
  payload.email = user_data[0].email;

  //Mengambil id order
  const order_id = await sql`
    SELECT id
    FROM orders
    WHERE order_id = ${payload.no_invoice}`;
  payload.order_id = order_id[0].id;

  console.log('ini order id', payload.order_id);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  //Send Email
  const email_message = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Nunito', ui-sans-serif, sans-serif; line-height: 1.6; color: #1a1a1a; background: #f5f5f5; }
                .wrapper { padding: 24px 16px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px; overflow: hidden; }

                /* Header */
                .header { background: #ffffff; border-bottom: 1px solid #e5e5e5; text-align: center; }
                .logo-text {
                    font-size: 22px;
                    font-weight: 800;
                    color: #1b1b1b;
                    letter-spacing: -0.5px;
                }

                .content { padding: 32px 30px; }

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
                .subtext { font-size: 14px; color: #737373; margin-bottom: 28px; }

                /* Invoice info box */
                .invoice-box { background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 10px; padding: 0 20px; margin-bottom: 28px; }
                .info-row { padding: 14px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; }
                .info-row:last-child { border-bottom: none; }
                .info-label { color: #737373; margin-bottom: 4px; font-size: 12px; }
                .info-value { font-weight: 700; color: #1a1a1a; }
                .info-value-danger { font-weight: 700; color: #1a1a1a; }

                /* Product table */
                .product-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                .product-table-header-left { text-align: left; font-size: 12px; color: #737373; text-transform: uppercase; font-weight: 700; padding-bottom: 12px; border-bottom: 1px solid #e5e5e5; }
                .product-table-header-right { text-align: right; font-size: 12px; color: #737373; text-transform: uppercase; font-weight: 700; padding-bottom: 12px; border-bottom: 1px solid #e5e5e5; }
                .product-table-cell { padding: 16px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top; }
                .product-name { font-weight: 700; font-size: 15px; color: #1a1a1a; margin-bottom: 4px; }
                .product-sub { font-size: 13px; color: #737373; }
                .product-price { font-weight: 700; font-size: 15px; color: #1a1a1a; text-align: right; white-space: nowrap; padding: 16px 0; vertical-align: top; }

                /* Total */
                .total-section { background: #1b1b1b; color: #fafafa; padding: 20px 24px; border-radius: 10px; margin-bottom: 28px; }
                .total-label { font-size: 14px; color: rgba(250,250,250,0.7); }
                .total-amount { font-size: 22px; font-weight: 800; color: #fafafa; text-align: right; }

                /* Button */
                .btn-primary {
                    display: block;
                    width: 100%;
                    text-align: center;
                    background: #1b1b1b;
                    color: #fafafa;
                    text-decoration: none;
                    padding: 14px 0;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    margin-bottom: 20px;
                }

                .note { font-size: 12px; color: #737373; text-align: center; font-style: italic; }

                /* Footer */
                .footer { text-align: center; padding: 24px 30px; font-size: 13px; color: #737373; background: #fafafa; border-top: 1px solid #e5e5e5; line-height: 1.8; }
                .footer a { color: #1a1a1a; text-decoration: none; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="wrapper">
            <div class="container">

                <!-- Header / Logo -->
                <table class="header" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding: 20px 30px;">
                            <span class="logo-text">Sajak<span style="color: #737373;">Visual</span></span>
                        </td>
                    </tr>
                </table>

                <!-- Content -->
                <div class="content">
                    <div style="text-align: center;">
                        <span class="status-badge">Menunggu Pembayaran</span>
                    </div>

                    <p class="greeting">Halo, \${payload.full_name}</p>
                    <p class="subtext">Pesanan Anda telah kami terima. Silakan selesaikan pembayaran untuk mengaktifkan layanan Anda.</p>

                    <!-- Invoice Info -->
                    <div class="invoice-box">
                        <div class="info-row">
                            <div class="info-label">Nomor Invoice</div>
                            <div class="info-value">\${payload.no_invoice}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Metode Pembayaran</div>
                            <div class="info-value">QRIS / Transfer Bank</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Batas Waktu Pembayaran</div>
                            <div class="info-value-danger">\${payload.expired_at}</div>
                        </div>
                    </div>

                    <!-- Product -->
                    <table class="product-table" cellpadding="0" cellspacing="0" border="0">
                        <thead>
                            <tr>
                                <th class="product-table-header-left">Detail Pesanan</th>
                                <th class="product-table-header-right">Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="product-table-cell">
                                    <div class="product-name">\${payload.product_name}</div>
                                    <div class="product-sub">Layanan Undangan Digital</div>
                                </td>
                                <td class="product-price">\${formatRupiah(payload.price)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Total -->
                    <table class="total-section" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td class="total-label">Total Pembayaran</td>
                            <td class="total-amount">\${formatRupiah(payload.total_amount)}</td>
                        </tr>
                    </table>
                    
                    <a href="\${process.env.BASE_URL}/payment?invoice=\${payload.no_invoice}" class="btn-primary">Bayar Sekarang</a>

                    <p class="note">Pesanan Anda akan diproses otomatis setelah pembayaran berhasil dikonfirmasi.</p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    &copy; 2026 <strong>SajakVisual</strong> &mdash; SaaS Digital Invitation.<br>
                    Butuh bantuan? Hubungi kami di <a href="mailto:support@sajakvisual.com">support@sajakvisual.com</a>
                </div>

            </div>
            </div>
        </body>
        </html>`;

  return payload;
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

export default {
  getAllTemplates,
  captureData,
  validateData,
  getPrice,
  createCheckout,
  getDataPayment,
};
