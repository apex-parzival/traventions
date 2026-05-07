export interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  subType: "AIRPORT" | "CITY";
}

export const AIRPORTS: Airport[] = [
  // Middle East
  { iataCode: "DXB", name: "Dubai International Airport", cityName: "Dubai", countryCode: "AE", countryName: "United Arab Emirates", subType: "AIRPORT" },
  { iataCode: "AUH", name: "Abu Dhabi International Airport", cityName: "Abu Dhabi", countryCode: "AE", countryName: "United Arab Emirates", subType: "AIRPORT" },
  { iataCode: "SHJ", name: "Sharjah International Airport", cityName: "Sharjah", countryCode: "AE", countryName: "United Arab Emirates", subType: "AIRPORT" },
  { iataCode: "DOH", name: "Hamad International Airport", cityName: "Doha", countryCode: "QA", countryName: "Qatar", subType: "AIRPORT" },
  { iataCode: "RUH", name: "King Khalid International Airport", cityName: "Riyadh", countryCode: "SA", countryName: "Saudi Arabia", subType: "AIRPORT" },
  { iataCode: "JED", name: "King Abdulaziz International Airport", cityName: "Jeddah", countryCode: "SA", countryName: "Saudi Arabia", subType: "AIRPORT" },
  { iataCode: "DMM", name: "King Fahd International Airport", cityName: "Dammam", countryCode: "SA", countryName: "Saudi Arabia", subType: "AIRPORT" },
  { iataCode: "KWI", name: "Kuwait International Airport", cityName: "Kuwait City", countryCode: "KW", countryName: "Kuwait", subType: "AIRPORT" },
  { iataCode: "BAH", name: "Bahrain International Airport", cityName: "Manama", countryCode: "BH", countryName: "Bahrain", subType: "AIRPORT" },
  { iataCode: "MCT", name: "Muscat International Airport", cityName: "Muscat", countryCode: "OM", countryName: "Oman", subType: "AIRPORT" },
  { iataCode: "AMM", name: "Queen Alia International Airport", cityName: "Amman", countryCode: "JO", countryName: "Jordan", subType: "AIRPORT" },
  { iataCode: "BEY", name: "Rafic Hariri International Airport", cityName: "Beirut", countryCode: "LB", countryName: "Lebanon", subType: "AIRPORT" },
  { iataCode: "TLV", name: "Ben Gurion International Airport", cityName: "Tel Aviv", countryCode: "IL", countryName: "Israel", subType: "AIRPORT" },
  { iataCode: "CAI", name: "Cairo International Airport", cityName: "Cairo", countryCode: "EG", countryName: "Egypt", subType: "AIRPORT" },
  { iataCode: "IKA", name: "Imam Khomeini International Airport", cityName: "Tehran", countryCode: "IR", countryName: "Iran", subType: "AIRPORT" },
  { iataCode: "BGW", name: "Baghdad International Airport", cityName: "Baghdad", countryCode: "IQ", countryName: "Iraq", subType: "AIRPORT" },

  // Europe
  { iataCode: "LHR", name: "London Heathrow Airport", cityName: "London", countryCode: "GB", countryName: "United Kingdom", subType: "AIRPORT" },
  { iataCode: "LGW", name: "London Gatwick Airport", cityName: "London", countryCode: "GB", countryName: "United Kingdom", subType: "AIRPORT" },
  { iataCode: "STN", name: "London Stansted Airport", cityName: "London", countryCode: "GB", countryName: "United Kingdom", subType: "AIRPORT" },
  { iataCode: "MAN", name: "Manchester Airport", cityName: "Manchester", countryCode: "GB", countryName: "United Kingdom", subType: "AIRPORT" },
  { iataCode: "EDI", name: "Edinburgh Airport", cityName: "Edinburgh", countryCode: "GB", countryName: "United Kingdom", subType: "AIRPORT" },
  { iataCode: "CDG", name: "Charles de Gaulle Airport", cityName: "Paris", countryCode: "FR", countryName: "France", subType: "AIRPORT" },
  { iataCode: "ORY", name: "Paris Orly Airport", cityName: "Paris", countryCode: "FR", countryName: "France", subType: "AIRPORT" },
  { iataCode: "NCE", name: "Nice Côte d'Azur Airport", cityName: "Nice", countryCode: "FR", countryName: "France", subType: "AIRPORT" },
  { iataCode: "FRA", name: "Frankfurt Airport", cityName: "Frankfurt", countryCode: "DE", countryName: "Germany", subType: "AIRPORT" },
  { iataCode: "MUC", name: "Munich Airport", cityName: "Munich", countryCode: "DE", countryName: "Germany", subType: "AIRPORT" },
  { iataCode: "BER", name: "Berlin Brandenburg Airport", cityName: "Berlin", countryCode: "DE", countryName: "Germany", subType: "AIRPORT" },
  { iataCode: "DUS", name: "Düsseldorf Airport", cityName: "Düsseldorf", countryCode: "DE", countryName: "Germany", subType: "AIRPORT" },
  { iataCode: "AMS", name: "Amsterdam Airport Schiphol", cityName: "Amsterdam", countryCode: "NL", countryName: "Netherlands", subType: "AIRPORT" },
  { iataCode: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", cityName: "Madrid", countryCode: "ES", countryName: "Spain", subType: "AIRPORT" },
  { iataCode: "BCN", name: "Barcelona–El Prat Airport", cityName: "Barcelona", countryCode: "ES", countryName: "Spain", subType: "AIRPORT" },
  { iataCode: "FCO", name: "Rome Fiumicino Airport", cityName: "Rome", countryCode: "IT", countryName: "Italy", subType: "AIRPORT" },
  { iataCode: "MXP", name: "Milan Malpensa Airport", cityName: "Milan", countryCode: "IT", countryName: "Italy", subType: "AIRPORT" },
  { iataCode: "VCE", name: "Venice Marco Polo Airport", cityName: "Venice", countryCode: "IT", countryName: "Italy", subType: "AIRPORT" },
  { iataCode: "ZRH", name: "Zurich Airport", cityName: "Zurich", countryCode: "CH", countryName: "Switzerland", subType: "AIRPORT" },
  { iataCode: "GVA", name: "Geneva Airport", cityName: "Geneva", countryCode: "CH", countryName: "Switzerland", subType: "AIRPORT" },
  { iataCode: "VIE", name: "Vienna International Airport", cityName: "Vienna", countryCode: "AT", countryName: "Austria", subType: "AIRPORT" },
  { iataCode: "BRU", name: "Brussels Airport", cityName: "Brussels", countryCode: "BE", countryName: "Belgium", subType: "AIRPORT" },
  { iataCode: "CPH", name: "Copenhagen Airport", cityName: "Copenhagen", countryCode: "DK", countryName: "Denmark", subType: "AIRPORT" },
  { iataCode: "OSL", name: "Oslo Gardermoen Airport", cityName: "Oslo", countryCode: "NO", countryName: "Norway", subType: "AIRPORT" },
  { iataCode: "ARN", name: "Stockholm Arlanda Airport", cityName: "Stockholm", countryCode: "SE", countryName: "Sweden", subType: "AIRPORT" },
  { iataCode: "HEL", name: "Helsinki Airport", cityName: "Helsinki", countryCode: "FI", countryName: "Finland", subType: "AIRPORT" },
  { iataCode: "LIS", name: "Lisbon Airport", cityName: "Lisbon", countryCode: "PT", countryName: "Portugal", subType: "AIRPORT" },
  { iataCode: "ATH", name: "Athens International Airport", cityName: "Athens", countryCode: "GR", countryName: "Greece", subType: "AIRPORT" },
  { iataCode: "PRG", name: "Václav Havel Airport Prague", cityName: "Prague", countryCode: "CZ", countryName: "Czech Republic", subType: "AIRPORT" },
  { iataCode: "WAW", name: "Warsaw Chopin Airport", cityName: "Warsaw", countryCode: "PL", countryName: "Poland", subType: "AIRPORT" },
  { iataCode: "BUD", name: "Budapest Ferenc Liszt International Airport", cityName: "Budapest", countryCode: "HU", countryName: "Hungary", subType: "AIRPORT" },
  { iataCode: "OTP", name: "Henri Coandă International Airport", cityName: "Bucharest", countryCode: "RO", countryName: "Romania", subType: "AIRPORT" },
  { iataCode: "SOF", name: "Sofia Airport", cityName: "Sofia", countryCode: "BG", countryName: "Bulgaria", subType: "AIRPORT" },
  { iataCode: "IST", name: "Istanbul Airport", cityName: "Istanbul", countryCode: "TR", countryName: "Turkey", subType: "AIRPORT" },
  { iataCode: "SAW", name: "Sabiha Gökçen International Airport", cityName: "Istanbul", countryCode: "TR", countryName: "Turkey", subType: "AIRPORT" },
  { iataCode: "SVO", name: "Sheremetyevo International Airport", cityName: "Moscow", countryCode: "RU", countryName: "Russia", subType: "AIRPORT" },
  { iataCode: "DME", name: "Domodedovo International Airport", cityName: "Moscow", countryCode: "RU", countryName: "Russia", subType: "AIRPORT" },
  { iataCode: "LED", name: "Pulkovo Airport", cityName: "Saint Petersburg", countryCode: "RU", countryName: "Russia", subType: "AIRPORT" },

  // Asia
  { iataCode: "SIN", name: "Singapore Changi Airport", cityName: "Singapore", countryCode: "SG", countryName: "Singapore", subType: "AIRPORT" },
  { iataCode: "HKG", name: "Hong Kong International Airport", cityName: "Hong Kong", countryCode: "HK", countryName: "Hong Kong", subType: "AIRPORT" },
  { iataCode: "NRT", name: "Narita International Airport", cityName: "Tokyo", countryCode: "JP", countryName: "Japan", subType: "AIRPORT" },
  { iataCode: "HND", name: "Tokyo Haneda Airport", cityName: "Tokyo", countryCode: "JP", countryName: "Japan", subType: "AIRPORT" },
  { iataCode: "KIX", name: "Kansai International Airport", cityName: "Osaka", countryCode: "JP", countryName: "Japan", subType: "AIRPORT" },
  { iataCode: "ICN", name: "Incheon International Airport", cityName: "Seoul", countryCode: "KR", countryName: "South Korea", subType: "AIRPORT" },
  { iataCode: "GMP", name: "Gimpo International Airport", cityName: "Seoul", countryCode: "KR", countryName: "South Korea", subType: "AIRPORT" },
  { iataCode: "PEK", name: "Beijing Capital International Airport", cityName: "Beijing", countryCode: "CN", countryName: "China", subType: "AIRPORT" },
  { iataCode: "PKX", name: "Beijing Daxing International Airport", cityName: "Beijing", countryCode: "CN", countryName: "China", subType: "AIRPORT" },
  { iataCode: "PVG", name: "Shanghai Pudong International Airport", cityName: "Shanghai", countryCode: "CN", countryName: "China", subType: "AIRPORT" },
  { iataCode: "SHA", name: "Shanghai Hongqiao International Airport", cityName: "Shanghai", countryCode: "CN", countryName: "China", subType: "AIRPORT" },
  { iataCode: "CAN", name: "Guangzhou Baiyun International Airport", cityName: "Guangzhou", countryCode: "CN", countryName: "China", subType: "AIRPORT" },
  { iataCode: "CTU", name: "Chengdu Tianfu International Airport", cityName: "Chengdu", countryCode: "CN", countryName: "China", subType: "AIRPORT" },
  { iataCode: "SZX", name: "Shenzhen Bao'an International Airport", cityName: "Shenzhen", countryCode: "CN", countryName: "China", subType: "AIRPORT" },
  { iataCode: "BKK", name: "Suvarnabhumi Airport", cityName: "Bangkok", countryCode: "TH", countryName: "Thailand", subType: "AIRPORT" },
  { iataCode: "DMK", name: "Don Mueang International Airport", cityName: "Bangkok", countryCode: "TH", countryName: "Thailand", subType: "AIRPORT" },
  { iataCode: "HKT", name: "Phuket International Airport", cityName: "Phuket", countryCode: "TH", countryName: "Thailand", subType: "AIRPORT" },
  { iataCode: "CNX", name: "Chiang Mai International Airport", cityName: "Chiang Mai", countryCode: "TH", countryName: "Thailand", subType: "AIRPORT" },
  { iataCode: "KUL", name: "Kuala Lumpur International Airport", cityName: "Kuala Lumpur", countryCode: "MY", countryName: "Malaysia", subType: "AIRPORT" },
  { iataCode: "CGK", name: "Soekarno–Hatta International Airport", cityName: "Jakarta", countryCode: "ID", countryName: "Indonesia", subType: "AIRPORT" },
  { iataCode: "DPS", name: "Ngurah Rai International Airport", cityName: "Bali", countryCode: "ID", countryName: "Indonesia", subType: "AIRPORT" },
  { iataCode: "MNL", name: "Ninoy Aquino International Airport", cityName: "Manila", countryCode: "PH", countryName: "Philippines", subType: "AIRPORT" },
  { iataCode: "SGN", name: "Tan Son Nhat International Airport", cityName: "Ho Chi Minh City", countryCode: "VN", countryName: "Vietnam", subType: "AIRPORT" },
  { iataCode: "HAN", name: "Noi Bai International Airport", cityName: "Hanoi", countryCode: "VN", countryName: "Vietnam", subType: "AIRPORT" },
  { iataCode: "DAD", name: "Da Nang International Airport", cityName: "Da Nang", countryCode: "VN", countryName: "Vietnam", subType: "AIRPORT" },
  { iataCode: "REP", name: "Siem Reap International Airport", cityName: "Siem Reap", countryCode: "KH", countryName: "Cambodia", subType: "AIRPORT" },
  { iataCode: "RGN", name: "Yangon International Airport", cityName: "Yangon", countryCode: "MM", countryName: "Myanmar", subType: "AIRPORT" },
  { iataCode: "CMB", name: "Bandaranaike International Airport", cityName: "Colombo", countryCode: "LK", countryName: "Sri Lanka", subType: "AIRPORT" },
  { iataCode: "DAC", name: "Hazrat Shahjalal International Airport", cityName: "Dhaka", countryCode: "BD", countryName: "Bangladesh", subType: "AIRPORT" },
  { iataCode: "KTM", name: "Tribhuvan International Airport", cityName: "Kathmandu", countryCode: "NP", countryName: "Nepal", subType: "AIRPORT" },

  // South Asia
  { iataCode: "DEL", name: "Indira Gandhi International Airport", cityName: "New Delhi", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", cityName: "Mumbai", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "BLR", name: "Kempegowda International Airport", cityName: "Bangalore", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "MAA", name: "Chennai International Airport", cityName: "Chennai", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "HYD", name: "Rajiv Gandhi International Airport", cityName: "Hyderabad", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "CCU", name: "Netaji Subhas Chandra Bose International Airport", cityName: "Kolkata", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "COK", name: "Cochin International Airport", cityName: "Kochi", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "AMD", name: "Sardar Vallabhbhai Patel International Airport", cityName: "Ahmedabad", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "PNQ", name: "Pune Airport", cityName: "Pune", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "GOI", name: "Goa International Airport", cityName: "Goa", countryCode: "IN", countryName: "India", subType: "AIRPORT" },
  { iataCode: "KHI", name: "Jinnah International Airport", cityName: "Karachi", countryCode: "PK", countryName: "Pakistan", subType: "AIRPORT" },
  { iataCode: "LHE", name: "Allama Iqbal International Airport", cityName: "Lahore", countryCode: "PK", countryName: "Pakistan", subType: "AIRPORT" },
  { iataCode: "ISB", name: "Islamabad International Airport", cityName: "Islamabad", countryCode: "PK", countryName: "Pakistan", subType: "AIRPORT" },

  // North America
  { iataCode: "JFK", name: "John F. Kennedy International Airport", cityName: "New York", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "LGA", name: "LaGuardia Airport", cityName: "New York", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "EWR", name: "Newark Liberty International Airport", cityName: "Newark", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "LAX", name: "Los Angeles International Airport", cityName: "Los Angeles", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "ORD", name: "O'Hare International Airport", cityName: "Chicago", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "MDW", name: "Chicago Midway International Airport", cityName: "Chicago", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", cityName: "Atlanta", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "DFW", name: "Dallas/Fort Worth International Airport", cityName: "Dallas", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "SFO", name: "San Francisco International Airport", cityName: "San Francisco", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "SEA", name: "Seattle-Tacoma International Airport", cityName: "Seattle", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "MIA", name: "Miami International Airport", cityName: "Miami", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "BOS", name: "Logan International Airport", cityName: "Boston", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "IAD", name: "Dulles International Airport", cityName: "Washington D.C.", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "DCA", name: "Ronald Reagan Washington National Airport", cityName: "Washington D.C.", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "DEN", name: "Denver International Airport", cityName: "Denver", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "LAS", name: "Harry Reid International Airport", cityName: "Las Vegas", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "PHX", name: "Phoenix Sky Harbor International Airport", cityName: "Phoenix", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "IAH", name: "George Bush Intercontinental Airport", cityName: "Houston", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "MSP", name: "Minneapolis–Saint Paul International Airport", cityName: "Minneapolis", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "DTW", name: "Detroit Metropolitan Airport", cityName: "Detroit", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "PHL", name: "Philadelphia International Airport", cityName: "Philadelphia", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "CLT", name: "Charlotte Douglas International Airport", cityName: "Charlotte", countryCode: "US", countryName: "United States", subType: "AIRPORT" },
  { iataCode: "YYZ", name: "Toronto Pearson International Airport", cityName: "Toronto", countryCode: "CA", countryName: "Canada", subType: "AIRPORT" },
  { iataCode: "YVR", name: "Vancouver International Airport", cityName: "Vancouver", countryCode: "CA", countryName: "Canada", subType: "AIRPORT" },
  { iataCode: "YUL", name: "Montreal–Trudeau International Airport", cityName: "Montreal", countryCode: "CA", countryName: "Canada", subType: "AIRPORT" },
  { iataCode: "MEX", name: "Mexico City International Airport", cityName: "Mexico City", countryCode: "MX", countryName: "Mexico", subType: "AIRPORT" },
  { iataCode: "CUN", name: "Cancún International Airport", cityName: "Cancún", countryCode: "MX", countryName: "Mexico", subType: "AIRPORT" },

  // South America
  { iataCode: "GRU", name: "São Paulo–Guarulhos International Airport", cityName: "São Paulo", countryCode: "BR", countryName: "Brazil", subType: "AIRPORT" },
  { iataCode: "GIG", name: "Rio de Janeiro–Galeão International Airport", cityName: "Rio de Janeiro", countryCode: "BR", countryName: "Brazil", subType: "AIRPORT" },
  { iataCode: "EZE", name: "Ministro Pistarini International Airport", cityName: "Buenos Aires", countryCode: "AR", countryName: "Argentina", subType: "AIRPORT" },
  { iataCode: "SCL", name: "Santiago International Airport", cityName: "Santiago", countryCode: "CL", countryName: "Chile", subType: "AIRPORT" },
  { iataCode: "BOG", name: "El Dorado International Airport", cityName: "Bogotá", countryCode: "CO", countryName: "Colombia", subType: "AIRPORT" },
  { iataCode: "LIM", name: "Jorge Chávez International Airport", cityName: "Lima", countryCode: "PE", countryName: "Peru", subType: "AIRPORT" },

  // Africa
  { iataCode: "JNB", name: "O.R. Tambo International Airport", cityName: "Johannesburg", countryCode: "ZA", countryName: "South Africa", subType: "AIRPORT" },
  { iataCode: "CPT", name: "Cape Town International Airport", cityName: "Cape Town", countryCode: "ZA", countryName: "South Africa", subType: "AIRPORT" },
  { iataCode: "NBO", name: "Jomo Kenyatta International Airport", cityName: "Nairobi", countryCode: "KE", countryName: "Kenya", subType: "AIRPORT" },
  { iataCode: "ADD", name: "Addis Ababa Bole International Airport", cityName: "Addis Ababa", countryCode: "ET", countryName: "Ethiopia", subType: "AIRPORT" },
  { iataCode: "LOS", name: "Murtala Muhammed International Airport", cityName: "Lagos", countryCode: "NG", countryName: "Nigeria", subType: "AIRPORT" },
  { iataCode: "ABV", name: "Nnamdi Azikiwe International Airport", cityName: "Abuja", countryCode: "NG", countryName: "Nigeria", subType: "AIRPORT" },
  { iataCode: "ACC", name: "Kotoka International Airport", cityName: "Accra", countryCode: "GH", countryName: "Ghana", subType: "AIRPORT" },
  { iataCode: "CMN", name: "Mohammed V International Airport", cityName: "Casablanca", countryCode: "MA", countryName: "Morocco", subType: "AIRPORT" },
  { iataCode: "TUN", name: "Tunis-Carthage International Airport", cityName: "Tunis", countryCode: "TN", countryName: "Tunisia", subType: "AIRPORT" },
  { iataCode: "ALG", name: "Houari Boumediene Airport", cityName: "Algiers", countryCode: "DZ", countryName: "Algeria", subType: "AIRPORT" },
  { iataCode: "DAR", name: "Julius Nyerere International Airport", cityName: "Dar es Salaam", countryCode: "TZ", countryName: "Tanzania", subType: "AIRPORT" },

  // Australia & Pacific
  { iataCode: "SYD", name: "Sydney Kingsford Smith Airport", cityName: "Sydney", countryCode: "AU", countryName: "Australia", subType: "AIRPORT" },
  { iataCode: "MEL", name: "Melbourne Airport", cityName: "Melbourne", countryCode: "AU", countryName: "Australia", subType: "AIRPORT" },
  { iataCode: "BNE", name: "Brisbane Airport", cityName: "Brisbane", countryCode: "AU", countryName: "Australia", subType: "AIRPORT" },
  { iataCode: "PER", name: "Perth Airport", cityName: "Perth", countryCode: "AU", countryName: "Australia", subType: "AIRPORT" },
  { iataCode: "AKL", name: "Auckland Airport", cityName: "Auckland", countryCode: "NZ", countryName: "New Zealand", subType: "AIRPORT" },
];

export function searchAirports(keyword: string): Airport[] {
  if (!keyword || keyword.trim().length < 1) return [];
  const q = keyword.toLowerCase().trim();
  return AIRPORTS.filter(
    (a) =>
      a.iataCode.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.cityName.toLowerCase().includes(q) ||
      a.countryName.toLowerCase().includes(q) ||
      a.countryCode.toLowerCase().includes(q)
  ).slice(0, 10);
}
