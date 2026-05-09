export function getEmail(): string {
  const user = ["hello", "iandavis"].join(".");
  const domain = ["gmail", "com"].join(".");
  return [user, domain].join("@");
}

export function showNotification(message: string): void {
  const notif = document.createElement("div");
  notif.textContent = message;
  notif.style.cssText = "position:fixed;bottom:50px;left:50%;transform:translateX(-50%);background:var(--accent-peach,#ffc799);color:#000;padding:0.75rem 1.5rem;border-radius:4px;font-weight:600;z-index:10000;font-family:monospace;font-size:0.875rem;box-shadow:0 4px 12px rgba(0,0,0,0.3);";
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transition = "opacity 0.3s";
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

export function copyEmail(): void {
  const email = getEmail();
  navigator.clipboard
    .writeText(email)
    .then(() => showNotification("Email copied to clipboard!"))
    .catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const success = document.getSelection()?.toString() === email;
        if (success) {
          showNotification("Email selected. Press Cmd/Ctrl+C to copy.");
        } else {
          showNotification("Copy failed. Email shown for manual copy.");
        }
      } finally {
        document.body.removeChild(textarea);
      }
    });
}

export function downloadResume(): void {
  window.open("/iandavis_resume2026.pdf", "_blank");
}

export function initEmail(): void {
  const emailLink = document.getElementById("email-link") as HTMLAnchorElement | null;
  if (!emailLink) return;
  const email = getEmail();
  emailLink.href = `mailto:${email}`;
  emailLink.textContent = email;
  emailLink.setAttribute("aria-label", `Send email to ${email}`);
}

export function initResumeButton(): void {
  const btn = document.getElementById("resume-btn");
  if (btn) btn.addEventListener("click", downloadResume);
}

export function initDataActions(): void {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const runButton = target.closest("[data-run-url]") as HTMLElement | null;
    if (!runButton) return;
    event.preventDefault();
    const url = runButton.dataset.runUrl;
    if (url) window.open(url, "_blank");
  });
}
