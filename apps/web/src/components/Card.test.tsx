import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders a heading when title is provided', () => {
    render(<Card title="My Habit"><p>content</p></Card>);
    expect(screen.getByRole('heading', { name: /my habit/i })).toBeInTheDocument();
  });

  it('does not render a heading when title is omitted', () => {
    render(<Card><p>no title</p></Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
