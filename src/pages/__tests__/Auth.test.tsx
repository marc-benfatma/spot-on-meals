import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Auth from '../Auth';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock logo
vi.mock('@/assets/logo.png', () => ({ default: 'logo.png' }));

// Mock auth context
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
let mockUser: { id: string } | null = null;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    signIn: mockSignIn,
    signUp: mockSignUp,
  }),
}));

describe('Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockSignIn.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({ error: null });
  });

  it('renders login form by default', () => {
    render(<Auth />);

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('toggles between login and signup', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    await user.click(screen.getByText("Don't have an account? Sign up"));
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();

    await user.click(screen.getByText('Already have an account? Sign in'));
    expect(screen.getByRole('heading', { name: 'Admin Login' })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'password123');

    // Submit via form button
    const submitBtn = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Validation Error',
          variant: 'destructive',
        })
      );
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('validates password minimum length', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), '123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Validation Error',
          variant: 'destructive',
        })
      );
    });
  });

  it('calls signIn on valid login submission', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('calls signUp on valid signup submission', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    await user.click(screen.getByText("Don't have an account? Sign up"));
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'password123');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Account created!' })
      );
    });
  });

  it('shows error toast on login failure', async () => {
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    const user = userEvent.setup();
    render(<Auth />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpass1');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        })
      );
    });
  });

  it('shows error for already registered user', async () => {
    mockSignUp.mockResolvedValue({
      error: { message: 'User already registered' },
    });

    const user = userEvent.setup();
    render(<Auth />);

    await user.click(screen.getByText("Don't have an account? Sign up"));
    await user.type(screen.getByLabelText('Email'), 'existing@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'This email is already registered. Try logging in instead.',
        })
      );
    });
  });

  it('redirects if user is already logged in', () => {
    mockUser = { id: 'user-1' };
    render(<Auth />);

    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('navigates back to map', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    await user.click(screen.getByText('← Back to map'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('disables inputs while loading', async () => {
    // Make signIn hang to keep loading state
    mockSignIn.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<Auth />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
    });
  });
});
