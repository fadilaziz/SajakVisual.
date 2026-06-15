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

export default { getAllTemplates };
