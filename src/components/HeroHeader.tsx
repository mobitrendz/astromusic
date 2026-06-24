import React, { useState, useEffect, useMemo } from "react";
import {
  Compass,
  Sparkles,
  MapPin,
  Sun,
  Moon,
  Pencil,
  Search,
  Navigation,
  Orbit,
  Info,
  Play,
  Pause,
  Square,
  Music,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TRANSLATIONS } from "../translations";
import { estimateTimezoneOffset } from "../types";
import { MUHURTAS_LIST } from "./JathakamPanel";

// Import downloaded high-fidelity Rudraksha assets
// @ts-ignore
import rudrakshaMala from "./rudraksha_mala.jpg";
// @ts-ignore
import rudrakshaBig from "./rudraksha_big_rudrakshas.jpg";
// @ts-ignore
import rudrakshaFourteen from "./rudraksha_fourteen_face.jpg";

// Rich 27-Nakshatras list for Malayalam, Telugu and English
const NAKSHATRAS_27 = [
  { en: "Ashwini", ml: "അശ്വതി", te: "అశ్విని" },
  { en: "Bharani", ml: "ഭരണി", te: "భరణి" },
  { en: "Krittika", ml: "കാർത്തിക", te: "కృత్తిక" },
  { en: "Rohini", ml: "രോഹിണി", te: "రోహిణి" },
  { en: "Mrigashira", ml: "മകയിരം", te: "మృగశిర" },
  { en: "Ardra", ml: "തിരുവാതിര", te: "ఆర్ద్ర" },
  { en: "Punarvasu", ml: "പുണർതം", te: "పునర్వసు" },
  { en: "Pushya", ml: "പൂയം", te: "పుష్యమి" },
  { en: "Ashlesha", ml: "ആയില്യം", te: "ఆశ్లేష" },
  { en: "Magha", ml: "മകം", te: "మఖ" },
  { en: "Purva Phalguni", ml: "പൂരം", te: "పూర్వాఫల్గుణి" },
  { en: "Uttara Phalguni", ml: "ഉത്രം", te: "ఉత్తరాఫల్గుణి" },
  { en: "Hasta", ml: "അത്തം", te: "హస్త" },
  { en: "Chitra", ml: "ചിത്ര", te: "చిత్త" },
  { en: "Svati", ml: "ചോതി", te: "స్వాతి" },
  { en: "Vishakha", ml: "വിശാഖം", te: "విశాఖ" },
  { en: "Anuradha", ml: "അനിഴം", te: "అనురాధ" },
  { en: "Jyeshtha", ml: "തൃക്കേട്ട", te: "జ్యేష్ఠ" },
  { en: "Mula", ml: "മൂലം", te: "మూల" },
  { en: "Purva Ashadha", ml: "പൂരാടം", te: "పూర్వాషాఢ" },
  { en: "Uttara Ashadha", ml: "ഉത്രാടം", te: "ఉత్తరాషాఢ" },
  { en: "Shravana", ml: "തിരുവോണം", te: "శ్రవణం" },
  { en: "Dhanishta", ml: "അവിട്ടം", te: "ధనిష్ఠ" },
  { en: "Shatabhisha", ml: "ചതയം", te: "శతభిషం" },
  { en: "Purva Bhadrapada", ml: "പൂരൂരുട്ടാതി", te: "పూర్వాభాద్రపద" },
  { en: "Uttara Bhadrapada", ml: "ഉത്രട്ടാതി", te: "ఉత్తరాభాద్రపద" },
  { en: "Revati", ml: "രേവതി", te: "రేవతి" },
];

// Rich 12-Malayalam Solar Months (Kollavarsham mapping)
const MALAYALAM_MONTHS = [
  { name: "Medam", ml: "മേടം", startDeg: 0 },
  { name: "Edavam", ml: "ഇടവം", startDeg: 30 },
  { name: "Mithunam", ml: "മിഥുനം", startDeg: 60 },
  { name: "Karkidakam", ml: "കർക്കടകം", startDeg: 90 },
  { name: "Chingam", ml: "ചിങ്ങം", startDeg: 120 },
  { name: "Kanni", ml: "കന്നി", startDeg: 150 },
  { name: "Thulam", ml: "തുലാം", startDeg: 180 },
  { name: "Vrischikam", ml: "വൃശ്ചികം", startDeg: 210 },
  { name: "Dhanu", ml: "ധനു", startDeg: 240 },
  { name: "Makaram", ml: "മകരം", startDeg: 270 },
  { name: "Kumbham", ml: "കുംഭം", startDeg: 300 },
  { name: "Meenam", ml: "മീനം", startDeg: 330 },
];

// 30 rich Lunar Tithis in order (15 Shukla + 15 Krishna)
const TITHI_NAMES = [
  { en: "Prathama", ml: "പ്രഥമ", te: "ప్రథమ" },
  { en: "Dwitiya", ml: "ദ്വിതിയ", te: "ద్వితీయ" },
  { en: "Tritiya", ml: "തൃതീയ", te: "తృతీయ" },
  { en: "Chaturthi", ml: "ചതുർത്ഥി", te: "చవితి" },
  { en: "Panchami", ml: "പഞ്ചമി", te: "పంచమి" },
  { en: "Shashti", ml: "ഷഷ്ഠി", te: "షష్ఠి" },
  { en: "Saptami", ml: "സപ്തമി", te: "సప్తమి" },
  { en: "Ashtami", ml: "അഷ്ടമി", te: "అష్టమి" },
  { en: "Navami", ml: "നവമി", te: "నവమి" },
  { en: "Dashami", ml: "ദശമി", te: "దశమి" },
  { en: "Ekadashi", ml: "ഏകാദശി", te: "ఏకాదశి" },
  { en: "Dwadashi", ml: "ദ്വാദശി", te: "ద్వాదశి" },
  { en: "Trayodashi", ml: "ത്രയോദശി", te: "త్రയോదశి" },
  { en: "Chaturdashi", ml: "ചതുർദ്ദശി", te: "చతుర్దశి" },
  { en: "Pournami", ml: "പൗർണ്ണമി", te: "పౌర్ణమి" },

  { en: "Prathama", ml: "പ്രഥമ", te: "ప్రథమ" },
  { en: "Dwitiya", ml: "ദ്വിതിയ", te: "ద్వితీయ" },
  { en: "Tritiya", ml: "തൃതീയ", te: "తృతీయ" },
  { en: "Chaturthi", ml: "ചതുർത്ഥി", te: "చవితి" },
  { en: "Panchami", ml: "പഞ്ചമി", te: "పంచమి" },
  { en: "Shashti", ml: "ഷഷ്ഠി", te: "షష్ఠి" },
  { en: "Saptami", ml: "സപ്തമി", te: "సప్తమి" },
  { en: "Ashtami", ml: "അഷ്ടമി", te: "అష్టమి" },
  { en: "Navami", ml: "നവമി", te: "నവమి" },
  { en: "Dashami", ml: "ദശമി", te: "దశమి" },
  { en: "Ekadashi", ml: "ഏകാദശി", te: "ఏకాదశి" },
  { en: "Dwadashi", ml: "ദ്വാദശി", te: "ద్వాదశి" },
  { en: "Trayodashi", ml: "ത്രയോദശി", te: "త్రയോదశి" },
  { en: "Chaturdashi", ml: "ചതുർദ്ദശി", te: "చతుర్దశి" },
  { en: "Amavasi", ml: "അമാവാസി", te: "అమావాస్య" },
];

// Mathematical Sunrise/Sunset Offline Calculation (Nirayana Sidereal Astronomy Precision)
function calculateSunriseSunsetOffline(
  lat: number,
  lng: number,
  date: Date,
): { sunrise: string; sunset: string } {
  try {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);

    // Declination profile
    const lambda = ((360 / 365) * (day - 80) * Math.PI) / 180;
    const declination = (23.44 * Math.sin(lambda) * Math.PI) / 180;
    const latRad = (lat * Math.PI) / 180;

    // Solar zenith angle for standard sunset refraction (-0.833 degrees)
    const zenithCos = Math.sin((-0.833 * Math.PI) / 180);
    const cosH =
      (zenithCos - Math.sin(latRad) * Math.sin(declination)) /
      (Math.cos(latRad) * Math.cos(declination));

    let H = 6; // default 6 hours
    if (cosH >= 1) {
      return { sunrise: "--:--", sunset: "--:--" }; // Polar night
    } else if (cosH <= -1) {
      return { sunrise: "--:--", sunset: "--:--" }; // Polar day
    } else {
      H = (Math.acos(cosH) * 180) / Math.PI / 15; // Sunset half-day length in hours
    }

    // Equation of time correction
    const b = ((360 / 365) * (day - 81) * Math.PI) / 180;
    const eqt = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // in minutes

    const solarNoonUTC = 12 - lng / 15 - eqt / 60;
    const sunriseUTC = solarNoonUTC - H;
    const sunsetUTC = solarNoonUTC + H;

    const makeLocalDate = (utcHours: number) => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0); // Sets to midnight UTC
      d.setTime(d.getTime() + utcHours * 60 * 60 * 1000);
      return d;
    };

    const sRise = makeLocalDate(sunriseUTC);
    const sSet = makeLocalDate(sunsetUTC);

    const offsetHours = estimateTimezoneOffset(lat, lng);

    const formatTime = (d: Date) => {
      if (isNaN(d.getTime())) return "--:--";
      const shifted = new Date(d.getTime() + offsetHours * 3600000);
      let hr = shifted.getUTCHours();
      const min = shifted.getUTCMinutes().toString().padStart(2, "0");
      const ampm = hr >= 12 ? "PM" : "AM";
      hr = hr % 12;
      hr = hr ? hr : 12;
      return `${hr}:${min} ${ampm}`;
    };

    return {
      sunrise: formatTime(sRise),
      sunset: formatTime(sSet),
    };
  } catch (error) {
    console.error("Offline solar calculation failed:", error);
    return { sunrise: "06:12 AM", sunset: "06:45 PM" };
  }
}

interface HeroHeaderProps {
  currentLanguage: "en" | "ml" | "te";
  onLanguageChange: (lang: "en" | "ml" | "te", isManual?: boolean) => void;
  locationDetails: {
    lat: number;
    lng: number;
    placeName: string;
    sunrise: string;
    sunset: string;
    isGeolocated: boolean;
    loading: boolean;
  };
  setLocationDetails: React.Dispatch<
    React.SetStateAction<{
      lat: number;
      lng: number;
      placeName: string;
      sunrise: string;
      sunset: string;
      isGeolocated: boolean;
      loading: boolean;
    }>
  >;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  activeTrackName: string;
  onOpenSastra?: () => void;
}

const VeenaIcon = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 120 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    id="veena_illustration_icon"
  >
    {/* Large resonator (Kudam) on right side */}
    <circle cx="95" cy="22" r="14" fill="url(#veenaGrad)" stroke="#B07D1C" strokeWidth="1.5" />
    <circle cx="95" cy="22" r="10" fill="none" stroke="#D4C3A3" strokeWidth="0.8" strokeDasharray="2 1" />
    <ellipse cx="95" cy="22" rx="4" ry="7" fill="#3E2723" />

    {/* Fretboard/Neck (Dandi) stretching from left to right */}
    <path d="M 15 19 L 83 19 L 83 25 L 15 25 Z" fill="url(#neckGrad)" stroke="#B07D1C" strokeWidth="1.2" />

    {/* Frets on fretboard */}
    <line x1="25" y1="19" x2="25" y2="25" stroke="#E9DFCE" strokeWidth="0.8" />
    <line x1="33" y1="19" x2="33" y2="25" stroke="#E9DFCE" strokeWidth="0.8" />
    <line x1="41" y1="19" x2="41" y2="25" stroke="#E9DFCE" strokeWidth="0.8" />
    <line x1="49" y1="19" x2="49" y2="25" stroke="#E9DFCE" strokeWidth="0.8" />
    <line x1="57" y1="19" x2="57" y2="25" stroke="#E9DFCE" strokeWidth="0.8" />
    <line x1="65" y1="19" x2="65" y2="25" stroke="#E9DFCE" strokeWidth="0.8" />
    <line x1="73" y1="19" x2="73" y2="25" stroke="#E9DFCE" strokeWidth="0.8" />
    <line x1="81" y1="19" x2="81" y2="25" stroke="#E9DFCE" strokeWidth="0.8" />

    {/* Smaller gourd/resonator (Suraikkai) on the far-left bottom */}
    <circle cx="34" cy="30" r="7" fill="url(#veenaGrad)" stroke="#B07D1C" strokeWidth="1" />
    <line x1="34" y1="23" x2="34" y2="27" stroke="#3E2723" strokeWidth="1.5" />

    {/* Yali Head (Dragon motif) on left end curving downwards */}
    <path d="M 17 19 C 13 19, 10 16, 10 13 C 10 10, 14 7, 16 11 C 18 15, 15 19, 15 22 Z" fill="url(#veenaGrad)" stroke="#B07D1C" strokeWidth="1" />
    <circle cx="13" cy="11" r="1.5" fill="#FFC107" /> {/* Yali Eye */}

    {/* Pegs at the headstock */}
    <circle cx="18" cy="16" r="1.5" fill="#3E2723" />
    <circle cx="21" cy="17" r="1.5" fill="#3E2723" />
    <circle cx="18" cy="24" r="1.5" fill="#3E2723" />
    <circle cx="21" cy="25" r="1.5" fill="#3E2723" />

    {/* Strings across the Veena */}
    <line x1="18" y1="21.5" x2="95" y2="21.5" stroke="#FFD700" strokeWidth="0.5" opacity="0.9" />
    <line x1="18" y1="22.5" x2="95" y2="22.5" stroke="#FFD700" strokeWidth="0.5" opacity="0.9" />

    {/* Bridge on Kudam */}
    <rect x="92" y="18" width="6" height="8" rx="0.5" fill="#3E2723" stroke="#B07D1C" strokeWidth="0.5" />

    {/* Gradients */}
    <defs>
      <linearGradient id="veenaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D84315" /> {/* Terracotta */}
        <stop offset="50%" stopColor="#8D6E63" /> {/* Warm wood */}
        <stop offset="100%" stopColor="#3E2723" /> {/* Deep dark brown */}
      </linearGradient>
      <linearGradient id="neckGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#5D4037" />
        <stop offset="50%" stopColor="#8D6E63" />
        <stop offset="100%" stopColor="#5D4037" />
      </linearGradient>
    </defs>
  </svg>
);

export default function HeroHeader({
  currentLanguage,
  onLanguageChange,
  locationDetails,
  setLocationDetails,
  isPlaying,
  setIsPlaying,
  activeTrackName,
  onOpenSastra,
}: HeroHeaderProps) {
  const [celestialAngles, setCelestialAngles] = useState({
    ra: "05h 42m 21s",
    dec: "+22° 01' 44\"",
    sidereal: "11:24:32",
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMore, setShowMore] = useState(false);

  const [imgSrc, setImgSrc] = useState(rudrakshaMala);
  const [imgFallbackIndex, setImgFallbackIndex] = useState(0);

  const fallbackImages = [
    rudrakshaMala,
    rudrakshaBig,
    rudrakshaFourteen,
    "https://upload.wikimedia.org/wikipedia/commons/d/d5/108%2B1_five_mukhi_Rudraksha_mala.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b4/Favorite_selected_big_Rudrakshas_.jpg",
    "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=400&h=400",
    "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400&h=400",
  ];

  const handleImageError = () => {
    if (imgFallbackIndex < fallbackImages.length - 1) {
      const nextIndex = imgFallbackIndex + 1;
      setImgFallbackIndex(nextIndex);
      setImgSrc(fallbackImages[nextIndex]);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editPlace, setEditPlace] = useState("");
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const t = TRANSLATIONS[currentLanguage];

  const handleSelectSuggestion = (item: any) => {
    const latVal = parseFloat(item.lat);
    const lonVal = parseFloat(item.lon);
    setEditLat(latVal.toFixed(4));
    setEditLng(lonVal.toFixed(4));

    let displayName = item.display_name;
    const parts = displayName.split(", ");
    if (parts.length > 2) {
      displayName = `${parts[0]}, ${parts[parts.length - 1]}`;
    }
    setEditPlace(displayName);
    setSuggestions([]);
  };

  // Helper routine to fetch solar sunrise/sunset times
  const fetchSolarData = async (
    latitude: number,
    longitude: number,
    resolvedName: string,
    isGeo: boolean,
  ) => {
    // 1. Immediately update with high-quality mathematical offline estimations (completely bulletproof offline fallback)
    const offlineTimes = calculateSunriseSunsetOffline(
      latitude,
      longitude,
      new Date(),
    );

    setLocationDetails((prev) => ({
      ...prev,
      lat: latitude,
      lng: longitude,
      placeName: resolvedName,
      sunrise: offlineTimes.sunrise,
      sunset: offlineTimes.sunset,
      isGeolocated: isGeo,
      loading: false,
    }));

    // 2. Fetch from astronomy astronomical calculation web service for absolute precision
    try {
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status === "OK" && data.results) {
          const sunriseLocal = new Date(data.results.sunrise);
          const sunsetLocal = new Date(data.results.sunset);

          const offsetHours = estimateTimezoneOffset(latitude, longitude);

          const formatTime = (d: Date) => {
            if (isNaN(d.getTime())) return "--:--";
            const shifted = new Date(d.getTime() + offsetHours * 3600000);
            let hr = shifted.getUTCHours();
            const min = shifted.getUTCMinutes().toString().padStart(2, "0");
            const ampm = hr >= 12 ? "PM" : "AM";
            hr = hr % 12;
            hr = hr ? hr : 12;
            return `${hr}:${min} ${ampm}`;
          };

          if (!isNaN(sunriseLocal.getTime()) && !isNaN(sunsetLocal.getTime())) {
            setLocationDetails((prev) => ({
              ...prev,
              sunrise: formatTime(sunriseLocal),
              sunset: formatTime(sunsetLocal),
            }));
          }
        }
      }
    } catch (e) {
      console.warn(
        "Could not retrieve web API solar times, relying on mathematical offline calculations:",
        e,
      );
    }
  };

  // Helper routine to reverse geocode latitude and longitude to find city/town names
  const reverseGeocode = async (
    latitude: number,
    longitude: number,
  ): Promise<{ placeName: string; state?: string }> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`,
      );
      if (res.ok) {
        const info = await res.json();
        if (info && info.address) {
          const townName =
            info.address.city ||
            info.address.town ||
            info.address.village ||
            info.address.suburb ||
            info.address.city_district ||
            info.address.county ||
            info.address.state ||
            "My Altar";
          const countryCode = info.address.country_code
            ? info.address.country_code.toUpperCase()
            : "";
          const placeName = countryCode ? `${townName}, ${countryCode}` : townName;
          return { placeName, state: info.address.state };
        }
      }
    } catch (err) {
      console.warn(
        "Reverse geocode lookup warning (expected if rate-limited):",
        err,
      );
    }
    return { placeName: `${latitude.toFixed(2)}° N, ${longitude.toFixed(2)}° E` };
  };

  const handleSearchLocation = async () => {
    if (!editPlace.trim()) return;
    setIsSearchingApi(true);
    setSearchError("");
    setSuggestions([]);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editPlace)}&limit=10`,
      );
      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          setSuggestions(results);
          // Pre-fill fields with the first suggestion by default
          const matched = results[0];
          const latVal = parseFloat(matched.lat);
          const lonVal = parseFloat(matched.lon);
          setEditLat(latVal.toFixed(4));
          setEditLng(lonVal.toFixed(4));
        } else {
          setSearchError(
            currentLanguage === "ml"
              ? "സ്ഥലം കണ്ടെത്താനായില്ല"
              : currentLanguage === "te"
                ? "స్థానము కనుగొనబడలేదు"
                : "Place not found",
          );
        }
      } else {
        setSearchError("API Error");
      }
    } catch (err) {
      console.error(err);
      setSearchError("Network Error");
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleSaveLocation = async () => {
    const latNum = parseFloat(editLat);
    const lngNum = parseFloat(editLng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      setSearchError(
        currentLanguage === "ml"
          ? "അക്ഷാംശങ്ങൾ തെറ്റാണ്"
          : currentLanguage === "te"
            ? "కోఆర్డినేట్లు తప్పు"
            : "Invalid coordinates",
      );
      return;
    }

    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setSearchError(
        currentLanguage === "ml"
          ? "പരിധി തെറ്റാണ് (-90 to 90 / -180 to 180)"
          : currentLanguage === "te"
            ? "పరిధి తప్పు"
            : "Coordinates out of bounds (-90 to 90 / -180 to 180)",
      );
      return;
    }

    // Save updated values and recalculate times via fetchSolarData
    await fetchSolarData(
      latNum,
      lngNum,
      editPlace || `${latNum.toFixed(2)}°, ${lngNum.toFixed(2)}°`,
      true,
    );
    setIsEditing(false);
    setSuggestions([]);
  };

  const handleUseDeviceLocation = () => {
    if (navigator.geolocation) {
      setIsSearchingApi(true);
      setSearchError("");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            setEditLat(latitude.toFixed(4));
            setEditLng(longitude.toFixed(4));
            const placeNameResult = await reverseGeocode(latitude, longitude);
            setEditPlace(placeNameResult.placeName);
            setIsSearchingApi(false);
          } catch (err) {
            console.warn("Exception in device manual positioning handle:", err);
            setSearchError("GPS Fetch Exception");
            setIsSearchingApi(false);
          }
        },
        (error) => {
          try {
            console.warn(error);
            setSearchError(
              currentLanguage === "ml"
                ? "GPS ലഭ്യമല്ല"
                : currentLanguage === "te"
                  ? "GPS అందుబాటులో లేదు"
                  : "GPS Denied / Failed",
            );
            setIsSearchingApi(false);
          } catch (err) {
            console.warn("Exception in fallback device manual position error:", err);
            setIsSearchingApi(false);
          }
        },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    } else {
      setSearchError("No Geolocation Support");
    }
  };

  // Auto-detect location & compute coordinates and local solar timings
  useEffect(() => {
    const runLocationAutoDetection = async () => {
      let isGpsSuccessful = false;

      // Helper to auto-select language based on state/region name
      const autoSelectLanguage = (stateName?: string) => {
        try {
          const isManuallySet = localStorage.getItem("drik_siddhanta_language_manually_set") === "true";
          if (isManuallySet) return; // Respect manual selection

          if (!stateName) return;

          const normalized = stateName.toLowerCase().trim();
          let targetLang: "en" | "ml" | "te" = "en";

          if (normalized.includes("kerala")) {
            targetLang = "ml";
          } else if (normalized.includes("telangana") || normalized.includes("andhra pradesh")) {
            targetLang = "te";
          }

          onLanguageChange(targetLang, false);
        } catch (e) {
          console.error("Error auto-selecting language:", e);
        }
      };

      // Helper function to fetch IP-based routing location as a fallback
      const fallbackToIpLookup = async () => {
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData && ipData.latitude && ipData.longitude) {
              const placeStr = ipData.city
                ? `${ipData.city}, ${ipData.region || ipData.country_name}`
                : "My Location";
              await fetchSolarData(
                ipData.latitude,
                ipData.longitude,
                placeStr,
                false,
              );
              autoSelectLanguage(ipData.region);
              return;
            }
          }
        } catch (err) {
          console.warn("IP geolocation fallback fetching skipped:", err);
        }
        // Tirumala Temple default fallback
        await fetchSolarData(
          13.6833,
          79.3474,
          "Sri Venkateswara Swamy Temple, Tirumala, Tirupati Urban, Andhra Pradesh 517504, India",
          false,
        );
        autoSelectLanguage("Andhra Pradesh");
      };

      // Step 1: Accurate browser-native Geolocation API query first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              isGpsSuccessful = true;
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;

              // Resolve geographic town name and solar attributes
              const placeNameResult = await reverseGeocode(latitude, longitude);
              await fetchSolarData(latitude, longitude, placeNameResult.placeName, true);
              autoSelectLanguage(placeNameResult.state);
            } catch (err) {
              console.warn("Exception in native geolocation watch, falling back:", err);
              if (!isGpsSuccessful) {
                await fallbackToIpLookup();
              }
            }
          },
          async (error) => {
            try {
              console.warn(
                "Browser Geolocation prompt failed or denied. Falling back to IP-based approximate location.",
                error,
              );
              if (!isGpsSuccessful) {
                await fallbackToIpLookup();
              }
            } catch (err) {
              console.warn("Exception in fallback native geolocation error handler:", err);
            }
          },
          { enableHighAccuracy: true, timeout: 6000 },
        );
      } else {
        console.warn("Navigator geolocation is not supported. Falling back to IP.");
        await fallbackToIpLookup();
      }
    };

    const delayTimer = setTimeout(() => {
      runLocationAutoDetection();
    }, 1500);

    return () => clearTimeout(delayTimer);
  }, []);

  // Update clocks every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hrs = now.getUTCHours().toString().padStart(2, "0");
      const mins = now.getUTCMinutes().toString().padStart(2, "0");
      const secs = now.getUTCSeconds().toString().padStart(2, "0");

      const raSecs = (now.getUTCSeconds() * 3.3).toFixed(0).padStart(2, "0");
      const decSecs = (now.getUTCSeconds() * 0.7).toFixed(0).padStart(2, "0");

      setCelestialAngles({
        ra: `05h 43m ${raSecs}s`,
        dec: `+22° 02' ${decSecs}"`,
        sidereal: `${hrs}:${mins}:${secs}`,
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate astronomical local time/date based on the target position (astrologically synchronized LMT and Standard offset)
  const getLocalInfoForLocation = (date: Date, lng: number) => {
    const offsetHours = estimateTimezoneOffset(locationDetails.lat, lng);

    // Convert current Date to the local date of that timezone timezone-agnostically
    const localTimeMs = date.getTime() + offsetHours * 3600000;
    const localDate = new Date(localTimeMs);

    const days = [
      { en: "Sunday", ml: "ഞായറാഴ്ച", te: "ఆదివారం" },
      { en: "Monday", ml: "തിങ്കളാഴ്ച", te: "సోമవారం" },
      { en: "Tuesday", ml: "ചൊവ്വാഴ്ച", te: "మంగళవారం" },
      { en: "Wednesday", ml: "ബുധനാഴ്ച", te: "బుధవారం" },
      { en: "Thursday", ml: "വ്യാഴാഴ്ച", te: "గురువారం" },
      { en: "Friday", ml: "വെള്ളിയാഴ്ച", te: "శుక్రవారం" },
      { en: "Saturday", ml: "ശനിയാഴ്ച", te: "శనివారం" },
    ];

    const dayName =
      days[localDate.getUTCDay()][currentLanguage] ||
      days[localDate.getUTCDay()]["en"];

    let dateString = "";
    if (currentLanguage === "ml") {
      const monthsml = [
        "ജനുവരി",
        "ഫെബ്രുവരി",
        "മാർച്ച്",
        "ഏപ്രിൽ",
        "മേയ്",
        "ജൂൺ",
        "ജൂലൈ",
        "ആഗസ്റ്റ്",
        "സെപ്റ്റംബർ",
        "ഒക്ടോബർ",
        "നവംബർ",
        "ഡിസംബർ",
      ];
      dateString = `${localDate.getUTCDate()} ${monthsml[localDate.getUTCMonth()]} ${localDate.getUTCFullYear()}`;
    } else if (currentLanguage === "te") {
      const monthste = [
        "జనవరి",
        "ఫిబ్రవరి",
        "మార్చి",
        "ఏప్రిల్",
        "మే",
        "జూన్",
        "జూలై",
        "ఆగస్టు",
        "సెప్టెంబరు",
        "అక్టోబరు",
        "నవంబరు",
        "డిసెంబరు",
      ];
      dateString = `${localDate.getUTCDate()} ${monthste[localDate.getUTCMonth()]} ${localDate.getUTCFullYear()}`;
    } else {
      dateString = localDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    }

    let hours = localDate.getUTCHours();
    const minutes = localDate.getUTCMinutes().toString().padStart(2, "0");
    const seconds = localDate.getUTCSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;

    const sign = offsetHours >= 0 ? "+" : "";
    const tzString = `GMT${sign}${offsetHours}`;

    return {
      day: dayName,
      date: dateString,
      time: timeString,
      tz: tzString,
    };
  };

  const localInfo = getLocalInfoForLocation(currentTime, locationDetails.lng);
  const currentDateString = localInfo.date;
  const currentTimeString = localInfo.time;

  const keralaCalendarDetails = useMemo(() => {
    // 1. Timezone offset computation
    const lng = locationDetails.lng;
    const lat = locationDetails.lat;
    const offsetHours = estimateTimezoneOffset(lat, lng);

    // Get current local date/time components in the selected location
    const localTimeNow = new Date(currentTime.getTime() + offsetHours * 3600000);
    const localYear = localTimeNow.getUTCFullYear();
    const localMonth = localTimeNow.getUTCMonth(); // 0-indexed
    const localDate = localTimeNow.getUTCDate();
    const localHour = localTimeNow.getUTCHours();
    const localMin = localTimeNow.getUTCMinutes();
    const liveTimeInMinutes = localHour * 60 + localMin;

    // 2. Parse location details sunrise hours/minutes
    let sunriseHr = 6;
    let sunriseMin = 44; // Fallback default to 6:44 AM
    const rStr = locationDetails.sunrise;
    if (rStr && rStr !== "--:--") {
      const match = rStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        sunriseHr = parseInt(match[1], 10);
        sunriseMin = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && sunriseHr < 12) sunriseHr += 12;
        if (ampm === "AM" && sunriseHr === 12) sunriseHr = 0;
      }
    }
    const sunriseTimeInMinutes = sunriseHr * 60 + sunriseMin;

    // 3. Determine target astrological local date
    let targetLocalYear = localYear;
    let targetLocalMonth = localMonth;
    let targetLocalDate = localDate;

    if (liveTimeInMinutes < sunriseTimeInMinutes) {
      // Astrologically, the day starts at Sunrise. If we are before local sunrise, use previous day components
      const prevDate = new Date(currentTime.getTime() - 24 * 3600000 + offsetHours * 3600000);
      targetLocalYear = prevDate.getUTCFullYear();
      targetLocalMonth = prevDate.getUTCMonth();
      targetLocalDate = prevDate.getUTCDate();
    }

    // Absolutely precise UTC milliseconds of the active Sunrise
    const activeSunriseUTCMs = Date.UTC(targetLocalYear, targetLocalMonth, targetLocalDate, sunriseHr, sunriseMin, 0, 0) - offsetHours * 3600000;

    const msInDay = 1000 * 60 * 60 * 24;
    const epoch = Date.UTC(2026, 5, 20); // Constant UTC baseline epoch calibrated to June 20, 2026
    const daysSinceEpoch = (activeSunriseUTCMs - epoch) / msInDay;

    // 4. Sun & Moon longitudes at Sunrise (Astrological basis for the Panchanga)
    // Sun: moves ~0.9856°/day, base 65.333333° on June 20, 2026 (calibrated for Mithunam 9 on June 23)
    const sunLong = (65.333333 + daysSinceEpoch * 0.9856 + 360) % 360;

    // Moon: moves 13.17639°/day, base 130.26° on June 20, 2026 (calibrated for Atham/Hasta Padham 3 and Navami on June 23 at sunrise)
    const moonLong = (130.26 + daysSinceEpoch * 13.17639 + 360) % 360;

    // 5. Malayalam Solar Month & Date
    const monthIdx = Math.floor(sunLong / 30) % 12;
    const monthObj = MALAYALAM_MONTHS[monthIdx];
    const degInMonth = sunLong % 30;
    const dateValue = Math.floor(degInMonth) + 1;

    // 6. Kollavarsham Year
    const activeSunriseDate = new Date(activeSunriseUTCMs);
    const gregYear = activeSunriseDate.getUTCFullYear();
    const gregMonth = activeSunriseDate.getUTCMonth();
    let meYear = gregYear - 825;
    if (gregMonth < 7) {
      meYear = gregYear - 825;
    } else if (gregMonth > 7) {
      meYear = gregYear - 824;
    } else {
      meYear = sunLong >= 120 ? gregYear - 824 : gregYear - 825;
    }

    // 7. Nakshatra & Padham (calculated at Sunrise as per the request)
    const nakLongSpan = 360 / 27; // 13.333333333
    const nakIdx = Math.floor(moonLong / nakLongSpan) % 27;
    const nakshatraObj = NAKSHATRAS_27[nakIdx] || NAKSHATRAS_27[0];
    const remainderDeg = moonLong % nakLongSpan;
    const padham = Math.floor(remainderDeg / (nakLongSpan / 4)) + 1; // 1 to 4

    // 8. Chandra Tithi (calculated at Sunrise as per the request)
    const angleDiff = (moonLong - sunLong + 360) % 360;
    const tithiIndex = Math.floor(angleDiff / 12) % 30;
    const isShukla = tithiIndex < 15;
    const tithiObj = TITHI_NAMES[tithiIndex];

    const pakshaEn = isShukla ? "Shukla Paksha" : "Krishna Paksha";
    const pakshaMl = isShukla ? "ശുക്ലപക്ഷം" : "കൃഷ്ണപക്ഷം";
    const pakshaTe = isShukla ? "శుక్లపక్షం" : "కృష్ణపక్షం";

    return {
      sunLong,
      moonLong,
      month: monthObj,
      dateValue,
      meYear,
      nakshatra: nakshatraObj,
      padham,
      tithi: tithiObj,
      isShukla,
      paksha: { en: pakshaEn, ml: pakshaMl, te: pakshaTe },
    };
  }, [currentTime, locationDetails]);

  // Dynamic traditional Rahu Kalam, Gulika Kalam & Yamagandam computation for target location
  const triKalamData = useMemo(() => {
    const offsetHours = estimateTimezoneOffset(locationDetails.lat, locationDetails.lng);

    const localTimeMs = currentTime.getTime() + offsetHours * 3600000;
    const localDate = new Date(localTimeMs);
    const weekdayIndex = localDate.getUTCDay(); // 0: Sun, 1: Mon, ..., 6: Sat

    const parseTimeToMinutes = (timeStr: string): number => {
      if (!timeStr || timeStr === "--:--" || timeStr === "0") return 6 * 60; // default 6:00 AM
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      }
      return 6 * 60;
    };

    const sunriseMins = parseTimeToMinutes(locationDetails.sunrise || "06:00 AM");
    const sunsetMins = parseTimeToMinutes(locationDetails.sunset || "06:00 PM");
    const dayDurationMins = sunsetMins - sunriseMins;
    const partDurationMins = dayDurationMins / 8;

    const formatMinutesTo12Hr = (totalMinutes: number): string => {
      const rounded = Math.round(totalMinutes);
      let hours = Math.floor(rounded / 60) % 24;
      const minutes = rounded % 60;
      const ampm = hours >= 12 ? "PM" : "AM";
      let displayHours = hours % 12;
      if (displayHours === 0) displayHours = 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    const currentMinutes = localDate.getUTCHours() * 60 + localDate.getUTCMinutes();

    // Rahu Kalam Parts
    const rahuParts: Record<number, number> = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
    const rahuPart = rahuParts[weekdayIndex] || 8;
    const rahuStart = sunriseMins + (rahuPart - 1) * partDurationMins;
    const rahuEnd = sunriseMins + rahuPart * partDurationMins;
    const rahuActive = currentMinutes >= rahuStart && currentMinutes < rahuEnd;

    // Gulika Kalam Parts
    const gulikaParts: Record<number, number> = { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 };
    const gulikaPart = gulikaParts[weekdayIndex] || 7;
    const gulikaStart = sunriseMins + (gulikaPart - 1) * partDurationMins;
    const gulikaEnd = sunriseMins + gulikaPart * partDurationMins;
    const gulikaActive = currentMinutes >= gulikaStart && currentMinutes < gulikaEnd;

    // Yamagandam Parts
    const yamaParts: Record<number, number> = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 };
    const yamaPart = yamaParts[weekdayIndex] || 5;
    const yamaStart = sunriseMins + (yamaPart - 1) * partDurationMins;
    const yamaEnd = sunriseMins + yamaPart * partDurationMins;
    const yamaActive = currentMinutes >= yamaStart && currentMinutes < yamaEnd;

    return {
      rahu: {
        display: `${formatMinutesTo12Hr(rahuStart)} - ${formatMinutesTo12Hr(rahuEnd)}`,
        isActive: rahuActive,
        partNumber: rahuPart,
      },
      gulika: {
        display: `${formatMinutesTo12Hr(gulikaStart)} - ${formatMinutesTo12Hr(gulikaEnd)}`,
        isActive: gulikaActive,
        partNumber: gulikaPart,
      },
      yama: {
        display: `${formatMinutesTo12Hr(yamaStart)} - ${formatMinutesTo12Hr(yamaEnd)}`,
        isActive: yamaActive,
        partNumber: yamaPart,
      },
    };
  }, [currentTime, locationDetails]);

  const activeMuhurta = useMemo(() => {
    const parseTimeToMinutes = (timeStr: string): number => {
      if (!timeStr || timeStr === "--:--" || timeStr === "0") return 6 * 60;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      }
      return 6 * 60;
    };

    const formatMinutesTo12Hr = (totalMinutes: number): string => {
      const rounded = Math.round(totalMinutes);
      let hours = Math.floor(rounded / 60) % 24;
      const minutes = rounded % 60;
      const ampm = hours >= 12 ? "PM" : "AM";
      let displayHours = hours % 12;
      if (displayHours === 0) displayHours = 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    const parsedSunrise = parseTimeToMinutes(locationDetails.sunrise);
    const parsedSunset = parseTimeToMinutes(locationDetails.sunset);

    const daytimeDuration = (parsedSunset - parsedSunrise) / 15;
    const nighttimeDuration = (parsedSunrise + 1440 - parsedSunset) / 15;

    const getMuhurtaTimeRange = (idx: number) => {
      if (idx <= 15) {
        const start = parsedSunrise + (idx - 1) * daytimeDuration;
        const end = parsedSunrise + idx * daytimeDuration;
        return { start, end };
      } else {
        const nightOffset = idx - 16;
        const start = parsedSunset + nightOffset * nighttimeDuration;
        const end = parsedSunset + (nightOffset + 1) * nighttimeDuration;
        return { start, end };
      }
    };

    const currentMinsLocal = (() => {
      const offsetHours = estimateTimezoneOffset(locationDetails.lat, locationDetails.lng);
      const localTimeMs = currentTime.getTime() + offsetHours * 3600000;
      const localDate = new Date(localTimeMs);
      return localDate.getUTCHours() * 60 + localDate.getUTCMinutes();
    })();

    const isMuhurtaActive = (idx: number) => {
      const { start, end } = getMuhurtaTimeRange(idx);
      const adjusted = currentMinsLocal < parsedSunrise ? currentMinsLocal + 1440 : currentMinsLocal;
      return adjusted >= start && adjusted < end;
    };

    const activeObj = MUHURTAS_LIST.find((m) => isMuhurtaActive(m.index));
    if (!activeObj) return null;

    const { start, end } = getMuhurtaTimeRange(activeObj.index);
    return {
      ...activeObj,
      startTimeStr: formatMinutesTo12Hr(start),
      endTimeStr: formatMinutesTo12Hr(end),
    };
  }, [currentTime, locationDetails]);

  const latVal = Math.abs(locationDetails.lat).toFixed(2);
  const latDir = locationDetails.lat >= 0 ? "N" : "S";
  const lngVal = Math.abs(locationDetails.lng).toFixed(2);
  const lngDir = locationDetails.lng >= 0 ? "E" : "W";
  const formattedCoords = `${latVal}° ${latDir}, ${lngVal}° ${lngDir}`;

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-4 pt-4 md:pt-6 animate-fade-in" id="hero_header_outer_wrap">
        <header className="relative w-full border border-[#D4C3A3] bg-[#EFE5D3] px-4 py-6 md:px-8 rounded-3xl shadow-sm overflow-hidden" id="hero_header_card">
          {/* Floating Sacred Music Notes (Always Visible in Banner) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" id="header_always_floating_notes">
          <style>{`
            @keyframes bannerFloatNote1 {
              0% { transform: translateY(40px) translateX(0) scale(0.8) rotate(0deg); opacity: 0; }
              15% { opacity: 0.6; }
              85% { opacity: 0.55; }
              100% { transform: translateY(-260px) translateX(-30px) scale(1.1) rotate(45deg); opacity: 0; }
            }
            @keyframes bannerFloatNote2 {
              0% { transform: translateY(40px) translateX(0) scale(0.7) rotate(0deg); opacity: 0; }
              20% { opacity: 0.55; }
              80% { opacity: 0.5; }
              100% { transform: translateY(-280px) translateX(35px) scale(1.0) rotate(-60deg); opacity: 0; }
            }
            @keyframes bannerFloatNote3 {
              0% { transform: translateY(40px) translateX(0) scale(0.75) rotate(0deg); opacity: 0; }
              18% { opacity: 0.65; }
              83% { opacity: 0.6; }
              100% { transform: translateY(-270px) translateX(15px) scale(1.05) rotate(35deg); opacity: 0; }
            }
            .ban-note-1 { animation: bannerFloatNote1 9s infinite ease-in-out; }
            .ban-note-2 { animation: bannerFloatNote2 11s infinite ease-in-out; }
            .ban-note-3 { animation: bannerFloatNote3 13s infinite ease-in-out; }
            .ban-note-4 { animation: bannerFloatNote1 10s infinite ease-in-out; }
            .ban-note-5 { animation: bannerFloatNote2 12s infinite ease-in-out; }
            .ban-note-6 { animation: bannerFloatNote3 14s infinite ease-in-out; }
            .ban-note-7 { animation: bannerFloatNote1 11s infinite ease-in-out; }
            .ban-note-8 { animation: bannerFloatNote2 9s infinite ease-in-out; }
            .ban-note-9 { animation: bannerFloatNote3 12s infinite ease-in-out; }
            .ban-note-10 { animation: bannerFloatNote1 13s infinite ease-in-out; }
            .ban-note-11 { animation: bannerFloatNote2 10s infinite ease-in-out; }
            .ban-note-12 { animation: bannerFloatNote3 11s infinite ease-in-out; }
          `}</style>
          {/* Row of 12 distinct floating devotional notes across the banner */}
          <div className="ban-note-1 absolute bottom-0 left-[4%] text-[#C29200]/40 font-serif text-lg filter drop-shadow-[0_1px_2px_rgba(194,146,0,0.18)]">♪</div>
          <div className="ban-note-2 absolute bottom-0 left-[12%] text-[#8D6E63]/30 font-serif text-2xl filter drop-shadow-[0_1px_2px_rgba(141,110,99,0.18)]" style={{ animationDelay: "1.2s" }}>♫</div>
          <div className="ban-note-3 absolute bottom-0 left-[21%] text-[#B07D1C]/40 font-serif text-xl filter drop-shadow-[0_1px_2px_rgba(176,125,28,0.18)]" style={{ animationDelay: "3.5s" }}>♬</div>
          <div className="ban-note-4 absolute bottom-0 left-[30%] text-[#C29200]/30 font-serif text-2xl filter drop-shadow-[0_1px_2px_rgba(194,146,0,0.18)]" style={{ animationDelay: "0.8s" }}>♩</div>
          <div className="ban-note-5 absolute bottom-0 left-[39%] text-[#8D6E63]/40 font-serif text-lg filter drop-shadow-[0_1px_2px_rgba(141,110,99,0.18)]" style={{ animationDelay: "5.2s" }}>♫</div>
          <div className="ban-note-6 absolute bottom-0 left-[48%] text-[#B07D1C]/35 font-serif text-2xl filter drop-shadow-[0_1px_2px_rgba(176,125,28,0.18)]" style={{ animationDelay: "2.3s" }}>♬</div>
          <div className="ban-note-7 absolute bottom-0 left-[57%] text-[#C29200]/40 font-serif text-xl filter drop-shadow-[0_1px_2px_rgba(194,146,0,0.18)]" style={{ animationDelay: "4.1s" }}>♪</div>
          <div className="ban-note-8 absolute bottom-0 left-[66%] text-[#8D6E63]/30 font-serif text-lg filter drop-shadow-[0_1px_2px_rgba(141,110,99,0.18)]" style={{ animationDelay: "1.8s" }}>♩</div>
          <div className="ban-note-9 absolute bottom-0 left-[74%] text-[#B07D1C]/45 font-serif text-2xl filter drop-shadow-[0_1px_2px_rgba(176,125,28,0.18)]" style={{ animationDelay: "6.0s" }}>♫</div>
          <div className="ban-note-10 absolute bottom-0 left-[82%] text-[#C29200]/35 font-serif text-lg filter drop-shadow-[0_1px_2px_rgba(194,146,0,0.18)]" style={{ animationDelay: "2.9s" }}>♩</div>
          <div className="ban-note-11 absolute bottom-0 left-[89%] text-[#8D6E63]/40 font-serif text-xl filter drop-shadow-[0_1px_2px_rgba(141,110,99,0.18)]" style={{ animationDelay: "7.1s" }}>♬</div>
          <div className="ban-note-12 absolute bottom-0 left-[95%] text-[#B07D1C]/35 font-serif text-2xl filter drop-shadow-[0_1px_2px_rgba(176,125,28,0.18)]" style={{ animationDelay: "0.5s" }}>♪</div>
        </div>

        <div className="mx-auto flex max-w-7xl w-full flex-col items-center justify-center relative z-10">
          {/* Sacred Traditional Invocation */}
          <div className="mb-4 text-center select-none flex flex-col items-center" id="sacred_invocation_banner">
            <p className="font-serif text-[13px] sm:text-[15px] font-bold tracking-widest text-[#B07D1C] filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
              {currentLanguage === "ml"
                ? "ഓം ഗം ഗണപതയേ നമഃ"
                : currentLanguage === "te"
                  ? "ఓం గం గణపతయే నమః"
                  : "Om Gam Ganapataye Namaha"
              }
            </p>
            {/* Elegant traditional visual underline (single gold gradient line) */}
            <div className="h-[1.5px] w-full max-w-[180px] bg-gradient-to-r from-transparent via-[#B07D1C]/65 to-transparent mt-1.5" id="sacred_invocation_underline" />
          </div>

          {/* Integrated Header Branding & Audio Status */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 pb-6 z-10 relative" id="header_branding_row">
            {/* Branding title */}
            {/* Branding title with Veena Icon */}
            <div className="text-center md:text-left flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-5" id="header_title_cell">
              <div className="flex justify-center shrink-0 animate-fade-in" id="header_veena_container">
                <VeenaIcon className="h-10 sm:h-12 md:h-14 aspect-[3/1] filter drop-shadow-[0_2px_3px_rgba(62,39,35,0.18)] transition-transform duration-300 hover:scale-105" />
              </div>
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <h1 className="font-serif text-[23px] sm:text-[29px] font-extrabold tracking-tight text-[#3E2723] leading-none drop-shadow-3xs">
                  {currentLanguage === "ml" ? "ദൃഗ്ഗണിത സംഗീതം" : currentLanguage === "te" ? "దృగ్గణిత సంగీతం" : "Drigganita Music"}
                </h1>
                <p className="font-sans text-[10.5px] sm:text-[11.5px] text-[#8D6E63] font-bold tracking-wider uppercase mt-1">
                  {currentLanguage === "ml" ? "സൂര്യോദയ സിദ്ധാന്ത ഭക്തിഗാനങ്ങൾ" : currentLanguage === "te" ? "సూర్యోదయ సిద్ధాంత భక్తి గీతాలు" : "Sunrise Sidereal Chants"}
                </p>
              </div>
            </div>

            {/* INTEGRATED NOW PLAYING PLAYER */}
            <div className="flex items-center gap-3 bg-[#FCF3E3] border-2 border-[#C29200]/50 rounded-xl px-4 py-2 shadow-xs self-start md:self-auto w-full md:w-auto hover:border-[#C29200] transition-all duration-300 hover:shadow-sm z-10 relative" id="banner_audio_ctrl_card">
              <div className="flex items-center gap-2.5 shrink-0">
                {isPlaying ? (
                  <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-3 w-3 rounded-full bg-[#C29200] opacity-75 animate-ping"></span>
                    <Volume2 className="h-4 w-4 text-[#C29200] relative animate-pulse" />
                  </div>
                ) : (
                  <VolumeX className="h-4 w-4 text-[#8D6E63]" />
                )}
                <div className="flex flex-col max-w-[150px] md:max-w-[240px]">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#8D6E63] font-sans font-extrabold flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[#8D6E63] shrink-0"></span>
                    {currentLanguage === "ml" ? "ഇപ്പോൾ പ്ലേ ചെയ്യുന്നു" : currentLanguage === "te" ? "ప్రస్తుతం ప్లే అవుతోంది" : "Now Playing"}
                  </span>
                  <span className="text-[12px] font-serif font-extrabold text-[#5D4037] truncate mt-0.5 drop-shadow-3xs" title={activeTrackName}>
                    {activeTrackName || (currentLanguage === "ml" ? "സ്തോത്രം ലോഡ് ചെയ്യുന്നു..." : currentLanguage === "te" ? "స్తోత్రం లోడ్ అవుతోంది..." : "Loading chant...")}
                  </span>
                </div>
              </div>
              <div className="h-7 w-[1.5px] bg-[#D4C3A3]/60 mx-1"></div>{/* TEST */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center justify-center h-9 w-9 rounded-full transition-all border-2 border-[#C29200]/30 bg-[#5D4037] text-[#FCF8F2] hover:bg-[#C29200] hover:text-[#2D241E] active:scale-90 shadow-md cursor-pointer duration-200 animate-fade-in"
                  title={currentLanguage === "ml" ? "പ്ലേ/പോസ്" : currentLanguage === "te" ? "ప్లే/పాజ్" : "Play/Pause"}
                  id="banner_play_pause_btn"
                >
                  {isPlaying ? (
                    <Pause className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>

      {/* Unified Action row (Language Selection) - moved completely out of the banner container */}
      <div className="w-full flex justify-center mt-6 text-xs" id="moved_language_selection_container">
        {/* Language Selection Tab */}
        <div className="flex items-center gap-2 font-bold animate-fade-in">
          <span className="text-[#8D6E63] text-[11px] uppercase tracking-wider font-extrabold">
            {currentLanguage === "ml" ? "ഭാഷ:" : currentLanguage === "te" ? "భాష:" : "Language:"}
          </span>
          <div className="flex rounded-full border border-[#D4C3A3] bg-white p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wider uppercase transition duration-300 cursor-pointer ${
                currentLanguage === "en"
                  ? "bg-[#5D4037] text-white"
                  : "text-[#8D6E63] hover:bg-[#F9F6F1]"
              }`}
              id="lang_en"
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("ml")}
              className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wider uppercase transition duration-300 cursor-pointer ${
                currentLanguage === "ml"
                  ? "bg-[#5D4037] text-white"
                  : "text-[#C29200] hover:bg-[#F9F6F1]"
              }`}
              id="lang_ml"
            >
              മലയാളം
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("te")}
              className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wider uppercase transition duration-300 cursor-pointer ${
                currentLanguage === "te"
                  ? "bg-[#5D4037] text-white"
                  : "text-[#8D6E63] hover:bg-[#F9F6F1]"
              }`}
              id="lang_te"
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>

    {/* SINGLE CONSOLIDATED ASTRO-CHRONOMETER BANNER BOX - moved down to the page as a clean floating block */}
    <div className="w-full max-w-3xl mx-auto px-4 md:px-6 mt-6 animate-fade-in" id="moved_astro_chronometer_container">
      {/* SINGLE CONSOLIDATED ASTRO-CHRONOMETER BANNER BOX */}
      <div
        className="relative overflow-visible rounded-3xl border border-[#D4C3A3] bg-[#FCF8F2] p-5 text-xs text-[#2D241E] shadow-sm w-full shrink-0"
        id="integrated_astro_banner_box"
      >
        <div className="relative z-10 flex flex-col gap-3.5">
              {/* INTEGRATED LOCATION & CURRENT MUHURTA STANDALONE BOX */}
              <div
                className="relative overflow-visible rounded-2xl border border-[#D4C3A3]/40 bg-white/70 p-4 text-xs text-[#2D241E] w-full shrink-0 shadow-inner"
                id="location_muhurta_standalone_box"
              >
                {isEditing ? (
                  <div className="relative z-10 flex flex-col gap-3">
                    {/* Place Picker: Selection controls inside the single box */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-[#8D6E63] font-serif font-bold">
                          {currentLanguage === "ml"
                            ? "സ്ഥലം / നഗരം തിരഞ്ഞെടുക്കുക"
                            : currentLanguage === "te"
                              ? "స్థలము / నగరం ఎంచుకోండి"
                              : "Select Place / City"}
                        </span>
                        {searchError && (
                          <span className="text-[9px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded animate-pulse border border-red-100">
                            {searchError}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          className="w-full rounded-lg border border-[#D4C3A3]/80 bg-white px-3 py-1.5 text-xs text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#8D6E63] font-sans shadow-inner"
                          value={editPlace}
                          onChange={(e) => setEditPlace(e.target.value)}
                          placeholder={
                            currentLanguage === "ml"
                              ? "സ്ഥലം ടൈപ്പ് ചെയ്യുക..."
                              : currentLanguage === "te"
                              ? "నగరం పేరు..."
                              : "e.g., Tirumala, Andhra Pradesh"
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSearchLocation();
                            }
                          }}
                          id="input_edit_place"
                        />
                        <button
                          type="button"
                          onClick={handleSearchLocation}
                          disabled={isSearchingApi}
                          className="p-2 bg-[#5D4037] hover:bg-[#4E342E] text-white rounded-lg transition duration-200 shrink-0 shadow-sm flex items-center justify-center font-bold cursor-pointer"
                          title={
                            currentLanguage === "ml"
                              ? "തിരയുക"
                              : currentLanguage === "te"
                                ? "വെతకండి"
                                : "Search"
                          }
                          id="btn_search_place"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Suggestions dropdown list */}
                    {suggestions.length > 0 && (
                      <div className="flex flex-col gap-1 border border-[#D4C3A3] bg-white rounded-xl p-2 max-h-[140px] overflow-y-auto mt-0.5 shadow-inner">
                        <div className="text-[8.5px] font-bold text-[#8D6E63] uppercase border-b border-dashed border-[#D4C3A3]/50 pb-1 mb-1 px-1">
                          {currentLanguage === "ml"
                            ? "പൊരുത്തപ്പെടുന്ന സ്ഥലങ്ങൾ:"
                            : currentLanguage === "te"
                              ? "സరిపోలే స్థానాలు:"
                              : "Select matching place:"}
                        </div>
                        {suggestions.map((s, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSelectSuggestion(s)}
                            className="text-left py-1.5 px-2 hover:bg-[#FCF3E3] rounded-lg text-[10.5px] text-[#5D4037] transition font-medium border-b border-neutral-100 last:border-0 truncate w-full cursor-pointer"
                            title={s.display_name}
                          >
                            {s.display_name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Coordinates Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-[#8D6E63] font-serif font-bold mb-1">
                          Latitude
                        </span>
                        <input
                          type="number"
                          step="any"
                          className="w-full rounded-lg border border-[#D4C3A3] bg-white px-2 py-1 text-xs text-[#2D241E] focus:outline-none font-mono shadow-inner"
                          value={editLat}
                          onChange={(e) => setEditLat(e.target.value)}
                          id="input_edit_lat"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-[#8D6E63] font-serif font-bold mb-1">
                          Longitude
                        </span>
                        <input
                          type="number"
                          step="any"
                          className="w-full rounded-lg border border-[#D4C3A3] bg-white px-2 py-1 text-xs text-[#2D241E] focus:outline-none font-mono shadow-inner"
                          value={editLng}
                          onChange={(e) => setEditLng(e.target.value)}
                          id="input_edit_lng"
                        />
                      </div>
                    </div>

                    {/* Edit Mode footer action bar */}
                    <div className="flex items-center justify-between border-t border-[#D4C3A3]/40 pt-2.5 mt-1">
                      <button
                        type="button"
                        onClick={handleUseDeviceLocation}
                        disabled={isSearchingApi}
                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-[#8D6E63] hover:bg-[#FAF0E2] rounded-lg border border-[#D4C3A3]/60 bg-white transition shrink-0 cursor-pointer shadow-3ws"
                        title={
                          currentLanguage === "ml"
                            ? "ജിപിഎസ് ഉപയോഗിക്കുക"
                            : currentLanguage === "te"
                              ? "GPS వాడండి"
                              : "Use device GPS"
                        }
                        id="btn_use_gps_loc"
                      >
                        <Navigation className="h-3 w-3 text-[#5D4037]" />
                        GPS
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setSuggestions([]);
                          }}
                          className="px-3 py-1 text-[10px] font-bold text-[#8D6E63] hover:bg-[#D4C3A3]/20 rounded-lg transition cursor-pointer"
                          id="btn_cancel_edit"
                        >
                          {currentLanguage === "ml"
                            ? "റദ്ദാക്കുക"
                            : currentLanguage === "te"
                              ? "రద్దు"
                              : "Cancel"}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveLocation}
                          disabled={isSearchingApi}
                          className="px-4 py-1 text-[10px] font-bold bg-[#5D4037] text-white hover:bg-[#4E342E] rounded-lg transition shadow-sm shrink-0 cursor-pointer"
                          id="btn_save_edit"
                        >
                          {currentLanguage === "ml"
                            ? "സേവ്"
                            : currentLanguage === "te"
                              ? "సేവ്"
                              : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-[#5D4037] flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <MapPin className="h-4 w-4 text-[#8D6E63] shrink-0" />
                        <span
                          className="font-serif font-extrabold text-sm tracking-wide text-[#5D4037]"
                          title={locationDetails.placeName}
                          id="banner_place_name"
                        >
                          {locationDetails.placeName}
                        </span>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditPlace(locationDetails.placeName);
                            setEditLat(locationDetails.lat.toFixed(4));
                            setEditLng(locationDetails.lng.toFixed(4));
                            setSearchError("");
                          }}
                          className="p-1 px-1.5 text-[#8D6E63] hover:text-[#5D4037] hover:bg-white border border-[#D4C3A3]/45 bg-white/50 rounded-md transition shrink-0 ml-1.5 pointer-events-auto cursor-pointer shadow-3ws"
                          title={
                            currentLanguage === "ml"
                              ? "സ്ഥലം മാറ്റുക"
                              : currentLanguage === "te"
                                ? "స్థానాన్ని మార్చు"
                                : "Change Location"
                          }
                          id="btn_enable_edit"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </button>
                      </div>

                      {activeMuhurta && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#5D4037] bg-white/90 border border-[#D4C3A3]/65 rounded-lg px-2.5 py-1 font-sans sm:ml-4 shadow-3ws">
                          <span className="font-bold text-[#8D6E63]">
                            {currentLanguage === "ml"
                              ? "ഇപ്പോഴത്തെ മുഹൂർത്തം:"
                              : currentLanguage === "te"
                                ? "ప్రస్తుత ముహూర్తం:"
                                : "Current Muhurta:"}
                          </span>
                          <span className="font-bold text-[#5D4037]">
                            #{activeMuhurta.index} {activeMuhurta.nameEnglish} ({activeMuhurta.nameSanskrit})
                          </span>
                          <span className="text-[#8D6E63] font-normal">
                            {currentLanguage === "ml"
                              ? "അധിപൻ:"
                              : currentLanguage === "te"
                                ? "అధిపతి:"
                                : "Deity:"} {currentLanguage === "ml"
                            ? activeMuhurta.deityMalayalam
                            : currentLanguage === "te"
                              ? activeMuhurta.deityTelugu
                              : activeMuhurta.deityEnglish}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-800 font-bold bg-white/80 px-1.5 py-0.2 rounded border border-[#D4C3A3]/30">
                            ⏱️ {activeMuhurta.startTimeStr} - {activeMuhurta.endTimeStr}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold border ${
                            activeMuhurta.quality === "Highly Auspicious"
                              ? "bg-amber-100 text-amber-950 border-amber-300 shadow-sm"
                              : activeMuhurta.quality === "Shubha"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}>
                            {currentLanguage === "ml"
                              ? (activeMuhurta.quality === "Highly Auspicious" ? "അതിശുഭം" : activeMuhurta.quality === "Shubha" ? "ശുഭം" : "അശുഭം")
                              : currentLanguage === "te"
                                ? (activeMuhurta.quality === "Highly Auspicious" ? "అత్యంత శుభం" : activeMuhurta.quality === "Shubha" ? "శుభం" : "అశుభం")
                                : activeMuhurta.quality}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View more / Hide toggle button styled elegantly in alignment with the offline/online divine theme */}
              <div className="w-full flex justify-center py-1" id="astro_view_more_btn_container">
                <button
                  type="button"
                  onClick={() => setShowMore(!showMore)}
                  className="flex items-center gap-1.5 px-5 py-2 hover:scale-[1.02] active:scale-95 text-[10.5px] font-extrabold uppercase tracking-wider rounded-xl bg-[#5D4037] text-[#FCF8F2] hover:bg-[#4E342E] transition-all duration-300 shadow-md cursor-pointer border border-[#D4C3A3]/40"
                  id="btn_toggle_astro_details"
                >
                  {showMore ? (
                    <>
                      <span>
                        {currentLanguage === "ml"
                          ? "വിവരങ്ങൾ മറയ്ക്കുക"
                          : currentLanguage === "te"
                            ? "సమాచారాన్ని దాచండి"
                            : "Hide details"}
                      </span>
                      <ChevronUp className="h-3.5 w-3.5 stroke-[2.5]" />
                    </>
                  ) : (
                    <>
                      <span>
                        {currentLanguage === "ml"
                          ? "കൂടുതൽ വിവരങ്ങൾ കാണുക"
                          : currentLanguage === "te"
                            ? "మరింత సమాచారం"
                            : "View more"}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

              {showMore && (
                <div className="flex flex-col gap-3.5 animate-fade-in w-full" id="expanded_astro_grid_wrapper">
                  {/* Divider line before Three-Column Astro Grid */}
                  <div className="w-full border-t border-[#D4C3A3]/30 my-1"></div>

                  {/* THREE-COLUMN INTEGRATED ASTRO GRAPH */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full">
                    {/* Column 1: live ticking time info */}
                    <div className="flex flex-col justify-center bg-white/70 border border-[#D4C3A3]/30 rounded-xl p-3 shadow-inner">
                      <span className="text-[9px] uppercase tracking-wider text-[#8D6E63] font-serif font-bold mb-1">
                        {currentLanguage === "ml"
                          ? "ഇപ്പോഴത്തെ സമയം"
                          : currentLanguage === "te"
                            ? "ప్రస్తుత సమయం"
                            : "Live Gregorian Info"}
                      </span>
                      {/* Day and Date */}
                      <div className="flex items-baseline gap-1.5 text-xs text-[#5D4037] mb-0.5 font-medium">
                        <span className="font-bold text-[#C29200]">
                          {localInfo.day}
                        </span>
                        <span className="text-[#8D6E63]">•</span>
                        <span className="font-serif font-semibold">{localInfo.date}</span>
                      </div>
                      {/* Digital clock readout */}
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#F1E9DB] bg-[#2D241E] border border-[#2D241E] rounded-lg px-2.5 py-1.5 w-fit mt-1 shadow-inner">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{localInfo.time}</span>
                        <span className="text-[9px] text-[#C29200] font-bold ml-1">
                          {localInfo.tz}
                        </span>
                      </div>
                    </div>

                    {/* Column 2: Helio Sunrise, Sunset & Rahu Kalam */}
                    <div className="flex flex-col justify-between bg-white/70 border border-[#D4C3A3]/30 rounded-xl p-3 shadow-inner">
                      {/* Sunrise & Sunset Grid */}
                      <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#D4C3A3]/25">
                        {/* Sunrise */}
                        <div className="flex flex-col justify-center">
                          <span className="text-[9px] uppercase tracking-wider text-[#8D6E63] font-serif font-bold flex items-center gap-1">
                            <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            {t.sunrise}
                          </span>
                          <span className="text-xs font-extrabold text-orange-700 font-mono mt-1">
                            {locationDetails.sunrise}
                          </span>
                          <span className="text-[8.5px] text-[#8D6E63] mt-0.5">
                            {currentLanguage === "ml"
                              ? "ഉദയം"
                              : currentLanguage === "te"
                                ? "ఉదయం"
                                : "Udayam"}
                          </span>
                        </div>

                        {/* Sunset */}
                        <div className="flex flex-col justify-center border-l border-[#D4C3A3]/40 pl-2.5">
                          <span className="text-[9px] uppercase tracking-wider text-[#8D6E63] font-serif font-bold flex items-center gap-1">
                            <Moon className="h-3.5 w-3.5 text-purple-900 shrink-0" />
                            {t.sunset}
                          </span>
                          <span className="text-xs font-extrabold text-purple-900 font-mono mt-1">
                            {locationDetails.sunset}
                          </span>
                          <span className="text-[8.5px] text-[#8D6E63] mt-0.5">
                            {currentLanguage === "ml"
                              ? "അസ്തമയം"
                              : currentLanguage === "te"
                                ? "అస్తమయం"
                                : "Astamayam"}
                          </span>
                        </div>
                      </div>

                      {/* Custom CSS Style block for precise traditional blinking */}
                      <style>{`
                        @keyframes traditionalBlink {
                          0%, 100% { opacity: 1; }
                          50% { opacity: 0.25; }
                        }
                        .animate-blink-label {
                          animation: traditionalBlink 1.4s ease-in-out infinite;
                        }
                      `}</style>

                      {/* Tri-Kalam Timings List (Rahu, Gulika, Yama) */}
                      <div className="flex flex-col gap-1.5 pt-2 justify-start">
                        {/* Rahu Kalam */}
                        <div className="flex items-center justify-between gap-1 border-b border-[#D4C3A3]/10 pb-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-[9.5px] uppercase tracking-wider font-serif font-black flex items-center gap-1 shrink-0 ${triKalamData.rahu.isActive ? "animate-blink-label bg-red-100 px-1 py-0.5 rounded text-red-900 border border-red-300 shadow-3xs" : "text-red-800"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${triKalamData.rahu.isActive ? "bg-red-700 animate-ping" : "bg-red-500"} shrink-0`}></span>
                              {currentLanguage === "ml"
                                ? "രാഹുകാലം:"
                                : currentLanguage === "te"
                                  ? "రాహుకాలం:"
                                  : "Rahu Kalam:"}
                            </span>
                            <span className={`text-[10px] font-extrabold font-mono ${triKalamData.rahu.isActive ? "text-red-900 animate-blink-label" : "text-[#4E342E]"}`}>
                              {triKalamData.rahu.display}
                            </span>
                          </div>
                        </div>

                        {/* Gulika Kalam */}
                        <div className="flex items-center justify-between gap-1 border-b border-[#D4C3A3]/10 pb-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-[9.5px] uppercase tracking-wider font-serif font-black flex items-center gap-1 shrink-0 ${triKalamData.gulika.isActive ? "animate-blink-label bg-amber-100 px-1 py-0.5 rounded text-amber-900 border border-amber-300 shadow-3xs" : "text-amber-800"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${triKalamData.gulika.isActive ? "bg-amber-600 animate-ping" : "bg-amber-500"} shrink-0`}></span>
                              {currentLanguage === "ml"
                                ? "ഗുളികകാലം:"
                                : currentLanguage === "te"
                                  ? "గుళికా కాలం:"
                                  : "Gulika Kalam:"}
                            </span>
                            <span className={`text-[10px] font-extrabold font-mono ${triKalamData.gulika.isActive ? "text-amber-900 animate-blink-label" : "text-[#4E342E]"}`}>
                              {triKalamData.gulika.display}
                            </span>
                          </div>
                        </div>

                        {/* Yamagandam */}
                        <div className="flex items-center justify-between gap-1 border-b border-[#D4C3A3]/10 pb-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-[9.5px] uppercase tracking-wider font-serif font-black flex items-center gap-1 shrink-0 ${triKalamData.yama.isActive ? "animate-blink-label bg-teal-100 px-1 py-0.5 rounded text-teal-900 border border-teal-300 shadow-3xs" : "text-teal-800"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${triKalamData.yama.isActive ? "bg-teal-600 animate-ping" : "bg-teal-500"} shrink-0`}></span>
                              {currentLanguage === "ml"
                                ? "യമകണ്ടകം:"
                                : currentLanguage === "te"
                                  ? "యమగండం:"
                                  : "Yamagandam:"}
                            </span>
                            <span className={`text-[10px] font-extrabold font-mono ${triKalamData.yama.isActive ? "text-teal-900 animate-blink-label" : "text-[#4E342E]"}`}>
                              {triKalamData.yama.display}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Sidereal Panchanga Almanac */}
                    <div className="flex flex-col justify-between bg-[#FAF0E2] border border-[#D4C3A3]/60 rounded-xl p-3 shadow-inner text-left">
                      {/* Malayalam Date */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">📅</span>
                        <span className="font-serif font-bold text-[10.5px] text-[#5D4037]">
                          {currentLanguage === "ml" ? (
                            `കൊല്ലവർഷം ${keralaCalendarDetails.meYear}, ${keralaCalendarDetails.month.ml} ${keralaCalendarDetails.dateValue}`
                          ) : currentLanguage === "te" ? (
                            `మలయాళ శకం ${keralaCalendarDetails.meYear}, ${keralaCalendarDetails.month.name} ${keralaCalendarDetails.dateValue}`
                          ) : (
                            `Kollavarsham ${keralaCalendarDetails.meYear}, ${keralaCalendarDetails.month.name} ${keralaCalendarDetails.dateValue}`
                          )}
                        </span>
                      </div>

                      {/* Nakshatra (Star) */}
                      <div className="flex items-center gap-1.5 border-t border-[#D4C3A3]/30 pt-1.5 mt-1.5">
                        <Sparkles className="h-3 w-3 text-[#C29200] shrink-0" />
                        <span className="font-serif font-bold text-[10.5px] text-[#5D4037]">
                          {currentLanguage === "ml" ? (
                            `നക്ഷത്രം: ${keralaCalendarDetails.nakshatra.ml} (പാദം ${keralaCalendarDetails.padham})`
                          ) : currentLanguage === "te" ? (
                            `నక్షత్రం: ${keralaCalendarDetails.nakshatra.te} (పాదం ${keralaCalendarDetails.padham})`
                          ) : (
                            `Nakshatra: ${keralaCalendarDetails.nakshatra.en} (Padam ${keralaCalendarDetails.padham})`
                          )}
                        </span>
                      </div>

                      {/* Thidhi */}
                      <div className="flex items-center gap-1.5 border-t border-[#D4C3A3]/30 pt-1.5 mt-1.5">
                        <Moon className="h-3 w-3 text-[#C29200] shrink-0" />
                        <span className="font-serif font-bold text-[10.5px] text-[#5D4037]">
                          {currentLanguage === "ml" ? (
                            `തിഥി: ${keralaCalendarDetails.tithi.ml} (${keralaCalendarDetails.paksha.ml})`
                          ) : currentLanguage === "te" ? (
                            `తిథి: ${keralaCalendarDetails.tithi.te} (${keralaCalendarDetails.paksha.te})`
                          ) : (
                            `Thidhi: ${keralaCalendarDetails.tithi.en} (${keralaCalendarDetails.paksha.en})`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
