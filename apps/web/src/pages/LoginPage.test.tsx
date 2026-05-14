import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('renders a "Continue with Google" link', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('"Continue with Google" link points to /auth/google', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /continue with google/i })).toHaveAttribute('href', '/auth/google');
  });

  it('renders a "Continue with GitHub" link', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /continue with github/i })).toBeInTheDocument();
  });

  it('"Continue with GitHub" link points to /auth/github', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /continue with github/i })).toHaveAttribute('href', '/auth/github');
  });

  it('renders the app name heading', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /habit tracker/i })).toBeInTheDocument();
  });
});
