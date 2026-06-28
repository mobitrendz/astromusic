# 🕉️ Drik-Siddhanta Music & Sunrise Sidereal Chants

Experience **Drik-Siddhanta Music** and **Sunrise Sidereal Chants**—an elegant astronomical music system that combines traditional Vedic calculations with real-time devotional chants, dynamically aligning sacred soundscapes to the active planetary hours of the day.

---

## 🌟 Key Features

- **Dynamic Muhurtha Audio Playback**: Automatically streams the appropriate Sahasranama, Mantra, or divine chant corresponding to the active planetary hour (Muhurtha) of the day.
- **Complete 30 Muhurthas Calculation**: Computes all 30 daily Muhurthas (15 day and 15 night intervals) with precise start and end times based on local astronomical Sunrise and Sunset.
- **Dynamic Location Customization**: Automatically detects or allows users to customize coordinates and timezone for precise Vedic calculations.
- **Precise Solar Kalam Timings**: Computes highly accurate intervals for Rahu Kalam, Gulika Kalam, and Yamagandam based on local coordinates.
- **Comprehensive Devotional Treasury**: Explore an extensive catalog of Sahasranamams, Mantras, Stotrams, Songs, and Shirdi Sai chants categorized beautifully.
- **Day & Night Muhurtha Explorer**: Learn the attributes, qualities, and ruling deities of all 30 day-and-night Muhurthas.
- **Integrated Sastra & Technical Alignment Manual**: Detailed scriptural foundation and mathematical formulas explaining the calculations used.

---

## ✨ Latest Changes & Improvements

We have recently enhanced the application with several visual, technical, and architectural upgrades:

- **📍 Location-Based Auto-Language Selection**: The app now intelligently parses the user's geolocated region on startup. If the user is browsing from **Kerala**, the application language defaults to **Malayalam (മലയാളം)**. If they are in **Telangana** or **Andhra Pradesh**, it defaults to **Telugu (తెలుగు)**. For all other locations, it defaults to **English**. Manual language overrides are fully respected and persisted in `localStorage`.
- **📜 The Science of Drigganitam**: Added an rich informational overview of **Drigganitam (Drik-Siddhanta)** inside the Sastra manual. It details the scientific school of Indian astronomy that computes celestial positions using empirical, direct observations rather than archaic, static formulas, aligning planetary calculation with true observable coordinates.
- **📱 Polished Mobile Header Layouts**: Refined the headers of both the 'Sastra & Technical Alignment Manual' and 'Application Tour' dialogs. Text alignments, spacing, and icon sizes are dynamically responsive to ensure a beautiful experience on any mobile screen.
- **⚙️ Optimized Auto-Location Startup**: Added an intelligent 1.5-second lazy initialization for the automated location search to provide a smoother app load-up, coordinating browser GPS access and IP fallback APIs gracefully without visual lag.

---

## 🛠️ Technology Stack & Architecture

This application is built with a highly responsive, modern full-stack web architecture designed for performance and precision:

### Frontend (Client-Side)
- **React**: Powering the modular component lifecycle, responsive states, and local storage state engines.
- **Vite**: Provides lightning-fast build times, optimized production bundling, and instantaneous load times.
- **Tailwind CSS**: Leveraged for modern, custom utility styles, adaptive mobile-to-desktop grid systems, and a high-contrast warm, scripture-inspired amber color scheme.
- **Motion (`motion/react`)**: Renders fluid container transitions, modal fading entries, and interactive state animations.
- **Lucide React**: Supplies clean, unified, lightweight vector icon interfaces.

### Backend & API Services
- **Node.js & Express**: Drives our clean, scalable server framework.
- **OpenStreetMap & IP-API**: Layered geolocation flow resolving device longitude/latitude to human-readable states and regions for localized calculations and state-level defaults.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your system.

### Installation

1. Clone or extract the project directory.
2. Install the required dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the local development server:
```bash
```bash
npm run dev
```
The server will start running on [http://localhost:3000](http://localhost:3000).

### Building for Production

To compile the application for production:
```bash
npm run build
```

To run the built production server:
```bash
npm run start
```

---

## 📬 Contact & Feedback

For any questions, feedback, or suggestions to grow our sacred treasury of chants, please contact **Admin Drigganita Music** at [astromusic@mobitrendz.com](mailto:astromusic@mobitrendz.com).
