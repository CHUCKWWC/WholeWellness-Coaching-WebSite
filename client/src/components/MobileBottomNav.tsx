import { useLocation } from 'wouter';
import { Home, MessageCircle, Video, BookOpen, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles?: string[];
}

export default function MobileBottomNav() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Only show on mobile devices
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (!isMobile) return null;

  // Hide on certain pages (video sessions, full-screen experiences)
  const hideOnPaths = ['/session/', '/login', '/register', '/onboarding'];
  const shouldHide = hideOnPaths.some(path => location.includes(path));
  if (shouldHide) return null;

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: 'Home',
      path: isAuthenticated ? '/dashboard' : '/',
    },
    {
      icon: MessageCircle,
      label: 'AI Coach',
      path: '/ai-coaching',
    },
    {
      icon: Video,
      label: 'Video',
      path: user?.role === 'coach' ? '/coach-dashboard' : '/join',
    },
    {
      icon: BookOpen,
      label: 'Resources',
      path: '/resources',
    },
    {
      icon: User,
      label: 'Profile',
      path: isAuthenticated ? '/profile' : '/login',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/' || path === '/dashboard') {
      return location === '/' || location === '/dashboard';
    }
    return location.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 safe-bottom md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon 
                className={`h-6 w-6 mb-1 transition-all ${
                  active ? 'scale-110' : 'scale-100'
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span 
                className={`text-xs font-medium ${
                  active ? 'opacity-100' : 'opacity-70'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
