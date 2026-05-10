const axios = require('axios');
const crypto = require('crypto');

const { pool } = require('../db/postgresPool');
const { safeCompare } = require('../utils/secureCompare');
const { hashKey } = require('../utils/hashKey');

/**
 * Validates the UniverseId and API Key against the PostgreSQL registry.
 */
async function authenticateGameServer(universeId, apiKey) {
    if (!universeId || !apiKey) return false;

    try {
        const query = `
            SELECT api_key
            FROM game_registry
            WHERE universe_id = $1
            LIMIT 1
        `;

        const result = await pool.query(query, [universeId]);

        // Always hash input
        const hashedInput = hashKey(apiKey);

        if (result.rowCount === 0) {
            // Fake compare to prevent oracle
            const fake = '0'.repeat(64); // 64 hex chars (sha256 hex)
            safeCompare(hashedInput, fake);
            return false;
        }

        const storedHash = result.rows[0].api_key;

        return safeCompare(hashedInput, storedHash);

    } catch (err) {
        console.error("Database Auth Error:", err);
        return false;
    }
}

async function getAllGames() {
    const res = await pool.query('SELECT universe_id, created_at FROM game_registry ORDER BY created_at DESC');
    return res.rows;
}

async function upsertGame(universeId, apiKey) {
    const hashedKey = hashKey(apiKey);

    const query = `
        INSERT INTO game_registry (universe_id, api_key)
        VALUES ($1, $2)
        ON CONFLICT (universe_id) 
        DO UPDATE SET api_key = EXCLUDED.api_key;
    `;

    await pool.query(query, [universeId, hashedKey]);
}

async function removeGame(universeId) {
    await pool.query('DELETE FROM game_registry WHERE universe_id = $1', [universeId]);
}

async function getPublicGameStatus(universeId) {
    const query = `
        SELECT universe_id, is_public 
        FROM game_registry 
        WHERE universe_id = $1 
        LIMIT 1
    `;
    const result = await pool.query(query, [universeId]);

    if (result.rowCount === 0) return null; // Game not in registry at all

    const game = result.rows[0];
    return game.is_public ? { universe_id: game.universe_id, registered: true } : null;
}

async function updateGameVisibility(universeId, isPublic) {
    await pool.query(
        'UPDATE game_registry SET is_public = $1 WHERE universe_id = $2',
        [isPublic, universeId]
    );
    return true;
}

module.exports = {
    authenticateGameServer,
    getAllGames,
    getPublicGameStatus,
    upsertGame,
    removeGame,
    updateGameVisibility
};
