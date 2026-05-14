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
      * Areas: [./client/Utils/RichChatBox.cs](./client/Utils/RichChatBox.cs)

    **Goal:** Move to WPF to utilize native `AllowsTransparency` and robust Hit-Testing.

## 💛 Medium Priority

* [ ] **Server: Externalize State Management** *Updated 2026-05-13*

  Most pending checks and codes are stored in local in-memory `Maps`.
    * **Risk:** This creates a single point of failure (data loss on restart) and prevents horizontal scaling .
    * Areas: [./server/services/mailboxService.js](./server/services/mailboxService.js), [./server/services/verification.js](./server/services/verification.js), [./server/services/apiKeySelfService.cs](./server/services/apiKeySelfService.cs), [./server/services/pow.js](./server/services/pow.js)

  **Goal:** Move shared state to the existing **PostgreSQL** instance or deploy a **Valkey** instance to act as high-speed shared memory.

## 💚 Low Priority

*\<None currently\>*