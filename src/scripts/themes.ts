type ThemeId = "vesper" | "catppuccin" | "tokyo-night" | "incognito";

type ThemeTokens = Record<string, string>;

const STORAGE_KEY = "portfolio-theme";

const THEMES: Record<ThemeId, ThemeTokens> = {
  vesper: {
    "--bg-primary": "#101010",
    "--bg-secondary": "#101010",
    "--bg-tertiary": "#161616",
    "--bg-hover": "#1c1c1c",
    "--border-default": "#282828",
    "--border-muted": "#1c1c1c",
    "--text-primary": "#ffffff",
    "--text-secondary": "#b8b8b8",
    "--text-muted": "#909090",
    "--accent-peach": "#ffc799",
    "--accent-peach-dim": "rgba(255, 199, 153, 0.15)",
    "--accent-mint": "#99ffe4",
    "--accent-mint-dim": "rgba(153, 255, 228, 0.15)",
    "--accent-red": "#ff8080",
  },
  catppuccin: {
    "--bg-primary": "#1e1e2e",
    "--bg-secondary": "#181825",
    "--bg-tertiary": "#313244",
    "--bg-hover": "#45475a",
    "--border-default": "#45475a",
    "--border-muted": "#313244",
    "--text-primary": "#cdd6f4",
    "--text-secondary": "#bac2de",
    "--text-muted": "#a6adc8",
    "--accent-peach": "#fab387",
    "--accent-peach-dim": "rgba(250, 179, 135, 0.18)",
    "--accent-mint": "#94e2d5",
    "--accent-mint-dim": "rgba(148, 226, 213, 0.18)",
    "--accent-red": "#f38ba8",
  },
  "tokyo-night": {
    "--bg-primary": "#1a1b26",
    "--bg-secondary": "#16161e",
    "--bg-tertiary": "#24283b",
    "--bg-hover": "#2f334d",
    "--border-default": "#3b4261",
    "--border-muted": "#2f334d",
    "--text-primary": "#c0caf5",
    "--text-secondary": "#a9b1d6",
    "--text-muted": "#7a83a8",
    "--accent-peach": "#ff9e64",
    "--accent-peach-dim": "rgba(255, 158, 100, 0.18)",
    "--accent-mint": "#73daca",
    "--accent-mint-dim": "rgba(115, 218, 202, 0.18)",
    "--accent-red": "#f7768e",
  },
  incognito: {
    "--bg-primary": "#171717",
    "--bg-secondary": "#111111",
    "--bg-tertiary": "#232323",
    "--bg-hover": "#2c2c2c",
    "--border-default": "#303030",
    "--border-muted": "#262626",
    "--text-primary": "#d1d0c5",
    "--text-secondary": "#b7b5a8",
    "--text-muted": "#7e7d74",
    "--accent-peach": "#e2b714",
    "--accent-peach-dim": "rgba(226, 183, 20, 0.18)",
    "--accent-mint": "#7bd88f",
    "--accent-mint-dim": "rgba(123, 216, 143, 0.18)",
    "--accent-red": "#ca4754",
  },
};

function isThemeId(value: string): value is ThemeId {
  return value in THEMES;
}

export function applyTheme(themeId: ThemeId): void {
  const root = document.documentElement;
  const tokens = THEMES[themeId];
  Object.entries(tokens).forEach(([token, value]) => {
    root.style.setProperty(token, value);
  });
  root.dataset.theme = themeId;
  localStorage.setItem(STORAGE_KEY, themeId);
}

export function getStoredTheme(): ThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && isThemeId(stored) ? stored : "vesper";
}

export function initTheme(): void {
  applyTheme(getStoredTheme());
}
