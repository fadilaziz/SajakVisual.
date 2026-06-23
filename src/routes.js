import express from 'express';
const routes = express.Router();

import apiRoutes from './modules/main-website/routes.js';
import mainRoutes from './modules/main-website/routes.js';
import invitationRoutes from './modules/invitation/router.js';
import adminRoutes from './modules/auth/routes.js';
import adminRoutesDashboard from './modules/dashboard-admin/routes.js';
import adminApiRoutes from './modules/auth/routes.js';

//Main Page Routes
routes.use('/', mainRoutes);

//Data Routes
routes.use('/api', apiRoutes);

//Invitation Routes
routes.use('/undangan', invitationRoutes);

//Admin Page Routes
routes.use('/admin', adminRoutes);
routes.use('/api/admin', adminApiRoutes);
routes.use('/admin', adminRoutesDashboard);

export default routes;
