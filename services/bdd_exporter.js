// Shift-Left Executable BDD & QA Test Suite Exporter
// Compiles Gherkin criteria into executable Cucumber .feature files and Playwright test stubs.

export function generateCucumberFeatureFile(story) {
  const storyId = story.id || 'US-001';
  const storyTitle = story.title || 'User Story Feature';
  const featureName = story.featureId || 'F-01';

  let featureText = `# Auto-generated Executable BDD Feature File
# Story ID: ${storyId}
# Generated: ${new Date().toISOString().slice(0,10)}

Feature: ${storyTitle}
  As a ${story.asA || 'User'}
  I want to ${story.iWantTo || 'perform action'}
  So that ${story.soThat || 'achieve value'}

`;

  if (story.acceptanceCriteria && story.acceptanceCriteria.trim()) {
    featureText += story.acceptanceCriteria;
  } else {
    featureText += `  Scenario: Default Happy Path Execution\n    Given the user is logged into the system\n    When the user triggers the action\n    Then the system validates the response successfully`;
  }

  return featureText;
}

export function generatePlaywrightTestFile(story) {
  const storyId = story.id || 'US-001';
  const storyTitle = (story.title || 'User Story').replace(/['"]/g, '');

  return `// Auto-generated Playwright Automation Test Stub
// Story ID: ${storyId} - ${storyTitle}

import { test, expect } from '@playwright/test';

test.describe('${storyId}: ${storyTitle}', () => {

  test('Happy Path Verification', async ({ page }) => {
    // Given user navigates to application
    await page.goto('/');

    // When user performs action (${story.iWantTo || 'action'})
    // TODO: Add selector interaction here
    
    // Then expected value is produced (${story.soThat || 'benefit'})
    await expect(page).toHaveURL(/.*dashboard/);
  });

});
`;
}
