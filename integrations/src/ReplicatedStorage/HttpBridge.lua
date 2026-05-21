--!language luau
--[=[
    Copyright (c) 2026 Riri <https://github.com/RobloxChatLauncher>

    Source: https://github.com/RobloxChatLauncher/RobloxChatLauncher/blob/main/integrations/
    
    Licensed under the MPL 2.0 license.
    See https://www.mozilla.org/en-US/MPL/2.0/ for full text.
--]=]
local HttpService = game:GetService("HttpService")
local HttpBridge = {}

-------------------------------
-- Configuration
-------------------------------
local BASE_URL = "https://RobloxChatLauncher.onrender.com"
--[=[
    How to set your API key:
    1. Navigate to your [Creator Dashboard](https://create.roblox.com/dashboard/creations).
    2. Select your Experience (Universe).
    3. Go to **Settings** > **Secrets** (or navigate directly to `https://create.roblox.com/dashboard/creations/experiences/<your-universe-id>/secrets`).
    4. Click **Create Secret**.
    5. Set the Name to **`RCL_API_KEY`**.
    6. Paste your provided API key into the Value field and save.
--]=]
local API_KEY = HttpService:GetSecret("RCL_API_KEY")
local UNIVERSE_ID = tostring(game.GameId) -- game.GameId is the UniverseId. The game must be published or game.GameId will return 0 and requests will fail with 403.

-- Helper to format URLs consistently
local function formatUrl(path: string): string
    if path:sub(1, 4) == "http" then return path end
    if path:sub(1, 1) ~= "/" then path = "/" .. path end
    return BASE_URL .. path
end

-------------------------------
-- Sender (Egress)
-------------------------------
function HttpBridge.send(url: string, payload: table)
    local fullUrl = formatUrl(url)
    task.spawn(function()
        local success, result = pcall(function()
            return HttpService:RequestAsync({
                Url = fullUrl,
                Method = "POST",
                Headers = {
                    ["x-api-key"] = API_KEY,
                    ["x-universe-id"] = UNIVERSE_ID,
                    ["x-job-id"] = game.JobId,
                    ["Content-Type"] = "application/json"
                },
                Body = HttpService:JSONEncode(payload)
            })
        end)
        if not success then warn("[RCL::Egress] Error:", result) end
    end)
end

-------------------------------
-- Listener (Ingress)
-------------------------------
local handlers = {} 
local isPolling = false

function HttpBridge.registerHandler(handler: (any) -> ())
    table.insert(handlers, handler)
    
    if not isPolling then
        isPolling = true
        HttpBridge._startCentralLoop("/api/v1/commands")
    end
end

function HttpBridge._startCentralLoop(endpoint: string)
    local fullUrl = formatUrl(endpoint)

    -- attach headers for auth
    local headers = {
        ["x-api-key"] = API_KEY,
        ["x-universe-id"] = UNIVERSE_ID,
        ["x-job-id"] = game.JobId
    }

    local MIN_RECONNECT_DELAY = 1 -- seconds
    local LONG_POLL_TIMEOUT = 65 -- must be higher than server timeout (55 seconds)

    task.spawn(function()
        while true do
            local requestStartedAt = os.clock()

            local success, response = pcall(function()
                return HttpService:RequestAsync({
                    Url = fullUrl,
                    Method = "GET",
                    Headers = headers,
                    Timeout = LONG_POLL_TIMEOUT
                })
            end)

            local elapsed = os.clock() - requestStartedAt

            if success and response.Success then
                local body = response.Body

                if #body > 2 then
                    local ok, decodedData = pcall(
                        HttpService.JSONDecode,
                        HttpService,
                        body
                    )

                    if ok then
                        for _, handlerFunc in ipairs(handlers) do
                            task.spawn(handlerFunc, decodedData)
                        end
                    else
                        warn("[RCL::Ingress] Failed to decode JSON")
                    end
                end

            elseif not success then
                warn("[RCL::Ingress] Connection error:", response)

            elseif response.StatusCode == 403 then
                warn("[RCL::Ingress] Auth Failed: Check API Key and UniverseID")

            elseif response.StatusCode ~= 200 then
                warn(
                    "[RCL::Ingress] HTTP Error:",
                    response.StatusCode,
                    response.StatusMessage
                )
            end

            -- Guard against using too much HTTP quota if server always responds instantly
            if elapsed < MIN_RECONNECT_DELAY then
                task.wait(MIN_RECONNECT_DELAY - elapsed)
            end
        end
    end)
end

return HttpBridge
