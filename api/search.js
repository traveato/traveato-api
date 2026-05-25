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
You are a professional AI travel research engine.

IMPORTANT RULES:
- Use REAL hotel names only.
- Use REAL destinations only.
- Never generate fake hotel names.
- Never use placeholders.
- Never repeat same hotels.
- Hotels must exist in real life.
- Return ONLY valid JSON.
- No markdown.
- No explanations.
- No backticks.

Destination: ${city}
Travellers: ${headCount}
Budget tier: ${tier}

Tier guide:

cheap:
- budget hotels
- backpacker stays
- affordable food

luxury:
- premium 4-5 star hotels
- fine dining
- premium travel

ultra:
- ultra luxury resorts
- premium suites
- iconic luxury stays

Return JSON format:

{
  "destination":"City, Country",

  "popularity_score":88,
  "popularity_label":"Very Popular",

  "travelers_monthly":"2 lakh",

  "best_season":"October to March",

  "trip_duration":"4-6 days",

  "per_head_min_inr":25000,
  "per_head_max_inr":70000,

  "summary":"Write a realistic destination summary.",

  "crowd_insight":"Write realistic crowd insight.",

  "tips":"Professional travel tip.",

  "hotels":[
    {
      "name":"Real Hotel Name",
      "stars":5,
      "price_per_night":"₹15,000-₹25,000",
      "highlight":"Real hotel feature"
    },
    {
      "name":"Another Real Hotel",
      "stars":4,
      "price_per_night":"₹8,000-₹12,000",
      "highlight":"Real hotel feature"
    },
    {
      "name":"Third Real Hotel",
      "stars":3,
      "price_per_night":"₹3,000-₹6,000",
      "highlight":"Real hotel feature"
    }
  ],

  "flights":[
    {
      "route":"Delhi to destination",
      "airline":"IndiGo",
      "price":"₹8,000",
      "type":"Economy"
    },
    {
      "route":"Mumbai to destination",
      "airline":"Air India",
      "price":"₹11,000",
      "type":"Direct"
    }
  ],

  "places_to_visit":[
    "Place 1",
    "Place 2",
    "Place 3"
  ],

  "foods_to_try":[
    "Food 1",
    "Food 2"
  ],

  "itinerary":[
    {
      "day":"Day 1",
      "plan":"Detailed realistic itinerary"
    },
    {
      "day":"Day 2",
      "plan":"Detailed realistic itinerary"
    }
  ],

  "sources_used":[
    "TripAdvisor",
    "Booking.com",
    "Google Travel"
  ]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          tools: [
            {
              google_search: {}
            }
          ],

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
      data?.candidates?.[0]?.content?.parts
        ?.filter(p => p.text)
        ?.map(p => p.text)
        ?.join('') || '';

    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON returned');
    }

    const jsonString = text.slice(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(jsonString);

    return res.status(200).json({
      result: parsed
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });

  }
}
