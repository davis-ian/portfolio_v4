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
  if (
    arrowContainer &&
    typeof lottie !== "undefined" &&
    window.arrowAnimationData
  ) {
    lottie.loadAnimation({
      container: arrowContainer,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: window.arrowAnimationData,
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

  function getScrollContainer() {
    const scroller = document.querySelector(".page-content");
    if (
      scroller instanceof HTMLElement &&
      scroller.scrollHeight > scroller.clientHeight + 1
    ) {
      return scroller;
    }
    return window;
  }

  function scrollSection(target, offset = 0, block = "start", useHeading = true) {
    const scrollContainer = getScrollContainer();
    const heading = target.querySelector(".section-heading");
    const scrollTarget =
      useHeading && heading instanceof HTMLElement ? heading : target;

    if (scrollContainer === window) {
      let top =
        window.scrollY + scrollTarget.getBoundingClientRect().top - offset;
      if (block === "center") {
        top -= (window.innerHeight - scrollTarget.getBoundingClientRect().height) / 2;
      }
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      return;
    }

    let top =
      scrollContainer.scrollTop +
      (scrollTarget.getBoundingClientRect().top -
        scrollContainer.getBoundingClientRect().top) -
      offset;
    if (block === "center") {
      top -=
        (scrollContainer.clientHeight - scrollTarget.getBoundingClientRect().height) /
        2;
    }
    scrollContainer.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  // Keep Featured/Work top-aligned without section top padding.
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const section = link.getAttribute("data-section");
      if (!section) return;

      const target = document.getElementById(section);
      if (!target) return;

      event.preventDefault();

      const isTopAligned = section === "featured" || section === "work";
      if (isTopAligned) {
        scrollSection(target, 16, "start", true);
      } else {
        scrollSection(target, 0, "center", false);
      }

      history.replaceState(null, "", `#${section}`);
    });
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
    const email = getEmail();
    Array.from(emailNavs).forEach((el) => {
      el.href = "mailto:" + email;
    });
  }

  // Initialize
  updateNavHighlight("featured");
});
