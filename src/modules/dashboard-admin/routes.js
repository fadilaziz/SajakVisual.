import express from 'express';
const router = express.Router();
import { renderDashboard } from './controller.js';

//Route render
router.get('/dashboard', renderDashboard);

//API routes

export default router;
