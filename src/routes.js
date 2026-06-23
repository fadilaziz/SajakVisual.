import express from 'express';
const routes = express.Router();

import apiRoutes from './modules/main-website/routes.js';
import mainRoutes from './modules/main-website/routes.js';
import invitationRoutes from './modules/invitation/router.js';
import adminRoutes from './modules/admin-page/routes.js';
import adminApiRoutes from './modules/admin-page/routes.js';

//Main Page Routes
routes.use('/', mainRoutes);

//Data Routes
routes.use('/api', apiRoutes);

//Invitation Routes
routes.use('/undangan', invitationRoutes);

//Admin Page Routes
routes.use('/admin', adminRoutes);
routes.use('/api/admin', adminApiRoutes);

export default routes;
