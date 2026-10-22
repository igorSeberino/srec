const { validateReservationWindow } = require('./reservationValidator');
const NOW = new Date('2030-01-10T12:00:00Z');

describe('validateReservationWindow', () => {
  it('accepts a future window', () => expect(validateReservationWindow({ start_time: '2030-01-10T14:00:00Z', end_time: '2030-01-10T15:00:00Z' }, NOW).valid).toBe(true));
  it.each([
    ['bad start', 'INVALID_START_TIME', { start_time: 'invalid', end_time: '2030-01-10T15:00:00Z' }],
    ['bad end', 'INVALID_END_TIME', { start_time: '2030-01-10T14:00:00Z', end_time: null }],
    ['inverted', 'END_BEFORE_START', { start_time: '2030-01-10T16:00:00Z', end_time: '2030-01-10T15:00:00Z' }],
    ['past', 'START_IN_THE_PAST', { start_time: '2020-01-10T09:00:00Z', end_time: '2020-01-10T10:00:00Z' }],
  ])('%s', (_, code, input) => expect(validateReservationWindow(input, NOW)).toMatchObject({ valid: false, code }));
});
