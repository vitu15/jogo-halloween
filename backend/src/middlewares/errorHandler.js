import { AppError, NotFoundError } from '../shared/errors.js';

/** @type {import('express').RequestHandler} */
export function notFoundHandler(req, _res, next) {
  next(new NotFoundError(`Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

/**
 * Converte erros em respostas JSON. Erros inesperados não vazam detalhes.
 * @type {import('express').ErrorRequestHandler}
 */
export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    res.status(error.status).json({ error: { message: error.message } });
    return;
  }
  console.error(error);
  res.status(500).json({ error: { message: 'Erro interno do servidor.' } });
}
