import { Router } from 'express';

import { createCardsController } from './cards.controller.js';

/**
 * @param {import('./cards.service.js').CardService} service
 */
export function createCardsRouter(service) {
  const controller = createCardsController(service);
  const router = Router();

  router.get('/', controller.list);
  router.get('/summary', controller.summary);
  router.get('/:id', controller.getById);

  return router;
}
