// Atlassian Jira Cloud REST API Connector (PAT / API Token Authenticated)
// Connects directly from the browser sandbox to Jira Cloud to fetch Epics and User Stories.

export async function fetchJiraBacklog({ domain, userEmail, pat }) {
  if (!domain || !pat) {
    throw new Error('Jira Domain (e.g. company.atlassian.net) and API Token / PAT are required.');
  }

  // Clean domain URL
  let cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!cleanDomain.includes('.')) {
    cleanDomain += '.atlassian.net';
  }

  const url = `https://${cleanDomain}/rest/api/3/search?jql=issuetype in (Story, Epic, Task)&maxResults=100`;

  // Auth: Email + API Token or Token alone
  const credentials = userEmail ? `${userEmail.trim()}:${pat.trim()}` : pat.trim();
  const authHeader = 'Basic ' + btoa(credentials);

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': authHeader
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Jira API request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const issues = data.issues || [];

  const stories = [];

  issues.forEach(issue => {
    const fields = issue.fields || {};
    const issueType = fields.issuetype ? fields.issuetype.name : '';

    if (issueType === 'Story' || issueType === 'Task') {
      const summary = fields.summary || 'Untitled Story';
      const ac = extractJiraDocText(fields.customfield_10020 || fields.description);
      const parsed = parseUserStoryText(summary + ' ' + ac);

      stories.push({
        id: issue.key,
        title: summary,
        epicId: fields.parent ? fields.parent.key : 'E-01',
        featureId: 'F-01.1',
        priority: fields.priority ? fields.priority.name : 'Medium',
        storyPoints: Number(fields.customfield_10028 || fields.storyPoints) || 5,
        asA: parsed.asA,
        iWantTo: parsed.iWantTo || summary,
        soThat: parsed.soThat,
        acceptanceCriteria: ac,
        okr: '',
        kpi: ''
      });
    }
  });

  return stories;
}

function extractJiraDocText(doc) {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  if (doc.type === 'doc' && Array.isArray(doc.content)) {
    return doc.content.map(p => {
      if (p.content && Array.isArray(p.content)) {
        return p.content.map(c => c.text || '').join('');
      }
      return '';
    }).join('\n');
  }
  return '';
}

function parseUserStoryText(text) {
  const result = { asA: '', iWantTo: '', soThat: '' };
  if (!text) return result;

  const asaMatch = text.match(/as\s+a\s+(.*?),\s*i\s+want\s+to\s+(.*?),\s*so\s+that\s+(.*)/i);
  if (asaMatch) {
    result.asA = asaMatch[1].trim();
    result.iWantTo = asaMatch[2].trim();
    result.soThat = asaMatch[3].trim();
  }
  return result;
}
