import express from 'express';
const router = express.Router();
import { renderTemplate, getDataInvitation } from './controller.js';

//Get data invitation
router.get('/data-invitation', getDataInvitation);

//Render template
router.get('/:slug', renderTemplate);

export default router;
