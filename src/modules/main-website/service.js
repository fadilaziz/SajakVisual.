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

export default {
  getAllTemplates,
};
