import express from 'express';
const router = express.Router();
import {
  renderMainPage,
  renderTransactionPage,
  renderHelpPage,
  renderDataTemplates,
} from './controller.js';

//Router render page
router.get('/', renderMainPage);
router.get('/transaksi', renderTransactionPage);
router.get('/bantuan', renderHelpPage);
//Route Data
router.get('/templates', renderDataTemplates);

export default router;
