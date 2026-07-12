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
  const customOkr = (story.okr || '').trim();
  const customKpi = (story.kpi || '').trim();
  const isIndependent = !!story.isIndependent;

  if (isIndependent) {
    traceScore = 25;
    report.sections.traceability.items.push({
      status: 'pass',
      text: 'Independent User Story: No Epic/Feature mapping required.'
    });
  } else {
    if (epicId) {
      traceScore += 10;
      report.sections.traceability.items.push({
        status: 'pass',
        text: `Epic specified: "${epicId}".`
      });

      const refEpic = epics[epicId];
      if (refEpic) {
        report.sections.traceability.items.push({
          status: 'pass',
          text: `💡 Aligns with Workbook Reference Epic: "${refEpic.title}".`
        });
      }
    } else {
      report.sections.traceability.items.push({
        status: 'fail',
        text: 'Missing Epic mapping. Stories should trace back to an Epic.'
      });
      report.recommendations.push('Map this story to a parent Epic to establish business context.');
    }

    if (featureId) {
      traceScore += 10;
      report.sections.traceability.items.push({
        status: 'pass',
        text: `Feature specified: "${featureId}".`
      });

      const refEpic = epics[epicId];
      if (refEpic && refEpic.features && refEpic.features[featureId]) {
        report.sections.traceability.items.push({
          status: 'pass',
          text: `💡 Aligns with Workbook Reference Feature: "${refEpic.features[featureId]}".`
        });
      }
    } else {
      report.sections.traceability.items.push({
        status: 'fail',
        text: 'Missing Feature mapping. Stories should map to a functional feature.'
      });
      report.recommendations.push('Map this story to a Feature to define the product capability.');
    }

    if (customOkr || customKpi) {
      traceScore += 5;
      const okrText = customOkr ? `OKR: ${customOkr}` : '';
      const kpiText = customKpi ? `KPI: ${customKpi}` : '';
      const sep = (customOkr && customKpi) ? ' | ' : '';
      report.sections.traceability.items.push({
        status: 'pass',
        text: `Traceability fields: ${okrText}${sep}${kpiText}`
      });
    } else {
      const refEpic = epics[epicId];
      if (refEpic && refEpic.linkedOkrs && refEpic.linkedOkrs.length > 0) {
        traceScore += 5;
        report.sections.traceability.items.push({
          status: 'pass',
          text: `Traces to Workbook Reference OKRs: ${refEpic.linkedOkrs.join(', ')}`
        });
      } else {
        report.sections.traceability.items.push({
          status: 'warning',
          text: 'No OKR/KPI mappings specified. This may impact business value tracking.'
        });
        report.recommendations.push('Optionally specify a Linked OKR or Impacted KPI to quantify the story\'s business realization.');
      }
    }
  }
  report.sections.traceability.score = traceScore;

  // ==========================================
  // 4. NON-FUNCTIONAL REQUIREMENTS (Max 25)
  // ==========================================
  let nfrScore = 0;
  const fullText = `${title} ${asA} ${iWantTo} ${soThat} ${ac}`.toLowerCase();

  // 1. Performance scanner
  const performanceKeywords = ['performance', 'speed', 'latency', 'fast', 'response', 'ms', 'second', 'seconds', 'throughput', 'time-to-market'];
  const matchedPerformance = performanceKeywords.filter(kw => fullText.includes(kw));
  const hasPerformance = matchedPerformance.length > 0;

  // 2. Scalability scanner
  const scalabilityKeywords = ['scale', 'scalability', 'sizing', 'growth', 'volume', 'concurrent', 'users', 'expand', 'mb', 'gb', 'tb', 'size', 'limit'];
  const matchedScalability = scalabilityKeywords.filter(kw => fullText.includes(kw));
  const hasScalability = matchedScalability.length > 0;

  // 3. Load Testing scanner
  const loadTestingKeywords = ['load test', 'load-testing', 'stress test', 'stress-testing', 'volume test', 'concurrency test', 'benchmark', 'simulat'];
  const matchedLoadTesting = loadTestingKeywords.filter(kw => fullText.includes(kw));
  const hasLoadTesting = matchedLoadTesting.length > 0;

  // 4. Stability scanner
  const stabilityKeywords = ['stability', 'stable', 'reliability', 'uptime', 'crash', 'failover', 'robust', 'redundant', 'backup', 'sla', 'availability'];
  const matchedStability = stabilityKeywords.filter(kw => fullText.includes(kw));
  const hasStability = matchedStability.length > 0;

  // 5. Security scanner
  const securityKeywords = ['security', 'secure', 'auth', 'permission', 'role', 'admin', 'viewer', 'restrict', 'oauth', 'encrypt', 'block', 'credentials', 'rights', 'breach', 'governance', 'rbac'];
  const matchedSecurity = securityKeywords.filter(kw => fullText.includes(kw));
  const hasSecurity = matchedSecurity.length > 0;

  // 6. Documentation scanner
  const documentationKeywords = ['documentation', 'document', 'doc', 'guide', 'wiki', 'comment', 'readme', 'manual', 'log', 'records', 'audit', 'history'];
  const matchedDocumentation = documentationKeywords.filter(kw => fullText.includes(kw));
  const hasDocumentation = matchedDocumentation.length > 0;

  report.nfrCoverage = {
    performance: hasPerformance,
    scalability: hasScalability,
    loadtesting: hasLoadTesting,
    stability: hasStability,
    security: hasSecurity,
    documentation: hasDocumentation
  };

  report.nfrDetails = {
    performance: {
      covered: hasPerformance,
      matched: matchedPerformance,
      missing: 'Add target latency limits (e.g. "within 3 seconds"), execution speeds, or page response metrics.'
    },
    scalability: {
      covered: hasScalability,
      matched: matchedScalability,
      missing: 'Add scalability constraints (e.g. concurrency limits, data volume targets, or expanding bandwidth).'
    },
    loadtesting: {
      covered: hasLoadTesting,
      matched: matchedLoadTesting,
      missing: 'Add testing limits or benchmark targets (e.g. stress test parameters, concurrent request simulations).'
    },
    stability: {
      covered: hasStability,
      matched: matchedStability,
      missing: 'Add robustness constraints (e.g. uptime SLAs, system failover plans, backup cycles, or error recovery).'
    },
    security: {
      covered: hasSecurity,
      matched: matchedSecurity,
      missing: 'Add role access policies, authorization (OAuth2), data encryption standards, or credential protection.'
    },
    documentation: {
      covered: hasDocumentation,
      matched: matchedDocumentation,
      missing: 'Add documentation criteria (e.g. update logs, audit histories, user manuals, or system wiki records).'
    }
  };

  if (hasPerformance) { nfrScore += 4; report.sections.nfr.items.push({ status: 'pass', text: 'Performance NFR addressed.' }); }
  else { report.sections.nfr.items.push({ status: 'fail', text: 'Missing Performance NFR.' }); report.recommendations.push('Add Performance requirements (e.g., speed, response time).'); }

  if (hasScalability) { nfrScore += 4; report.sections.nfr.items.push({ status: 'pass', text: 'Scalability NFR addressed.' }); }
  else { report.sections.nfr.items.push({ status: 'fail', text: 'Missing Scalability NFR.' }); report.recommendations.push('Add Scalability requirements (e.g., growth sizing, concurrent limits).'); }

  if (hasLoadTesting) { nfrScore += 4; report.sections.nfr.items.push({ status: 'pass', text: 'Load Testing NFR addressed.' }); }
  else { report.sections.nfr.items.push({ status: 'fail', text: 'Missing Load Testing NFR.' }); report.recommendations.push('Add Load Testing requirements (e.g., stress test bounds, request volume targets).'); }

  if (hasStability) { nfrScore += 4; report.sections.nfr.items.push({ status: 'pass', text: 'Stability NFR addressed.' }); }
  else { report.sections.nfr.items.push({ status: 'fail', text: 'Missing Stability NFR.' }); report.recommendations.push('Add Stability requirements (e.g., uptime SLAs, backup policies).'); }

  if (hasSecurity) { nfrScore += 5; report.sections.nfr.items.push({ status: 'pass', text: 'Security NFR addressed.' }); }
  else { report.sections.nfr.items.push({ status: 'fail', text: 'Missing Security NFR.' }); report.recommendations.push('Add Security requirements (e.g., RBAC role restrictions, data protection).'); }

  if (hasDocumentation) { nfrScore += 4; report.sections.nfr.items.push({ status: 'pass', text: 'Documentation NFR addressed.' }); }
  else { report.sections.nfr.items.push({ status: 'fail', text: 'Missing Documentation NFR.' }); report.recommendations.push('Add Documentation requirements (e.g., audit logging, training docs, user guides).'); }

  report.sections.nfr.score = nfrScore;

  // FINAL SCORE & SPLITTING ADVICE
  // ==========================================
  report.score = report.sections.template.score + 
                 report.sections.gherkin.score + 
                 report.sections.traceability.score + 
                 report.sections.nfr.score;

  // Story points check (PO aligned: stories >= 13 SP must be split)
  if (storyPoints >= 13) {
    report.splitReasons.push(`High estimation of story points (${storyPoints} SP, recommended < 13 for a single sprint).`);
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
