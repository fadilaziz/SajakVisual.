import supabase from '../../../database/supabase.js';

export const requireAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ message: 'Sesi habis, silakan login kembali.' });
  }

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  });

  next();
};

export const checkSession = async (req, res, next) => {
  const token = req.cookies.admin_token;

  if (!token) {
    console.log('Akses ditolak: Tidak ada sesi.');
    return res.redirect('/auth/login');
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('Akses ditolak: Token tidak valid.');
      res.clearCookie('admin_token');
      return res.redirect('/auth/login');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Error saat cek sesi:', err);
    res.clearCookie('admin_token');
    return res.redirect('/auth/login');
  }
};
