import { existsSync } from 'node:fs';
import path from 'node:path';

import compression from 'compression';
import express from 'express';
import helmet from 'helmet';

import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { createCardsRouter } from './modules/cards/cards.routes.js';
import { CardService } from './modules/cards/cards.service.js';
import { createHealthRouter } from './modules/health/health.routes.js';

/**
 * Monta a aplicação Express. Recebe as dependências prontas para facilitar testes.
 *
 * @param {{ cardRepository: { findAll: () => Promise<readonly object[]> }, staticDir?: string }} deps
 */
export function createApp({ cardRepository, staticDir }) {
  const app = express();
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // O jogo aplica estilos inline (atributos `style`) nas cartas e efeitos.
          'style-src': ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );
  app.use(compression());

  const api = express.Router();
  api.use('/health', createHealthRouter());
  api.use('/cards', createCardsRouter(new CardService(cardRepository)));
  api.use(notFoundHandler);
  app.use('/api', api);

  if (staticDir && existsSync(staticDir)) {
    app.use(express.static(staticDir, { maxAge: '1h', index: 'index.html' }));
    app.get('/', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
