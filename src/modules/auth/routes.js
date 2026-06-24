import express from 'express';
const router = express.Router();
import { renderLogin, loginAdmin, logoutAdmin, checkSession } from './controller.js';

//Route render
router.get('/login', renderLogin);

//API routes
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/session-check', checkSession);

export default router;
