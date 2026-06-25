import service from '../dashboard-admin/service.js';

//Render dashboard page
export const renderDashboard = async (req, res) => {
  try {
    res.render('dashboard-admin/views/dashboard.ejs');
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//Render pesanan page
export const renderOrdersPage = async (req, res) => {
  try {
    res.render('dashboard-admin/views/pesanan.ejs');
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//Get all data orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await service.getAllOrders();
    return res.status(200).json({
      status: 200,
      success: true,
      message: 'All orders fetched successfully',
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
