const SABRE_PROXY_V1 = '/api/sabre/v1';
const SABRE_PROXY_V2 = '/api/sabre/v2';
const SABRE_PROXY_V4 = '/api/sabre/v4';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/** Force-clear the cached token */
const clearToken = () => { accessToken = null; tokenExpiry = 0; };

const getAccessToken = async (forceRefresh = false): Promise<string | null> => {
  if (!forceRefresh && accessToken && Date.now() < tokenExpiry - 30_000) {
    return accessToken;
  }

  accessToken = null;

  const clientId = process.env.NEXT_PUBLIC_SABRE_API_KEY;
  const clientSecret = process.env.NEXT_PUBLIC_SABRE_API_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Sabre API Keys missing in .env");
    return null;
  }

  try {
    // Sabre requires: btoa(btoa(clientId) + ":" + btoa(clientSecret))
    const encodedClientId = btoa(clientId);
    const encodedSecret = btoa(clientSecret);
    const authHeader = btoa(`${encodedClientId}:${encodedSecret}`);

    const response = await fetch('/sabre-api/v2/auth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Sabre Token Error:", errorData);
      return null;
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    return accessToken;
  } catch (error) {
    console.error("Sabre Auth Exception:", error);
    return null;
  }
};

const sabreRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<{ data: any; status: number }> => {
  const makeRequest = async (forceRefresh = false) => {
    const token = await getAccessToken(forceRefresh);
    if (!token) throw new Error('Authentication failed — check your Sabre API credentials.');

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return { data: json, status: res.status };
  };

  const first = await makeRequest(false);

  if (first.status === 401) {
    console.warn('[sabre] Retrying with fresh token after 401');
    clearToken();
    return makeRequest(true);
  }

  return first;
};

/**
 * --- FLIGHTS ---
 */

export const searchFlights = async (params: any) => {
  const { getMockFlights } = await import('@/data/mockFlights');

  try {
    const body = {
      OTA_AirLowFareSearchRQ: {
        OriginDestinationInformation: [{
          DepartureDateTime: `${params.departureDate}T00:00:00`,
          OriginLocation: { LocationCode: params.origin.toUpperCase() },
          DestinationLocation: { LocationCode: params.destination.toUpperCase() }
        }],
        POS: {
          Source: [{
            PseudoCityCode: process.env.NEXT_PUBLIC_SABRE_PCC || 'F96E',
            RequestorID: { Type: "1", ID: "1", CompanyName: { Code: "TN" } }
          }]
        },
        TravelerInfoSummary: {
          AirTravelerAvail: [{
            PassengerTypeQuantity: [{ Code: "ADT", Quantity: parseInt(params.adults || 1) }]
          }]
        }
      }
    };

    const { data, status } = await sabreRequest(
      `${SABRE_PROXY_V4}/shop/flights?onlineitinerariesonly=N&limit=50&offset=1`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );

    const live = data?.PricedItineraries || data?.groupedItineraryResponse?.itineraryGroups?.[0]?.itineraries || [];
    if (status < 400 && live.length > 0) {
      return live.map((f: any) => ({ ...f, source: 'live' }));
    }
    throw new Error('No live results');
  } catch {
    // Fall back to mock data
    return getMockFlights(params.origin, params.destination, params.departureDate, parseInt(params.adults || 1));
  }
};

export const searchFlightsAdvanced = async (params: any) => {
  const { getMockFlights } = await import('@/data/mockFlights');
  try {
    if (params.type === 'multiCity') {
      const results = await Promise.all(
        params.legs.map((leg: any) =>
          searchFlights({ origin: leg.origin, destination: leg.destination, departureDate: leg.date, adults: params.adults })
        )
      );
      return { data: results.flat(), dictionaries: {} };
    } else {
      const data = await searchFlights(params);
      return { data: Array.isArray(data) ? data : [data], dictionaries: {} };
    }
  } catch {
    const data = getMockFlights(params.origin || params.legs?.[0]?.origin, params.destination || params.legs?.[0]?.destination, params.departureDate || params.legs?.[0]?.date, parseInt(params.adults || 1));
    return { data, dictionaries: {} };
  }
};

export const priceFlightOffer = async (flightOffer: any) => {
  try {
    const { data, status } = await sabreRequest(
      `${SABRE_PROXY_V1}/shop/flights/revalidate`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itineraryId: flightOffer.id, flightOffer }) }
    );
    if (status >= 400) {
      console.warn('Sabre price revalidation failed, returning original offer');
      return flightOffer;
    }
    return data?.PricedItinerary || flightOffer;
  } catch (error) {
    console.error("Sabre Flight Pricing Error:", error);
    return flightOffer;
  }
};

export const getFlightChoicePrediction = async (flightOffers: any[]) => {
  // Sabre does not have a direct equivalent; return offers unchanged
  return flightOffers;
};

export const getSeatMap = async (pricedFlightOffer: any) => {
  try {
    const { data, status } = await sabreRequest(
      `${SABRE_PROXY_V1}/shop/seatmaps`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pricedFlightOffer) }
    );
    if (status >= 400) return [];
    return data?.SeatMap || data?.data || [];
  } catch (error) {
    console.error("Sabre SeatMap Error:", error);
    return [];
  }
};

/**
 * --- HOTELS ---
 */

export const searchHotels = async (params: any) => {
  try {
    const { data, status } = await sabreRequest(
      `${SABRE_PROXY_V1}/shop/hotels/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          HotelSearchCriteria: {
            Criterion: [{
              HotelRef: { HotelCityCode: params.cityCode },
              StayDateRange: {
                Start: params.checkInDate,
                End: params.checkOutDate
              },
              RoomStayCandidates: {
                RoomStayCandidate: [{ GuestCounts: { GuestCount: [{ AgeQualifyingCode: "10", Count: parseInt(params.adults || 1) }] } }]
              }
            }]
          }
        })
      }
    );

    if (status >= 400) {
      console.warn('Sabre hotel search failed');
      return [];
    }

    const hotels = data?.HotelAvailInfos?.HotelAvailInfo || data?.data || [];
    return hotels.map((h: any) => ({
      hotelId: h.HotelRef?.HotelCode || h.hotelId,
      name: h.HotelRef?.HotelName || h.name || 'Hotel',
      rating: h.Award?.Rating || 3,
      address: { cityName: params.cityCode },
      offers: h.RoomStays?.RoomStay || [],
      source: 'live'
    }));
  } catch (error) {
    console.error("Sabre Hotel Search Error:", error);
    return [];
  }
};

export const getHotelRatings = async (hotelIds: string) => {
  // Sabre does not provide a direct hotel-sentiment API; return empty
  return [];
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
  return searchTransfers(params);
};

/**
 * --- INTELLIGENCE & ANALYTICS ---
 */

export const getFlightStatus = async (params: any) => {
  try {
    const query = new URLSearchParams({
      carrierCode: params.carrierCode || params.carrier,
      flightNumber: params.flightNumber,
      departureDate: params.departureDate
    }).toString();
    const { data, status } = await sabreRequest(`${SABRE_PROXY_V1}/historical/flights/schedules?${query}`);
    if (status >= 400) return [];
    return data?.FlightStatusRS?.FlightLegStatus || data?.data || [];
  } catch (error) {
    console.error("Sabre Flight Status Error:", error);
    return [];
  }
};

export const getAirTrafficData = async (type: string, params: any) => {
  // Sabre does not expose an air-traffic analytics endpoint in the DevCenter plan
  return [];
};

export const getNearestAirports = async (lat: string, lon: string) => {
  // Approximate nearest airport by computing distance to static airport list
  const { AIRPORTS } = await import('@/data/airports');
  const latN = parseFloat(lat);
  const lonN = parseFloat(lon);
  const dist = (a: any) => Math.sqrt(Math.pow(latN - (a._lat || 0), 2) + Math.pow(lonN - (a._lon || 0), 2));
  // Return top airports sorted by rough proximity (no coords in static list — return popular list)
  return AIRPORTS.slice(0, 5).map((a) => ({
    iataCode: a.iataCode,
    name: a.name,
    address: { cityName: a.cityName, countryCode: a.countryCode },
  }));
};

export const getAirportOnTimePerformance = async (airportCode: string, date: string) => {
  // Not available in Sabre DevCenter plan
  return null;
};

export const getTripPurposePrediction = async (params: any) => {
  // Not available in Sabre
  return null;
};

/**
 * --- DISCOVERY ---
 */

export const getFlightInspiration = async (params: any) => {
  // Sabre does not have a direct flight-inspiration endpoint; return empty
  return [];
};

export const getFlightCheapestDates = async (params: any) => {
  // Sabre does not have a direct cheapest-dates endpoint; return empty
  return [];
};

export const getToursAndActivities = async (lat: number, lon: number) => {
  // Not available via Sabre; return empty
  return [];
};

/**
 * --- UTILITIES ---
 */

export const searchLocations = async (keyword: string) => {
  const { searchAirports } = await import('@/data/airports');
  return searchAirports(keyword).map((a) => ({
    iataCode: a.iataCode,
    name: a.name,
    subType: a.subType,
    address: {
      cityName: a.cityName,
      countryCode: a.countryCode,
      countryName: a.countryName,
    },
  }));
};

export const getAirlineCodeLookup = async (airlineCode: string) => {
  const { AIRLINES } = await import('@/data/mockFlights');
  const name = AIRLINES[airlineCode.toUpperCase()];
  if (!name) return null;
  return { iataCode: airlineCode.toUpperCase(), businessName: name, commonName: name };
};

/**
 * --- BOOKING ---
 */

export const createFlightOrder = async (flightOffer: any, travelers: any[]) => {
  try {
    const { data, status } = await sabreRequest(
      `${SABRE_PROXY_V1}/book/flights/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightOffer, travelers })
      }
    );
    if (status >= 400) throw new Error('Sabre flight booking failed');
    return data?.BookingRS || data?.data || null;
  } catch (error) {
    console.error("Sabre Flight Booking Error:", error);
    throw error;
  }
};

export const createHotelBooking = async (offerId: string, guests: any[], payments: any[]) => {
  try {
    const { data, status } = await sabreRequest(
      `${SABRE_PROXY_V1}/book/hotels/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, guests, payments })
      }
    );
    if (status >= 400) throw new Error('Sabre hotel booking failed');
    return data?.BookingRS || data?.data || null;
  } catch (error) {
    console.error("Sabre Hotel Booking Error:", error);
    throw error;
  }
};

/**
 * --- FLEXIBLE DATE SEARCH & TRENDS ---
 */

export const searchFlexibleDates = async ({ origin, destination, departureDate, adults = 1 }: any) => {
  const { getMockFlights } = await import('@/data/mockFlights');
  const today = new Date().toISOString().split('T')[0];
  const base = new Date(departureDate);
  const dates = Array.from({ length: 15 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i - 7);
    return d.toISOString().split('T')[0];
  }).filter(d => d >= today);

  return dates.map((date) => {
    const flights = getMockFlights(origin, destination, date, adults);
    const cheapest = flights.reduce((min, f) => parseFloat(f.price.total) < parseFloat(min.price.total) ? f : min, flights[0]);
    return { date, price: parseFloat(cheapest.price.total), currency: 'USD' };
  }).sort((a, b) => a.date.localeCompare(b.date));
};

export const getFlightDatesTrend = async ({ origin, destination, departureDate }: any) => {
  return searchFlexibleDates({ origin, destination, departureDate, adults: 1 });
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
