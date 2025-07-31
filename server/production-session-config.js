// Production session configuration
// Replaces MemoryStore with PostgreSQL session store for production deployments

import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const PgSession = connectPgSimple(session);

export function createProductionSessionConfig() {
  const sessionConfig = {
    secret: process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-session-secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    }
  };

  // Use PostgreSQL session store in production with lazy initialization
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
      // Initialize PostgreSQL session store with minimal blocking
      sessionConfig.store = new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'session',
        createTableIfMissing: false, // Don't block on table creation
        pruneSessionInterval: false, // Disable auto-pruning to prevent blocking
        ttl: 24 * 60 * 60, // Session TTL in seconds (24 hours)
        connect: {
          connectionTimeoutMillis: 500, // Very short timeout
          idleTimeoutMillis: 10000,
          max: 2, // Minimal connection pool for startup
          application_name: 'wellness_app_sessions'
        }
      });
      console.log('✓ PostgreSQL session store configured (lazy initialization)');
    } catch (error) {
      console.error('Failed to configure PostgreSQL session store:', error);
      console.log('✓ Falling back to memory store');
      // Fallback to memory store on any configuration error
    }
  } else {
    console.log('✓ Using memory session store for development');
  }

  return sessionConfig;
}

export function initializeSessionStore() {
  return createProductionSessionConfig();
}