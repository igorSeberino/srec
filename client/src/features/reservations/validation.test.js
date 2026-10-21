import { describe, expect, it } from 'vitest';
import { validateReservation } from './validation';

const NOW = new Date('2030-01-10T08:00');

describe('validateReservation', () => {
  it('aceita janela futura com término depois do início', () => {
    expect(
      validateReservation({ start_time: '2030-01-10T09:00', end_time: '2030-01-10T10:00' }, NOW)
    ).toEqual({});
  });

  it('barra término anterior ao início', () => {
    const errors = validateReservation(
      { start_time: '2030-01-10T10:00', end_time: '2030-01-10T09:00' },
      NOW
    );
    expect(errors.end_time).toBe('O término precisa ser depois do início.');
  });

  it('barra término igual ao início (janela vazia)', () => {
    const errors = validateReservation(
      { start_time: '2030-01-10T10:00', end_time: '2030-01-10T10:00' },
      NOW
    );
    expect(errors.end_time).toBeDefined();
  });

  it('barra início no passado', () => {
    const errors = validateReservation(
      { start_time: '2030-01-10T07:59', end_time: '2030-01-10T09:00' },
      NOW
    );
    expect(errors.start_time).toBe('O início não pode estar no passado.');
  });

  it('exige os dois horários', () => {
    const errors = validateReservation({ start_time: '', end_time: '' }, NOW);
    expect(errors).toEqual({
      start_time: 'Informe o horário de início.',
      end_time: 'Informe o horário de término.',
    });
  });
});
