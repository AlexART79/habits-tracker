import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitFilters } from './HabitFilters';
import type { HabitFilters as HabitFiltersType } from './types';

const EMPTY: HabitFiltersType = {};

describe('HabitFilters', () => {
  it('renders search input, status select, and completion select', () => {
    render(<HabitFilters filters={EMPTY} onChange={vi.fn()} />);
    expect(screen.getByRole('searchbox', { name: /search habits/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by completion/i })).toBeInTheDocument();
  });

  it('calls onChange with search value after debounce', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HabitFilters filters={EMPTY} onChange={onChange} />);

    await user.type(screen.getByRole('searchbox', { name: /search habits/i }), 'run');

    await waitFor(
      () => expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'run' })),
      { timeout: 1000 },
    );
  });

  it('calls onChange immediately when status changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HabitFilters filters={EMPTY} onChange={onChange} />);

    await user.selectOptions(screen.getByRole('combobox', { name: /filter by status/i }), 'ACTIVE');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'ACTIVE' }));
  });

  it('calls onChange immediately when completion filter changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HabitFilters filters={EMPTY} onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: /filter by completion/i }),
      'true',
    );
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ completedToday: true }));
  });

  it('passes completedToday=false when "Not done today" is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HabitFilters filters={EMPTY} onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: /filter by completion/i }),
      'false',
    );
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ completedToday: false }));
  });

  it('passes completedToday=null when "All habits" is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HabitFilters filters={{ completedToday: true }} onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: /filter by completion/i }),
      '',
    );
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ completedToday: null }));
  });
});
