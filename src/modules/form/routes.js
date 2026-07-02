import express from 'express';
import multer from 'multer';

const router = express.Router();
import { getForm, formEdit } from './controller.js';

// Setup multer untuk mengurai FormData (simpan sementara di memory)
const upload = multer({ storage: multer.memoryStorage() });

//Render form invitation
router.get('/form/:invoice', getForm);

//Handle submit form dengan multer
router.post('/edit', upload.any(), formEdit);

export default router;
