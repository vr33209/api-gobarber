import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentsController from './app/controllers/AppointmentsController';
import SchenduleController from './app/controllers/SchenduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import AuthMiddleares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/user', UserController.create);
routes.post('/sessions', SessionController.create);

routes.use(AuthMiddleares);
routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);
routes.get('/appointments', AppointmentsController.index);

routes.post('/appointments', AppointmentsController.create);
routes.get('/schendule', SchenduleController.list);
routes.get('/notifications', NotificationController.list);
routes.put('/notifications/:id', NotificationController.update);
routes.delete('/appointments/:id', AppointmentsController.delete);

routes.post('/files', upload.single('file'), FileController.create);

export default routes;
