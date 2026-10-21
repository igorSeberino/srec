import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ResourceForm } from './ResourceForm';

describe('ResourceForm: trava de envio', () => {
  it('duplo clique cadastra o espaço uma única vez', async () => {
    const user = userEvent.setup();
    let resolve;
    const onSubmit = vi.fn(() => new Promise((r) => (resolve = r)));
    render(<ResourceForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Nome do Espaço / Estação'), 'Sala Beta');
    const button = screen.getByRole('button', { name: /Cadastrar Espaço/ });
    await user.dblClick(button);
    expect(button).toBeDisabled();

    resolve(true);
    await waitFor(() => expect(button).toBeEnabled());
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
