let hasUserNavigated = false;

export function setHasUserNavigated(value: boolean): void {
  hasUserNavigated = value;
}

export function updateStatusBar(): void {
  const currentFileEl = document.getElementById("current-file");
  const statusFileEl = document.getElementById("status-file");
  const statusPositionEl = document.getElementById("status-position");
  if (!currentFileEl || !statusFileEl) return;

  const sections = ["hero", "featured", "work", "about", "experience"];
  const fileNames: Record<string, string> = {
    hero: "README.md",
    featured: "featured.js",
    work: "projects/",
    about: "about.md",
    experience: "experience.json",
  };

  let currentSection = "hero";
  let minDistance = Infinity;
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const distance = Math.abs(rect.top);
    if (distance < minDistance && rect.top < 200) {
      minDistance = distance;
      currentSection = id;
    }
  });

  const fileName = fileNames[currentSection] ?? "README.md";
  currentFileEl.textContent = fileName;
  statusFileEl.textContent = fileName;

  if (!statusPositionEl) return;
  const scrollableHeight = document.body.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) {
    statusPositionEl.textContent = "1:1";
    return;
  }
  const scrollPercent = window.scrollY / scrollableHeight;
  const line = Math.floor(scrollPercent * 100) + 1;
  statusPositionEl.textContent = `${line}:1`;
}

export function updatePageSize(): void {
  const pageSizeEl = document.getElementById("status-size");
  if (!pageSizeEl) return;
  const htmlContent = document.documentElement.outerHTML;
  const sizeInBytes = new Blob([htmlContent]).size;
  pageSizeEl.textContent = `${(sizeInBytes / 1024).toFixed(1)} KB`;
}

export function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

export function initNavigation(): void {
  const files = document.querySelectorAll<HTMLElement>(".file");
  const sections = ["hero", "featured", "work", "about", "experience"];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || !hasUserNavigated) return;
      const id = entry.target.id;
      files.forEach((file) => file.classList.toggle("active", file.dataset.section === id));
      updateStatusBar();
    });
  }, { threshold: 0.3 });

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  files.forEach((file) => {
    file.addEventListener("click", (e) => {
      const section = file.dataset.section;
      if (!section) return;
      e.preventDefault();
      hasUserNavigated = true;
      scrollToSection(section);
    });
  });

  document.querySelectorAll<HTMLElement>(".crumb[data-section]").forEach((crumb) => {
    crumb.addEventListener("click", (e) => {
      const section = crumb.dataset.section;
      if (!section) return;
      e.preventDefault();
      hasUserNavigated = true;
      scrollToSection(section);
    });
  });
}

export function handleHashNavigation(): void {
  const hash = window.location.hash;
  if (!hash) return;
  setTimeout(() => {
    const sectionId = hash.replace("#", "");
    const element = document.getElementById(sectionId);
    if (!element) return;
    hasUserNavigated = true;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelectorAll<HTMLElement>(".file").forEach((file) => {
      file.classList.toggle("active", file.dataset.section === sectionId);
    });
    updateStatusBar();
  }, 100);
}
