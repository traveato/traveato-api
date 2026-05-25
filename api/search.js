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

Destination: ${city}
Travellers: ${headCount}
Budget tier: ${tier}

JSON format:

{
  "destination":"Dubai, UAE",
  "popularity_score":90,
  "popularity_label":"Very Popular",
  "travelers_monthly":"3 lakh",
  "best_season":"Nov-Mar",
  "trip_duration":"5 days",

  "per_head_min_inr":50000,
  "per_head_max_inr":120000,

  "summary":"Short destination summary.",

  "crowd_insight":"Crowd insight",

  "tips":"Travel tip",

  "hotels":[
    {
      "name":"Atlantis The Palm",
      "stars":5,
      "price_per_night":"₹25,000",
      "highlight":"Luxury beach resort"
    }
  ],

  "itinerary":[
    {
      "day":"Day 1",
      "plan":"Arrival and sightseeing"
    }
  ],

  "sources_used":[
    "TripAdvisor",
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

    let parsed;

    try {

      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON found');
      }

      const jsonString = text.slice(firstBrace, lastBrace + 1);

      parsed = JSON.parse(jsonString);

    } catch (e) {

      parsed = {
        destination: city,
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
          `${city} is a beautiful destination known for tourism, food, attractions and memorable travel experiences.`,

        crowd_insight:
          "Peak season can be crowded. Advance booking recommended.",

        tips:
          "Book hotels early for better prices.",

        hotels: [
          {
            name: `${city} Luxury Stay`,
            stars: 5,
            price_per_night: "₹15,000",
            highlight: "Premium luxury experience"
          },
          {
            name: `${city} Grand Hotel`,
            stars: 4,
            price_per_night: "₹8,000",
            highlight: "Comfortable premium hotel"
          }
        ],

        itinerary: [
          {
            day: "Day 1",
            plan: "Arrival and local sightseeing"
          },
          {
            day: "Day 2",
            plan: "Explore attractions and local food"
          }
        ],

        sources_used: [
          "Google Travel",
          "TripAdvisor"
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
