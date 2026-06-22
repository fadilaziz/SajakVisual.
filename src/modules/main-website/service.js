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

export default {
  getAllTemplates,
  captureData,
  validateData,
  getPrice,
  createCheckout,
};
