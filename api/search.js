export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { city, headCount, tier } = req.body;

    if (!city) {
      return res.status(400).json({
        error: 'City is required'
      });
    }

    const tierInfo = {
      cheap: `
Budget traveller.
Hostels, cheap hotels, local transport, street food.
Budget range: 15000-30000 INR.
`,
      luxury: `
Luxury traveller.
4-5 star hotels, premium dining, private transport.
Budget range: 50000-150000 INR.
`,
      ultra: `
Ultra luxury traveller.
Luxury resorts, suites, business class flights, fine dining.
Budget range: 200000+ INR.
`
    };

    const prompt = `
You are an expert luxury travel planner.

Generate ONLY valid JSON.
No markdown.
No explanations.
No backticks.

Destination city: ${city}
Travellers: ${headCount}
Budget tier: ${tier}

Tier details:
${tierInfo[tier] || tierInfo.cheap}

Return this EXACT JSON structure:

{
  "destination": "City, Country",
  "popularity_score": 88,
  "popularity_label": "Very Popular",
  "travelers_monthly": "2.5 lakh",
  "best_season": "October to March",
  "trip_duration": "5-7 days",

  "per_head_min_inr": 25000,
  "per_head_max_inr": 60000,

  "summary": "Detailed destination summary.",
  "crowd_insight": "Tourist crowd insight.",
  "tips": "Professional travel tip.",

  "hotels": [
    {
      "name": "Hotel Name",
      "stars": 5,
      "price_per_night": "₹15,000-₹25,000",
      "highlight": "Luxury beach resort"
    }
  ],

  "flights": [
    {
      "route": "Delhi → Dubai",
      "airline": "Emirates",
      "price": "₹28,000",
      "type": "Round trip economy"
    },
    {
      "route": "Delhi → Dubai",
      "airline": "Air India",
      "price": "₹22,000",
      "type": "Direct flight"
    }
  ],

  "places_to_visit": [
    "Burj Khalifa",
    "Palm Jumeirah",
    "Dubai Marina"
  ],

  "foods_to_try": [
    "Shawarma",
    "Kunafa",
    "Arabic BBQ"
  ],

  "itinerary": [
    {
      "day": "Day 1",
      "plan": "Arrival and local sightseeing"
    },
    {
      "day": "Day 2",
      "plan": "Main attractions and activities"
    }
  ],

  "sources_used": [
    "TripAdvisor",
    "Booking.com",
    "Google Travel",
    "Lonely Planet"
  ]
}

IMPORTANT:
- Return REALISTIC data
- Never return undefined
- Always fill every field
- Hotels must be real
- Flights must be realistic
- JSON only
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
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096
          }
        })
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text || '')
        ?.join('') || '';

    const clean = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatch = clean.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({
        error: 'Invalid AI response',
        raw: clean
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      result: parsed
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
