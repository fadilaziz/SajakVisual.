import express from 'express';
import multer from 'multer';

const router = express.Router();
import { getForm, getEdit, getPreview, getKirim, formEdit, getFormData, ExcelData } from './controller.js';

// Setup multer untuk mengurai FormData (simpan sementara di memory)
const upload = multer({ storage: multer.memoryStorage() });

// Render form invitation (redirects to /edit)
router.get('/form/:invoice', getForm);

// New split routes
router.get('/form/:invoice/edit', getEdit);
router.get('/form/:invoice/preview', getPreview);
router.get('/form/:invoice/kirim', getKirim);

// API to fetch invoice data dynamically (not exposed in HTML inspect)
router.get('/api/form/:invoice/data', getFormData);

// Handle upload excel
router.post('/form/:invoice/excel', upload.single('file'), ExcelData);

// Handle submit form dengan multer
router.post('/edit', upload.any(), formEdit);

export default router;
