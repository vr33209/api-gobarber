import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentsController from './app/controllers/AppointmentsController';

import AuthMiddleares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/user', UserController.create);
routes.post('/sessions', SessionController.create);

routes.use(AuthMiddleares);
routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);
routes.post('/appointments', AppointmentsController.create);

routes.post('/files', upload.single('file'), FileController.create);

export default routes;
