import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS Headers for secure UAT testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { story, okr } = req.body;
    if (!story || !okr) {
      return res.status(400).json({ error: 'Story and OKR are required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key configuration missing on server.' });
    }

    // Initialize Gemini API client
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a senior agile coach and product manager.
Audit the following user story against the strategic OKR.

User Story:
${JSON.stringify(story, null, 2)}

Strategic OKR:
"${okr}"

Identify any specific functional gaps where the user story falls short of addressing the OKR.
Provide exactly 2-3 actionable recommendations for new user stories or scope adjustments.
Return your response in a clean, JSON format matching:
{
  "gaps": ["gap 1 description", "gap 2 description"],
  "recommendations": ["rec 1", "rec 2"]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean potential markdown code fences from JSON output
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResponse = JSON.parse(cleanText);

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to process semantic analysis: ' + error.message });
  }
}
