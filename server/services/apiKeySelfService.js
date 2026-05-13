// Allows self-serve API key generation
const axios = require("axios");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const Constants = require('../config/constants');
const pow = require("../utils/pow");

// wordlist
const WORDLIST_PATH = path.join(__dirname, '../data/eff_large_wordlist.txt');

const WORDS = fs.readFileSync(WORDLIST_PATH, 'utf8')
    .split(/\r?\n/)
    .map(line => line.split('\t')[1])
    .filter(Boolean);

// memory store
const pendingCreatorChecks = new Map();

setInterval(() => {
    const now = Date.now();
    for (const [id, v] of pendingCreatorChecks.entries()) {
        if (v.expiresAt < now) pendingCreatorChecks.delete(id);
    }
}, 60_000).unref();

/* -----------------------------
   ROBLOX HELPERS
----------------------------- */

async function getUniverseCreator(universeId) {
    const res = await axios.get(
        `https://games.roblox.com/v1/games?universeIds=${universeId}`
    );

    return res.data?.data?.[0]?.creator || null;
}

async function getUserGroups(robloxId) {
    const res = await axios.get(
        `https://groups.roblox.com/v2/users/${robloxId}/groups/roles`
    );

    return res.data?.data || [];
}

async function getProfileDescription(robloxId) {
    const res = await axios.get(
        `https://users.roblox.com/v1/users/${robloxId}`
    );

    return res.data?.description || "";
}

/* -----------------------------
   PROFILE CODE GENERATION
----------------------------- */

async function generateCode(req, res) {
    const { robloxId, seed, nonce } = req.body;

    if (!seed || !nonce || !pow.verify(seed, nonce)) {
        return res.status(401).send("Invalid PoW");
    }

    if (!robloxId) {
        return res.status(400).send("User ID required");
    }

    try {
        const userRes = await axios.get(
            `https://users.roblox.com/v1/users/${robloxId}`
        );

        if (!userRes.data?.id) {
            return res.status(404).send("User not found");
        }

        const code = `rcl ${Array.from({ length: 6 }, () =>
            WORDS[crypto.randomInt(0, WORDS.length)].toLowerCase()
        ).join(' ')}`;

        pendingCreatorChecks.set(Number(robloxId), {
            code,
            expiresAt: Date.now() + Constants.VERIFICATION_TTL_MS
        });

        res.json({ robloxId, code });

    } catch (err) {
        console.error(err);
        res.status(500).send("API Error");
    }
}

/* -----------------------------
   VALIDATION CORE
----------------------------- */

async function validateCreator(robloxId, universeId, seed, nonce) {
    if (!pow.verify(seed, nonce)) {
        return { ok: false, reason: "PoW failed" };
    }

    const pending = pendingCreatorChecks.get(Number(robloxId));

    if (!pending || Date.now() > pending.expiresAt) {
        return { ok: false, reason: "No profile verification" };
    }

    const description = await getProfileDescription(robloxId);

    if (!description.includes(pending.code)) {
        return { ok: false, reason: "Profile code missing" };
    }

    pendingCreatorChecks.delete(Number(robloxId));

    const creator = await getUniverseCreator(universeId);

    if (!creator) return { ok: false, reason: "Universe not found" };

    if (creator.type === "User") {
        return {
            ok: Number(creator.id) === Number(robloxId),
            reason: "User owner check"
        };
    }

    if (creator.type === "Group") {
        const groups = await getUserGroups(robloxId);

        const match = groups.find(
            g => Number(g.group.id) === Number(creator.id)
        );

        if (!match) return { ok: false, reason: "Not in group" };

        const rank = match.role.rank;

        return {
            // Using a range here to allow for changes in allowed range
            ok: rank >= 255 && rank <= 255,
            reason: `Rank ${rank}`
        };
    }

    return { ok: false, reason: "Invalid creator type" };
}

module.exports = {
    generateCode,
    validateCreator
};