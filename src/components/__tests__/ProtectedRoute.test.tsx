import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ProtectedRoute } from '../ProtectedRoute';

// Mock react-router-dom
const mockNavigate = vi.fn();
let mockLocation = { pathname: '/admin' };

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, state, replace }: { to: string; state?: unknown; replace?: boolean }) => {
    mockNavigate(to, state, replace);
    return React.createElement('div', { 'data-testid': 'navigate' }, `Redirected to ${to}`);
  },
  useLocation: () => mockLocation,
}));

// Mock auth context
let mockAuthState = {
  user: null as { id: string } | null,
  isLoading: false,
  canEdit: false,
  isAdmin: false,
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation = { pathname: '/admin' };
    mockAuthState = {
      user: null,
      isLoading: false,
      canEdit: false,
      isAdmin: false,
    };
  });

  it('shows loading spinner when auth is loading', () => {
    mockAuthState = { ...mockAuthState, isLoading: true };

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Spinner is rendered (Loader2 renders as svg)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects to /auth when no user', () => {
    mockAuthState = { ...mockAuthState, user: null, isLoading: false };

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Redirected to /auth')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows access denied for user without edit permission', () => {
    mockAuthState = {
      user: { id: 'user-1' },
      isLoading: false,
      canEdit: false,
      isAdmin: false,
    };

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children for user with edit permission', () => {
    mockAuthState = {
      user: { id: 'user-1' },
      isLoading: false,
      canEdit: true,
      isAdmin: false,
    };

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects non-admin user when requireAdmin is true', () => {
    mockAuthState = {
      user: { id: 'user-1' },
      isLoading: false,
      canEdit: true,
      isAdmin: false,
    };

    render(
      <ProtectedRoute requireAdmin>
        <div>Admin Only</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Redirected to /')).toBeInTheDocument();
    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });

  it('renders children for admin user when requireAdmin is true', () => {
    mockAuthState = {
      user: { id: 'user-1' },
      isLoading: false,
      canEdit: true,
      isAdmin: true,
    };

    render(
      <ProtectedRoute requireAdmin>
        <div>Admin Only</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });
});
