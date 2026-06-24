import service from './service.js';

//Render Payment Page
export const renderPaymentPage = async (req, res) => {
  try {
    res.render('payment/views/payment.ejs');
  } catch (error) {
    console.log(error);
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
