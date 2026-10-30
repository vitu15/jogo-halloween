import { createApp } from './app.js';
import { config } from './config/env.js';
import { JsonCardRepository } from './modules/cards/cards.repository.js';

const app = createApp({
  cardRepository: new JsonCardRepository(config.cardsFile),
  staticDir: config.staticDir,
});

const server = app.listen(config.port, config.host, () => {
  console.log(`MALDIÇÃO rodando em http://localhost:${config.port} (${config.env})`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
