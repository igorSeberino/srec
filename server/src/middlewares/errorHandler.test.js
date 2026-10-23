const errorHandler = require('./errorHandler');
const AppError = require('../errors/AppError');
jest.mock('../utils/logger');
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });
const req = { method: 'GET', originalUrl: '/test' };
describe('errorHandler', () => {
  it('serializes AppError', () => {
    const res = response();
    errorHandler(AppError.notFound('Não encontrado.', 'NOT_FOUND'), req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Não encontrado.', code: 'NOT_FOUND' });
  });
  it('does not leak unknown errors', () => {
    const res = response();
    errorHandler(new Error('secret database path'), req, res);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor.', code: 'INTERNAL_ERROR' });
  });
});
