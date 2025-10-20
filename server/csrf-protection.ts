import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Modern CSRF Protection using Double Submit Cookie Pattern
 *
 * This implementation:
 * 1. Generates a random CSRF token for each session
 * 2. Stores it in an httpOnly cookie
 * 3. Client must send the token in a custom header for state-changing requests
 * 4. Server validates that cookie and header match
 *
 * This approach is more secure than the deprecated 'csurf' package
 */

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Middleware to set CSRF token in cookie
 * Should be applied to all routes that render forms or serve the SPA
 */
export const setCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Only generate new token if one doesn't exist
  if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateToken();

    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Also expose token to client via response header for them to read
    res.setHeader('X-CSRF-Token', token);
  } else {
    // Token exists, expose it via header
    res.setHeader('X-CSRF-Token', req.cookies[CSRF_COOKIE_NAME]);
  }

  next();
};

/**
 * Middleware to validate CSRF token
 * Should be applied to all state-changing operations (POST, PUT, DELETE, PATCH)
 */
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF validation for:
  // 1. Safe HTTP methods (GET, HEAD, OPTIONS)
  // 2. Health check endpoints
  // 3. Webhook endpoints that use other authentication
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const skipPaths = ['/health', '/api/webhooks'];

  if (safeMethods.includes(req.method) || skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Get token from cookie and header
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME.toLowerCase()];

  // Both must exist and match
  if (!cookieToken || !headerToken) {
    console.warn('CSRF validation failed: Missing token', {
      path: req.path,
      method: req.method,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken
    });

    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'This request requires a valid CSRF token'
    });
  }

  // Use timing-safe comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken as string))) {
    console.warn('CSRF validation failed: Token mismatch', {
      path: req.path,
      method: req.method
    });

    return res.status(403).json({
      error: 'CSRF token invalid',
      message: 'The CSRF token provided does not match'
    });
  }

  // Token is valid
  next();
};

/**
 * Route handler to get CSRF token
 * Client can call this endpoint to retrieve the CSRF token
 */
export const getCsrfToken = (req: Request, res: Response) => {
  const token = req.cookies?.[CSRF_COOKIE_NAME] || generateToken();

  // Set cookie if not already set
  if (!req.cookies?.[CSRF_COOKIE_NAME]) {
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  res.json({
    csrfToken: token,
    headerName: CSRF_HEADER_NAME
  });
};

/**
 * Express app configuration helper
 * Sets up CSRF protection for the entire application
 */
export function setupCsrfProtection(app: any) {
  // Apply CSRF token generation to all routes
  app.use(setCsrfToken);

  // Add endpoint to get CSRF token
  app.get('/api/csrf-token', getCsrfToken);

  // Apply CSRF validation to API routes (excluding auth endpoints initially for easier testing)
  // You can be more selective based on your needs
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for initial auth endpoints to avoid chicken-and-egg problem
    const authSkipPaths = ['/api/auth/login', '/api/auth/register', '/api/csrf-token'];

    if (authSkipPaths.includes(req.path)) {
      return next();
    }

    return validateCsrfToken(req, res, next);
  });
}
