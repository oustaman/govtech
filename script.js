// ============================================
// PORTFOLIO WEBSITE FUNCTIONALITY
// ============================================

// ============================================
// STATE MANAGEMENT
// ============================================
let currentSection = 0;
let currentSlide = 0;
let isDarkMode = false;
let fontSize = 1;

// Get all slides grouped by section
const slides = document.querySelectorAll('.slide');
const sections = [];
slides.forEach(slide => {
    const sectionIndex = parseInt(slide.dataset.section);
    const slideIndex = parseInt(slide.dataset.slide);
    if (!sections[sectionIndex]) {
        sections[sectionIndex] = [];
    }
    sections[sectionIndex].push(slide);
});

// Section metadata
const sectionNames = ['Intro', 'Architecture', 'Delivery', 'Knowledge', 'Style', 'GovTech', 'Contact'];

// ============================================
// NAVIGATION & MODALS
// ============================================
const navLinks = document.querySelectorAll('.nav-link');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideCounter = document.getElementById('slideCounter');
const miniProgress = document.getElementById('miniProgress');
const sectionProgress = document.getElementById('sectionProgress');
const darkModeToggle = document.getElementById('darkModeToggle');
const modeIcon = document.getElementById('modeIcon');
const increaseFont = document.getElementById('increaseFont');
const decreaseFont = document.getElementById('decreaseFont');

// Modal elements
const tocModal = document.getElementById('tocModal');
const searchModal = document.getElementById('searchModal');
const kbdModal = document.getElementById('kbdModal');
const tocBtn = document.getElementById('tocBtn');
const searchBtn = document.getElementById('searchBtn');
const kbdInfo = document.getElementById('kbdInfo');
const closeToc = document.getElementById('closeToc');
const closeSearch = document.getElementById('closeSearch');
const closeKbd = document.getElementById('closeKbd');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const tocContent = document.getElementById('tocContent');

// NEW: Grab all section links (once)
const sectionLinks = Array.from(document.querySelectorAll('.nav-link'));

// Show slide function
function showSlide(sectionIndex, slideIndex) {
    // Hide all slides
    slides.forEach(s => s.classList.remove('active'));
    
    // Validate indices
    if (!sections[sectionIndex] || !sections[sectionIndex][slideIndex]) {
        return;
    }
    
    // Update state
    currentSection = sectionIndex;
    currentSlide = slideIndex;
    
    // Show current slide
    const currentSlideEl = document.querySelector(`[data-section="${sectionIndex}"][data-slide="${slideIndex}"]`);
    if (currentSlideEl) {
        currentSlideEl.classList.add('active');
    }
    
    updateDisplay();
    updateNav();
}

// Update display elements
function updateDisplay() {
  if (!slideCounter || !miniProgress || !sectionProgress) return;

  // Total deck slides (global)
  const totalSlidesAll = sections.reduce((acc, sec) => acc + sec.length, 0);

  // How many slides up to (and including) the current one
  let slidesSoFar = 0;
  for (let i = 0; i < currentSection; i++) slidesSoFar += sections[i].length;
  slidesSoFar += currentSlide + 1; // 1-based position in deck

  const globalIndex = slidesSoFar - 1; // 0-based index in deck

  // ---- Counter: show global position ----
  slideCounter.textContent = `${slidesSoFar} / ${totalSlidesAll}`;

  // ---- Mini progress dots: build for full deck ----
  miniProgress.innerHTML = '';
  for (let i = 0; i < totalSlidesAll; i++) {
    const dot = document.createElement('div');
    dot.className = 'mini-progress-dot' + (i === globalIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1} of ${totalSlidesAll}`);
    dot.setAttribute('role', 'button');
    dot.tabIndex = 0;

    // Optional: make dots clickable to jump anywhere in deck
    dot.addEventListener('click', () => {
      const { sectionIndex, slideIndex } = getSectionSlideFromGlobalIndex(i);
      showSlide(sectionIndex, slideIndex);
    });

    // Optional: keyboard access on dots
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const { sectionIndex, slideIndex } = getSectionSlideFromGlobalIndex(i);
        showSlide(sectionIndex, slideIndex);
      }
    });

    miniProgress.appendChild(dot);
  }

  // ---- Global progress bar width (unchanged logic, now global) ----
  const progressPercent = (slidesSoFar / totalSlidesAll) * 100;
  sectionProgress.style.width = progressPercent + '%';

  // ---- Prev/Next disable logic (unchanged) ----
  const isFirstSlide = currentSection === 0 && currentSlide === 0;
  const isLastSlide =
    currentSection === sections.length - 1 &&
    currentSlide === sections[currentSection].length - 1;

  if (prevBtn) prevBtn.disabled = isFirstSlide;
  if (nextBtn) nextBtn.disabled = isLastSlide;
  
  // NEW: Call updateSectionHighlight whenever the slide changes
  updateSectionHighlight();
}

// NEW: Helper function to keep the highlight in sync with the current section
function updateSectionHighlight() {
    sectionLinks.forEach(link => {
        const isActive = Number(link.dataset.section) === currentSection;
        link.classList.toggle('active', isActive);
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
}

// Navigation functions
function nextSlide() {
    if (currentSlide < sections[currentSection].length - 1) {
        showSlide(currentSection, currentSlide + 1);
    } else if (currentSection < sections.length - 1) {
        showSlide(currentSection + 1, 0);
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        showSlide(currentSection, currentSlide - 1);
    } else if (currentSection > 0) {
        showSlide(currentSection - 1, sections[currentSection - 1].length - 1);
    }
}

function goToSection(sectionIndex) {
    if (sections[sectionIndex]) {
        showSlide(sectionIndex, 0);
    }
}

// Generate Table of Contents
function generateToC() {
    if (!tocContent) return;
    
    tocContent.innerHTML = '';
    sections.forEach((section, sectionIndex) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'toc-section';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'toc-section-title';
        titleDiv.textContent = sectionNames[sectionIndex];
        sectionDiv.appendChild(titleDiv);
        
        section.forEach((slide, slideIndex) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'toc-item';
            itemDiv.innerHTML = `
                <span class="toc-number">${sectionIndex + 1}.${slideIndex + 1}</span>
                <span>${getSlideTitle(slide)}</span>
            `;
            itemDiv.onclick = () => {
                showSlide(sectionIndex, slideIndex);
                if (tocModal) tocModal.classList.remove('active');
            };
            sectionDiv.appendChild(itemDiv);
        });
        
        tocContent.appendChild(sectionDiv);
    });
}

// Get slide title
function getSlideTitle(slide) {
    const h1 = slide.querySelector('h1');
    const h2 = slide.querySelector('h2');
    if (h1) return h1.textContent;
    if (h2) return h2.textContent;
    return 'Untitled';
}

// Search functionality
function performSearch(query) {
    if (!searchResults) return;
    
    if (!query.trim()) {
        searchResults.innerHTML = '<p style="color: var(--text-tertiary);">Enter a search term...</p>';
        return;
    }
    
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    slides.forEach((slide, index) => {
        const content = slide.textContent.toLowerCase();
        if (content.includes(lowerQuery)) {
            const sectionIndex = parseInt(slide.dataset.section);
            const slideIndex = parseInt(slide.dataset.slide);
            const title = getSlideTitle(slide);
            
            // Extract snippet
            const contentIndex = content.indexOf(lowerQuery);
            const start = Math.max(0, contentIndex - 60);
            const end = Math.min(content.length, contentIndex + 100);
            let snippet = slide.textContent.substring(start, end);
            if (start > 0) snippet = '...' + snippet;
            if (end < content.length) snippet = snippet + '...';
            
            // Highlight query in snippet
            const regex = new RegExp(`(${query})`, 'gi');
            snippet = snippet.replace(regex, '<span class="search-highlight">$1</span>');
            
            results.push({ sectionIndex, slideIndex, title, snippet });
        }
    });
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="color: var(--text-tertiary);">No results found</p>';
        return;
    }
    
    searchResults.innerHTML = '';
    results.forEach(result => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'search-result';
        resultDiv.innerHTML = `
            <div class="search-result-title">${sectionNames[result.sectionIndex]} ${result.sectionIndex + 1}.${result.slideIndex + 1}: ${result.title}</div>
            <div class="search-result-snippet">${result.snippet}</div>
        `;
        resultDiv.onclick = () => {
            showSlide(result.sectionIndex, result.slideIndex);
            if (searchModal) searchModal.classList.remove('active');
        };
        searchResults.appendChild(resultDiv);
    });
}

// Dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    if (modeIcon) {
        modeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    }
}

// Font size
function updateFontSize() {
    document.documentElement.style.fontSize = fontSize + 'rem';
}

function increaseFontSize() {
    if (fontSize < 1.5) {
        fontSize += 0.1;
        updateFontSize();
    }
}

function decreaseFontSize() {
    if (fontSize > 0.7) {
        fontSize -= 0.1;
        updateFontSize();
    }
}

// ============================================
// VISA DROPDOWN FUNCTIONALITY
// ============================================
function toggleVisaDropdown() {
    const dropdown = document.getElementById('visa-options-menu');
    const button = document.getElementById('visa-options-button');
    
    if (dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
    } else {
        dropdown.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
    }
}

// ============================================
// INITIALIZATION
// ============================================

function getSectionSlideFromGlobalIndex(globalIndex) {
  let acc = 0;
  for (let s = 0; s < sections.length; s++) {
    const len = sections[s].length;
    if (globalIndex < acc + len) {
      return { sectionIndex: s, slideIndex: globalIndex - acc };
    }
    acc += len;
  }
  // Fallback to last slide if out of range
  return { sectionIndex: sections.length - 1, slideIndex: sections[sections.length - 1].length - 1 };
}

function initPortfolio() {
    // Only initialize if we're on portfolio page
    if (!document.querySelector('.slide')) return;
    
    updateDisplay();
    generateToC();
    updateNav();
    
    // NEW: Make clicks jump to that section
    sectionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const s = Number(link.dataset.section) || 0;
            showSlide(s, 0);               // your existing function
        });
    });
    
    // NEW: Accessible focus + keyboard
    sectionLinks.forEach(link => link.setAttribute('role', 'link'));
    sectionLinks.forEach(link => link.tabIndex = 0);
    sectionLinks.forEach(link => {
        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const s = Number(link.dataset.section) || 0;
                showSlide(s, 0);
            }
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================
if (prevBtn) prevBtn.addEventListener('click', prevSlide);
if (nextBtn) nextBtn.addEventListener('click', nextSlide);

navLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        goToSection(index);
    });
});

if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
if (increaseFont) increaseFont.addEventListener('click', increaseFontSize);
if (decreaseFont) decreaseFont.addEventListener('click', decreaseFontSize);

// Modal controls
if (tocBtn) tocBtn.addEventListener('click', () => {
    if (tocModal) {
        tocModal.classList.add('active');
        generateToC();
    }
});

if (searchBtn) searchBtn.addEventListener('click', () => {
    if (searchModal) {
        searchModal.classList.add('active');
        if (searchInput) searchInput.focus();
    }
});

if (kbdInfo) kbdInfo.addEventListener('click', () => {
    if (kbdModal) kbdModal.classList.add('active');
});

if (closeToc) closeToc.addEventListener('click', () => {
    if (tocModal) tocModal.classList.remove('active');
});

if (closeSearch) closeSearch.addEventListener('click', () => {
    if (searchModal) searchModal.classList.remove('active');
});

if (closeKbd) closeKbd.addEventListener('click', () => {
    if (kbdModal) kbdModal.classList.remove('active');
});

// Close modals on background click
[tocModal, searchModal, kbdModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
});

// Search input
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });
}

// Visa dropdown
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('visa-options-menu');
    const button = document.getElementById('visa-options-button');
    
    if (!button.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Don't trigger if typing in input or textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
        case 'ArrowRight':
            e.preventDefault();
            nextSlide();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            prevSlide();
            break;
        case '1': goToSection(0); break;
        case '2': goToSection(1); break;
        case '3': goToSection(2); break;
        case '4': goToSection(3); break;
        case '5': goToSection(4); break;
        case '6': goToSection(5); break;
        case '7': goToSection(6); break;
        case 't':
        case 'T':
            e.preventDefault();
            if (tocModal) tocModal.classList.add('active');
            break;
        case 's':
        case 'S':
            e.preventDefault();
            if (searchModal) {
                searchModal.classList.add('active');
                if (searchInput) searchInput.focus();
            }
            break;
        case '?':
            e.preventDefault();
            if (kbdModal) kbdModal.classList.add('active');
            break;
        case 'd':
        case 'D':
            e.preventDefault();
            toggleDarkMode();
            break;
        case '+':
        case '=':
            e.preventDefault();
            increaseFontSize();
            break;
        case '-':
        case '_':
            e.preventDefault();
            decreaseFontSize();
            break;
        case 'Escape':
            if (tocModal) tocModal.classList.remove('active');
            if (searchModal) searchModal.classList.remove('active');
            if (kbdModal) kbdModal.classList.remove('active');
            break;
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initPortfolio);