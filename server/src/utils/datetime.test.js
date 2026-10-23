const { parseInstant } = require('./datetime');
describe('parseInstant', () => {
  it('rejects a value without offset', () => expect(() => parseInstant('2026-10-23T14:00', 'start_time')).toThrow(expect.objectContaining({ code: 'INVALID_DATETIME' })));
  it('preserves an explicit instant', () => expect(parseInstant('2026-10-23T14:00:00-03:00', 'start_time').toISOString()).toBe('2026-10-23T17:00:00.000Z'));
});
