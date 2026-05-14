import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders the "Habit Tracker" h1 heading', () => {
    render(<Layout>content</Layout>);
    expect(screen.getByRole('heading', { name: /habit tracker/i, level: 1 })).toBeInTheDocument();
  });

  it('renders children inside the main area', () => {
    render(<Layout><p>Hello Test</p></Layout>);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('renders a header landmark', () => {
    render(<Layout>content</Layout>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders a main landmark', () => {
    render(<Layout>content</Layout>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
