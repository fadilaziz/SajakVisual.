import service from './service.js';

export const getForm = async (req, res) => {
  try {
    const invoice = req.params.invoice;
    const token = req.query.token;

    if (!token && !invoice) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Token or invoice not found',
      });
    }

    const dataDummyJson = {
      status: 'pending',
      slug: '',
      pria_nama_lengkap: 'Romeo Motague',
      pria_nama_panggilan: 'Romeo',
      pria_ayah: 'Bpk. Romeo',
      pria_ibu: 'Ibu. Romeo',
      wanita_nama_lengkap: 'Juliet Cpulet',
      wanita_nama_panggilan: 'Juliet',
      wanita_ayah: 'Bpk. Juliet',
      wanita_ibu: 'Ibu Juliet',
      countdown_target: '2026-08-28T19:00:00+00:00',
    };

    const finalInsertData = {
      ...dataDummyJson,
      invoice_order: invoice,
    };

    //Save invoice data to supabase
    let data = await service.saveInvoiceData(finalInsertData);

    //Get information data by invoice
    data = await service.getInformationData(data);

    res.render('form/views/form.ejs', { undangan: data });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//Edit invitation data
export const formEdit = async (req, res) => {
  const invitationData = JSON.parse(req.body.data_undangan);
  try {
    //Retrieve photo data, if available.
    const fileCover = req.files ? req.files.find((file) => file.fieldname === 'foto_cover') : null;
    const fileGaleri = req.files
      ? req.files.filter((file) => file.fieldname === 'foto_galeri')
      : [];

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
    console.log(payload);
    //Update information invitation data
    await service.updateInvitationData(payload);

    //Assign invitation id to event data
    const idUndangan = invitationData.id;
    const dataAcaraDariFrontend = invitationData.wedding_events;
    const invitationFinalData = dataAcaraDariFrontend.map((acara) => {
      return {
        ...acara,
        invitation_id: idUndangan,
      };
    });
    console.log(invitationFinalData);
    await service.updateEventData(invitationFinalData, idUndangan);

    const oldGaleri = invitationData.galeri_lama;

    //Save photo data if available
    let data = await service.savePhotoData(fileCover, fileGaleri, oldGaleri);

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
