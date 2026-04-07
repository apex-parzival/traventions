import { create } from 'zustand';
import { SearchParams, FlightOffer, Traveler } from '@/types/flights';

interface BookingState {
  // Search state
  searchParams: SearchParams | null;
  setSearchParams: (params: SearchParams) => void;
  
  // Results state
  results: FlightOffer[];
  setResults: (results: FlightOffer[]) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  
  // Selection state
  selectedFlight: FlightOffer | null;
  setSelectedFlight: (flight: FlightOffer | null) => void;
  
  // Passenger state
  travelers: Traveler[];
  setTravelers: (travelers: Traveler[]) => void;
  updateTraveler: (index: number, data: Partial<Traveler>) => void;
  
  // Currency state
  currency: string;
  setCurrency: (currency: string) => void;
  exchangeRates: Record<string, number>;
  
  // Ancillary state
  selectedSeats: Record<number, string>; // travelerIndex: seatId
  setSelectedSeats: (seats: Record<number, string>) => void;
  baggageSelection: Record<number, string>; // travelerIndex: baggageType/price
  setBaggageSelection: (baggage: Record<number, string>) => void;
  mealSelection: Record<number, string>; // travelerIndex: mealType
  setMealSelection: (meals: Record<number, string>) => void;
}

const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  INR: 83.12,
};

export const useBookingStore = create<BookingState>((set) => ({
  searchParams: null,
  setSearchParams: (params) => set({ searchParams: params }),
  
  results: [],
  setResults: (results) => set({ results }),
  isSearching: false,
  setIsSearching: (isSearching) => set({ isSearching }),
  
  selectedFlight: null,
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  
  travelers: [],
  setTravelers: (travelers) => set({ travelers }),
  updateTraveler: (index, data) => set((state) => {
    const newTravelers = [...state.travelers];
    newTravelers[index] = { ...newTravelers[index], ...data };
    return { travelers: newTravelers };
  }),
  
  currency: 'USD',
  setCurrency: (currency) => set({ currency }),
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  
  selectedSeats: {},
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),
  baggageSelection: {},
  setBaggageSelection: (baggage) => set({ baggageSelection: baggage }),
  mealSelection: {},
  setMealSelection: (meals) => set({ mealSelection: meals }),
}));
