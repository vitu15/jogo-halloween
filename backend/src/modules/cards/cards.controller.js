/**
 * Adapta HTTP <-> CardService.
 * @param {import('./cards.service.js').CardService} service
 */
export function createCardsController(service) {
  return {
    /** @type {import('express').RequestHandler} */
    async list(req, res) {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const cards = await service.list({ category });
      res.json({ data: cards, count: cards.length });
    },

    /** @type {import('express').RequestHandler} */
    async summary(_req, res) {
      res.json({ data: await service.summary() });
    },

    /** @type {import('express').RequestHandler} */
    async getById(req, res) {
      res.json({ data: await service.getById(req.params.id) });
    },
  };
}
