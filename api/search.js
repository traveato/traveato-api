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

    const prompt = `
You are a luxury travel AI.

Generate REALISTIC travel data for this destination.

Destination: ${city}
Travellers: ${headCount}
Budget tier: ${tier}

IMPORTANT:
- Return ONLY pure valid JSON
- NO markdown
- NO explanation
- NO backticks
- Hotels must be REAL hotels from that city
- Flights should look realistic
- Itinerary must be REAL and city-specific
- Mention real attractions and activities

JSON FORMAT:

{
  "destination":"City, Country",

  "popularity_score":88,

  "popularity_label":"Very Popular",

  "travelers_monthly":"2 lakh+",

  "best_season":"October to March",

  "trip_duration":"4-6 days",

  "per_head_min_inr":50000,

  "per_head_max_inr":150000,

  "summary":"Short realistic summary",

  "crowd_insight":"Real crowd insight",

  "tips":"Useful travel tip",

  "hotels":[
    {
      "name":"Real hotel name",
      "stars":5,
      "price_per_night":"₹20,000",
      "highlight":"Hotel feature"
    },
    {
      "name":"Real hotel name",
      "stars":4,
      "price_per_night":"₹12,000",
      "highlight":"Hotel feature"
    }
  ],

  "flights":[
    {
      "route":"Delhi → Destination",
      "airline":"IndiGo",
      "price":"₹7,500",
      "type":"Direct"
    },
    {
      "route":"Mumbai → Destination",
      "airline":"Air India",
      "price":"₹6,000",
      "type":"Direct"
    }
  ],

  "itinerary":[
    {
      "day":"Day 1",
      "plan":"Detailed realistic plan"
    },
    {
      "day":"Day 2",
      "plan":"Detailed realistic plan"
    },
    {
      "day":"Day 3",
      "plan":"Detailed realistic plan"
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
            topK: 40,
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

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {

      return res.status(500).json({
        error: 'Invalid AI response',
        raw: cleaned
      });

    }

    const jsonString =
      cleaned.slice(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(jsonString);

    return res.status(200).json({
      result: parsed
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
