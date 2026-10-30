/** Erro de aplicação com status HTTP associado. */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export class ValidationError extends AppError {
  /** @param {string} message */
  constructor(message) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  /** @param {string} message */
  constructor(message) {
    super(message, 404);
  }
}
