import express from 'express';
const router = express.Router();
import { renderMainPage, renderTransaksiPage, renderBantuanPage } from './controller.js';

router.get('/', renderMainPage);
router.get('/transaksi', renderTransaksiPage);
router.get('/bantuan', renderBantuanPage);

export default router;
