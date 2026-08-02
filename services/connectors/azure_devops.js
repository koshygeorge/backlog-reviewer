// Microsoft Azure DevOps REST API Connector (PAT Authenticated)
// Connects directly from the browser sandbox to Azure DevOps to fetch Epics, Features, and User Stories.

export async function fetchAzureDevOpsBacklog({ orgUrl, project, pat }) {
  if (!orgUrl || !project || !pat) {
    throw new Error('Azure DevOps Organization URL, Project Name, and Personal Access Token (PAT) are required.');
  }

  // Clean orgUrl trailing slash
  const cleanOrg = orgUrl.replace(/\/+$/, '');
  const authHeader = 'Basic ' + btoa(':' + pat.trim());

  // 1. Execute WIQL query to list Work Items (Epics, Features, User Stories, Requirements)
  const wiqlUrl = `${cleanOrg}/${encodeURIComponent(project)}/_apis/wit/wiql?api-version=7.0`;
  const wiqlBody = {
    query: `SELECT [System.Id], [System.WorkItemType], [System.Title] FROM WorkItems WHERE [System.TeamProject] = '${project}' AND [System.WorkItemType] IN ('Epic', 'Feature', 'User Story', 'Requirement', 'Issue') ORDER BY [System.Id] DESC`
  };

  const wiqlRes = await fetch(wiqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify(wiqlBody)
  });

  if (!wiqlRes.ok) {
    const errorText = await wiqlRes.text();
    throw new Error(`Azure DevOps WIQL query failed (${wiqlRes.status}): ${errorText}`);
  }

  const wiqlData = await wiqlRes.json();
  const workItemRefs = wiqlData.workItems || [];

  if (workItemRefs.length === 0) {
    return [];
  }

  // Batch fetch details (up to 200 items per request)
  const ids = workItemRefs.slice(0, 100).map(w => w.id).join(',');
  const detailsUrl = `${cleanOrg}/${encodeURIComponent(project)}/_apis/wit/workitems?ids=${ids}&$expand=all&api-version=7.0`;

  const detailsRes = await fetch(detailsUrl, {
    headers: {
      'Authorization': authHeader
    }
  });

  if (!detailsRes.ok) {
    throw new Error(`Failed to fetch Azure DevOps work item details (${detailsRes.status})`);
  }

  const detailsData = await detailsRes.json();
  const rawItems = detailsData.value || [];

  // Map Azure DevOps work items to standard Backlog Portal schema
  const stories = [];

  rawItems.forEach(item => {
    const fields = item.fields || {};
    const type = fields['System.WorkItemType'];
    
    // Only extract User Stories / Requirements
    if (type === 'User Story' || type === 'Requirement' || type === 'Issue') {
      const description = stripHtml(fields['System.Description'] || '');
      const ac = stripHtml(fields['Microsoft.VSTS.Common.AcceptanceCriteria'] || '');
      
      // Attempt to parse As a / I want to / So that from description
      const parsed = parseUserStoryText(description);

      stories.push({
        id: `US-ADO-${item.id}`,
        title: fields['System.Title'] || 'Untitled Story',
        epicId: fields['System.Parent'] ? `E-ADO-${fields['System.Parent']}` : 'E-01',
        featureId: 'F-01.1',
        priority: mapPriority(fields['Microsoft.VSTS.Common.Priority']),
        storyPoints: Number(fields['Microsoft.VSTS.Scheduling.StoryPoints']) || 5,
        asA: parsed.asA,
        iWantTo: parsed.iWantTo || fields['System.Title'],
        soThat: parsed.soThat,
        acceptanceCriteria: ac || parsed.ac,
        okr: '',
        kpi: ''
      });
    }
  });

  return stories;
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function mapPriority(prioNum) {
  if (prioNum === 1) return 'Critical';
  if (prioNum === 2) return 'High';
  if (prioNum === 3) return 'Medium';
  return 'Low';
}

function parseUserStoryText(text) {
  const result = { asA: '', iWantTo: '', soThat: '', ac: '' };
  if (!text) return result;

  const asaMatch = text.match(/as\s+a\s+(.*?),\s*i\s+want\s+to\s+(.*?),\s*so\s+that\s+(.*)/i);
  if (asaMatch) {
    result.asA = asaMatch[1].trim();
    result.iWantTo = asaMatch[2].trim();
    result.soThat = asaMatch[3].trim();
  }
  return result;
}
