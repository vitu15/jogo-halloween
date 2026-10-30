import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Configuração lida do ambiente, com padrões para desenvolvimento local.
 */
export const config = Object.freeze({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  cardsFile: path.resolve(process.env.CARDS_FILE ?? path.join(projectRoot, 'shared/data/cards.json')),
  staticDir: path.resolve(process.env.STATIC_DIR ?? path.join(projectRoot, 'frontend/dist')),
});
