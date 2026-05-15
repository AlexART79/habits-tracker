import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitForm } from './HabitForm';

function renderForm(onSubmit = vi.fn(), onCancel = vi.fn()) {
  render(
    <HabitForm onSubmit={onSubmit} onCancel={onCancel} submitLabel="Create habit" />,
  );
  return { onSubmit, onCancel };
}

describe('HabitForm', () => {
  it('renders the name, description, and start date fields', () => {
    renderForm();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
  });

  it('blocks submit and shows error when name is empty', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();
    await user.click(screen.getByRole('button', { name: /create habit/i }));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with trimmed name and startDate', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<HabitForm onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Create habit" />);

    await user.type(screen.getByLabelText(/name/i), '  Morning Run  ');
    await user.click(screen.getByRole('button', { name: /create habit/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const payload = onSubmit.mock.calls[0][0] as { name: string; startDate: string };
    expect(payload.name).toBe('Morning Run');
    expect(payload.startDate).toBeTruthy();
  });

  it('disables the submit button while saving', async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onSubmit = vi.fn().mockReturnValue(new Promise<void>((r) => { resolve = r; }));
    render(<HabitForm onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Create habit" />);

    await user.type(screen.getByLabelText(/name/i), 'Run');
    await user.click(screen.getByRole('button', { name: /create habit/i }));

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    await act(async () => resolve());
  });

  it('shows a server error when onSubmit rejects', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Something went wrong on server'));
    render(<HabitForm onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Create habit" />);

    await user.type(screen.getByLabelText(/name/i), 'Run');
    await user.click(screen.getByRole('button', { name: /create habit/i }));

    await screen.findByText(/something went wrong on server/i);
  });

  it('loads initialValues into the form fields', () => {
    render(
      <HabitForm
        initialValues={{ name: 'Yoga', description: 'Evening session', startDate: '2026-03-01T00:00:00.000Z' }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Save changes"
      />,
    );
    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe('Yoga');
    expect((screen.getByLabelText(/description/i) as HTMLTextAreaElement).value).toBe('Evening session');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<HabitForm onSubmit={vi.fn()} onCancel={onCancel} submitLabel="Create habit" />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
