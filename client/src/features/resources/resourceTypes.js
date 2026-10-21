export const RESOURCE_TYPES = [
  { value: 'workstation', label: 'Estação de Trabalho' },
  { value: 'meeting_room', label: 'Sala de Reunião' },
];

export function resourceTypeLabel(type) {
  return type === 'meeting_room' ? 'Sala de Reunião' : 'Estação de Trabalho';
}
