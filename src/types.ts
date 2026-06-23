export interface BirthInfo {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  selectedLanguage: 'en' | 'ml' | 'te';
}

export interface PlanetDetail {
  id: string;
  symbol: string;
  nameEnglish: string;
  nameSanskrit: string;
  nameMalayalam: string;
  nameTelugu: string;
  modernScientificName: string;
  currentConstellation: string;
  declination: string;
  rightAscension: string;
  orbitalVelocity: string;
  distanceFromEarth: string;
  astrologicalSign: string;
  houseNumber: number; // 1-12 in the South Indian grid
  significance: string;
  longitude?: number;
}

export function estimateTimezoneOffset(lat: number, lng: number): number {
  // 1. India: Indian Standard Time (IST) is UTC+5.5
  if (lng > 68 && lng < 89 && lat > 5 && lat < 36) {
    return 5.5;
  }

  // 2. Australia: AWST (+8), ACST (+9.5), AEST (+10)
  // Australia is south of the equator (lat < 0) and east (lng > 110)
  if (lat > -48 && lat < -10 && lng > 110 && lng < 155) {
    if (lng >= 110 && lng < 129) {
      return 8.0; // AWST (Perth)
    }
    if (lng >= 129 && lng < 141) {
      return 9.5; // ACST (Adelaide, Darwin)
    }
    if (lng >= 141 && lng < 155) {
      return 10.0; // AEST (Sydney, Melbourne, Brisbane)
    }
  }

  // 3. North America Estimations (USA / Canada)
  if (lat > 24 && lat < 60 && lng > -130 && lng < -50) {
    if (lng >= -85 && lng < -50) {
      return -5.0; // Eastern Time (EST)
    }
    if (lng >= -102.5 && lng < -85) {
      return -6.0; // Central Time (CST)
    }
    if (lng >= -115 && lng < -102.5) {
      return -7.0; // Mountain Time (MST)
    }
    if (lng >= -130 && lng < -115) {
      return -8.0; // Pacific Time (PST)
    }
  }

  // Alaska & Hawaii
  if (lng >= -172 && lng < -130 && lat > 50 && lat < 72) {
    return -9.0; // Alaska (AKST)
  }
  if (lng >= -162 && lng < -154 && lat > 18 && lat < 23) {
    return -10.0; // Hawaii (HAST)
  }

  // 4. Europe / UK
  if (lat > 35 && lat < 75 && lng > -10 && lng < 40) {
    if (lng >= -10 && lng < 2) {
      return 0.0; // GMT/WET
    }
    if (lng >= 2 && lng < 22.5) {
      return 1.0; // CET
    }
    if (lng >= 22.5 && lng < 40) {
      return 2.0; // EET
    }
  }

  // Fallback: Standardized longitude rounding to nearest half-hour
  const rawOffsetHours = lng / 15;
  return Math.round(rawOffsetHours * 2) / 2;
}
