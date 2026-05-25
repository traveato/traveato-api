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
Return ONLY valid JSON.

No markdown.
No explanation.
No backticks.
No extra text.

Destination: ${city}
Travellers: ${headCount}
Budget tier: ${tier}

Generate REAL travel information.

JSON FORMAT:

{
  "destination":"Haridwar, India",

  "popularity_score":85,
  "popularity_label":"Popular",

  "travelers_monthly":"1 lakh+",

  "best_season":"October to March",

  "trip_duration":"4-6 days",

  "per_head_min_inr":15000,
  "per_head_max_inr":40000,

  "summary":"Short realistic summary.",

  "crowd_insight":"Crowd insight.",

  "tips":"Helpful travel tip.",

  "hotels":[
    {
      "name":"Hotel Ganga Lahari",
      "stars":4,
      "price_per_night":"₹7,000",
      "highlight":"River view stay"
    },
    {
      "name":"Amatra By The Ganges",
      "stars":5,
      "price_per_night":"₹15,000",
      "highlight":"Luxury riverside resort"
    }
  ],

  "flights":[
    {
      "route":"Delhi to Dehradun",
      "airline":"IndiGo",
      "price":"₹4,500",
      "type":"Direct"
    }
  ],

  "itinerary":[
    {
      "day":"Day 1",
      "plan":"Arrival and sightseeing"
    },
    {
      "day":"Day 2",
      "plan":"Explore temples and local food"
    }
  ],

  "sources_used":[
    "TripAdvisor",
    "Google Travel",
    "Booking.com"
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

          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 1,
            maxOutputTokens: 4096
          },

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

    console.log(JSON.stringify(data, null, 2));

    const parts =
      data?.candidates?.[0]?.content?.parts || [];

    const text = parts
      .filter(part => part.text)
      .map(part => part.text)
      .join('');

    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {

      return res.status(500).json({
        error: 'No valid JSON returned',
        raw: cleaned
      });

    }

    const parsed = JSON.parse(match[0]);

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
