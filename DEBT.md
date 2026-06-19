# Technical Debt

The following is a list of known and documented technical debts.

## 🧡 High Priority

<a id="5f85329c-bf77-43ac-a786-8b3f1ed15c46"></a>
* [ ] **Client: WinForms to WPF Migration**

  The current UI relies on WinForms hacks and non-intuitive workarounds which block critical interactions and break standard UX patterns.
    * [ ] **Interaction Blockers:** *Updated 2026-05-13*
      * Toggling visibility via clicking the window toggle button is disabled due to buggy/high-latency click-detection. Currently only the hotkey is used to toggle visibility.
      * The chat bar is non-clickable; currently no way to detect clicks to focus the field. Only the `/` key is used to enter input state.
      * Areas: [./client/ChatForm/ChatForm.UI.cs](./client/ChatForm/ChatForm.UI.cs), [./client/UI/ChatInputBox.cs](./client/UI/ChatInputBox.cs), [./client/UI/ResizeGrip.cs](./client/UI/ResizeGrip.cs)

    * [ ] **Text & Input Issues:** *Updated 2026-05-13*
      * No `Ctrl+A` or click-and-drag selection support; requires cursor-to-text position mapping and manually drawing highlighting over text which is unsupported in the current rendering mode. This is
        in large part due to how the system is designed for unfocused typing which is needed to allow input while the window is not focused, although WPF would make implementing the workaround significantly easier
      * Areas: [./client/ChatForm/ChatForm.UI.cs](./client/ChatForm/ChatForm.UI.cs), [./client/Services/ChatKeyboardHandler.cs](./client/Services/ChatKeyboardHandler.cs)

    * [ ] **Visual Constraints:** *Updated 2026-05-13*
      * Scrolling within the chat window is disabled because WinForms forces a legacy white scrollbar that breaks the overlay aesthetic when scrolling is enabled at all. The only way to scroll up is by selection-dragging existing
        text in the chat window and dragging the cursor above it.
      * Areas: [./client/ChatForm/ChatForm.UI.cs](./client/ChatForm/ChatForm.UI.cs)

    * [ ] **Technical Constraints:** *Updated 2026-05-13*
      * Fonts are currently loaded by allocating fresh memory for every single attempt and font weight due to GDI+ merging fonts. The current system frees the memory and allocates a new block to try again if it
        adds the font to the wrong one and retries up to 20 times per font. Note that for all intents and purposes assignment is random and there is no way to make it deterministic due to GDI+ being fundamentally flawed.
      * Areas: [./client/Utils/RichChatBox.cs](./client/Utils/RichChatBox.cs) (tbr)

    **Goal:** Completely migrate to WPF to utilize native `AllowsTransparency`, robust Hit-Testing, native font loading, hardware acceleration, DPI awareness, etc.

<a id="90dcc0cb-956f-4766-95cc-bc87635763e9"></a>
* [ ] **Server: Roblox API Rate-Limit Mitigation** *Updated 2026-05-14*

  The server currently hits Roblox API limits periodically due to user volume.
    * **Risk:** Frequent 429 (Too Many Requests) errors from the Roblox API lead to intermittent feature failure for end-users and potential temporary IP blacklisting from Roblox services.
    * Areas: [./server/services/verification.js](./server/services/verification.js), [./server/services/apiKeySelfService.js](./server/services/apiKeySelfService.js)

  **Goal:** Implement load balancing across our existing **regional servers** or deploy new single-responsibility **proxy servers** to distribute outbound API calls across a wider pool of IP addresses and provide a fallback if one server is rate-limited.
    * Project Lead's Recommendation: Outsource a proxy provider to forward Roblox API requests through.

## 💛 Medium Priority

<a id="31701673-12d3-4f39-a2bf-ebd60edddfec"></a>
* [ ] **Server: Synchronous document.write() in Component Utilities** *Updated 2026-06-19*

  The dynamic layout utilities `renderNavbar` and `renderFooter` use synchronous `document.write()` statements to parse navigation headers and page feet.
    * **Risk:** Using `document.write()` on an active stream disrupts the standard asynchronous loading state of the DOM tree. This creates a severe race condition with the browser-compiled `@tailwindcss/browser` engine, intermittently freezing utility class parsing on hard-refreshes and resulting in random layout collapses.
    * Areas: [./server/public/navbar.js](./server/public/navbar.js)

  **Goal:** Eliminate `document.write()` references completely. Refactor both component hooks to systematically generate layout items utilizing programmatic `document.createElement()` blocks and insert them structurally into the layout tree using explicit node boundaries like `insertBefore(element, document.currentScript)`.

<a id="6611251a-42b3-4a16-97a2-26d7db748487"></a>
* [ ] **Server: Externalize State Management** *Updated 2026-05-13*

  Most pending checks and codes are stored in local in-memory `Maps`.
    * **Risk:** This creates a single point of failure (data loss on restart) and prevents horizontal scaling .
    * Areas: [./server/services/mailboxService.js](./server/services/mailboxService.js), [./server/services/verification.js](./server/services/verification.js), [./server/services/apiKeySelfService.js](./server/services/apiKeySelfService.js), [./server/services/pow.js](./server/services/pow.js)

  **Goal:** Move shared state to the existing **PostgreSQL** instance or deploy a **Valkey** instance to act as high-speed shared memory.
    * Project Lead's Recommendation: Outsource a Valkey provider for cache storage and initialize a pool in [./server/db/](./server/db/).

<a id="c44f007d-0668-42d4-b32a-7dd466e96339"></a>
* [ ] **Server: Monolithic server.js** *Updated 2026-05-16*

  The central `server.js` file has become a God Object, handling 90% of all application routes, WebSocket connections, and echo streaming routines.
    * **Risk:** Jamming disparate logic into a single file causes severe merge conflicts during team collaboration, drastically increases cognitive load for future maintenance, and becomes hard to navigate and find logic.
    * Areas: [./server/server.js](./server/server.js)

  **Goal:** Move all HTTP endpoints into the existing [./server/routes/](./server/routes/) directory and cleanly mount them in [./server/server.js](./server/server.js), and extract WebSocket connections, event listeners, and echo broadcasting logic out of the main file and encapsulate them into isolated helper classes or services.

<a id="903a497c-009d-4ed6-989d-aa85b402e6b4"></a>
* [ ] **Server: CSP Compliance Violation via Inline Worker Blobs** *Updated 2026-06-18*

  The Proof-of-Work (PoW) client script in the api-access page HTML dynamically generates a Web Worker from a localized inline script block utilizing a `blob:` URL payload.
    * **Risk:** This implementation triggers explicit Content Security Policy (CSP) violations under standard, secure environments. Bypassing this requires exposing `blob:` within `worker-src` or `script-src` directives, which expands the application's attack surface by allowing potential XSS payloads to execute arbitrary scripts via generated blobs.
    * Areas: [./server/public/creators/api-access/index.html](./server/public/creators/api-access/index.html)

  **Goal:** Move the Web Worker execution logic entirely out of the inline context and abstract it into a standalone, reusable `.js` asset file. Serve this file statically from the server to maintain strict alignment with standard, uncompromised `worker-src 'self'` CSP directives.
    * Also see: [Server: DRY Code Violation in Web Code](#49bead59-e15a-443d-9365-e5015f76ffc6)

## 💚 Low Priority

<a id="579d2ca6-da7a-4996-9a18-313c3130b45f"></a>
* [ ] **Client: Hardcoded Prerelease Flag in Update Service** *Updated 2026-05-15*

  The automatic update routine is currently forced to check for prereleases because the project has not yet published a formal, stable release.
    * **Risk:** The background update check passes a hardcoded `true` argument to include prereleases. This needs to be toggled back to `false` once the first stable build is shipped to prevent production clients from accidentally pulling unstable development builds.
    * Areas: [./client/ChatForm/ChatForm.UI.cs](./client/ChatForm/ChatForm.UI.cs) (caller)[^stm], [./client/Services/UpdateService.cs](./client/Services/UpdateService.cs)

  **Goal:** Update the automatic `CheckAndDownloadUpdate()` startup call to target stable releases by default by changing the argument to `false` once version `1.0.0` or a stable equivalent is published.
    * Remarks: This will likely not be relevant until the WinForms to WPF migration is complete and large features such as team chat is implemented.

<a id="e4028bbb-b326-4336-b9fb-7d098157bb67"></a>
* [ ] **Client: Console Lifecycle Hack via Menu Deletion** *Updated 2026-05-16*

  The client currently prevents users from accidentally terminating the main program by forcefully calling `DeleteMenu(sysMenu, SC_CLOSE, MF_BYCOMMAND)` on the debug console to remove the close button from the system menu and forcing the user to manually type the same chat command again to trigger `FreeConsole()`.
    * **Risk:** Disabling standard OS window controls breaks native UX expectations (users can't click X to close).
    * Areas: [./client/Utils/NativeMethods.cs](./client/Utils/NativeMethods.cs), [./client/ChatForm/ChatForm.Client.cs](./client/ChatForm/ChatForm.Client.cs) (`HandleDebugConsole()`)[^stm]

  **Goal:** Restore the native close button and properly intercept `if (ctrlType == CTRL_CLOSE_EVENT)` to invoke `FreeConsole()` on the console window.

<a id="8c038655-9d3d-443b-9e3b-0da889f7cba3"></a>
* [ ] **Server: Production Reliance on JsDelivr CDN for Tailwind** *Updated 2026-05-16*

  The server-rendered HTML pages currently load Tailwind CSS directly in the browser via a development script tag (`<script src="...jsdelivr.net/npm/@tailwindcss/browser@4.3.0"...></script>`).
    * **Risk:** Frontend performance degradation; the browser is forced to download a massive JavaScript engine and dynamically compile utility classes on the fly every time a page loads. While more optimized than the old `cdn.tailwindcss.com` script, this may begin to cause noticeable layout shifts (FOUC) on low-end devices or as pages become more complex.
    * Areas: [./server/public/index.html](./server/public/index.html), [./server/public/creators/index.html](./server/public/creators/index.html), [./server/public/creators/api-access/index.html](./server/public/creators/api-access/index.html)

  **Goal:** Migrate from the browser-based runtime compiler to a proper GitHub Actions workflow to synchronize and compile CSS, push to a `prod` branch, and replace the `<script>` bundle with a static, minified CSS stylesheet generated during a build step.

<a id="3c6cf9d6-d910-492b-af6d-2eb619fe505e"></a>
* [ ] **Installer: DRY Code Violation in Flag Checks** *Updated 2026-05-16*

  The installer isolates command-line argument checks into individual single-purpose script files, creating a repetitive and hard-to-maintain structure.
    * **Risk:** The codebase contains identical logic duplicated across multiple distinct files just to parse different string constants. Any future updates to the argument-parsing engine or error-handling routines will require modifying all five files simultaneously, increasing the likelihood of human error and divergence.
    * Areas: [./installer/Include/Flags/IsCleanInstallFlagPresent.pas](./installer/Include/Flags/IsCleanInstallFlagPresent.pas), [./installer/Include/Flags/IsClearAppDataFlagPresent.pas](./installer/Include/Flags/IsClearAppDataFlagPresent.pas), [./installer/Include/Flags/IsForcePurgeFlagPresent.pas](./installer/Include/Flags/IsForcePurgeFlagPresent.pas), [./installer/Include/Flags/IsForceRunFlagPresent.pas](./installer/Include/Flags/IsForceRunFlagPresent.pas), [./installer/Include/Flags/IsNoRestoreFlagPresent.pas](./installer/Include/Flags/IsNoRestoreFlagPresent.pas)

  **Goal:** Consolidate the duplicated Pascal scripts into a single, reusable parameterized helper service (e.g., `HasCommandLineFlag(FlagName: String): Boolean`) to dynamically evaluate flags against incoming parameters.

<a id="49bead59-e15a-443d-9365-e5015f76ffc6"></a>
* [ ] **Server: DRY Code Violation in Web Code** *Updated 2026-05-20*

  The web code duplicates JavaScript logic across multiple index.html files, leading to maintenance overhead when updating shared frontend scripts.
    * **Risk:** Human error can lead to inconsistent behavior across different pages (e.g., mismatched auth handling or UI initialization). Any feature change or bug fix requires manual synchronization across every file, increasing the probability of regression and technical drift.
    * **Areas:** [./server/public/index.html](./server/public/index.html), [./server/public/creators/index.html](./server/public/creators/index.html), [./server/public/creators/api-access/index.html](./server/public/creators/api-access/index.html)
 
  **Goal:** Abstract common JavaScript functionality (e.g., common utility functions, API wrappers, or UI event listeners) into a standalone `client-common.js` file. Serve this file as a static asset to all pages to ensure a single source of truth for frontend logic.
    * Also see: [Server: CSP Compliance Violation via Inline Worker Blobs](#903a497c-009d-4ed6-989d-aa85b402e6b4)

## ❤️ Out of Scope

The following items are recognized issues that severely impact the project but cannot be resolved under current operational or financial limitations. They are considered hard constraints until external conditions change.

<a id="576e5e80-3e0b-4a19-97b9-502fe94ce233"></a>
* [ ] **Project: Budget Infrastructural Constraints**

  The project is severely bottlenecked by a $0 operational budget, forcing reliance on free-tier infrastructure and APIs that introduce strict rate limits, service-ending deadlines, and monthly downtime risks.
    * [ ] **Moderation Constraints:** *Updated 2026-05-15*
      * The system relies entirely on the free tier of Google's Perspective API for content moderation, which imposes severe functional and existential constraints on the project.
      * Outbound moderation requests are bottlenecked by a strict global rate limit of 1 QPS (1 message/echo per second) shared across all servers, causing long message queues during peak traffic.
      * Google is sunsetting the Perspective API on December 31, 2026. Because all viable alternative moderation services require paid subscriptions, the server will completely cease to function after this date without funding.
      * Areas: [./server/services/moderationService.js](./server/services/moderationService.js) (server), [./server/server.js](./server/server.js), [./server/config/env.js](./server/config/env.js), [./client/Services/MessageFilterService.cs](./client/Services/MessageFilterService.cs) (local)

    * [ ] **Hosting Constraints:** *Updated 2026-05-15*
      * The backend is deployed on the Render Free Tier, which imposes a strict global limit of 750 instance hours per month across all services under the account.
      * While Render allows free services to spin down and sleep during periods of inactivity, our current user volume keeps the server active nearly 24/7.
      * Once the 750-hour cap is breached, Render suspends all services under the account. The server will become completely unreachable for the remainder of that calendar month.
      * Areas: [./render.yaml](./render.yaml) (infrastructure)

    * [ ] **Database Constraints** *Updated 2026-05-30*
      * The application's data persistence layer relies entirely on a free-tier Neon PostgreSQL instance, which imposes rigid compute and capacity thresholds that are rapidly becoming unsustainable.
      * Project active compute hours are bound to a monthly quota of 100 CU-hours. Due to an expanding active user base keeping the database connections alive, our margin is shrinking month-over-month.
      * The project risks hitting this hard cap mid-month, triggering immediate cluster suspension and complete downtime of the database for the remainder of the month.
      * While total database storage volume is currently within acceptable limits, any sudden, large influx of unique users will cause the database size to rapidly scale and exceed storage quota.
      * Areas: [./server/db/postgresPool.js](./server/db/postgresPool.js), [./server/config/env.js](./server/config/env.js) (infrastructure)

    These infrastructural bottlenecks cannot be resolved under our current development model until dependable funding, a billing partner, or other external sponsorship is secured.

## 💝 Accomplished

<a id="a611c77a-8666-43b0-8ff8-c114e484564e"></a>
* [X] ~~**Project: Monorepo Versioning Strategy**~~ *Accomplished 2026-05-23 in #162*

  Integrations are versioned locally, but the monorepo’s global Git tagging forces a single, linear versioning sequence. This forces the global tag to increment for integration-only updates, creating a version mismatch.
    * **Risk:** The tag naming deviates from the client's actual state whenever an integration is released without accompanying client changes. Furthermore, these tags entirely do not correspond to the integration's own versioning, creating a scenario where the version identifier overtime fails to represent neither the client nor the integration.
    * **Areas:** [./client/Services/UpdateService.cs](./client/Services/UpdateService.cs), [./.github/workflows/release.yml](./.github/workflows/release.yml)

  **Goal:** Decouple release versioning by implementing either path-based versioning (e.g., `client/v0.7.0-beta.2` and `integrations/v0.2.0`) or moving the integrations directory to an entirely separate repository and adding back the folder only as a Git submodule.
    * Project Lead's Recommendation: Move the integrations folder to a separate repository with its own tag/releases namespace, update links to the integrations package where necessary, and move the integrations build steps out of [./.github/workflows/release.yml](./.github/workflows/release.yml) to a workflow in the new repository.

[^stm]: Please note that the location of the caller, callee, handler, file or otherwise is subject to and likely to move during a refactor or migration to WPF.
