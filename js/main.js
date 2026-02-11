// ========================================
// Portfolio – System/Terminal Theme
// ========================================

// Global state
let commandPalette = null;

// ========================================
// Commands Registry
// ========================================
const COMMANDS = [
  { id: 'hero', label: 'Open: README.md', action: () => scrollToSection('hero'), category: 'Navigation', key: '1' },
  { id: 'featured', label: 'Open: featured.js', action: () => scrollToSection('featured'), category: 'Navigation', key: '2' },
  { id: 'work', label: 'Open: projects/', action: () => scrollToSection('work'), category: 'Navigation', key: '3' },
  { id: 'about', label: 'Open: about.md', action: () => scrollToSection('about'), category: 'Navigation', key: '4' },
  { id: 'experience', label: 'Open: experience.json', action: () => scrollToSection('experience'), category: 'Navigation', key: '5' },
  { id: 'forma', label: 'Go to: Forma Project', action: () => window.location.href = 'projects/forma.html', category: 'Projects' },
  { id: 'upnext', label: 'Go to: UpNext Project', action: () => window.location.href = 'projects/upnext.html', category: 'Projects' },
  { id: 'callsign', label: 'Go to: Callsign Project', action: () => window.location.href = 'projects/callsign.html', category: 'Projects' },
  { id: 'minigames', label: 'Go to: Minigames Project', action: () => window.location.href = 'projects/minigames.html', category: 'Projects' },
  { id: 'github', label: 'Open: GitHub Profile', action: () => window.open('https://github.com/davis-ian', '_blank'), category: 'External' },
  { id: 'linkedin', label: 'Open: LinkedIn Profile', action: () => window.open('https://linkedin.com/in/iandavisdev', '_blank'), category: 'External' },
  { id: 'email', label: 'Copy: Email Address', action: copyEmail, category: 'Actions' },
  { id: 'resume', label: 'Download: Resume', action: downloadResume, category: 'Actions', key: 'R' },
  { id: 'palette', label: 'Toggle: Command Palette', action: () => { if (commandPalette) commandPalette.toggle(); }, category: 'Actions', key: 'Cmd+K' },
  { id: 'help', label: 'Show: Keyboard Shortcuts', action: showKeyboardHelp, category: 'Actions', key: '?' },
];

// ========================================
// Command Palette Class
// ========================================
class CommandPalette {
  constructor() {
    this.overlay = document.getElementById('command-palette');
    this.input = document.getElementById('command-input');
    this.list = document.getElementById('command-list');
    this.selectedIndex = -1;
    this.filteredCommands = [];
    this.isOpen = false;
    
    if (this.overlay && this.input && this.list) {
      this.init();
    }
  }

  init() {
    // Input filtering
    this.input.addEventListener('input', () => {
      this.filter(this.input.value);
    });

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Keyboard navigation
    this.overlay.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.selectPrevious();
          break;
        case 'Enter':
          e.preventDefault();
          this.executeSelected();
          break;
        case 'Escape':
          e.preventDefault();
          this.close();
          break;
      }
    });

    // Initial render
    this.filter('');
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');
    this.input.value = '';
    this.input.focus();
    this.filter('');
    this.selectedIndex = 0;
    this.updateSelection();
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
    if (this.input) this.input.blur();
  }

  filter(query) {
    const lowerQuery = query.toLowerCase();
    this.filteredCommands = COMMANDS.filter(cmd => 
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    );
    this.render();
    this.selectedIndex = 0;
    this.updateSelection();
  }

  render() {
    if (this.filteredCommands.length === 0) {
      this.list.innerHTML = '<div class="command-empty">No commands found</div>';
      return;
    }

    // Group by category
    const grouped = this.filteredCommands.reduce((acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    }, {});

    this.list.innerHTML = Object.entries(grouped).map(([category, commands]) => `
      <div style="padding: 0.5rem 1rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
        ${category}
      </div>
      ${commands.map((cmd) => `
        <button class="command-item" data-index="${this.filteredCommands.indexOf(cmd)}" onclick="window.executeCommandByIndex(${this.filteredCommands.indexOf(cmd)})">
          <span>${cmd.label}</span>
          ${cmd.key ? `<span class="command-key">${cmd.key}</span>` : ''}
        </button>
      `).join('')}
    `).join('');
  }

  selectNext() {
    this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
    this.updateSelection();
  }

  selectPrevious() {
    this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    this.updateSelection();
  }

  updateSelection() {
    const items = this.list.querySelectorAll('.command-item');
    items.forEach((item) => {
      const cmdIndex = parseInt(item.dataset.index);
      if (cmdIndex === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  executeSelected() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredCommands.length) {
      const cmd = this.filteredCommands[this.selectedIndex];
      this.close();
      cmd.action();
    }
  }
}

// Global function for onclick handlers
window.executeCommandByIndex = function(index) {
  if (commandPalette && index >= 0 && index < commandPalette.filteredCommands.length) {
    const cmd = commandPalette.filteredCommands[index];
    commandPalette.close();
    cmd.action();
  }
};

// ========================================
// File Tree
// ========================================
function toggleFolder(element) {
  const folder = element.parentElement;
  if (folder) {
    folder.classList.toggle('open');
  }
}

// ========================================
// Mobile Menu
// ========================================
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  
  if (btn && sidebar) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking a link (mobile)
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
        }
      });
    });
  }
}

// ========================================
// Status Bar
// ========================================
function updateStatusBar() {
  const currentFileEl = document.getElementById('current-file');
  const statusFileEl = document.getElementById('status-file');
  const statusPositionEl = document.getElementById('status-position');
  
  if (!currentFileEl || !statusFileEl) return;
  
  // Update based on scroll position
  const sections = ['hero', 'featured', 'work', 'about', 'experience'];
  const fileNames = {
    'hero': 'README.md',
    'featured': 'featured.js',
    'work': 'projects/',
    'about': 'about.md',
    'experience': 'experience.json'
  };
  
  let currentSection = 'hero';
  let minDistance = Infinity;
  
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const distance = Math.abs(rect.top);
      if (distance < minDistance && rect.top < 200) {
        minDistance = distance;
        currentSection = id;
      }
    }
  });
  
  const fileName = fileNames[currentSection] || 'README.md';
  if (currentFileEl) currentFileEl.textContent = fileName;
  if (statusFileEl) statusFileEl.textContent = fileName;
  
  // Update line/column (simulated) - vim style "line:col"
  if (statusPositionEl) {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const line = Math.floor(scrollPercent * 100) + 1;
    statusPositionEl.textContent = `${line}:1`;
  }
}

// ========================================
// Navigation & Scrolling
// ========================================
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  }
}

function initNavigation() {
  // Update active file in sidebar
  const files = document.querySelectorAll('.file');
  const sections = ['hero', 'featured', 'work', 'about', 'experience'];
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          files.forEach(file => {
            if (file.dataset.section === id) {
              file.classList.add('active');
            } else {
              file.classList.remove('active');
            }
          });
          updateStatusBar();
        }
      });
    },
    { threshold: 0.3 }
  );
  
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
  
  // Smooth scroll on file click
  files.forEach(file => {
    file.addEventListener('click', (e) => {
      const section = file.dataset.section;
      if (section) {
        e.preventDefault();
        scrollToSection(section);
      }
    });
  });
}

// ========================================
// Actions
// ========================================
function copyEmail() {
  const email = 'hello.iandavis@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    showNotification('Email copied to clipboard!');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = email;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('Email copied to clipboard!');
  });
}

function downloadResume() {
  window.open('iandavis_resume2026.pdf', '_blank');
}

function showNotification(message) {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent-peach, #ffc799);
    color: #000;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 600;
    z-index: 10000;
    font-family: monospace;
    font-size: 0.875rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transition = 'opacity 0.3s';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// ========================================
// Email Injection
// ========================================
function initEmail() {
  const emailLink = document.getElementById('email-link');
  if (emailLink) {
    const user = 'hello.iandavis';
    const domain = 'gmail.com';
    const email = `${user}@${domain}`;
    emailLink.href = `mailto:${email}`;
    emailLink.textContent = email;
  }
}

// ========================================
// Resume Button
// ========================================
function initResumeButton() {
  const btn = document.getElementById('resume-btn');
  if (btn) {
    btn.addEventListener('click', downloadResume);
  }
}

// ========================================
// Keyboard Help Overlay
// ========================================
function showKeyboardHelp() {
  // Remove existing help if open
  const existing = document.getElementById('keyboard-help');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.className = 'command-palette-overlay';
  overlay.id = 'keyboard-help';
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div class="command-palette" style="max-width: 500px;">
      <div style="padding: 1rem; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700;">-- KEYBOARD SHORTCUTS --</span>
        <button id="close-help" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.25rem; padding: 0.25rem;">x</button>
      </div>
      <div style="padding: 1rem; font-family: var(--font-mono);">
        <div style="margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; color: var(--accent-peach); text-transform: uppercase; margin-bottom: 0.5rem;">:: Navigation</div>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1.5rem; line-height: 1.8;">
            <span style="color: var(--text-muted);">1-5</span><span>Jump to section</span>
            <span style="color: var(--text-muted);">^K</span><span>Command palette (:)</span>
            <span style="color: var(--text-muted);">?</span><span>Show help</span>
          </div>
        </div>
        <div style="margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; color: var(--accent-peach); text-transform: uppercase; margin-bottom: 0.5rem;">:: Actions</div>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1.5rem; line-height: 1.8;">
            <span style="color: var(--text-muted);">R</span><span>Download resume</span>
            <span style="color: var(--text-muted);">Esc</span><span>Close/Quit</span>
          </div>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
          :help for more info
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Close handlers
  const closeBtn = document.getElementById('close-help');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => overlay.remove());
  }
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

// ========================================
// Keyboard Shortcuts - Main Handler
// ========================================
function initKeyboardShortcuts() {
  document.addEventListener('keydown', function handleKeydown(e) {
    const key = e.key;
    const isMod = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;
    
    // Check if we're in an input
    const isInput = e.target.tagName === 'INPUT' || 
                    e.target.tagName === 'TEXTAREA' || 
                    e.target.isContentEditable;
    
    // Help overlay - ? key
    if (key === '?' && !isMod) {
      e.preventDefault();
      showKeyboardHelp();
      return;
    }
    
    // Escape - close any open overlays
    if (key === 'Escape') {
      const help = document.getElementById('keyboard-help');
      if (help) {
        e.preventDefault();
        help.remove();
        return;
      }
      if (commandPalette && commandPalette.isOpen) {
        e.preventDefault();
        commandPalette.close();
        return;
      }
      return;
    }
    
    // Command palette - Cmd+K
    if (isMod && key.toLowerCase() === 'k') {
      e.preventDefault();
      e.stopPropagation();
      if (commandPalette) commandPalette.toggle();
      return;
    }
    
    // If in an input, don't process other shortcuts
    if (isInput) return;
    
    // Section navigation - number keys
    if (!isMod && !isShift && /^[1-5]$/.test(key)) {
      e.preventDefault();
      const sections = ['hero', 'featured', 'work', 'about', 'experience'];
      const index = parseInt(key) - 1;
      if (sections[index]) {
        scrollToSection(sections[index]);
      }
      return;
    }
    
    // Resume - R key
    if (key.toLowerCase() === 'r' && !isMod) {
      e.preventDefault();
      downloadResume();
      return;
    }
    
  }, true); // Use capture phase
}

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Terminal theme loaded');
  
  // Initialize command palette
  commandPalette = new CommandPalette();
  
  // Initialize components
  initMobileMenu();
  initNavigation();
  initEmail();
  initResumeButton();
  initKeyboardShortcuts();
  
  // Update status bar on scroll
  window.addEventListener('scroll', updateStatusBar, { passive: true });
  updateStatusBar();
  
  // Initialize folder states
  document.querySelectorAll('.folder.open').forEach(folder => {
    const contents = folder.querySelector('.folder-contents');
    if (contents) {
      contents.style.maxHeight = '1000px';
    }
  });
});
