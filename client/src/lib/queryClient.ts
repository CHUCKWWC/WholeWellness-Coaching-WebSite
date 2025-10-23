import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// CSRF token cache
let csrfToken: string | null = null;

// Helper to get CSRF token from server
async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include',
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken!;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return '';
  }
}

type ApiRequestData = BodyInit | Record<string, unknown> | undefined;

interface ApiRequestOptions extends RequestInit {
  skipCsrf?: boolean;
}

function isBodyInit(data: unknown): data is BodyInit {
  if (data == null) {
    return false;
  }

  if (typeof data === 'string') {
    return true;
  }

  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    return true;
  }

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return true;
  }

  if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
    return true;
  }

  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return true;
  }

  if (typeof ReadableStream !== 'undefined' && data instanceof ReadableStream) {
    return true;
  }

  return false;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: ApiRequestData,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const {
    skipCsrf,
    headers: initHeaders,
    body: initBody,
    credentials,
    method: _ignoredMethod,
    ...restOptions
  } = options;

  const headers = new Headers(initHeaders as HeadersInit | undefined);

  let body: BodyInit | undefined;

  if (isBodyInit(data)) {
    body = data;
  } else if (data !== undefined) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    body = JSON.stringify(data);
  } else if (initBody != null) {
    body = initBody as BodyInit;
  }

  const upperMethod = method.toUpperCase();
  const shouldAttachCsrf =
    !skipCsrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod);

  if (shouldAttachCsrf) {
    const token = await getCsrfToken();
    if (token) {
      headers.set('x-csrf-token', token);
    }
  }

  const response = await fetch(url, {
    ...restOptions,
    method: upperMethod,
    headers,
    body,
    credentials: credentials ?? 'include',
  });

  await throwIfResNotOk(response);
  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - balance between freshness and performance
      gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data in cache
      retry: (failureCount, error: any) => {
        // Retry on network errors, but not on 4xx client errors
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
          return false;
        }
        return failureCount < 2; // Max 2 retries
      },
    },
    mutations: {
      retry: false, // Don't retry mutations to avoid duplicate submissions
    },
  },
});
