//Main Website Controller
export const renderMainPage = async (req, res) => {
  try {
    res.render('main-website/views/index.ejs');
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const renderTransaksiPage = async (req, res) => {
  try {
    res.render('main-website/views/transaksi.ejs');
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const renderBantuanPage = async (req, res) => {
  try {
    res.render('main-website/views/bantuan.ejs');
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const renderCheckoutPage = async (req, res) => {
  try {
    res.render('main-website/views/checkout.ejs');
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
export const renderPaymentPage = async (req, res) => {
  try {
    res.render('main-website/views/payment.ejs');
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
