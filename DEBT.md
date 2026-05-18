# Technical Debt

The following is a list of known and documented technical debts.

## 🧡 High Priority

* [ ] **Client: WinForms to WPF Migration** *Updated 2026-05-13*

  The current UI relies on WinForms hacks and non-intuitive workarounds which block critical interactions and break standard UX patterns.
    * **Interaction Blockers:**
      * Toggling visibility via clicking the window toggle button is disabled due to buggy/high-latency click-detection. Currently only the hotkey is used to toggle visibility.
      * The chat bar is non-clickable; currently no way to detect clicks to focus the field. Only the `/` key is used to enter input state.
      * Areas: [./client/ChatForm/ChatForm.UI.cs](./client/ChatForm/ChatForm.UI.cs), [./client/UI/ChatInputBox.cs](./client/UI/ChatInputBox.cs), [./client/UI/ResizeGrip.cs](./client/UI/ResizeGrip.cs)

    * **Text & Input Issues:**
      * No `Ctrl+A` or click-and-drag selection support; requires cursor-to-text position mapping and manually drawing highlighting over text which is unsupported in the current rendering mode. This is
        in large part due to how the system is designed for unfocused typing which is needed to allow input while the window is not focused, although WPF would make implementing the workaround significantly easier
      * Areas: [./client/ChatForm/ChatForm.UI.cs](./client/ChatForm/ChatForm.UI.cs), [./client/Services/ChatKeyboardHandler.cs](./client/Services/ChatKeyboardHandler.cs)

    * **Visual Constraints:**
      * Scrolling within the chat window is disabled because WinForms forces a legacy white scrollbar that breaks the overlay aesthetic when scrolling is enabled at all. The only way to scroll up is by selection-dragging existing
        text in the chat window and dragging the cursor above it.
      * Areas: [./client/ChatForm/ChatForm.UI.cs](./client/ChatForm/ChatForm.UI.cs)

    * **Technical Constraints:**
      * Fonts are currently loaded by allocating fresh memory for every single attempt and font weight due to GDI+ merging fonts. The current system frees the memory and allocates a new block to try again if it
        adds the font to the wrong one and retries up to 20 times per font. Note that for all intents and purposes assignment is random and there is no way to make it deterministic due to GDI+ being fundamentally flawed.
      * Areas: [./client/Utils/RichChatBox.cs](./client/Utils/RichChatBox.cs) (tbr)

    **Goal:** Completely migrate to WPF to utilize native `AllowsTransparency`, robust Hit-Testing, native font loading, hardware acceleration, DPI awareness, etc.

* [ ] **Server: Roblox API Rate-Limit Mitigation** *Updated 2026-05-14*

  The server currently hits Roblox API limits periodically due to user volume.
    * **Risk:** Frequent 429 (Too Many Requests) errors from the Roblox API lead to intermittent feature failure for end-users and potential temporary IP blacklisting from Roblox services.
    * Areas: [./server/services/verification.js](./server/services/verification.js), [./server/services/apiKeySelfService.js](./server/services/apiKeySelfService.js)

  **Goal:** Implement load balancing across our existing **regional servers** or deploy new single-responsibility **proxy servers** to distribute outbound API calls across a wider pool of IP addresses and provide a fallback if one server is rate-limited.
    * Project Lead's Recommendation: Outsource a proxy provider to forward Roblox API requests through.

## 💛 Medium Priority

* [ ] **Server: Externalize State Management** *Updated 2026-05-13*

  Most pending checks and codes are stored in local in-memory `Maps`.
    * **Risk:** This creates a single point of failure (data loss on restart) and prevents horizontal scaling .
    * Areas: [./server/services/mailboxService.js](./server/services/mailboxService.js), [./server/services/verification.js](./server/services/verification.js), [./server/services/apiKeySelfService.js](./server/services/apiKeySelfService.js), [./server/services/pow.js](./server/services/pow.js)

  **Goal:** Move shared state to the existing **PostgreSQL** instance or deploy a **Valkey** instance to act as high-speed shared memory.
    * Project Lead's Recommendation: Outsource a Valkey provider for cache storage and initialize a pool in [./server/db/](./server/db/).

* [ ] **Server: Monolithic server.js** *Updated 2026-05-16*

  The central `server.js` file has become a God Object, handling 90% of all application routes, WebSocket connections, and echo streaming routines.
    * **Risk:** Jamming disparate logic into a single file causes severe merge conflicts during team collaboration, drastically increases cognitive load for future maintenance, and becomes hard to navigate and find logic.
    * Areas: [./server/server.js](./server/server.js)

  **Goal:** Move all HTTP endpoints into the existing [./server/routes/](./server/routes/) directory and cleanly mount them in [./server/server.js](./server/server.js), and extract WebSocket connections, event listeners, and echo broadcasting logic out of the main file and encapsulate them into isolated helper classes or services.

## 💚 Low Priority

* [ ] **Client: Hardcoded Prerelease Flag in Update Service** *Updated 2026-05-15*

  The automatic update routine is currently forced to check for prereleases because the project has not yet published a formal, stable release.
    * **Risk:** The background update check passes a hardcoded `true` argument to include prereleases. This needs to be toggled back to `false` once the first stable build is shipped to prevent production clients from accidentally pulling unstable development builds.
    * Areas: [./client/ChatForm/ChatForm.UI.cs](./client/ChatForm/ChatForm.UI.cs) (caller)[^stm], [./client/Services/UpdateService.cs](./client/Services/UpdateService.cs)

    **Goal:** Update the automatic `CheckAndDownloadUpdate()` startup call to target stable releases by default by changing the argument to `false` once version `1.0.0` or a stable equivalent is published.

* [ ] **Client: Console Lifecycle Hack via Menu Deletion** *Updated 2026-05-16*

  The client currently prevents users from accidentally terminating the main program by forcefully calling `DeleteMenu(sysMenu, SC_CLOSE, MF_BYCOMMAND)` on the debug console to remove the close button from the system menu and forcing the user to manually type the same chat command again to trigger `FreeConsole()`.
    * **Risk:** Disabling standard OS window controls breaks native UX expectations (users can't click X to close).
    * Areas: [./client/Utils/NativeMethods.cs](./client/Utils/NativeMethods.cs), [./client/ChatForm/ChatForm.Client.cs](./client/ChatForm/ChatForm.Client.cs) (`HandleDebugConsole()`)[^stm]

    **Goal:** Restore the native close button and properly intercept `if (ctrlType == CTRL_CLOSE_EVENT)` to invoke `FreeConsole()` on the console window.

* [ ] **Server: Production Reliance on JsDelivr CDN for Tailwind** *Updated 2026-05-16*

  The server-rendered HTML pages currently load Tailwind CSS directly in the browser via a development script tag (`<script src="...jsdelivr.net/npm/@tailwindcss/browser@4.3.0"...></script>`).
    * **Risk:** Frontend performance degradation; the browser is forced to download a massive JavaScript engine and dynamically compile utility classes on the fly every time a page loads. While more optimized than the old `cdn.tailwindcss.com` script, this may begin to cause noticeable layout shifts (FOUC) on low-end devices or as pages become more complex.
    * Areas: [./server/public/index.html](./server/public/index.html), [./server/public/creators/index.html](./server/public/creators/index.html), [./server/public/creators/api-access/index.html](./server/public/creators/api-access/index.html)

  **Goal:** Migrate from the browser-based runtime compiler to a proper GitHub Actions workflow to synchronize and compile CSS, push to a `prod` branch, and replace the `<script>` bundle with a static, minified CSS stylesheet generated during a build step.

* [ ] **Installer: DRY Code Violation in Flag Checks** *Updated 2026-05-16*

  The installer isolates command-line argument checks into individual single-purpose script files, creating a repetitive and hard-to-maintain structure.
    * **Risk:** The codebase contains identical logic duplicated across multiple distinct files just to parse different string constants. Any future updates to the argument-parsing engine or error-handling routines will require modifying all five files simultaneously, increasing the likelihood of human error and divergence.
    * Areas: [./installer/Include/Flags/IsCleanInstallFlagPresent.pas](./installer/Include/Flags/IsCleanInstallFlagPresent.pas), [./installer/Include/Flags/IsClearAppDataFlagPresent.pas](./installer/Include/Flags/IsClearAppDataFlagPresent.pas), [./installer/Include/Flags/IsForcePurgeFlagPresent.pas](./installer/Include/Flags/IsForcePurgeFlagPresent.pas), [./installer/Include/Flags/IsForceRunFlagPresent.pas](./installer/Include/Flags/IsForceRunFlagPresent.pas), [./installer/Include/Flags/IsNoRestoreFlagPresent.pas](./installer/Include/Flags/IsNoRestoreFlagPresent.pas)

  **Goal:** Consolidate the duplicated Pascal scripts into a single, reusable parameterized helper service (e.g., `HasCommandLineFlag(FlagName: String): Boolean`) to dynamically evaluate flags against incoming parameters.

## ❤️ Out of Scope

The following items are recognized issues that severely impact the project but cannot be resolved under current operational or financial limitations. They are considered hard constraints until external conditions change.

* [ ] **Project: Budget Infrastructural Constraints** *Updated 2026-05-15*

  The project is severely bottlenecked by a $0 operational budget, forcing reliance on free-tier infrastructure and APIs that introduce strict rate limits, service-ending deadlines, and monthly downtime risks.
    * **Moderation Constraints:**
      * The system relies entirely on the free tier of Google's Perspective API for content moderation, which imposes severe functional and existential constraints on the project.
      * Outbound moderation requests are bottlenecked by a strict global rate limit of 1 QPS (1 message/echo per second) shared across all servers, causing long message queues during peak traffic.
      * Google is sunsetting the Perspective API on December 31, 2026. Because all viable alternative moderation services require paid subscriptions, the server will completely cease to function after this date without funding.
      * Areas: [./server/services/moderationService.js](./server/services/moderationService.js), [./server/server.js](./server/server.js), [./server/config/env.js](./server/config/env.js)

    * **Hosting Constraints:**
      * The backend is deployed on the Render Free Tier, which imposes a strict global limit of 750 instance hours per month across all services under the account.
      * While Render allows free services to spin down and sleep during periods of inactivity, our current user volume keeps the server active nearly 24/7.
      * Once the 750-hour cap is breached, Render suspends all services under the account. The server will become completely unreachable for the remainder of that calendar month.
      * Areas: [./render.yaml](./render.yaml) (infrastructure)

    These infrastructural bottlenecks cannot be resolved under our current development model until dependable funding, a billing partner, or other external sponsorship is secured.

[^stm]: Please note that the location of the caller, callee, handler, file or otherwise is subject to and likely to move during a refactor or migration to WPF.
