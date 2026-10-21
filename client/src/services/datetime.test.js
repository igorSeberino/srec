import { describe, expect, it } from 'vitest';
import { formatDateTime, toApiDateTime } from './datetime';

// setup.js fixa TZ=America/Sao_Paulo (UTC-3) para estes testes.
describe('datetime (BE-07)', () => {
  it('converte o horário local do datetime-local para ISO em UTC', () => {
    expect(toApiDateTime('2030-01-10T09:00')).toBe('2030-01-10T12:00:00.000Z');
  });

  it('preserva vazio e valor inválido para a validação tratar', () => {
    expect(toApiDateTime('')).toBe('');
    expect(toApiDateTime('lixo')).toBe('lixo');
  });

  it('exibe o mesmo horário que foi digitado, com a API devolvendo UTC', () => {
    const sent = toApiDateTime('2030-01-10T09:00');
    expect(formatDateTime(sent)).toBe('10/01/2030, 09:00:00');
  });

  it('aceita offset explícito vindo da API', () => {
    expect(formatDateTime('2030-01-10T09:00:00-03:00')).toBe('10/01/2030, 09:00:00');
  });
});
