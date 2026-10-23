const ResourceService = require('./resourceService');
const ResourceModel = require('../models/resourceModel');
jest.mock('../models/resourceModel');
describe('ResourceService', () => {
  beforeEach(() => jest.clearAllMocks());
  it('rejects an empty update', async () => {
    await expect(ResourceService.update(1, {})).rejects.toMatchObject({ code: 'EMPTY_UPDATE', statusCode: 400 });
  });
  it('updates only supplied fields', async () => {
    ResourceModel.update.mockResolvedValue({ id: 1, capacity: 4 });
    await expect(ResourceService.update(1, { capacity: 4 })).resolves.toEqual({ id: 1, capacity: 4 });
  });
  it('returns a not found error', async () => {
    ResourceModel.findById.mockResolvedValue(undefined);
    await expect(ResourceService.getById(1)).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND', statusCode: 404 });
  });
});
