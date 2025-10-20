/**
 * CSRF Token Management Utility
 *
 * This module handles CSRF token retrieval and inclusion in API requests
 * Works with the server-side double-submit cookie pattern
 */

const CSRF_HEADER_NAME = 'X-CSRF-Token';

let cachedCsrfToken: string | null = null;

/**
 * Fetch CSRF token from server
 * Token is automatically stored in httpOnly cookie by server
 */
export async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }

  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }

    const data = await response.json();
    cachedCsrfToken = data.csrfToken;

    return cachedCsrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

/**
 * Get CSRF headers for API requests
 * This should be included in all state-changing requests (POST, PUT, DELETE, PATCH)
 */
export async function getCsrfHeaders(): Promise<Record<string, string>> {
  const token = await getCsrfToken();
  return {
    [CSRF_HEADER_NAME]: token,
  };
}

/**
 * Clear cached CSRF token (e.g., after logout)
 */
export function clearCsrfToken(): void {
  cachedCsrfToken = null;
}

/**
 * Wrapper for fetch that automatically includes CSRF token
 * Use this for all API requests that modify data
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';

  // Only add CSRF token for state-changing requests
  const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  if (needsCsrf) {
    const csrfHeaders = await getCsrfHeaders();

    options.headers = {
      ...options.headers,
      ...csrfHeaders,
    };
  }

  // Always include credentials for cookie handling
  options.credentials = 'include';

  return fetch(url, options);
}
