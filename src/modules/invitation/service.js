import supabase from '../../../database/supabase.js';

const getInformationBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('invitation_information')
    .select('*')
    .eq('slug', slug);
  if (error) throw error;
  return data;
};

export default { getInformationBySlug };
