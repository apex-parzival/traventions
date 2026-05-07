const DUFFEL_PROXY = '/api/duffel';

/** GET via the server-side Duffel proxy */
async function duffelGet(path: string): Promise<any> {
  const res = await fetch(`${DUFFEL_PROXY}/${path}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.errors?.[0]?.message || `Duffel GET failed: ${res.status}`);
  return json;
}

/**
 * POST via the server-side Duffel proxy.
 * `query` is appended as URL search params (e.g. { return_offers: 'true' }).
 * Per the Duffel v2 spec, `return_offers` is a QUERY PARAM, not a body field.
 */
async function duffelPost(path: string, body: unknown, query?: Record<string, string>): Promise<any> {
  const qs = query ? '?' + new URLSearchParams(query).toString() : '';
  const res = await fetch(`${DUFFEL_PROXY}/${path}${qs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.errors?.[0]?.message || `Duffel POST failed: ${res.status}`);
  return json;
}

/** Map Duffel cabin class string to our app's format */
function normCabin(c: string): string {
  const map: Record<string, string> = {
    economy: 'ECONOMY',
    premium_economy: 'PREMIUM_ECONOMY',
    business: 'BUSINESS',
    first: 'FIRST',
  };
  return map[(c || '').toLowerCase()] || 'ECONOMY';
}

/** Convert a Duffel offer into the Amadeus-compatible shape the UI expects */
function normalizeOffer(offer: any): any {
  const firstSlice = offer.slices?.[0];
  const firstSeg = firstSlice?.segments?.[0];
  return {
    id: offer.id,
    source: 'live',
    _raw: offer,
    price: {
      total: offer.total_amount,
      currency: offer.total_currency,
      grandTotal: offer.total_amount,
    },
    validatingAirlineCodes: [
      firstSeg?.marketing_carrier?.iata_code ||
      firstSeg?.operating_carrier?.iata_code ||
      'UN',
    ],
    itineraries: (offer.slices || []).map((slice: any) => ({
      duration: slice.duration || 'PT0H',
      segments: (slice.segments || []).map((seg: any) => ({
        departure: {
          iataCode: seg.origin?.iata_code,
          terminal: seg.origin_terminal,
          at: seg.departing_at,
        },
        arrival: {
          iataCode: seg.destination?.iata_code,
          terminal: seg.destination_terminal,
          at: seg.arriving_at,
        },
        carrierCode:
          seg.marketing_carrier?.iata_code || seg.operating_carrier?.iata_code,
        carrierName:
          seg.marketing_carrier?.name || seg.operating_carrier?.name,
        number:
          seg.marketing_carrier_flight_number ||
          seg.operating_carrier_flight_number,
        aircraft: { code: seg.aircraft?.iata_code || '' },
        duration: seg.duration || 'PT0H',
        numberOfStops: seg.stops?.length || 0,
      })),
    })),
    travelerPricings: (offer.passengers || []).map((p: any, i: number) => ({
      travelerId: String(i + 1),
      fareOption: 'STANDARD',
      travelerType:
        p.type === 'adult' ? 'ADULT' : p.type === 'child' ? 'CHILD' : 'ADULT',
      price: { total: offer.total_amount, currency: offer.total_currency },
      fareDetailsBySegment: (firstSlice?.segments || []).map(() => ({
        cabin: normCabin(
          firstSlice?.fare_brand?.cabin_class || offer.cabin_class || 'economy'
        ),
      })),
    })),
  };
}

/**
 * --- FLIGHTS ---
 */

export const searchFlights = async (params: any) => {
  const { getMockFlights } = await import('@/data/mockFlights');
  try {
    const passengers = [
      ...Array(parseInt(params.adults || 1)).fill({ type: 'adult' }),
      ...Array(parseInt(params.children || 0)).fill({ type: 'child' }),
      ...Array(parseInt(params.infants || 0)).fill({ type: 'infant_without_seat' }),
    ];

    const cabinClass = (params.cabinClass || params.travelClass || 'economy').toLowerCase();

    // NOTE: return_offers must be a URL query param per Duffel v2 spec — not a body field
    const json = await duffelPost(
      'air/offer_requests',
      {
        data: {
          slices: [{
            origin: params.origin.toUpperCase(),
            destination: params.destination.toUpperCase(),
            departure_date: params.departureDate,
          }],
          passengers,
          cabin_class: cabinClass,
        },
      },
      { return_offers: 'true' }
    );

    const offers: any[] = json?.data?.offers || [];
    if (offers.length === 0) throw new Error('No offers returned from Duffel');
    return offers.map(normalizeOffer);
  } catch (err) {
    console.warn('[duffel] searchFlights failed, using mock data:', err);
    return getMockFlights(
      params.origin,
      params.destination,
      params.departureDate,
      parseInt(params.adults || 1)
    );
  }
};

export const searchFlightsAdvanced = async (params: any) => {
  const { getMockFlights } = await import('@/data/mockFlights');
  try {
    if (params.type === 'multiCity') {
      const results = await Promise.all(
        params.legs.map((leg: any) =>
          searchFlights({
            origin: leg.origin,
            destination: leg.destination,
            departureDate: leg.date,
            adults: params.adults,
            children: params.children,
            infants: params.infants,
            cabinClass: params.cabinClass,
          })
        )
      );
      return { data: results.flat(), dictionaries: {} };
    }

    const passengers = [
      ...Array(parseInt(params.adults || 1)).fill({ type: 'adult' }),
      ...Array(parseInt(params.children || 0)).fill({ type: 'child' }),
      ...Array(parseInt(params.infants || 0)).fill({ type: 'infant_without_seat' }),
    ];

    const slices: any[] = [{
      origin: params.origin.toUpperCase(),
      destination: params.destination.toUpperCase(),
      departure_date: params.departureDate,
    }];
    if (params.returnDate) {
      slices.push({
        origin: params.destination.toUpperCase(),
        destination: params.origin.toUpperCase(),
        departure_date: params.returnDate,
      });
    }

    const cabinClass = (params.cabinClass || 'economy').toLowerCase();

    // return_offers is a query param per Duffel v2 API spec
    const json = await duffelPost(
      'air/offer_requests',
      { data: { slices, passengers, cabin_class: cabinClass } },
      { return_offers: 'true' }
    );

    const offers: any[] = json?.data?.offers || [];
    if (offers.length === 0) throw new Error('No offers returned from Duffel');
    return { data: offers.map(normalizeOffer), dictionaries: {} };
  } catch (err) {
    console.warn('[duffel] searchFlightsAdvanced failed, using mock data:', err);
    const origin = params.origin || params.legs?.[0]?.origin;
    const destination = params.destination || params.legs?.[0]?.destination;
    const departureDate = params.departureDate || params.legs?.[0]?.date;
    const data = getMockFlights(origin, destination, departureDate, parseInt(params.adults || 1));
    return { data, dictionaries: {} };
  }
};

export const priceFlightOffer = async (flightOffer: any) => {
  try {
    const id = flightOffer._raw?.id || flightOffer.id;
    if (!id || id.startsWith('mock-')) return flightOffer;
    const json = await duffelGet(`air/offers/${id}`);
    return normalizeOffer(json.data);
  } catch {
    return flightOffer;
  }
};

export const getFlightChoicePrediction = async (flightOffers: any[]) => flightOffers;

export const getSeatMap = async (pricedFlightOffer: any) => {
  try {
    const id = pricedFlightOffer._raw?.id || pricedFlightOffer.id;
    if (!id || id.startsWith('mock-')) return [];
    const json = await duffelGet(`air/seat_maps?offer_id=${id}`);
    return json?.data || [];
  } catch {
    return [];
  }
};

/**
 * --- HOTELS ---
 */

export const searchHotels = async (_params: any) => {
  // Duffel Stays is in beta — return empty for now
  return [];
};

export const getHotelRatings = async (_hotelIds: string) => [];

/**
 * --- TRANSFERS & CABS ---
 */

export const searchTransfers = async (_params: any) => [
  { id: 1, type: 'Economy Sedan', price: '45', time: '25 mins', capacity: 4, baggage: 2, source: 'live' },
  { id: 2, type: 'Premium SUV', price: '85', time: '20 mins', capacity: 6, baggage: 5, source: 'live' },
  { id: 3, type: 'Luxury Van', price: '120', time: '30 mins', capacity: 8, baggage: 8, source: 'live' },
];

export const getTransferOffers = async (params: any) => searchTransfers(params);

/**
 * --- INTELLIGENCE ---
 */

export const getFlightStatus = async (_params: any) => [];
export const getAirTrafficData = async (_type: string, _params: any) => [];
export const getAirportOnTimePerformance = async (_airportCode: string, _date: string) => null;
export const getTripPurposePrediction = async (_params: any) => null;

export const getNearestAirports = async (_lat: string, _lon: string) => {
  const { AIRPORTS } = await import('@/data/airports');
  return AIRPORTS.slice(0, 5).map((a) => ({
    iataCode: a.iataCode,
    name: a.name,
    address: { cityName: a.cityName, countryCode: a.countryCode },
  }));
};

/**
 * --- DISCOVERY ---
 */

export const getFlightInspiration = async (_params: any) => [];
export const getFlightCheapestDates = async (_params: any) => [];
export const getToursAndActivities = async (_lat: number, _lon: number) => [];

/**
 * --- LOCATIONS ---
 */

export const searchLocations = async (keyword: string) => {
  try {
    const json = await duffelGet(`places/suggestions?query=${encodeURIComponent(keyword)}`);
    const suggestions: any[] = json?.data || [];
    const results: any[] = [];

    for (const item of suggestions) {
      if (item.type === 'airport') {
        results.push({
          iataCode: item.iata_code,
          name: item.name,
          subType: 'AIRPORT',
          address: {
            cityName: item.city_name || item.name,
            countryCode: item.iata_country_code,
            countryName: item.iata_country_code,
          },
        });
      } else if (item.type === 'city') {
        if (item.iata_code) {
          results.push({
            iataCode: item.iata_code,
            name: item.name,
            subType: 'CITY',
            address: {
              cityName: item.name,
              countryCode: item.iata_country_code,
              countryName: item.iata_country_code,
            },
          });
        }
        for (const airport of (item.airports || [])) {
          results.push({
            iataCode: airport.iata_code,
            name: airport.name,
            subType: 'AIRPORT',
            address: {
              cityName: item.name,
              countryCode: item.iata_country_code,
              countryName: item.iata_country_code,
            },
          });
        }
      }
    }

    return results.slice(0, 10);
  } catch {
    // Fall back to static airport DB
    const { searchAirports } = await import('@/data/airports');
    return searchAirports(keyword).map((a) => ({
      iataCode: a.iataCode,
      name: a.name,
      subType: a.subType,
      address: { cityName: a.cityName, countryCode: a.countryCode, countryName: a.countryName },
    }));
  }
};

export const getAirlineCodeLookup = async (airlineCode: string) => {
  try {
    const json = await duffelGet(`air/airlines/${airlineCode.toUpperCase()}`);
    const a = json?.data;
    if (!a) return null;
    return { iataCode: a.iata_code, businessName: a.name, commonName: a.name };
  } catch {
    const { AIRLINES } = await import('@/data/mockFlights');
    const name = AIRLINES[airlineCode.toUpperCase()];
    return name ? { iataCode: airlineCode.toUpperCase(), businessName: name, commonName: name } : null;
  }
};

/**
 * --- BOOKING ---
 */

export const createFlightOrder = async (flightOffer: any, travelers: any[]) => {
  try {
    const offerId = flightOffer._raw?.id || flightOffer.id;
    if (!offerId || offerId.startsWith('mock-')) throw new Error('Cannot book mock offer');

    const json = await duffelPost('air/orders', {
      data: {
        type: 'instant',
        selected_offers: [offerId],
        passengers: travelers.map((t: any, i: number) => ({
          id: flightOffer._raw?.passengers?.[i]?.id,
          title: t.name?.title || 'mr',
          given_name: t.name?.firstName || t.firstName || 'Test',
          family_name: t.name?.lastName || t.lastName || 'Traveler',
          born_on: t.dateOfBirth || '1990-01-01',
          email: t.contact?.emailAddress || t.email || 'test@example.com',
          phone_number: t.contact?.phones?.[0]?.number || '+10000000000',
          gender: t.gender || 'm',
        })),
        payments: [{
          type: 'balance',
          amount: flightOffer.price?.total,
          currency: flightOffer.price?.currency || 'USD',
        }],
      },
    });
    return json?.data || null;
  } catch (err) {
    console.error('[duffel] createFlightOrder error:', err);
    throw err;
  }
};

export const createHotelBooking = async (
  _offerId: string,
  _guests: any[],
  _payments: any[]
) => null;

/**
 * --- FLEXIBLE DATES & TRENDS ---
 */

export const searchFlexibleDates = async ({
  origin,
  destination,
  departureDate,
  adults = 1,
}: any) => {
  const { getMockFlights } = await import('@/data/mockFlights');
  const today = new Date().toISOString().split('T')[0];
  const base = new Date(departureDate);
  const dates = Array.from({ length: 15 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i - 7);
    return d.toISOString().split('T')[0];
  }).filter((d) => d >= today);

  const results = await Promise.allSettled(
    dates.map(async (date) => {
      try {
        // return_offers is a URL query param per Duffel v2 API spec
        const json = await duffelPost(
          'air/offer_requests',
          {
            data: {
              slices: [{
                origin: origin.toUpperCase(),
                destination: destination.toUpperCase(),
                departure_date: date,
              }],
              passengers: [{ type: 'adult' }],
              cabin_class: 'economy',
            },
          },
          { return_offers: 'true' }
        );
        const offers: any[] = json?.data?.offers || [];
        if (offers.length === 0) throw new Error('no offers');
        const cheapest = offers.reduce(
          (m: any, o: any) =>
            parseFloat(o.total_amount) < parseFloat(m.total_amount) ? o : m,
          offers[0]
        );
        return {
          date,
          price: parseFloat(cheapest.total_amount) * adults,
          currency: cheapest.total_currency,
        };
      } catch {
        const mocks = getMockFlights(origin, destination, date, adults);
        const cheapest = mocks.reduce(
          (m, f) =>
            parseFloat(f.price.total) < parseFloat(m.price.total) ? f : m,
          mocks[0]
        );
        return { date, price: parseFloat(cheapest.price.total), currency: 'USD' };
      }
    })
  );

  return (results.filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<any>[])
    .map((r) => r.value)
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getFlightDatesTrend = async ({ origin, destination, departureDate }: any) =>
  searchFlexibleDates({ origin, destination, departureDate, adults: 1 });

/**
 * CURATED AIRPORTS
 */
export const getPopularAirports = () => [
  { iataCode: 'DXB', name: 'Dubai International Airport', cityName: 'Dubai', countryCode: 'AE', subType: 'AIRPORT' },
  { iataCode: 'LHR', name: 'London Heathrow Airport', cityName: 'London', countryCode: 'GB', subType: 'AIRPORT' },
  { iataCode: 'JFK', name: 'John F. Kennedy International', cityName: 'New York', countryCode: 'US', subType: 'AIRPORT' },
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport', cityName: 'Paris', countryCode: 'FR', subType: 'AIRPORT' },
  { iataCode: 'SIN', name: 'Singapore Changi Airport', cityName: 'Singapore', countryCode: 'SG', subType: 'AIRPORT' },
  { iataCode: 'HKG', name: 'Hong Kong International Airport', cityName: 'Hong Kong', countryCode: 'HK', subType: 'AIRPORT' },
  { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol', cityName: 'Amsterdam', countryCode: 'NL', subType: 'AIRPORT' },
  { iataCode: 'FRA', name: 'Frankfurt Airport', cityName: 'Frankfurt', countryCode: 'DE', subType: 'AIRPORT' },
  { iataCode: 'LAX', name: 'Los Angeles International', cityName: 'Los Angeles', countryCode: 'US', subType: 'AIRPORT' },
  { iataCode: 'BKK', name: 'Suvarnabhumi Airport', cityName: 'Bangkok', countryCode: 'TH', subType: 'AIRPORT' },
  { iataCode: 'DOH', name: 'Hamad International Airport', cityName: 'Doha', countryCode: 'QA', subType: 'AIRPORT' },
  { iataCode: 'DEL', name: 'Indira Gandhi International', cityName: 'New Delhi', countryCode: 'IN', subType: 'AIRPORT' },
];
