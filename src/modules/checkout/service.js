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

  //3. Validation WA
  const cleanWa = data.no_wa.replace(/[^0-9+]/g, '');
  const waRegex = /^(\+62|62|0)?8[0-9]{8,11}$/;

  if (!waRegex.test(cleanWa)) {
    throw new Error('Nomor WhatsApp tidak valid. Gunakan format 08..., 628..., atau 8...');
  }

  let waFinal = cleanWa;
  if (waFinal.startsWith('+62')) waFinal = waFinal.replace('+62', '62');
  if (waFinal.startsWith('08')) waFinal = waFinal.replace('08', '628');
  if (waFinal.startsWith('8')) waFinal = '62' + waFinal;
  data.no_wa = waFinal;

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

    //3. Error hendling, if API return error
    if (!response.ok) {
      throw new Error(
        'Layanan pembayaran sedang dalam pemeliharaan sistem. silahkan coba beberapa saat lagi'
      );
    }

    //4.chekc if the Klikqris response really JSON
    // const contentType = response.headers.get('content-type');
    // if (!contentType || !contentType.includes('application/json')) {
    //   throw new Error(
    //     'Layanan pembayaran sedang dalam pemeliharaan sistem. silahkan coba beberapa saat lagi'
    //   );
    // }

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
import { emailMessagePending } from '../../helpers/email_messages.js';
export const sendEmail = (data) => {
  if (!data) {
    throw new Error('Data tidak ditemukan');
  }

  let emailMessage = emailMessagePending(data);
  const emailData = {
    subject: 'Detail Pesanan Undangan Digital - ' + data.no_invoice,
    message: emailMessage,
    destination: data.email,
  };
  send_email(emailData);
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

//Send Success and Expired status messages
import {
  emailMessagesSuccess,
  emailMessagesExpired,
  ganerateToken,
} from '../../helpers/email_messages.js';
const sendEmailStatus = async (data) => {
  console.log('Ini adalah fungsi Send email Status');
  try {
    //1. Get order data
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('no_invoice', data.order_id);

    if (error || !orders || orders.length === 0) {
      console.error('Order not found for email notification');
      return;
    }
    let orderData = orders[0];
    let emailMessage;
    console.log('ini Order data dari service', orderData);

    // 2. Send Email Success or Expired
    if (orderData.status === 'SUCCESS') {
      //Ganerate token with token function
      const token = await ganerateToken();
      orderData.token = token;
      emailMessage = emailMessagesSuccess(orderData);
    } else if (orderData.status === 'EXPIRED') {
      emailMessage = emailMessagesExpired(orderData);
    }

    console.log('ini Pesan email', emailMessage);

    const emailData = {
      subject:
        orderData.status === 'SUCCESS'
          ? 'Pesanan Berhasil - ' + orderData.no_invoice
          : 'Pesanan Expired - ' + orderData.no_invoice,
      message: emailMessage,
      destination: orderData.email,
    };
    console.log('ini data email', emailData);
    await send_email(emailData);
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
  sendEmailStatus,
};
