import supabase from '../../../database/supabase.js';
import crypto from 'crypto';
import { send_email } from '../email/send_email.js';
import path from 'path';

//Get all data templates from supabase
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

//Get data transaction check from supabase
const transectionCheck = async (no_invoice) => {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      no_invoice,
      nama,
      email,
      no_wa,
      template_id,
      status,
      jumlah_total,
      qris_url,
      qris_image,
      created_at,
      expired_at,
      tanggal,
      templates (
        id,
        nama_template,
        kategori,
        harga,
        slug,
        sample_preview
      )
      `
    )
    .eq('no_invoice', no_invoice)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export default {
  getAllTemplates,
  transectionCheck,
  transectionCheck,
};
