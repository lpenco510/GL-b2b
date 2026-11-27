import { createRateLimiter } from '@gravl/auth';

/** 5 intentos de login cada 10 minutos por IP. Singleton del proceso del servidor. */
export const loginLimiter = createRateLimiter({ max: 5, windowMs: 10 * 60_000 });
