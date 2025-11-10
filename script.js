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
// MARK CLASSIFICATION TOOL (NEW VERSION)
// ============================================
const gradeScale = [
    { mark: 100, ug: "Exceptional", pgt: "Exceptional", singapore: "A+", gpa: "5.0" },
    { mark: 95, ug: "", pgt: "", singapore: "A+", gpa: "5.0" },
    { mark: 90, ug: "Outstanding", pgt: "Outstanding", singapore: "A+", gpa: "5.0" },
    { mark: 85, ug: "Very high 1st", pgt: "Very high distinction", singapore: "A+", gpa: "4.5" },
    { mark: 78, ug: "High 1st", pgt: "High distinction", singapore: "A", gpa: "4.5" },
    { mark: 75, ug: "Mid 1st", pgt: "Mid distinction", singapore: "A", gpa: "4.5" },
    { mark: 72, ug: "Low 1st", pgt: "Low distinction", singapore: "A", gpa: "4.0" },
    { mark: 68, ug: "High 2.1", pgt: "High merit", singapore: "A-", gpa: "4.0" },
    { mark: 65, ug: "Mid 2.1", pgt: "Mid merit", singapore: "A-", gpa: "4.0" },
    { mark: 62, ug: "Low 2.1", pgt: "Low merit", singapore: "B+", gpa: "3.5" },
    { mark: 58, ug: "High 2.2", pgt: "High pass", singapore: "B+", gpa: "3.5" },
    { mark: 55, ug: "Mid 2.2", pgt: "Mid pass", singapore: "B", gpa: "3.0" },
    { mark: 52, ug: "Low 2.2", pgt: "Low pass", singapore: "B", gpa: "3.0" },
    { mark: 48, ug: "High 3rd", pgt: "Marginal fail", singapore: "B-", gpa: "3.0" },
    { mark: 45, ug: "Mid 3rd", pgt: "", singapore: "B-", gpa: "2.5" },
    { mark: 42, ug: "Low 3rd", pgt: "", singapore: "C+", gpa: "2.5" },
    { mark: 38, ug: "Marginal fail", pgt: "Clear fail", singapore: "C", gpa: "2.0" },
    { mark: 35, ug: "", pgt: "", singapore: "C", gpa: "2.0" },
    { mark: 32, ug: "", pgt: "", singapore: "C-", gpa: "2.0" },
    { mark: 28, ug: "Clear fail", pgt: "", singapore: "D+", gpa: "1.5" },
    { mark: 25, ug: "", pgt: "", singapore: "D", gpa: "1.5" },
    { mark: 22, ug: "", pgt: "", singapore: "D", gpa: "1.5" },
    { mark: 18, ug: "", pgt: "", singapore: "D-", gpa: "1.0" },
    { mark: 15, ug: "", pgt: "", singapore: "F", gpa: "1.0" },
    { mark: 12, ug: "", pgt: "", singapore: "F", gpa: "0.5" },
    { mark: 8, ug: "Low fail", pgt: "Low fail", singapore: "F", gpa: "0.5" },
    { mark: 5, ug: "", pgt: "", singapore: "F", gpa: "0.0" },
    { mark: 2, ug: "", pgt: "", singapore: "F", gpa: "0.0" },
    { mark: 0, ug: "Non-engagement", pgt: "Non-engagement", singapore: "F", gpa: "0.0" }
];

// Global variables for mark classification tool
let currentIntervalValue = 3.0; // Pre-set to 3.0
let currentAdjustmentType = 'percentage';

// Mark classification tool functions
function calculateAdjustedMark(originalMark, adjustmentInfo) {
    let adjustedMark = originalMark;
    
    if (adjustmentInfo.value === 0) {
        return originalMark;
    }
    
    if (adjustmentInfo.type === 'percentage') {
        const adjustment = originalMark * (adjustmentInfo.value / 100);
        if (adjustmentInfo.direction === 'increase') {
            adjustedMark = originalMark + adjustment;
        } else {
            adjustedMark = originalMark - adjustment;
        }
    } else if (adjustmentInfo.type === 'absolute') {
        if (adjustmentInfo.direction === 'increase') {
            adjustedMark = originalMark + adjustmentInfo.value;
        } else {
            adjustedMark = originalMark - adjustmentInfo.value;
        }
    }
    
    // Ensure mark stays within 0-100 range
    adjustedMark = Math.max(0, Math.min(100, adjustedMark));
    
    return adjustedMark;
}

function snapToNearestBoundary(mark) {
    let nearestBoundary = gradeScale[0].mark;
    let minDifference = Math.abs(mark - nearestBoundary);
    
    for (let i = 1; i < gradeScale.length; i++) {
        const difference = Math.abs(mark - gradeScale[i].mark);
        if (difference < minDifference) {
            minDifference = difference;
            nearestBoundary = gradeScale[i].mark;
        }
    }
    
    return nearestBoundary;
}

function getClassification(mark, type) {
    for (let i = 0; i < gradeScale.length; i++) {
        if (mark >= gradeScale[i].mark) {
            return type === 'ug' ? gradeScale[i].ug : gradeScale[i].pgt;
        }
    }
    return "Unknown";
}

function getSingaporeGrade(mark) {
    for (let i = 0; i < gradeScale.length; i++) {
        if (mark >= gradeScale[i].mark) {
            return gradeScale[i].singapore;
        }
    }
    return "Unknown";
}

function getGPA(mark) {
    for (let i = 0; i < gradeScale.length; i++) {
        if (mark >= gradeScale[i].mark) {
            return gradeScale[i].gpa;
        }
    }
    return "Unknown";
}

function populateGradeScaleTable(adjustmentInfo = null) {
    const tbody = document.getElementById('grade-scale-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const hasAdjustment = adjustmentInfo && adjustmentInfo.value !== 0;
    
    // Iterate through gradeScale array to show only stepped marks
    gradeScale.forEach(grade => {
        const row = document.createElement('tr');
        
        // Get original values
        const originalMark = grade.mark;
        const originalUG = grade.ug || '-';
        const originalPGT = grade.pgt || '-';
        const originalSingapore = grade.singapore;
        const originalGPA = grade.gpa;
        
        // Calculate adjusted values if there's an adjustment
        let adjustedMark = originalMark;
        let adjustedGrade = grade;
        
        if (hasAdjustment) {
            adjustedMark = calculateAdjustedMark(originalMark, adjustmentInfo);
            adjustedMark = snapToNearestBoundary(adjustedMark);
            
            // Find grade data for adjusted mark
            for (let i = 0; i < gradeScale.length; i++) {
                if (adjustedMark >= gradeScale[i].mark) {
                    adjustedGrade = gradeScale[i];
                    break;
                }
            }
        }
        
        const adjustedUG = adjustedGrade.ug || '-';
        const adjustedPGT = adjustedGrade.pgt || '-';
        const adjustedSingapore = adjustedGrade.singapore;
        const adjustedGPA = adjustedGrade.gpa;
        
        // UK Marks cell
        const markCell = document.createElement('td');
        markCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100';
        
        if (hasAdjustment && Math.abs(adjustedMark - originalMark) > 0.01) {
            markCell.innerHTML = `${originalMark} <span class="text-blue-700 dark:text-blue-300">→ ${adjustedMark.toFixed(0)}</span>`;
            markCell.classList.add('bg-yellow-50', 'dark:bg-yellow-900');
        } else {
            markCell.textContent = originalMark;
        }
        row.appendChild(markCell);
        
        // UG Classification cell
        const ugCell = document.createElement('td');
        ugCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100';
        
        if (hasAdjustment && originalUG !== adjustedUG) {
            ugCell.innerHTML = `${originalUG} <span class="text-blue-700 dark:text-blue-300">→ ${adjustedUG}</span>`;
            ugCell.classList.add('bg-yellow-50', 'dark:bg-yellow-900');
        } else {
            ugCell.textContent = originalUG;
        }
        row.appendChild(ugCell);
        
        // PGT Classification cell
        const pgtCell = document.createElement('td');
        pgtCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100';
        
        if (hasAdjustment && originalPGT !== adjustedPGT) {
            pgtCell.innerHTML = `${originalPGT} <span class="text-blue-700 dark:text-blue-300">→ ${adjustedPGT}</span>`;
            pgtCell.classList.add('bg-yellow-50', 'dark:bg-yellow-900');
        } else {
            pgtCell.textContent = originalPGT;
        }
        row.appendChild(pgtCell);
        
        // Singapore Grade cell
        const singaporeCell = document.createElement('td');
        singaporeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100';
        
        if (hasAdjustment && originalSingapore !== adjustedSingapore) {
            singaporeCell.innerHTML = `${originalSingapore} <span class="text-blue-700 dark:text-blue-300">→ ${adjustedSingapore}</span>`;
            singaporeCell.classList.add('bg-yellow-50', 'dark:bg-yellow-900');
        } else {
            singaporeCell.textContent = originalSingapore;
        }
        row.appendChild(singaporeCell);
        
        // GPA cell
        const gpaCell = document.createElement('td');
        gpaCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100';
        
        if (hasAdjustment && originalGPA !== adjustedGPA) {
            gpaCell.innerHTML = `${originalGPA} <span class="text-blue-700 dark:text-blue-300">→ ${adjustedGPA}</span>`;
            gpaCell.classList.add('bg-yellow-50', 'dark:bg-yellow-900');
        } else {
            gpaCell.textContent = originalGPA;
        }
        row.appendChild(gpaCell);
        
        tbody.appendChild(row);
    });
}

function updateResults() {
    const currentIntervalDisplay = document.getElementById('current-interval');
    
    if (!currentIntervalDisplay) return;
    
    // Create adjustment info object using current interval value
    const adjustmentInfo = {
        type: currentAdjustmentType,
        value: Math.abs(currentIntervalValue),
        direction: currentIntervalValue >= 0 ? 'increase' : 'decrease',
        snapToBoundary: true // Always snap to boundaries
    };
    
    // Update interval display
    currentIntervalDisplay.textContent = currentIntervalValue.toFixed(1);
    
    // Update grade scale table with adjustments
    populateGradeScaleTable(adjustmentInfo);
}

// ============================================
// DEFINITION QUALITY SCORER
// ============================================
const UX_TERMS = ['usability', 'accessibility', 'wireframe', 'prototype', 'user interface', 'ui', 'ux', 'user experience', 'interaction design', 'information architecture', 'user research', 'user testing', 'heuristic', 'affordance', 'persona', 'user journey', 'user flow', 'sitemap', 'navigation', 'mockup', 'storyboard', 'user-centered', 'a/b testing', 'conversion', 'responsive', 'iteration', 'ideation', 'empathy map', 'pain point', 'stakeholder'];
const ABSTRACT_TERMS = ['concept', 'theory', 'methodology', 'approach', 'framework', 'principle', 'strategy', 'philosophy', 'paradigm', 'perspective', 'insight', 'innovation', 'creativity', 'abstraction', 'ideation', 'intuition', 'perception', 'cognition', 'evaluation', 'analysis', 'synthesis', 'process', 'quality', 'value', 'experience', 'engagement', 'interaction', 'satisfaction', 'emotional', 'psychological'];
const CONCRETE_TERMS = ['button', 'screen', 'device', 'click', 'tap', 'layout', 'menu', 'icon', 'link', 'page', 'scroll', 'swipe', 'keyboard', 'mouse', 'touch', 'display', 'image', 'video', 'audio', 'text', 'font', 'color', 'size', 'shape', 'position', 'desktop', 'mobile', 'tablet', 'app', 'website', 'interface', 'component', 'element'];
const PASSIVE_MARKERS = ['is used', 'are used', 'was used', 'were used', 'is created', 'are created', 'was created', 'were created', 'is defined', 'are defined', 'was defined', 'were defined', 'is designed', 'are designed', 'was designed', 'were designed', 'is developed', 'are developed', 'was developed', 'were developed', 'is implemented', 'are implemented', 'was implemented', 'were implemented', 'is built', 'are built', 'was built', 'were built', 'is made', 'are made', 'was made', 'were made'];

function calculateScore(text) {
    if (!text.trim()) return 0;
    
    const readability = calculateReadability(text);
    const clarity = analyzeClarity(text);
    const jargon = analyzeJargon(text);
    const structure = analyzeSentenceStructure(text);
    const balance = analyzeConcreteAbstract(text);
    const voice = analyzeActivePassive(text);
    
    return Math.round(readability * 0.15 + clarity * 0.25 + jargon * 0.15 + structure * 0.15 + balance * 0.15 + voice * 0.15);
}

function calculateReadability(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const words = text.split(/\s+/).filter(w => w.match(/[A-Za-z]/));
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    let syllables = 0;
    words.forEach(word => {
        syllables += countSyllables(word);
    });
    
    const gradeLevel = 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;
    return Math.max(0, Math.min(100, 100 - Math.abs(gradeLevel - 10) * 5));
}

function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let count = 0;
    let prevVowel = false;
    
    for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.includes(word[i]);
        if (isVowel && !prevVowel) count++;
        prevVowel = isVowel;
    }
    
    if (word.endsWith('e') && count > 1) count--;
    return Math.max(1, count);
}

function analyzeClarity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const words = text.match(/\b\w+\b/g) || [];
    
    let longSentences = 0;
    sentences.forEach(sentence => {
        const sentenceWords = sentence.match(/\b\w+\b/g) || [];
        if (sentenceWords.length > 25) longSentences++;
    });
    
    const longWords = words.filter(word => word.length > 8).length;
    const longSentencePercent = sentences.length > 0 ? (longSentences / sentences.length) * 100 : 0;
    const longWordPercent = words.length > 0 ? (longWords / words.length) * 100 : 0;
    
    let score = 100;
    if (longSentencePercent > 0) score -= longSentencePercent * 2;
    if (longWordPercent > 15) score -= (longWordPercent - 15) * 1.5;
    
    return Math.max(0, Math.min(100, score));
}

function analyzeJargon(text) {
    const lowerText = text.toLowerCase();
    const words = text.match(/\b\w+\b/g) || [];
    
    const jargonCount = UX_TERMS.filter(term => lowerText.includes(term)).length;
    const jargonPercent = words.length > 0 ? (jargonCount / words.length) * 100 : 0;
    
    let score = 0;
    if (jargonPercent <= 5) {
        score = jargonPercent * 10;
    } else if (jargonPercent <= 20) {
        score = 100 - Math.abs(jargonPercent - 15) * 3;
    } else {
        score = Math.max(0, 100 - (jargonPercent - 20) * 4);
    }
    
    return Math.max(0, Math.min(100, score));
}

function analyzeSentenceStructure(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length === 0) return 0;
    
    let totalComplexity = 0;
    sentences.forEach(sentence => {
        const conjunctions = (sentence.match(/\b(and|but|or|yet|so|for|nor|because|if|when|while|although|since)\b/gi) || []).length;
        const relativeClauses = (sentence.match(/\b(that|which|who|whom|whose)\b/gi) || []).length;
        const clauses = 1 + conjunctions + relativeClauses;
        const words = (sentence.match(/\b\w+\b/g) || []).length;
        totalComplexity += words / Math.max(1, clauses);
    });
    
    const avgComplexity = totalComplexity / sentences.length;
    
    let score = 0;
    if (avgComplexity < 8) {
        score = avgComplexity * 10;
    } else if (avgComplexity <= 15) {
        score = 100 - Math.abs(avgComplexity - 12) * 5;
    } else {
        score = Math.max(0, 100 - (avgComplexity - 15) * 8);
    }
    
    return Math.max(0, Math.min(100, score));
}

function analyzeConcreteAbstract(text) {
    const lowerText = text.toLowerCase();
    
    const concreteCount = CONCRETE_TERMS.filter(term => lowerText.includes(term)).length;
    const abstractCount = ABSTRACT_TERMS.filter(term => lowerText.includes(term)).length;
    
    if (concreteCount === 0 && abstractCount === 0) return 0;
    
    const ratio = abstractCount > 0 ? concreteCount / abstractCount : (concreteCount > 0 ? 3 : 1);
    
    let score = 0;
    if (ratio === 0) {
        score = 40;
    } else if (ratio < 0.5) {
        score = 40 + ratio * 60;
    } else if (ratio <= 2.5) {
        score = 100 - Math.abs(ratio - 1.5) * 20;
    } else {
        score = Math.max(40, 100 - (ratio - 2.5) * 15);
    }
    
    return Math.max(0, Math.min(100, score));
}

function analyzeActivePassive(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length === 0) return 0;
    
    let passiveCount = 0;
    sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        for (let marker of PASSIVE_MARKERS) {
            if (lowerSentence.includes(marker)) {
                passiveCount++;
                break;
            }
        }
    });
    
    const passivePercent = (passiveCount / sentences.length) * 100;
    
    let score = 0;
    if (passivePercent <= 20) {
        score = 100 - passivePercent * 1.5;
    } else if (passivePercent <= 50) {
        score = 70 - (passivePercent - 20) * 1.3;
    } else {
        score = Math.max(0, 30 - (passivePercent - 50));
    }
    
    return Math.max(0, Math.min(100, score));
}

function updateDefinition(textareaId, counterId, scoreId, progressId) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    const scoreElement = document.getElementById(scoreId);
    const progress = document.getElementById(progressId);
    
    if (!textarea || !counter || !scoreElement || !progress) return;
    
    const text = textarea.value;
    const length = text.length;
    const score = calculateScore(text);
    
    // Update character counter
    counter.textContent = `${length} / 155 characters`;
    if (length > 155) {
        counter.classList.add('warning');
    } else {
        counter.classList.remove('warning');
    }
    
    // Update score
    scoreElement.textContent = score;
    
    // Update progress bar
    progress.style.width = score + '%';
    
    /// after: scoreElement.textContent = score;

// color + classes
progress.classList.remove('low','medium','good');
scoreElement.classList.remove('low','medium','good');

if (score < 50) {
  progress.classList.add('low');
  scoreElement.classList.add('low');
} else if (score < 70) {
  progress.classList.add('medium');
  scoreElement.classList.add('medium');
} else {
  progress.classList.add('good');
  scoreElement.classList.add('good');
}
}

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
    document.documentElement.style.setProperty('--font-size', fontSize);
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
    
    // Initialize mark classification tool if on slide 2.1
    if (document.querySelector('[data-section="2"][data-slide="0"]')) {
        populateGradeScaleTable();
        
        const toggle = document.getElementById('adjustment-toggle');
        const toggleOptions = toggle.querySelectorAll('.toggle-option');
        
        toggleOptions.forEach(option => {
            option.addEventListener('click', function() {
                toggleOptions.forEach(opt => {
                    opt.classList.remove('active');
                    opt.setAttribute('aria-checked', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-checked', 'true');
                
                currentAdjustmentType = this.getAttribute('data-value');
                
                if (currentAdjustmentType === 'absolute') {
                    toggle.classList.add('active');
                } else {
                    toggle.classList.remove('active');
                }
                
                updateResults();
            });
        });
        
        const increaseButton = document.getElementById('increase-interval');
        const decreaseButton = document.getElementById('decrease-interval');
        
        if (increaseButton) {
            increaseButton.addEventListener('click', function() {
                currentIntervalValue += 0.5;
                updateResults();
            });
        }
        
        if (decreaseButton) {
            decreaseButton.addEventListener('click', function() {
                currentIntervalValue -= 0.5;
                updateResults();
            });
        }
        
        updateResults();
    }
    
    // Initialize definition scorer if on slide 3.3
    if (document.querySelector('[data-section="3"][data-slide="3"]')) {
        if (document.getElementById('definition1') && document.getElementById('definition2')) {
            document.getElementById('definition1').addEventListener('input', () => {
                updateDefinition('definition1', 'counter1', 'score1', 'progress1');
            });
            
            document.getElementById('definition2').addEventListener('input', () => {
                updateDefinition('definition2', 'counter2', 'score2', 'progress2');
            });
            
            updateDefinition('definition1', 'counter1', 'score1', 'progress1');
            updateDefinition('definition2', 'counter2', 'score2', 'progress2');
        }
    }
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