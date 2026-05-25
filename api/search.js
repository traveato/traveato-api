export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    const { city, headCount, tier } = req.body;

    const budgetText = {
      cheap: "budget hotels under ₹5,000/night",
      luxury: "luxury 4-5 star hotels ₹10,000-₹30,000/night",
      ultra: "ultra luxury premium resorts ₹40,000+/night"
    };

    const prompt = `
You are a professional travel planner.

Return ONLY valid JSON.

NO markdown.
NO explanation.
NO backticks.

Generate REAL hotels and REAL itinerary for:

City: ${city}
Travellers: ${headCount}
Budget tier: ${tier}

Budget style:
${budgetText[tier]}

Rules:
- Hotels MUST be REAL hotels from that city only.
- Do NOT invent hotel names.
- Itinerary must contain REAL tourist attractions.
- Return clean JSON only.

JSON FORMAT:

{
  "destination":"${city}, India",

  "popularity_score":85,

  "popularity_label":"Popular",

  "travelers_monthly":"1 lakh+ monthly",

  "best_season":"October to March",

  "trip_duration":"3-5 days",

  "per_head_min_inr":15000,

  "per_head_max_inr":50000,

  "summary":"Short real destination summary.",

  "crowd_insight":"Crowd information.",

  "tips":"Helpful travel tip.",

  "hotels":[
    {
      "name":"Real Hotel Name",
      "stars":5,
      "price_per_night":"₹18,000",
      "highlight":"Why famous"
    },
    {
      "name":"Real Hotel Name",
      "stars":4,
      "price_per_night":"₹8,000",
      "highlight":"Why famous"
    }
  ],

  "itinerary":[
    {
      "day":"Day 1",
      "plan":"Real attractions and activities"
    },
    {
      "day":"Day 2",
      "plan":"Real attractions and activities"
    },
    {
      "day":"Day 3",
      "plan":"Real attractions and activities"
    }
  ],

  "sources_used":[
    "Google Travel",
    "TripAdvisor",
    "Booking.com"
  ]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          generationConfig: {
            temperature: 0.9,
            topP: 1,
            topK: 32,
            maxOutputTokens: 4096
          },

          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    let text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({
        error: 'Invalid AI response'
      });
    }

    const cleanJson = text.slice(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(cleanJson);

    return res.status(200).json({
      result: parsed
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }
}
