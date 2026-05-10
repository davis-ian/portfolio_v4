# Terminal Easter Egg — Implementation Plan

**Site:** iandavis.dev  
**Framework:** Vue.js  
**Theme:** selected theme

---

## Overview

A hidden, fully interactive terminal embedded in the site that accepts real commands and returns
personal, on-brand responses. The terminal lives inside the existing VS Code chrome — either as a
toggleable panel at the bottom (mimicking the VS Code integrated terminal) or as a slide-in drawer
triggered by a key sequence. It is not immediately visible — discovery is part of the experience.

The terminal becomes the container for all future easter eggs. New commands can be added at any
time without touching any other part of the site.

---

## Trigger Mechanism

The terminal should not be discoverable by accident. Two trigger options — implement both:

**Primary: Keyboard shortcut**  
`` Ctrl + ` `` (backtick) — the exact same shortcut that opens the integrated terminal in VS Code.
Any engineer who uses VS Code will try this instinctively. No other portfolio site will respond to it.

**Secondary: Console command**  
`ian.terminal()` callable from the browser console. Referenced at the bottom of the existing
console easter egg message so curious devs have a breadcrumb:

```
// run ian.terminal() to open the integrated terminal
```

**Do not** add a visible button or hint anywhere on the main UI. Discoverability through
VS Code muscle memory is the entire point.

---

## Visual Design

Match the VS Code integrated terminal panel exactly:

- Panel slides up from the bottom of the viewport, ~35% height
- Tab bar at the top: `TERMINAL` tab active, `+` icon, `x` to close
- Shell prompt matches the existing hero prompt style:
  ```
  guest@iandavis:~$
  ```
- Monospace font, same as the rest of the site (`JetBrains Mono`)
- Background: slightly lighter than the editor background, matching VS Code's terminal bg
- Blinking block cursor after the prompt
- Input is a transparent `<input>` overlaid on the prompt line — captures typing without a visible text field
- Command history navigable with arrow up/down (store last 20 commands in a reactive array)
- Output renders above the current prompt line, scrollable
- Terminal clears on `clear` command
- Panel is closeable with `Ctrl + \`` again, the `x`button, or`Escape`

**No scrollbar visible by default** — only appears on hover, styled to match VS Code's thin
overlay scrollbar.

---

## Command Registry

Commands are defined in a single registry object — each entry has a `name`, optional `aliases`,
and a `handler` function that returns either a string or an array of styled output lines.

```js
// structure
const commands = {
  help: { aliases: ["?"], handler: helpHandler },
  ls: { aliases: ["dir"], handler: lsHandler },
  cat: { aliases: [], handler: catHandler },
  ssh: { aliases: [], handler: sshHandler },
  whoami: { aliases: [], handler: whoamiHandler },
  clear: { aliases: ["cls"], handler: clearHandler },
  // ...
};
```

Unknown commands return:

```
bash: <command>: command not found
did you mean: ian.hire()
```

---

## Commands — Full Spec

### `help` / `?`

Lists all available commands with a one-line description each.

```
available commands:

  ls              list directory contents
  cat <file>      read a file
  ssh <host>      connect to a remote host
  whoami          current user info
  git log         commit history
  ./render-engine run the render engine
  neofetch        system info
  fantasy         fantasy football draft simulator
  clear           clear terminal
  exit            close terminal

type any command to get started.
```

---

### `ls`

Returns a directory listing styled like a real `ls -la` output.

```
drwxr-xr-x  ian  staff   about.md
drwxr-xr-x  ian  staff   projects/
drwxr-xr-x  ian  staff   experience.json
drwxr-xr-x  ian  staff   render-engine  [executable]
drwxr-xr-x  ian  staff   resume.pdf
-rw-r--r--  ian  staff   .secret        [hidden]
```

`.secret` is listed but not readable — `cat .secret` returns `permission denied`.  
`cat .secret --force` returns a dry one-liner: `// todo: take over the world`.

---

### `cat <file>`

Reads files from the directory listing above. Each maps to real content:

| Command               | Output                                                                               |
| --------------------- | ------------------------------------------------------------------------------------ |
| `cat about.md`        | Short markdown-style bio — military background, bootcamp, MemoryShare, Bay Area move |
| `cat experience.json` | Pretty-printed JSON of work history with real dates and stack                        |
| `cat resume.pdf`      | `opening resume...` then triggers a download/open of the actual resume               |
| `cat .secret`         | `permission denied`                                                                  |
| `cat .secret --force` | `// todo: take over the world`                                                       |

---

### `ssh odin`

The highest-value command. Simulates connecting to the homelab server.

```
Connecting to odin via Tailscale...
Authentication successful.

odin ~ uptime: 847 days

SERVICES                     STATUS    UPTIME
─────────────────────────────────────────────
Dozzle        (logs)         ● online  847d
Portainer     (containers)   ● online  847d
Gitea         (git mirror)   ● online  803d
Uptime Kuma   (monitoring)   ● online  791d
n8n           (automation)   ● online  612d
Open WebUI    (llm)          ● online  401d
Linkding      (bookmarks)    ● online  388d
Glance        (dashboard)    ● online  201d
Umami         (analytics)    ● online  187d

secured via Tailscale · externalhost.dev
type 'exit' to disconnect
```

After `ssh odin` is active, `exit` returns to normal prompt. Optional: a second
`ssh fedora-mb` command that returns the Fedora Asahi / Hyprland machine info.

---

### `git log`

Returns a fake but real-looking git log of Ian's life and career milestones.
Dry commit messages, real approximate dates, fake short hashes.

```
commit a3f9d2c  2026-02-01
Author: Ian Davis <ian@iandavis.dev>
    feat: welcomed first child, updated priorities.md

commit b81e4f1  2025-08-01
    chore: relocating to Bay Area

commit 9c2a771  2025-03-01
    feat(render-engine): 20min -> sub-2min, closes #frustration

commit 4d18c3b  2024-11-01
    feat(hls): migrate 160k assets, -90% support tickets

commit 2f93a10  2024-06-01
    feat(collab-editor): ship collaborative memorial video editor

commit e7b3dd5  2023-09-01
    chore: promoted to Lead Software Engineer

commit 8a1cc94  2022-04-01
    feat(ci-cd): migrate Azure DevOps -> GitHub Actions

commit 3b72f19  2021-01-01
    fix: joined MemoryShare, began owning full stack

commit 1f0e832  2019-06-01
    feat: completed PDX Code Guild, selected as TA

commit 09d4a11  2018-03-01
    chore: separated from military service (aircraft maintenance)
    breaking change: career pivot initiated

commit 0000001  2018-01-01
    init: started learning to code
```

---

### `./render-engine`

Simulates starting the render engine with a fake progress output.
Typed out line by line with small delays for authenticity.

```
[render-engine] starting worker service...
[render-engine] connecting to job queue...
[render-engine] polling for jobs...
[render-engine] no jobs found. idling.
[render-engine] hint: try ian.hire() to queue a new job
```

`./render-engine --status` returns version info, encoding backend (NVENC / software fallback),
and current job queue depth (always 0).

---

### `neofetch`

Classic `neofetch`-style system info block. ASCII art of a Norse rune or `ID` monogram
on the left, stats on the right.

```
         ██╗██████╗          ian@iandavis.dev
         ██║██╔══██╗         ─────────────────────────
         ██║██║  ██║         OS:      Fedora Asahi Linux (M2 Max)
         ██║██║  ██║         Shell:   zsh + tmux
         ██║██████╔╝         Editor:  Neovim / Rider
         ╚═╝╚═════╝          WM:      Hyprland
                             Stack:   C# · Vue · FFmpeg · AWS
                             Uptime:  4+ years @ MemoryShare
                             Memory:  too much FFmpeg knowledge
                             Dotfiles: github.com/davis-ian
```

---

### `fantasy`

Triggers a mini fantasy football draft simulator. Dry, funny, personal.

```
[fantasy-draft] initializing mock draft...
[fantasy-draft] loading 2026 player pool...
[fantasy-draft] your pick: Round 1, Pick 7

available:
  1. CeeDee Lamb    WR  DAL
  2. Justin Jefferson WR MIN
  3. Saquon Barkley RB  PHI

enter pick (1-3): _
```

On pick:

```
[fantasy-draft] solid pick. debatable, but solid.
[fantasy-draft] round 2 coming soon...
// TODO: build out full 15-round draft
```

Keep it intentionally incomplete. The TODO comment is the joke.

---

### `exit`

Closes the terminal panel with a fade-out animation.

```
logout
Connection to iandavis.dev closed.
```

---

## Vue Implementation Structure

```
src/
  components/
    Terminal/
      Terminal.vue          # root component, handles visibility + keybinding
      TerminalOutput.vue    # renders output history lines
      TerminalPrompt.vue    # the input line with blinking cursor
  composables/
    useTerminal.js          # state: history, input, visible
    useCommands.js          # command registry + handlers
    useCommandHistory.js    # arrow key navigation through past commands
```

**Terminal.vue** listens for `Ctrl + \`` on `window`via`onMounted`, toggles a `visible`ref,
and unmounts cleanly in`onUnmounted`.

**useCommands.js** is the only file that needs editing to add new commands. All handlers are
pure functions that take optional args and return output lines. No business logic in the component.

**Output lines** are typed objects: `{ text: string, class: string }` — allows per-line coloring
(errors in red, success in teal, comments in green, matching VS Code token colors).

---

## Performance Constraints

- No dependencies — pure Vue + JS, no terminal library
- No `mousemove` listeners anywhere in this component
- `setInterval` used only for the blinking cursor — cleared in `onUnmounted`
- Typing animation for `./render-engine` output uses `setTimeout` chain, not `setInterval`
- Command history capped at 20 entries in memory — no localStorage
- Terminal DOM is `v-if` not `v-show` — not mounted until first open

---

## Command Output Typing Animation

For commands like `./render-engine` and `ssh odin` where output arrives line by line,
use a recursive `setTimeout` chain that pushes one line at a time into the output array:

```js
function typeLines(lines, delay = 80) {
  lines.reduce((promise, line, i) => {
    return promise.then(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            output.value.push(line);
            resolve();
          }, delay * i);
        }),
    );
  }, Promise.resolve());
}
```

Delay is configurable per command — `ssh odin` uses 60ms for a snappy connection feel,
`./render-engine` uses 120ms for a slower boot feel.

---

## Phased Rollout

**Phase 1 (ship first):**
`help`, `ls`, `cat`, `whoami`, `clear`, `exit`, `neofetch`

**Phase 2:**
`ssh odin`, `git log`, `./render-engine`

**Phase 3:**
`fantasy`, `ssh fedora-mb`, any additional commands

Unknown commands always work from day one — the `command not found` handler is part of Phase 1.

---

## Notes

- Never store anything in localStorage — all state lives in the component for the session
- The terminal is an easter egg, not a feature — it should never appear in the site's navigation,
  sitemap, or any visible UI element
- Add `ian.terminal()` to the existing `window.ian` object so the console easter egg and the
  terminal easter egg are linked
- Keep commit messages in `git log` dry and honest — the military `breaking change: career pivot`
  line is the one people will screenshot
