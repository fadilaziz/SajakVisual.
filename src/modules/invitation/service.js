import supabase from '../../../database/supabase.js';

const getAllDataInvitation = async (slug) => {
  const { data, error } = await supabase
    .from('invitation_information')
    .select(
      `
    *,
    templates(*),
    wedding_events (*),
    wedding_galleries (*),
    love_story (*),
    present (*),
    comment (*)
  `
    )
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
};

const saveCommentData = async (nama, ucapan, invitation_id) => {
  const { error: insertError } = await supabase.from('comment').insert({
    invitation_id,
    nama,
    ucapan,
  });
  if (insertError) throw insertError;

  // Get All Comment Data Based on id_invitation
  const { data: getData, error: selectError } = await supabase
    .from('comment')
    .select('*')
    .eq('invitation_id', invitation_id);
  if (selectError) throw selectError;

  return getData;
};

export default { getAllDataInvitation, saveCommentData };
