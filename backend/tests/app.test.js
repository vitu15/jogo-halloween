import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import request from 'supertest';

import { createApp } from '../src/app.js';
import { config } from '../src/config/env.js';
import { InMemoryCardRepository, JsonCardRepository } from '../src/modules/cards/cards.repository.js';

const CARDS = [
  { id: 'D1', cat: 'desafio', title: 'A' },
  { id: 'Q1', cat: 'pergunta', title: 'B' },
  { id: 'D2', cat: 'desafio', title: 'C' },
];

const app = createApp({ cardRepository: new InMemoryCardRepository(CARDS) });

describe('API', () => {
  it('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.status, 'ok');
  });

  it('GET /api/cards lista todas as cartas', async () => {
    const res = await request(app).get('/api/cards').expect(200);
    assert.equal(res.body.count, 3);
    assert.deepEqual(
      res.body.data.map((card) => card.id),
      ['D1', 'Q1', 'D2'],
    );
  });

  it('GET /api/cards?category= filtra por categoria', async () => {
    const res = await request(app).get('/api/cards?category=desafio').expect(200);
    assert.deepEqual(
      res.body.data.map((card) => card.id),
      ['D1', 'D2'],
    );
  });

  it('GET /api/cards?category= recusa categoria inválida', async () => {
    const res = await request(app).get('/api/cards?category=xpto').expect(400);
    assert.match(res.body.error.message, /Categoria inválida/);
  });

  it('GET /api/cards/summary resume o baralho', async () => {
    const res = await request(app).get('/api/cards/summary').expect(200);
    assert.deepEqual(res.body.data, { total: 3, byCategory: { desafio: 2, pergunta: 1 } });
  });

  it('GET /api/cards/:id retorna a carta ou 404', async () => {
    const res = await request(app).get('/api/cards/Q1').expect(200);
    assert.equal(res.body.data.title, 'B');
    await request(app).get('/api/cards/nope').expect(404);
  });

  it('rotas desconhecidas retornam 404 em JSON', async () => {
    const res = await request(app).get('/api/xyz').expect(404);
    assert.match(res.body.error.message, /Rota não encontrada/);
  });

  it('serve o frontend estático quando o build existe', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'maldicao-'));
    writeFileSync(path.join(dir, 'index.html'), '<h1>MALDIÇÃO</h1>');
    const staticApp = createApp({ cardRepository: new InMemoryCardRepository(CARDS), staticDir: dir });
    const res = await request(staticApp).get('/').expect(200);
    assert.match(res.text, /MALDIÇÃO/);
  });
});

describe('JsonCardRepository', () => {
  it('lê o baralho oficial compartilhado com o frontend', async () => {
    const cards = await new JsonCardRepository(config.cardsFile).findAll();
    assert.equal(cards.length, 53);
  });
});
