import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CoachDashboard from './CoachDashboard';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock StartVideoSessionDialog
vi.mock('@/components/coach/StartVideoSessionDialog', () => ({
  default: ({ trigger }: any) => <div data-testid="video-session-dialog">{trigger}</div>,
}));

describe('Coach Dashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockUseAuth.mockReturnValue({
      user: {
        id: '123',
        email: 'coach@example.com',
        role: 'coach',
        firstName: 'John',
      },
    });
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <CoachDashboard />
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('renders welcome message with coach name', () => {
      renderDashboard();
      expect(screen.getByText(/Welcome back, John!/)).toBeInTheDocument();
    });

    it('renders all stat cards', () => {
      renderDashboard();

      // Stats should be visible
      expect(screen.getByText('Active Clients')).toBeInTheDocument();
      expect(screen.getByText('Sessions This Week')).toBeInTheDocument();
      expect(screen.getByText('Hours Logged')).toBeInTheDocument();
      expect(screen.getByText('Earnings (MTD)')).toBeInTheDocument();
    });

    it('renders Start Video Session button', () => {
      renderDashboard();
      expect(screen.getByTestId('button-start-video-session-main')).toBeInTheDocument();
    });

    it('renders upcoming sessions section', () => {
      renderDashboard();
      expect(screen.getByText('Upcoming Sessions')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays stat values', () => {
      renderDashboard();

      // Check that stat cards are displayed with their values
      expect(screen.getByText('Active Clients')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Sessions This Week')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('renders VideoSessionDialog component', () => {
      renderDashboard();
      expect(screen.getByTestId('video-session-dialog')).toBeInTheDocument();
    });
  });

  describe('User Authentication', () => {
    it('renders correctly when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          email: 'coach@example.com',
          role: 'coach',
          firstName: 'Jane',
        },
      });

      renderDashboard();
      expect(screen.getByText(/Welcome back, Jane!/)).toBeInTheDocument();
    });

    it('handles user without firstName', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          email: 'coach@example.com',
          role: 'coach',
        },
      });

      renderDashboard();
      // Should still render without crashing
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    });
  });

  describe('Dashboard Sections', () => {
    it('displays upcoming sessions section', () => {
      renderDashboard();
      expect(screen.getByText('Upcoming Sessions')).toBeInTheDocument();
    });

    it('displays session information', () => {
      renderDashboard();
      expect(screen.getByText('Your scheduled coaching sessions')).toBeInTheDocument();
    });
  });
});
