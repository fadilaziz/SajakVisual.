import express from 'express';
const router = express.Router();
import { renderTemplate, getDataInvitation, renderPublicTemplate } from './controller.js';

//Get data invitation
router.get('/data-invitation', getDataInvitation);

//Render template
router.get('/preview/:slug', renderTemplate);

//Render publix version
router.get('/:slug', renderPublicTemplate);

export default router;
