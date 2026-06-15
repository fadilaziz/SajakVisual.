import express from 'express';
const router = express.Router();
import { renderModernInvitation } from './controller.js';

router.get('/:slug', renderModernInvitation);

export default router;
