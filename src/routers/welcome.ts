import { Router } from 'express';

const routes = Router();

routes.get('/', (_, res) => {
  return res.status(200).send('Welcome to the School Management System Application');
});

export default routes;
