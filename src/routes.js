import express from 'express';
const routes = express.Router();

import apiRoutes from './modules/main-website/routes.js';
import mainRoutes from './modules/main-website/routes.js';
import invitationRoutes from './modules/invitation/router.js';
import adminRoutes from './modules/auth/routes.js';
import dashboardRoutes from './modules/dashboard-admin/routes.js';
import adminApiRoutes from './modules/auth/routes.js';
import checkoutRoutes from './modules/checkout/routes.js';
import paymentRoutes from './modules/payment/routes.js';
import transectionCheckRoutes from './modules/main-website/routes.js';

//Main Page Routes
routes.use('/', mainRoutes);

//Checkout Routes
routes.use('/', checkoutRoutes);
routes.use('/api', checkoutRoutes);

//Data Routes
routes.use('/api', apiRoutes);

//Payment Routes
routes.use('/', paymentRoutes);
routes.use('/api/', paymentRoutes);

//Auth router
routes.use('/auth', adminRoutes);
routes.use('/api/auth', adminApiRoutes);

//Dashboard routes
routes.use('/admin', dashboardRoutes);
routes.use('/api', dashboardRoutes);

//Invitation Routes
routes.use('/undangan', invitationRoutes);

//Transection Check
routes.use('/api/transection', transectionCheckRoutes);

export default routes;
