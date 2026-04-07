export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface Traveler {
  id: string;
  travelerType: 'ADULT' | 'CHILD' | 'HELD_INFANT';
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  contact?: {
    emailAddress?: string;
    phones?: {
      deviceType: string;
      countryCallingCode: string;
      number: string;
    }[];
  };
  documents?: {
    documentType: string;
    number: string;
    expiryDate: string;
    issuanceCountry: string;
    nationality: string;
    holder: boolean;
  }[];
}

export interface FlightLeg {
  origin: string;
  destination: string;
  date: string;
}

export interface SearchParams {
  type: 'oneWay' | 'roundTrip' | 'multiCity';
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  legs?: FlightLeg[];
}

export interface FlightOffer {
  id: string;
  itineraries: any[];
  price: {
    total: string;
    currency: string;
    base: string;
    fees: any[];
    grandTotal: string;
  };
  fareType: string;
  validatingAirlineCodes: string[];
  travelerPricings: any[];
  source?: string;
  ecoPriority?: boolean; // Heuristic-based
}
