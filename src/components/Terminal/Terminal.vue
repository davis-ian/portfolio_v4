<template>
  <div
    v-if="isMounted || visible"
    class="terminal-root"
    :class="{ 'is-visible': visible }"
    :aria-hidden="(!visible).toString()"
  >
    <section class="terminal-panel" role="dialog" aria-label="Integrated terminal">
      <header class="terminal-header">
        <div class="terminal-tab">TERMINAL</div>
        <div class="terminal-actions">
          <button type="button" class="terminal-action" aria-label="New terminal">+</button>
          <button type="button" class="terminal-action" aria-label="Close terminal" @click="closeTerminal">x</button>
        </div>
      </header>

      <div ref="outputRef" class="terminal-output" @click="focusInput">
        <div v-for="(line, index) in output" :key="`${index}-${line.text}`" class="terminal-line" :class="line.className">
          {{ line.text }}
        </div>

        <form class="prompt-line" @submit.prevent="submitCommand">
          <span class="prompt">guest@iandavis:~$</span>
          <span class="command-preview">{{ inputValue }}</span>
          <span class="cursor" aria-hidden="true"></span>
          <input
            ref="inputRef"
            v-model="inputValue"
            class="terminal-input"
            type="text"
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            @keydown.up.prevent="historyUp"
            @keydown.down.prevent="historyDown"
          />
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

interface OutputLine {
  text: string;
  className?: string;
}

interface IANConsole {
  hire?: () => true;
  resume?: () => "opening...";
  stack?: () => string[];
  help?: () => "good luck out there";
  terminal?: () => true;
}

declare global {
  interface Window {
    ian?: IANConsole;
  }
}

const visible = ref(false);
const isMounted = ref(false);
const inputValue = ref("");
const output = ref<OutputLine[]>([]);
const commandHistory = ref<string[]>([]);
const historyIndex = ref<number | null>(null);
const isStreaming = ref(false);
const streamToken = ref(0);
const isOdinSession = ref(false);
const isFedoraSession = ref(false);
const fantasyAwaitingPick = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const outputRef = ref<HTMLElement | null>(null);

const PROMPT = "guest@iandavis:~$";

const helpLines = [
  "available commands:",
  "",
  "  ls | dir        list directory contents",
  "  cat <file>      read a file",
  "  whoami          current user info",
  "  git log         commit history",
  "  ssh <host>      connect to odin or fedora-mb",
  "  ./render-engine run the render engine",
  "  neofetch        system info",
  "  fantasy         fantasy draft simulator",
  "  clear | cls     clear terminal",
  "  exit            close terminal",
  "",
  "type any command to get started.",
];

const lsLines = [
  "drwxr-xr-x  ian  staff   about.md",
  "drwxr-xr-x  ian  staff   projects/",
  "drwxr-xr-x  ian  staff   experience.json",
  "drwxr-xr-x  ian  staff   render-engine  [executable]",
  "drwxr-xr-x  ian  staff   resume.pdf",
  "-rw-r--r--  ian  staff   .secret        [hidden]",
];

const catContent = new Map<string, string[]>([
  [
    "about.md",
    [
      "# about",
      "",
      "Former military aircraft maintainer turned software engineer.",
      "Built full-stack systems after completing PDX Code Guild.",
      "Currently leading platform engineering at MemoryShare.",
      "Relocating to the Bay Area with family in 2025.",
    ],
  ],
  [
    "experience.json",
    [
      "{",
      '  "company": "MemoryShare",',
      '  "role": "Lead Software Engineer",',
      '  "start": "2021-01",',
      '  "focus": ["C#", "Vue", "FFmpeg", "AWS"],',
      '  "impact": "render pipeline 20+ min -> under 2 min"',
      "}",
    ],
  ],
]);

const neofetchLines = [
  "         ██╗██████╗          ian@iandavis.dev",
  "         ██║██╔══██╗         -------------------------",
  "         ██║██║  ██║         OS:      Fedora Asahi Linux (M2 Max)",
  "         ██║██║  ██║         Shell:   zsh + tmux",
  "         ██║██████╔╝         Editor:  Neovim / Rider",
  "         ╚═╝╚═════╝          WM:      Hyprland",
  "                             Stack:   C# · Vue · FFmpeg · AWS",
  "                             Uptime:  4+ years @ MemoryShare",
  "                             Memory:  too much FFmpeg knowledge",
  "                             Dotfiles: github.com/davis-ian",
];

const sshOdinLines = [
  "Connecting to odin via Tailscale...",
  "Authentication successful.",
  "",
  "odin ~ uptime: 847 days",
  "",
  "SERVICES                     STATUS    UPTIME",
  "---------------------------------------------",
  "Dozzle        (logs)         online    847d",
  "Portainer     (containers)   online    847d",
  "Gitea         (git mirror)   online    803d",
  "Uptime Kuma   (monitoring)   online    791d",
  "n8n           (automation)   online    612d",
  "Open WebUI    (llm)          online    401d",
  "Linkding      (bookmarks)    online    388d",
  "Glance        (dashboard)    online    201d",
  "Umami         (analytics)    online    187d",
  "",
  "secured via Tailscale · externalhost.dev",
  "type 'exit' to disconnect",
];

const gitLogLines = [
  "commit a3f9d2c  2026-02-01",
  "Author: Ian Davis <ian@iandavis.dev>",
  "    feat: welcomed first child, updated priorities.md",
  "",
  "commit b81e4f1  2025-08-01",
  "    chore: relocating to Bay Area",
  "",
  "commit 9c2a771  2025-03-01",
  "    feat(render-engine): 20min -> sub-2min, closes #frustration",
  "",
  "commit 4d18c3b  2024-11-01",
  "    feat(hls): migrate 160k assets, -90% support tickets",
  "",
  "commit 2f93a10  2024-06-01",
  "    feat(collab-editor): ship collaborative memorial video editor",
  "",
  "commit e7b3dd5  2023-09-01",
  "    chore: promoted to Lead Software Engineer",
  "",
  "commit 8a1cc94  2022-04-01",
  "    feat(ci-cd): migrate Azure DevOps -> GitHub Actions",
  "",
  "commit 3b72f19  2021-01-01",
  "    fix: joined MemoryShare, began owning full stack",
  "",
  "commit 1f0e832  2019-06-01",
  "    feat: completed PDX Code Guild, selected as TA",
  "",
  "commit 09d4a11  2018-03-01",
  "    chore: separated from military service (aircraft maintenance)",
  "    breaking change: career pivot initiated",
  "",
  "commit 0000001  2018-01-01",
  "    init: started learning to code",
];

const renderEngineLines = [
  "[render-engine] starting worker service...",
  "[render-engine] connecting to job queue...",
  "[render-engine] polling for jobs...",
  "[render-engine] no jobs found. idling.",
  "[render-engine] hint: try ian.hire() to queue a new job",
];

const renderEngineStatusLines = [
  "render-engine v2.6.1",
  "backend: NVENC (fallback: software)",
  "queue_depth: 0",
  "workers_online: 1",
];

const sshFedoraLines = [
  "Connecting to fedora-mb over local mesh...",
  "Authentication successful.",
  "",
  "fedora-mb ~ uname: Fedora Asahi Linux 42 (aarch64)",
  "",
  "HOST                         fedora-mb",
  "CPU                          Apple M2 Max",
  "SHELL                        zsh",
  "WM                           Hyprland",
  "EDITOR                       Neovim",
  "UPTIME                       42 days",
  "",
  "type 'exit' to disconnect",
];

const fantasyStartLines = [
  "[fantasy-draft] initializing mock draft...",
  "[fantasy-draft] loading 2026 player pool...",
  "[fantasy-draft] your pick: Round 1, Pick 7",
  "",
  "available:",
  "  1. CeeDee Lamb        WR  DAL",
  "  2. Justin Jefferson   WR  MIN",
  "  3. Saquon Barkley     RB  PHI",
  "",
  "enter pick (1-3): _",
];

function focusInput(): void {
  if (!visible.value) return;
  inputRef.value?.focus();
}

function openTerminal(): true {
  isMounted.value = true;
  visible.value = true;
  void nextTick(() => {
    focusInput();
    scrollToBottom();
  });
  return true;
}

function closeTerminal(): void {
  visible.value = false;
}

function toggleTerminal(): void {
  if (visible.value) {
    closeTerminal();
    return;
  }
  openTerminal();
}

function pushLine(text: string, className?: string): void {
  output.value.push({ text, className });
}

function pushLines(lines: string[], className?: string): void {
  lines.forEach((line) => {
    pushLine(line, className);
  });
}

async function typeLines(lines: string[], delay: number, className?: string): Promise<void> {
  isStreaming.value = true;
  const token = ++streamToken.value;

  for (const line of lines) {
    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, delay);
    });

    if (token !== streamToken.value) {
      isStreaming.value = false;
      return;
    }

    pushLine(line, className);
  }

  isStreaming.value = false;
}

function cancelStreaming(): void {
  streamToken.value += 1;
  isStreaming.value = false;
}

function scrollToBottom(): void {
  const node = outputRef.value;
  if (!node) return;
  node.scrollTop = node.scrollHeight;
}

function updateHistory(command: string): void {
  commandHistory.value = [...commandHistory.value, command].slice(-20);
  historyIndex.value = null;
}

function historyUp(): void {
  if (commandHistory.value.length === 0) return;
  if (historyIndex.value === null) {
    historyIndex.value = commandHistory.value.length - 1;
  } else {
    historyIndex.value = Math.max(0, historyIndex.value - 1);
  }
  inputValue.value = commandHistory.value[historyIndex.value] ?? "";
}

function historyDown(): void {
  if (commandHistory.value.length === 0 || historyIndex.value === null) return;
  const nextIndex = historyIndex.value + 1;
  if (nextIndex >= commandHistory.value.length) {
    historyIndex.value = null;
    inputValue.value = "";
    return;
  }
  historyIndex.value = nextIndex;
  inputValue.value = commandHistory.value[nextIndex] ?? "";
}

function runCat(args: string[]): void {
  const [target, flag] = args;
  if (!target) {
    pushLine("usage: cat <file>", "line-error");
    return;
  }

  if (target === "resume.pdf") {
    pushLine("opening resume...");
    window.open("/iandavis_resume2026.pdf", "_blank", "noopener");
    return;
  }

  if (target === ".secret") {
    if (flag === "--force") {
      pushLine("// todo: take over the world", "line-comment");
      return;
    }
    pushLine("permission denied", "line-error");
    return;
  }

  const contents = catContent.get(target);
  if (!contents) {
    pushLine(`cat: ${target}: No such file or directory`, "line-error");
    return;
  }

  contents.forEach((line) => pushLine(line));
}

async function runSsh(host: string | undefined): Promise<void> {
  if (!host) {
    pushLine("usage: ssh <host>", "line-error");
    return;
  }

  if (host !== "odin") {
    if (host === "fedora-mb") {
      await typeLines(sshFedoraLines, 60);
      isFedoraSession.value = true;
      return;
    }

    pushLine(`ssh: Could not resolve hostname ${host}: Name or service not known`, "line-error");
    return;
  }

  await typeLines(sshOdinLines, 60);
  isOdinSession.value = true;
}

async function runFantasy(): Promise<void> {
  fantasyAwaitingPick.value = true;
  await typeLines(fantasyStartLines, 70);
}

async function runRenderEngine(args: string[]): Promise<void> {
  if (args[0] === "--status") {
    pushLines(renderEngineStatusLines);
    return;
  }

  await typeLines(renderEngineLines, 120);
}

async function runCommand(rawInput: string): Promise<void> {
  const input = rawInput.trim();
  if (!input) return;

  pushLine(`${PROMPT} ${input}`, "line-prompt");
  updateHistory(input);

  if (fantasyAwaitingPick.value) {
    if (input === "1" || input === "2" || input === "3") {
      fantasyAwaitingPick.value = false;
      pushLine("[fantasy-draft] solid pick. debatable, but solid.");
      pushLine("[fantasy-draft] round 2 coming soon...");
      pushLine("// TODO: build out full 15-round draft", "line-comment");
      return;
    }

    pushLine("[fantasy-draft] invalid pick. enter 1, 2, or 3.", "line-error");
    return;
  }

  const [command, ...args] = input.split(/\s+/);

  if (isStreaming.value) {
    pushLine("terminal busy: wait for current command to finish", "line-comment");
    return;
  }

  if (command === "clear" || command === "cls") {
    output.value = [];
    fantasyAwaitingPick.value = false;
    return;
  }

  if (command === "help" || command === "?") {
    pushLines(helpLines);
    return;
  }

  if (command === "ls" || command === "dir") {
    pushLines(lsLines);
    return;
  }

  if (command === "cat") {
    runCat(args);
    return;
  }

  if (command === "whoami") {
    pushLine("ian — lead software engineer, platform + media systems");
    return;
  }

  if (command === "neofetch") {
    pushLines(neofetchLines);
    return;
  }

  if (command === "git" && args[0] === "log") {
    pushLines(gitLogLines);
    return;
  }

  if (command === "ssh") {
    await runSsh(args[0]);
    return;
  }

  if (command === "./render-engine") {
    await runRenderEngine(args);
    return;
  }

  if (command === "fantasy") {
    await runFantasy();
    return;
  }

  if (command === "exit") {
    cancelStreaming();
    if (isOdinSession.value) {
      isOdinSession.value = false;
      pushLine("logout", "line-comment");
      pushLine("Connection to odin closed.", "line-comment");
      return;
    }

    if (isFedoraSession.value) {
      isFedoraSession.value = false;
      pushLine("logout", "line-comment");
      pushLine("Connection to fedora-mb closed.", "line-comment");
      return;
    }

    fantasyAwaitingPick.value = false;

    pushLine("logout", "line-comment");
    pushLine("Connection to iandavis.dev closed.", "line-comment");
    closeTerminal();
    return;
  }

  pushLine(`bash: ${command}: command not found`, "line-error");
  pushLine("did you mean: ian.hire()", "line-comment");
}

function submitCommand(): void {
  const text = inputValue.value;
  inputValue.value = "";
  void runCommand(text);
}

function handleGlobalKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null;
  const inInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
  const isBacktickKey = event.code === "Backquote" || event.key === "`" || event.key === "Dead";
  const isToggle = isBacktickKey && (event.ctrlKey || event.metaKey);

  if (visible.value && event.key === "Escape") {
    event.preventDefault();
    closeTerminal();
    return;
  }

  if (!isToggle || event.altKey || event.shiftKey) return;

  if (inInput && !visible.value) return;
  event.preventDefault();
  toggleTerminal();
}

onMounted(() => {
  const existing = window.ian ?? {};
  window.ian = {
    ...existing,
    terminal: openTerminal,
  };

  window.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeydown);
});

watch([visible, () => output.value.length, inputValue], () => {
  if (!visible.value) return;
  void nextTick(() => {
    scrollToBottom();
  });
});
</script>

<style scoped>
.terminal-root {
  position: fixed;
  inset: auto 0 var(--status-bar-total-height, var(--status-bar-height, 28px)) 0;
  height: min(35vh, 420px);
  transform: translateY(100%);
  opacity: 0;
  pointer-events: none;
  transition: transform 180ms ease, opacity 180ms ease;
  z-index: 120;
}

.terminal-root.is-visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.terminal-panel {
  height: 100%;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-default);
  display: grid;
  grid-template-rows: auto 1fr;
}

.terminal-header {
  height: 34px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-muted);
  background: color-mix(in srgb, var(--bg-secondary) 80%, black 20%);
  padding-inline: 0.625rem;
}

.terminal-tab {
  font-size: var(--text-xs);
  color: var(--text-primary);
  letter-spacing: 0.08em;
}

.terminal-actions {
  display: flex;
  gap: 0.375rem;
}

.terminal-action {
  border: 0;
  width: 1.5rem;
  height: 1.5rem;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  cursor: pointer;
}

.terminal-action:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.terminal-output {
  overflow: auto;
  padding: 0.75rem 1rem;
  scrollbar-width: none;
}

.terminal-output:hover {
  scrollbar-width: thin;
}

.terminal-output::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.terminal-output:hover::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.terminal-output:hover::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 999px;
}

.terminal-output:hover::-webkit-scrollbar-track {
  background: transparent;
}

.terminal-line,
.prompt-line {
  font-size: var(--text-sm);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.line-prompt,
.prompt {
  color: var(--accent-mint);
}

.line-error {
  color: var(--accent-red);
}

.line-comment {
  color: var(--text-muted);
}

.prompt-line {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 0.5ch;
}

.command-preview {
  color: var(--text-primary);
}

.cursor {
  display: inline-block;
  width: 0.55ch;
  height: 1.05em;
  background: var(--text-primary);
  animation: blink 1s steps(1, end) infinite;
}

.terminal-input {
  position: absolute;
  inset: 0;
  width: 100%;
  border: 0;
  opacity: 0;
  background: transparent;
  color: transparent;
  caret-color: transparent;
}

.terminal-input:focus {
  outline: none;
}

@keyframes blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .terminal-root {
    height: min(42vh, 420px);
  }

  .terminal-output {
    padding: 0.625rem 0.75rem;
  }

  .terminal-line,
  .prompt-line {
    font-size: var(--text-xs);
    line-height: 1.45;
  }
}
</style>
