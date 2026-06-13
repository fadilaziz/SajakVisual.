import express from 'express';
const routes = express.Router();

import mainRoutes from './modules/main-website/routes.js';

//Main Page Routes
routes.use('/', mainRoutes);

export default routes;
