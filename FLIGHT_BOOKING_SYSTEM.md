# ✈️ Traventions — Flight Booking System: Full Technical Reference

> **Last Updated:** April 2026  
> **Project:** Traventions TMC (Travel Management Company) Platform  
> **Stack:** Next.js 14 (App Router), TypeScript, Amadeus REST API, TailwindCSS + Framer Motion

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Directory Structure](#2-architecture--directory-structure)
3. [API Layer — Amadeus Integration](#3-api-layer--amadeus-integration)
   - 3.1 [Authentication](#31-authentication)
   - 3.2 [Proxy Configuration](#32-proxy-configuration)
   - 3.3 [API Endpoints Reference](#33-api-endpoints-reference)
4. [Service Functions (`amadeus.ts`)](#4-service-functions-amadeusts)
5. [Page 1: Flight Search (`/flights`)](#5-page-1-flight-search-flights)
   - 5.1 [State Management](#51-state-management)
   - 5.2 [Search Flow](#52-search-flow)
   - 5.3 [Filter & Sort Logic](#53-filter--sort-logic)
   - 5.4 [Results Rendering](#54-results-rendering)
6. [Page 2: Booking Flow (`/flights/booking`)](#6-page-2-booking-flow-flightsbooking)
   - 6.1 [Step 1 — Passenger Details](#61-step-1--passenger-details)
   - 6.2 [Step 2 — Ancillaries](#62-step-2--ancillaries)
   - 6.3 [Step 3 — Contact Information](#63-step-3--contact-information)
   - 6.4 [Step 4 — Review & Payment](#64-step-4--review--payment)
   - 6.5 [Pricing Engine](#65-pricing-engine)
7. [Post-Booking Screens](#7-post-booking-screens)
   - 7.1 [Processing Screen](#71-processing-screen)
   - 7.2 [Confirmation Screen](#72-confirmation-screen)
   - 7.3 [Hold Screen](#73-hold-screen)
   - 7.4 [Booking Details Screen](#74-booking-details-screen)
8. [Shared Components](#8-shared-components)
   - 8.1 [LocationSearch](#81-locationsearch)
   - 8.2 [SeatMap](#82-seatmap)
   - 8.3 [FlexibleDateSearch](#83-flexibledatesearch)
   - 8.4 [ErrorBoundary](#84-errorboundary)
9. [Data Flow Diagram](#9-data-flow-diagram)
10. [Environment Variables](#10-environment-variables)
11. [Known Limitations & Notes](#11-known-limitations--notes)

---

## 1. System Overview

Traventions is a B2B Travel Management Company (TMC) platform built for corporate travel consultants. The flight booking module is the core product, allowing agents to:

- Search one-way, round-trip, and multi-city flights via the Amadeus GDS
- Filter and sort results by price, stops, airline, fare type
- Select seats, meals, baggage, and premium add-ons
- Capture passenger and contact details
- Choose between **Pay Now** or **Hold Booking** workflows
- Review and confirm a booking through a multi-step flow
- View post-booking PNR details, documents, and booking status

---

## 2. Architecture & Directory Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout, global fonts/meta
│   ├── page.tsx                    # Homepage
│   └── flights/
│       ├── page.tsx                # ✈️ MAIN SEARCH PAGE (1,238 lines)
│       ├── flights.css             # Scoped styles for search page
│       └── booking/
│           ├── page.tsx            # ✈️ MAIN BOOKING PAGE (1,493 lines)
│           ├── BookingDetailsScreen.tsx   # Post-booking details view
│           ├── ConfirmationScreen.tsx     # Success confirmation view
│           ├── HoldScreen.tsx             # Hold booking view
│           └── PostBookingScreens.tsx     # Processing animation
├── components/
│   ├── LocationSearch.tsx          # IATA airport/city autocomplete
│   ├── SeatMap.tsx                 # Interactive seat selection grid
│   ├── FlexibleDateSearch.tsx      # Price calendar / date grid
│   ├── ErrorBoundary.tsx           # React error boundary wrapper
│   ├── Navbar.tsx                  # Top navigation bar
│   └── NavbarWrapper.tsx           # Client wrapper for Navbar
├── services/
│   └── amadeus.ts                  # ✈️ ALL AMADEUS API CALLS (580 lines)
├── lib/
│   └── utils.ts                    # cn() class merger utility
└── styles/
    └── booking.css                 # Scoped styles for booking flow
```

---

## 3. API Layer — Amadeus Integration

### 3.1 Authentication

**File:** `src/services/amadeus.ts` — `getAccessToken()` (lines 7–44)

The Amadeus API uses **OAuth2 Client Credentials** grant. There is no user login — the server authenticates using a Client ID + Secret pair.

**Flow:**
1. Check if `accessToken` (module-level variable) is already set → return it (cache hit).
2. Fetch env vars `NEXT_PUBLIC_AMADEUS_CLIENT_ID` and `NEXT_PUBLIC_AMADEUS_CLIENT_SECRET`.
3. If missing/placeholder → log error and return `null` (this triggers the "Authentication failed" error you saw).
4. POST to `/amadeus-api/v1/security/oauth2/token` with `grant_type=client_credentials`.
5. Store the returned token and schedule a reset `setTimeout` to clear the token 60 seconds before it expires (`expires_in - 60` seconds).

```
Client → POST /amadeus-api/v1/security/oauth2/token
       → grant_type=client_credentials
       → client_id=<NEXT_PUBLIC_AMADEUS_CLIENT_ID>
       → client_secret=<NEXT_PUBLIC_AMADEUS_CLIENT_SECRET>

Response: { access_token: "...", expires_in: 1799 }
```

> ⚠️ The token is stored in module-level memory (`let accessToken`). This is a **client-side singleton** — it resets on every page reload.

---

### 3.2 Proxy Configuration

**File:** `next.config.mjs`

All Amadeus requests go through a **Next.js rewrite proxy** to avoid CORS errors:

```js
async rewrites() {
  return [
    {
      source: '/amadeus-api/:path*',
      destination: 'https://test.api.amadeus.com/:path*',
    },
  ];
}
```

**Base URL constants in `amadeus.ts`:**

| Constant | Resolves to |
|---|---|
| `AMADEUS_PROXY_V1` | `/amadeus-api/v1` → `https://test.api.amadeus.com/v1` |
| `AMADEUS_PROXY_V2` | `/amadeus-api/v2` → `https://test.api.amadeus.com/v2` |
| `AMADEUS_PROXY_V3` | `/amadeus-api/v3` → `https://test.api.amadeus.com/v3` |

> 🔴 **Important for Vercel:** The rewrite proxy works in Next.js SSR mode. On Vercel, ensure your env vars are set in the Vercel Dashboard → Settings → Environment Variables.

---

### 3.3 API Endpoints Reference

Below is every Amadeus endpoint used in the system:

| Function | HTTP | Endpoint | Version | Purpose |
|---|---|---|---|---|
| `getAccessToken` | POST | `/security/oauth2/token` | v1 | OAuth2 token |
| `searchFlights` | GET | `/shopping/flight-offers` | v2 | Simple search |
| `searchFlightsAdvanced` (one-way/RT) | GET | `/shopping/flight-offers` | v2 | Search with cabin/pax |
| `searchFlightsAdvanced` (multi-city) | POST | `/shopping/flight-offers` | v2 | Multi-city search |
| `priceFlightOffer` | POST | `/shopping/flight-offers/pricing` | v1 | Re-price an offer |
| `getFlightChoicePrediction` | POST | `/shopping/flight-offers/prediction` | v1 | AI ranking |
| `getSeatMap` | POST | `/shopping/seatmaps` | v1 | Seat availability grid |
| `searchHotels` (list) | GET | `/reference-data/locations/hotels/by-city` | v1 | Hotels by city |
| `searchHotels` (offers) | GET | `/shopping/hotel-offers` | v3 | Hotel pricing |
| `getHotelRatings` | GET | `/e-reputation/hotel-sentiments` | v2 | Hotel sentiment |
| `getTransferOffers` | POST | `/shopping/transfer-offers` | v1 | Airport transfers |
| `getFlightStatus` | GET | `/schedule/flights` | v2 | Live flight status |
| `getAirTrafficData` | GET | `/travel/analytics/air-traffic/{traveled\|booked}` | v1 | Traffic analytics |
| `getNearestAirports` | GET | `/reference-data/locations/airports` | v1 | Geo-based airports |
| `getFlightInspiration` | GET | `/shopping/flight-destinations` | v1 | Inspiration search |
| `getFlightCheapestDates` | GET | `/shopping/flight-dates` | v1 | Cheapest date grid |
| `getToursAndActivities` | GET | `/shopping/activities` | v1 | Things to do |
| `searchLocations` | GET | `/reference-data/locations` | v1 | Airport/city autocomplete |
| `getAirlineCodeLookup` | GET | `/reference-data/airlines` | v1 | Airline name from code |
| `createFlightOrder` | POST | `/booking/flight-orders` | v1 | Confirm a booking (PNR) |
| `createHotelBooking` | POST | `/booking/hotel-bookings` | v1 | Confirm hotel booking |
| `searchFlexibleDates` | GET (x15) | `/shopping/flight-offers` | v2 | Price calendar (parallel) |
| `getFlightDatesTrend` | GET | `/shopping/flight-dates` | v1 | 30-day price trend |

---

## 4. Service Functions (`amadeus.ts`)

### `searchFlights(params)` — Simple Search
- **Used by:** (Legacy, mostly superseded by `searchFlightsAdvanced`)
- **Method:** GET
- Constructs URL query from `params` object, filters out falsy values
- Returns array of flight offers tagged with `source: 'live'`

---

### `searchFlightsAdvanced(params)` — Advanced Search ⭐ (Main function)
- **Used by:** `FlightsPage.handleSearch()`
- Branches on `params.type`:

**One-Way / Round-Trip (GET):**
```
GET /amadeus-api/v2/shopping/flight-offers
  ?originLocationCode=DXB
  &destinationLocationCode=LHR
  &departureDate=2024-12-28
  &returnDate=2025-01-05   ← only for round trips
  &adults=2
  &children=1
  &travelClass=ECONOMY
```

**Multi-City (POST):**
```json
POST /amadeus-api/v2/shopping/flight-offers
{
  "currencyCode": "USD",
  "originDestinations": [
    { "id": "1", "originLocationCode": "DXB", "destinationLocationCode": "LHR", "departureDateTimeRange": { "date": "2024-12-28" } },
    { "id": "2", "originLocationCode": "LHR", "destinationLocationCode": "CDG", "departureDateTimeRange": { "date": "2025-01-05" } }
  ],
  "travelers": [
    { "id": "1", "travelerType": "ADULT" },
    { "id": "2", "travelerType": "CHILD" }
  ],
  "sources": ["GDS"],
  "searchCriteria": {
    "maxFlightOffers": 50,
    "flightFilters": {
      "cabinRestrictions": [{ "cabin": "ECONOMY", "coverage": "MOST_SEGMENTS", "originDestinationIds": ["1","2"] }]
    }
  }
}
```

**Returns:** `{ data: FlightOffer[], dictionaries: { carriers: {}, aircraft: {} } }`

---

### `priceFlightOffer(flightOffer)` — Re-price
- **Used by:** (Available, not yet wired to UI Select button)
- Sends a full flight offer object back to Amadeus for real-time pricing validation
- Returns the repriced offer or falls back to original

```json
POST /amadeus-api/v1/shopping/flight-offers/pricing
{ "data": { "type": "flight-offers-pricing", "flightOffers": [<offer>] } }
```

---

### `getFlightChoicePrediction(flightOffers)` — AI Ranking
- **Used by:** `FlightsPage.handleSearch()` (called silently after results load)
- Takes up to 10 offers, asks Amadeus AI to rank them
- Result is currently silent (not surfaced in UI yet)

---

### `getSeatMap(pricedFlightOffer)` — Seat Availability
- **Used by:** `SeatMap` component
- Requires a **priced** (post-pricing) flight offer object
- Returns a seat map grid with availability per deck/row/column

---

### `searchLocations(keyword)` — Autocomplete
- **Used by:** `LocationSearch` component
- Searches both `CITY` and `AIRPORT` subtypes
- Returns IATA code, name, city, country

---

### `createFlightOrder(flightOffer, travelers)` — Book (PNR creation)
- **Used by:** (Available, not yet wired — booking is currently mocked on frontend)
- This is the function that would create an actual PNR with the airline
```json
POST /amadeus-api/v1/booking/flight-orders
{
  "data": {
    "type": "flight-order",
    "flightOffers": [<selected offer>],
    "travelers": [{ "id": "1", "dateOfBirth": "1985-01-15", "name": {...}, "contact": {...}, "documents": [...] }]
  }
}
```

---

### `searchFlexibleDates({ origin, destination, departureDate, adults })` — Price Calendar
- **Used by:** `FlexibleDateSearch` component
- Generates 15 dates: 7 days before and 7 days after `departureDate`, filters past dates
- Fires **parallel GET requests** for each date using `Promise.allSettled()`
- Returns `[{ date, price, currency }]` sorted by date

---

## 5. Page 1: Flight Search (`/flights`)

**File:** `src/app/flights/page.tsx`

### 5.1 State Management

| State Variable | Type | Description |
|---|---|---|
| `activeTab` | `string` | `oneWay` \| `roundTrip` \| `multiCity` |
| `isFlexibleMode` | `boolean` | Mounts `<FlexibleDateSearch>` full-screen |
| `isSearching` | `boolean` | Controls loading overlay |
| `results` | `any[]` | Raw Amadeus flight offers from API |
| `error` | `string \| null` | Error message displayed in modal |
| `origin` / `destination` | `string` | IATA codes (e.g., `"DXB"`, `"LHR"`) |
| `departureDate` / `returnDate` | `string` | ISO date strings (e.g., `"2024-12-28"`) |
| `pax` | `{ adults, children, infants }` | Passenger counts |
| `cabinClass` | `string` | `ECONOMY` \| `PREMIUM_ECONOMY` \| `BUSINESS` \| `FIRST` |
| `legs` | `{ origin, destination, date }[]` | Multi-city flight legs |
| `recentSearches` | `any[]` | Persisted in `localStorage` (max 5) |
| `view` | `"search" \| "results"` | Toggles between search form and results |
| `maxPrice` | `number` | Slider max: $5,000 |
| `selectedStops` | `string[]` | `["Non-stop", "1 Stop", "2+ Stops"]` |
| `selectedAirlines` | `string[]` | Carrier codes |
| `selectedFareOptions` | `string[]` | `["net", "ndc", "commissionable", "corporate"]` |
| `dictionaries` | `any` | Amadeus carrier/aircraft code→name map |
| `sortBy` | `"best" \| "cheapest"` | Sort order for results |

---

### 5.2 Search Flow

```
User clicks "Check Availability"
        │
        ▼
handleSearch() [async]
  │
  ├─ Validate inputs (at least one leg for multi-city)
  │
  ├─ Build searchParams object:
  │   { type, origin, destination, departureDate, returnDate, adults, children, infants, cabinClass, legs }
  │
  ├─ Save search to localStorage (recent searches)
  │
  ├─ await searchFlightsAdvanced(searchParams)
  │       │
  │       └─ Returns { data, dictionaries }
  │
  ├─ Assign fareType to each result (round-robin: net, ndc, commissionable, corporate)
  │
  ├─ setResults(data) + setDictionaries(dictionaries)
  │
  ├─ setView("results")
  │
  └─ (silent) getFlightChoicePrediction(data.slice(0,10))
```

**Multi-city special case:**
- Verifies `legs.length > 0` AND each leg has origin, destination, and date
- Sends `type: 'multiCity'` to trigger POST body logic in `searchFlightsAdvanced`

**Flexible dates:**
- User clicks "Flexible Dates" button → `setIsFlexibleMode(true)`
- Renders `<FlexibleDateSearch>` component full-screen
- On date selection, `handleSearch(flexParams)` is called — it auto-fills the form and runs a normal search

---

### 5.3 Filter & Sort Logic

All filtering is driven by a `useMemo` that recalculates whenever filter state changes:

```
filteredResults = useMemo(() => {
  results
    .filter(flight => price <= maxPrice)
    .filter(flight => selectedStops includes stop count label)
    .filter(flight => selectedAirlines includes carrier code)
    .filter(flight => selectedFareOptions includes fareType)
  
  .sort() based on sortBy:
    "cheapest" → ascending price.total
    "best"     → also ascending price (same logic, placeholder for future score)
})
```

**Faceted counts** (showing result count per filter option):
- The filter sidebar calculates counts based on all filters **except** the one being counted
- This shows how many results would remain if you toggled a given filter

---

### 5.4 Results Rendering

Each flight card is rendered from `filteredResults.map()`:
- **Airline Logo:** `https://pics.avs.io/60/60/{carrierCode}.png` (fallback to `AI.png`)
- **Airline Name:** Resolved via `dictionaries.carriers[carrierCode]`
- **Times:** `itinerary.segments[0].departure.at.split('T')[1].substring(0,5)`
- **Duration:** `itinerary.duration` (ISO 8601 e.g. `PT5H15M`)
- **Stops:** Segment count - 1
- **Fare Breakdown:** Calculated from `fareType` and `price.total`
  - `net`: full price, no commission
  - `ndc`: 8% markup added
  - `commissionable`: 8% commission
  - `corporate`: 8% discount

**Select button routing:**
```
onClick → router.push(`/flights/booking?offerId=${flight.id}&adults=${pax.adults}&children=${pax.children}&infants=${pax.infants}`)
```

---

## 6. Page 2: Booking Flow (`/flights/booking`)

**File:** `src/app/flights/booking/page.tsx`

This page reads URL params: `offerId`, `adults`, `children`, `infants`.

> ⚠️ Currently the `offerId` is not used to re-fetch the offer from Amadeus. The `flightOffer` is **mocked** with hardcoded data (UA 2045 JFK→LAX). In production, this would call `priceFlightOffer(offerId)` to re-validate pricing.

### Booking State Machine

```
bookingStatus: 'draft' | 'processing' | 'confirmed' | 'hold' | 'details'
```

| Status | Renders |
|---|---|
| `draft` | Multi-step form (steps 1–4) |
| `processing` | `<ProcessingScreen>` animation (3s) |
| `confirmed` | `<ConfirmationScreen>` |
| `hold` | `<HoldScreen>` |
| `details` | `<BookingDetailsScreen>` |

---

### 6.1 Step 1 — Passenger Details

**Component:** `PassengerForm` (inline)

For each passenger (adults + children + infants), renders an accordion panel with:

| Field | Validation |
|---|---|
| Title | Required (Mr./Ms./Mrs.) |
| First Name | Required |
| Middle Name | Optional |
| Last Name | Required |
| Date of Birth | Required (day/month/year dropdowns) |
| Gender | Required (radio: Male/Female/Other) |
| Nationality | Required (country select) |
| Passport Number | Required (text input) |
| Passport Expiry | Required — **validated live** |

**Passport Expiry Validation Logic (`handleDateValidation`):**
```
days until expiry < 7   → ERROR: "Booking disabled: Passport expires in less than 1 week"
                          (disables the Save button)
days until expiry < 90  → WARNING: "Passport expires in less than 3 months"
else                    → clear errors
```

On clicking "Save Passenger Details":
1. Passenger added to `completedPassengers[]`
2. Next passenger accordion auto-expands
3. Last passenger saved → all collapse

**Hold toggle:**
- Toggle at top of Step 1 → sets `holdBooking: true`
- This affects behavior at the Review step (Hold vs. Pay Now)

**Advance to Step 2:** Requires `completedPassengers.length === totalPassengers`

---

### 6.2 Step 2 — Ancillaries

**Component:** `AncillariesStep`

Per-passenger accordion (collapses to show name if passenger details filled):

**Seat Selection (Mockup Grid):**
- 4 rows × A,B | C,D (blocked) | E,F layout
- Middle seats (B, E): Free
- Window seats (A, F): +$25
- Aisle seats (C, D): +$15 (blocked in current mockup)
- State: `selectedSeats: Record<passengerIndex, seatId>`

**Baggage Section:**
- Option 1: Standard Allowance (1×23kg, included, $0)
- Options 2+: From `flightOffer.baggageAllowance.extraOptions` (mock: 45kg +$45, 2×23kg +$85)
- State: `baggage: Record<passengerIndex, priceString>`

**In-Flight Dining (8 options):**
- No Preference, Chef's Choice, Vegetarian (VGML), Strict Vegan, Halal (MOML), Kosher (KSML), Gluten Free, Kids Fun Meal
- State: `meals: Record<passengerIndex, mealId>`

**Premium Add-ons (per passenger):**
| Add-on | Cost | State key |
|---|---|---|
| Travel Insurance | +$25 | `passengerAddons[i].insurance` |
| Priority Boarding | +$12 | `passengerAddons[i].priorityBoarding` |
| Lounge Access | +$35 | `passengerAddons[i].loungeAccess` |

---

### 6.3 Step 3 — Contact Information

**Component:** `ContactStep`

**Fields:**
- Primary Contact Email* (validated: must contain `@`)
- Primary Contact Phone* (with country code dropdown)
- Alternate Contact Phone (optional)
- Preferred Contact Method: Email / SMS / Both (radio)
- Additional Email Recipients (comma-separated, up to 5)

**Booking Options (at bottom of this step):**
| Option | UI Color | Behavior |
|---|---|---|
| Pay Now | Green | Proceeds to payment on next step |
| Hold Booking | Amber | Reserves fare, defers payment |

State: `bookingOption: "pay_now" | "hold"`

**Validation:** Email must contain `@`. Otherwise shows inline error and blocks "Continue".

---

### 6.4 Step 4 — Review & Payment

**Component:** `ReviewStep`

Displays a read-only summary of:
- Flight details (hardcoded from `flightOffer` mock)
- All passengers with seat/meal/baggage selections
- Contact information
- Payment method selector (Wallet / Card / Net Banking / Postpaid tabs)
- Mock wallet balance: $5,240.00

**Confirm button:**
- `bookingOption === 'hold'` → Label: `"Place on Hold $X.XX"`
- `bookingOption === 'pay_now'` → Label: `"Confirm & Pay $X.XX"`

On click → `setBookingStatus('processing')` if pay_now, or `setBookingStatus('hold')` if hold

---

### 6.5 Pricing Engine

All pricing calculated in `BookingContent`:

```typescript
// Base fares (mocked per passenger type):
Adult base:  $600
Child base:  $540
Infant base: $0

// Fixed taxes (entire booking):
taxes = $285

// Computed:
baseTotal = sum of all passenger baseFares
subtotal  = baseTotal + taxes

// Ancillaries (real-time, driven by user selections):
priorityBoarding = count(selected) × $12
loungeAccess     = count(selected) × $35
insurance        = count(selected) × $25
seats            = sum(window:$25, aisle:$15, middle:$0) per passenger
baggage          = sum(selectedBaggagePrice) per passenger

ancillariesSubtotal = sum of all above

// Final:
totalPrice  = subtotal + ancillariesSubtotal
commission  = totalPrice × 0.07  (7% agent commission)
```

---

## 7. Post-Booking Screens

### 7.1 Processing Screen
**File:** `PostBookingScreens.tsx`

A 3-second animated loading screen shown after clicking "Confirm & Pay". After 3s, calls `onFinish()` → triggers `setBookingStatus('confirmed')`.

---

### 7.2 Confirmation Screen
**File:** `ConfirmationScreen.tsx`

Displayed after successful booking:
- Booking reference (mock: `TRV-2024-UA2045`)
- E-ticket sent confirmation to contact email
- Full itinerary breakdown
- Passenger list with statuses
- Price breakdown with commission
- Download E-Ticket / Invoice / Confirmation PDF buttons
- "View Booking Details" button → `setBookingStatus('details')`

---

### 7.3 Hold Screen
**File:** `HoldScreen.tsx`

Displayed when "Hold Booking" was selected:
- TTL countdown timer (hold expiry)
- Booking status: "On Hold — Payment Required"
- "Complete Payment" CTA → triggers `setBookingStatus('details')`
- Same itinerary and passenger summary as Confirmation

---

### 7.4 Booking Details Screen
**File:** `BookingDetailsScreen.tsx`

A read-only booking management view:
- Orange warning banner: "Booking On Hold — Payment Required"
- Booking reference header (e.g., `TRV-2024-PL-2XU37`) with copy icon
- **Accordion sections:**
  - Flight Details (all itinerary legs)
  - Passenger Details (name, ticket#, seat per passenger)
  - Payment & Price Details
  - Contact Information
- **Documents section:**
  - E-Ticket (pending payment)
  - Invoice (downloadable)
  - Booking Confirmation (ready)
- **Quick Actions sidebar:**
  - Complete Payment
  - Modify Booking
  - Cancel Booking
  - Email E-Ticket to Client
  - Download Agent Receipt
- **Booking timeline** on sidebar (Created → Payment Pending → E-Ticket Issued)

---

## 8. Shared Components

### 8.1 LocationSearch
**File:** `src/components/LocationSearch.tsx`

- Controlled input with debounced search (user types → 300ms delay → API call)
- Calls `searchLocations(keyword)` → `GET /reference-data/locations?subType=CITY,AIRPORT&keyword=...`
- Shows dropdown list of matching airports/cities
- Falls back to `getPopularAirports()` (static list of 10 popular airports) when input is empty
- On select: sets value to `IATA code` (e.g., `"DXB"`)
- Renders airport name, city, country flag emoji

### 8.2 SeatMap
**File:** `src/components/SeatMap.tsx`

- Modal overlay component
- Calls `getSeatMap(pricedFlightOffer)` → `POST /shopping/seatmaps`
- Renders an interactive cabin grid from the API response
- Color codes: Available (green), Occupied (gray), Selected (indigo), Extra legroom (teal)
- Returns selected seat ID via `onSelect(seatId)` callback

### 8.3 FlexibleDateSearch
**File:** `src/components/FlexibleDateSearch.tsx`

- Full-screen overlay mounted when user clicks "Flexible Dates"
- Calls `searchFlexibleDates()` → parallel requests for 15 dates
- Renders a calendar-style price grid
- Also renders a line chart via `getFlightDatesTrend()` (30-day cheapest fares trend)
- On date selection → calls parent's `onSearch(flexParams)` to trigger a full search

### 8.4 ErrorBoundary
**File:** `src/components/ErrorBoundary.tsx`

- Standard React class-based error boundary
- Wraps pages to catch unhandled React render errors
- Displays fallback UI with error message

---

## 9. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│                                                          │
│  ┌──────────────┐        ┌──────────────────────────┐   │
│  │  /flights    │        │    /flights/booking       │   │
│  │ (search page)│ ─────► │    (booking flow)         │   │
│  └──────────────┘        └──────────────────────────┘   │
│         │                          │                     │
│         │ handleSearch()           │ BookingContent()    │
│         ▼                          ▼                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │            src/services/amadeus.ts               │    │
│  │                                                  │    │
│  │  getAccessToken() ──► module-level token cache   │    │
│  │                                                  │    │
│  │  searchFlightsAdvanced()  priceFlightOffer()     │    │
│  │  searchFlexibleDates()    getSeatMap()           │    │
│  │  getFlightChoicePrediction()  createFlightOrder()│    │
│  └────────────────────┬────────────────────────────┘    │
└───────────────────────┼─────────────────────────────────┘
                        │
                        │ All requests → /amadeus-api/...
                        │
┌───────────────────────▼─────────────────────────────────┐
│             Next.js Rewrite Proxy (next.config.mjs)      │
│                                                          │
│   /amadeus-api/:path* → https://test.api.amadeus.com/*  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│               Amadeus REST API (Test Environment)        │
│                                                          │
│  v1: auth, seatmaps, booking, analytics, reference-data  │
│  v2: flight-offers, hotel-sentiments, schedule           │
│  v3: hotel-offers                                        │
└──────────────────────────────────────────────────────────┘
```

**Booking Step Data Flow:**

```
URL Params (offerId, adults, children, infants)
        │
        ▼
BookingContent (state: step, passengers[], flightOffer)
        │
  Step 1: PassengerForm × N
        │ passengerDetails[i], completedPassengers[]
        ▼
  Step 2: AncillariesStep
        │ selectedSeats[i], baggage[i], meals[i], passengerAddons[i]
        ▼
  Step 3: ContactStep
        │ contactInfo{}, bookingOption
        ▼
  Step 4: ReviewStep
        │ totalPrice (computed), display summary
        ▼
  onComplete() → setBookingStatus('processing')
        │
  ProcessingScreen (3s delay)
        │
  → 'confirmed' or 'hold'
        │
  ConfirmationScreen / HoldScreen
        │
  → setBookingStatus('details')
        │
  BookingDetailsScreen
```

---

## 10. Environment Variables

**File:** `.env` (local) / Vercel Dashboard → Settings → Environment Variables (production)

| Variable | Value | Used In |
|---|---|---|
| `NEXT_PUBLIC_AMADEUS_CLIENT_ID` | `t0wUtgeai64vfH0d2RYsuiJBt03mJ29A` | `amadeus.ts` → `getAccessToken()` |
| `NEXT_PUBLIC_AMADEUS_CLIENT_SECRET` | `LJGDeh0NZvQpX8PU` | `amadeus.ts` → `getAccessToken()` |
| `VITE_AMADEUS_CLIENT_ID` | (same value) | Legacy/unused in Next.js context |
| `VITE_AMADEUS_CLIENT_SECRET` | (same value) | Legacy/unused in Next.js context |

> ⚠️ Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Since these are Amadeus **test** API keys, this is acceptable. For production (live) keys, use a server-side API route instead.

---

## 11. Known Limitations & Notes

| # | Area | Issue / Note |
|---|---|---|
| 1 | **Booking** | `offerId` from URL is not used to re-fetch/re-validate the offer from Amadeus. The booking form uses hardcoded `flightOffer` mock data (UA 2045 JFK→LAX). To make live, call `priceFlightOffer(offerId)` on mount. |
| 2 | **PNR Creation** | `createFlightOrder()` exists in `amadeus.ts` but is not called. Clicking "Confirm & Pay" only triggers a UI state change, not an actual Amadeus booking. |
| 3 | **Token Storage** | `accessToken` is a module-level variable. It resets on page reload. No persistence to `sessionStorage`. |
| 4 | **Test Environment** | All API calls go to `test.api.amadeus.com`. Test data may be limited. Switch `next.config.mjs` destination to `api.amadeus.com` for production. |
| 5 | **Seat Map** | `SeatMap` component calls `getSeatMap()` which requires a priced offer. The `showSeatMap` state is set but the SeatMap modal is never triggered from the results page UI. |
| 6 | **Fare Types** | Fare types (net, ndc, commissionable, corporate) are **assigned round-robin** client-side (`i % types.length`), not from Amadeus data. |
| 7 | **Passport validation** | Only expiry date is validated. Passport number format is not validated beyond being a text input. |
| 8 | **Payment** | Payment is entirely mocked (wallet balance hardcoded at $5,240). No payment gateway (Stripe etc.) is integrated. |
| 9 | **Decommissioned APIs** | `getAirportOnTimePerformance()` and `getTripPurposePrediction()` exist but log warnings — these Amadeus APIs are no longer available for Self-Service tier. |
| 10 | **Recent Searches** | Stored in `localStorage`. Clears on browser data wipe. Max 5 entries, deduplicated by origin+destination+date. |
