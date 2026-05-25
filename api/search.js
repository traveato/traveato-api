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
  "destination":"Goa, India",

  "popularity_score":92,
  "popularity_label":"Very Popular",

  "travelers_monthly":"4 lakh+",

  "best_season":"November to February",

  "trip_duration":"4-6 days",

  "per_head_min_inr":18000,
  "per_head_max_inr":65000,

  "summary":"Goa is India's top beach destination known for nightlife, beaches, cafes and luxury resorts.",

  "crowd_insight":"Peak season gets crowded during Christmas and New Year.",

  "tips":"Book hotels early during peak season.",

  "hotels":[
    {
      "name":"Taj Fort Aguada Resort & Spa",
      "stars":5,
      "price_per_night":"₹18,000",
      "highlight":"Luxury sea-facing resort"
    },
    {
      "name":"W Goa",
      "stars":5,
      "price_per_night":"₹22,000",
      "highlight":"Luxury beach property"
    },
    {
      "name":"Fairfield by Marriott Goa",
      "stars":4,
      "price_per_night":"₹8,000",
      "highlight":"Affordable premium stay"
    }
  ],

  "flights":[
    {
      "route":"Delhi to Goa",
      "airline":"IndiGo",
      "price":"₹6,500",
      "type":"Direct"
    },
    {
      "route":"Mumbai to Goa",
      "airline":"Air India",
      "price":"₹4,000",
      "type":"Direct"
    }
  ],

  "itinerary":[
    {
      "day":"Day 1",
      "plan":"Arrival and North Goa beaches"
    },
    {
      "day":"Day 2",
      "plan":"Water sports and nightlife"
    },
    {
      "day":"Day 3",
      "plan":"South Goa sightseeing"
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

          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.8,
            topP: 1,
            topK: 40,
            maxOutputTokens: 4096
          }
        })
      }
    );

    const data = await response.json();

    console.log("FULL GEMINI RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

    const parts =
      data?.candidates?.[0]?.content?.parts || [];

    const text = parts
      .map(part => part.text || '')
      .join('');

    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    console.log("CLEANED RESPONSE:");
    console.log(cleaned);

    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {

      return res.status(500).json({
        error: 'No valid JSON returned',
        raw: cleaned
      });

    }

    const parsed = JSON.parse(match[0]);

    return res.status(200).json(parsed);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });

  }
}
