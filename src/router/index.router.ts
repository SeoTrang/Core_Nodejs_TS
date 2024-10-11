import { Express } from 'express';
import endpoint from './endpoint.router';

const route = (app: Express): void => {
  app.use('/', endpoint);
};

export default route;
