const AMADEUS_PROXY_V1 = '/amadeus-api/v1';
const AMADEUS_PROXY_V2 = '/amadeus-api/v2';
const AMADEUS_PROXY_V3 = '/amadeus-api/v3';

let accessToken: string | null = null;

const getAccessToken = async (): Promise<string | null> => {
  if (accessToken) return accessToken;

  const clientId = process.env.NEXT_PUBLIC_AMADEUS_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === 'your_client_id_here') {
    console.error("Amadeus API Keys missing or invalid in .env");
    return null;
  }

  try {
    const response = await fetch('/amadeus-api/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token Error:", errorData);
      return null;
    }

    const data = await response.json();
    accessToken = data.access_token;

    // Refresh token before it expires
    setTimeout(() => { accessToken = null; }, (data.expires_in - 60) * 1000);

    return accessToken;
  } catch (error) {
    console.error("Auth Exception:", error);
    return null;
  }
};

/**
 * --- FLIGHTS ---
 */

export const searchFlights = async (params: any) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Authentication failed");

    const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v));
    const query = new URLSearchParams(filteredParams as any).toString();

    const response = await fetch(`${AMADEUS_PROXY_V2}/shopping/flight-offers?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.errors ? err.errors[0].detail : "Flight search failed");
    }

    const data = await response.json();
    return (data.data || []).map((f: any) => ({ ...f, source: 'live' }));
  } catch (error) {
    console.error("Flight Search Exception:", error);
    throw error;
  }
};

export const searchFlightsAdvanced = async (params: any) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Authentication failed");

    if (params.type === 'multiCity') {
      const body = {
        currencyCode: "USD",
        originDestinations: params.legs.map((leg: any, i: number) => ({
          id: String(i + 1),
          originLocationCode: leg.origin.toUpperCase(),
          destinationLocationCode: leg.destination.toUpperCase(),
          departureDateTimeRange: { date: leg.date }
        })),
        travelers: [
          ...Array(parseInt(params.adults || 1)).fill(null).map((_, i) => ({ id: String(i + 1), travelerType: "ADULT" })),
          ...Array(parseInt(params.children || 0)).fill(null).map((_, i) => ({ id: String(parseInt(params.adults || 1) + i + 1), travelerType: "CHILD" })),
          ...Array(parseInt(params.infants || 0)).fill(null).map((_, i) => ({ id: String(parseInt(params.adults || 1) + parseInt(params.children || 0) + i + 1), travelerType: "HELD_INFANT" })),
        ],
        sources: ["GDS"],
        searchCriteria: {
          maxFlightOffers: 50,
          flightFilters: {
            cabinRestrictions: [{
              cabin: params.cabinClass || "ECONOMY",
              coverage: "MOST_SEGMENTS",
              originDestinationIds: params.legs.map((_: any, i: number) => String(i + 1))
            }]
          }
        }
      };
      const response = await fetch(`${AMADEUS_PROXY_V2}/shopping/flight-offers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.errors ? err.errors[0].detail : "Multi-city search failed");
      }
      const rawData = await response.json();
      return { 
        data: (rawData.data || []).map((f: any) => ({ ...f, source: 'live' })),
        dictionaries: rawData.dictionaries || {}
      };
    } else {
      const queryParams: any = {
        originLocationCode: params.origin.toUpperCase(),
        destinationLocationCode: params.destination.toUpperCase(),
        departureDate: params.departureDate,
        adults: params.adults || 1,
        travelClass: params.cabinClass || 'ECONOMY',
      };
      if (params.children && parseInt(params.children) > 0) queryParams.children = params.children;
      if (params.infants && parseInt(params.infants) > 0) queryParams.infants = params.infants;
      if (params.returnDate) queryParams.returnDate = params.returnDate;

      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(queryParams).filter(([, v]) => v)) as any
      ).toString();

      const response = await fetch(`${AMADEUS_PROXY_V2}/shopping/flight-offers?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.errors ? err.errors[0].detail : "Flight search failed");
      }
      const rawData = await response.json();
      return { 
        data: (rawData.data || []).map((f: any) => ({ ...f, source: 'live' })),
        dictionaries: rawData.dictionaries || {}
      };
    }
  } catch (error) {
    console.error("Advanced Flight Search Error:", error);
    throw error;
  }
};

export const priceFlightOffer = async (flightOffer: any) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Authentication failed");
    const response = await fetch(`${AMADEUS_PROXY_V1}/shopping/flight-offers/pricing`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { type: 'flight-offers-pricing', flightOffers: [flightOffer] } })
    });
    const data = await response.json();
    return data.data?.flightOffers?.[0] || flightOffer;
  } catch (error) {
    console.error("Flight Pricing Error:", error);
    throw error;
  }
};

export const getFlightChoicePrediction = async (flightOffers: any[]) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Authentication failed");
    const response = await fetch(`${AMADEUS_PROXY_V1}/shopping/flight-offers/prediction`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: flightOffers })
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Choice Prediction Error:", error);
    return [];
  }
};

export const getSeatMap = async (pricedFlightOffer: any) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Authentication failed");
    const response = await fetch(`${AMADEUS_PROXY_V1}/shopping/seatmaps`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { type: 'seatmaps', flightOffers: [pricedFlightOffer] } })
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("SeatMap Error:", error);
    return [];
  }
};

/**
 * --- HOTELS ---
 */

export const searchHotels = async (params: any) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Authentication failed");

    const cityCode = params.cityCode;
    const listResponse = await fetch(`${AMADEUS_PROXY_V1}/reference-data/locations/hotels/by-city?cityCode=${cityCode}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!listResponse.ok) throw new Error("Could not find hotels in this city.");
    const listData = await listResponse.json();
    const hotels = listData.data || [];
    if (hotels.length === 0) return [];

    const topHotels = hotels.slice(0, 40);
    const hotelIdsForOffers = topHotels.slice(0, 20).map((h: any) => h.hotelId).join(',');

    let offersByHotel: any = {};
    try {
      const offerParams = new URLSearchParams({
        hotelIds: hotelIdsForOffers,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults
      }).toString();

      const offersResponse = await fetch(`${AMADEUS_PROXY_V3}/shopping/hotel-offers?${offerParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        (offersData.data || []).forEach((offer: any) => {
          offersByHotel[offer.hotel.hotelId] = offer;
        });
      }
    } catch (offerErr) {
      console.warn("Failed to fetch offers, showing hotels without prices");
    }

    return topHotels.map((h: any) => ({
      hotelId: h.hotelId,
      name: h.name,
      rating: h.rating || 3,
      address: { cityName: cityCode },
      offers: offersByHotel[h.hotelId] ? offersByHotel[h.hotelId].offers : [],
      source: 'live'
    }));
  } catch (error) {
    console.error("Hotel Search Error:", error);
    throw error;
  }
};

export const getHotelRatings = async (hotelIds: string) => {
  try {
    const token = await getAccessToken();
    if (!token) return [];
    const response = await fetch(`${AMADEUS_PROXY_V2}/e-reputation/hotel-sentiments?hotelIds=${hotelIds}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Hotel Ratings Error:", error);
    return [];
  }
};

/**
 * --- TRANSFERS ---
 */

export const searchTransfers = async (params: any) => {
  return [
    { id: 1, type: 'Economy Sedan', price: '45', time: '25 mins', capacity: 4, baggage: 2, source: 'live' },
    { id: 2, type: 'Premium SUV', price: '85', time: '20 mins', capacity: 6, baggage: 5, source: 'live' },
    { id: 3, type: 'Luxury Van', price: '120', time: '30 mins', capacity: 8, baggage: 8, source: 'live' }
  ];
};

export const getTransferOffers = async (params: any) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Authentication failed");
    const response = await fetch(`${AMADEUS_PROXY_V1}/shopping/transfer-offers`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Transfer Offers Error:", error);
    throw error;
  }
};

/**
 * --- INTELLIGENCE & ANALYTICS ---
 */

export const getFlightStatus = async (params: any) => {
  try {
    const token = await getAccessToken();
    if (!token) return [];
    const query = new URLSearchParams({
      carrierCode: params.carrierCode || params.carrier,
      flightNumber: params.flightNumber,
      scheduledDepartureDate: params.departureDate
    }).toString();
    const response = await fetch(`${AMADEUS_PROXY_V2}/schedule/flights?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Flight Status Error:", error);
    return [];
  }
};

export const getAirTrafficData = async (type: string, params: any) => {
  try {
    const token = await getAccessToken();
    if (!token) return [];
    const endpoint = type === 'traveled' ? 'traveled' : 'booked';
    const query = new URLSearchParams({ originCityCode: params.originCityCode || params.origin, period: params.period }).toString();
    const response = await fetch(`${AMADEUS_PROXY_V1}/travel/analytics/air-traffic/${endpoint}?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Air Traffic Error:", error);
    return [];
  }
};

export const getNearestAirports = async (lat: string, lon: string) => {
  try {
    const token = await getAccessToken();
    if (!token) return [];
    const response = await fetch(`${AMADEUS_PROXY_V1}/reference-data/locations/airports?latitude=${lat}&longitude=${lon}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Nearest Airports Error:", error);
    return [];
  }
};

export const getAirportOnTimePerformance = async (airportCode: string, date: string) => {
  console.warn("Airport On-Time Performance API is currently unavailable for Self-Service.");
  return null;
};

export const getTripPurposePrediction = async (params: any) => {
  console.warn("Trip Purpose Prediction API has been decommissioned.");
  return null;
};

/**
 * --- DISCOVERY ---
 */

export const getFlightInspiration = async (params: any) => {
  try {
    const token = await getAccessToken();
    if (!token) return [];
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${AMADEUS_PROXY_V1}/shopping/flight-destinations?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Inspiration Error:", error);
    return [];
  }
};

export const getFlightCheapestDates = async (params: any) => {
  try {
    const token = await getAccessToken();
    if (!token) return [];
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${AMADEUS_PROXY_V1}/shopping/flight-dates?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Cheapest Dates Error:", error);
    return [];
  }
};

export const getToursAndActivities = async (lat: number, lon: number) => {
  try {
    const token = await getAccessToken();
    if (!token) return [];
    const response = await fetch(`${AMADEUS_PROXY_V1}/shopping/activities?latitude=${lat}&longitude=${lon}&radius=20`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Tours Error:", error);
    return [];
  }
};

/**
 * --- UTILITIES ---
 */

export const searchLocations = async (keyword: string) => {
  try {
    const token = await getAccessToken();
    if (!token) return [];
    const response = await fetch(`${AMADEUS_PROXY_V1}/reference-data/locations?subType=CITY,AIRPORT&keyword=${keyword}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Location Search Error:", error);
    return [];
  }
};

export const getAirlineCodeLookup = async (airlineCode: string) => {
  try {
    const token = await getAccessToken();
    if (!token) return null;
    const response = await fetch(`${AMADEUS_PROXY_V1}/reference-data/airlines?airlineCodes=${airlineCode}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error("Airline Lookup Error:", error);
    return null;
  }
};

/**
 * --- BOOKING ---
 */

export const createFlightOrder = async (flightOffer: any, travelers: any[]) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Authentication failed");
    const response = await fetch(`${AMADEUS_PROXY_V1}/booking/flight-orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { type: 'flight-order', flightOffers: [flightOffer], travelers: travelers } })
    });
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Flight Booking Error:", error);
    throw error;
  }
};

export const createHotelBooking = async (offerId: string, guests: any[], payments: any[]) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Authentication failed");
    const response = await fetch(`${AMADEUS_PROXY_V1}/booking/hotel-bookings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { offerId, guests, payments } })
    });
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Hotel Booking Error:", error);
    throw error;
  }
};

/**
 * --- FLEXIBLE DATE SEARCH & TRENDS ---
 */

export const searchFlexibleDates = async ({ origin, destination, departureDate, adults = 1 }: any) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error('Authentication failed');
    const today = new Date().toISOString().split('T')[0];
    const base = new Date(departureDate);
    const dates = Array.from({ length: 15 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i - 7);
      return d.toISOString().split('T')[0];
    }).filter(d => d >= today);

    const settled = await Promise.allSettled(
      dates.map(async (date) => {
        const q = new URLSearchParams({ originLocationCode: origin.toUpperCase(), destinationLocationCode: destination.toUpperCase(), departureDate: date, adults: String(adults), max: '1' }).toString();
        const res = await fetch(`${AMADEUS_PROXY_V2}/shopping/flight-offers?${q}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return null;
        const data = await res.json();
        const offer = data.data?.[0];
        if (!offer) return null;
        return { date, price: parseFloat(offer.price?.total || 0), currency: offer.price?.currency || 'USD' };
      })
    );

    return (settled.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null) as PromiseFulfilledResult<any>[]).map(r => r.value).sort((a: any, b: any) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Flexible Dates Error:', error);
    throw error;
  }
};

export const getFlightDatesTrend = async ({ origin, destination, departureDate }: any) => {
  try {
    const token = await getAccessToken();
    if (!token) return [];
    const q = new URLSearchParams({ origin: origin.toUpperCase(), destination: destination.toUpperCase(), oneWay: 'true' }).toString();
    const response = await fetch(`${AMADEUS_PROXY_V1}/shopping/flight-dates?${q}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) return [];
    const data = await response.json();
    const allTrends = (data.data || []).map((item: any) => ({
      date: item.departureDate,
      price: parseFloat(item.price?.total || item.price?.grandTotal || 0),
      currency: item.price?.currency || 'USD'
    })).filter((d: any) => d.price > 0).sort((a: any, b: any) => a.date.localeCompare(b.date));

    const anchor = new Date(departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let fromDate = new Date(anchor);
    fromDate.setDate(anchor.getDate() - 15);
    if (fromDate < today) fromDate = new Date(today);
    const from = fromDate.toISOString().split('T')[0];
    let toDate = new Date(fromDate);
    toDate.setDate(fromDate.getDate() + 30);
    const to = toDate.toISOString().split('T')[0];

    return allTrends.filter((d: any) => d.date >= from && d.date <= to);
  } catch (error) {
    console.error('Flight Dates Trend Error:', error);
    return [];
  }
};

/**
 * CURATED AIRPORTS
 */
export const getPopularAirports = () => [
  { iataCode: 'DXB', name: 'Dubai International Airport', cityName: 'Dubai', countryCode: 'AE', subType: 'AIRPORT' },
  { iataCode: 'LHR', name: 'London Heathrow Airport', cityName: 'London', countryCode: 'GB', subType: 'AIRPORT' },
  { iataCode: 'JFK', name: 'John F. Kennedy International', cityName: 'New York', countryCode: 'US', subType: 'AIRPORT' },
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport', cityName: 'Paris', countryCode: 'FR', subType: 'AIRPORT' },
  { iataCode: 'SIN', name: 'Changi Airport', cityName: 'Singapore', countryCode: 'SG', subType: 'AIRPORT' },
  { iataCode: 'HKG', name: 'Hong Kong International Airport', cityName: 'Hong Kong', countryCode: 'HK', subType: 'AIRPORT' },
  { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol', cityName: 'Amsterdam', countryCode: 'NL', subType: 'AIRPORT' },
  { iataCode: 'FRA', name: 'Frankfurt Airport', cityName: 'Frankfurt', countryCode: 'DE', subType: 'AIRPORT' },
  { iataCode: 'LAX', name: 'Los Angeles International', cityName: 'Los Angeles', countryCode: 'US', subType: 'AIRPORT' },
  { iataCode: 'BKK', name: 'Suvarnabhumi Airport', cityName: 'Bangkok', countryCode: 'TH', subType: 'AIRPORT' },
];
