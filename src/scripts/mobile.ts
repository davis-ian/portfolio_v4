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
  const sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;

  btn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  sidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) sidebar.classList.remove("open");
    });
  });
}

export function initOpenFolderHeights(): void {
  document.querySelectorAll<HTMLElement>(".folder.open").forEach((folder) => {
    const contents = folder.querySelector<HTMLElement>(".folder-contents");
    if (contents) contents.style.maxHeight = "1000px";
  });
}
