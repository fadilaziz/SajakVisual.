import express from 'express';
const router = express.Router();
import { renderCheckoutPage, handleCheckout } from './controller.js';

//Router render page
router.get('/checkout', renderCheckoutPage);

//Route Data
router.post('/checkout', handleCheckout);

export default router;
