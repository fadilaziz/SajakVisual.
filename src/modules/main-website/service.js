import supabase from '../../../database/supabase.js';

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
const createCheckout = async (data) => {
  const { title, price, name, email, no_wa } = data;

  return data;
};

//Validation data
const validateData = async (data) => {
  const errors = [];

  console.log(data.no_wa);

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

export default {
  getAllTemplates,
  createCheckout,
  validateData,
  getPrice,
};
