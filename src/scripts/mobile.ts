export function toggleFolder(element: HTMLElement): void {
  const folder = element.parentElement;
  if (folder) folder.classList.toggle("open");
}

export function initFolderToggles(): void {
  document.querySelectorAll<HTMLElement>("[data-folder-toggle]").forEach((element) => {
    element.addEventListener("click", () => toggleFolder(element));
  });
}

export function initMobileMenu(): void {
  const btn = document.getElementById("mobile-menu-btn");
  const activeFileLabel = document.getElementById("mobile-menu-active");
  const sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;

  const sectionToFile: Record<string, string> = {
    hero: "README.md",
    featured: "featured.js",
    work: "projects/",
    "case-studies": "case-studies/",
    about: "about.md",
    experience: "experience.json",
  };

  const updateMenuLabel = (): void => {
    let currentSection = "hero";
    let minDistance = Infinity;
    Object.keys(sectionToFile).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const distance = Math.abs(rect.top);
      if (distance < minDistance && rect.top < 200) {
        minDistance = distance;
        currentSection = id;
      }
    });
    const fileLabel = sectionToFile[currentSection] ?? "README.md";
    if (activeFileLabel) activeFileLabel.textContent = fileLabel;
    btn.setAttribute("data-active-file", fileLabel);
  };

  const setMenuOpen = (isOpen: boolean): void => {
    sidebar.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", isOpen);
  };

  btn.addEventListener("click", () => {
    const nextOpen = !sidebar.classList.contains("open");
    setMenuOpen(nextOpen);
  });

  document.addEventListener("click", (event) => {
    if (!sidebar.classList.contains("open")) return;
    const target = event.target as Node;
    if (sidebar.contains(target) || btn.contains(target)) return;
    setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !sidebar.classList.contains("open")) return;
    event.preventDefault();
    setMenuOpen(false);
    (btn as HTMLElement).focus();
  });

  sidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) setMenuOpen(false);
    });
  });

  window.addEventListener("scroll", updateMenuLabel, { passive: true });
  updateMenuLabel();
}
