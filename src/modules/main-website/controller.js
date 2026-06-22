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

//Handle Post Data Checkout
export const handleCheckout = async (req, res) => {
  try {
    const { title, price, name, email, wa } = req.body;
    //Capture data
    let data = await service.captureData(req.body);
    //Validation data
    data = await service.validateData(data);
    //get price from database
    data = await service.getPrice(data);
    //create invoice number
    data = await service.createCheckout(data);
    res.json({
      status: 200,
      success: true,
      message: 'Checkout berhasil',
      data: data,
    });
  } catch (error) {
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//Get data payment
export const handlePayment = async (req, res) => {
  try {
    //Mengangbil data dari search url
    const { invoice } = req.query;
    console.log(invoice);
    let data = await service.getDataPayment(invoice);
    res.json({
      status: 200,
      success: true,
      message: 'Data payment berhasil diambil',
      data: data,
    });
  } catch (error) {
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
