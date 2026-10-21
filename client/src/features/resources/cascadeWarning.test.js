import { describe, expect, it } from 'vitest';
import { cascadeWarning } from './cascadeWarning';

const SALA = { id: 1, name: 'Sala Alpha' };
const r = (resource_id, status) => ({ resource_id, status });

describe('cascadeWarning (BUG-06)', () => {
  it('avisa quando nenhuma reserva é afetada', () => {
    expect(cascadeWarning(SALA, [r(2, 'scheduled')])).toBe(
      'Excluir o espaço "Sala Alpha"?\n\nNenhuma reserva será afetada.'
    );
  });

  it('informa quantas reservas serão apagadas, por status', () => {
    const msg = cascadeWarning(SALA, [
      r(1, 'scheduled'),
      r(1, 'scheduled'),
      r(1, 'completed'),
      r(2, 'scheduled'),
    ]);
    expect(msg).toContain('3 reservas serão apagadas permanentemente');
    expect(msg).toContain('2 agendadas, 1 concluída');
    expect(msg).toContain('inclusive o histórico');
    expect(msg).toContain('"Editar"');
  });

  it('usa singular para uma reserva', () => {
    const msg = cascadeWarning(SALA, [r(1, 'cancelled')]);
    expect(msg).toContain('1 reserva será apagada permanentemente');
    expect(msg).toContain('1 cancelada');
  });
});
