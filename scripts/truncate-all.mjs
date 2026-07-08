import pg from 'pg';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDatabaseUrl() {
	const envPath = resolve(process.cwd(), '.env');
	const env = readFileSync(envPath, 'utf8');
	const match = env.match(/^DATABASE_URL=(.+)$/m);
	if (!match) throw new Error('DATABASE_URL not found in .env');
	return match[1].trim();
}

const pool = new pg.Pool({ connectionString: loadDatabaseUrl() });
const client = await pool.connect();

try {
	const { rows } = await client.query(
		`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
	);
	const tables = rows.map((row) => row.tablename);

	if (tables.length === 0) {
		console.log('No tables found in public schema.');
	} else {
		const quoted = tables.map((table) => `"${table}"`).join(', ');
		await client.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
		console.log(`Truncated ${tables.length} tables:`);
		for (const table of tables) console.log(` - ${table}`);
	}
} finally {
	client.release();
	await pool.end();
}
