// Client-Side Multi-LLM Provider Bridge (BYOK - Bring Your Own Key)
// Direct client-side requests to Gemini, OpenAI, or Claude with optional DLP Sanitization.

import { sanitizeStoryObject } from './dlp_sanitizer.js';

export async function analyzeStoryWithLLM({ story, okr, provider, model, apiKey, enableDlp = true }) {
  if (!apiKey) {
    throw new Error('LLM API Key is missing. Please enter your API Key in Settings.');
  }

  // Apply DLP pre-call sanitization if enabled
  const processedStory = enableDlp ? sanitizeStoryObject(story) : story;

  const systemPrompt = `You are a senior agile coach and product manager.
Audit the following user story against the strategic OKR.
Identify any specific functional gaps where the user story falls short of addressing the OKR.
Provide 2-3 actionable recommendations for new user stories or scope adjustments.
Return ONLY clean JSON in this format:
{
  "gaps": ["gap 1 description", "gap 2 description"],
  "recommendations": ["rec 1", "rec 2"]
}`;

  const userPrompt = `User Story:\n${JSON.stringify(processedStory, null, 2)}\n\nStrategic OKR:\n"${okr}"`;

  if (provider === 'openai') {
    return await callOpenAI({ model: model || 'gpt-4o-mini', apiKey, systemPrompt, userPrompt });
  } else if (provider === 'claude') {
    return await callClaude({ model: model || 'claude-3-5-sonnet-20241022', apiKey, systemPrompt, userPrompt });
  } else {
    // Default: Gemini
    return await callGemini({ model: model || 'gemini-1.5-flash', apiKey, systemPrompt, userPrompt });
  }
}

async function callGemini({ model, apiKey, systemPrompt, userPrompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseJsonResponse(text);
}

async function callOpenAI({ model, apiKey, systemPrompt, userPrompt }) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return parseJsonResponse(text);
}

async function callClaude({ model, apiKey, systemPrompt, userPrompt }) {
  const url = 'https://api.anthropic.com/v1/messages';
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey.trim(),
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  return parseJsonResponse(text);
}

function parseJsonResponse(text) {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    return {
      gaps: ['Could not parse structured JSON from LLM response.'],
      recommendations: [text]
    };
  }
}
