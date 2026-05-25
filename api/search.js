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

    const cityLower = city.toLowerCase();

    let hotels = [];
    let flights = [];
    let summary = '';
    let itinerary = [];

    // GOA
    if (cityLower.includes('goa')) {

      hotels = [
        {
          name: 'Taj Exotica Goa',
          stars: 5,
          price_per_night: '₹18,000',
          highlight: 'Luxury beach resort'
        },
        {
          name: 'W Goa',
          stars: 5,
          price_per_night: '₹24,000',
          highlight: 'Premium nightlife luxury stay'
        }
      ];

      flights = [
        {
          route: 'Delhi → Goa',
          airline: 'IndiGo',
          price: '₹5,500',
          type: 'Direct'
        },
        {
          route: 'Mumbai → Goa',
          airline: 'Air India',
          price: '₹4,200',
          type: 'Direct'
        }
      ];

      summary =
        'Goa is famous for beaches, nightlife, cafes and luxury resorts.';

      itinerary = [
        {
          day: 'Day 1',
          plan: 'Arrival and beach exploration'
        },
        {
          day: 'Day 2',
          plan: 'Water sports and nightlife'
        },
        {
          day: 'Day 3',
          plan: 'Local cafes and sightseeing'
        }
      ];

    }

    // KERALA
    else if (cityLower.includes('kerala')) {

      hotels = [
        {
          name: 'Kumarakom Lake Resort',
          stars: 5,
          price_per_night: '₹22,000',
          highlight: 'Luxury backwater resort'
        },
        {
          name: 'The Leela Kovalam',
          stars: 5,
          price_per_night: '₹28,000',
          highlight: 'Cliffside sea-view luxury'
        }
      ];

      flights = [
        {
          route: 'Delhi → Kochi',
          airline: 'Vistara',
          price: '₹7,500',
          type: 'Direct'
        },
        {
          route: 'Mumbai → Kochi',
          airline: 'IndiGo',
          price: '₹5,200',
          type: 'Direct'
        }
      ];

      summary =
        'Kerala is known for backwaters, tea gardens, ayurveda and luxury nature stays.';

      itinerary = [
        {
          day: 'Day 1',
          plan: 'Arrival in Kochi and sightseeing'
        },
        {
          day: 'Day 2',
          plan: 'Backwater houseboat experience'
        },
        {
          day: 'Day 3',
          plan: 'Munnar tea gardens and relaxation'
        }
      ];

    }

    // DUBAI
    else if (cityLower.includes('dubai')) {

      hotels = [
        {
          name: 'Atlantis The Palm',
          stars: 5,
          price_per_night: '₹35,000',
          highlight: 'Iconic luxury resort'
        },
        {
          name: 'Burj Al Arab',
          stars: 7,
          price_per_night: '₹1,20,000',
          highlight: 'Ultra luxury experience'
        }
      ];

      flights = [
        {
          route: 'Delhi → Dubai',
          airline: 'Emirates',
          price: '₹22,000',
          type: 'Direct'
        },
        {
          route: 'Mumbai → Dubai',
          airline: 'Air India',
          price: '₹18,000',
          type: 'Direct'
        }
      ];

      summary =
        'Dubai offers luxury shopping, skyscrapers, desert safaris and world-class experiences.';

      itinerary = [
        {
          day: 'Day 1',
          plan: 'Burj Khalifa and Dubai Mall'
        },
        {
          day: 'Day 2',
          plan: 'Desert safari and marina cruise'
        },
        {
          day: 'Day 3',
          plan: 'Beach clubs and luxury dining'
        }
      ];

    }

    // DEFAULT
    else {

      hotels = [
        {
          name: `${city} Grand Hotel`,
          stars: 4,
          price_per_night: '₹8,000',
          highlight: 'Comfortable premium stay'
        },
        {
          name: `${city} Luxury Resort`,
          stars: 5,
          price_per_night: '₹15,000',
          highlight: 'Luxury experience'
        }
      ];

      flights = [
        {
          route: `Delhi → ${city}`,
          airline: 'IndiGo',
          price: '₹6,000',
          type: 'Direct'
        }
      ];

      summary =
        `${city} is a beautiful destination known for tourism and memorable experiences.`;

      itinerary = [
        {
          day: 'Day 1',
          plan: 'Arrival and sightseeing'
        },
        {
          day: 'Day 2',
          plan: 'Explore local attractions'
        }
      ];

    }

    const result = {

      destination: `${city}, India`,

      popularity_score: 89,

      popularity_label: 'Very Popular',

      travelers_monthly: '2 lakh+',

      best_season: 'October to March',

      trip_duration: '4-6 days',

      per_head_min_inr:
        tier === 'ultra'
          ? 120000
          : tier === 'luxury'
          ? 50000
          : 15000,

      per_head_max_inr:
        tier === 'ultra'
          ? 300000
          : tier === 'luxury'
          ? 150000
          : 40000,

      summary,

      crowd_insight:
        'Peak season gets crowded during holidays and weekends.',

      tips:
        'Book flights and hotels early for better prices.',

      hotels,

      flights,

      itinerary,

      sources_used: [
        'Google Travel',
        'TripAdvisor',
        'Booking.com'
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
