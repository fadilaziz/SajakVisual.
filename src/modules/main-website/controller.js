import service from './service.js';

//Get data Templates
export const renderDataTemplates = async (req, res) => {
  try {
    const template = await service.getAllTemplates();
    return res.json({
      status: 200,
      success: true,
      message: 'Berhasil Mengambil Data',
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Gagal Mengambil Data',
    });
  }
};

//Render Main Page
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

//Render Transaction Page
export const renderTransactionPage = async (req, res) => {
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

//Render Help Page
export const renderHelpPage = async (req, res) => {
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

//Render Checkout Page
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

//Render Payment Page
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
