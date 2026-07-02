import supabase from '../../../database/supabase.js';

const saveInvoiceData = async (finalInsertData) => {
  try {
    const { data: existingData } = await supabase
      .from('invitation_information')
      .select('id')
      .eq('invoice_order', finalInsertData.invoice_order)
      .maybeSingle();

    if (existingData) {
      console.log('Data sudah ada di database, lewati proses insert');
      return finalInsertData.invoice_order;
    }

    const { error } = await supabase.from('invitation_information').insert(finalInsertData);

    if (error) {
      console.error('Gagal menyimpan data:', error);
      return { error: error.message };
    }

    return finalInsertData.invoice_order;
  } catch (error) {
    console.error('Gagal menyimpan data:', error);
    return { error: error.message };
  }
};

const getInformationData = async (invoice) => {
  if (!invoice) {
    throw new Error('Invoice tidak ada');
  }
  try {
    const { data: undanganData, error } = await supabase
      .from('invitation_information')
      .select(
        `
    *,
    wedding_events (*),
    wedding_galleries (*)
  `
      )
      .eq('invoice_order', invoice)
      .maybeSingle();

    console.log(invoice);

    if (error || !undanganData) {
      console.error('Gagal menarik data atau token tidak valid:', error);
    }

    return undanganData;
  } catch (error) {
    throw error;
  }
};

//Update information data
const updateInvitationData = async (data) => {
  try {
    const { data: updatedData, error } = await supabase
      .from('invitation_information')
      .update(data)
      .eq('invoice_order', data.invoice_order);

    if (error) {
      console.error('Gagal memperbarui data:', error);
      return { error: error.message };
    }

    return updatedData;
  } catch (error) {
    throw error;
  }
};

//Update event data
const updateEventData = async (data, id) => {
  try {
    const { error: errDelete } = await supabase
      .from('wedding_events')
      .delete()
      .eq('invitation_id', id);

    if (errDelete) throw errDelete;

    const { error: errInsert } = await supabase
      .from('wedding_events')
      .insert(data)
      .eq('invitation_id', id);

    if (errInsert) throw errInsert;

    console.log('data berhasil di perbarui');

    return;
  } catch (error) {
    throw error;
  }
};

//Save photo Data
import { savePhoto } from '../../helpers/save_photo.js';
const savePhotoData = async (fileCover, fileGaleri, oldGaleri) => {
  let coverUrl = null;
  const galeriUrls = [];

  console.log(oldGaleri);

  //Upload photo data if exists
  if (fileCover) {
    coverUrl = await savePhoto(fileCover, 'cover');
  }

  if (fileGaleri.length > 0) {
    for (const file of fileGaleri) {
      const galeriUrl = await savePhoto(file, 'galeri');
      galeriUrls.push(galeriUrl);
    }
  }

  const mergeGaleri = [...oldGaleri, ...galeriUrls];
  console.log(mergeGaleri);

  const urlPhoto = {
    cover: coverUrl,
    galeri: mergeGaleri,
  };

  return urlPhoto;
};

const saveUrlPhoto = async (data, id) => {
  console.log('ini data galeri', data);
  try {
    if (!data.galeri || data.galeri.length === 0) {
      console.log('Tidak ada foto baru yang diupload. Melewati update galeri...');
      return;
    }
    const finalGaleri = data.galeri.map((fileName) => {
      return { foto_url: fileName, invitation_id: id };
    });

    const { error: errDelete } = await supabase
      .from('wedding_galleries')
      .delete()
      .eq('invitation_id', id);

    if (errDelete) throw errDelete;

    const { error: errInsert } = await supabase.from('wedding_galleries').insert(finalGaleri);

    if (errInsert) throw errInsert;

    console.log('data berhasil di perbarui');

    return data;
  } catch (error) {}
};

const saveUrlPhotoCover = async (data, id) => {
  console.log('ini data cover', data);
  try {
    if (!data.cover || data.cover.length === 0) {
      console.log('Tidak ada foto baru yang diupload. Melewati update galeri...');
      return;
    }

    const { error: errUpdate } = await supabase
      .from('invitation_information')
      .update({ foto_cover: data.cover })
      .eq('id', id);

    if (errUpdate) throw errUpdate;

    console.log('data berhasil di perbarui');

    return;
  } catch (error) {
    console.error('Gagal memperbarui data:', error);
    throw error;
  }
};

export default {
  saveInvoiceData,
  getInformationData,
  updateInvitationData,
  updateEventData,
  savePhotoData,
  saveUrlPhoto,
  saveUrlPhotoCover,
};
