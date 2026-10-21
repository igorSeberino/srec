import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { API_BASE_URL, ApiError, request } from './http';

const jsonResponse = (status, body) =>
  new Response(body === undefined ? '' : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

describe('request', () => {
  it('usa o fallback de desenvolvimento quando VITE_API_URL não está definida', () => {
    expect(API_BASE_URL).toBe('http://localhost:5000/api');
  });

  it('faz o parse do JSON da resposta', async () => {
    fetch.mockResolvedValue(jsonResponse(200, [{ id: 1 }]));
    await expect(request('/resources')).resolves.toEqual([{ id: 1 }]);
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/resources', { method: 'GET' });
  });

  it('envia corpo como JSON com o cabeçalho certo', async () => {
    fetch.mockResolvedValue(jsonResponse(201, { id: 1 }));
    await request('/resources', { method: 'POST', body: { name: 'A' } });
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"A"}',
    });
  });

  it('aceita resposta sem corpo (204)', async () => {
    fetch.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(request('/x', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('propaga a mensagem do servidor com o status', async () => {
    fetch.mockResolvedValue(jsonResponse(404, { error: 'Resource not found' }));
    const err = await request('/resources/9', { fallback: 'Erro' }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('Resource not found');
    expect(err.status).toBe(404);
  });

  it('usa o fallback com o status quando o servidor não manda mensagem', async () => {
    fetch.mockResolvedValue(new Response('', { status: 500 }));
    await expect(request('/x', { fallback: 'Falha ao carregar' })).rejects.toThrow(
      'Falha ao carregar (HTTP 500)'
    );
  });

  it('traduz falha de rede numa mensagem legível', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(request('/x')).rejects.toThrow('Não foi possível conectar ao servidor.');
  });
});

describe('api: a mensagem do servidor chega em todos os métodos', () => {
  const calls = {
    getResources: () => api.getResources(),
    createResource: () => api.createResource({}),
    updateResource: () => api.updateResource(1, {}),
    deleteResource: () => api.deleteResource(1),
    getReservations: () => api.getReservations(),
    createReservation: () => api.createReservation({}),
    updateReservationStatus: () => api.updateReservationStatus(1, 'x'),
    deleteReservation: () => api.deleteReservation(1),
  };

  it.each(Object.keys(calls))('%s', async (name) => {
    fetch.mockResolvedValue(jsonResponse(400, { error: `erro de ${name}` }));
    await expect(calls[name]()).rejects.toThrow(`erro de ${name}`);
  });
});

describe('api.createReservation', () => {
  it('envia os horários em ISO 8601 com offset (contrato BE-07)', async () => {
    fetch.mockResolvedValue(jsonResponse(201, { id: 1 }));
    await api.createReservation({
      resource_id: 1,
      user_name: 'Bia',
      start_time: '2030-01-10T09:00',
      end_time: '2030-01-10T10:00',
    });

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(body.start_time).toMatch(iso);
    expect(body.end_time).toMatch(iso);
    expect(new Date(body.start_time).getTime()).toBe(new Date('2030-01-10T09:00').getTime());
  });
});
