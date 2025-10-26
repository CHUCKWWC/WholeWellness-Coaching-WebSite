/**
 * Skip to Content Link
 *
 * WCAG 2.1 Level A requirement for keyboard navigation
 * Allows screen reader and keyboard users to bypass navigation
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-3 focus:min-h-[48px] focus:inline-flex focus:items-center focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 touch-target"
      data-testid="skip-to-content"
    >
      Skip to main content
    </a>
  );
}
