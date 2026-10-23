const { ReservationStatus, RESERVATION_STATUSES, isValidStatus, isFinalStatus, canTransition, allowedSources } = require('./reservationStatus');
describe('reservation status domain', () => {
  it('exposes a frozen vocabulary', () => {
    expect(Object.isFrozen(ReservationStatus)).toBe(true);
    expect(RESERVATION_STATUSES).toEqual(['scheduled', 'cancelled', 'completed']);
  });
  it('validates and transitions statuses', () => {
    expect(isValidStatus('banana')).toBe(false);
    expect(canTransition('scheduled', 'completed')).toBe(true);
    expect(canTransition('completed', 'scheduled')).toBe(false);
    expect(isFinalStatus('cancelled')).toBe(true);
    expect(allowedSources('completed')).toEqual(['scheduled']);
  });
});
