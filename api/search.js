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

    const cityKey = city.toLowerCase().trim();

    const hotelMap = {

      jaipur: {

        cheap: [
          {
            name: "Zostel Jaipur",
            stars: 3,
            price_per_night: "₹1,200",
            highlight: "Backpacker hostel near Pink City"
          },
          {
            name: "Hotel Pearl Palace",
            stars: 3,
            price_per_night: "₹2,500",
            highlight: "Budget heritage hotel"
          }
        ],

        luxury: [
          {
            name: "Fairmont Jaipur",
            stars: 5,
            price_per_night: "₹22,000",
            highlight: "Luxury heritage resort"
          },
          {
            name: "ITC Rajputana",
            stars: 5,
            price_per_night: "₹18,000",
            highlight: "Premium royal experience"
          }
        ],

        ultra: [
          {
            name: "Rambagh Palace",
            stars: 5,
            price_per_night: "₹55,000",
            highlight: "Royal palace luxury stay"
          },
          {
            name: "The Oberoi Rajvilas",
            stars: 5,
            price_per_night: "₹70,000",
            highlight: "Ultra luxury villa resort"
          }
        ]

      },

      kerala: {

        cheap: [
          {
            name: "The Lost Hostel Kochi",
            stars: 3,
            price_per_night: "₹1,500",
            highlight: "Budget hostel near Fort Kochi"
          },
          {
            name: "Munnar Inn",
            stars: 3,
            price_per_night: "₹2,800",
            highlight: "Affordable tea valley stay"
          }
        ],

        luxury: [
          {
            name: "Kumarakom Lake Resort",
            stars: 5,
            price_per_night: "₹28,000",
            highlight: "Luxury backwater resort"
          },
          {
            name: "Le Meridien Kochi",
            stars: 5,
            price_per_night: "₹16,000",
            highlight: "Premium waterfront hotel"
          }
        ],

        ultra: [
          {
            name: "The Leela Kovalam",
            stars: 5,
            price_per_night: "₹35,000",
            highlight: "Cliffside sea-view luxury"
          },
          {
            name: "Niraamaya Retreats",
            stars: 5,
            price_per_night: "₹48,000",
            highlight: "Private Ayurvedic luxury retreat"
          }
        ]

      },

      goa: {

        cheap: [
          {
            name: "Pappi Chulo Hostel",
            stars: 3,
            price_per_night: "₹1,400",
            highlight: "Budget party hostel"
          },
          {
            name: "Whoopers Hostel Goa",
            stars: 3,
            price_per_night: "₹2,000",
            highlight: "Affordable beach stay"
          }
        ],

        luxury: [
          {
            name: "Taj Exotica Goa",
            stars: 5,
            price_per_night: "₹24,000",
            highlight: "Luxury sea-facing resort"
          },
          {
            name: "Grand Hyatt Goa",
            stars: 5,
            price_per_night: "₹18,000",
            highlight: "Premium bay resort"
          }
        ],

        ultra: [
          {
            name: "W Goa",
            stars: 5,
            price_per_night: "₹35,000",
            highlight: "Ultra luxury beach resort"
          },
          {
            name: "The St Regis Goa",
            stars: 5,
            price_per_night: "₹42,000",
            highlight: "Private luxury golf resort"
          }
        ]

      }

    };

    const itineraryMap = {

      jaipur: [
        {
          day: "Day 1",
          plan: "Visit City Palace, Hawa Mahal and rooftop dinner in Pink City."
        },
        {
          day: "Day 2",
          plan: "Explore Amer Fort, Jal Mahal and luxury shopping at Johari Bazaar."
        },
        {
          day: "Day 3",
          plan: "Heritage café hopping and sunset at Nahargarh Fort."
        }
      ],

      kerala: [
        {
          day: "Day 1",
          plan: "Arrival in Kochi and Fort Kochi sightseeing."
        },
        {
          day: "Day 2",
          plan: "Backwater houseboat experience in Alleppey."
        },
        {
          day: "Day 3",
          plan: "Munnar tea gardens and waterfall exploration."
        }
      ],

      goa: [
        {
          day: "Day 1",
          plan: "Beach relaxation and sunset at Baga Beach."
        },
        {
          day: "Day 2",
          plan: "Water sports and nightlife at Tito’s Lane."
        },
        {
          day: "Day 3",
          plan: "Old Goa churches and café hopping in Assagao."
        }
      ]

    };

    const budgetMap = {

      cheap: {
        min: 15000,
        max: 40000,
        label: "Cheap"
      },

      luxury: {
        min: 50000,
        max: 150000,
        label: "Luxury"
      },

      ultra: {
        min: 120000,
        max: 300000,
        label: "Ultra Luxury"
      }

    };

    const selectedBudget =
      budgetMap[tier] || budgetMap.cheap;

    const result = {

      destination: `${city}, India`,

      popularity_score: 85,

      popularity_label: "Popular",

      travelers_monthly: "1 lakh+",

      best_season: "October to March",

      trip_duration: "4-6 days",

      per_head_min_inr: selectedBudget.min,

      per_head_max_inr: selectedBudget.max,

      summary:
        `${city} is a premium travel destination known for sightseeing, culture and memorable experiences.`,

      crowd_insight:
        "Peak season can get crowded during holidays.",

      tips:
        "Book hotels and flights early for best prices.",

      hotels:
        hotelMap[cityKey]?.[tier] || [
          {
            name: `${city} Residency`,
            stars: 4,
            price_per_night: "₹8,000",
            highlight: "Comfortable city stay"
          },
          {
            name: `${city} Palace Hotel`,
            stars: 5,
            price_per_night: "₹18,000",
            highlight: "Luxury premium resort"
          }
        ],

      flights: [
        {
          route: "Delhi to " + city,
          airline: "IndiGo",
          price: "₹5,500",
          type: "Direct"
        },
        {
          route: "Mumbai to " + city,
          airline: "Air India",
          price: "₹7,200",
          type: "Direct"
        }
      ],

      itinerary:
        itineraryMap[cityKey] || [
          {
            day: "Day 1",
            plan: `Arrival and sightseeing in ${city}.`
          },
          {
            day: "Day 2",
            plan: `Explore famous attractions and local food in ${city}.`
          },
          {
            day: "Day 3",
            plan: `Shopping and cultural exploration in ${city}.`
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
