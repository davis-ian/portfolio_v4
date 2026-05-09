import { CommandPalette, getCommands } from "./command-palette";
import { downloadResume, initDataActions, initEmail, initResumeButton } from "./actions";
import { handleHashNavigation, initNavigation, setHasUserNavigated, updatePageSize, updateStatusBar } from "./navigation";
import { initFolderToggles, initMobileMenu, initOpenFolderHeights } from "./mobile";

let commandPalette: CommandPalette | null = null;

function showKeyboardHelp(): void {
  const existing = document.getElementById("keyboard-help");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.className = "command-palette-overlay";
  overlay.id = "keyboard-help";
  overlay.style.display = "flex";
  overlay.innerHTML = '<div class="command-palette" style="max-width:500px;"><div style="padding:1rem;border-bottom:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:700;">-- KEYBOARD SHORTCUTS --</span><button id="close-help" style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:1.25rem;padding:0.25rem;">x</button></div><div style="padding:1rem;font-family:var(--font-mono);"><div style="margin-bottom:1rem;"><div style="font-size:0.75rem;color:var(--accent-peach);text-transform:uppercase;margin-bottom:0.5rem;">:: Navigation</div><div style="display:grid;grid-template-columns:auto 1fr;gap:0.5rem 1.5rem;line-height:1.8;"><span style="color:var(--text-muted);">1-5</span><span>Jump to section</span><span style="color:var(--text-muted);">^K</span><span>Command palette (:)</span><span style="color:var(--text-muted);">?</span><span>Show help</span></div></div><div style="margin-bottom:1rem;"><div style="font-size:0.75rem;color:var(--accent-peach);text-transform:uppercase;margin-bottom:0.5rem;">:: Actions</div><div style="display:grid;grid-template-columns:auto 1fr;gap:0.5rem 1.5rem;line-height:1.8;"><span style="color:var(--text-muted);">R</span><span>Download resume</span><span style="color:var(--text-muted);">Esc</span><span>Close/Quit</span></div></div><div style="font-size:0.75rem;color:var(--text-muted);margin-top:1rem;padding-top:1rem;border-top:1px solid var(--color-border);">:help for more info</div></div></div>';
  document.body.appendChild(overlay);
  document.getElementById("close-help")?.addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

function initKeyboardShortcuts(): void {
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    const isMod = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;
    const target = e.target as HTMLElement;
    const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

    if (key === "?" && !isMod) {
      e.preventDefault();
      showKeyboardHelp();
      return;
    }
    if (key === "Escape") {
      const help = document.getElementById("keyboard-help");
      if (help) {
        e.preventDefault();
        help.remove();
        return;
      }
      if (commandPalette?.isOpen) {
        e.preventDefault();
        commandPalette.close();
      }
      return;
    }
    if (isMod && key.toLowerCase() === "k") {
      e.preventDefault();
      commandPalette?.toggle();
      return;
    }
    if (isInput) return;
    if (key === ":") {
      e.preventDefault();
      commandPalette?.toggle();
      return;
    }
    if (!isMod && !isShift && /^[1-5]$/.test(key)) {
      e.preventDefault();
      setHasUserNavigated(true);
      const sections = ["hero", "featured", "work", "about", "experience"];
      const idx = Number(key) - 1;
      const section = sections[idx];
      if (section) document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (key.toLowerCase() === "r" && !isMod) {
      e.preventDefault();
      downloadResume();
      return;
    }
    if (key.toLowerCase() === "b" && !isMod) {
      e.preventDefault();
      window.location.href = "/";
    }
  }, true);
}

document.addEventListener("DOMContentLoaded", () => {
  commandPalette = new CommandPalette(getCommands());
  initFolderToggles();
  initMobileMenu();
  initOpenFolderHeights();
  initDataActions();
  initNavigation();
  initEmail();
  initResumeButton();
  initKeyboardShortcuts();
  window.addEventListener("scroll", () => {
    setHasUserNavigated(true);
    updateStatusBar();
  }, { passive: true });
  updateStatusBar();
  updatePageSize();
  handleHashNavigation();
});
