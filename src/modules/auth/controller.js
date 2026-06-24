import supabase from '../../../database/supabase.js';

//render login page
export const renderLogin = async (req, res) => {
  try {
    res.render('auth/views/login-page.ejs');
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//Login admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    //Validation email & password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    //If invalid return message to frontend
    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    //Get token access
    const token = data.session.access_token;

    //Set cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000,
    });

    //Redirect to admin page
    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Login berhasil',
      redirect: '/admin/dashboard',
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//Logout Admin
export const logoutAdmin = async (req, res) => {
  //clearing cookie
  try {
    res.clearCookie('admin_token');
    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Logout berhasil',
      redirect: '/auth/login',
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//Check session
export const checkSession = async (req, res) => {
  try {
    const token = req.cookies.admin_token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan',
      });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid',
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Session valid',
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
