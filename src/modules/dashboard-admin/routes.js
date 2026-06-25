import express from 'express';
import { apiCheckSession, checkSession, requireAdmin } from '../middleware/authGuard.js';
const router = express.Router();
import { renderDashboard, getAllOrders, renderOrdersPage } from './controller.js';

//Route render
router.get('/dashboard', checkSession, renderDashboard);
router.get('/pesanan', checkSession, renderOrdersPage);

router.get('/ping', requireAdmin, (req, res) => {
  res.status(200).json({ status: 'Sesi diperpanjang' });
});

//API Route
router.get('/orders', apiCheckSession, getAllOrders);

export default router;
