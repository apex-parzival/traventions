export interface MockFlight {
  id: string;
  source: string;
  itineraries: {
    duration: string;
    segments: {
      departure: { iataCode: string; terminal?: string; at: string };
      arrival: { iataCode: string; terminal?: string; at: string };
      carrierCode: string;
      number: string;
      aircraft: { code: string };
      duration: string;
      numberOfStops: number;
    }[];
  }[];
  price: { total: string; currency: string; grandTotal: string };
  validatingAirlineCodes: string[];
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: { total: string; currency: string };
    fareDetailsBySegment: { cabin: string; brandedFare?: string }[];
  }[];
}

const AIRLINES: Record<string, string> = {
  EK: "Emirates", QR: "Qatar Airways", EY: "Etihad Airways",
  SQ: "Singapore Airlines", CX: "Cathay Pacific", TK: "Turkish Airlines",
  LH: "Lufthansa", BA: "British Airways", AF: "Air France",
  AA: "American Airlines", UA: "United Airlines", DL: "Delta Air Lines",
  AI: "Air India", QF: "Qantas", KL: "KLM",
};

function pad(n: number) { return String(n).padStart(2, "0"); }

function addMinutes(isoDate: string, minutes: number): string {
  const d = new Date(isoDate);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString().slice(0, 16);
}

function durationStr(minutes: number): string {
  return `PT${Math.floor(minutes / 60)}H${pad(minutes % 60)}M`;
}

function makeFlight(
  id: string,
  origin: string,
  destination: string,
  date: string,
  depHour: number,
  durationMins: number,
  carrier: string,
  flightNum: string,
  price: number,
  currency = "USD",
  stops = 0,
  cabin = "ECONOMY"
): MockFlight {
  const depAt = `${date}T${pad(depHour)}:${pad(Math.floor(Math.random() * 4) * 10)}:00`;
  const arrAt = addMinutes(depAt, durationMins);
  return {
    id,
    source: "mock",
    itineraries: [{
      duration: durationStr(durationMins),
      segments: [{
        departure: { iataCode: origin, at: depAt },
        arrival: { iataCode: destination, at: arrAt },
        carrierCode: carrier,
        number: flightNum,
        aircraft: { code: "773" },
        duration: durationStr(durationMins),
        numberOfStops: stops,
      }],
    }],
    price: { total: String(price), currency, grandTotal: String(price) },
    validatingAirlineCodes: [carrier],
    travelerPricings: [{
      travelerId: "1",
      fareOption: "STANDARD",
      travelerType: "ADULT",
      price: { total: String(price), currency },
      fareDetailsBySegment: [{ cabin, brandedFare: cabin === "BUSINESS" ? "BUSINESS FLEX" : "ECO SAVER" }],
    }],
  };
}

const ROUTE_TEMPLATES: {
  origin: string; dest: string; carriers: string[]; durationMins: number; basePrice: number;
}[] = [
  { origin: "DXB", dest: "LHR", carriers: ["EK", "BA"], durationMins: 420, basePrice: 520 },
  { origin: "DXB", dest: "JFK", carriers: ["EK", "AA"], durationMins: 840, basePrice: 890 },
  { origin: "DXB", dest: "BOM", carriers: ["EK", "AI"], durationMins: 195, basePrice: 210 },
  { origin: "DXB", dest: "SIN", carriers: ["EK", "SQ"], durationMins: 450, basePrice: 480 },
  { origin: "DXB", dest: "CDG", carriers: ["EK", "AF"], durationMins: 390, basePrice: 460 },
  { origin: "DXB", dest: "FRA", carriers: ["EK", "LH"], durationMins: 360, basePrice: 440 },
  { origin: "DXB", dest: "BKK", carriers: ["EK", "TK"], durationMins: 390, basePrice: 350 },
  { origin: "DXB", dest: "HKG", carriers: ["EK", "CX"], durationMins: 480, basePrice: 510 },
  { origin: "DXB", dest: "DEL", carriers: ["EK", "AI"], durationMins: 210, basePrice: 230 },
  { origin: "DXB", dest: "KHI", carriers: ["EK", "PK"], durationMins: 120, basePrice: 150 },
  { origin: "LHR", dest: "JFK", carriers: ["BA", "AA"], durationMins: 430, basePrice: 620 },
  { origin: "LHR", dest: "DXB", carriers: ["BA", "EK"], durationMins: 420, basePrice: 530 },
  { origin: "LHR", dest: "SIN", carriers: ["SQ", "BA"], durationMins: 780, basePrice: 740 },
  { origin: "JFK", dest: "LHR", carriers: ["AA", "BA"], durationMins: 415, basePrice: 650 },
  { origin: "JFK", dest: "DXB", carriers: ["EK", "UA"], durationMins: 840, basePrice: 900 },
  { origin: "SIN", dest: "LHR", carriers: ["SQ", "BA"], durationMins: 780, basePrice: 760 },
  { origin: "SIN", dest: "SYD", carriers: ["SQ", "QF"], durationMins: 450, basePrice: 380 },
  { origin: "BOM", dest: "DXB", carriers: ["AI", "EK"], durationMins: 195, basePrice: 215 },
  { origin: "BOM", dest: "LHR", carriers: ["AI", "BA"], durationMins: 540, basePrice: 580 },
  { origin: "DEL", dest: "DXB", carriers: ["AI", "EK"], durationMins: 215, basePrice: 235 },
  { origin: "DEL", dest: "LHR", carriers: ["AI", "BA"], durationMins: 510, basePrice: 560 },
  { origin: "DOH", dest: "LHR", carriers: ["QR", "BA"], durationMins: 400, basePrice: 510 },
  { origin: "DOH", dest: "JFK", carriers: ["QR", "AA"], durationMins: 820, basePrice: 870 },
  { origin: "IST", dest: "LHR", carriers: ["TK", "BA"], durationMins: 210, basePrice: 280 },
  { origin: "IST", dest: "JFK", carriers: ["TK", "AA"], durationMins: 620, basePrice: 720 },
];

const DEPARTURE_HOURS = [6, 8, 10, 13, 15, 18, 20, 22];
const PRICE_MULTIPLIERS = [0.85, 0.92, 1.0, 1.08, 1.15, 1.22, 1.35, 1.5];
const CABINS = ["ECONOMY", "ECONOMY", "ECONOMY", "ECONOMY", "PREMIUM_ECONOMY", "BUSINESS"];

export function getMockFlights(origin: string, destination: string, date: string, adults = 1): MockFlight[] {
  const o = origin.toUpperCase();
  const d = destination.toUpperCase();

  const template = ROUTE_TEMPLATES.find(r => r.origin === o && r.dest === d)
    || ROUTE_TEMPLATES.find(r => r.origin === d && r.dest === o);

  const baseTemplate = template || {
    origin: o, dest: d,
    carriers: ["EK", "QR"],
    durationMins: 300 + Math.floor(Math.random() * 300),
    basePrice: 200 + Math.floor(Math.random() * 500),
  };

  const flights: MockFlight[] = [];

  DEPARTURE_HOURS.forEach((hour, i) => {
    const carrier = baseTemplate.carriers[i % baseTemplate.carriers.length];
    const multiplier = PRICE_MULTIPLIERS[i];
    const cabin = CABINS[Math.floor(Math.random() * CABINS.length)];
    const pricePerPax = Math.round(baseTemplate.basePrice * multiplier);
    const totalPrice = pricePerPax * adults;
    const durationVariation = Math.floor((Math.random() - 0.5) * 30);

    flights.push(makeFlight(
      `mock-${o}-${d}-${i}`,
      o, d, date,
      hour,
      baseTemplate.durationMins + durationVariation,
      carrier,
      String(100 + i * 11),
      totalPrice,
      "USD",
      0,
      cabin
    ));
  });

  // Add one stopover option (cheaper)
  flights.push(makeFlight(
    `mock-${o}-${d}-stop`,
    o, d, date,
    7,
    baseTemplate.durationMins + 150,
    baseTemplate.carriers[0],
    "999",
    Math.round(baseTemplate.basePrice * adults * 0.7),
    "USD",
    1,
    "ECONOMY"
  ));

  return flights;
}

export { AIRLINES };
