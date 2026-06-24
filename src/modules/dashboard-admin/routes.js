import express from 'express';
import { requireAdmin } from '../middleware/authGuard.js';
import { checkSession } from '../middleware/authGuard.js';
const router = express.Router();
import { renderDashboard } from './controller.js';

//Route render
router.get('/dashboard', checkSession, renderDashboard);

router.get('/ping', requireAdmin, (req, res) => {
  res.status(200).json({ status: 'Sesi diperpanjang' });
});

export default router;
