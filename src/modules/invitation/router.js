import express from 'express';
const router = express.Router();
import { renderTemplate, getDataInvitation } from './controller.js';

//get data invitation
router.get('/data-invitation', getDataInvitation);

//render template
router.get('/:slug', renderTemplate);

export default router;
