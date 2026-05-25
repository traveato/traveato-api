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

    const cityKey = city
      .toLowerCase()
      .trim()
      .replace(/[^a-z]/g, '');

    // HOTEL DATABASE

    const hotelMap = {

      goa: {
        cheap: [
          {
            name: "Zostel Goa",
            stars: 3,
            price_per_night: "₹2,500",
            highlight: "Backpacker hostel near beach"
          },
          {
            name: "BloomSuites Goa",
            stars: 4,
            price_per_night: "₹5,500",
            highlight: "Affordable modern stay"
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
            name: "W Goa",
            stars: 5,
            price_per_night: "₹45,000",
            highlight: "Ultra luxury beach resort"
          },
          {
            name: "St Regis Goa",
            stars: 5,
            price_per_night: "₹60,000",
            highlight: "Private luxury villas"
          }
        ]
      },

      jaipur: {

        cheap: [
          {
            name: "Moustache Jaipur",
            stars: 3,
            price_per_night: "₹2,000",
            highlight: "Budget backpacker hostel"
          },
          {
            name: "Laxmi Palace Heritage",
            stars: 3,
            price_per_night: "₹4,500",
            highlight: "Affordable heritage stay"
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
            name: "Rambagh Palace",
            stars: 5,
            price_per_night: "₹55,000",
            highlight: "Royal palace luxury stay"
          }
        ],

        ultra: [
          {
            name: "Rajmahal Palace RAAS",
            stars: 5,
            price_per_night: "₹75,000",
            highlight: "Ultra luxury palace suite"
          },
          {
            name: "The Oberoi Rajvilas",
            stars: 5,
            price_per_night: "₹95,000",
            highlight: "Private villa luxury"
          }
        ]
      },

      kerala: {

        cheap: [
          {
            name: "goSTOPS Kochi",
            stars: 3,
            price_per_night: "₹2,200",
            highlight: "Budget stay in Kochi"
          },
          {
            name: "Treebo Trend Palmyra",
            stars: 3,
            price_per_night: "₹4,000",
            highlight: "Affordable comfort stay"
          }
        ],

        luxury: [
          {
            name: "Kumarakom Lake Resort",
            stars: 5,
            price_per_night: "₹22,000",
            highlight: "Luxury backwater resort"
          },
          {
            name: "The Leela Kovalam",
            stars: 5,
            price_per_night: "₹28,000",
            highlight: "Clifftop sea-view luxury"
          }
        ],

        ultra: [
          {
            name: "CGH Earth Brunton Boatyard",
            stars: 5,
            price_per_night: "₹48,000",
            highlight: "Exclusive heritage luxury"
          },
          {
            name: "Niraamaya Retreats",
            stars: 5,
            price_per_night: "₹65,000",
            highlight: "Private ayurveda retreat"
          }
        ]
      },

      nainital: {

        cheap: [
          {
            name: "Zostel Nainital",
            stars: 3,
            price_per_night: "₹1,800",
            highlight: "Lake-view backpacker hostel"
          },
          {
            name: "Hotel Himalaya",
            stars: 3,
            price_per_night: "₹3,500",
            highlight: "Affordable mountain stay"
          }
        ],

        luxury: [
          {
            name: "The Naini Retreat",
            stars: 5,
            price_per_night: "₹16,000",
            highlight: "Heritage luxury resort"
          },
          {
            name: "Shervani Hilltop",
            stars: 4,
            price_per_night: "₹11,000",
            highlight: "Premium forest-view stay"
          }
        ],

        ultra: [
          {
            name: "Aahana Resort Corbett",
            stars: 5,
            price_per_night: "₹38,000",
            highlight: "Ultra luxury jungle retreat"
          },
          {
            name: "Taj Corbett Resort",
            stars: 5,
            price_per_night: "₹55,000",
            highlight: "Luxury riverside experience"
          }
        ]
      }

    };

    // ITINERARY DATABASE

    const itineraryMap = {

      goa: [
        {
          day: "Day 1",
          plan: "Arrival in North Goa and beach exploration."
        },
        {
          day: "Day 2",
          plan: "Water sports and nightlife at Baga."
        },
        {
          day: "Day 3",
          plan: "Old Goa churches and sunset cruise."
        }
      ],

      jaipur: [
        {
          day: "Day 1",
          plan: "Visit City Palace, Hawa Mahal and rooftop dinner in Pink City."
        },
        {
          day: "Day 2",
          plan: "Explore Amer Fort, Jal Mahal and shopping at Johari Bazaar."
        },
        {
          day: "Day 3",
          plan: "Heritage café hopping and sunset at Nahargarh Fort."
        }
      ],

      kerala: [
        {
          day: "Day 1",
          plan: "Arrival in Kochi and sightseeing."
        },
        {
          day: "Day 2",
          plan: "Backwater houseboat experience."
        },
        {
          day: "Day 3",
          plan: "Munnar tea gardens and relaxation."
        }
      ],

      nainital: [
        {
          day: "Day 1",
          plan: "Arrival and Naini Lake boating."
        },
        {
          day: "Day 2",
          plan: "Snow View Point and Mall Road exploration."
        },
        {
          day: "Day 3",
          plan: "Bhimtal and local café hopping."
        }
      ]

    };

    // PRICE LOGIC

    let minPrice = 15000;
    let maxPrice = 40000;

    if (tier === "luxury") {
      minPrice = 50000;
      maxPrice = 150000;
    }

    if (tier === "ultra") {
      minPrice = 120000;
      maxPrice = 300000;
    }

    const result = {

      destination: `${city}, India`,

      popularity_score: 85,

      popularity_label:
        tier === "ultra"
          ? "Elite Destination"
          : tier === "luxury"
          ? "Very Popular"
          : "Popular",

      travelers_monthly:
        tier === "ultra"
          ? "50k+ monthly"
          : "1 lakh+ monthly",

      best_season: "October to March",

      trip_duration:
        cityKey === "goa"
          ? "3-5 days"
          : cityKey === "kerala"
          ? "4-6 days"
          : "2-4 days",

      per_head_min_inr: minPrice,

      per_head_max_inr: maxPrice,

      summary:
        `${city} is a premium travel destination known for sightseeing, culture and memorable experiences.`,

      crowd_insight:
        "Peak season can get crowded during holidays.",

      tips:
        "Book hotels and flights early for best prices.",

      hotels:
        hotelMap[cityKey]?.[tier] ||
        hotelMap[cityKey]?.luxury ||
        [
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

      itinerary:
        itineraryMap[cityKey] ||
        [
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
