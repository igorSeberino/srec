import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { api } from './services/api';
import { RESERVATIONS, RESOURCES } from './test/fixtures';

vi.mock('./services/api', () => ({
  api: {
    getResources: vi.fn(),
    getReservations: vi.fn(),
    createResource: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.getResources.mockResolvedValue(RESOURCES);
  api.getReservations.mockResolvedValue(RESERVATIONS);
});

describe('Acessibilidade (CS-13)', () => {
  it('os campos de espaço são encontrados pelo rótulo', async () => {
    render(<App />);
    await screen.findByText('Sala Alpha');
    expect(screen.getByLabelText('Nome do Espaço / Estação')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Tipo').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Capacidade (pessoas)')).toHaveAttribute('type', 'number');
  });

  it('clicar no rótulo foca o campo', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Sala Alpha');
    await user.click(screen.getByText('Nome do Espaço / Estação'));
    expect(screen.getByLabelText('Nome do Espaço / Estação')).toHaveFocus();
  });

  it('os campos de reserva são encontrados pelo rótulo', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Agendamentos' }));
    await screen.findByText('Carlos Silva');

    expect(screen.getByLabelText('Selecione o Espaço').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Nome do Responsável')).toBeInTheDocument();
    expect(screen.getByLabelText('Horário de Início')).toHaveAttribute('type', 'datetime-local');
    expect(screen.getByLabelText('Horário de Término')).toHaveAttribute('type', 'datetime-local');
  });

  it('botões só com ícone têm nome acessível', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      await screen.findByRole('button', { name: 'Excluir espaço Sala Alpha' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Agendamentos' }));
    await screen.findByText('Carlos Silva');
    expect(
      screen.getByRole('button', { name: 'Concluir reserva de Carlos Silva em Sala Alpha' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar reserva de Carlos Silva em Sala Alpha' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Excluir definitivamente a reserva de Ana Souza em Mesa 01',
      })
    ).toBeInTheDocument();
  });

  it('o feedback é anunciado numa região viva', async () => {
    const user = userEvent.setup();
    api.createResource.mockResolvedValue({});
    render(<App />);
    await screen.findByText('Sala Alpha');

    const region = screen.getByRole('alert');
    expect(region).toHaveAttribute('aria-live', 'assertive');

    await user.type(screen.getByLabelText('Nome do Espaço / Estação'), 'Sala Beta');
    await user.click(screen.getByRole('button', { name: /Cadastrar Espaço/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Espaço cadastrado com sucesso!');
  });
});
