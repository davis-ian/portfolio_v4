// ========================================
// Portfolio – Vanilla JavaScript
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Copyright Year ----------
  const copyrightEl = document.getElementById("copyright");
  if (copyrightEl) {
    copyrightEl.textContent = `\u00A9 ${new Date().getFullYear()} Ian Davis`;
  }

  // ---------- Lottie Scroll Arrow ----------
  const arrowContainer = document.getElementById("scroll-arrow");
  if (arrowContainer && typeof lottie !== "undefined") {
    lottie.loadAnimation({
      container: arrowContainer,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "animations/arrow-left-down2.json",
    });
  }

  // ---------- Section Tracking (IntersectionObserver) ----------
  const sectionIds = ["featured", "work", "about", "experience"];
  const navLinks = document.querySelectorAll(".side-nav .nav-links .nav-link");

  let currentSection = "featured";

  function updateNavHighlight(activeId) {
    currentSection = activeId;
    navLinks.forEach((link) => {
      const section = link.getAttribute("data-section");
      if (!section) return;
      if (section === activeId) {
        link.classList.remove("dimmed");
      } else {
        link.classList.add("dimmed");
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateNavHighlight(entry.target.id);
        }
      });
    },
    { threshold: 0.9 },
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  // ----------- Email Injection ------------
  function getEmail() {
    const user = "hello.iandavis";
    const domain = "gmail";
    const tld = "com";

    return user + "@" + domain + "." + tld;
  }

  const emailLink = document.getElementById("email-link");
  const emailNavs = document.getElementsByClassName("email-nav");

  if (emailLink) {
    const email = getEmail();
    emailLink.textContent = email;
    emailLink.href = "mailto:" + email;
  }

  if (emailNavs.length > 0) {
    console.log(emailNavs, "email nav");
    const email = getEmail();
    Array.from(emailNavs).forEach((el) => {
      el.href = "mailto:" + email;
    });
  }

  // Initialize
  updateNavHighlight("featured");
});
