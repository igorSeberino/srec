const STATUS_LABELS = {
  scheduled: ['agendada', 'agendadas'],
  completed: ['concluída', 'concluídas'],
  cancelled: ['cancelada', 'canceladas'],
};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Monta o texto do dialogo de exclusao (BUG-06). O backend apaga o espaco
// com ON DELETE CASCADE, entao todas as reservas dele somem junto.
export function cascadeWarning(resource, reservations) {
  const affected = reservations.filter((r) => r.resource_id === resource.id);
  const title = `Excluir o espaço "${resource.name}"?`;

  if (affected.length === 0) {
    return `${title}\n\nNenhuma reserva será afetada.`;
  }

  const counts = {};
  for (const r of affected) counts[r.status] = (counts[r.status] || 0) + 1;
  const breakdown = Object.entries(counts)
    .map(([status, n]) => {
      const [one, many] = STATUS_LABELS[status] ?? [status, status];
      return plural(n, one, many);
    })
    .join(', ');

  return (
    `${title}\n\n` +
    `ATENÇÃO: ${plural(affected.length, 'reserva será apagada', 'reservas serão apagadas')} ` +
    `permanentemente junto com o espaço (${breakdown}), inclusive o histórico.\n\n` +
    'Se você só quer corrigir nome, tipo ou capacidade, cancele e use "Editar".'
  );
}
