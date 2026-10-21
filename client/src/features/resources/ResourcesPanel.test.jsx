import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../services/api';
import { RESERVATIONS, RESOURCES } from '../../test/fixtures';
import { ResourcesPanel } from './ResourcesPanel';

vi.mock('../../services/api', () => ({
  api: {
    createResource: vi.fn(),
    updateResource: vi.fn(),
    deleteResource: vi.fn(),
    getReservations: vi.fn(),
  },
}));

let props;
beforeEach(() => {
  vi.clearAllMocks();
  api.getReservations.mockResolvedValue(RESERVATIONS);
  props = {
    resources: RESOURCES,
    loading: false,
    reloadResources: vi.fn(),
    reloadReservations: vi.fn(),
    notify: vi.fn(),
  };
});

describe('Edição de espaço (BUG-15)', () => {
  it('edita nome, tipo e capacidade e salva via PUT', async () => {
    const user = userEvent.setup();
    api.updateResource.mockResolvedValue({});
    render(<ResourcesPanel {...props} />);

    await user.click(screen.getByRole('button', { name: 'Editar espaço Sala Alpha' }));
    const form = screen.getByRole('button', { name: /Salvar Alterações/ }).closest('form');
    const field = (label) => within(form).getByLabelText(label);
    expect(field('Nome do Espaço / Estação')).toHaveValue('Sala Alpha');

    await user.clear(field('Nome do Espaço / Estação'));
    await user.type(field('Nome do Espaço / Estação'), 'Sala Ômega');
    await user.selectOptions(field('Tipo'), 'workstation');
    await user.clear(field('Capacidade (pessoas)'));
    await user.type(field('Capacidade (pessoas)'), '4');
    await user.click(within(form).getByRole('button', { name: /Salvar Alterações/ }));

    expect(api.updateResource).toHaveBeenCalledWith(1, {
      name: 'Sala Ômega',
      type: 'workstation',
      capacity: 4,
    });
    await waitFor(() =>
      expect(props.notify).toHaveBeenCalledWith('Espaço atualizado com sucesso!')
    );
    expect(props.reloadResources).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Salvar Alterações/ })).not.toBeInTheDocument();
  });

  it('cancelar a edição não chama a API', async () => {
    const user = userEvent.setup();
    render(<ResourcesPanel {...props} />);
    await user.click(screen.getByRole('button', { name: 'Editar espaço Sala Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(api.updateResource).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Sala Alpha' })).toBeInTheDocument();
  });

  it('mantém o formulário aberto se o servidor recusar', async () => {
    const user = userEvent.setup();
    api.updateResource.mockRejectedValue(new Error('Resource not found'));
    render(<ResourcesPanel {...props} />);
    await user.click(screen.getByRole('button', { name: 'Editar espaço Sala Alpha' }));
    await user.click(screen.getByRole('button', { name: /Salvar Alterações/ }));

    await waitFor(() => expect(props.notify).toHaveBeenCalledWith('Resource not found', 'error'));
    expect(screen.getByRole('button', { name: /Salvar Alterações/ })).toBeInTheDocument();
  });
});

describe('Exclusão com aviso de cascata (BUG-06)', () => {
  it('o diálogo informa quantas reservas serão apagadas', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ResourcesPanel {...props} />);

    await user.click(screen.getByRole('button', { name: 'Excluir espaço Sala Alpha' }));
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(confirm.mock.calls[0][0]).toContain('1 reserva será apagada permanentemente');
    expect(api.deleteResource).not.toHaveBeenCalled();
  });

  it('não exclui se não conseguir contar as reservas', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.getReservations.mockRejectedValue(new Error('fora do ar'));
    render(<ResourcesPanel {...props} />);

    await user.click(screen.getByRole('button', { name: 'Excluir espaço Sala Alpha' }));
    await waitFor(() => expect(props.notify).toHaveBeenCalled());
    expect(props.notify.mock.calls[0]).toEqual([
      'Não foi possível verificar as reservas do espaço: fora do ar',
      'error',
    ]);
    expect(confirm).not.toHaveBeenCalled();
    expect(api.deleteResource).not.toHaveBeenCalled();
  });

  it('confirmado, exclui e recarrega espaços e reservas', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.deleteResource.mockResolvedValue({});
    render(<ResourcesPanel {...props} />);

    await user.click(screen.getByRole('button', { name: 'Excluir espaço Mesa 01' }));
    await waitFor(() => expect(api.deleteResource).toHaveBeenCalledWith(2));
    expect(props.reloadResources).toHaveBeenCalled();
    expect(props.reloadReservations).toHaveBeenCalled();
  });
});
