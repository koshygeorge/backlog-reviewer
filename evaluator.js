// Backlog Story Quality Evaluator

import { epics, okrs } from './data.js';

export function evaluateStory(story) {
  const report = {
    score: 0,
    maxScore: 100,
    sections: {
      template: { score: 0, max: 25, items: [] },
      gherkin: { score: 0, max: 25, items: [] },
      traceability: { score: 0, max: 25, items: [] },
      nfr: { score: 0, max: 25, items: [] }
    },
    recommendations: [],
    nfrCoverage: {
      security: false,
      performance: false,
      reliability: false,
      usability: false
    },
    scenariosDetected: [],
    splitSuggested: false,
    splitReasons: [],
    suggestedSubStories: []
  };

  // Helper variables
  const title = (story.title || '').trim();
  const asA = (story.asA || '').trim();
  const iWantTo = (story.iWantTo || '').trim();
  const soThat = (story.soThat || '').trim();
  const ac = (story.acceptanceCriteria || '').trim();
  const epicId = (story.epicId || '').trim();
  const featureId = (story.featureId || '').trim();
  const storyPoints = Number(story.storyPoints) || 0;

  // ==========================================
  // 1. TEMPLATE STRUCTURE (Max 25)
  // ==========================================
  let templateScore = 0;
  
  if (asA) {
    templateScore += 5;
    const genericPersonas = ['user', 'someone', 'po', 'product owner', 'developer', 'dev'];
    const isGeneric = genericPersonas.includes(asA.toLowerCase());
    if (isGeneric) {
      report.sections.template.items.push({
        status: 'warning',
        text: `Persona "${asA}" is too generic. Use specific roles (e.g., "Graphic Designer", "Legal Reviewer", "Internal Auditor").`
      });
    } else {
      templateScore += 5;
      report.sections.template.items.push({
        status: 'pass',
        text: `Specific persona defined: "${asA}".`
      });
    }
  } else {
    report.sections.template.items.push({
      status: 'fail',
      text: 'Missing "As a [persona]" definition.'
    });
  }

  if (iWantTo) {
    const conjunctions = [' and ', ' or ', ' also ', ' as well as '];
    const hasConjunction = conjunctions.some(c => iWantTo.toLowerCase().includes(c));
    
    if (hasConjunction) {
      templateScore += 5;
      report.sections.template.items.push({
        status: 'warning',
        text: '"I want to" contains conjunctions (and/or/also). This suggests the story contains multiple features.'
      });
      report.splitReasons.push('Action contains multiple logical steps (conjunctions in "I want to").');
    } else {
      templateScore += 10;
      report.sections.template.items.push({
        status: 'pass',
        text: '"I want to" describes a single, focused action.'
      });
    }
  } else {
    report.sections.template.items.push({
      status: 'fail',
      text: 'Missing "I want to [action]" definition.'
    });
  }

  if (soThat) {
    templateScore += 5;
    report.sections.template.items.push({
      status: 'pass',
      text: '"So that [benefit]" details the business outcome.'
    });
  } else {
    report.sections.template.items.push({
      status: 'fail',
      text: 'Missing "So that [benefit]" to justify the business value.'
    });
  }

  report.sections.template.score = templateScore;

  // ==========================================
  // 2. GHERKIN ACCEPTANCE CRITERIA (Max 25)
  // ==========================================
  let gherkinScore = 0;
  
  if (ac) {
    // Basic scenario splitter
    const scenarioBlocks = ac.split(/(?=Scenario:)/gi).filter(block => block.toLowerCase().includes('scenario:'));
    report.scenariosDetected = scenarioBlocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const titleLine = lines[0] || '';
      const titleMatch = titleLine.match(/Scenario:\s*(.*)/i);
      const scenarioTitle = titleMatch ? titleMatch[1] : 'Unnamed Scenario';
      
      const keywords = {
        given: lines.some(l => l.toLowerCase().startsWith('given ')),
        when: lines.some(l => l.toLowerCase().startsWith('when ')),
        then: lines.some(l => l.toLowerCase().startsWith('then '))
      };

      return {
        title: scenarioTitle,
        hasGiven: keywords.given,
        hasWhen: keywords.when,
        hasThen: keywords.then,
        lineCount: lines.length
      };
    });

    const scenarioCount = report.scenariosDetected.length;

    if (scenarioCount > 0) {
      gherkinScore += 10;
      
      // Check if all scenarios have Given, When, Then
      const allScenariosComplete = report.scenariosDetected.every(s => s.hasGiven && s.hasWhen && s.hasThen);
      if (allScenariosComplete) {
        gherkinScore += 10;
        report.sections.gherkin.items.push({
          status: 'pass',
          text: `All detected scenarios (${scenarioCount}) follow BDD format (Given-When-Then).`
        });
      } else {
        gherkinScore += 5;
        report.sections.gherkin.items.push({
          status: 'warning',
          text: 'Some scenarios are missing critical Given, When, or Then steps.'
        });
        report.scenariosDetected.forEach(s => {
          if (!s.hasGiven || !s.hasWhen || !s.hasThen) {
            const missing = [];
            if (!s.hasGiven) missing.push('Given');
            if (!s.hasWhen) missing.push('When');
            if (!s.hasThen) missing.push('Then');
            report.recommendations.push(`Scenario "${s.title}" is missing step(s): ${missing.join(', ')}.`);
          }
        });
      }

      if (scenarioCount <= 3) {
        gherkinScore += 5;
        report.sections.gherkin.items.push({
          status: 'pass',
          text: `Scenario count is optimal (${scenarioCount} scenarios).`
        });
      } else {
        report.sections.gherkin.items.push({
          status: 'warning',
          text: `High number of scenarios (${scenarioCount}). Consider splitting this user story.`
        });
        report.splitReasons.push(`Too many acceptance criteria scenarios (${scenarioCount} detected, recommended <= 3).`);
      }
    } else {
      report.sections.gherkin.items.push({
        status: 'fail',
        text: 'No scenarios starting with "Scenario:" detected in acceptance criteria.'
      });
      report.recommendations.push('Rewrite acceptance criteria in Gherkin BDD format using "Scenario:", "Given", "When", "Then".');
    }
  } else {
    report.sections.gherkin.items.push({
      status: 'fail',
      text: 'Acceptance Criteria is completely empty.'
    });
    report.recommendations.push('Provide detailed Gherkin BDD acceptance criteria to make this story testable.');
  }

  report.sections.gherkin.score = gherkinScore;

  // ==========================================
  // 3. TRACEABILITY (Max 25)
  // ==========================================
  let traceScore = 0;
  const epic = epics[epicId];

  if (epicId && epic) {
    traceScore += 10;
    report.sections.traceability.items.push({
      status: 'pass',
      text: `Aligned with Epic ${epicId}: "${epic.title}".`
    });

    if (featureId) {
      const isFeatureInEpic = epic.features && epic.features[featureId];
      if (isFeatureInEpic) {
        traceScore += 10;
        report.sections.traceability.items.push({
          status: 'pass',
          text: `Correctly maps to Feature ${featureId}: "${epic.features[featureId]}".`
        });
      } else {
        report.sections.traceability.items.push({
          status: 'warning',
          text: `Feature "${featureId}" is not associated with Epic ${epicId} in the program matrix.`
        });
      }
    } else {
      report.sections.traceability.items.push({
        status: 'fail',
        text: 'No Feature code specified for traceability.'
      });
    }

    // OKR Link
    const linkedOkrs = epic.linkedOkrs || [];
    if (linkedOkrs.length > 0) {
      traceScore += 5;
      const okrDetails = linkedOkrs.map(id => okrs[id] ? `${id} (${okrs[id].objective})` : id).join(', ');
      report.sections.traceability.items.push({
        status: 'pass',
        text: `Traces to Strategic Objective: ${okrDetails}.`
      });
    }
  } else {
    report.sections.traceability.items.push({
      status: 'fail',
      text: 'Missing or invalid Epic ID. Stories must trace back to a defined Epic.'
    });
    report.recommendations.push('Link this user story to one of the Program Epics (E-01 to E-05) to ensure strategic business value.');
  }

  report.sections.traceability.score = traceScore;

  // ==========================================
  // 4. NON-FUNCTIONAL REQUIREMENTS (Max 25)
  // ==========================================
  let nfrScore = 0;
  const fullText = `${title} ${asA} ${iWantTo} ${soThat} ${ac}`.toLowerCase();

  // Security scanner
  const securityKeywords = ['auth', 'permission', 'role', 'admin', 'viewer', 'restrict', 'secure', 'oauth', 'encrypt', 'block', 'credentials', 'rights', 'breach', 'governance', 'rbac'];
  report.nfrCoverage.security = securityKeywords.some(kw => fullText.includes(kw));

  // Performance scanner
  const performanceKeywords = ['second', 'minute', 'hour', 'fast', 'ms', 'load', 'ingest', 'performance', 'latency', 'size', 'limit', 'mb', 'gb', 'throughput', 'speed', 'time-to-market'];
  report.nfrCoverage.performance = performanceKeywords.some(kw => fullText.includes(kw));

  // Reliability / Audit scanner
  const reliabilityKeywords = ['backup', 'archive', 'retain', 'retention', 'delete', 'remove', 'fail', 'error', 'audit', 'history', 'log', 'schedules', 'policy', 'compliance'];
  report.nfrCoverage.reliability = reliabilityKeywords.some(kw => fullText.includes(kw));

  // Usability scanner
  const usabilityKeywords = ['ui', 'ux', 'accessibility', 'responsive', 'mobile', 'preview', 'interface', 'toast', 'notification', 'satisfaction', 'csat', 'dashboard', 'alert', 'view'];
  report.nfrCoverage.usability = usabilityKeywords.some(kw => fullText.includes(kw));

  if (report.nfrCoverage.security) {
    nfrScore += 6;
    report.sections.nfr.items.push({ status: 'pass', text: 'Security & Access Control (RBAC) addressed.' });
  } else {
    report.sections.nfr.items.push({ status: 'fail', text: 'Missing Security / Access Control references.' });
    report.recommendations.push('Include security or access constraints (e.g., who is authorized, role checks, data protection).');
  }

  if (report.nfrCoverage.performance) {
    nfrScore += 6;
    report.sections.nfr.items.push({ status: 'pass', text: 'Performance, Speed, or Size Limits addressed.' });
  } else {
    report.sections.nfr.items.push({ status: 'fail', text: 'Missing Performance or SLA targets.' });
    report.recommendations.push('Add performance SLA expectations (e.g., upload time limits, page load speeds, file size restrictions).');
  }

  if (report.nfrCoverage.reliability) {
    nfrScore += 6;
    report.sections.nfr.items.push({ status: 'pass', text: 'Reliability, Audit logs, or Archival policies addressed.' });
  } else {
    report.sections.nfr.items.push({ status: 'fail', text: 'Missing Audit trail or Compliance policies.' });
    report.recommendations.push('Add audit logging or error recovery scenarios (e.g., logging activity, retention guidelines).');
  }

  if (report.nfrCoverage.usability) {
    nfrScore += 7;
    report.sections.nfr.items.push({ status: 'pass', text: 'Usability, Interface feedback, or CSAT goals addressed.' });
  } else {
    report.sections.nfr.items.push({ status: 'fail', text: 'Missing Usability or UI feedback criteria.' });
    report.recommendations.push('Incorporate UI notifications or usability criteria (e.g., error messages shown to user, toast alerts).');
  }

  report.sections.nfr.score = nfrScore;

  // ==========================================
  // FINAL SCORE & SPLITTING ADVICE
  // ==========================================
  report.score = report.sections.template.score + 
                 report.sections.gherkin.score + 
                 report.sections.traceability.score + 
                 report.sections.nfr.score;

  // Story points check
  if (storyPoints > 8) {
    report.splitReasons.push(`High estimation of story points (${storyPoints} SP, recommended <= 8 for a single sprint).`);
  }

  if (report.splitReasons.length > 0) {
    report.splitSuggested = true;
    
    // Generate intelligent suggested sub-stories based on inputs
    if (ac && report.scenariosDetected.length > 1) {
      report.scenariosDetected.forEach((s, idx) => {
        report.suggestedSubStories.push({
          id: `${story.id || 'US'}-S${idx+1}`,
          title: `${title} - ${s.title}`,
          epicId,
          featureId,
          storyPoints: Math.max(1, Math.round(storyPoints / report.scenariosDetected.length)),
          asA,
          iWantTo: `${iWantTo} (${s.title.toLowerCase()})`,
          soThat,
          acceptanceCriteria: `Scenario: ${s.title}\nGiven ...\nWhen ...\nThen ...`,
          nfrs: 'Incorporate relevant NFRs for this specific scenario.'
        });
      });
    } else {
      // General fallbacks
      report.suggestedSubStories = [
        {
          id: `${story.id || 'US'}-A`,
          title: `${title} (Core Functionality)`,
          epicId,
          featureId,
          storyPoints: Math.ceil(storyPoints / 2),
          asA,
          iWantTo: iWantTo,
          soThat,
          acceptanceCriteria: `Scenario: Core functionality works\nGiven ...\nWhen ...\nThen ...`,
          nfrs: 'Security & basic performance requirements.'
        },
        {
          id: `${story.id || 'US'}-B`,
          title: `${title} (Error Handling & Edge Cases)`,
          epicId,
          featureId,
          storyPoints: Math.floor(storyPoints / 2),
          asA,
          iWantTo: `${iWantTo} including validation checks`,
          soThat: `we prevent system abuse and handle failure states gracefully`,
          acceptanceCriteria: `Scenario: Validation check fails\nGiven ...\nWhen ...\nThen ...`,
          nfrs: 'Audit trails and error recovery.'
        }
      ];
    }
  }

  return report;
}
