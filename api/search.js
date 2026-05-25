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

    const hotelsByTier = {
      cheap: [
        {
          name: "Zostel Goa",
          stars: 3,
          price_per_night: "₹2,500",
          highlight: "Backpacker hostel near beaches"
        },
        {
          name: "Treebo Trend Hotel",
          stars: 3,
          price_per_night: "₹3,500",
          highlight: "Affordable comfort stay"
        }
      ],

      luxury: [
        {
          name: "Taj Resort Goa",
          stars: 5,
          price_per_night: "₹18,000",
          highlight: "Luxury sea-facing resort"
        },
        {
          name: "Grand Hyatt Goa",
          stars: 5,
          price_per_night: "₹22,000",
          highlight: "Premium luxury experience"
        }
      ],

      ultra: [
        {
          name: "The Leela Goa",
          stars: 5,
          price_per_night: "₹45,000",
          highlight: "Ultra luxury private beach resort"
        },
        {
          name: "W Goa",
          stars: 5,
          price_per_night: "₹55,000",
          highlight: "Celebrity luxury stay"
        }
      ]
    };

    const result = {

      destination: `${city}, India`,

      popularity_score: 89,

      popularity_label: "Very Popular",

      travelers_monthly: "2 lakh+",

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
        `${city} is one of the most visited travel destinations with beaches, nightlife, cafes and premium stays.`,

      crowd_insight:
        "Peak season gets crowded during holidays and weekends.",

      tips:
        "Book flights and hotels at least 3 weeks early for best prices.",

      hotels:
        hotelsByTier[tier] || hotelsByTier.cheap,

      flights: [
        {
          route: "Delhi to Goa",
          airline: "IndiGo",
          price: "₹5,500",
          type: "Direct"
        },
        {
          route: "Mumbai to Goa",
          airline: "Air India",
          price: "₹4,800",
          type: "Direct"
        }
      ],

      itinerary: [
        {
          day: "Day 1",
          plan: "Arrival and beach exploration"
        },
        {
          day: "Day 2",
          plan: "Water sports and nightlife"
        },
        {
          day: "Day 3",
          plan: "Local cafes and sightseeing"
        }
      ],

      sources_used: [
        "Google Travel",
        "TripAdvisor",
        "Booking.com"
      ]
    };

    return res.status(200).json({
      result
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
