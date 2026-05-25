async function searchDestination() {

  const city = document.getElementById('destinationInput').value;

  const headCount =
    parseInt(document.getElementById('travellerCount').innerText);

  const tier =
    document.getElementById('budgetTier').value;

  try {

    const response = await fetch(
      'https://YOUR-VERCEL-URL.vercel.app/api/search',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          city,
          headCount,
          tier
        })
      }
    );

    const data = await response.json();

    console.log(data);

    if (!data.destination) {
      throw new Error('Invalid API response');
    }

    // DESTINATION SUMMARY

    document.getElementById('destinationTitle').innerText =
      data.destination;

    document.getElementById('summary').innerText =
      data.summary;

    document.getElementById('crowdInsight').innerText =
      data.crowd_insight;

    document.getElementById('travelTip').innerText =
      data.tips;

    // BUDGET

    document.getElementById('minBudget').innerText =
      `₹${data.per_head_min_inr}`;

    document.getElementById('maxBudget').innerText =
      `₹${data.per_head_max_inr}`;

    document.getElementById('tripDuration').innerText =
      data.trip_duration;

    document.getElementById('bestSeason').innerText =
      data.best_season;

    document.getElementById('popularity').innerText =
      `${data.popularity_score}/100`;

    // HOTELS

    const hotelsContainer =
      document.getElementById('hotelsContainer');

    hotelsContainer.innerHTML = '';

    data.hotels.forEach(hotel => {

      hotelsContainer.innerHTML += `
        <div class="hotel-card">

          <h3>${hotel.name}</h3>

          <p>${'⭐'.repeat(hotel.stars)}</p>

          <p>${hotel.price_per_night}</p>

          <p>${hotel.highlight}</p>

        </div>
      `;
    });

    // FLIGHTS

    const flightsContainer =
      document.getElementById('flightsContainer');

    flightsContainer.innerHTML = '';

    data.flights.forEach(flight => {

      flightsContainer.innerHTML += `
        <div class="flight-card">

          <h3>${flight.airline}</h3>

          <p>${flight.route}</p>

          <p>${flight.price}</p>

          <p>${flight.type}</p>

        </div>
      `;
    });

    // ITINERARY

    const itineraryContainer =
      document.getElementById('itineraryContainer');

    itineraryContainer.innerHTML = '';

    data.itinerary.forEach(item => {

      itineraryContainer.innerHTML += `
        <div class="itinerary-card">

          <h3>${item.day}</h3>

          <p>${item.plan}</p>

        </div>
      `;
    });

    // SOURCES

    document.getElementById('sources').innerText =
      data.sources_used.join(', ');

  } catch (err) {

    console.error(err);

    document.getElementById('summary').innerHTML = `
      <div style="
        background:#fff0f0;
        color:#b42318;
        padding:20px;
        border-radius:14px;
      ">
        ⚠️ ${err.message}
      </div>
    `;
  }
}
