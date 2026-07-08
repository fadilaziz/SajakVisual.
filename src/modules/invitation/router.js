import express from 'express';
const router = express.Router();
import {
  renderTemplate,
  getDataInvitation,
  renderPublicTemplate,
  saveCommentData,
} from './controller.js';

//Get data invitation
router.get('/data-invitation', getDataInvitation);
router.post('/comment', saveCommentData);

//Render template
router.get('/preview/:slug', renderTemplate);

//Render publix version
router.get('/:slug', renderPublicTemplate);

export default router;
