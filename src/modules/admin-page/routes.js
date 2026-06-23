import express from 'express';
const router = express.Router();
import { renderLogin, loginAdmin } from './controller.js';

//Route render
router.get('/login', renderLogin);

//API routes
router.post('/login', loginAdmin);

export default router;
