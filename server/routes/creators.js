const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const pow = require("../utils/pow");

const {
    generateCode,
    validateCreator
} = require("../services/apiKeySelfService");

router.get("/challenge", (req, res) => {
    const ip = req.ip;
    const challenge = pow.generateChallenge(ip);
    res.json(challenge);
});

/* -----------------------------
   generate code endpoint
----------------------------- */
router.post("/generate", generateCode);

/* -----------------------------
   validate endpoint
----------------------------- */
router.post("/confirm", async (req, res) => {
    const { userId, universeId, seed, nonce } = req.body;

    const result = await validateCreator(userId, universeId, seed, nonce);

    if (result.ok) {
        // 64 characters sha256 hex (32 bytes)
        const apiKey = crypto.randomBytes(32).toString('hex');

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