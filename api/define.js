const SYSTEM_PROMPT = `You are an IB examiner writing glossary entries for a revision game.

For each term given (with its subject), write exactly one definition sentence:
- Maximum 25 words.
- Precise and exam-relevant to the IB Diploma syllabus for the stated subject.
- Plain prose. No lists, no hedging, no meta commentary.
- Do not use em dashes. Use commas, colons, or full stops instead.
- Aim for a 17-year-old IB student who has seen the topic but needs a reminder.

Return ONLY a raw JSON array. No markdown, no code fences, no prose before or after.
Format: [{"term":"<exact input term>","definition":"<one sentence>"}]
The term field must match the input term exactly (same casing, same spelling).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'missing_api_key' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const terms = Array.isArray(body?.terms) ? body.terms.slice(0, 40) : [];
  if (!terms.length) {
    res.status(400).json({ error: 'no_terms' });
    return;
  }

  const safe = terms
    .filter(t => t && typeof t.term === 'string' && t.term.length <= 80)
    .map(t => ({ term: t.term.trim(), subject: String(t.subject || 'General').slice(0, 40) }));

  const userContent = safe.map(t => `- ${t.term} (${t.subject})`).join('\n');

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1600,
        system: [
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }
        ],
        messages: [
          { role: 'user', content: `Terms:\n${userContent}` }
        ]
      })
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      res.status(502).json({ error: 'upstream', status: apiRes.status, detail: text.slice(0, 500) });
      return;
    }

    const data = await apiRes.json();
    const raw = (data.content || []).map(b => b.text || '').join('').trim();
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

    let defs;
    try {
      defs = JSON.parse(clean);
    } catch {
      const match = clean.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('no_json_array');
      defs = JSON.parse(match[0]);
    }

    if (!Array.isArray(defs)) throw new Error('not_array');

    const normalised = defs
      .filter(d => d && typeof d.term === 'string' && typeof d.definition === 'string')
      .map(d => ({ term: d.term, definition: d.definition.replace(/—/g, ',').trim() }));

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ defs: normalised });
  } catch (e) {
    res.status(500).json({ error: 'proxy_failure', detail: String(e).slice(0, 300) });
  }
}
