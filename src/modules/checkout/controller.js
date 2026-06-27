import service from './service.js';

//Render Checkout Page
export const renderCheckoutPage = async (req, res) => {
  try {
    res.render('checkout/views/checkout.ejs');
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
    //send invoice to email
    data = await service.sendEmail(data);
    res.json({
      status: 200,
      success: true,
      message: 'Checkout berhasil',
      data: data.no_invoice,
    });
  } catch (error) {
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//Handle Payment Call Back
export const handlePaymentCallback = async (req, res) => {
  try {
    //handle payment callback
    let data = await service.handlePaymentCallback(req.body);
    //Send Email Success to user
    await service.sendEmailStatus(data);
    res.json({
      status: 200,
      success: true,
      message: 'Payment callback berhasil',
    });
  } catch (error) {
    return res.json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
