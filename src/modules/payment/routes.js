import express from 'express';
const router = express.Router();
import { renderPaymentPage, handlePayment } from './controller.js';

//Router render page
// router.get('/transaksi', renderTransactionPage);
router.get('/payment', renderPaymentPage);
//Route Data
router.get('/handle-payment', handlePayment);

export default router;
