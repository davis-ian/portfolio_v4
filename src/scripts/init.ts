import { CommandPalette, getCommands } from "./command-palette";
import { downloadResume, initDataActions, initEmail, initResumeButton } from "./actions";
import { handleHashNavigation, initNavigation, setHasUserNavigated, updatePageSize, updateStatusBar } from "./navigation";
import { initFolderToggles, initMobileMenu } from "./mobile";
import { initTheme } from "./themes";

let commandPalette: CommandPalette | null = null;
let previousHelpFocus: HTMLElement | null = null;

function trapDialogFocus(event: KeyboardEvent, container: HTMLElement): void {
  if (event.key !== "Tab") return;
  const focusable = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function closeKeyboardHelp(): void {
  const help = document.getElementById("keyboard-help");
  if (!help) return;
  help.remove();
  document.body.classList.remove("dialog-open");
  previousHelpFocus?.focus();
}

function showKeyboardHelp(): void {
  const existing = document.getElementById("keyboard-help");
  if (existing) existing.remove();
  previousHelpFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const overlay = document.createElement("div");
  overlay.className = "command-palette-overlay";
  overlay.id = "keyboard-help";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "keyboard-help-title");
  overlay.setAttribute("aria-describedby", "keyboard-help-body");
  overlay.setAttribute("aria-hidden", "false");
  overlay.style.display = "flex";
  overlay.innerHTML = '<div class="command-palette keyboard-help-dialog" tabindex="-1"><div class="command-header"><h2 id="keyboard-help-title" class="command-title">Keyboard Shortcuts</h2><button type="button" class="command-close" id="close-help" aria-label="Close keyboard shortcuts">x</button></div><div class="keyboard-help-content" id="keyboard-help-body"><div class="keyboard-help-group"><div class="keyboard-help-label">Navigation</div><div class="keyboard-help-grid"><span class="keyboard-help-key">1-6</span><span>Jump to section</span><span class="keyboard-help-key">^K</span><span>Command palette (:)</span><span class="keyboard-help-key">?</span><span>Show help</span></div></div><div class="keyboard-help-group"><div class="keyboard-help-label">Actions</div><div class="keyboard-help-grid"><span class="keyboard-help-key">R</span><span>Download resume</span><span class="keyboard-help-key">Esc</span><span>Close/Quit</span></div></div><div class="keyboard-help-footer">:help for more info</div></div></div>';
  document.body.appendChild(overlay);
  document.body.classList.add("dialog-open");

  const close = document.getElementById("close-help");
  close?.addEventListener("click", () => closeKeyboardHelp());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeKeyboardHelp();
  });
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeKeyboardHelp();
      return;
    }
    trapDialogFocus(e, overlay);
  });
  (close as HTMLElement | null)?.focus();
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
        closeKeyboardHelp();
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
    if (!isMod && !isShift && /^[1-6]$/.test(key)) {
      e.preventDefault();
      setHasUserNavigated(true);
      const sections = ["hero", "featured", "work", "case-studies", "about", "experience"];
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

function initStatusModeTrigger(): void {
  const statusMode = document.getElementById("status-mode");
  if (!statusMode) return;

  statusMode.addEventListener("click", () => {
    commandPalette?.toggle();
  });

  statusMode.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    commandPalette?.toggle();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  commandPalette = new CommandPalette(getCommands());
  initFolderToggles();
  initMobileMenu();
  initDataActions();
  initNavigation();
  initEmail();
  initResumeButton();
  initKeyboardShortcuts();
  initStatusModeTrigger();
  window.addEventListener("scroll", () => {
    setHasUserNavigated(true);
    updateStatusBar();
  }, { passive: true });
  updateStatusBar();
  updatePageSize();
  handleHashNavigation();
});
