import service from './service.js';

// Helper: ambil & siapkan data undangan
async function fetchUndangan(invoice) {
  //Generate Dinamis Slug
  const dinamisSlug = `draft-${Date.now()}`;
  const dataDummy = {
    status: 'pending',
    slug: dinamisSlug,
    pria_nama_lengkap: 'Romeo Motague',
    pria_nama_panggilan: 'Romeo',
    pria_ayah: 'Bpk. Romeo',
    pria_ibu: 'Ibu. Romeo',
    wanita_nama_lengkap: 'Juliet Capulet',
    wanita_nama_panggilan: 'Juliet',
    wanita_ayah: 'Bpk. Juliet',
    wanita_ibu: 'Ibu Juliet',
    countdown_target: '2026-08-28T19:00:00+00:00',
  };
  const finalData = { ...dataDummy, invoice_order: invoice };
  let data = await service.saveInvoiceData(finalData);
  data = await service.getInformationData(data);
  return data;
}

// Redirect /form/:invoice → /form/:invoice/edit
export const getForm = (req, res) => {
  res.redirect(`/form/${req.params.invoice}/edit`);
};

// Edit Page
export const getEdit = async (req, res) => {
  try {
    res.render('form/views/edit.ejs', { undangan: { invoice_order: req.params.invoice } });
  } catch (error) {
    console.log(error);
    res.json({ status: 500, success: false, message: error.message || 'Internal server error' });
  }
};

// Get Invitation Data
export const getFormData = async (req, res) => {
  try {
    const data = await fetchUndangan(req.params.invoice);
    res.json({ status: 200, success: true, data });
  } catch (error) {
    console.log(error);
    res.json({ status: 500, success: false, message: error.message || 'Internal server error' });
  }
};

// Preview Page
export const getPreview = async (req, res) => {
  try {
    const data = await fetchUndangan(req.params.invoice);
    res.render('form/views/preview.ejs', { undangan: data });
  } catch (error) {
    console.log(error);
    res.json({ status: 500, success: false, message: error.message || 'Internal server error' });
  }
};

// Send Invitation Page
export const getKirim = async (req, res) => {
  try {
    const data = await fetchUndangan(req.params.invoice);
    res.render('form/views/kirim.ejs', { undangan: data });
  } catch (error) {
    console.log(error);
    res.json({ status: 500, success: false, message: error.message || 'Internal server error' });
  }
};

//Edit invitation data
export const formEdit = async (req, res) => {
  const invitationData = JSON.parse(req.body.data_undangan);
  try {
    //Retrieve photo data, if available.
    const fileCover = req.files ? req.files.find((file) => file.fieldname === 'foto_cover') : null;
    const fileFotoPria = req.files
      ? req.files.find((file) => file.fieldname === 'foto_pria')
      : null;
    const fileFotoWanita = req.files
      ? req.files.find((file) => file.fieldname === 'foto_wanita')
      : null;
    const fileGaleri = req.files
      ? req.files.filter((file) => file.fieldname === 'foto_galeri')
      : [];

    console.log('ini data invitation', invitationData);
    //Ganerate slug from name
    const slug = `${invitationData.pria_nama_panggilan}-${invitationData.wanita_nama_panggilan}`;

    //Capture payload to be sent to the database
    const payload = {
      template_id: invitationData.template_id,
      slug: slug,
      status: invitationData.status,
      pria_nama_lengkap: invitationData.pria_nama_lengkap,
      pria_nama_panggilan: invitationData.pria_nama_panggilan,
      pria_ayah: invitationData.pria_ayah,
      pria_ibu: invitationData.pria_ibu,
      wanita_nama_lengkap: invitationData.wanita_nama_lengkap,
      wanita_nama_panggilan: invitationData.wanita_nama_panggilan,
      wanita_ayah: invitationData.wanita_ayah,
      wanita_ibu: invitationData.wanita_ibu,
      countdown_target: invitationData.countdown_target,
      invoice_order: invitationData.invoice_order,
    };

    //Update information invitation data
    await service.updateInvitationData(payload);

    //Save LoveStory Data
    const loveStoryData = invitationData.love_story;
    await service.saveLoveStoryData(loveStoryData, invitationData.id);

    //Assign invitation id to event data
    const idUndangan = invitationData.id;
    const dataAcaraDariFrontend = invitationData.wedding_events;
    const invitationFinalData = dataAcaraDariFrontend.map((acara) => {
      return {
        ...acara,
        invitation_id: idUndangan,
      };
    });

    //Update event data
    await service.updateEventData(invitationFinalData, idUndangan);

    const oldGaleri = invitationData.galeri_lama;

    //Save photo data if available
    let data = await service.savePhotoData(
      fileCover,
      fileFotoPria,
      fileFotoWanita,
      fileGaleri,
      oldGaleri,
      invitationData.foto_cover_lama,
      invitationData.foto_pria_lama,
      invitationData.foto_wanita_lama
    );

    //Save url photo galeri
    data = await service.saveUrlPhoto(data, idUndangan);

    //Save url photo cover
    data = await service.saveUrlPhotoCover(data, idUndangan);

    return res.json({
      status: 200,
      success: true,
      message: 'Data berhasil diupdate',
      data: slug,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
