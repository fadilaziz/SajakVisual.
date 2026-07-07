import supabase from '../../../database/supabase.js';

//Save DummyData Information
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

//Get DummyData Information
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
    orders(template_id),
    wedding_events (*),
    wedding_galleries (*),
    love_story (*),
    present (*)
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
  console.log('ini data invitation', data);
  try {
    const { data: updatedData, error } = await supabase
      .from('invitation_information')
      .update(data)
      .eq('invoice_order', data.invoice_order);

    if (error) {
      console.error('Gagal memperbarui data invitation:', error);
      return { error: error.message };
    }

    console.log('data Invitation berhasil disimpan');

    return updatedData;
  } catch (error) {
    console.log('gagal memperbarui data invitation ', error);
    throw error;
  }
};

//Save Lovestort data
const saveLoveStoryData = async (data, id) => {
  if (data.length === 0) {
    console.log('Tidak ada data love story yang diupload. Melewati update love story...');
    return;
  }

  console.log('ini data lovestory', data);

  const finalLovestory = data.map((item) => {
    return {
      invitation_id: id,
      tahun: item.tahun,
      subtext: item.judul,
      text: item.cerita,
    };
  });

  const { error: errDelete } = await supabase.from('love_story').delete().eq('invitation_id', id);
  if (errDelete) throw errDelete;

  const { error: errInsert } = await supabase
    .from('love_story')
    .insert(finalLovestory)
    .select('id');

  if (errInsert) throw errInsert;
  console.log('data LoveStory berhasil di perbarui');

  return;
};

//Save Present/Gift data
const savePresentData = async (data, id) => {
  // Delete existing present records first
  const { error: errDelete } = await supabase
    .from('present')
    .delete()
    .eq('invitation_id', id);
  if (errDelete) throw errDelete;

  // If the fields are empty, we don't insert a new one
  if (!data || !data.nama_bank || !data.rek) {
    console.log('Tidak ada data bank/rekening yang diisi. Melewati insert...');
    return;
  }

  const finalPresent = {
    invitation_id: id,
    nama_bank: data.nama_bank,
    pemilik: data.pemilik || '-',
    rek: data.rek
  };

  const { error: errInsert } = await supabase
    .from('present')
    .insert(finalPresent);

  if (errInsert) throw errInsert;
  console.log('data Present berhasil diperbarui');

  return;
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
const savePhotoData = async (
  fileCover,
  fileFotoPria,
  fileFotoWanita,
  fileGaleri,
  oldGaleri,
  oldCover = null,
  oldFotoPria = null,
  oldFotoWanita = null
) => {
  let coverUrl = oldCover;
  let priaUrl = oldFotoPria;
  let wanitaUrl = oldFotoWanita;
  const galeriUrls = [];

  //Upload photo data if exists
  if (fileCover) {
    coverUrl = await savePhoto(fileCover, 'cover');
  }

  if (fileFotoPria) {
    priaUrl = await savePhoto(fileFotoPria, 'file_pria');
  }

  if (fileFotoWanita) {
    wanitaUrl = await savePhoto(fileFotoWanita, 'file_wanita');
  }

  if (fileGaleri.length > 0) {
    for (const file of fileGaleri) {
      const galeriUrl = await savePhoto(file, 'galeri');
      galeriUrls.push(galeriUrl);
    }
  }

  const mergeGaleri = [...oldGaleri, ...galeriUrls];

  const urlPhoto = {
    cover: coverUrl,
    file_pria: priaUrl,
    file_wanita: wanitaUrl,
    galeri: mergeGaleri,
  };

  console.log('ini url photo', urlPhoto);

  return urlPhoto;
};

const saveUrlPhoto = async (data, id) => {
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
  console.log('ini data foto', data);
  try {
    if (!data.cover && !data.file_pria && !data.file_wanita) {
      console.log('Tidak ada foto baru yang diupload. Melewati update galeri...');
      return;
    }

    console.log('ini data foto pria dan wanita', data.file_pria, data.file_wanita);

    const { error: errUpdate } = await supabase
      .from('invitation_information')
      .update({ foto_cover: data.cover, foto_pria: data.file_pria, foto_wanita: data.file_wanita })
      .eq('id', id);

    if (errUpdate) throw errUpdate;

    console.log('data berhasil di perbarui');

    return;
  } catch (error) {
    console.error('Gagal memperbarui data savePhoto :', error);
    throw error;
  }
};

export default {
  saveInvoiceData,
  getInformationData,
  updateInvitationData,
  saveLoveStoryData,
  savePresentData,
  updateEventData,
  savePhotoData,
  saveUrlPhoto,
  saveUrlPhotoCover,
};
