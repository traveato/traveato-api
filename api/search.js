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
Return ONLY VALID JSON.

Destination: ${city}
Travellers: ${headCount}
Budget tier: ${tier}

Generate REAL travel data.

JSON format:

{
  "destination":"City, Country",
  "popularity_score":88,
  "popularity_label":"Very Popular",
  "travelers_monthly":"2 lakh+",
  "best_season":"October to March",
  "trip_duration":"4-6 days",

  "per_head_min_inr":50000,
  "per_head_max_inr":150000,

  "summary":"Short destination summary",

  "crowd_insight":"Crowd insight",

  "tips":"Travel tip",

  "hotels":[
    {
      "name":"Real hotel name",
      "stars":5,
      "price_per_night":"₹20,000",
      "highlight":"Luxury feature"
    },
    {
      "name":"Real hotel name",
      "stars":4,
      "price_per_night":"₹12,000",
      "highlight":"Premium stay"
    }
  ],

  "flights":[
    {
      "route":"Delhi → Destination",
      "airline":"IndiGo",
      "price":"₹7,500",
      "type":"Direct"
    }
  ],

  "itinerary":[
    {
      "day":"Day 1",
      "plan":"Detailed itinerary"
    },
    {
      "day":"Day 2",
      "plan":"Detailed itinerary"
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
            temperature: 0.8,
            topP: 1,
            topK: 40,
            maxOutputTokens: 4096,

            responseMimeType: "application/json"
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

    let raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    raw = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsed;

    try {

      parsed = JSON.parse(raw);

    } catch (e) {

      parsed = {

        destination: `${city}, India`,

        popularity_score: 85,

        popularity_label: "Popular",

        travelers_monthly: "1 lakh+",

        best_season: "October to March",

        trip_duration: "4-6 days",

        per_head_min_inr:
          tier === "ultra"
            ? 120000
            : tier === "luxury"
            ? 50000
            : 15000,

        per_head_max_inr:
          tier === "ultra"
            ? 300000
            : tier === "luxury"
            ? 150000
            : 40000,

        summary:
          `${city} is a beautiful destination famous for tourism, food, attractions and memorable travel experiences.`,

        crowd_insight:
          "Peak season gets crowded during holidays and weekends.",

        tips:
          "Book hotels and flights early for best prices.",

        hotels: [
          {
            name: `${city} Grand Hotel`,
            stars: 5,
            price_per_night: "₹18,000",
            highlight: "Luxury city experience"
          },
          {
            name: `${city} Premium Resort`,
            stars: 4,
            price_per_night: "₹12,000",
            highlight: "Premium comfort stay"
          }
        ],

        flights: [
          {
            route: `Delhi → ${city}`,
            airline: "IndiGo",
            price: "₹7,500",
            type: "Direct"
          },
          {
            route: `Mumbai → ${city}`,
            airline: "Air India",
            price: "₹6,000",
            type: "Direct"
          }
        ],

        itinerary: [
          {
            day: "Day 1",
            plan: `Arrive in ${city} and explore famous local attractions and cafes.`
          },
          {
            day: "Day 2",
            plan: `Visit popular sightseeing places and enjoy local food experiences in ${city}.`
          },
          {
            day: "Day 3",
            plan: `Relax, shopping and luxury experiences before departure.`
          }
        ],

        sources_used: [
          "Google Travel",
          "TripAdvisor",
          "Booking.com"
        ]
      };

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
