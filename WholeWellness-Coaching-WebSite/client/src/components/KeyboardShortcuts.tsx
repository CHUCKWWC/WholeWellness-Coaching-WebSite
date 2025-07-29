import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface ShortcutHandler {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export default function KeyboardShortcuts() {
  const [, setLocation] = useLocation();

  const shortcuts: ShortcutHandler[] = [
    {
      key: '/',
      action: () => {
        // Focus search - trigger search modal
        document.dispatchEvent(new CustomEvent('openSearch'));
      },
      description: 'Open search'
    },
    {
      key: 'h',
      altKey: true,
      action: () => setLocation('/'),
      description: 'Go to home'
    },
    {
      key: 'a',
      altKey: true,
      action: () => setLocation('/ai-coaching'),
      description: 'Open AI coaching'
    },
    {
      key: 'w',
      altKey: true,
      action: () => setLocation('/wellness-journey'),
      description: 'Open wellness journey'
    },
    {
      key: 'e',
      altKey: true,
      action: () => setLocation('/assessments'),
      description: 'Open assessments'
    },
    {
      key: 'g',
      altKey: true,
      action: () => setLocation('/digital-onboarding'),
      description: 'Get started'
    },
    {
      key: 'c',
      altKey: true,
      action: () => setLocation('/coach-certifications'),
      description: 'Open certifications'
    }
  ];

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      const shortcut = shortcuts.find(s => 
        s.key === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.altKey === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [setLocation]);

  return null; // This component doesn't render anything
}

// Helper component to show keyboard shortcuts hint
export function KeyboardShortcutsHint() {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs opacity-75 hover:opacity-100 transition-opacity">
        Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">/ </kbd> to search • 
        <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs mx-1">Alt+A</kbd> for AI coaching • 
        <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Alt+W</kbd> for wellness journey
      </div>
    </div>
  );
}