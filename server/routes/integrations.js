const express = require("express");
const router = express.Router();

const {
    getIntegrations
} = require("../services/integrationsCache");

/**
 * @openapi
 * /api/v1/integrations:
 *   get:
 *     summary: Retrieve available integrations
 *     description: Fetches a list of Lua integration files from the GitHub repository. Results are cached server-side for 1 hour.
 *     tags: [Public, Assets]
 *     responses:
 *       200:
 *         description: A JSON object containing an array of integration files.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                         description: The normalized path relative to the src directory.
 *                         example: "ReplicatedStorage/example_integration.lua"
 *                       originalPath:
 *                         type: string
 *                         description: The full path within the GitHub repository.
 *                         example: "integrations/src/ReplicatedStorage/example_integration.lua"
 *                       name:
 *                         type: string
 *                         description: The filename extracted from the path.
 *                         example: "example_integration.lua"
 *                       content:
 *                         type: string
 *                         description: The raw source code of the integration file.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to load integrations."
 */
router.get("/", async (req, res) => {

    try {

        const files =
            await getIntegrations();

        res.json({
            files
        });

    } catch {

        res.status(500).json({
            error: "Failed to load integrations."
        });
    }
});

module.exports = router;