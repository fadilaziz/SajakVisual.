import express from 'express';
const router = express.Router();
import {
  renderMainPage,
  renderTransactionPage,
  renderHelpPage,
  renderCheckoutPage,
  renderPaymentPage,
  renderDataTemplates,
} from './controller.js';

//Router render page
router.get('/', renderMainPage);
router.get('/transaksi', renderTransactionPage);
router.get('/bantuan', renderHelpPage);
router.get('/checkout', renderCheckoutPage);
router.get('/payment', renderPaymentPage);

//Route Data
router.get('/templates', renderDataTemplates);

export default router;
