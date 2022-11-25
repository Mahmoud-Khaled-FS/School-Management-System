import { Router } from 'express';

const routes = Router();

routes.get('/', (_, res) => {
  return res.status(200).send('Welcome');
});

export default routes;
