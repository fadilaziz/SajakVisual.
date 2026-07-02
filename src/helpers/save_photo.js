import supabase from '../../database/supabase.js';

const formatName = (file, folderName) => {
  const fileName = `${folderName}_${Date.now()}_${file.originalname.replace(/\s+/g, '-')}`;
  return fileName;
};

export const savePhoto = async (file, folderName) => {
  const fileName = formatName(file, folderName);
  const { data, error } = await supabase.storage
    .from('SajakVisual_bucket')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    throw error;
  }

  return fileName;
};
