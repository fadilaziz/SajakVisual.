import express from 'express';
const router = express.Router();
import { getForm, formEdit } from './controller.js';

//Render form invitation
router.get('/form', getForm);

//Handle submit form
router.post('/edit', formEdit);

export default router;
