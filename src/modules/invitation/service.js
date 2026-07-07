import supabase from '../../../database/supabase.js';

const getAllDataInvitation = async (slug) => {
  const { data, error } = await supabase
    .from('invitation_information')
    .select(
      `
    *,
    wedding_events (*),
    wedding_galleries (*),
    love_story (*),
    present (*)
  `
    )
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export default { getAllDataInvitation };
