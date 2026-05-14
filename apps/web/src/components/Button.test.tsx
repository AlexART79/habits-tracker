import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders primary variant by default with blue background class', () => {
    render(<Button>Primary</Button>);
    // JSDOM doesn't apply CSS; checking class presence is the pragmatic alternative
    expect(screen.getByRole('button', { name: /primary/i })).toHaveClass('bg-blue-600');
  });

  it('renders secondary variant with white background class', () => {
    render(<Button variant="secondary">Secondary</Button>);
    // JSDOM doesn't apply CSS; checking class presence is the pragmatic alternative
    expect(screen.getByRole('button', { name: /secondary/i })).toHaveClass('bg-white');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    await userEvent.click(screen.getByRole('button', { name: /disabled/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
