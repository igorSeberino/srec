const ResourceModel = require('../models/resourceModel');
const AppError = require('../errors/AppError');

const ResourceService = {
  async create({ name, type, capacity = 1 }) {
    if (!name || !type) throw AppError.badRequest('Nome e tipo são obrigatórios.', 'RESOURCE_FIELDS_REQUIRED');
    return ResourceModel.create(name, type, capacity);
  },
  async list() { return ResourceModel.findAll(); },
  async getById(id) {
    const resource = await ResourceModel.findById(id);
    if (!resource) throw AppError.notFound('Recurso não encontrado.', 'RESOURCE_NOT_FOUND');
    return resource;
  },
  async update(id, fields) {
    if (!fields || Object.keys(fields).length === 0) throw AppError.badRequest('Informe ao menos um campo para atualizar.', 'EMPTY_UPDATE');
    if (fields.name !== undefined && !String(fields.name).trim()) throw AppError.badRequest('O nome não pode ser vazio.', 'INVALID_NAME');
    const resource = await ResourceModel.update(id, fields);
    if (!resource) throw AppError.notFound('Recurso não encontrado.', 'RESOURCE_NOT_FOUND');
    return resource;
  },
  async remove(id) {
    const resource = await ResourceModel.delete(id);
    if (!resource) throw AppError.notFound('Recurso não encontrado.', 'RESOURCE_NOT_FOUND');
    return resource;
  },
};
module.exports = ResourceService;
