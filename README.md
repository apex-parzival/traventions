# Tranventions - Next-Gen Flight Booking Engine

Tranventions is a premium, high-performance flight booking and travel management platform designed for modern travel consultants and TMCs. Powered by the **Amadeus Enterprise GDS** and tailored for extreme operational efficiency.

## 🚀 Key Features

### ✈️ Advanced Booking Engine
- **Multi-City Support**: Seamlessly plan complex itineraries with intelligent input chaining.
- **Round-Trip & One-Way**: Optimized workflows for standard travel patterns.
- **Real-time GDS Inventory**: Direct integration with over 400+ global airlines.
- **Fare Type Management**: Handle **Net**, **NDC**, **Corporate**, and **Commissionable** fares in a single unified view.

### 🎨 Premium UI/UX
- **Glassmorphism Design**: A sleek, modern aesthetic with high-density information display.
- **Dynamic Animations**: Powered by **Framer Motion** for a liquid-smooth experience.
- **Responsive Layout**: Fully functional across desktop, tablet, and mobile devices.
- **Aesthetic Iconography**: Consistent branding using **Lucide React**.

### 💼 Professional Tools
- **Interactive Seat Mapping**: Detailed aircraft layouts for precise seat selection.
- **Flexible Date Search**: 15-day price matrix visualization to find the most profitable/optimal travel dates.
- **Smart Ancillaries**: Integrated baggage, meal selection, and hold-for-payment workflows.
- **Automated PNR & Hold**: Secure seat reservation with real-time expiration tracking.
- **Airline Branding**: High-quality airline logos integrated throughout the search results and booking confirmation.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strictly typed)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **GDS Integration**: [Amadeus Enterprise SDK](https://developers.amadeus.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Analytics**: [Recharts](https://recharts.org/)
- **Map Visualization**: [Mapbox GL](https://www.mapbox.com/)

## 🏁 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Amadeus API Credentials (API Key & Secret)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Zutawa-Studios/traventions.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   AMADEUS_CLIENT_ID=your_key
   AMADEUS_CLIENT_SECRET=your_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License
© 2024 TRANVENTIONS LTD. All rights reserved.
