import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './Login';

// Mock wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => ['/', mockSetLocation],
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock API request
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '@/lib/queryClient';

describe('Login Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockSetLocation.mockClear();
    mockToast.mockClear();
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Login />
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('renders login form with all elements', () => {
      renderLogin();

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to continue your wellness journey')).toBeInTheDocument();
      expect(screen.getByTestId('input-email')).toBeInTheDocument();
      expect(screen.getByTestId('input-password')).toBeInTheDocument();
      expect(screen.getByTestId('button-login')).toBeInTheDocument();
      expect(screen.getByTestId('button-back-home')).toBeInTheDocument();
    });

    it('renders create account link', () => {
      renderLogin();

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for invalid email', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByTestId('input-email');
      const submitButton = screen.getByTestId('button-login');

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('shows validation error for empty password', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByTestId('input-email');
      const submitButton = screen.getByTestId('button-login');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Login', () => {
    it('redirects coach to coach dashboard on successful login', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        id: '123',
        email: 'coach@example.com',
        role: 'coach',
        hasCompletedOnboarding: true,
      };

      vi.mocked(apiRequest).mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      renderLogin();

      await user.type(screen.getByTestId('input-email'), 'coach@example.com');
      await user.type(screen.getByTestId('input-password'), 'password123');
      await user.click(screen.getByTestId('button-login'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Welcome back!',
          description: "You've successfully signed in.",
        });
        expect(mockSetLocation).toHaveBeenCalledWith('/coach-dashboard');
      });
    });

    it('redirects admin to admin dashboard on successful login', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
        hasCompletedOnboarding: true,
      };

      vi.mocked(apiRequest).mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      renderLogin();

      await user.type(screen.getByTestId('input-email'), 'admin@example.com');
      await user.type(screen.getByTestId('input-password'), 'password123');
      await user.click(screen.getByTestId('button-login'));

      await waitFor(() => {
        expect(mockSetLocation).toHaveBeenCalledWith('/admin-dashboard');
      });
    });

    it('redirects regular user to member portal on successful login', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        id: '123',
        email: 'user@example.com',
        role: 'member',
        hasCompletedOnboarding: true,
      };

      vi.mocked(apiRequest).mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      renderLogin();

      await user.type(screen.getByTestId('input-email'), 'user@example.com');
      await user.type(screen.getByTestId('input-password'), 'password123');
      await user.click(screen.getByTestId('button-login'));

      await waitFor(() => {
        expect(mockSetLocation).toHaveBeenCalledWith('/member-portal');
      });
    });

    it('redirects to onboarding if user has not completed onboarding', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        id: '123',
        email: 'newuser@example.com',
        role: 'member',
        hasCompletedOnboarding: false,
      };

      vi.mocked(apiRequest).mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      renderLogin();

      await user.type(screen.getByTestId('input-email'), 'newuser@example.com');
      await user.type(screen.getByTestId('input-password'), 'password123');
      await user.click(screen.getByTestId('button-login'));

      await waitFor(() => {
        expect(mockSetLocation).toHaveBeenCalledWith('/digital-onboarding');
      });
    });

    it('sets session storage flag on successful login', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        id: '123',
        email: 'user@example.com',
        role: 'member',
        hasCompletedOnboarding: true,
      };

      vi.mocked(apiRequest).mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      renderLogin();

      await user.type(screen.getByTestId('input-email'), 'user@example.com');
      await user.type(screen.getByTestId('input-password'), 'password123');
      await user.click(screen.getByTestId('button-login'));

      await waitFor(() => {
        expect(sessionStorage.getItem('hasAuthSession')).toBe('true');
      });
    });
  });

  describe('Failed Login', () => {
    it('shows error toast on login failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';

      vi.mocked(apiRequest).mockRejectedValueOnce(new Error(errorMessage));

      renderLogin();

      await user.type(screen.getByTestId('input-email'), 'wrong@example.com');
      await user.type(screen.getByTestId('input-password'), 'wrongpassword');
      await user.click(screen.getByTestId('button-login'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      });
    });

    it('does not redirect on login failure', async () => {
      const user = userEvent.setup();

      vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Invalid credentials'));

      renderLogin();

      await user.type(screen.getByTestId('input-email'), 'wrong@example.com');
      await user.type(screen.getByTestId('input-password'), 'wrongpassword');
      await user.click(screen.getByTestId('button-login'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });

      expect(mockSetLocation).not.toHaveBeenCalled();
    });
  });

  describe('UI Interactions', () => {
    it('disables submit button while login is pending', async () => {
      const user = userEvent.setup();

      // Mock a slow API response
      vi.mocked(apiRequest).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          json: async () => ({ id: '123', role: 'member', hasCompletedOnboarding: true })
        } as Response), 100))
      );

      renderLogin();

      await user.type(screen.getByTestId('input-email'), 'test@example.com');
      await user.type(screen.getByTestId('input-password'), 'password123');
      
      const submitButton = screen.getByTestId('button-login');
      await user.click(submitButton);

      // Button should be disabled immediately
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Signing In...');
    });
  });
});
