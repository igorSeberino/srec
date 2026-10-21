export const RESOURCES = [
  { id: 1, name: 'Sala Alpha', type: 'meeting_room', capacity: 8 },
  { id: 2, name: 'Mesa 01', type: 'workstation', capacity: 1 },
];

export const RESERVATIONS = [
  {
    id: 10,
    resource_id: 1,
    user_name: 'Carlos Silva',
    start_time: '2030-01-10T12:00:00.000Z',
    end_time: '2030-01-10T13:00:00.000Z',
    status: 'scheduled',
  },
  {
    id: 11,
    resource_id: 2,
    user_name: 'Ana Souza',
    start_time: '2030-01-11T12:00:00.000Z',
    end_time: '2030-01-11T13:00:00.000Z',
    status: 'completed',
  },
];
