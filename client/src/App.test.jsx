import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { api } from './services/api';
import { RESERVATIONS, RESOURCES } from './test/fixtures';

vi.mock('./services/api', () => ({
  api: {
    getResources: vi.fn(),
    createResource: vi.fn(),
    updateResource: vi.fn(),
    deleteResource: vi.fn(),
    getReservations: vi.fn(),
    createReservation: vi.fn(),
    updateReservationStatus: vi.fn(),
    deleteReservation: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.getResources.mockResolvedValue(RESOURCES);
  api.getReservations.mockResolvedValue(RESERVATIONS);
});

const openReservations = async (user) => {
  await user.click(screen.getByRole('button', { name: 'Agendamentos' }));
  await screen.findByText('Carlos Silva');
};

describe('Espaços', () => {
  it('lista os espaços carregados da API', async () => {
    render(<App />);
    expect(await screen.findByText('Sala Alpha')).toBeInTheDocument();
    expect(screen.getByText('Mesa 01')).toBeInTheDocument();
  });

  it('mostra mensagem quando não há espaços', async () => {
    api.getResources.mockResolvedValue([]);
    render(<App />);
    expect(await screen.findByText('Nenhum espaço cadastrado ainda.')).toBeInTheDocument();
  });

  it('cadastra espaço, limpa o formulário e recarrega só os espaços', async () => {
    const user = userEvent.setup();
    api.createResource.mockResolvedValue({ id: 3 });
    render(<App />);
    await screen.findByText('Sala Alpha');

    const name = screen.getByPlaceholderText('Ex: Sala de Reunião Alpha');
    await user.type(name, 'Sala Beta');
    await user.click(screen.getByRole('button', { name: /Cadastrar Espaço/ }));

    expect(api.createResource).toHaveBeenCalledWith({
      name: 'Sala Beta',
      type: 'workstation',
      capacity: 1,
    });
    expect(await screen.findByText('Espaço cadastrado com sucesso!')).toBeInTheDocument();
    expect(name).toHaveValue('');
    expect(api.getResources).toHaveBeenCalledTimes(2);
    expect(api.getReservations).toHaveBeenCalledTimes(1);
  });

  it('exibe o erro do servidor ao cadastrar', async () => {
    const user = userEvent.setup();
    api.createResource.mockRejectedValue(new Error('Nome obrigatório'));
    render(<App />);
    await screen.findByText('Sala Alpha');

    await user.type(screen.getByPlaceholderText('Ex: Sala de Reunião Alpha'), 'X');
    await user.click(screen.getByRole('button', { name: /Cadastrar Espaço/ }));
    expect(await screen.findByText('Nome obrigatório')).toBeInTheDocument();
  });

  it('remove espaço após confirmação e recarrega as duas coleções', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.deleteResource.mockResolvedValue({});
    render(<App />);
    await screen.findByText('Sala Alpha');

    await user.click(screen.getAllByTitle('Excluir Espaço')[0]);
    expect(api.deleteResource).toHaveBeenCalledWith(1);
    expect(await screen.findByText('Espaço removido com sucesso!')).toBeInTheDocument();
    // carga inicial + contagem antes do diálogo + recarga após o cascade
    expect(api.getReservations).toHaveBeenCalledTimes(3);
  });

  it('não remove espaço se o usuário cancelar o diálogo', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);
    await screen.findByText('Sala Alpha');

    await user.click(screen.getAllByTitle('Excluir Espaço')[0]);
    expect(api.deleteResource).not.toHaveBeenCalled();
  });
});

describe('Agendamentos', () => {
  it('lista reservas com o nome do espaço e ações só para as agendadas', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openReservations(user);

    expect(screen.getByRole('heading', { name: 'Sala Alpha' })).toBeInTheDocument();
    expect(screen.getAllByTitle('Concluir')).toHaveLength(1);
    expect(screen.getAllByTitle('Excluir Definitivamente')).toHaveLength(2);
  });

  it('cria reserva usando o primeiro espaço por padrão', async () => {
    const user = userEvent.setup();
    api.createReservation.mockResolvedValue({ id: 12 });
    const { container } = render(<App />);
    await openReservations(user);

    const [start, end] = container.querySelectorAll('input[type="datetime-local"]');
    await user.type(screen.getByPlaceholderText('Ex: Carlos Silva'), 'Bia');
    await user.type(start, '2030-02-01T09:00');
    await user.type(end, '2030-02-01T10:00');
    await user.click(screen.getByRole('button', { name: /Confirmar Reserva/ }));

    await waitFor(() => expect(api.createReservation).toHaveBeenCalledTimes(1));
    expect(api.createReservation.mock.calls[0][0]).toMatchObject({
      resource_id: 1,
      user_name: 'Bia',
    });
    expect(await screen.findByText('Reserva confirmada com sucesso!')).toBeInTheDocument();
  });

  it('mudar status recarrega apenas as reservas (CS-08)', async () => {
    const user = userEvent.setup();
    api.updateReservationStatus.mockResolvedValue({});
    render(<App />);
    await openReservations(user);

    await user.click(screen.getByTitle('Concluir'));
    expect(api.updateReservationStatus).toHaveBeenCalledWith(10, 'completed');
    expect(await screen.findByText('Status da reserva atualizado!')).toBeInTheDocument();
    expect(api.getReservations).toHaveBeenCalledTimes(2);
    expect(api.getResources).toHaveBeenCalledTimes(1);
  });

  it('exclui reserva após confirmação', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.deleteReservation.mockResolvedValue({});
    render(<App />);
    await openReservations(user);

    await user.click(screen.getAllByTitle('Excluir Definitivamente')[0]);
    expect(api.deleteReservation).toHaveBeenCalledWith(10);
    expect(await screen.findByText('Reserva removida!')).toBeInTheDocument();
  });
});
