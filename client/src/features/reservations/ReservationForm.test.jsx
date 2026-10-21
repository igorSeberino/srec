import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RESOURCES } from '../../test/fixtures';
import { ReservationForm } from './ReservationForm';

const deferred = () => {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
};

async function fill(user, { start = '2030-02-01T09:00', end = '2030-02-01T10:00' } = {}) {
  await user.type(screen.getByLabelText('Nome do Responsável'), 'Bia');
  await user.type(screen.getByLabelText('Horário de Início'), start);
  await user.type(screen.getByLabelText('Horário de Término'), end);
}

const submitButton = () => screen.getByRole('button', { name: /Confirmar Reserva|Enviando/ });

describe('ReservationForm: trava de envio (BUG-13)', () => {
  it('desabilita o botão durante o envio e reabilita no fim', async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onSubmit = vi.fn(() => pending.promise);
    render(<ReservationForm resources={RESOURCES} onSubmit={onSubmit} />);
    await fill(user);

    await user.click(submitButton());
    expect(submitButton()).toBeDisabled();
    expect(submitButton()).toHaveTextContent('Enviando...');

    pending.resolve(true);
    await waitFor(() => expect(submitButton()).toBeEnabled());
    expect(submitButton()).toHaveTextContent('Confirmar Reserva');
  });

  it('duplo clique gera uma única requisição', async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onSubmit = vi.fn(() => pending.promise);
    render(<ReservationForm resources={RESOURCES} onSubmit={onSubmit} />);
    await fill(user);

    await user.dblClick(submitButton());
    pending.resolve(true);
    await waitFor(() => expect(submitButton()).toBeEnabled());
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('dois submits no mesmo tick também geram uma única requisição', async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onSubmit = vi.fn(() => pending.promise);
    const { container } = render(<ReservationForm resources={RESOURCES} onSubmit={onSubmit} />);
    await fill(user);

    const form = container.querySelector('form');
    fireEvent.submit(form);
    fireEvent.submit(form);
    pending.resolve(true);
    await waitFor(() => expect(submitButton()).toBeEnabled());
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('reabilita o botão quando o envio falha', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(false);
    render(<ReservationForm resources={RESOURCES} onSubmit={onSubmit} />);
    await fill(user);

    await user.click(submitButton());
    await waitFor(() => expect(submitButton()).toBeEnabled());
    expect(screen.getByLabelText('Nome do Responsável')).toHaveValue('Bia');
  });
});

describe('ReservationForm: validação', () => {
  it('barra término anterior ao início, com mensagem junto do campo', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ReservationForm resources={RESOURCES} onSubmit={onSubmit} />);
    await fill(user, { start: '2030-02-01T10:00', end: '2030-02-01T09:00' });

    await user.click(submitButton());
    const end = screen.getByLabelText('Horário de Término');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(end).toHaveAttribute('aria-invalid', 'true');
    expect(end).toHaveAccessibleDescription('O término precisa ser depois do início.');
  });

  it('barra data no passado', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ReservationForm resources={RESOURCES} onSubmit={onSubmit} />);
    await fill(user, { start: '2020-01-01T09:00', end: '2020-01-01T10:00' });

    await user.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Horário de Início')).toHaveAccessibleDescription(
      'O início não pode estar no passado.'
    );
  });

  it('a mensagem some quando o usuário corrige o campo', async () => {
    const user = userEvent.setup();
    render(<ReservationForm resources={RESOURCES} onSubmit={vi.fn()} />);
    await fill(user, { start: '2030-02-01T10:00', end: '2030-02-01T09:00' });
    await user.click(submitButton());
    expect(screen.getByText('O término precisa ser depois do início.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Horário de Término'), '2030-02-01T11:00');
    expect(screen.queryByText('O término precisa ser depois do início.')).not.toBeInTheDocument();
  });
});
