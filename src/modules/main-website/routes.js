import express from 'express';
const router = express.Router();
import {
  renderMainPage,
  renderTransactionPage,
  renderHelpPage,
  renderCheckoutPage,
  renderPaymentPage,
  renderDataTemplates,
  handleCheckout,
} from './controller.js';

//Router render page
router.get('/', renderMainPage);
router.get('/transaksi', renderTransactionPage);
router.get('/bantuan', renderHelpPage);
router.get('/checkout', renderCheckoutPage);
router.get('/payment', renderPaymentPage);

//Route Data
router.get('/templates', renderDataTemplates);
router.post('/checkout', handleCheckout);

export default router;
