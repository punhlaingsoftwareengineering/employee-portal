import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { account, session, user, verification } from './schema/auth.schema';
import { AUTH_DATABASE_URL, DATABASE_URL } from '$app/env/private';

const authDatabaseUrl = AUTH_DATABASE_URL?.trim() || DATABASE_URL;
if (!authDatabaseUrl) throw new Error('AUTH_DATABASE_URL or DATABASE_URL is not set');

const authPool = new pg.Pool({ connectionString: authDatabaseUrl });

const authSchema = { user, session, account, verification };

export const authDb = drizzle(authPool, { schema: authSchema });
