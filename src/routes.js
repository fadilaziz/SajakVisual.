import express from 'express';
const routes = express.Router();

import apiRoutes from './modules/main-website/routes.js';
import mainRoutes from './modules/main-website/routes.js';
import invitationRoutes from './modules/invitation/router.js';
import adminRoutes from './modules/auth/routes.js';
import adminRoutesDashboard from './modules/dashboard-admin/routes.js';
import adminApiRoutes from './modules/auth/routes.js';
import checkoutRoutes from './modules/checkout/routes.js';

//Main Page Routes
routes.use('/', mainRoutes);

//Checkout Page Routes
routes.use('/', checkoutRoutes);
//Checkout data routes
routes.use('/api', checkoutRoutes);

//Data Routes
routes.use('/api', apiRoutes);

//auth router
routes.use('/auth', adminRoutes);
routes.use('/api/auth', adminApiRoutes);

//Admin page router
routes.use('/admin', adminRoutesDashboard);

//Invitation Routes
routes.use('/undangan', invitationRoutes);

export default routes;
