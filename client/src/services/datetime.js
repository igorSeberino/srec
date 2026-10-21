// Contrato de horario com a API (BE-07): ISO 8601 com offset.
// O <input type="datetime-local"> entrega "2030-01-10T09:00", sem fuso;
// o navegador interpreta como horario local e toISOString() envia em UTC ("Z").
export function toApiDateTime(localValue) {
  if (!localValue) return localValue;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return localValue;
  return date.toISOString();
}

export function formatDateTime(isoValue) {
  return new Date(isoValue).toLocaleString('pt-BR');
}
