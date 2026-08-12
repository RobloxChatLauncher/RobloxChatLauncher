// Small helper module to manage a PostgreSQL connection pool using the 'pg' library.
const { Pool } = require('pg');

const Env = require('../config/env');

// ===== START SUNSET =====
const SUNSET_DATE = new Date("2027-01-01T00:00:00Z");

let pool = null;

function isBeforeSunset() {
    return Date.now() < SUNSET_DATE.getTime();
}

async function closePoolAtSunset() {
    const remaining = SUNSET_DATE.getTime() - Date.now();

    // Sunset has been reached.
    if (remaining <= 0) {
        console.log("Sunset reached. Closing PostgreSQL pool...");

        if (!pool) {
            return;
        }

        try {
            await pool.end();
            pool = null;
            console.log("PostgreSQL pool closed.");
        } catch (err) {
            console.error("Failed to close PostgreSQL pool:", err);
        }

        return;
    }

    // workaround for integer overflow
    const MAX_TIMEOUT = 2_147_483_647;

    setTimeout(() => {
        closePoolAtSunset();
    }, Math.min(remaining, MAX_TIMEOUT));
}

if (isBeforeSunset()) {
    pool = new Pool({
        connectionString: Env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    closePoolAtSunset();
}
// ===== END SUNSET =====

async function initDatabase() {
    // ===== START SUNSET =====
    if (!pool || !isBeforeSunset()) {
        console.log("Database initialization skipped: service has reached sunset.");
        return;
    }
    // ===== END SUNSET =====

    await pool.query(`
        CREATE TABLE IF NOT EXISTS verified_users (
            hwid TEXT PRIMARY KEY,
            roblox_id BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS game_registry (
            universe_id BIGINT PRIMARY KEY,
            creator_id BIGINT NOT NULL,
            group_id BIGINT DEFAULT NULL,
            api_key TEXT UNIQUE NOT NULL,
            is_unlisted BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

module.exports = { pool, initDatabase };