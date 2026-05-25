export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { city, headCount, tier } = req.body;
  const tierDesc = {
    cheap:  'budget backpacker, hostels, street food, under 2000 INR/night',
    luxury: '4-5 star hotels 8000-20000 INR/night, fine dining',
    ultra:  '5-star resorts 25000+ INR/night, suites, butler service'
  };

  const prompt = `You are a travel research expert. Destination: "${city}", Travellers: ${headCount}, Tier: ${tier} (${tierDesc[tier] || tierDesc.cheap}). Search the web and return ONLY valid JSON no markdown no backticks: {"destination":"City Country","popularity_score":85,"popularity_label":"Very Popular","travelers_monthly":"2.5 lakh","best_season":"Oct-March","trip_duration":"3-5 days","per_head_min_inr":15000,"per_head_max_inr":25000,"summary":"2-3 sentences about destination","crowd_insight":"one line about crowds","tips":"one pro tip","hotels":[{"name":"Real hotel","stars":3,"price_per_night":"2000-3000 INR","highlight":"feature"},{"name":"Real hotel","stars":3,"price_per_night":"2000-3000 INR","highlight":"feature"},{"name":"Real hotel","stars":4,"price_per_night":"4000-6000 INR","highlight":"feature"},{"name":"Real hotel","stars":4,"price_per_night":"4000-6000 INR","highlight":"feature"},{"name":"Real hotel","stars":5,"price_per_night":"8000-12000 INR","highlight":"feature"},{"name":"Real hotel","stars":5,"price_per_night":"8000-12000 INR","highlight":"feature"}],"itinerary":[{"day":"Day 1","plan":"activity"},{"day":"Day 2","plan":"activity"},{"day":"Day 3","plan":"activity"}],"sources_used":["TripAdvisor","MakeMyTrip","Lonely Planet"]}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: [{ google_search: {} }],
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.filter(p => p.text)?.map(p => p.text)?.join('') || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    const result = JSON.parse(match ? match[0] : clean);
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
