const express = require('express');
const router = express.Router();
const axios = require('axios');
const { marked } = require('marked');

const GITHUB_README_URL = 'https://raw.githubusercontent.com/RobloxChatLauncher/.github/refs/heads/main/profile/README.md';

let cache = { data: null, lastFetched: 0 };
const CACHE_DURATION = 60000 * 60;

router.get('/', async (req, res) => {
    try {
        const now = Date.now();
        let markdown;

        if (cache.data && (now - cache.lastFetched < CACHE_DURATION)) {
            markdown = cache.data;
        } else {
            const response = await axios.get(GITHUB_README_URL, { timeout: 5000 });
            markdown = response.data;
            cache = { data: markdown, lastFetched: now };
        }

        const htmlContent = marked.parse(markdown);

        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Roblox Chat Launcher</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #ffffff; --text: #1a1a1a; --code-bg: #f6f8fa; }
        @media (prefers-color-scheme: dark) {
            :root { --bg: #0d1117; --text: #c9d1d9; --code-bg: #161b22; }
        }
        body { 
            background: var(--bg); color: var(--text); 
            font-family: 'Inter', sans-serif; line-height: 1.6; 
            max-width: 850px; margin: 0 auto; padding: 2rem; 
        }
        pre { background: var(--code-bg); padding: 1rem; border-radius: 6px; overflow: auto; }
        code { font-family: monospace; }
        img { max-width: 100%; }
        /* GitHub Dark/Light Mode support */
        img[src*="#gh-dark-mode-only"] { display: none; }
        @media (prefers-color-scheme: dark) {
            img[src*="#gh-light-mode-only"] { display: none; }
            img[src*="#gh-dark-mode-only"] { display: inline-block; }
        }
    </style>
</head>
<body>${htmlContent}</body>
</html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error syncing documentation.');
    }
});

module.exports = router;