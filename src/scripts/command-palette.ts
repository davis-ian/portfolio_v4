import { copyEmail, downloadResume, showNotification } from "./actions";
import { scrollToSection } from "./navigation";
import { applyTheme } from "./themes";

interface Command {
  id: string;
  label: string;
  action: () => void;
  category: string;
  key?: string;
}

function projectPath(slug: string): string {
  return `/projects/${slug}`;
}

export function getCommands(): Command[] {
  return [
    { id: "hero", label: "Open: README.md", action: () => scrollToSection("hero"), category: "Navigation", key: "1" },
    { id: "featured", label: "Open: featured.js", action: () => scrollToSection("featured"), category: "Navigation", key: "2" },
    { id: "work", label: "Open: projects/", action: () => scrollToSection("work"), category: "Navigation", key: "3" },
    { id: "case-studies", label: "Open: case-studies/", action: () => scrollToSection("case-studies"), category: "Navigation", key: "4" },
    { id: "about", label: "Open: about.md", action: () => scrollToSection("about"), category: "Navigation", key: "5" },
    { id: "experience", label: "Open: experience.json", action: () => scrollToSection("experience"), category: "Navigation", key: "6" },
    { id: "forma", label: "Go to: Forma Project", action: () => (window.location.href = projectPath("forma")), category: "Projects" },
    { id: "media-toolkit", label: "Go to: Media Toolkit Project", action: () => (window.location.href = projectPath("media-toolkit")), category: "Projects" },
    { id: "render-engine", label: "Go to: Render Engine Case Study", action: () => (window.location.href = "/case-studies/render-engine"), category: "Projects" },
    { id: "collaborative-video", label: "Go to: Collaborative Video Case Study", action: () => (window.location.href = "/case-studies/collaborative-video"), category: "Projects" },
    { id: "upnext", label: "Go to: UpNext Project", action: () => (window.location.href = projectPath("upnext")), category: "Projects" },
    { id: "callsign", label: "Go to: Callsign Project", action: () => (window.location.href = projectPath("callsign")), category: "Projects" },
    { id: "minigames", label: "Go to: Minigames Project", action: () => (window.location.href = projectPath("minigames")), category: "Projects" },
    { id: "ffmpeg-wa", label: "Go to: FFmpeg-wa Project", action: () => (window.location.href = projectPath("ffmpeg-wa")), category: "Projects" },
    { id: "github", label: "Open: GitHub Profile", action: () => window.open("https://github.com/davis-ian", "_blank"), category: "External" },
    { id: "linkedin", label: "Open: LinkedIn Profile", action: () => window.open("https://linkedin.com/in/iandavisdev", "_blank"), category: "External" },
    { id: "email", label: "Copy: Email Address", action: copyEmail, category: "Actions" },
    { id: "resume", label: "Download: Resume", action: downloadResume, category: "Actions", key: "R" },
    {
      id: "theme-vesper",
      label: "Theme: Vesper",
      action: () => {
        applyTheme("vesper");
        showNotification("Theme set to Vesper");
      },
      category: "Themes",
    },
    {
      id: "theme-catppuccin",
      label: "Theme: Catppuccin",
      action: () => {
        applyTheme("catppuccin");
        showNotification("Theme set to Catppuccin");
      },
      category: "Themes",
    },
    {
      id: "theme-tokyo-night",
      label: "Theme: Tokyo Night",
      action: () => {
        applyTheme("tokyo-night");
        showNotification("Theme set to Tokyo Night");
      },
      category: "Themes",
    },
    {
      id: "theme-incognito",
      label: "Theme: Incognito",
      action: () => {
        applyTheme("incognito");
        showNotification("Theme set to Incognito");
      },
      category: "Themes",
    },
    {
      id: "theme-miami-nights",
      label: "Theme: Miami Nights",
      action: () => {
        applyTheme("miami-nights");
        showNotification("Theme set to Miami Nights");
      },
      category: "Themes",
    },
    { id: "back", label: "Go back to portfolio", action: () => (window.location.href = "/"), category: "Navigation", key: "B" },
  ];
}

export class CommandPalette {
  private overlay: HTMLElement | null;
  private input: HTMLInputElement | null;
  private list: HTMLElement | null;
  private selectedIndex: number;
  private filteredCommands: Command[];
  isOpen: boolean;
  private commands: Command[];

  constructor(commands: Command[]) {
    this.overlay = document.getElementById("command-palette");
    this.input = document.getElementById("command-input") as HTMLInputElement | null;
    this.list = document.getElementById("command-list");
    this.selectedIndex = -1;
    this.filteredCommands = [];
    this.isOpen = false;
    this.commands = commands;
    if (this.overlay && this.input && this.list) this.init();
  }

  private init(): void {
    this.input?.addEventListener("input", () => this.filter(this.input?.value ?? ""));
    this.overlay?.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
      const item = (e.target as HTMLElement).closest(".command-item") as HTMLButtonElement | null;
      if (!item) return;
      const index = Number(item.dataset.index);
      this.executeByIndex(index);
    });
    this.overlay?.addEventListener("keydown", (e) => {
      if (!this.isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      } else if (e.key === "Enter") {
        e.preventDefault();
        this.executeSelected();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.close();
      }
      this.updateSelection();
    });
    this.filter("");
  }

  toggle(): void { this.isOpen ? this.close() : this.open(); }
  open(): void {
    this.isOpen = true;
    this.overlay?.classList.add("active");
    if (this.input) {
      this.input.value = "";
      this.input.focus();
    }
    this.filter("");
    this.selectedIndex = 0;
    this.updateSelection();
    this.updateStatusMode("INSERT");
  }
  close(): void {
    this.isOpen = false;
    this.overlay?.classList.remove("active");
    this.input?.blur();
    this.updateStatusMode("NORMAL");
  }

  private updateStatusMode(mode: "INSERT" | "NORMAL"): void {
    const statusMode = document.getElementById("status-mode");
    if (!statusMode) return;
    statusMode.textContent = mode;
    statusMode.classList.toggle("insert", mode === "INSERT");
  }

  private filter(query: string): void {
    const lower = query.toLowerCase();
    this.filteredCommands = this.commands.filter((cmd) => cmd.label.toLowerCase().includes(lower) || cmd.category.toLowerCase().includes(lower));
    this.render();
    this.selectedIndex = 0;
    this.updateSelection();
  }

  private render(): void {
    if (!this.list) return;
    if (this.filteredCommands.length === 0) {
      this.list.innerHTML = '<div class="command-empty">No commands found</div>';
      return;
    }
    const grouped: Record<string, Command[]> = {};
    this.filteredCommands.forEach((cmd) => {
      if (!grouped[cmd.category]) grouped[cmd.category] = [];
      grouped[cmd.category].push(cmd);
    });
    this.list.innerHTML = Object.entries(grouped).map(([category, commands]) => {
      const rows = commands.map((cmd) => {
        const index = this.filteredCommands.indexOf(cmd);
        return `<button class="command-item" data-index="${index}"><span>${cmd.label}</span>${cmd.key ? `<span class="command-key">${cmd.key}</span>` : ""}</button>`;
      }).join("");
      return `<div style="padding:0.5rem 1rem;font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">${category}</div>${rows}`;
    }).join("");
  }

  private updateSelection(): void {
    this.list?.querySelectorAll<HTMLElement>(".command-item").forEach((item) => {
      const i = Number(item.dataset.index);
      const selected = i === this.selectedIndex;
      item.classList.toggle("selected", selected);
      if (selected) item.scrollIntoView({ block: "nearest" });
    });
  }

  private executeByIndex(index: number): void {
    if (index < 0 || index >= this.filteredCommands.length) return;
    this.close();
    this.filteredCommands[index]?.action();
  }

  private executeSelected(): void {
    this.executeByIndex(this.selectedIndex);
  }
}
