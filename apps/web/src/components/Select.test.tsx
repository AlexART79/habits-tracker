import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  it('keeps the open affordance inset from the control edge', () => {
    const { container } = render(
      <Select label="Status" name="status" defaultValue="">
        <option value="">All</option>
      </Select>,
    );

    expect(screen.getByLabelText('Status')).toHaveClass('appearance-none', 'pr-11');
    expect(container.querySelector('svg')).toHaveClass('right-3.5');
  });
});
