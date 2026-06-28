export const getForm = async (req, res) => {
  try {
    res.render('form/views/form.ejs');
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const formEdit = async (req, res) => {
  try {
    res.render('form/views/index.ejs');
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
