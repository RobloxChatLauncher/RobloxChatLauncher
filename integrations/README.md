<p align="center">
    <img src="https://github.com/RobloxChatLauncher/RobloxChatLauncher/raw/main/assets/brand/rcl_integrations_logo_dark.webp#gh-dark-mode-only" width="700">
    <img src="https://github.com/RobloxChatLauncher/RobloxChatLauncher/raw/main/assets/brand/rcl_integrations_logo_light.webp#gh-light-mode-only" width="700">
</p>

<!--
<div align="center">
  <h1>Roblox Chat Launcher Integrations</h1>
</div>
-->

<div align="center">
  
[![License](https://img.shields.io/badge/license-MPL%202.0-brightgreen)](LICENSE)
[![Lua](https://img.shields.io/badge/Lua-%232C2D72.svg?logo=lua&logoColor=white)](#)
[![e dance](https://img.shields.io/badge//e-dance-blue)](#)

</div>

<div align="center">

[![API Access](https://img.shields.io/badge/API%20Access-blue?style=for-the-badge)](https://RobloxChatLauncher.onrender.com/creators/api-access/)

</div>

----

Integrate these scripts into your Roblox Experience to enable Roblox Chat Launcher users to access features like `/emote` commands and team chat sync in your game.

## 🛠 Installation

Download the latest `RobloxChatLauncherIntegrations.rbxmx` from GitHub Releases and import it directly into Roblox Studio. The package automatically includes ReplicatedStorage, ServerScriptService, StarterPlayerScripts, and RCL_Event.

## 🔐 Getting Your API Key

You can generate an API key instantly by verifying ownership of your game. For group games, only the group owner can register.

1. **Visit the Creator Portal:** [Creator Portal | Universe Verification](https://RobloxChatLauncher.onrender.com/creators/api-access/)
2. **Verify Identity:** Enter your `User ID` and `Universe ID`, then briefly add a verification code to your **Roblox Profile** description.
3. **Add Your Key to Roblox:** After generating your unique API key, click **Open Roblox Secret Manager** and paste your key in a new secret named `RCL_API_KEY`.

> [!IMPORTANT]
> By default, your Universe's registration status is NOT shown in public API search results for privacy reasons.
>
> You must make a PATCH request to `/api/v1/universe/settings` with `"isUnlisted": false` in the body if you want it to appear as registered in API search results or public listings:
>
> ```powershell
> Invoke-RestMethod -Uri "https://RobloxChatLauncher.onrender.com/api/v1/universe/settings" -Method Patch -Headers @{"x-universe-id"="YOUR_ID"; "x-api-key"="YOUR_KEY"} -ContentType "application/json" -Body '{"isUnlisted": false}'`
> ```
>
> This setting only controls API search and directory visibility and does not limit who can use integrations functionality in your game.

## ⚠️ Warnings & Considerations

* **Never** hard-code your API key directly into your scripts. Using the Secrets Store ensures your credentials remain private and secure and are only accessible by the server.
* Your game **must be published** to Roblox for this to work. If the game is not published, the Universe ID will be `0`, and the API authentication will fail.
* Generating a new API key for an **already-registered** Universe will immediately overwrite the previous API key.

## 🚦 Performance & Rate Limiting

To ensure stability and prevent script errors, keep the following limits in mind:

* **Roblox HttpService Limits:** By default, each server instance can make up to 500 HTTP requests per minute.
* **Ingress Bridge Polling:** The default Ingress script polls the mailbox at a rate of 1 request per second (60 requests/min). The polling loop runs once per server.
* **Egress Scripts:** Egress scripts may send POST requests independently when triggered by in-game events (e.g., a player joining). Please be mindful that the combined total requests from all scripts do not exceed Roblox's limits.

## Terms of Service

By using Roblox Chat Launcher, you agree to the [Terms of Service](../TERMS). Please read them carefully before using the Software.

## Privacy Policy

This project takes steps to protect your privacy and limit data collection. We do not, and are not interested in, selling, sharing, or profiting from your data.

See the [Privacy Policy](../PRIVACY) for more details.

## License

The scripts in this directory are licensed under the [Mozilla Public License 2.0](LICENSE).

The integrations code is fully open-source. We encourage you to review the scripts to see exactly how data is egressed to our servers.
