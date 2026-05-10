declare global {
  interface Window {
    __portfolioConsoleEggShown?: boolean;
    ian?: {
      hire: () => true;
      resume: () => "opening...";
      stack: () => string[];
      help: () => "good luck out there";
    };
  }
}

import { getEmail } from "./actions";

const ASCII_ART = String.raw`
  ██╗ █████╗ ███╗   ██╗
  ██║██╔══██╗████╗  ██║
  ██║███████║██╔██╗ ██║
  ██║██╔══██║██║╚██╗██║
  ██║██║  ██║██║ ╚████║
  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
`;

export function initConsoleEasterEgg(): void {
  if (typeof window === "undefined") return;

  const styles = {
    banner: "color: var(--accent-mint); font-family: monospace;",
    greeting:
      "color: var(--text-primary); font-size: 13px; font-family: monospace;",
    nod: "color: var(--text-muted); font-size: 13px; font-family: monospace;",
    details:
      "color: var(--text-secondary); font-size: 12px; font-family: monospace;",
    hire: "color: var(--accent-mint); font-size: 12px; font-family: monospace;",
    hireSuccess:
      "color: var(--accent-mint); font-size: 13px; font-family: monospace;",
    hireOpening:
      "color: var(--text-muted); font-size: 12px; font-family: monospace;",
    helpHeader:
      "color: var(--text-primary); font-size: 13px; font-family: monospace;",
    helpLine:
      "color: var(--text-secondary); font-size: 12px; font-family: monospace;",
  };

  const stackValues = ["C#", "Vue", "FFmpeg", "Azure", "Docker"];

  window.ian = {
    hire: () => {
      console.log("%c", "");
      console.log("%c  ✓ ian.hire() executed successfully", styles.hireSuccess);
      console.log("%c  > opening mail client...", styles.hireOpening);
      console.log("%c", "");
      const subject = encodeURIComponent("Let's talk");
      setTimeout(() => {
        window.location.href = `mailto:${getEmail()}?subject=${subject}`;
      }, 1500);
      return true;
    },
    resume: () => {
      window.open("/iandavis_resume2026.pdf", "_blank");
      return "opening...";
    },
    stack: () => {
      console.log("%c", "");
      console.log(`%c  ${stackValues.join(" · ")}`, styles.details);
      return stackValues;
    },
    help: () => {
      console.log("%c", "");
      console.log("%c  available commands:", styles.helpHeader);
      console.log("%c  ian.hire()    -- the right move", styles.helpLine);
      console.log("%c  ian.resume()  -- open resume", styles.helpLine);
      console.log("%c  ian.stack()   -- print stack", styles.helpLine);
      return "good luck out there";
    },
  };

  if (window.__portfolioConsoleEggShown) return;

  window.__portfolioConsoleEggShown = true;

  console.log("%c" + ASCII_ART, styles.banner);
  console.log("%c👋 hey, you found the source.", styles.greeting);
  console.log("%c   i see you know where to look.", styles.nod);
  console.log("%c", "");
  console.log(`%c   stack:   ${stackValues.join(" · ")}`, styles.details);
  console.log("%c   github:  github.com/davis-ian", styles.details);
  console.log(`%c   email:   ${getEmail()}`, styles.details);
  console.log("%c", "");
  console.log("%c   > ian.hire()  // returns: true", styles.hire);
}

export {};
