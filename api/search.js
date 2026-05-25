export default async function handler(req, res) {
  // CORS
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

    if (!city) {
      return res.status(400).json({
        error: 'City is required'
      });
    }

    // Budget tier descriptions
    const tierDesc = {
      cheap:
        'budget backpacker, hostels, cheap hotels, street food, low budget travel',

      luxury:
        '4-5 star hotels, premium dining, luxury transport, comfortable trip',

      ultra:
        'ultra luxury resorts, private villas, premium suites, butler service, no budget limit'
    };

    // Gemini Prompt
    const prompt = `
You are an expert AI travel planner.

Destination: "${city}"
Travellers: ${headCount}
Budget Tier: ${tier} (${tierDesc[tier] || tierDesc.cheap})

Return ONLY VALID JSON.
Do not use markdown.
Do not use backticks.
Do not explain anything.

JSON FORMAT:

{
  "destination": "City, Country",
  "popularity_score": 90,
  "popularity_label": "Very Popular",

  "travelers_monthly": "2 lakh",

  "best_season": "October to March",

  "trip_duration": "4-6 days",

  "per_head_min_inr": 15000,

  "per_head_max_inr": 35000,

  "summary": "Write a detailed but short travel summary.",

  "crowd_insight": "One line about crowd and tourism.",

  "tips": "One useful travel tip.",

  "food_budget": "1500 INR per day",

  "local_transport": "Metro, taxi and local buses available.",

  "hotels": [
    {
      "name": "Hotel Name",
      "stars": 5,
      "price_per_night": "12000 INR",
      "highlight": "Luxury beachfront resort"
    },
    {
      "name": "Hotel Name",
      "stars": 4,
      "price_per_night": "7000 INR",
      "highlight": "Near city center"
    },
    {
      "name": "Hotel Name",
      "stars": 3,
      "price_per_night": "3500 INR",
      "highlight": "Budget friendly stay"
    }
  ],

  "recommended_flights": [
    {
      "airline": "Emirates",
      "route": "Delhi → Destination",
      "price": "28000 INR",
      "duration": "4h 20m"
    },
    {
      "airline": "Air India",
      "route": "Mumbai → Destination",
      "price": "24000 INR",
      "duration": "5h 10m"
    }
  ],

  "top_places": [
    "Place 1",
    "Place 2",
    "Place 3"
  ],

  "itinerary": [
    {
      "day": "Day 1",
      "plan": "Activities for day 1"
    },
    {
      "day": "Day 2",
      "plan": "Activities for day 2"
    },
    {
      "day": "Day 3",
      "plan": "Activities for day 3"
    }
  ],

  "sources_used": [
    "TripAdvisor",
    "Booking.com",
    "MakeMyTrip",
    "Lonely Planet"
  ]
}
`;

    // Gemini API Call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          tools: [{ google_search: {} }],

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

    // Extract Gemini text
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.filter(part => part.text)
        ?.map(part => part.text)
        ?.join('') || '{}';

    // Clean markdown
    const clean = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Extract JSON only
    const match = clean.match(/\{[\s\S]*\}/);

    let result = {};

    try {
      result = JSON.parse(match ? match[0] : clean);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);

      // Fallback
      result = {
        destination: city,

        popularity_score: 75,

        popularity_label: 'Popular',

        travelers_monthly: 'Data unavailable',

        best_season: 'Best season unavailable',

        trip_duration: '3-5 days',

        per_head_min_inr: 15000,

        per_head_max_inr: 30000,

        summary:
          'Unable to fetch complete AI travel data right now. Please try again.',

        crowd_insight:
          'Tourist activity information currently unavailable.',

        tips:
          'Try searching again after some time.',

        food_budget:
          '1500 INR per day',

        local_transport:
          'Taxi and local transport available.',

        hotels: [],

        recommended_flights: [],

        top_places: [],

        itinerary: [],

        sources_used: ['Gemini AI']
      };
    }

    return res.status(200).json({
      result
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message || 'Internal Server Error'
    });
  }
}
