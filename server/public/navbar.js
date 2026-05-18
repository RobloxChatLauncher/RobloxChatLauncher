function renderNavbar(config) {
    const subtitle = config.subtitle || 'Platform';
    const buttonsHtml = config.buttons || '';

    document.write(`
      <header class="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/55 border-b border-white/5">
        <div class="max-w-7xl mx-auto px-6">
          <div class="h-20 flex items-center justify-between">
            
            <a href="/" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl overflow-hidden border border-blue-500/20 shadow-lg shadow-blue-500/10 bg-slate-900/80">
                <img src="https://github.com/RobloxChatLauncher/RobloxChatLauncher/raw/main/assets/brand/rcl_server_icon.png"
                     class="w-full h-full object-cover rounded-2xl"
                     draggable="false" />
              </div>
              <div>
                <div class="font-semibold text-white">Roblox Chat Launcher</div>
                <div class="text-xs text-slate-500">${subtitle}</div>
              </div>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center gap-6">
              ${buttonsHtml}
            </div>

            <!-- Hamburger -->
            <button id="mobile-menu-btn" class="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none" aria-label="Toggle Menu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path id="menu-icon-path" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

          </div>
        </div>

        <!-- Dropdown -->
        <div id="mobile-menu" class="hidden md:hidden border-t border-white/5 bg-slate-950/95 px-6 py-4 space-y-4">
          <div class="flex flex-col gap-4">
            ${buttonsHtml}
          </div>
        </div>
      </header>
    `);

    document.addEventListener("DOMContentLoaded", () => {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIconPath = document.getElementById('menu-icon-path');

        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                const isHidden = mobileMenu.classList.contains('hidden');

                if (isHidden) {
                    mobileMenu.classList.remove('hidden');
                    menuIconPath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
                } else {
                    mobileMenu.classList.add('hidden');
                    menuIconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
                }
            });
        }
    });
}

function renderFooter() {
    document.write(`
      <footer id="privacy" class="border-t border-white/5 py-10 mt-auto">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">

            <div class="text-center md:text-left">
              <div class="text-sm text-slate-400">
                © 2026 Roblox Chat Launcher Developers & Contributors
              </div>
              <div class="text-xs text-slate-600 mt-1">
                Not affiliated with or endorsed by Roblox Corporation.
              </div>
            </div>

            <div class="flex items-center gap-6 text-sm">
              <a href="https://raw.githubusercontent.com/RobloxChatLauncher/RobloxChatLauncher/refs/heads/main/PRIVACY"
                 class="text-slate-500 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="https://raw.githubusercontent.com/RobloxChatLauncher/RobloxChatLauncher/refs/heads/main/TERMS"
                 class="text-slate-500 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="https://github.com/RobloxChatLauncher/RobloxChatLauncher"
                 class="text-slate-500 hover:text-white transition-colors">
                GitHub
              </a>
            </div>

          </div>
        </div>
      </footer>
    `);
}