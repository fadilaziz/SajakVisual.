import express from 'express';
const router = express.Router();
import { renderMainPage, renderTransaksiPage, renderBantuanPage, renderCheckoutPage, renderPaymentPage } from './controller.js';

router.get('/', renderMainPage);
router.get('/transaksi', renderTransaksiPage);
router.get('/bantuan', renderBantuanPage);
router.get('/checkout', renderCheckoutPage);
router.get('/payment', renderPaymentPage);

export default router;
