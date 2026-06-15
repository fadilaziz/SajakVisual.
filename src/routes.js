import express from 'express';
const routes = express.Router();

import apiRoutes from './modules/main-website/routes.js';
import mainRoutes from './modules/main-website/routes.js';
import invitationRoutes from './modules/invitation/router.js';

//Main Page Routes
routes.use('/', mainRoutes);

//Data Routes
routes.use('/api', apiRoutes);

//Invitation Routes
routes.use('/undangan', invitationRoutes);

export default routes;
