const express = require("express");
const router = express.Router();

const {
    getLogo
} = require("../services/logoCache");

/**
 * @openapi
 * /api/v1/logo/{theme}:
 *   get:
 *     summary: Retrieve a logo by theme
 *     description: Fetches a URL for the requested logo based on the provided theme. The response is a 302 redirect to the logo asset.
 *     tags: [Public, Assets]
 *     parameters:
 *       - in: path
 *         name: theme
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the theme to retrieve the logo for ('light' or 'dark'). Retrieves logo for 'dark' if invalid.
 *     responses:
 *       302:
 *         description: Redirects to the logo asset URL.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to load logo."
 */
router.get("/:theme", async (req, res) => {

    try {

        const theme = req.params.theme;

        const logo =
            await getLogo(theme);

        res.redirect(logo);

    } catch {

        res.status(500).json({
            error: "Failed to load logo."
        });
    }
});

module.exports = router;
