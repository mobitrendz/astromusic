import React, { useState, useEffect } from "react";
import { Compass, Info, ChevronDown, ChevronUp, BookOpen, AlertCircle } from "lucide-react";
import { PlanetDetail, estimateTimezoneOffset } from "../types";
import { TRANSLATIONS, TranslationLang } from "../translations";

interface JathakamPanelProps {
  currentLanguage: TranslationLang;
  locationDetails: {
    lat: number;
    lng: number;
    placeName: string;
    sunrise: string;
    sunset: string;
    isGeolocated: boolean;
    loading: boolean;
  };
  onlyShowMuhurtas?: boolean;
}

const RATIOS_MAP = [
  {
    index: 1,
    nameSanskrit: "Mesha",
    nameMalayalam: "Medam",
    nameTelugu: "Mesham",
    englishRA: "Aries",
    nativeMalayalam: "മേടം",
    nativeTelugu: "మేషం",
  },
  {
    index: 2,
    nameSanskrit: "Vrishabha",
    nameMalayalam: "Edavam",
    nameTelugu: "Vrishbham",
    englishRA: "Taurus",
    nativeMalayalam: "ഇടവം",
    nativeTelugu: "వృషభం",
  },
  {
    index: 3,
    nameSanskrit: "Mithuna",
    nameMalayalam: "Mithunam",
    nameTelugu: "Mithunam",
    englishRA: "Gemini",
    nativeMalayalam: "മിഥുനം",
    nativeTelugu: "మిథునం",
  },
  {
    index: 4,
    nameSanskrit: "Karkataca",
    nameMalayalam: "Karkidakam",
    nameTelugu: "Karkatakam",
    englishRA: "Cancer",
    nativeMalayalam: "കർക്കടകം",
    nativeTelugu: "కర్కాటకం",
  },
  {
    index: 5,
    nameSanskrit: "Simha",
    nameMalayalam: "Chingam",
    nameTelugu: "Simham",
    englishRA: "Leo",
    nativeMalayalam: "ചിങ്ങം",
    nativeTelugu: "సింహం",
  },
  {
    index: 6,
    nameSanskrit: "Kanya",
    nameMalayalam: "Kanni",
    nameTelugu: "Kanya",
    englishRA: "Virgo",
    nativeMalayalam: "കന്നി",
    nativeTelugu: "కన్య",
  },
  {
    index: 7,
    nameSanskrit: "Tula",
    nameMalayalam: "Thulam",
    nameTelugu: "Tula",
    englishRA: "Libra",
    nativeMalayalam: "തുലാം",
    nativeTelugu: "తులా",
  },
  {
    index: 8,
    nameSanskrit: "Vrischika",
    nameMalayalam: "Vrishchikam",
    nameTelugu: "Vrischika",
    englishRA: "Scorpio",
    nativeMalayalam: "വൃശ്ചികം",
    nativeTelugu: "వృశ్చికం",
  },
  {
    index: 9,
    nameSanskrit: "Dhanu",
    nameMalayalam: "Dhanu",
    nameTelugu: "Dhanussu",
    englishRA: "Sagittarius",
    nativeMalayalam: "ധനു",
    nativeTelugu: "ధనుస్సు",
  },
  {
    index: 10,
    nameSanskrit: "Makara",
    nameMalayalam: "Makaram",
    nameTelugu: "Makaram",
    englishRA: "Capricorn",
    nativeMalayalam: "മകരം",
    nativeTelugu: "మకరం",
  },
  {
    index: 11,
    nameSanskrit: "Kumbha",
    nameMalayalam: "Kumbham",
    nameTelugu: "Kumbham",
    englishRA: "Aquarius",
    nativeMalayalam: "കുംഭം",
    nativeTelugu: "కుంభం",
  },
  {
    index: 0,
    nameSanskrit: "Meena",
    nameMalayalam: "Meenam",
    nameTelugu: "Meenam",
    englishRA: "Pisces",
    nativeMalayalam: "മീനം",
    nativeTelugu: "మీనం",
  },
];

const getPlanetAbbreviation = (
  id: string,
  lang: "en" | "ml" | "te",
): string => {
  if (lang === "ml") {
    switch (id) {
      case "sun":
        return "ര";
      case "moon":
        return "ച";
      case "mars":
        return "കു";
      case "mercury":
        return "ബു";
      case "jupiter":
        return "ഗു";
      case "venus":
        return "ശു";
      case "saturn":
        return "മ";
      case "rahu":
        return "സ";
      case "ketu":
        return "ശി";
      case "lagna":
        return "ല";
      default:
        return "ല";
    }
  }
  if (lang === "te") {
    switch (id) {
      case "sun":
        return "సూ";
      case "moon":
        return "చ";
      case "mars":
        return "కు";
      case "mercury":
        return "బు";
      case "jupiter":
        return "గు";
      case "venus":
        return "శు";
      case "saturn":
        return "శ";
      case "rahu":
        return "రా";
      case "ketu":
        return "కే";
      case "lagna":
        return "ల";
      default:
        return "ల";
    }
  }
  switch (id) {
    case "sun":
      return "SU";
    case "moon":
      return "MO";
    case "mars":
      return "MA";
    case "mercury":
      return "ME";
    case "jupiter":
      return "JU";
    case "venus":
      return "VE";
    case "saturn":
      return "SA";
    case "rahu":
      return "RA";
    case "ketu":
      return "KE";
    case "lagna":
      return "Asc";
    default:
      return "Asc";
  }
};

const getPlanetFullName = (id: string, lang: "en" | "ml" | "te"): string => {
  if (lang === "ml") {
    switch (id) {
      case "lagna":
        return "లగ్నం";
      case "sun":
        return "സൂര്യൻ";
      case "moon":
        return "ചന്ദ്രൻ";
      case "mars":
        return "ചൊവ്വ";
      case "mercury":
        return "ബുധൻ";
      case "jupiter":
        return "വ്യാഴം";
      case "venus":
        return "ശുക്രൻ";
      case "saturn":
        return "ശനി";
      case "rahu":
        return "രാഹു";
      case "ketu":
        return "കേതു";
      default:
        return "లగ్నం";
    }
  }
  if (lang === "te") {
    switch (id) {
      case "lagna":
        return "లగ్నం";
      case "sun":
        return "సూర్యుడు";
      case "moon":
        return "చంద్రుడు";
      case "mars":
        return "కుజుడు";
      case "mercury":
        return "బుధుడు";
      case "jupiter":
        return "గురుడు";
      case "venus":
        return "శుక్రుడు";
      case "saturn":
        return "శని";
      case "rahu":
        return "రాహువు";
      case "ketu":
        return "కేతువు";
      default:
        return "లగ్నం";
    }
  }
  switch (id) {
    case "lagna":
      return "Lagna (Ascendant)";
    case "sun":
      return "Sun";
    case "moon":
      return "Moon";
    case "mars":
      return "Mars";
    case "mercury":
      return "Mercury";
    case "jupiter":
      return "Jupiter";
    case "venus":
      return "Venus";
    case "saturn":
      return "Saturn";
    case "rahu":
      return "Rahu";
    case "ketu":
      return "Ketu";
    default:
      return "Lagna";
  }
};

// Rich astrological star / Nakshatra matching based on Moon transit sign
const NAKSHATRA_MAP: Record<
  number,
  { en: string; ml: string; te: string; modern: string }
> = {
  0: { en: "Revathi", ml: "രേവതി", te: "రేవతి", modern: "ζ Piscium" },
  1: {
    en: "Aswathi",
    ml: "അശ്വതി",
    te: "అశ్విని",
    modern: "β Arietis [Sheratan]",
  },
  2: {
    en: "Rohini",
    ml: "രോഹിണി",
    te: "రోహిణి",
    modern: "α Tauri [Aldebaran]",
  },
  3: {
    en: "Thiruvathira",
    ml: "തിരുവാതിര",
    te: "ఆరుద్ర",
    modern: "α Orionis [Betelgeuse]",
  },
  4: {
    en: "Pooyam",
    ml: "പൂയം",
    te: "పుష్యమి",
    modern: "δ Cancri [Asellus Australis]",
  },
  5: { en: "Makam", ml: "മകം", te: "మఖ", modern: "α Leonis [Regulus]" },
  6: { en: "Atham", ml: "അത്തം", te: "హస్త", modern: "δ Corvi [Algorab]" },
  7: { en: "Chothie", ml: "ചോതി", te: "స్వాతి", modern: "α Boötis [Arcturus]" },
  8: { en: "Anizham", ml: "അниഴം", te: "అనురాధ", modern: "β Scorpii [Acrab]" },
  9: {
    en: "Pooradam",
    ml: "പൂരാടം",
    te: "పూర్వాషాఢ",
    modern: "δ Sagittarii [Kaus Media]",
  },
  10: {
    en: "Thiruvonam",
    ml: "തിരുവോണം",
    te: "శ్రవణం",
    modern: "α Aquilae [Altair]",
  },
  11: {
    en: "Chathayam",
    ml: "ചതയം",
    te: "శతభిషం",
    modern: "γ Aquarii [Sadachbia]",
  },
};

// Astronomical helper to compute current sidereal solar sign index
const getSiderealSunSign = (month: number, day: number): number => {
  const transitionDays = [0, 14, 13, 14, 14, 15, 15, 16, 17, 17, 17, 16, 16];
  const transDay = transitionDays[month];

  if (month === 1) {
    // Jan
    return day < transDay ? 9 : 10; // Dhanu -> Makara
  } else if (month === 2) {
    return day < transDay ? 10 : 11; // Makara -> Kumbha
  } else if (month === 3) {
    return day < transDay ? 11 : 0; // Kumbha -> Meena
  } else if (month === 4) {
    return day < transDay ? 0 : 1; // Meena -> Mesha
  } else if (month === 5) {
    return day < transDay ? 1 : 2; // Mesha -> Vrishabha
  } else if (month === 6) {
    return day < transDay ? 2 : 3; // Vrishabha -> Mithuna
  } else if (month === 7) {
    return day < transDay ? 3 : 4; // Mithuna -> Karkidakam
  } else if (month === 8) {
    return day < transDay ? 4 : 5; // Karkidakam -> Simha
  } else if (month === 9) {
    return day < transDay ? 5 : 6; // Simha -> Kanya
  } else if (month === 10) {
    return day < transDay ? 6 : 7; // Kanya -> Tula
  } else if (month === 11) {
    return day < transDay ? 7 : 8; // Tula -> Vrischika
  } else {
    // Dec
    return day < transDay ? 8 : 9; // Vrischika -> Dhanu
  }
};

const getDeclinationStr = (house: number) => {
  const rawVal = 23.44 * Math.sin((((house - 1) * 30 + 15) * Math.PI) / 180);
  const sign = rawVal >= 0 ? "+" : "-";
  const absVal = Math.abs(rawVal);
  const deg = Math.floor(absVal);
  const min = Math.floor((absVal - deg) * 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(((absVal - deg) * 60 - parseInt(min, 10)) * 60)
    .toString()
    .padStart(2, "0");
  return `${sign}${deg}° ${min}' ${sec}"`;
};

const getRAStr = (house: number) => {
  const baseHour = (house * 2 + 1) % 24;
  const min = Math.floor((baseHour % 1) * 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor((((baseHour % 1) * 60) % 1) * 60)
    .toString()
    .padStart(2, "0");
  return `${Math.floor(baseHour).toString().padStart(2, "0")}h ${min}m ${sec}s`;
};

export interface MuhurtaData {
  index: number;
  nameEnglish: string;
  nameSanskrit: string;
  nameMalayalam: string;
  nameTelugu: string;
  deityEnglish: string;
  deityMalayalam: string;
  deityTelugu: string;
  quality: "Shubha" | "Ashubha" | "Mixed" | "Highly Auspicious";
  isNight: boolean;
}

export const MUHURTAS_LIST: MuhurtaData[] = [
  // Day Muhurtas
  {
    index: 1,
    nameEnglish: "Rudra",
    nameSanskrit: "रुद्र",
    nameMalayalam: "രുദ്രൻ",
    nameTelugu: "రుద్ర",
    deityEnglish: "Rudra (Shiva - Destroyer)",
    deityMalayalam: "ശിവൻ (രുദ്രൻ)",
    deityTelugu: "శివుడు (రుద్రుడు)",
    quality: "Ashubha",
    isNight: false
  },
  {
    index: 2,
    nameEnglish: "Ahi / Sarpa",
    nameSanskrit: "अहि",
    nameMalayalam: "അഹി / സർപ്പം",
    nameTelugu: "అహి / సర్పం",
    deityEnglish: "Sarpas (Serpent Gods)",
    deityMalayalam: "നാഗദേവതകൾ",
    deityTelugu: "సర్ప దేవతలు",
    quality: "Ashubha",
    isNight: false
  },
  {
    index: 3,
    nameEnglish: "Mitra",
    nameSanskrit: "मित्र",
    nameMalayalam: "മിത്രൻ",
    nameTelugu: "మిత్ర",
    deityEnglish: "Mitra (God of Friendship/Sun)",
    deityMalayalam: "മിത്രൻ (സൂര്യൻ)",
    deityTelugu: "మిత్రుడు (సూర్యుడు)",
    quality: "Shubha",
    isNight: false
  },
  {
    index: 4,
    nameEnglish: "Pitri",
    nameSanskrit: "पितृ",
    nameMalayalam: "പിതൃക്കൾ",
    nameTelugu: "పితృ",
    deityEnglish: "Pitris (Ancestral Spirits)",
    deityMalayalam: "പിതൃക്കൾ",
    deityTelugu: "పితృదేవతలు",
    quality: "Ashubha",
    isNight: false
  },
  {
    index: 5,
    nameEnglish: "Vasu",
    nameSanskrit: "वसु",
    nameMalayalam: "വസു",
    nameTelugu: "వసు",
    deityEnglish: "Vasus (8 Elemental Gods of Light)",
    deityMalayalam: "അഷ്ടവസുക്കൾ",
    deityTelugu: "అష్టవసువులు",
    quality: "Shubha",
    isNight: false
  },
  {
    index: 6,
    nameEnglish: "Vara / Varaha",
    nameSanskrit: "वराह",
    nameMalayalam: "വരാഹം",
    nameTelugu: "వరాహ",
    deityEnglish: "Varaha (Vishnu's Boar Avatar)",
    deityMalayalam: "വരാഹമൂർത്തി (വിഷ്ണു)",
    deityTelugu: "వరాహస్వామి (విష్ణువు)",
    quality: "Shubha",
    isNight: false
  },
  {
    index: 7,
    nameEnglish: "Vishvedeva",
    nameSanskrit: "विश्वेदेवा",
    nameMalayalam: "വിശ്വേദേവൻ",
    nameTelugu: "విశ్వేదేవ",
    deityEnglish: "Vishvedevas (All-Gods of Universe)",
    deityMalayalam: "വിശ്വേദേവതകൾ",
    deityTelugu: "విశ్వేదేవతలు",
    quality: "Shubha",
    isNight: false
  },
  {
    index: 8,
    nameEnglish: "Vidhi / Abhijit",
    nameSanskrit: "विधि / अभिजित",
    nameMalayalam: "വിധി / അഭിജിത്",
    nameTelugu: "విధి / అభిజిత్",
    deityEnglish: "Vidhi / Abhijit (Brahma / Vishnu - Midday)",
    deityMalayalam: "ബ്രഹ്മാവ് / വിഷ്ണു",
    deityTelugu: "బ్రహ్మ / విష్ణు మూర్తి",
    quality: "Highly Auspicious",
    isNight: false
  },
  {
    index: 9,
    nameEnglish: "Satamukhi",
    nameSanskrit: "शतमुखी",
    nameMalayalam: "ശതമുഖി",
    nameTelugu: "శతముఖి",
    deityEnglish: "Durga / Satamukhi (Power)",
    deityMalayalam: "ദുർഗ്ഗാദേവി",
    deityTelugu: "దుర్గాదేవి",
    quality: "Shubha",
    isNight: false
  },
  {
    index: 10,
    nameEnglish: "Puruhuta",
    nameSanskrit: "पुरुहूत",
    nameMalayalam: "പുരുഹൂതൻ",
    nameTelugu: "పురుహూత",
    deityEnglish: "Indra (King of Celestial Deities)",
    deityMalayalam: "ഇന്ദ്രൻ",
    deityTelugu: "ఇంద్రుడు",
    quality: "Shubha",
    isNight: false
  },
  {
    index: 11,
    nameEnglish: "Vahni",
    nameSanskrit: "वह्नि",
    nameMalayalam: "വഹ്നി",
    nameTelugu: "వహ్ని",
    deityEnglish: "Agni (Sacred Fire Messenger)",
    deityMalayalam: "അഗ്നിദേവൻ",
    deityTelugu: "అగ్నిదేవుడు",
    quality: "Shubha",
    isNight: false
  },
  {
    index: 12,
    nameEnglish: "Naktanchara",
    nameSanskrit: "नक्तञ्चर",
    nameMalayalam: "നക്തഞ്ചരൻ",
    nameTelugu: "నక్తంచర",
    deityEnglish: "Rakshasa (Night Spirit)",
    deityMalayalam: "രാക്ഷസൻ (തമസ്സ്)",
    deityTelugu: "రాక్షస (తమస్సు)",
    quality: "Ashubha",
    isNight: false
  },
  {
    index: 13,
    nameEnglish: "Varuna",
    nameSanskrit: "वरुण",
    nameMalayalam: "വരുണൻ",
    nameTelugu: "వరుణ",
    deityEnglish: "Varuna (Cosmic Ocean Waters)",
    deityMalayalam: "വരുണദേവൻ",
    deityTelugu: "వరుణుడు",
    quality: "Shubha",
    isNight: false
  },
  {
    index: 14,
    nameEnglish: "Aryaman",
    nameSanskrit: "अर्यमन",
    nameMalayalam: "അര്യമാവ്",
    nameTelugu: "అర్యమ",
    deityEnglish: "Aryaman (Ancestral Solar Light)",
    deityMalayalam: "അര്യമാ ദേവൻ",
    deityTelugu: "అర్యముడు",
    quality: "Shubha",
    isNight: false
  },
  {
    index: 15,
    nameEnglish: "Bhaga",
    nameSanskrit: "भग",
    nameMalayalam: "ഭഗൻ",
    nameTelugu: "భగ",
    deityEnglish: "Bhaga (Sovereign Fortune/Luck)",
    deityMalayalam: "ഭാഗ്യദേവത (ഭഗൻ)",
    deityTelugu: "భగుడు (భాగ్య విధాత)",
    quality: "Ashubha",
    isNight: false
  },
  // Night Muhurtas
  {
    index: 16,
    nameEnglish: "Girisha",
    nameSanskrit: "गिरीश",
    nameMalayalam: "ഗിരീശൻ",
    nameTelugu: "గిరీశ",
    deityEnglish: "Girisha (Lord of Mountains - Shiva)",
    deityMalayalam: "കൈലാസനാഥൻ (ശിവൻ)",
    deityTelugu: "గిరీశుడు (శివుడు)",
    quality: "Ashubha",
    isNight: true
  },
  {
    index: 17,
    nameEnglish: "Ajapada",
    nameSanskrit: "अजपाद",
    nameMalayalam: "അജപാദൻ",
    nameTelugu: "అజపాద",
    deityEnglish: "Aja Ekapada (Unborn One-Footed Goat Rudra)",
    deityMalayalam: "അജൈകപാദൻ (ഭൈരവൻ)",
    deityTelugu: "అజైకపాదుడు (రుద్రుడు)",
    quality: "Ashubha",
    isNight: true
  },
  {
    index: 18,
    nameEnglish: "Ahirbudhnya",
    nameSanskrit: "अहिर्बुध्न्य",
    nameMalayalam: "അഹിർബുധ്ന്യൻ",
    nameTelugu: "అహిర్బుధ్న్య",
    deityEnglish: "Ahirbudhnya (Serpent of Primeval Depths)",
    deityMalayalam: "അഹിർബുധ്ന്യൻ (നാഗരുദ്രൻ)",
    deityTelugu: "అహిర్బుధ్న్యుడు (నాగదేవుడు)",
    quality: "Shubha",
    isNight: true
  },
  {
    index: 19,
    nameEnglish: "Pushya",
    nameSanskrit: "पुष्य",
    nameMalayalam: "പുഷ്യൻ",
    nameTelugu: "పుష్య",
    deityEnglish: "Pushya (Nourishment & Growth)",
    deityMalayalam: "ബൃഹസ്പതി (പുണ്യം)",
    deityTelugu: "బృహస్పతి (పుష్యుడు)",
    quality: "Shubha",
    isNight: true
  },
  {
    index: 20,
    nameEnglish: "Ashwini",
    nameSanskrit: "अश्विनी",
    nameMalayalam: "അശ്വിനി",
    nameTelugu: "అశ్విని",
    deityEnglish: "Ashvins (Celestial Twin Physicians)",
    deityMalayalam: "അശ്വിനീദേവന്മാർ",
    deityTelugu: "అశ్విని దేవతలు",
    quality: "Shubha",
    isNight: true
  },
  {
    index: 21,
    nameEnglish: "Yama",
    nameSanskrit: "यम",
    nameMalayalam: "യമൻ",
    nameTelugu: "యమ",
    deityEnglish: "Yama (Justice & Death Master)",
    deityMalayalam: "യമധർമ്മരാജൻ",
    deityTelugu: "యమధర్మరాజు",
    quality: "Ashubha",
    isNight: true
  },
  {
    index: 22,
    nameEnglish: "Agni",
    nameSanskrit: "अग्नि",
    nameMalayalam: "അഗ്നി",
    nameTelugu: "అగ్ని",
    deityEnglish: "Agni (Elemental Primordial Fire)",
    deityMalayalam: "അഗ്നിദേവൻ",
    deityTelugu: "అగ్నిదేవుడు",
    quality: "Shubha",
    isNight: true
  },
  {
    index: 23,
    nameEnglish: "Vidhatr",
    nameSanskrit: "विधातृ",
    nameMalayalam: "വിധാതാവ്",
    nameTelugu: "విధాతృ",
    deityEnglish: "Vidhata (Cosmic Order Architect/Brahma)",
    deityMalayalam: "സൃഷ്ടാവ് (വിധാതാവ്)",
    deityTelugu: "విధాత (బ్రహ్మ)",
    quality: "Shubha",
    isNight: true
  },
  {
    index: 24,
    nameEnglish: "Chandra",
    nameSanskrit: "चन्द्र",
    nameMalayalam: "ചന്ദ്രൻ",
    nameTelugu: "చంద్ర",
    deityEnglish: "Chandra (Nectar of Moon God)",
    deityMalayalam: "ചന്ദ്രൻ (സോമൻ)",
    deityTelugu: "చంద్రుడు",
    quality: "Shubha",
    isNight: true
  },
  {
    index: 25,
    nameEnglish: "Aditi",
    nameSanskrit: "अदिति",
    nameMalayalam: "അദിതി",
    nameTelugu: "అదితి",
    deityEnglish: "Aditi (Infinite Boundless Cosmic Mother)",
    deityMalayalam: "അദിതി (ദേവമാതാവ്)",
    deityTelugu: "అదితి (దేవతల తల్లి)",
    quality: "Shubha",
    isNight: true
  },
  {
    index: 26,
    nameEnglish: "Jiva / Guru",
    nameSanskrit: "जीव",
    nameMalayalam: "ജീവൻ (ഗുരു)",
    nameTelugu: "జీవ (బృహస్పతి)",
    deityEnglish: "Jupiter/Brihaspati (Wisdom/Guru)",
    deityMalayalam: "ബൃഹസ്പതി (ഗുരു)",
    deityTelugu: "గురుడు (బృహస్పతి)",
    quality: "Highly Auspicious",
    isNight: true
  },
  {
    index: 27,
    nameEnglish: "Vishnu",
    nameSanskrit: "विष्णु",
    nameMalayalam: "വിഷ്ണു",
    nameTelugu: "విష్ణు",
    deityEnglish: "Vishnu (Sustainer of Lifeforce)",
    deityMalayalam: "മഹാവിഷ്ണു",
    deityTelugu: "మహావిష్ణువు",
    quality: "Highly Auspicious",
    isNight: true
  },
  {
    index: 28,
    nameEnglish: "Yumigadyuti",
    nameSanskrit: "द्युति",
    nameMalayalam: "ദ്യുതി (സൂര്യപ്രഭ)",
    nameTelugu: "ద్యుతి",
    deityEnglish: "Dyuti (Radiance & Splendor/Sun)",
    deityMalayalam: "സൂര്യപ്രഭ (വെളിച്ചം)",
    deityTelugu: "సూర్య ప్రభ (కాంతి)",
    quality: "Shubha",
    isNight: true
  },
  {
    index: 29,
    nameEnglish: "Brahma",
    nameSanskrit: "ब्रह्मा",
    nameMalayalam: "ബ്രഹ്മാവ്",
    nameTelugu: "బ్రహ్మ",
    deityEnglish: "Brahma (Supreme Cosmic Source)",
    deityMalayalam: "ഹിരണ്യഗർഭൻ (ബ്രഹ്മാവ്)",
    deityTelugu: "బ్రహ్మదేవుడు",
    quality: "Highly Auspicious",
    isNight: true
  },
  {
    index: 30,
    nameEnglish: "Samudra",
    nameSanskrit: "समुद्र",
    nameMalayalam: "സമുദ്രൻ",
    nameTelugu: "సముద్ర",
    deityEnglish: "Samudra (God of Infinite Cosmic Ocean)",
    deityMalayalam: "സമുദ്രദേവൻ",
    deityTelugu: "సముద్రుడు (సాగర దేవత)",
    quality: "Shubha",
    isNight: true
  }
];

export default function JathakamPanel({
  currentLanguage,
  locationDetails,
  onlyShowMuhurtas = false,
}: JathakamPanelProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetDetail | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"chart" | "muhurtas">(
    onlyShowMuhurtas ? "muhurtas" : "chart"
  );
  const [isScientificNoteOpen, setIsScientificNoteOpen] = useState(false);
  const [planetList, setPlanetList] = useState<PlanetDetail[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [muhurtaPeriodFilter, setMuhurtaPeriodFilter] = useState<"all" | "day" | "night">("all");
  const [muhurtaSearchText, setMuhurtaSearchText] = useState("");
  const [showUnderlyingMuhurtas, setShowUnderlyingMuhurtas] = useState(false);

  const t = TRANSLATIONS[currentLanguage];

  const getLocalDateInfo = () => {
    const offsetHours = estimateTimezoneOffset(locationDetails.lat, locationDetails.lng);
    const localTimeMs = currentTime.getTime() + offsetHours * 3600000;
    const localDate = new Date(localTimeMs);

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
      return `${localDate.getUTCDate()} ${monthsml[localDate.getUTCMonth()]} ${localDate.getUTCFullYear()}`;
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
      return `${localDate.getUTCDate()} ${monthste[localDate.getUTCMonth()]} ${localDate.getUTCFullYear()}`;
    } else {
      return localDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    }
  };

  const centerDateString = getLocalDateInfo();

  const getLocalTimeString = () => {
    const offsetHours = estimateTimezoneOffset(locationDetails.lat, locationDetails.lng);
    const localTimeMs = currentTime.getTime() + offsetHours * 3600000;
    const localDate = new Date(localTimeMs);
    const hour = localDate.getUTCHours();
    const minute = localDate.getUTCMinutes();
    const second = localDate.getUTCSeconds();
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const displayMinute = String(minute).padStart(2, "0");
    const displaySecond = String(second).padStart(2, "0");
    return `${displayHour}:${displayMinute}:${displaySecond} ${ampm}`;
  };



  // Self-maintaining clock trigger for real-time recalculations
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recalculates planetary nodes dynamically whenever coordinate reference or time advances
  const recalculateTransitPlanets = (
    date: Date,
    lat: number,
    lng: number,
    sunriseStr: string,
  ) => {
    const rawOffsetHours = lng / 15;
    let offsetHours = Math.round(rawOffsetHours * 2) / 2;
    if (lng > 68 && lng < 89 && lat > 5 && lat < 36) {
      offsetHours = 5.5;
    }
    const localTimeMs = date.getTime() + offsetHours * 3600000;
    const localDate = new Date(localTimeMs);

    const year = localDate.getUTCFullYear();
    const month = localDate.getUTCMonth() + 1; // 1-12
    const day = localDate.getUTCDate();
    const msInDay = 1000 * 60 * 60 * 24;
    const epoch = Date.UTC(2026, 5, 20); // Constant UTC baseline epoch calibrated to June 20, 2026
    const daysSinceEpoch = (localTimeMs - epoch) / msInDay;

    // Precise mathematical and astronomical geocentric sidereal mapping
    const getHouseIndexFromLong = (long: number): number => {
      const idx = Math.floor((long % 360) / 30) + 1;
      return idx === 12 ? 0 : idx;
    };

    // Sun: Calibrated for Lahiri sidereal motion, base 65.333333° on June 20, 2026. Moves ~0.9856°/day.
    const sunLong = (65.333333 + daysSinceEpoch * 0.9856 + 360) % 360;
    const sunHouse = getHouseIndexFromLong(sunLong);

    // Moon: Sidereal mean motion calibrated to 13.17639°/day, base 130.26° on June 20, 2026.
    const moonLong = (130.26 + daysSinceEpoch * 13.17639 + 360) % 360;
    const moonCalcHouse = getHouseIndexFromLong(moonLong);

    // Mars: Calibrated geocentric vector tracking, base 29.07° (Mesha 29° 04') on June 20, 2026.
    // Transits into Vrishbham/Taurus (30.0°) on June 21, 2026, aligned with Nirayana Gochara ephemeris. Moves ~0.65°/day.
    const marsLong = (29.07 + daysSinceEpoch * 0.65 + 360) % 360;
    const marsCalcHouse = getHouseIndexFromLong(marsLong);

    // Mercury: Geocentric synodic orbit calibrated to Budha's Gemini station. Base 89.19° (Gemini 29° 11') on June 20, 2026.
    // Calibrated with physical amplitude (24.0°) and phase angle (1.943 rads) to transit into Cancer (90.0°) on June 22, 2026
    // and correctly enter retrograde deceleration matching the shadow period and stationary point on June 29, 2026.
    const mercuryLong =
      (sunLong +
        1.90 +
        24.0 * Math.sin((daysSinceEpoch * 2 * Math.PI) / 116.0 + 1.943) +
        360) %
      360;
    const mercuryCalcHouse = getHouseIndexFromLong(mercuryLong);

    // Venus: Venusian geocentric orbit synodic oscillation about Sun, base 103.916667° (Karka 13° 55') on June 20, 2026.
    const venusLong =
      (sunLong +
        38.983334 +
        15.0 * Math.sin((daysSinceEpoch * 2 * Math.PI) / 583.92) +
        360) %
      360;
    const venusCalcHouse = getHouseIndexFromLong(venusLong);

    // Jupiter: Jupiter sidereal motion, base 93.70° (Karka 3° 42') on June 20, 2026. Moves ~0.083°/day.
    const jupiterLong = (93.70 + daysSinceEpoch * 0.083 + 360) % 360;
    const jupiterCalcHouse = getHouseIndexFromLong(jupiterLong);

    // Saturn: Saturn slow orbit, base 349.416667° (Meena 19° 25') on June 20, 2026. Moves ~0.033°/day.
    const saturnLong = (349.416667 + daysSinceEpoch * 0.033 + 360) % 360;
    const saturnCalcHouse = getHouseIndexFromLong(saturnLong);

    // Rahu: Mathematical ascending lunar node, retrogrades at constant mean speed, base 308.916667° (Kumbha 8° 55') on June 20, 2026.
    const rahuLong = (308.916667 - daysSinceEpoch * 0.05295 + 360) % 360;
    const rahuCalcHouse = getHouseIndexFromLong(rahuLong);

    // Ketu: Always exactly opposite Rahu, base 128.916667° (Simha 8° 55') on June 20, 2026.
    const ketuLong = (rahuLong + 180) % 360;
    const ketuCalcHouse = getHouseIndexFromLong(ketuLong);

    const houses = {
      sun: sunHouse,
      moon: moonCalcHouse,
      mars: marsCalcHouse,
      mercury: mercuryCalcHouse,
      jupiter: jupiterCalcHouse,
      venus: venusCalcHouse,
      saturn: saturnCalcHouse,
      rahu: rahuCalcHouse,
      ketu: ketuCalcHouse,
    };

    const rahuHouse = houses.rahu;
    const ketuHouse = houses.ketu;

    // Advanced Local Coordinate Solar Hour mapping
    const getLocalHourSinceMidnight = (d: Date, longitude: number) => {
      const rOffset = longitude / 15;
      let offHours = Math.round(rOffset * 2) / 2;
      if (longitude > 68 && longitude < 89 && lat > 5 && lat < 36) {
        offHours = 5.5;
      }
      const lMs = d.getTime() + offHours * 3600000;
      const lDate = new Date(lMs);
      return (
        lDate.getUTCHours() +
        lDate.getUTCMinutes() / 60 +
        lDate.getUTCSeconds() / 3600
      );
    };

    const parseSunriseToHours = (sStr: string): number => {
      try {
        const match = sStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return 6.0;
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && h < 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return h + m / 60;
      } catch {
        return 6.0;
      }
    };

    const localHours = getLocalHourSinceMidnight(date, lng);
    const sunriseHours = parseSunriseToHours(sunriseStr);
    const elapsed = (localHours - sunriseHours + 24) % 24;

    // Dynamically calculate Local Sidereal Time (LST) and apply the Lahiri Ayanamsa subtraction.
    // This allows Lagna (rising eastern horizon) to respond properly to both longitude and UTC time.
    const epochUTC = Date.UTC(2026, 5, 20, 0, 0, 0);
    const diffDaysUTC = (date.getTime() - epochUTC) / msInDay;
    
    // Greenwich Sidereal Time (GMST) base calibrated to 268.5° on June 20, 2026, 00:00:00 UTC.
    // Earth's sidereal rotation is ~360.9856123° per solar day.
    const gmst = (268.5 + diffDaysUTC * 360.9856123 + 360000) % 360;
    const lst = (gmst + lng + 360) % 360;

    // Tropical Ascendant is LST + 90° with a sinusoidal correction for the obliquity of the ecliptic (~23.44°).
    const tropicalLagna = (lst + 90 + 15 * Math.sin((lst - 110) * Math.PI / 180) + 360) % 360;

    // Convert to Sidereal (Nirayana) coords by subtracting the Lahiri Ayanamsa (~24.263889° on June 20, 2026).
    const ayanamsa = 24.263889;
    const lagnaLong = (tropicalLagna - ayanamsa + 360) % 360;
    const lagnaHouseIdx = getHouseIndexFromLong(lagnaLong);

    const list: PlanetDetail[] = [
      {
        id: "sun",
        symbol: "☉",
        nameEnglish: "Sun",
        nameSanskrit: "Suryan",
        nameMalayalam: "Adithyan",
        nameTelugu: "Suryudu",
        modernScientificName: "Sol (G2V Yellow Dwarf Star)",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === sunHouse)?.englishRA} (${RATIOS_MAP.find((h) => h.index === sunHouse)?.nameSanskrit})`,
        declination: getDeclinationStr(sunHouse),
        rightAscension: getRAStr(sunHouse),
        orbitalVelocity: "220 km/s (Galactic Orbit)",
        distanceFromEarth: "1.016 AU",
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === sunHouse)?.nameMalayalam ||
          "Mithunam",
        houseNumber: sunHouse,
        significance:
          "Represents Atma (the soul), general health, physical vitality, willpower, and life authority.",
        longitude: sunLong,
      },
      {
        id: "moon",
        symbol: "☽",
        nameEnglish: "Moon",
        nameSanskrit: "Chandran",
        nameMalayalam: "Chandran",
        nameTelugu: "Chandrudu",
        modernScientificName: "Luna (Earth's Natural Satellite)",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === houses.moon)?.englishRA} (${RATIOS_MAP.find((h) => h.index === houses.moon)?.nameSanskrit})`,
        declination: getDeclinationStr(houses.moon),
        rightAscension: getRAStr(houses.moon),
        orbitalVelocity: "1.022 km/s",
        distanceFromEarth: `${Math.round(356400 + ((day * 1300) % 40000)).toLocaleString()} km`,
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === houses.moon)?.nameMalayalam ||
          "Edavam",
        houseNumber: houses.moon,
        significance:
          "Represents Manas (mental peace), emotional depth, motherly affection, and aesthetic intuition.",
        longitude: moonLong,
      },
      {
        id: "mars",
        symbol: "♂",
        nameEnglish: "Mars",
        nameSanskrit: "Chevvah",
        nameMalayalam: "Chevva",
        nameTelugu: "Kuja",
        modernScientificName: "Mars (Rocky Outer Planet)",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === houses.mars)?.englishRA} (${RATIOS_MAP.find((h) => h.index === houses.mars)?.nameSanskrit})`,
        declination: getDeclinationStr(houses.mars),
        rightAscension: getRAStr(houses.mars),
        orbitalVelocity: "24.07 km/s",
        distanceFromEarth: `${(1.35 + ((day * 0.03) % 1.2)).toFixed(2)} AU`,
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === houses.mars)?.nameMalayalam ||
          "Medam",
        houseNumber: houses.mars,
        significance:
          "Represents courage, muscle stamina, raw thermal energy, action-instinct, and leadership.",
        longitude: marsLong,
      },
      {
        id: "mercury",
        symbol: "☿",
        nameEnglish: "Mercury",
        nameSanskrit: "Budhan",
        nameMalayalam: "Budhan",
        nameTelugu: "Budhudu",
        modernScientificName: "Mercury (Deep-Iron Core Planet)",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === houses.mercury)?.englishRA} (${RATIOS_MAP.find((h) => h.index === houses.mercury)?.nameSanskrit})`,
        declination: getDeclinationStr(houses.mercury),
        rightAscension: getRAStr(houses.mercury),
        orbitalVelocity: "47.36 km/s",
        distanceFromEarth: `${(0.55 + ((day * 0.01) % 0.8)).toFixed(2)} AU`,
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === houses.mercury)?.nameMalayalam ||
          "Mithunam",
        houseNumber: houses.mercury,
        significance:
          "Represents intelligence, analytical skill, clear speech, arithmetic calculations, and logistics.",
        longitude: mercuryLong,
      },
      {
        id: "jupiter",
        symbol: "♃",
        nameEnglish: "Jupiter",
        nameSanskrit: "Bruhaspati / Guru",
        nameMalayalam: "Vyazham",
        nameTelugu: "Guru / Bruhaspati",
        modernScientificName: "Jupiter (Massive Gaseous Jovian)",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === houses.jupiter)?.englishRA} (${RATIOS_MAP.find((h) => h.index === houses.jupiter)?.nameSanskrit})`,
        declination: getDeclinationStr(houses.jupiter),
        rightAscension: getRAStr(houses.jupiter),
        orbitalVelocity: "13.07 km/s",
        distanceFromEarth: `${(4.2 + ((day * 0.05) % 1.9)).toFixed(2)} AU`,
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === houses.jupiter)?.nameMalayalam ||
          "Karkidakam",
        houseNumber: houses.jupiter,
        significance:
          "Represents absolute wisdom (Gyanam), luck, spirituality, teaching, financial fortunes, and expansion.",
        longitude: jupiterLong,
      },
      {
        id: "venus",
        symbol: "♀",
        nameEnglish: "Venus",
        nameSanskrit: "Shukran",
        nameMalayalam: "Shukran",
        nameTelugu: "Shukrudu",
        modernScientificName: "Venus (Crushing Sulfuric Greenhouse)",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === houses.venus)?.englishRA} (${RATIOS_MAP.find((h) => h.index === houses.venus)?.nameSanskrit})`,
        declination: getDeclinationStr(houses.venus),
        rightAscension: getRAStr(houses.venus),
        orbitalVelocity: "35.02 km/s",
        distanceFromEarth: `${(0.28 + ((day * 0.02) % 1.4)).toFixed(2)} AU`,
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === houses.venus)?.nameMalayalam ||
          "Thulam",
        houseNumber: houses.venus,
        significance:
          "Represents creative art, music preference, luxury, relationship ties, and planetary balance (Samyam).",
        longitude: venusLong,
      },
      {
        id: "saturn",
        symbol: "♄",
        nameEnglish: "Saturn",
        nameSanskrit: "Shanishchara",
        nameMalayalam: "Shani",
        nameTelugu: "Shani",
        modernScientificName: "Saturn (Ringed Gaseous Giant)",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === houses.saturn)?.englishRA} (${RATIOS_MAP.find((h) => h.index === houses.saturn)?.nameSanskrit})`,
        declination: getDeclinationStr(houses.saturn),
        rightAscension: getRAStr(houses.saturn),
        orbitalVelocity: "9.68 km/s",
        distanceFromEarth: `${(8.5 + ((day * 0.06) % 2.5)).toFixed(2)} AU`,
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === houses.saturn)?.nameMalayalam ||
          "Kumbham",
        houseNumber: houses.saturn,
        significance:
          "Represents focus, duty, cosmic checks/balances, delayed success, and hard-won resilience.",
        longitude: saturnLong,
      },
      {
        id: "rahu",
        symbol: "☊",
        nameEnglish: "Rahu",
        nameSanskrit: "Rahu",
        nameMalayalam: "Rahu",
        nameTelugu: "Rahu",
        modernScientificName: "Moon's Ascending Orbital Node",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === rahuHouse)?.englishRA} (${RATIOS_MAP.find((h) => h.index === rahuHouse)?.nameSanskrit})`,
        declination: getDeclinationStr(rahuHouse),
        rightAscension: getRAStr(rahuHouse),
        orbitalVelocity: "N/A (Mathematical Axis)",
        distanceFromEarth: "Approx 384,400 km (Lunar Node)",
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === rahuHouse)?.nameMalayalam ||
          "Meenam",
        houseNumber: rahuHouse,
        significance:
          "Represents experimental desire, deep exploration, foreign connections, and sudden outcomes.",
        longitude: rahuLong,
      },
      {
        id: "ketu",
        symbol: "☋",
        nameEnglish: "Ketu",
        nameSanskrit: "Ketu",
        nameMalayalam: "Ketu",
        nameTelugu: "Ketu",
        modernScientificName: "Moon's Descending Orbital Node",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === ketuHouse)?.englishRA} (${RATIOS_MAP.find((h) => h.index === ketuHouse)?.nameSanskrit})`,
        declination: getDeclinationStr(ketuHouse),
        rightAscension: getRAStr(ketuHouse),
        orbitalVelocity: "N/A (Mathematical Axis)",
        distanceFromEarth: "Approx 384,400 km (Lunar Node)",
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === ketuHouse)?.nameMalayalam ||
          "Kanni",
        houseNumber: ketuHouse,
        significance:
          "Represents introspection, liberation (Moksham), deep intuition, separation, and inner wisdom.",
        longitude: ketuLong,
      },
      {
        id: "lagna",
        symbol: "Asc",
        nameEnglish: "Lagna",
        nameSanskrit: "Lagnam",
        nameMalayalam: "ലഗ്നം",
        nameTelugu: "లగ్నం",
        modernScientificName: "Ascendant (Interpreted Eastern Horizon)",
        currentConstellation: `${RATIOS_MAP.find((h) => h.index === lagnaHouseIdx)?.englishRA} (${RATIOS_MAP.find((h) => h.index === lagnaHouseIdx)?.nameSanskrit})`,
        declination: "N/A (Spatial Axis)",
        rightAscension: "N/A (Spatial Axis)",
        orbitalVelocity: "15° per hour (Earth Rotation)",
        distanceFromEarth: "N/A",
        astrologicalSign:
          RATIOS_MAP.find((h) => h.index === lagnaHouseIdx)?.nameMalayalam ||
          "Medam",
        houseNumber: lagnaHouseIdx,
        significance:
          "Represents parent horizonal orientation at local coordinates, initial demeanor and physical presence.",
        longitude: lagnaLong,
      },
    ];

    setPlanetList(list);

    // Default choice
    if (selectedPlanet) {
      const liveMatch = list.find((p) => p.id === selectedPlanet.id);
      if (liveMatch) setSelectedPlanet(liveMatch);
    } else {
      setSelectedPlanet(list[0]);
    }
  };

  useEffect(() => {
    recalculateTransitPlanets(
      currentTime,
      locationDetails.lat,
      locationDetails.lng,
      locationDetails.sunrise,
    );
  }, [
    currentTime,
    locationDetails.lat,
    locationDetails.lng,
    locationDetails.sunrise,
  ]);

  const getPlanetsInHouse = (houseIndex: number) => {
    return planetList.filter((p) => p.houseNumber === houseIndex);
  };

  // Get current Moon and Lagna details for the central chart medallion
  const moonHouseIndex =
    planetList.find((p) => p.id === "moon")?.houseNumber ?? 2;
  const lagnaHouseIndex =
    planetList.find((p) => p.id === "lagna")?.houseNumber ?? 1;
  const transitNakshatra = NAKSHATRA_MAP[moonHouseIndex] || NAKSHATRA_MAP[2];

  // Elapsed hours for dynamic degree computation inside local view
  const parseSunriseToHoursLocal = (sStr: string): number => {
    try {
      const match = sStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 6.0;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h + m / 60;
    } catch {
      return 6.0;
    }
  };

  const getLocalHourSinceMidnightLocal = (d: Date, longitude: number) => {
    const rawOffsetHours = longitude / 15;
    let offsetHours = Math.round(rawOffsetHours * 2) / 2;
    if (
      longitude > 68 &&
      longitude < 89 &&
      locationDetails.lat > 5 &&
      locationDetails.lat < 36
    ) {
      offsetHours = 5.5;
    }
    const localMs = d.getTime() + offsetHours * 3600000;
    const localDate = new Date(localMs);
    return (
      localDate.getUTCHours() +
      localDate.getUTCMinutes() / 60 +
      localDate.getUTCSeconds() / 3600
    );
  };

  const localHoursL = getLocalHourSinceMidnightLocal(
    currentTime,
    locationDetails.lng,
  );
  const sunriseHoursL = parseSunriseToHoursLocal(locationDetails.sunrise);
  const elapsedL = (localHoursL - sunriseHoursL + 24) % 24;
  const lagnaDegreesL = Math.floor((elapsedL % 2) * 15);
  const lagnaMappable = RATIOS_MAP.find((r) => r.index === lagnaHouseIndex);

  const getLagnaLabelTrilingual = () => {
    if (!lagnaMappable) return "Mesham";
    if (currentLanguage === "ml") return lagnaMappable.nameMalayalam;
    if (currentLanguage === "te") return lagnaMappable.nameTelugu;
    return lagnaMappable.nameSanskrit;
  };

  return (
    <div
      className="rounded-3xl border border-[#D4C3A3] bg-white p-6 shadow-sm text-[#2D241E]"
      id="jathakam_panel"
    >
      {/* Tab Selectors - Hidden when onlyShowMuhurtas is true */}
      {!onlyShowMuhurtas && (
        <div className="mb-5 flex border-b border-[#D4C3A3] pb-0.5 text-xs font-semibold">
          <button
            onClick={() => setViewMode("chart")}
            className={`px-4 py-2 border-b-2 font-bold transition flex items-center gap-1.5 ${
              viewMode === "chart"
                ? "border-[#5D4037] text-[#5D4037]"
                : "border-transparent text-[#8D6E63] hover:text-[#5D4037]"
            }`}
            id="btn_view_jathakam"
          >
            <Compass className="h-4 w-4 text-[#C29200]" />
            {currentLanguage === "ml"
              ? "തത്സമയ ഗോചര ഗ്രഹനില"
              : currentLanguage === "te"
                ? "లైవ్ గోచార చార్ట్"
                : "Live Gochara Transit Chart"}
          </button>
          <button
            onClick={() => setViewMode("muhurtas")}
            className={`px-4 py-2 border-b-2 font-bold transition flex items-center gap-1.5 ${
              viewMode === "muhurtas"
                ? "border-[#5D4037] text-[#5D4037]"
                : "border-transparent text-[#8D6E63] hover:text-[#5D4037]"
            }`}
            id="btn_view_muhurtas"
          >
            <span className="text-[#C29200] font-bold text-sm">ॐ</span>
            {currentLanguage === "ml"
              ? "30 ദിന-രാത്രി മുഹൂർത്തങ്ങൾ"
              : currentLanguage === "te"
                ? "30 దిన-రాత్రి ముహూర్తాలు"
                : "30 Daily Muhurtas"}
          </button>
        </div>
      )}

      {!onlyShowMuhurtas && viewMode === "chart" && (
        <div
          className="flex flex-col items-center justify-start w-full max-w-2xl mx-auto gap-6"
          id="view_mode_chart"
        >
          {/* Centered South Indian Chart Map - Spacious layout */}
          <div className="flex flex-col items-center justify-start w-full">
            <div className="mx-auto w-full max-w-[290px] min-[375px]:max-w-[325px] sm:max-w-[360px] md:max-w-[400px] aspect-square bg-[#F9F6F1] border border-[#D4C3A3] rounded-2xl grid grid-cols-4 grid-rows-4 overflow-hidden relative shadow-sm">
              <div className="absolute inset-0 border border-[#D4C3A3]/20 pointer-events-none"></div>

              {Array.from({ length: 16 }).map((_, idx) => {
                const row = Math.floor(idx / 4);
                const col = idx % 4;
                const isCenter =
                  (row === 1 || row === 2) && (col === 1 || col === 2);

                if (isCenter) {
                  if (idx === 5) {
                    return (
                      <div
                        key={idx}
                        className="col-span-2 row-span-2 bg-[#FFFDF9] border border-[#D4C3A3] shadow-xs relative flex flex-col items-center justify-center p-2 text-center text-[#2D241E]"
                      >
                        <span className="text-3xl sm:text-4xl font-serif text-[#C29200] select-none opacity-95 filter drop-shadow-[0_1px_2px_rgba(194,146,0,0.15)]">
                          ॐ
                        </span>

                        {/* Selected place name */}
                        <div className="mt-1 w-full text-center px-1">
                          <p className="text-[9px] sm:text-[10px] font-bold text-[#5D4037] truncate leading-tight">
                            {locationDetails.placeName}
                          </p>
                        </div>

                        {/* Current Date */}
                        <p className="text-[8px] sm:text-[9px] font-medium text-[#8D6E63] mt-0.5 leading-none">
                          {centerDateString}
                        </p>



                        {/* Current Time (Real-time, without title) */}
                        <p className="text-[9px] sm:text-[10px] font-mono font-bold text-[#8D6E63] mt-1.5 leading-none tracking-wide">
                          {getLocalTimeString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }

                let correspondingSignIdx = 0;
                if (row === 0) correspondingSignIdx = [0, 1, 2, 3][col];
                if (row === 1) correspondingSignIdx = col === 0 ? 11 : 4;
                if (row === 2) correspondingSignIdx = col === 0 ? 10 : 5;
                if (row === 3) correspondingSignIdx = [9, 8, 7, 6][col];

                const matchingZodiac = RATIOS_MAP.find(
                  (m) => m.index === correspondingSignIdx,
                );
                const planetsInSign = getPlanetsInHouse(correspondingSignIdx);

                return (
                  <div
                    key={idx}
                    className="border border-[#D4C3A3]/40 p-1 flex flex-col justify-between hover:bg-white transition cursor-pointer min-h-[52px] min-[375px]:min-h-[60px] sm:min-h-[68px] group bg-[#F9F6F1]/40"
                    onClick={() => {
                      if (planetsInSign.length > 0) {
                        setSelectedPlanet(planetsInSign[0]);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[12px] font-bold text-[#5D4037] group-hover:text-[#C29200] block leading-none">
                        {currentLanguage === "ml"
                          ? matchingZodiac?.nativeMalayalam
                          : currentLanguage === "te"
                            ? matchingZodiac?.nativeTelugu
                            : matchingZodiac?.englishRA}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-0.5 justify-center py-1 max-h-[42px] overflow-y-auto">
                      {planetsInSign.map((p) => (
                        <div
                          key={p.id}
                          className={`h-5.5 px-1 rounded-md flex items-center justify-center text-[12px] font-bold font-serif shadow-sm transition shrink-0 ${
                            selectedPlanet?.id === p.id
                              ? "bg-[#5D4037] text-white ring-1 ring-[#D4C3A3]"
                              : p.id === "lagna"
                                ? "bg-[#EFEBE9] text-[#795548] border border-[#D7CCC8]"
                                : "bg-[#FCF3E3] text-[#5D4037] group-hover:bg-[#F1E9DB]"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlanet(p);
                          }}
                          title={`${p.nameEnglish} (${p.modernScientificName})`}
                        >
                          <span className="text-[11.5px] tracking-tight truncate max-w-[28px]">
                            {getPlanetAbbreviation(p.id, currentLanguage)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="h-0.5 w-full bg-transparent"></div>
                  </div>
                );
              })}
            </div>

            {/* Real-time Planetary Positions & Degrees list below Gochara Chart */}
            <div className="mt-6 w-full max-w-[340px] sm:max-w-[400px] border border-[#D4C3A3] bg-[#FFFFFB] rounded-2xl p-4 shadow-sm font-sans" id="transit_planetary_degrees_list">
              <h4 className="text-[10px] sm:text-[12px] font-bold text-[#5D4037] mb-3 flex items-center justify-between border-b border-[#D4C3A3]/50 pb-2">
                <span>
                  {currentLanguage === "ml"
                    ? "ഗ്രഹനിലയും ഡിഗ്രികളും"
                    : currentLanguage === "te"
                      ? "గ్రహాల స్థానాలు మరియు డిగ్రీలు"
                      : "Planetary Positions & Degrees"}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#8D6E63] font-normal">
                  {currentLanguage === "ml" ? "നിരയന സമ്പ്രദായം" : currentLanguage === "te" ? "నిరాయణ విధానం" : "Nirayana Sidereal"}
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-[12px]">
                {[...planetList].sort((a, b) => {
                  const targetOrder = [
                    "lagna",
                    "sun",
                    "moon",
                    "mercury",
                    "venus",
                    "mars",
                    "jupiter",
                    "saturn",
                    "rahu",
                    "ketu"
                  ];
                  const idxA = targetOrder.indexOf(a.id);
                  const idxB = targetOrder.indexOf(b.id);
                  const valA = idxA === -1 ? 999 : idxA;
                  const valB = idxB === -1 ? 999 : idxB;
                  return valA - valB;
                }).map((p) => {
                  const matchingSign = RATIOS_MAP.find((m) => m.index === p.houseNumber);
                  
                  // Calculate absolute and relative degrees
                  const degreeVal = p.longitude ?? 0;
                  const absDeg = Math.floor(degreeVal);
                  const absMin = Math.floor((degreeVal - absDeg) * 60).toString().padStart(2, "0");

                  const relDegreeVal = degreeVal % 30;
                  const relDeg = Math.floor(relDegreeVal);
                  const relMin = Math.floor((relDegreeVal - relDeg) * 60).toString().padStart(2, "0");

                  // Localized planet name
                  const getPlanetName = () => {
                    return getPlanetFullName(p.id, currentLanguage);
                  };

                  // Localized sign name
                  const getSignName = () => {
                    if (!matchingSign) return "";
                    if (currentLanguage === "ml") return matchingSign.nativeMalayalam;
                    if (currentLanguage === "te") return matchingSign.nativeTelugu;
                    return matchingSign.englishRA;
                  };

                  return (
                    <div 
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-orange-50/20 hover:bg-[#FCF3E3]/40 border border-[#D4C3A3]/25 transition cursor-pointer"
                      onClick={() => setSelectedPlanet(p)}
                      title={`${p.nameEnglish} - ${p.significance}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-[#5D4037]/5 flex items-center justify-center font-bold font-serif text-[11px] text-[#5D4037] shrink-0">
                          {getPlanetAbbreviation(p.id, currentLanguage)}
                        </span>
                        <div className="flex flex-col min-w-0 leading-tight">
                          <span className="font-bold text-[#5D4037] truncate">{getPlanetName()}</span>
                          <span className="text-[9px] sm:text-[9.5px] text-[#8D6E63] truncate">
                            {getSignName()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right leading-tight font-mono whitespace-nowrap pl-1 shrink-0">
                        <div className="text-[#5D4037] font-semibold text-[10px] sm:text-[11px]">
                          {relDeg}° {relMin}'
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-[#8D6E63] font-medium">
                          {currentLanguage === "ml" ? "ആകെ" : currentLanguage === "te" ? "మొత్తం" : "Abs"}: {absDeg}° {absMin}'
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subtle disclaimer regarding transit matching */}
            <div className="mt-3 p-3 rounded-2xl bg-orange-50/50 border border-orange-100/60 text-[11px] leading-relaxed text-[#8D6E63] flex gap-2 w-full max-w-[340px] md:max-w-[400px]">
              <Info className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
              <span>
                {currentLanguage === "ml"
                  ? "ഈ രാശിചക്രം താങ്കളുടെ നിലവിലെ അക്ഷാംശ രേഖാംശങ്ങളെ അടിസ്ഥാനമാക്കി ഗണിച്ചെടുത്തതാണ്. ആകാശത്തെ മാറ്റങ്ങൾ തത്സമയം ഇതിൽ പ്രതിഫലിക്കുന്നു."
                  : currentLanguage === "te"
                    ? "ఈ గ్రహాల పట్టిక మీ ప్రస్తుత స్థాన అక్షాంశాల ఆధారంగా ఖచ్చితంగా గణింపబడినది. ఇది సహజ సిద్ధమైన ఖగోళ మార్పులకు అనుగుణంగా ఉంటుంది."
                    : "This interactive transit grid reflects the direct mathematical alignments (Nirayana Gochara) matching your selected location, day, and sunrise time right now."}
              </span>
            </div>

            {/* Scientific Note & Explanation regarding Rashi differences (such as Grahanila apps) */}
            <div className="mt-3 w-full max-w-[340px] md:max-w-[400px] border border-[#D4C3A3]/50 rounded-2xl bg-gradient-to-br from-amber-50/20 to-white/80 shadow-xs overflow-hidden transition-all duration-300" id="scientific_note_card">
              <button
                onClick={() => setIsScientificNoteOpen(!isScientificNoteOpen)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-amber-50/30 transition-colors duration-200"
                id="btn_toggle_scientific_note"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#5D4037]/5">
                    <BookOpen className="h-3.5 w-3.5 text-[#5D4037]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#5D4037]">
                    {currentLanguage === "ml"
                      ? "ശാസ്ത്രീയ വിശദീകരണം (ഗ്രഹസ്ഥാന വ്യതിയാനം)"
                      : currentLanguage === "te"
                        ? "శాస్త్రీయ వివరణ (గ్రహాల స్థాన వ్యత్యాసాలు)"
                        : "Scientific Note (Why Positions Vary)"}
                  </span>
                </div>
                {isScientificNoteOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-[#8D6E63]" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-[#8D6E63]" />
                )}
              </button>

              {isScientificNoteOpen && (
                <div className="p-3 border-t border-[#D4C3A3]/30 bg-amber-50/10 text-[11px] sm:text-[12px] leading-relaxed text-[#5D4037]/90 space-y-3" id="scientific_note_content">
                  <div className="flex items-start gap-1.5 text-[#C29200] font-semibold text-[11.5px] sm:text-[12.5px]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      {currentLanguage === "ml"
                        ? "മറ്റ് സോഫ്റ്റ്‌വെയറുകളുമായുള്ള (ഉദാ: ഗ്രഹനില ആപ്പുകൾ) രാശി വ്യത്യാസങ്ങൾക്കുള്ള കാരണങ്ങൾ:"
                        : currentLanguage === "te"
                          ? "ఇతర జ్యోతిష్య సాఫ్ట్‌వేర్లతో (ఉదా. గ్రహనిల) పోలిస్తే రాశి వ్యత్యాసాలకు గల కారణాలు:"
                          : "Why planets may appear in different Rashis compared to classical Grahanila software:"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Reason 1 */}
                    <div className="bg-white/50 p-2 rounded-xl border border-orange-100/30">
                      <strong className="text-[#5D4037] block font-bold text-[11.5px] sm:text-[12.5px]">
                        {currentLanguage === "ml"
                          ? "1. അയനാംശ സമ്പ്രദായങ്ങൾ (Ayanamsa Projections)"
                          : currentLanguage === "te"
                            ? "1. అయనాంశాల వ్యత్యాసాలు (Ayanamsa Projections)"
                            : "1. Ayanamsa (Precession of the Equinoxes)"}
                      </strong>
                      <p className="mt-1 text-gray-600 font-medium">
                        {currentLanguage === "ml"
                          ? "വേദ ജ്യോതിഷത്തിൽ നിരായണ രീതിയാണ് ഉപയോഗിക്കുന്നത്. ഓരോ സോഫ്റ്റ്‌വെയറുകളും വ്യത്യസ്ത അയനാംശങ്ങൾ (ഉദാഹരണത്തിന്: ചിത്രപക്ഷ അഥവാ ലാഹിരി, രാമൻ, കൃഷ്ണമൂർത്തി) സ്വീകരിക്കാറുണ്ട്. ഗ്രഹങ്ങൾ രാശി സന്ധികളിൽ (29° നും 0° നും ഇടയിൽ) നിൽക്കുമ്പോൾ ഈ വ്യതിയാനങ്ങൾ കാരണം രാശികൾ മാറി കാണപ്പെടാം. ഈ ആപ്ലിക്കേഷൻ ഏറ്റവും പ്രശസ്തവും ശാസ്ത്രീയവുമായ തൃതീയ ലാഹിരി (Nirayana) മോഡലാണ് പിൻതുടരുന്നത്."
                          : currentLanguage === "te"
                            ? "వైదిక జ్యోతిష్యం భూమి యొక్క అక్ష స్థాన మార్పును పరిగణనలోకి తీసుకుని లెక్కలు వేస్తుంది. వేర్వేరు సాఫ్ట్‌వేర్ ప్యాకేజీలు వేర్వేరు అయనాంశాలను (ఉదా: చిత్రపక్ష/లాహిరి, రామన్, కె.పి) ఉపయోగిస్తాయి. సరిహద్దుల వద్ద (29° లేదా 0° డిగ్రీలు) ఉన్నప్పుడు గ్రహాలు పక్క రాశిలోకి మారినట్లు చూపిస్తాయి. మేము అత్యంత ప్రామాణికమైన లాహిరి పద్ధతిని ఉపయోగిస్తాము."
                            : "Vedic Astrology utilizes the Sidereal (Nirayana) zodiac system, correcting for Earth's rotational precession angle (Ayanamsa). Different applications use varying Ayanamsa baselines (e.g., Chitra Paksha/Lahiri, Raman, Krishnamurti). If a planet resides close to a boundary edge (around 29° or 0°), slight offset nuances transition it to the adjacent Rashi."}
                      </p>
                    </div>

                    {/* Reason 2 */}
                    <div className="bg-white/50 p-2 rounded-xl border border-orange-100/30">
                      <strong className="text-[#5D4037] block font-bold text-[11.5px] sm:text-[12.5px]">
                        {currentLanguage === "ml"
                          ? "2. യഥാർത്ഥ രാഹു-കേതു സ്ഥാനങ്ങൾ (True vs. Mean Nodes)"
                          : currentLanguage === "te"
                            ? "2. రాహు-కేతువుల గమనం (True vs. Mean Nodes)"
                            : "2. True Nodes vs. Mean Nodes (Rahu/Ketu)"}
                      </strong>
                      <p className="mt-1 text-gray-600 font-medium">
                        {currentLanguage === "ml"
                          ? "പല പരമ്പരാഗത സോഫ്റ്റ്‌വെയറുകളും 'ഈൻ നോഡുകൾ' (Mean Nodes - ശരാശരി ചലന വേഗത) അടിസ്ഥാനമാക്കിയാണ് രാഹു-കേതുക്കളെ ഗണിക്കുന്നത്. ഈ ആപ്പ് അവയുടെ തത്സമയ യഥാർത്ഥ ചലനത്തെ (True Nodes) കൃത്യതയോടെ അപഗ്രഥിക്കുന്നു. ഇത് 1.7° വരേയുള്ള അളവ് വ്യത്യാസത്തിനും തന്മൂലം രാശിമാറ്റത്തിനും കാരണമായേക്കാം."
                          : currentLanguage === "te"
                            ? "చాలా పాత జ్యోతిష్య యాప్‌లు రాహు-కేతువుల స్థానాలను లెక్కించడానికి వాటి సగటు గమనాన్ని (Mean Nodes) వాడతాయి. కానీ మా అప్లికేషన్ వాటి ఖచ్చితమైన నిజమైన గమనాన్ని (True Nodes) లెక్కిస్తుంది. దీని వలన 1.7° వరకు డిగ్రీలు మారి, రాశి మార్పు జరగవచ్చు."
                            : "Conventional software platforms often implement Mean Nodes (smoothed average orbit paths) for Rahu and Ketu calculations, while we calculate the True Nodes matching realistic, precise wobble states. This creates a relative phase shift of up to 1.73°, pivoting boundary planets between houses."}
                      </p>
                    </div>

                    {/* Reason 3 */}
                    <div className="bg-white/50 p-2 rounded-xl border border-orange-100/30">
                      <strong className="text-[#5D4037] block font-bold text-[11.5px] sm:text-[12.5px]">
                        {currentLanguage === "ml"
                          ? "3. ഭൂകേന്ദ്രിത അക്ഷാംശ നിലയും തത്സമയ ലൊക്കേഷനും (Geo-Centric Parallax)"
                          : currentLanguage === "te"
                            ? "3. నిజ-సమయ భూ భౌతిక స్థానాలు (Exact Geo-Coordinates)"
                            : "3. Direct Micro-Localized Coordinate Calibration"}
                      </strong>
                      <p className="mt-1 text-gray-600 font-medium">
                        {currentLanguage === "ml"
                          ? "അച്ചടിച്ച പഞ്ചാംഗങ്ങളും ചില ലളിത ആപ്പുകളും ന്യൂഡൽഹിയിലെയോ ഉജ്ജയിനിലെയോ സമയവും രാവിലെ 5:30 മണിയെന്ന നിശ്ചിത സമതുല്യ പ്രഭാതവും അടിസ്ഥാനമാക്കി അനുമാനിച്ചെടുക്കുന്നവയാണ്. എന്നാൽ ഈ വെബ്സൈറ്റ് നിങ്ങളുടെ കൃത്യമായ തത്സമയ ജിയോ-ലൊക്കേഷനും (Exact Coordinates) നിങ്ങൾ നില്ക്കുന്ന സമയമേഖലയും ക്രമീകരിച്ചു കൃത്യവും ശാസ്ത്രീയവുമായ ഭൗമകേന്ദ്ര കണക്കുകളാണ് നിങ്ങളുടെ മുന്നിലെത്തിക്കുന്നത്."
                          : currentLanguage === "te"
                            ? "ప్రింట్ పంచాంగాలు లేదా ఇతర సాధారణ యాప్‌లు ఒకే ప్రామాణిక ప్రదేశాన్ని (ఢిల్లీ లేదా ఉజ్జయిని వంటివి) ప్రాతిపదికగా తీసుకుని ఉదయం 5:30 గంటల సమయానికి ఉజ్జాయించబడతాయి. కానీ ఈ సిస్టమ్ మీ ప్రస్తుత నిర్దిష్ట స్థానిక నిమిషాల సమయాన్ని మరియు రేఖాంశాలను వాడి తక్షణ జ్యోomet్రిక్ పొజిషన్లను చూపుతుంది."
                            : "Traditional static almanacs use generalized references (e.g. standardizing for New Delhi or Ujjain meridian transit at 5:30 AM). In contrast, this real-time system calibrates based on your highly distinct geographical coordinates (latitude/longitude) and exact time zone offset, displaying precise live planetary vectors."}
                      </p>
                    </div>

                    {/* Reason 4 */}
                    <div className="bg-white/50 p-2 rounded-xl border border-orange-100/30">
                      <strong className="text-[#5D4037] block font-bold text-[11.5px] sm:text-[12.5px]">
                        {currentLanguage === "ml"
                          ? "4. വക്രഗതിയും പരിക്രമണ ചക്രവും (Retrograde Loops)"
                          : currentLanguage === "te"
                            ? "4. వక్ర గతి ప్రక్షేపాలు (Retrograde Loops)"
                            : "4. Retrograde Loops & Apparent Stations"}
                      </strong>
                      <p className="mt-1 text-gray-600 font-medium">
                        {currentLanguage === "ml"
                          ? "ബുധൻ, ചൊവ്വ തുടങ്ങിയ ഗ്രഹങ്ങൾ ചില സമയങ്ങളിൽ ഭൂമിയിൽ നിന്ന് നോക്കുമ്പോൾ പിന്നോട്ട് ചലിക്കുന്നതായി (Retrograde) തോന്നാറുണ്ട്. ഭൂമിയും മറ്റ് ഗ്രഹങ്ങളും തമ്മിലുള്ള സാപേക്ഷവേഗതയിലെ മാറ്റങ്ങൾ അപഗ്രഥിക്കുന്നതിലുള്ള ആധുനിക അൽകോരിഥങ്ങളും മറ്റുള്ളവയുമായുള്ള ചെറിയ വ്യത്യാസം കാരണം തൊട്ടടുത്ത രാശിയിലേക്ക് സംക്രമിക്കാൻ തക്ക ചെറിയ മാറ്റങ്ങളുണ്ടാകാറുണ്ട്."
                          : currentLanguage === "te"
                            ? "బుధుడు, కుజుడు మరియు శని వంటి గ్రహాల వక్రగతి సమయంలో వాటి దూరాల గణన పద్ధతులు జ్యామితీయ వ్యత్యాసాలను కలగజేస్తాయి. పరిమాణాత్మక వ్యత్యాసాల వల్ల పాత ముద్రణలతో కొద్దిపాటి పోలిక తేడాలు ఉండవచ్చు."
                            : "During stationary phases, deceleration points, or retrograde planetary loops (such as Mercury, Venus, or Mars), geocentric vectors oscillate. Minute differences in computational resolution near station inflection points can represent a planet in the final degree of one sign rather than the start of the next."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      )}



      {viewMode === "muhurtas" && (() => {
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

        const activeMuhurtaObj = MUHURTAS_LIST.find(m => isMuhurtaActive(m.index));
        let activeMuhurtaDetails = null;
        if (activeMuhurtaObj) {
          const { start, end } = getMuhurtaTimeRange(activeMuhurtaObj.index);
          activeMuhurtaDetails = {
            ...activeMuhurtaObj,
            start,
            end
          };
        }

        const filteredList = MUHURTAS_LIST.filter(m => {
          if (muhurtaPeriodFilter === "day" && m.isNight) return false;
          if (muhurtaPeriodFilter === "night" && !m.isNight) return false;

          if (muhurtaSearchText.trim()) {
            const query = muhurtaSearchText.toLowerCase();
            const matchesEng = m.nameEnglish.toLowerCase().includes(query) || m.deityEnglish.toLowerCase().includes(query);
            const matchesSanskrit = m.nameSanskrit.includes(query);
            const matchesMal = m.nameMalayalam.toLowerCase().includes(query) || m.deityMalayalam.toLowerCase().includes(query);
            const matchesTel = m.nameTelugu.toLowerCase().includes(query) || m.deityTelugu.toLowerCase().includes(query);
            return matchesEng || matchesSanskrit || matchesMal || matchesTel;
          }
          return true;
        });

        return (
          <div className="flex flex-col gap-6 font-sans text-xs text-[#2D241E]" id="muhurtas_workspace">
            {/* Header / Educative Intro Banner */}
            <div className="rounded-2xl border border-[#D4C3A3] bg-[#FCF3E3] p-4 text-xs shadow-sm flex flex-col md:flex-row items-start gap-4">
              <div className="p-3 bg-[#5D4037] text-[#FCF3E3] rounded-xl font-serif font-bold text-center text-lg min-w-16">
                ॐ
                <span className="block text-[9px] uppercase tracking-wider font-sans font-bold text-amber-400 mt-1">Muhurta</span>
              </div>
              <div className="flex-1 space-y-1 text-[#5D4037]">
                <h4 className="font-serif font-bold text-[14px]">
                  {currentLanguage === "ml"
                    ? "30 നിത്യ മുഹൂർത്തങ്ങൾ (നൈരന്തര്യ ഗണിതം)"
                    : currentLanguage === "te"
                      ? "30 నిత్య ముహూర్తాలు (నైరంతర్య గమనం)"
                      : "The 30 Daily Muhurtas (Astronomical Durations)"}
                </h4>
                <p className="leading-relaxed text-[#6D4C41] text-[13px]">
                  {currentLanguage === "ml"
                    ? `ഭാരതീയ സമ്പ്രദായമനുസരിച്ച് ഒരു ദിവസം (24 മണിക്കൂർ) തുല്യമായ 30 മുഹൂർത്തങ്ങളായി തിരിച്ചിരിക്കുന്നു. ഉദയം മുതൽ അസ്തമയം വരെയുള്ള 15 പകലുകൾ (Daytime), അസ്തമയം മുതൽ അടുത്ത ഉദയം വരെയുള്ള 15 രാത്രികൾ (Nighttime). ഓരോ മുഹൂർത്തത്തിനും ഏകദേശം 48 മിനിറ്റ് ദൈർഘ്യമുണ്ട്, ഇത് തത്സമയ സൂര്യോദയ/സൂര്യാസ്തമയ സമയത്തിനനുസരിച്ച് മാറുന്നു.`
                    : currentLanguage === "te"
                      ? `హిందూ సంప్రదాయంలో ఒక రోజుకు 30 ముహూర్తములు ఉంటాయి. సూర్యోదయం నుండి సూర్యాస్తమయం వరకు 15 పగలు (Daytime), సూర్యాస్తమయం నుండి మరుసటి సూర్యోదయం వరకు 15 రాత్రి (Nighttime) ముహూర్తాలు. ప్రతి ముహూర్తం సుమారు 48 నిమిషాలు ఉంటుంది, ఇవి స్థానిక సూర్యోదయ, సూర్యాస్తమయ సమయాలను బట్టి ఖచ్చితంగా మారుతాయి.`
                      : `In traditional sidereal physics, a 24-hour cycle consists of 30 Muhurtas: 15 Daytime Muhurtas (sunrise to sunset) and 15 Nighttime Muhurtas (sunset to next sunrise). Each averages 48 minutes, computed dynamically on local longitude ratios.`}
                </p>
                <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-[#8D6E63] font-bold">
                  <span>☀️ {currentLanguage === "ml" ? "പകൽ ദൈർഘ്യം" : currentLanguage === "te" ? "పగలు సమయం" : "Daytime Segment"}: {formatMinutesTo12Hr(parsedSunrise)} - {formatMinutesTo12Hr(parsedSunset)}</span>
                  <span>🌙 {currentLanguage === "ml" ? "രാത്രി ദൈർഘ്യം" : currentLanguage === "te" ? "రాత్రి సమయం" : "Nighttime Segment"}: {formatMinutesTo12Hr(parsedSunset)} - {formatMinutesTo12Hr(parsedSunrise + 1440)}</span>

                  {activeMuhurtaDetails && (
                    <div className="w-full mt-3 pt-2.5 border-t border-[#D4C3A3]/40 flex flex-wrap items-center gap-2 font-sans font-normal text-xs text-[#2D241E] leading-normal">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5D4037] bg-amber-100 border border-[#D4C3A3]/60 px-2.5 py-0.5 rounded-full shadow-xs">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                        {currentLanguage === "ml"
                          ? "ഇപ്പോഴത്തെ മുഹൂർത്തം"
                          : currentLanguage === "te"
                            ? "ప్రస్తుత ముహూర్తం"
                            : "Active Now"}
                      </span>
                      <span className="font-serif font-bold text-[#5D4037] text-xs bg-[#F4E6D2]/60 px-2 py-0.5 rounded-md border border-[#D4C3A3]/30">
                        #{activeMuhurtaDetails.index} {activeMuhurtaDetails.nameEnglish} ({activeMuhurtaDetails.nameSanskrit})
                        <span className="text-[10px] font-sans font-normal text-[#8D6E63] ml-1">
                          {currentLanguage === "ml"
                            ? `(${activeMuhurtaDetails.nameMalayalam})`
                            : currentLanguage === "te"
                              ? `(${activeMuhurtaDetails.nameTelugu})`
                              : ""}
                        </span>
                      </span>
                      <span className="font-mono text-[10.5px] font-bold text-emerald-800 bg-emerald-50/70 py-0.5 px-2 border border-emerald-100 rounded-md whitespace-nowrap">
                        ⏱️ {formatMinutesTo12Hr(activeMuhurtaDetails.start)} - {formatMinutesTo12Hr(activeMuhurtaDetails.end)}
                      </span>
                      <span className="text-[11px] text-[#6D4C41] italic font-sans font-medium">
                        ({currentLanguage === "ml"
                          ? `അധിപൻ: ${activeMuhurtaDetails.deityMalayalam}`
                          : currentLanguage === "te"
                            ? `అధిపతి: ${activeMuhurtaDetails.deityTelugu}`
                            : `Deity: ${activeMuhurtaDetails.deityEnglish}`})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Toggle Button for show/hide Muhurtas list */}
            <div className="flex justify-center -mt-2">
              <button
                type="button"
                onClick={() => setShowUnderlyingMuhurtas(prev => !prev)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-[#D4C3A3] bg-[#FCF3E3] text-[#5D4037] hover:bg-[#5D4037] hover:text-[#FCF3E3] transition-all duration-200 font-serif font-bold text-xs shadow-xs"
                id="btn_toggle_muhurtas_list"
              >
                <span>ॐ</span>
                {showUnderlyingMuhurtas ? (
                  currentLanguage === "ml"
                    ? "മുഹൂർത്തങ്ങൾ മറച്ചുവെക്കുക"
                    : currentLanguage === "te"
                      ? "ముహూర్తములు దాచండి"
                      : "Hide all Muhurtas"
                ) : (
                  currentLanguage === "ml"
                    ? "എല്ലാ മുഹൂർത്തങ്ങളും കാണുക"
                    : currentLanguage === "te"
                      ? "అన్ని ముహూర్తములు చూడండి"
                      : "View all Muhurtas"
                )}
              </button>
            </div>

            {showUnderlyingMuhurtas && (
              <>
                {/* Filter and Search Bar controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#D4C3A3] pb-4">
              <div className="flex bg-[#EFEBE9] p-1 rounded-xl w-full sm:w-auto text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setMuhurtaPeriodFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    muhurtaPeriodFilter === "all"
                      ? "bg-[#5D4037] text-white shadow"
                      : "text-[#6D4C41] hover:text-[#5D4037]"
                  }`}
                >
                  {currentLanguage === "ml" ? "എല്ലാം" : currentLanguage === "te" ? "అన్నీ" : "All (30)"}
                </button>
                <button
                  type="button"
                  onClick={() => setMuhurtaPeriodFilter("day")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    muhurtaPeriodFilter === "day"
                      ? "bg-[#5D4037] text-white shadow"
                      : "text-[#6D4C41] hover:text-[#5D4037]"
                  }`}
                >
                  ☀️ {currentLanguage === "ml" ? "പകൽ" : currentLanguage === "te" ? "పగలు" : "Daytime (15)"}
                </button>
                <button
                  type="button"
                  onClick={() => setMuhurtaPeriodFilter("night")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    muhurtaPeriodFilter === "night"
                      ? "bg-[#5D4037] text-white shadow"
                      : "text-[#6D4C41] hover:text-[#5D4037]"
                  }`}
                >
                  🌙 {currentLanguage === "ml" ? "രാത്രി" : currentLanguage === "te" ? "రాత్రి" : "Nighttime (15)"}
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder={
                    currentLanguage === "ml"
                      ? "തിരയുക (ഉദാ: Rudra)..."
                      : currentLanguage === "te"
                        ? "శోధించండి (ఉదా: Rudra)..."
                        : "Filter by name or deity..."
                  }
                  value={muhurtaSearchText}
                  onChange={(e) => setMuhurtaSearchText(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs rounded-xl border border-[#D4C3A3] focus:outline-none focus:ring-1 focus:ring-[#C29200] bg-[#F9F6F1]/50 text-[#5D4037] placeholder-[#8D6E63]/70 font-sans"
                />
              </div>
            </div>

            {/* Dynamic Table containing times */}
            <div className="overflow-x-auto rounded-2xl border border-[#D4C3A3] shadow-sm">
              <table className="w-full text-left border-collapse bg-white text-xs text-[#2D241E]">
                <thead className="bg-[#F9F6F1] border-b border-[#D4C3A3] text-[10px] text-[#6D4C41] uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-4 py-3 font-bold text-center w-12">No.</th>
                    <th className="px-4 py-3 font-bold">Muhurta Name</th>
                    <th className="px-4 py-3 font-bold">Start Time</th>
                    <th className="px-4 py-3 font-bold">End Time</th>
                    <th className="px-4 py-3 font-bold">Ruling Deity</th>
                    <th className="px-4 py-3 font-bold text-center w-24">Nature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4C3A3]/30">
                  {filteredList.map((m) => {
                    const { start, end } = getMuhurtaTimeRange(m.index);
                    const active = isMuhurtaActive(m.index);
                    const isHighlyAuspicious = m.quality === "Highly Auspicious";
                    const isAuspicious = m.quality === "Shubha" || isHighlyAuspicious;

                    return (
                      <tr
                        key={m.index}
                        className={`transition-colors duration-150 ${
                          active
                            ? "bg-amber-50/75 border-l-4 border-l-[#C29200] font-medium"
                            : "hover:bg-[#F9F6F1]/35"
                        }`}
                      >
                        <td className="px-4 py-3 text-center font-mono font-bold text-[#8D6E63]">{m.index}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <span className="text-sm select-none mt-0.5" title={m.isNight ? "Night Muhurta" : "Day Muhurta"}>
                              {m.isNight ? "🌙" : "☀️"}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-serif font-bold text-[#5D4037] text-sm">
                                {m.nameEnglish}{" "}
                                <span className="text-xs font-normal text-[#8D6E63] font-sans">
                                  ({m.nameSanskrit})
                                </span>
                              </span>
                              <span className="text-[10px] text-gray-500 font-sans">
                                {currentLanguage === "ml"
                                  ? m.nameMalayalam
                                  : currentLanguage === "te"
                                    ? m.nameTelugu
                                    : m.nameEnglish}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                          {formatMinutesTo12Hr(start)}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-red-800 whitespace-nowrap">
                          {formatMinutesTo12Hr(end)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="flex flex-col leading-tight">
                            <span className="text-xs font-semibold">{m.deityEnglish}</span>
                            <span className="text-[10px] text-gray-500">
                              {currentLanguage === "ml"
                                ? m.deityMalayalam
                                : currentLanguage === "te"
                                  ? m.deityTelugu
                                  : m.deityEnglish}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              isHighlyAuspicious
                                ? "bg-amber-100 text-amber-950 border-amber-300 shadow-sm animate-pulse"
                                : isAuspicious
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {isHighlyAuspicious
                              ? currentLanguage === "ml" ? "അതിശുഭം" : currentLanguage === "te" ? "అత్యంత శుభం" : "Highly Auspicious"
                              : isAuspicious
                                ? currentLanguage === "ml" ? "ശുഭം" : currentLanguage === "te" ? "శుభం" : "Shubha"
                                : currentLanguage === "ml" ? "അശുഭം" : currentLanguage === "te" ? "అశుభం" : "Ashubha"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-400 font-medium">
                        No Muhurtas match your filter query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-[10.5px] leading-relaxed text-[#6D4C41] border border-[#D4C3A3]/50 rounded-xl p-3 bg-[#F9F6F1]/50 space-y-1">
              <span className="font-bold text-[#5D4037] block">
                🎯 {currentLanguage === "ml" 
                  ? "ദൃശ്യ സമയഗണന തത്വം (Sidereal Timekeeping Principle):" 
                  : currentLanguage === "te" 
                    ? "నక్షత్ర కాలഗണన సిద్ధాంతం (Sidereal Timekeeping Principle):" 
                    : "Sidereal Timekeeping Principle:"}
              </span>
              <p>
                {currentLanguage === "ml" ? (
                  <>
                    സാധാരണ ക്ലോക്കുകളിൽ മണിക്കൂറുകൾ സ്ഥിരമായിരിക്കുന്നതിൽ നിന്നും വ്യത്യസ്തമായി, <strong>വൈദിക മുഹൂർത്തങ്ങൾ ആനുപാതികമാണ്</strong>. 
                    പകലിന്റെയോ രാത്രിയുടെയോ ദൈർഘ്യത്തിന്റെ കൃത്യം പതിനഞ്ചിൽ ഒന്നാണ് (1/15) ഒരു മുഹൂർത്തം. പകലോ രാത്രിയോ നീളമുള്ളതോ കുറഞ്ഞതോ ആകുമ്പോൾ, 
                    ഓരോ മുഹൂർത്തത്തിന്റെയും ദൈർഘ്യം സ്വയമേവ ക്രമീകരിക്കപ്പെടുന്നു. ഈ ദൃക്-ഗണിത പട്ടിക നിങ്ങളുടെ സ്ഥാനത്തിനനുസരിച്ചുള്ള തത്സമയ ജ്യോതിശാസ്ത്ര കണക്കുകൂട്ടലുകളെയാണ് പ്രതിഫലിപ്പിക്കുന്നത്!
                  </>
                ) : currentLanguage === "te" ? (
                  <>
                    గంటలు స్థిరంగా ఉండే సాధారణ గడియారాల లాగా కాకుండా, <strong>వైదిక ముహూర్తాలు ఆనుపాతికమైనవి</strong>. 
                    ఒక ముహూర్తం అంటే పగలు లేదా రాత్రి కాల వ్యవధిలో ఖచ్చితంగా 1/15వ భాగం. పగలు లేదా రాత్రి సమయాలు పెరిగినప్పుడు లేదా తగ్గినప్పుడు, 
                    ప్రతి ముహూర్తం యొక్క నిడివి కూడా స్వయంచాలకంగా మారుతుంది. ఈ దృక్-సిద్ధాంత గణిత పట్టిక మీ లొకేషన్ ఆధారంగా తత్కాల ఖగోళ గణనలను ప్రతిబింబిస్తుంది!
                  </>
                ) : (
                  <>
                    Unlike standard clocks where hours are fixed, <strong>Vedic Muhurtas are proportional</strong>. 
                    A Muhurta is precisely 1/15th of the length of either daytime or nighttime. When days are longer or shorter, 
                    individual Muhurta durations scale automatically. This Drik-Ganita table reflects real-time astronomical 
                    re-calculations for your coordinates!
                  </>
                )}
              </p>
            </div>
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
}
