import service from './service.js';
import path from 'path';
import fs from 'fs';

//render invitation
export const renderTemplate = async (req, res) => {
  try {
    const slug = req.params.slug;

    return res.render(`invitation/views/${slug}.ejs`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//Render publix version
export const renderPublicTemplate = async (req, res) => {
  try {
    const slug = req.params.slug;

    let data = await service.getAllDataInvitation(slug);

    if (!data) {
      return res.status(404).send('Waduh, undangan tidak ditemukan!');
    }

    const akadRaw = data.wedding_events?.find((e) => e.tipe_acara.toLowerCase().includes('akad'));
    const resepsiRaw = data.wedding_events?.find((e) =>
      e.tipe_acara.toLowerCase().includes('resepsi')
    );

    const SUPABASE_BUCKET_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/SajakVisual_bucket/`;

    // Rakit datanya
    const formatUntukTemplate = {
      slug: data.slug || '',
      bg_music: data.bg_music || '',
      foto_cover: data.foto_cover ? SUPABASE_BUCKET_URL + data.foto_cover : '',

      mempelai_pria: {
        nama_lengkap: data.pria_nama_lengkap,
        nama_panggilan: data.pria_nama_panggilan,
        ayah: data.pria_ayah,
        ibu: data.pria_ibu,
        foto: (data.foto_pria || data.pria_foto) ? SUPABASE_BUCKET_URL + (data.foto_pria || data.pria_foto) : '',
      },

      mempelai_wanita: {
        nama_lengkap: data.wanita_nama_lengkap,
        nama_panggilan: data.wanita_nama_panggilan,
        ayah: data.wanita_ayah,
        ibu: data.wanita_ibu,
        foto: (data.foto_wanita || data.wanita_foto) ? SUPABASE_BUCKET_URL + (data.foto_wanita || data.wanita_foto) : '',
      },

      acara: {
        akad: akadRaw
          ? {
              tanggal: akadRaw.tanggal,
              waktu: akadRaw.waktu,
              lokasi_nama: akadRaw.lokasi_nama,
              lokasi_alamat: akadRaw.lokasi_alamat,
              maps_url: akadRaw.maps_url,
            }
          : { tanggal: '', waktu: '', lokasi_nama: '', lokasi_alamat: '', maps_url: '' },

        resepsi: resepsiRaw
          ? {
              tanggal: resepsiRaw.tanggal,
              waktu: resepsiRaw.waktu,
              lokasi_nama: resepsiRaw.lokasi_nama,
              lokasi_alamat: resepsiRaw.lokasi_alamat,
              maps_url: resepsiRaw.maps_url,
            }
          : { tanggal: '', waktu: '', lokasi_nama: '', lokasi_alamat: '', maps_url: '' },

        countdown_target: data.countdown_target ? data.countdown_target.replace('+00:00', '') : '',
      },

      // Sulap Array of Objects jadi Array of Strings
      galeri_foto:
        data.wedding_galleries && data.wedding_galleries.length > 0
          ? data.wedding_galleries.map((g) => SUPABASE_BUCKET_URL + g.foto_url)
          : [],

      // Teruskan data kisah cinta (urutkan tahun jika ada)
      love_story:
        data.love_story && data.love_story.length > 0
          ? data.love_story.sort((a, b) => String(a.tahun).localeCompare(String(b.tahun)))
          : [],

      // Teruskan data rekening untuk fitur kirim hadiah
      rekening:
        data.present && data.present.length > 0
          ? data.present.map((p) => ({
              bank: p.nama_bank,
              nama: p.pemilik,
              nomor: p.rek,
            }))
          : [],
    };

    // console.log('formatUntukTemplate', formatUntukTemplate);

    // 3. RENDER KE TEMPLATE EJS
    // Pastikan path EJS-mu sudah sesuai dengan letak foldernya
    res.render('invitation/views/rustic-elegant.ejs', { data: formatUntukTemplate });
  } catch (error) {
    console.error('Gagal merender undangan:', error);
    // Tampilkan pesan error sederhana di layar pengunjung jika server bermasalah
    return res.status(500).send('Terjadi kesalahan pada server saat memuat undangan.');
  }
};

//get data invitation
export const getDataInvitation = async (req, res) => {
  try {
    const slug = req.query.slug;

    //Read data invitation from JSON file
    let dummyData = path.resolve('src/public/data.json');
    const data = JSON.parse(fs.readFileSync(dummyData, 'utf-8'));

    //Put slug into data invitation
    data.slug = slug;

    //Return data invitation
    return res.status(200).json({
      success: true,
      data: data,
      message: 'Invitation data retrieved successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
