import { useEffect } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Safety Exit Component
 *
 * Provides a quick exit button for users who may need to hide their activity quickly.
 * Critical feature for domestic violence survivors.
 *
 * Features:
 * - Visible "Quick Exit" button in navigation
 * - Keyboard shortcut (ESC key 3 times rapidly, or Ctrl+Shift+E)
 * - Redirects to weather.com (innocuous site)
 * - Attempts to clear browsing history for current page (browser-dependent)
 * - Replaces current page in history instead of adding to it
 */

const SAFE_URL = "https://www.weather.com/";
const ESC_PRESS_WINDOW = 1000; // milliseconds
const ESC_PRESS_COUNT = 3;

interface SafetyExitProps {
  className?: string;
  showButton?: boolean;
}

export function SafetyExit({ className = "", showButton = true }: SafetyExitProps) {
  useEffect(() => {
    let escPresses: number[] = [];

    const handleKeyPress = (event: KeyboardEvent) => {
      // Method 1: ESC key pressed 3 times within 1 second
      if (event.key === "Escape") {
        const now = Date.now();
        escPresses.push(now);

        // Remove old presses outside the window
        escPresses = escPresses.filter(time => now - time < ESC_PRESS_WINDOW);

        if (escPresses.length >= ESC_PRESS_COUNT) {
          quickExit();
        }
      }

      // Method 2: Ctrl+Shift+E keyboard shortcut
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        quickExit();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const quickExit = () => {
    // Replace current page in history to prevent back-button discovery
    window.location.replace(SAFE_URL);

    // Optional: Try to close the window if it was opened by script
    // This may not work in all browsers due to security restrictions
    try {
      window.close();
    } catch (e) {
      // Silently fail if close is not allowed
    }
  };

  if (!showButton) {
    // Still register keyboard shortcuts even if button is hidden
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={quickExit}
            variant="destructive"
            size="sm"
            className={`gap-2 ${className}`}
            aria-label="Quick exit - leaves site immediately"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Exit</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">
            <strong>Quick Exit</strong>
          </p>
          <p className="text-xs mt-1">
            Immediately leaves this site and goes to weather.com
          </p>
          <p className="text-xs mt-1 text-gray-400">
            Shortcuts: Press ESC 3 times quickly, or Ctrl+Shift+E
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Floating Safety Exit Button
 * Fixed position button for mobile users
 */
export function FloatingSafetyExit() {
  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <SafetyExit className="shadow-lg" />
    </div>
  );
}
