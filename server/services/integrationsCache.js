const axios = require("axios");

const GITHUB_API =
    "https://api.github.com/repos/RobloxChatLauncher/RobloxChatLauncher/git/trees/main?recursive=1";

const RAW_BASE =
    "https://raw.githubusercontent.com/RobloxChatLauncher/RobloxChatLauncher/main/";

const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const STALE_TTL = 1000 * 60 * 60; // serve stale for another hour if GitHub fails

let cache = null;
let cacheTime = 0;

function normalizePath(path) {

    const idx = path.indexOf("src/");

    if (idx === -1) {
        return null;
    }

    return path.substring(idx + 4);
}

async function buildCache() {

    const treeRes = await axios.get(GITHUB_API, {
        headers: {
            "User-Agent": "RobloxChatLauncher-Server"
        }
    });

    const luaFiles = treeRes.data.tree.filter(file =>
        file.type === "blob" &&
        file.path.startsWith("integrations/src/")
    );

    const files = await Promise.all(
        luaFiles.map(async (file) => {

            const displayPath =
                normalizePath(file.path);

            if (!displayPath) {
                return null;
            }

            const rawUrl = RAW_BASE + file.path;

            const contentRes = await axios.get(rawUrl, {
                responseType: "text"
            });

            return {
                path: displayPath,
                originalPath: file.path,
                name: displayPath.split("/").pop(),
                content: contentRes.data
            };
        })
    );

    return files
        .filter(Boolean)
        .sort((a, b) =>
            a.path.localeCompare(b.path)
        );
}

async function getIntegrations() {

    const now = Date.now();

    const isExpired =
        now - cacheTime > CACHE_TTL;

    if (!cache || isExpired) {

        try {

            const fresh =
                await buildCache();

            cache = fresh;
            cacheTime = now;

        } catch (err) {

            const staleAge =
                now - cacheTime;

            if (!cache || staleAge > CACHE_TTL + STALE_TTL) {
                throw err;
            }

            console.warn(
                "Serving stale integrations cache."
            );
        }
    }

    return cache;
}

module.exports = {
    getIntegrations
};