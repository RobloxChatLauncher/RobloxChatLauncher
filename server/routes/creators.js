const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const pow = require("../utils/pow");

const {
    generateCode,
    validateCreator
} = require("../services/apiKeySelfService");

/**
 * @openapi
 * /api/v1/creators/challenge:
 *  get:
 *    summary: Request a Proof of Work challenge
 *    description: Provides a unique seed and difficulty level. The web browser must solve this challenge before calling the generate endpoint to prevent automated spam.
 *    tags: [Creators]
 *    responses:
 *      200:
 *        description: Challenge generated successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                seed:
 *                  type: string
 *                  example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 *                difficulty:
 *                  type: integer
 *                  example: 4
 *      500:
 *        description: Server error while generating challenge
 */
router.get("/challenge", (req, res) => {
    const ip = req.ip;
    const challenge = pow.generateChallenge(ip);
    res.json(challenge);
});

/**
 * @openapi
 * /api/v1/creators/generate:
 *   post:
 *     summary: Generate a verification code for a Roblox ID
 *     description: >
 *       Creates a temporary verification code that the creator must place in their Roblox profile description to verify ownership.
 *       Requires a valid Proof of Work solution (seed and nonce) obtained from the challenge endpoint.
 *     tags: [Creators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - robloxId
 *               - seed
 *               - nonce
 *             properties:
 *               robloxId:
 *                 type: string
 *                 example: "123456789""
 *               seed:
 *                 type: string
 *                 example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 *               nonce:
 *                 type: integer
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Verification code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "rcl cottage condone envision lanky outboard walnut"
 *                 robloxId:
 *                   type: integer
 *                   example: 12345678
 *       400:
 *         description: Missing username
 *       401:
 *        description: Invalid or missing Proof of Work solution
 *       404:
 *         description: Roblox user not found
 *       500:
 *         description: API error or server error
 */
router.post("/generate", generateCode);

/**
 * @openapi
 * /api/v1/creators/confirm:
 *   post:
 *     summary: Confirm creator ownership and issue API key
 *     description: >
 *       Validates that the verification code exists in the user's Roblox profile and 
 *       checks if the user has owner-level permissions for the specified Universe.
 *     tags: [Creators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - robloxId
 *               - universeId
 *               - seed
 *               - nonce
 *             properties:
 *               robloxId:
 *                 type: string
 *                 example: "12345678"
 *                 description: "The Roblox User ID"
 *               universeId:
 *                 type: string
 *                 example: "987654321"
 *                 description: "The Roblox Universe ID to verify ownership of"
 *               seed:
 *                 type: string
 *                 example: "random_seed_string"
 *               nonce:
 *                 type: integer
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Verification successful, returns the generated API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 apiKey:
 *                   type: string
 *                   example: "rcl_5f3a9e1...7b2c9d0"
 *                   description: "64-character SHA256 hex string"
 *                 message:
 *                   type: string
 *                   example: "Verification successful"
 *       403:
 *         description: Verification failed (e.g., code missing, wrong owner, or rank too low)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 reason:
 *                   type: string
 *                   example: "Profile code missing"
 *       500:
 *         description: Internal server error or Roblox API failure
 */
router.post("/confirm", async (req, res) => {
    const { robloxId, universeId, seed, nonce } = req.body;

    const result = await validateCreator(robloxId, universeId, seed, nonce);

    if (result.ok) {
        // 64 characters sha256 hex (32 bytes)
        const apiKey = `rcl_${crypto.randomBytes(32).toString('hex')}`;

        return res.json({
            ok: true,
            apiKey: apiKey,
            message: "Verification successful"
        });
    } else {
        return res.status(403).json(result);
    }
});

module.exports = router;