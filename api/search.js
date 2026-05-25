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
Return ONLY pure valid JSON.

NO markdown.
NO explanation.
NO backticks.
NO extra text.

Destination: ${city}
Travellers: ${headCount}
Budget: ${tier}

Generate REAL travel data.

JSON format:

{
  "destination":"Haridwar, India",
  "popularity_score":85,
  "popularity_label":"Popular",
  "travelers_monthly":"1 lakh+",
  "best_season":"October to March",
  "trip_duration":"3-5 days",

  "per_head_min_inr":15000,
  "per_head_max_inr":40000,

  "summary":"Destination summary",

  "crowd_insight":"Crowd insight",

  "tips":"Travel tip",

  "hotels":[
    {
      "name":"Hotel Ganga Lahari",
      "stars":4,
      "price_per_night":"₹7,000",
      "highlight":"Ganga river view"
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
      "plan":"Arrival and Ganga Aarti"
    },
    {
      "day":"Day 2",
      "plan":"Temple visits and local food"
    }
  ],

  "sources_used":[
    "TripAdvisor",
    "Google Travel"
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
            temperature: 0.7,
            topK: 32,
            topP: 1,
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

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsed;

    try {

      parsed = JSON.parse(cleaned);

    } catch (jsonError) {

      console.log(cleaned);

      return res.status(500).json({
        error: 'No valid JSON returned',
        raw: cleaned
      });
    }

    return res.status(200).json({
      result: parsed
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }
}
