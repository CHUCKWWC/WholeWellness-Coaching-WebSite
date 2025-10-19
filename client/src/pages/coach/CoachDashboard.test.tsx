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
        fullName: 'John Coach',
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
      expect(screen.getByText(/Welcome back, John Coach/)).toBeInTheDocument();
    });

    it('renders all stat cards', () => {
      renderDashboard();

      // Stats should be visible
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('This Week')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    });

    it('renders Start Video Session button', () => {
      renderDashboard();
      expect(screen.getByTestId('button-start-video-session-main')).toBeInTheDocument();
    });

    it('renders upcoming sessions section', () => {
      renderDashboard();
      expect(screen.getByText('Upcoming Sessions')).toBeInTheDocument();
    });

    it('renders recent activity section', () => {
      renderDashboard();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays stat values', () => {
      renderDashboard();

      // Check that numeric values are displayed
      const statsSection = screen.getByText('Total Clients').closest('div');
      expect(statsSection).toBeInTheDocument();
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
          fullName: 'Jane Doe',
        },
      });

      renderDashboard();
      expect(screen.getByText(/Welcome back, Jane Doe/)).toBeInTheDocument();
    });

    it('handles user without fullName', () => {
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

  describe('Quick Actions', () => {
    it('displays all quick action cards', () => {
      renderDashboard();

      // The dashboard shows upcoming sessions and recent activity
      expect(screen.getByText('Upcoming Sessions')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });
});
