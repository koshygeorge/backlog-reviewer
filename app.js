// Backlog Quality Reviewer Application Controller

import { epics, okrs, exampleStories } from './data.js';
import { evaluateStory } from './evaluator.js';

// Global Application State
let state = {
  currentStory: {
    id: 'US-NEW',
    title: 'New User Story',
    epicId: 'E-01',
    featureId: 'F-01.1',
    priority: 'High',
    storyPoints: 5,
    asA: '',
    iWantTo: '',
    soThat: '',
    acceptanceCriteria: '',
    nfrs: ''
  },
  importedStories: [],
  selectedImportedIndex: -1,
  theme: 'dark'
};

// Initialize PDF.js
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
}

document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  setupEventListeners();
  loadExample('US-01.1.1'); // Load default high quality example
});

// Initialize form selectors with reference data
function initDOM() {
  const exampleSelect = document.getElementById('example-select');

  // Populate Example stories dropdown
  exampleSelect.innerHTML = '<option value="">-- Load Workbook Example --</option>';
  exampleStories.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.id} - ${s.title}`;
    exampleSelect.appendChild(opt);
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Real-time evaluation on manual inputs
  const inputs = [
    'story-title', 'story-epic', 'story-feature', 'story-okr', 'story-kpi', 
    'priority-select', 'story-points', 'story-asa', 'story-iwantto', 
    'story-sothat', 'story-ac'
  ];

  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        readFormIntoState();
        runEvaluation();
      });
    }
  });

  // Examples Selector
  document.getElementById('example-select').addEventListener('change', (e) => {
    if (e.target.value) {
      loadExample(e.target.value);
    }
  });

  // File Upload Handlers
  const fileInput = document.getElementById('file-input');
  const uploadZone = document.getElementById('upload-zone');

  uploadZone.addEventListener('click', () => fileInput.click());
  
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-active');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-active');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-active');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Export Report Button
  document.getElementById('export-btn').addEventListener('click', exportReport);

  // Theme Toggle Button
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

// Sync Form Inputs to State
function readFormIntoState() {
  state.currentStory = {
    id: state.currentStory.id || 'US-CUSTOM',
    title: document.getElementById('story-title').value,
    epicId: document.getElementById('story-epic').value,
    featureId: document.getElementById('story-feature').value,
    okr: document.getElementById('story-okr').value,
    kpi: document.getElementById('story-kpi').value,
    priority: document.getElementById('priority-select').value,
    storyPoints: Number(document.getElementById('story-points').value) || 0,
    asA: document.getElementById('story-asa').value,
    iWantTo: document.getElementById('story-iwantto').value,
    soThat: document.getElementById('story-sothat').value,
    acceptanceCriteria: document.getElementById('story-ac').value,
    nfrs: state.currentStory.nfrs || ''
  };
}

// Sync State back to Form Inputs
function writeStateToForm() {
  document.getElementById('story-title').value = state.currentStory.title || '';
  document.getElementById('story-epic').value = state.currentStory.epicId || '';
  document.getElementById('story-feature').value = state.currentStory.featureId || '';
  document.getElementById('story-okr').value = state.currentStory.okr || '';
  document.getElementById('story-kpi').value = state.currentStory.kpi || '';
  document.getElementById('priority-select').value = state.currentStory.priority || 'Medium';
  document.getElementById('story-points').value = state.currentStory.storyPoints || 0;
  document.getElementById('story-asa').value = state.currentStory.asA || '';
  document.getElementById('story-iwantto').value = state.currentStory.iWantTo || '';
  document.getElementById('story-sothat').value = state.currentStory.soThat || '';
  document.getElementById('story-ac').value = state.currentStory.acceptanceCriteria || '';
}

// Load a specific example
function loadExample(storyId) {
  const story = exampleStories.find(s => s.id === storyId);
  if (story) {
    state.currentStory = { ...story };
    writeStateToForm();
    runEvaluation();
  }
}

// Run Evaluation & Render Output
function runEvaluation() {
  const report = evaluateStory(state.currentStory);
  renderReport(report);
}

// Render the evaluated Quality Report
function renderReport(report) {
  // 1. Quality Score Circular Gauge
  const scoreVal = report.score;
  const scoreTextEl = document.getElementById('score-value');
  const gaugeBar = document.getElementById('gauge-bar');
  
  scoreTextEl.textContent = `${scoreVal}%`;
  
  // SVG Circumference is 2 * PI * r = 2 * 3.14159 * 38 = ~238.76
  const circumference = 238.76;
  const strokeDashoffset = circumference - (scoreVal / 100) * circumference;
  gaugeBar.style.strokeDashoffset = strokeDashoffset;

  // Gauge coloring
  let gaugeColor = 'var(--danger)';
  let gradeText = 'Critical Action Required';
  let gradeClass = 'fail';
  
  if (scoreVal >= 85) {
    gaugeColor = 'var(--success)';
    gradeText = 'Sprint Ready (High Quality)';
    gradeClass = 'pass';
  } else if (scoreVal >= 60) {
    gaugeColor = 'var(--warning)';
    gradeText = 'Needs Improvement';
    gradeClass = 'warning';
  }
  
  gaugeBar.style.stroke = gaugeColor;
  document.getElementById('grade-badge').textContent = gradeText;
  document.getElementById('grade-badge').className = `trace-badge ${gradeClass}`;

  // 2. Subscore Values
  document.getElementById('score-template').textContent = `${report.sections.template.score}/${report.sections.template.max}`;
  document.getElementById('score-gherkin').textContent = `${report.sections.gherkin.score}/${report.sections.gherkin.max}`;
  document.getElementById('score-traceability').textContent = `${report.sections.traceability.score}/${report.sections.traceability.max}`;
  document.getElementById('score-nfr').textContent = `${report.sections.nfr.score}/${report.sections.nfr.max}`;

  // 3. Render Checklist Items
  const checklist = document.getElementById('evaluation-checklist');
  checklist.innerHTML = '';
  
  const allItems = [
    ...report.sections.template.items,
    ...report.sections.gherkin.items,
    ...report.sections.traceability.items,
    ...report.sections.nfr.items
  ];

  allItems.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = `check-item ${item.status}`;
    
    let iconSvg = '';
    if (item.status === 'pass') {
      iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`;
    } else if (item.status === 'warning') {
      iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`;
    }

    itemEl.innerHTML = `
      <div class="check-icon">${iconSvg}</div>
      <div class="check-text">
        <h4>${item.text}</h4>
      </div>
    `;
    checklist.appendChild(itemEl);
  });

  // 4. Traceability Pathway Visual
  const traceBox = document.getElementById('traceability-pathway');
  traceBox.innerHTML = '';
  
  const epicId = (state.currentStory.epicId || '').trim();
  const featureId = (state.currentStory.featureId || '').trim();
  const customOkr = (state.currentStory.okr || '').trim();
  const customKpi = (state.currentStory.kpi || '').trim();
  
  const refEpic = epics[epicId];

  if (epicId || featureId || customOkr || customKpi) {
    if (epicId) {
      const epicDiv = document.createElement('div');
      epicDiv.className = 'trace-step';
      const epicTitle = refEpic ? ` (${refEpic.title})` : '';
      epicDiv.innerHTML = `<span class="trace-badge">Epic</span><span class="trace-val">${epicId}${epicTitle}</span>`;
      traceBox.appendChild(epicDiv);
    }
    
    if (featureId) {
      const featDiv = document.createElement('div');
      featDiv.className = 'trace-step kpi';
      const refFeat = (refEpic && refEpic.features) ? refEpic.features[featureId] : '';
      const featTitle = refFeat ? ` (${refFeat})` : '';
      featDiv.innerHTML = `<span class="trace-badge">Feature</span><span class="trace-val">${featureId}${featTitle}</span>`;
      traceBox.appendChild(featDiv);
    }
    
    if (customOkr) {
      const okrDiv = document.createElement('div');
      okrDiv.className = 'trace-step okr';
      okrDiv.innerHTML = `<span class="trace-badge">OKR</span><span class="trace-val">${customOkr}</span>`;
      traceBox.appendChild(okrDiv);
    } else if (refEpic && refEpic.linkedOkrs) {
      refEpic.linkedOkrs.forEach(okrId => {
        const okrObj = okrs[okrId];
        if (okrObj) {
          const okrDiv = document.createElement('div');
          okrDiv.className = 'trace-step okr';
          okrDiv.innerHTML = `<span class="trace-badge">OKR</span><span class="trace-val">${okrObj.id}: ${okrObj.objective}</span>`;
          traceBox.appendChild(okrDiv);
        }
      });
    }
    
    if (customKpi) {
      const kpiDiv = document.createElement('div');
      kpiDiv.className = 'trace-step kpi';
      kpiDiv.innerHTML = `<span class="trace-badge">KPI</span><span class="trace-val">${customKpi}</span>`;
      traceBox.appendChild(kpiDiv);
    } else if (refEpic && refEpic.kpis) {
      refEpic.kpis.forEach(kpi => {
        const kpiDiv = document.createElement('div');
        kpiDiv.className = 'trace-step kpi';
        kpiDiv.innerHTML = `<span class="trace-badge">KPI Target</span><span class="trace-val"><strong>${kpi.name}</strong>: ${kpi.target} (Measure: ${kpi.measurement})</span>`;
        traceBox.appendChild(kpiDiv);
      });
    }
  } else {
    traceBox.innerHTML = '<div class="text-muted" style="font-size:12.5px;">No active Epic mapping to trace Strategic OKRs/KPIs.</div>';
  }

  // 5. NFR Badges
  updateNfrBadges(report.nfrCoverage);

  // 6. Actionable Improvements & Split Recommendations
  const recsContainer = document.getElementById('recs-container');
  if (report.recommendations.length > 0) {
    recsContainer.style.display = 'block';
    const recsList = document.getElementById('recs-list');
    recsList.innerHTML = report.recommendations.map(r => `<li>${r}</li>`).join('');
  } else {
    recsContainer.style.display = 'none';
  }

  // 7. Split Card suggestions
  const splitContainer = document.getElementById('split-container');
  if (report.splitSuggested) {
    splitContainer.style.display = 'block';
    
    // Fill reason
    document.getElementById('split-reason-text').textContent = report.splitReasons.join(' ');

    const substoriesBox = document.getElementById('split-substories-box');
    substoriesBox.innerHTML = '';
    
    report.suggestedSubStories.forEach((sub, idx) => {
      const subCard = document.createElement('div');
      subCard.className = 'substory-preview';
      subCard.innerHTML = `
        <div class="substory-header">
          <span>Substory ${idx+1} (${sub.id})</span>
          <span>Story Points: ${sub.storyPoints} SP</span>
        </div>
        <div class="substory-title">${sub.title}</div>
        <div class="substory-desc">
          <strong>As a</strong> ${sub.asA}, <strong>I want to</strong> ${sub.iWantTo}, <strong>So that</strong> ${sub.soThat}
        </div>
      `;
      substoriesBox.appendChild(subCard);
    });

    // Handle Split Apply Action
    const applySplitBtn = document.getElementById('apply-split-btn');
    applySplitBtn.onclick = () => applySplit(report.suggestedSubStories);
  } else {
    splitContainer.style.display = 'none';
  }
}

function updateNfrBadges(coverage) {
  const badges = {
    security: document.getElementById('badge-security'),
    performance: document.getElementById('badge-performance'),
    reliability: document.getElementById('badge-reliability'),
    usability: document.getElementById('badge-usability')
  };

  Object.keys(badges).forEach(key => {
    const badge = badges[key];
    if (coverage[key]) {
      badge.classList.add('covered');
    } else {
      badge.classList.remove('covered');
    }
  });
}

// Split the current user story into smaller ones
function applySplit(substories) {
  // Remove the current story if it is in the list
  if (state.selectedImportedIndex >= 0) {
    state.importedStories.splice(state.selectedImportedIndex, 1);
  }

  // Add the sub-stories
  substories.forEach(sub => {
    state.importedStories.push(sub);
  });

  renderImportedStoriesList();
  
  // Select the first new substory
  if (state.importedStories.length > 0) {
    selectImportedStory(state.importedStories.length - substories.length);
    alert(`Successfully split into ${substories.length} smaller, focused user stories!`);
  }
}

// File Parser: Handlers for CSV & PDF
function handleFile(file) {
  const reader = new FileReader();
  const fileExt = file.name.split('.').pop().toLowerCase();
  
  const uploadStatus = document.getElementById('upload-status');
  uploadStatus.innerHTML = `<span style="color:var(--accent-primary)">Processing "${file.name}"...</span>`;

  if (fileExt === 'csv') {
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSV(text);
        
        if (rows.length > 0) {
          state.importedStories = rows;
          renderImportedStoriesList();
          selectImportedStory(0);
          uploadStatus.innerHTML = `<span style="color:var(--success)">Loaded ${rows.length} stories from CSV successfully!</span>`;
        } else {
          uploadStatus.innerHTML = '<span style="color:var(--danger)">No valid stories found in CSV.</span>';
        }
      } catch (err) {
        uploadStatus.innerHTML = `<span style="color:var(--danger)">Error parsing CSV: ${err.message}</span>`;
      }
    };
    reader.readAsText(file);
  } else if (fileExt === 'pdf') {
    reader.onload = function() {
      const typedarray = new Uint8Array(this.result);
      
      window.pdfjsLib.getDocument(typedarray).promise.then(pdf => {
        let maxPages = pdf.numPages;
        let count = 0;
        let fullText = '';
        
        for (let i = 1; i <= maxPages; i++) {
          pdf.getPage(i).then(page => {
            page.getTextContent().then(textContent => {
              const textItems = textContent.items.map(item => item.str);
              fullText += textItems.join(' ') + '\n\n';
              count++;
              
              if (count === maxPages) {
                // Done loading all pages
                extractStoriesFromPdf(fullText);
              }
            });
          });
        }
      }).catch(err => {
        uploadStatus.innerHTML = `<span style="color:var(--danger)">PDF.js error: ${err.message}</span>`;
      });
    };
    reader.readAsArrayBuffer(file);
  } else {
    uploadStatus.innerHTML = '<span style="color:var(--danger)">Unsupported file type. Please upload a CSV or PDF.</span>';
  }
}

// Client-Side CSV Parser
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Match columns using comma split, ignoring commas inside quotes
  const parseRow = (rowText) => {
    const result = [];
    let insideQuote = false;
    let entries = [];
    let current = '';
    
    for (let i = 0; i < rowText.length; i++) {
      let char = rowText[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        entries.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    entries.push(current.trim());
    return entries;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[\s_]/g, ''));
  const stories = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const row = parseRow(lines[i]);
    const story = {};

    // Standard mappings
    headers.forEach((header, idx) => {
      const val = row[idx] || '';
      
      if (header.includes('id')) story.id = val;
      else if (header.includes('title')) story.title = val;
      else if (header.includes('epic')) story.epicId = val;
      else if (header.includes('feature')) story.featureId = val;
      else if (header.includes('okr')) story.okr = val;
      else if (header.includes('kpi')) story.kpi = val;
      else if (header.includes('priority')) story.priority = val;
      else if (header.includes('points') || header.includes('sp')) story.storyPoints = Number(val) || 5;
      else if (header.includes('asa') || header.includes('persona')) story.asA = val;
      else if (header.includes('iwantto') || header.includes('action')) story.iWantTo = val;
      else if (header.includes('sothat') || header.includes('benefit')) story.soThat = val;
      else if (header.includes('criteria') || header.includes('gherkin') || header.includes('ac')) story.acceptanceCriteria = val.replace(/\\n/g, '\n');
    });

    // Set defaults if split columns weren't matched
    if (!story.asA && !story.iWantTo && !story.soThat && row[5]) {
      // Attempt to split full story string: "As a X, I want to Y, so that Z"
      const fullStoryText = row[5] || '';
      const asaMatch = fullStoryText.match(/as\s+a\s+(.*?),\s*i\s+want\s+to\s+(.*?),\s*so\s+that\s+(.*)/i);
      if (asaMatch) {
        story.asA = asaMatch[1].trim();
        story.iWantTo = asaMatch[2].trim();
        story.soThat = asaMatch[3].trim();
      }
    }

    if (story.title) {
      stories.push({
        id: story.id || `US-CSV-${i}`,
        title: story.title,
        epicId: story.epicId || '',
        featureId: story.featureId || '',
        okr: story.okr || '',
        kpi: story.kpi || '',
        priority: story.priority || 'Medium',
        storyPoints: story.storyPoints || 5,
        asA: story.asA || '',
        iWantTo: story.iWantTo || '',
        soThat: story.soThat || '',
        acceptanceCriteria: story.acceptanceCriteria || '',
        nfrs: ''
      });
    }
  }

  return stories;
}

// PDF Text Extraction & Story Identification Heuristics
function extractStoriesFromPdf(text) {
  const uploadStatus = document.getElementById('upload-status');
  const stories = [];
  
  // Use regex to locate User Story blocks in the document
  // Looking for: ID (e.g. US-01.1.1), Title, As a, I want to, So that, Acceptance Criteria
  const storyBlocks = text.split(/(?=US-\d+\.\d+\.\d+)/g);
  
  storyBlocks.forEach((block, index) => {
    if (!block.toLowerCase().includes('as a') && !block.toLowerCase().includes('i want to')) return;
    
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const firstLine = lines[0] || '';
    
    // Extract ID and Title from the first line (e.g., US-01.1.1 Cloud Storage Connector Priority: High...)
    const idMatch = firstLine.match(/^(US-\d+\.\d+\.\d+)\s+(.*?)(?:\s+Priority:|\s+Story\s+Points:|$)/i);
    const storyId = idMatch ? idMatch[1] : `US-PDF-${index}`;
    let storyTitle = idMatch ? idMatch[2].trim() : 'Extracted User Story';
    
    // Clean up title
    storyTitle = storyTitle.replace(/Priority:.*|Story Points:.*/gi, '').trim();

    // Reconstruct the block text to use regexes
    const blockText = lines.join('\n');
    
    // Extract "As a", "I want to", "So that"
    const asaMatch = blockText.match(/As\s+a\s+(.*?),\s*\n?I\s+want\s+to/i) || blockText.match(/As\s+a\s+(.*?)\s+I\s+want\s+to/i);
    const iWantToMatch = blockText.match(/I\s+want\s+to\s+(.*?),\s*\n?So\s+that/i) || blockText.match(/I\s+want\s+to\s+(.*?)\s+So\s+that/i);
    const soThatMatch = blockText.match(/So\s+that\s+([\s\S]*?)(?:Acceptance\s+Criteria|Scenario:|$)/i);
    
    const asA = asaMatch ? asaMatch[1].trim().replace(/,$/, '') : '';
    const iWantTo = iWantToMatch ? iWantToMatch[1].trim().replace(/,$/, '') : '';
    let soThat = soThatMatch ? soThatMatch[1].trim() : '';
    
    // Clean soThat from trailing titles
    soThat = soThat.split('\n')[0].trim();

    // Extract Acceptance Criteria Gherkin
    let acceptanceCriteria = '';
    const acIndex = blockText.toLowerCase().indexOf('acceptance criteria');
    if (acIndex !== -1) {
      acceptanceCriteria = blockText.substring(acIndex + 19).trim();
      // Remove header details if any
      acceptanceCriteria = acceptanceCriteria.replace(/^\(Gherkin\)/i, '').trim();
    } else {
      // Check if there are Scenario lines
      const scIndex = blockText.toLowerCase().indexOf('scenario:');
      if (scIndex !== -1) {
        acceptanceCriteria = blockText.substring(scIndex).trim();
      }
    }

    // Try to guess the Epic / Feature from the ID
    let epicId = 'E-01';
    let featureId = 'F-01.1';
    
    if (storyId.startsWith('US-02')) {
      epicId = 'E-02';
      featureId = 'F-02.1';
    } else if (storyId.startsWith('US-03')) {
      epicId = 'E-03';
      featureId = 'F-03.1';
    } else if (storyId.startsWith('US-04')) {
      epicId = 'E-04';
      featureId = 'F-04.1';
    } else if (storyId.startsWith('US-05')) {
      epicId = 'E-05';
      featureId = 'F-05.1';
    }

    // Extract Story Points if present
    const spMatch = blockText.match(/Story\s+Points:\s*(\d+)/i);
    const storyPoints = spMatch ? Number(spMatch[1]) : 5;

    // Extract Priority if present
    const prioMatch = blockText.match(/Priority:\s*(Critical|High|Medium|Low)/i);
    const priority = prioMatch ? prioMatch[1] : 'Medium';

    if (asA || iWantTo || acceptanceCriteria) {
      stories.push({
        id: storyId,
        title: storyTitle,
        epicId,
        featureId,
        priority,
        storyPoints,
        asA,
        iWantTo,
        soThat,
        acceptanceCriteria,
        nfrs: ''
      });
    }
  });

  if (stories.length > 0) {
    state.importedStories = stories;
    renderImportedStoriesList();
    selectImportedStory(0);
    uploadStatus.innerHTML = `<span style="color:var(--success)">Parsed ${stories.length} stories from PDF successfully!</span>`;
  } else {
    uploadStatus.innerHTML = '<span style="color:var(--danger)">Could not identify structured stories in PDF. Using standard templates.</span>';
  }
}

// Render list of imported stories (CSV/PDF)
function renderImportedStoriesList() {
  const listContainer = document.getElementById('imported-stories-list');
  listContainer.innerHTML = '';
  
  if (state.importedStories.length === 0) {
    listContainer.innerHTML = '<p class="text-muted" style="padding:10px;">No stories imported yet.</p>';
    return;
  }

  state.importedStories.forEach((s, idx) => {
    const item = document.createElement('div');
    item.className = `backlog-item ${state.selectedImportedIndex === idx ? 'active' : ''}`;
    
    // Quick evaluate to show score directly in list
    const evaluation = evaluateStory(s);
    let badgeClass = 'fail';
    if (evaluation.score >= 85) badgeClass = 'pass';
    else if (evaluation.score >= 60) badgeClass = 'warning';

    item.innerHTML = `
      <div class="backlog-item-details">
        <span class="backlog-item-title">${s.id}: ${s.title}</span>
        <div class="backlog-item-meta">
          <span>Points: ${s.storyPoints} SP</span>
          <span>Epic: ${s.epicId}</span>
        </div>
      </div>
      <span class="trace-badge ${badgeClass}" style="min-width:45px;">${evaluation.score}%</span>
    `;

    item.onclick = () => selectImportedStory(idx);
    listContainer.appendChild(item);
  });
}

// Select and load imported story into active editor
function selectImportedStory(idx) {
  state.selectedImportedIndex = idx;
  state.currentStory = { ...state.importedStories[idx] };
  
  // Rerender list to highlight selected item
  const items = document.querySelectorAll('#imported-stories-list .backlog-item');
  items.forEach((item, i) => {
    if (i === idx) item.classList.add('active');
    else item.classList.remove('active');
  });

  writeStateToForm();
  runEvaluation();
}

// Export Quality Assessment Report as Markdown file
function exportReport() {
  const report = evaluateStory(state.currentStory);
  const epic = epics[state.currentStory.epicId];
  
  const markdownText = `# BACKLOG STORY QUALITY REPORT: ${state.currentStory.id || 'US-CUSTOM'} - ${state.currentStory.title}

## Summary
- **Evaluation Date**: ${new Date().toLocaleDateString()}
- **Quality Score**: ${report.score} / 100
- **Development Readiness**: ${report.score >= 85 ? 'SPRINT READY (HIGH QUALITY)' : report.score >= 60 ? 'NEEDS IMPROVEMENT' : 'CRITICAL ACTION REQUIRED'}

## Traceability Path
- **Strategic OKR**: ${epic ? epic.linkedOkrs.map(id => `${id} - ${okrs[id].objective}`).join(', ') : 'None Linked'}
- **Epic**: ${state.currentStory.epicId ? `${state.currentStory.epicId} - ${epic.title}` : 'None Linked'}
- **Feature**: ${state.currentStory.featureId ? `${state.currentStory.featureId} - ${epic.features[state.currentStory.featureId]}` : 'None Linked'}
- **Story Points**: ${state.currentStory.storyPoints} SP
- **Priority**: ${state.currentStory.priority}

## User Story Details
- **Description**:
  - **As a**: ${state.currentStory.asA || '---'}
  - **I want to**: ${state.currentStory.iWantTo || '---'}
  - **So that**: ${state.currentStory.soThat || '---'}
  
- **Acceptance Criteria**:
\`\`\`gherkin
${state.currentStory.acceptanceCriteria || 'No acceptance criteria provided.'}
\`\`\`

## Evaluation Details
1. **Template Structure**: ${report.sections.template.score} / ${report.sections.template.max}
2. **Gherkin Acceptance Criteria**: ${report.sections.gherkin.score} / ${report.sections.gherkin.max}
3. **Traceability**: ${report.sections.traceability.score} / ${report.sections.traceability.max}
4. **Non-Functional Requirements**: ${report.sections.nfr.score} / ${report.sections.nfr.max}

## Non-Functional Requirements Coverage
- **Security & Access Control**: ${report.nfrCoverage.security ? '✅ Addressed' : '❌ Missing'}
- **Performance & SLA**: ${report.nfrCoverage.performance ? '✅ Addressed' : '❌ Missing'}
- **Reliability & Compliance**: ${report.nfrCoverage.reliability ? '✅ Addressed' : '❌ Missing'}
- **Usability & UI Feedback**: ${report.nfrCoverage.usability ? '✅ Addressed' : '❌ Missing'}

## Actionable Recommendations
${report.recommendations.length > 0 ? report.recommendations.map(r => `- ${r}`).join('\n') : '- No critical improvements suggested. Good job!'}

${report.splitSuggested ? `## Story Breakdown Advice
- **Reason for Splitting**: ${report.splitReasons.join(' ')}
- **Suggested Sub-Stories**:
${report.suggestedSubStories.map((sub, idx) => `  ${idx+1}. **${sub.title}** (${sub.storyPoints} SP)
     - As a ${sub.asA}, I want to ${sub.iWantTo}, so that ${sub.soThat}
`).join('\n')}` : ''}
`;

  // Trigger Client-Side Download
  const blob = new Blob([markdownText], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backlog_quality_report_${state.currentStory.id || 'US'}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Light / Dark Theme toggler
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  state.theme = newTheme;
  
  const icon = document.getElementById('theme-icon');
  if (newTheme === 'light') {
    icon.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor" style="width:20px;height:20px;"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>`;
  } else {
    icon.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor" style="width:20px;height:20px;"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>`;
  }
}
