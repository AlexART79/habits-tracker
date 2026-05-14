import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('uses readable light-theme text colors for active and paused status tones', () => {
    render(
      <div>
        <Badge tone="success">ACTIVE</Badge>
        <Badge tone="warning">PAUSED</Badge>
      </div>,
    );

    expect(screen.getByText('ACTIVE')).toHaveClass('text-emerald-800');
    expect(screen.getByText('PAUSED')).toHaveClass('text-amber-800');
  });
});
