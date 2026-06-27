import express from 'express';
const router = express.Router();
import { renderCheckoutPage, handleCheckout, handlePaymentCallback } from './controller.js';

//Router render page
router.get('/checkout', renderCheckoutPage);

//Route Data
router.post('/checkout', handleCheckout);
router.post('/payment/callback', handlePaymentCallback);

export default router;
