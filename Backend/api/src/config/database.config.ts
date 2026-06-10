export interface DatabaseCredentials {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export interface RedisCredentials {
    host: string;
    port: number;
    password: string;
    sessionTTL: number;
}

export interface DatabaseConfig {
    database: DatabaseCredentials;
    redis: RedisCredentials;
}

export const databaseConfig = (): DatabaseConfig => ({
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5434,
        user: process.env.DB_USER || 'farmaq_user',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'farmaq_db',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6381,
        password: process.env.REDIS_PASSWORD || '',
        sessionTTL: process.env.SESSION_TTL ? Number(process.env.SESSION_TTL) : 14400,
    },
});

export const getDatabaseConfig = (): DatabaseCredentials => databaseConfig().database;

export const getRedisConfig = (): RedisCredentials => databaseConfig().redis;