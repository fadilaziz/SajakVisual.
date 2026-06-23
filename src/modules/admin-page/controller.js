//render login page
export const renderLogin = async (req, res) => {
  try {
    res.render('admin-page/views/login-page.ejs');
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
  try {
    console.log(req);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
