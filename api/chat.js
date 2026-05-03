const NVIDIA_MODEL = 'meta/llama-3.1-70b-instruct';
const API_KEY = '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';

export default async function handler(req, res) {
  // Allow CORS from any origin (your Vercel frontend)
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
    const { messages } = req.body;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        max_tokens: 1024,
        temperature: 0.4,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err?.error?.message || `API error ${response.status}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
