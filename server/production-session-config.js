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

  // Use PostgreSQL session store in production
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
      sessionConfig.store = new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'session',
        createTableIfMissing: true,
        pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
        ttl: 24 * 60 * 60 // Session TTL in seconds (24 hours)
      });
      console.log('✓ PostgreSQL session store initialized for production');
    } catch (error) {
      console.error('Failed to initialize PostgreSQL session store:', error);
      console.log('Falling back to memory store (not recommended for production)');
    }
  } else {
    console.log('✓ Using memory session store for development');
  }

  return sessionConfig;
}

export function initializeSessionStore() {
  return createProductionSessionConfig();
}