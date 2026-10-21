// Conveniencia para o usuario: o servidor (BE-02) continua sendo a autoridade.
export function validateReservation({ start_time, end_time }, now = new Date()) {
  const errors = {};
  const start = start_time ? new Date(start_time) : null;
  const end = end_time ? new Date(end_time) : null;

  if (!start || Number.isNaN(start.getTime())) {
    errors.start_time = 'Informe o horário de início.';
  } else if (start < now) {
    errors.start_time = 'O início não pode estar no passado.';
  }

  if (!end || Number.isNaN(end.getTime())) {
    errors.end_time = 'Informe o horário de término.';
  } else if (start && end <= start) {
    errors.end_time = 'O término precisa ser depois do início.';
  }

  return errors;
}
