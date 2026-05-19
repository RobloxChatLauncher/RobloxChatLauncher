const path = require("path");

const RAW_BASE =
    "https://raw.githubusercontent.com/RobloxChatLauncher/RobloxChatLauncher/main/assets/brand/";

const CACHE_TTL = 1000 * 60 * 60;

let cache = null;
let cacheTime = 0;

const EVENTS = [
    {
        id: "tdov",

        start: {
            month: 3,
            day: 31
        },

        end: {
            month: 3,
            day: 31
        },

        logos: {
            dark: "rcl_logo_tdov_dark.webp",
            light: "rcl_logo_tdov_light.webp"
        }
    },
    {
        id: "pride",

        start: {
            month: 6,
            day: 1
        },

        end: {
            month: 6,
            day: 30
        },

        logos: {
            dark: "rcl_logo_pride_dark.webp",
            light: "rcl_logo_pride_light.webp"
        }
    }
];

const DEFAULT_LOGOS = {
    dark: "rcl_logo_dark.webp",
    light: "rcl_logo_light.webp"
};

function isDateInRange(now, start, end) {

    const current =
        now.getMonth() * 100 + now.getDate();

    const startValue =
        (start.month - 1) * 100 + start.day;

    const endValue =
        (end.month - 1) * 100 + end.day;

    return current >= startValue &&
        current <= endValue;
}

function getActiveEvent() {

    const now = new Date();

    for (const event of EVENTS) {

        if (
            isDateInRange(
                now,
                event.start,
                event.end
            )
        ) {
            return event;
        }
    }

    return null;
}

function normalizeTheme(theme) {

    if (theme === "light") {
        return "light";
    }

    return "dark";
}

function buildLogoUrl(file) {

    return RAW_BASE + encodeURIComponent(file);
}

function buildCache() {

    const activeEvent =
        getActiveEvent();

    const logos = {
        dark: DEFAULT_LOGOS.dark,
        light: DEFAULT_LOGOS.light
    };

    if (activeEvent) {

        if (activeEvent.logos.dark) {
            logos.dark =
                activeEvent.logos.dark;
        }

        if (activeEvent.logos.light) {
            logos.light =
                activeEvent.logos.light;
        }
    }

    return {
        generatedAt: Date.now(),
        activeEvent: activeEvent?.id || null,

        urls: {
            dark: buildLogoUrl(logos.dark),
            light: buildLogoUrl(logos.light)
        }
    };
}

async function getLogo(theme) {

    const now = Date.now();

    const isExpired =
        now - cacheTime > CACHE_TTL;

    if (!cache || isExpired) {

        cache =
            buildCache();

        cacheTime =
            now;
    }

    const normalizedTheme =
        normalizeTheme(theme);

    return cache.urls[normalizedTheme];
}

module.exports = {
    getLogo
};