import React, { useState, useMemo } from "react";
import { 
  X, 
  BookOpen, 
  Info, 
  MapPin, 
  Volume2, 
  Compass, 
  HelpCircle,
  Clock,
  ExternalLink,
  Github,
  Mail,
  User
} from "lucide-react";
import { SACRED_TREASURY_PLAYLIST, getPlaylistForMuhurta } from "./DevotionalPlayer";
import { MUHURTAS_LIST } from "./JathakamPanel";

interface SastraReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: 'en' | 'ml' | 'te';
  locationDetails: {
    lat: number;
    lng: number;
    placeName: string;
    sunrise: string;
    sunset: string;
    isGeolocated: boolean;
  };
  onOpenIntro: () => void;
}

export default function SastraReportModal({
  isOpen,
  onClose,
  currentLanguage,
  locationDetails,
  onOpenIntro,
}: SastraReportModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rahukalam' | 'location' | 'muhurtas' | 'audio' | 'support'>('overview');

  const audioStats = useMemo(() => {
    const total = SACRED_TREASURY_PLAYLIST.length;
    const mantras = SACRED_TREASURY_PLAYLIST.filter(t => t.category === "mantra").length;
    const stotrams = SACRED_TREASURY_PLAYLIST.filter(t => t.category === "stotram").length;
    const sahasranamams = SACRED_TREASURY_PLAYLIST.filter(t => t.category === "sahasranamam").length;
    const suprabhatams = SACRED_TREASURY_PLAYLIST.filter(t => t.category === "suprabhatam").length;
    const ashtakams = SACRED_TREASURY_PLAYLIST.filter(t => t.category === "ashtakam").length;
    const shirdi = SACRED_TREASURY_PLAYLIST.filter(t => t.category === "shirdi").length;
    const ayyappa = SACRED_TREASURY_PLAYLIST.filter(t => t.category === "ayyappa").length;
    const songs = SACRED_TREASURY_PLAYLIST.filter(t => t.category === "songs").length;
    const others = total - (mantras + stotrams + sahasranamams + suprabhatams + ashtakams + shirdi + ayyappa + songs);
    return { total, mantras, stotrams, sahasranamams, suprabhatams, ashtakams, shirdi, ayyappa, songs, others };
  }, []);

  // Render Live Calculated Rahu, Gulika & Yamagandam steps for the dynamic manual
  const rahuKalamSteps = useMemo(() => {
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

    const sunriseMins = parseTimeToMinutes(locationDetails.sunrise);
    const sunsetMins = parseTimeToMinutes(locationDetails.sunset);
    const dayDurationMins = sunsetMins - sunriseMins;
    const partDurationMins = dayDurationMins / 8;

    const daysOfWeek = {
      en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      ml: ["ഞായറാഴ്ച", "തിങ്കളാഴ്ച", "ചൊവ്വാഴ്ച", "ബുധനാഴ്ച", "വ്യാഴാഴ്ച", "വെള്ളിയാഴ്ച", "ശനിയാഴ്ച"],
      te: ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"]
    };

    const weekdayIndex = new Date().getDay();
    const dayName = daysOfWeek[currentLanguage][weekdayIndex];

    const partMapping: Record<number, number> = {
      0: 8, // Sunday (8th part)
      1: 2, // Monday (2nd part)
      2: 7, // Tuesday (7th part)
      3: 5, // Wednesday (5th part)
      4: 6, // Thursday (6th part)
      5: 4, // Friday (4th part)
      6: 3, // Saturday (3rd part)
    };

    const gulikaMapping: Record<number, number> = {
      0: 7, // Sunday
      1: 6, // Monday
      2: 5, // Tuesday
      3: 4, // Wednesday
      4: 3, // Thursday
      5: 2, // Friday
      6: 1, // Saturday
    };

    const yamaMapping: Record<number, number> = {
      0: 5, // Sunday
      1: 4, // Monday
      2: 3, // Tuesday
      3: 2, // Wednesday
      4: 1, // Thursday
      5: 7, // Friday
      6: 6, // Saturday
    };

    const partNum = partMapping[weekdayIndex] || 8;
    const startMin = sunriseMins + (partNum - 1) * partDurationMins;
    const endMin = sunriseMins + partNum * partDurationMins;

    const gulikaPartNum = gulikaMapping[weekdayIndex] || 7;
    const gulikaStartMin = sunriseMins + (gulikaPartNum - 1) * partDurationMins;
    const gulikaEndMin = sunriseMins + gulikaPartNum * partDurationMins;

    const yamaPartNum = yamaMapping[weekdayIndex] || 5;
    const yamaStartMin = sunriseMins + (yamaPartNum - 1) * partDurationMins;
    const yamaEndMin = sunriseMins + yamaPartNum * partDurationMins;

    return {
      sunriseMinutes: sunriseMins,
      sunsetMinutes: sunsetMins,
      durationMinutes: dayDurationMins,
      durationHours: (dayDurationMins / 60).toFixed(2),
      partDuration: partDurationMins.toFixed(1),
      partNum,
      gulikaPartNum,
      yamaPartNum,
      todayName: dayName,
      todayRahuStart: formatMinutesTo12Hr(startMin),
      todayRahuEnd: formatMinutesTo12Hr(endMin),
      todayGulikaStart: formatMinutesTo12Hr(gulikaStartMin),
      todayGulikaEnd: formatMinutesTo12Hr(gulikaEndMin),
      todayYamaStart: formatMinutesTo12Hr(yamaStartMin),
      todayYamaEnd: formatMinutesTo12Hr(yamaEndMin),
    };
  }, [locationDetails, currentLanguage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300" id="sastra_report_portal_modal">
      <div 
        className="relative bg-[#FCFBF7] rounded-3xl border-3 border-[#D4C3A3] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up"
        id="sastra_report_modal_card"
      >
        {/* Fancy Golden Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-700 via-[#C29200] to-amber-700"></div>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#D4C3A3]/60 bg-[#F9F5EE]" id="sastra_modal_header_row">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FCF3E3] border border-[#C29200]/50 text-[#8D6E63] shrink-0 mt-0.5">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-[15px] sm:text-[18px] font-black text-[#3E2723] tracking-tight leading-tight">
                {currentLanguage === "ml" 
                  ? "ശാസ്ത്ര - സാങ്കേതിക വിവരണം" 
                  : currentLanguage === "te" 
                    ? "శాస్త్ర సాంకేతిక వివరణ పుస్తకం" 
                    : "Sastra & Technical Alignment Manual"}
              </h2>
              <p className="font-mono text-[9px] uppercase tracking-wider text-amber-800 font-extrabold mt-0.5 leading-normal">
                {currentLanguage === "ml" ? "ആപ്പ് ഗൈഡും ആസ്ട്രോ മാത്തമാറ്റിക്സും" : currentLanguage === "te" ? "యాప్ గైడ్ మరియు ఖగోళ గణనలు" : "App Guide & Astro-Calculus"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 ml-13 sm:ml-0 shrink-0" id="sastra_header_buttons">
            <button
              onClick={onOpenIntro}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#5D4037] hover:text-[#3E2723] text-[11px] font-bold transition duration-150 cursor-pointer shadow-3xs shrink-0"
              id="sastra_open_tour_btn"
              title="Open Application Tour"
            >
              <Compass className="w-3.5 h-3.5 text-amber-700 animate-[spin_10s_linear_infinite] shrink-0" />
              <span className="hidden min-[480px]:inline">
                {currentLanguage === "ml" ? "ആപ്പ് പരിചയം" : currentLanguage === "te" ? "యాప్ పరిచయం" : "Application Tour"}
              </span>
              <span className="min-[480px]:hidden">
                {currentLanguage === "ml" ? "പരിചയം" : currentLanguage === "te" ? "పరిచయం" : "Tour"}
              </span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-black transition cursor-pointer shrink-0"
              id="close_sastra_modal_btn"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-6 border-b border-[#D4C3A3]/40 bg-[#FAF7F1]" id="sastra_tabs_container">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full py-2.5 sm:py-3 text-center text-[9.5px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer whitespace-normal sm:whitespace-nowrap px-2 sm:px-4 ${
              activeTab === 'overview'
                ? "border-amber-700 text-amber-900 bg-[#FCFBF7] font-extrabold"
                : "border-transparent text-[#8D6E63] hover:text-amber-800 hover:bg-amber-50/20"
            }`}
          >
            {currentLanguage === "ml" ? "ഗ്രന്ഥസംഗ്രഹം" : currentLanguage === "te" ? "పరిచయం" : "Overview"}
          </button>
          <button
            onClick={() => setActiveTab('rahukalam')}
            className={`w-full py-2.5 sm:py-3 text-center text-[9.5px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer whitespace-normal sm:whitespace-nowrap px-2 sm:px-4 ${
              activeTab === 'rahukalam'
                ? "border-amber-700 text-amber-900 bg-[#FCFBF7] font-extrabold"
                : "border-transparent text-[#8D6E63] hover:text-amber-800 hover:bg-amber-50/20"
            }`}
          >
            {currentLanguage === "ml" ? "ത്രികാല ഗണിതം" : currentLanguage === "te" ? "త్రికాల లెక్కింపు" : "Tri-Kalam Math"}
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`w-full py-2.5 sm:py-3 text-center text-[9.5px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer whitespace-normal sm:whitespace-nowrap px-2 sm:px-4 ${
              activeTab === 'location'
                ? "border-amber-700 text-amber-900 bg-[#FCFBF7] font-extrabold"
                : "border-transparent text-[#8D6E63] hover:text-amber-800 hover:bg-amber-50/20"
            }`}
          >
            {currentLanguage === "ml" ? "ലൊക്കേഷൻ" : currentLanguage === "te" ? "స్థాన గుర్తింపు" : "Precision Location"}
          </button>
          <button
            onClick={() => setActiveTab('muhurtas')}
            className={`w-full py-2.5 sm:py-3 text-center text-[9.5px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer whitespace-normal sm:whitespace-nowrap px-2 sm:px-4 ${
              activeTab === 'muhurtas'
                ? "border-amber-700 text-amber-900 bg-[#FCFBF7] font-extrabold"
                : "border-transparent text-[#8D6E63] hover:text-amber-800 hover:bg-amber-50/20"
            }`}
          >
            {currentLanguage === "ml" ? "30 മുഹൂർത്തങ്ങൾ" : currentLanguage === "te" ? "30 ముహూర్తములు" : "30 Muhurtas"}
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`w-full py-2.5 sm:py-3 text-center text-[9.5px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer whitespace-normal sm:whitespace-nowrap px-2 sm:px-4 ${
              activeTab === 'audio'
                ? "border-amber-700 text-amber-900 bg-[#FCFBF7] font-extrabold"
                : "border-transparent text-[#8D6E63] hover:text-amber-800 hover:bg-amber-50/20"
            }`}
          >
            {currentLanguage === "ml" ? "ഓഡിയോ സ്ട്രീമിംഗ്" : currentLanguage === "te" ? "ఆడియో స్ట్రీమింగ్" : "Audio Feeding"}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`w-full py-2.5 sm:py-3 text-center text-[9.5px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer whitespace-normal sm:whitespace-nowrap px-2 sm:px-4 ${
              activeTab === 'support'
                ? "border-amber-700 text-amber-900 bg-[#FCFBF7] font-extrabold"
                : "border-transparent text-[#8D6E63] hover:text-amber-800 hover:bg-amber-50/20"
            }`}
          >
            {currentLanguage === "ml" ? "സപ്പോർട്ട്" : currentLanguage === "te" ? "సపోర్ట్" : "Support"}
          </button>
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-[#3E2723] leading-relaxed select-text" id="sastra_modal_body_content">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-5 animate-fade-in" id="sastra_tab_overview">
              <div className="p-4 rounded-2xl bg-[#FCF3E3] border border-[#D4C3A3]/50">
                <h3 className="font-serif text-[14px] sm:text-[15px] font-black text-[#5D4037] mb-2 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#C29200]" />
                  {currentLanguage === "ml" ? "പദ്ധതി വിവരണവും പരമ ലക്ഷ്യവും" : currentLanguage === "te" ? "అప్లికేషన్ ప్రాముఖ్యత మరియు లక్ష్యం" : "Celestial Workstation Purpose"}
                </h3>
                <p className="text-[#5D4037] font-medium text-[12px] sm:text-[13px] leading-relaxed">
                  {currentLanguage === "ml" ? (
                    "ഭാരതീയ ജ്യോതിശാസ്ത്രത്തെയും സംഗീതശാസ്ത്രത്തെയും ആധുനിക സാങ്കേതികവിദ്യയുടെ സഹായത്തോടെ നിങ്ങളുടെ വിരൽത്തുമ്പിൽ എത്തിക്കുക എന്നതാണ് ജിജ്ഞാസയോടെ തയ്യാറാക്കിയ ഈ ആപ്ലിക്കേഷന്റെ പ്രധാന ലക്ഷ്യം. പരമ്പരാഗത പഞ്ചാംഗ രീതികളിൽ ഉണ്ടാകുന്ന സമയവ്യത്യാസം ഒഴിവാക്കി തത്സമയ സൂര്യോദയ ക്രാന്തികളുമായി ചേരുന്ന സൂക്ഷ്മ മുഹൂർത്തങ്ങൾ ഇവിടെ പ്രദർശിപ്പിക്കുന്നു."
                  ) : currentLanguage === "te" ? (
                    "ప్రాచీన భారతీయుల నింగి గమనాలను, శాస్త్రీయ రాగ నిధాన సంగీతాన్ని నేటి సాంకేతిక అవసరాలకు సింక్ చేస్తూ ఈ అప్లికేషన్ సృష్టించబడింది. సాధారణ క్యాలెండర్స్ లో ఉండే పొరబాట్లు లేకుండా నేటి భౌగోళిక సూర్యోదయ సమయం ప్రకారం ఇక్కడ 30 ముహూర్తాల సమాచారాన్ని (Daily Muhurtas) పొందుపరిచాము."
                  ) : (
                    "This celestial workstation harmonizes classical Indian astronomical calculations (Drik-Ganitam) with real-time solar positioning to deliver accurate, coordinate-synchronized Daily Muhurtas and local astrological values. No pre-calculated global tables are used; everything is computed live on-the-fly."
                  )}
                </p>
              </div>

              {/* Drigganitam Description Card */}
              <div className="p-4 rounded-2xl bg-amber-50/75 border border-[#D4C3A3]/40 shadow-2xs" id="sastra_drigganitam_card">
                <h3 className="font-serif text-[14px] sm:text-[15px] font-black text-[#5D4037] mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-700" />
                  {currentLanguage === "ml" ? "ദൃഗ്ഗണിത സമ്പ്രദായം" : currentLanguage === "te" ? "దృగ్గణిత సిద్ధాంతం" : "The Science of Drigganitam"}
                </h3>
                <p className="text-[#5D4037] text-[12px] sm:text-[13px] leading-relaxed">
                  {currentLanguage === "ml" ? (
                    <>
                      <strong>ദൃഗ്ഗണിതം (ദൃക്സിദ്ധാന്തം):</strong> പുരാതനവും മാറ്റമില്ലാത്തതുമായ സൂത്രവാക്യങ്ങൾക്ക് പകരം പ്രത്യക്ഷ നിരീക്ഷണങ്ങളെ അടിസ്ഥാനമാക്കി ഗ്രഹസ്ഥാനങ്ങൾ കണക്കാക്കുന്ന ശാസ്ത്രീയ ജ്യോതിശാസ്ത്ര രീതിയാണിത്. കേരളീയനായ വടശ്ശേരി പരമേശ്വരൻ നമ്പൂതിരിയെപ്പോലെയുള്ള ആചാര്യന്മാർ വികസിപ്പിച്ചെടുത്ത ദൃഗ്ഗണിത സമ്പ്രദായം, ടെലിസ്കോപ്പിലൂടെ കാണുന്ന യഥാർത്ഥ ഗ്രഹരേഖകളുമായി തികച്ചും പൊരുത്തപ്പെടുന്നു.
                    </>
                  ) : currentLanguage === "te" ? (
                    <>
                      <strong>దృగ్గణితం (దృక్సిద్ధాంతం):</strong> ప్రాచీన మార్పులేని సూత్రాలకు పరిమితం కాకుండా, కంటికి కనిపించే ఖగోళ స్థితుల ఆధారంగా గ్రహాల గమనాన్ని లెక్కించే శాస్త్రీయ పద్ధతి. కేరళకు చెందిన పరమేశ్వర వంటి మహర్షులు ప్రాచుర్యంలోకి తెచ్చిన ఈ విధానం, ఆధునిక టెలిస్కోప్ ల ద్వారా లభించే ఖచ్చితమైన అంతరిక్ష స్థానాలతో సంపూర్ణంగా ఏకీభవిస్తుంది.
                    </>
                  ) : (
                    <>
                      <strong>Drigganitam (Drik-Siddhanta):</strong> The scientific school of Indian astronomy that computes celestial positions using empirical, direct observation rather than archaic static formulas. Pioneered by legendary scholars like Paramesvara of Kerala, Drigganitam continuously aligns planetary calculus with true observable visual coordinates, ensuring perfect mathematical agreement with modern telescopes.
                    </>
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-serif text-[13px] font-bold text-amber-950 mb-1 border-b border-[#D4C3A3]/40 pb-1 flex items-center gap-1.5">
                  <span className="text-amber-700">●</span>
                  {currentLanguage === "ml" ? "ആപ്ലിക്കേഷൻ എന്തുചെയ്യുന്നു?" : currentLanguage === "te" ? "ఈ యాప్ ఏం చేస్తుంది?" : "What does this application do?"}
                </h4>
                <ul className="list-disc pl-5 text-[12px] space-y-1.5 text-neutral-700 font-sans">
                  {currentLanguage === "ml" ? (
                    <>
                      <li><strong>പ്രാദേശിക നക്ഷത്ര ഗണനം:</strong> നിങ്ങളുടെ ലൊക്കേഷൻ കണ്ടെത്തി അവിടുത്തെ സൂര്യോദയവവുമായി ചേരുന്ന 30 ദൈനംദിന വൈദിക മുഹൂർത്തങ്ങളും തത്സമയ രാഹുകാലവും വിന്യാസത്തോടെ സപ്പോർട്ട് ചെയ്യുന്നു.</li>
                      <li><strong>പ്രകൃതിദത്ത സംഗീതാലയം:</strong> ഓരോ രാശിക്കും ദിവ്യകാലങ്ങൾക്കും ചേരുന്ന ശാസ്ത്രീയമായ കീർത്തനങ്ങളും സഹസ്രനാമങ്ങളും നേരിട്ടുള്ള കൺട്രോളുകളിലൂടെ പ്ലേ ചെയ്യുന്നു.</li>
                      <li><strong>വൈവിധ്യമാർന്ന ഭാഷാപിന്തുണ:</strong> മികച്ച വായനാനുഭവത്തിനായി നിലവിൽ മലയാളം, തെലുങ്ക്, ഇംഗ്ലീഷ് ഭാഷാ പതിപ്പുകൾ ലഭ്യമാക്കിയിരിക്കുന്നു.</li>
                    </>
                  ) : currentLanguage === "te" ? (
                    <>
                      <li><strong>దివ్య ముహూర్తాల గణన:</strong> ప్రతి రోజూ సూర్యోదయం నుండి మొదలయ్యే 30 ముహూర్తాల కాలాన్ని, ఈ రోజు యొక్క ఖచ్చితమైన రాహుకాలాన్ని లెక్కిస్తుంది.</li>
                      <li><strong>అనుకూల అలయ ధ్వనులు:</strong> వివిధ ఆధ్యాత్మిక సాహెస్రనామ కీర్తనలు, సదాశివ పంచాక్షరి స్తోత్రాలు నేరుగా ఆఫ్‌లైన్ స్థిర వనరుల నుండి అందుబాటులో ఉంటాయి.</li>
                      <li><strong>భాషా సమన్వయం:</strong> ఆండ్రాయిడ్ మరియు వెబ్ సాధనాల కోసం తెలుగు, మలయాళం మరియు ఇంగ్లీష్ భాషల అనువాదాలు పొందుపరచబడ్డాయి.</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Dynamic Astro-Chronology:</strong> Live projection of the 30 Vedic daytime and nighttime Muhurthas along with corresponding traditional rulers and descriptions.</li>
                      <li><strong>Remedial Temple Acoustics:</strong> Seamless play controls streaming authentic, traditional chants directly associated with specific planets and time frames.</li>
                      <li><strong>Indian Regionalized UI:</strong> Fully localized in pure literary English, high-precision Malayalam, and classic Telugu dialects.</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="text-[11px] font-mono text-[#8D6E63] border border-[#D4C3A3]/50 p-3 rounded-xl bg-amber-50/50 flex items-start gap-2 select-text">
                <HelpCircle className="h-4 w-4 text-[#C29200] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold underline block mb-1">
                    {currentLanguage === "ml" ? "മാധവ-ശാസ്ത്ര സമന്വയം:" : currentLanguage === "te" ? "మాధవ-ఖగోళ సిద్ధాంతం:" : "Madhava-Vedic Astro Physics:"}
                  </span>
                  {currentLanguage === "ml" ? (
                    "പഴയ വിഭജന പട്ടികകൾ ഒഴിവാക്കി കൃത്യമായ ഗോളീയ സ്ഥാനങ്ങളും, പ്രപഞ്ചത്തിന്റെ കാന്തിക വികിരണങ്ങളും ആസ്പദമാക്കിയാണ് എല്ലാ ജ്യോതിശാസ്ത്ര കണക്കുകൂട്ടലുകളും ഇവിടെ തയ്യാറാക്കിയിരിക്കുന്നത്. ഇത് ദൃഗ്ഗോചരമായ യാഥാർത്ഥ്യങ്ങളെ ശരിയായി അനുസ്മരിപ്പിക്കുന്നു."
                  ) : currentLanguage === "te" ? (
                    "మధ్యయుగ నాటి స్థిర పంచాంగాలను కాకుండా, సమకాలీన టెలిస్കോప్ ల ద్వారా నింగిని గమనిస్తే గ్రహాలు మరియు సూర్యుని స్థితులు ఎక్కడుంటాయో అదే సూత్రాలను ఇక్కడ నిరయన పద్ధతిలో అమలు చేసాము."
                  ) : (
                    "Deviating from unscientific tables, we calculate values on genuine spherical mechanics. Mathematical alignments are resolved utilizing physical Precession computations (Ayanamsa at ~50.29 arcseconds/year)."
                  )}
                </div>
              </div>

              {/* Public Open-Source Github Repo Card */}
              <div className="text-[11px] font-mono text-neutral-600 border border-neutral-300 p-3.5 rounded-xl bg-neutral-100/80 flex items-start gap-3 select-text shadow-3xs" id="github_open_source_note">
                <Github className="h-5 w-5 text-neutral-800 shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <span className="font-sans font-bold text-neutral-800 block text-[12.5px] mb-1">
                    {currentLanguage === "ml" ? "പൊതു ഓപ്പൺ സോഴ്സ് പദ്ധതി" : currentLanguage === "te" ? "ఓపెన్ సోర్స్ ఉచిత ప్రాజెక్ట్" : "Public Open-Source Initiative"}
                  </span>
                  <p className="font-sans leading-relaxed text-[11.5px] text-neutral-700">
                    {currentLanguage === "ml" ? (
                      "ഇതൊരു പൂർണ്ണമായ ഓപ്പൺ സോഴ്സ് പ്രോജക്റ്റാണ്; ഇതിന്റെ മുഴുവൻ കോഡും ഞങ്ങളുടെ പബ്ലിക് GitHub റിപ്പോസിറ്ററിയിൽ ലഭ്യമാണ്. താങ്കൾക്ക് ഇതിലേക്ക് സംഭാവനകൾ നൽകാനും പരിശോധിക്കാനും സാധിക്കും:"
                    ) : currentLanguage === "te" ? (
                      "ఇది సంపూర్ణ ఓపెన్ సోర్స్ ప్రాజెక్ట్; దీనికి సంబంధించిన పూర్తి సోర్స్ కోడ్ మా పబ్లిక్ GitHub రిపోజిటరీలో అందరికీ లభ్యమవుతుంది. మీరు కూడా భాగస్వామ్యం పంచుకోవచ్చు:"
                    ) : (
                      "This is an open-source project; the complete source code is available to the public in our GitHub repository. You are welcome to browse, inspect, or contribute to our workspace:"
                    )}
                  </p>
                  <div className="mt-2.5">
                    <a 
                      href="https://github.com/mobitrendz/astromusic" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex max-w-full items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 text-white font-sans font-semibold text-[11px] transition hover:bg-neutral-900 cursor-pointer shadow-3xs min-w-0"
                    >
                      <Github className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate min-w-0">github.com/mobitrendz/astromusic</span>
                      <ExternalLink className="h-3 w-3 opacity-70 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rahukalam' && (
            <div className="flex flex-col gap-4 animate-fade-in" id="sastra_tab_rahukalam">
              <div className="border border-green-600/30 bg-green-50/50 rounded-2xl p-4 flex flex-col gap-2.5">
                <h3 className="font-serif text-[14px] font-black text-green-950 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-700" />
                  {currentLanguage === "ml" ? "തത്സമയ ത്രികാല നിർണ്ണയം (രാഹു, ഗുളികൻ, യമകണ്ടകൻ)" : currentLanguage === "te" ? "తక్షణ త్రికాల లెక్కింపు సూత్రం" : "Tri-Kalam (Rahu, Gulika, Yama) Formulas & Live Sandbox"}
                </h3>
                <p className="text-green-950 font-sans text-[12px] leading-relaxed">
                  {currentLanguage === "ml" ? (
                    "രാഹുകാലം, ഗുളികകാലം, യമകണ്ടകം എന്നിവ പ്രാദേശിക ഉദയാസ്തമയ സമയങ്ങളെ അടിസ്ഥാനമാക്കിയാണ് ലൊക്കേഷനുകളിൽ നിർണ്ണയിക്കുന്നത്. പകലിലെ സമയദൈർഘ്യത്തെ കൃത്യമായി 8 തുല്യ ഭാഗങ്ങളായി വിഭജിച്ച ശേഷം, ദിവസേനയുള്ള പരമ്പരാഗത ഭാഗങ്ങൾ ഉപയോഗിച്ച് ഇവ കണക്കാക്കുന്നു."
                  ) : currentLanguage === "te" ? (
                    "రాహుకాలం, గుళికా కాలం మరియు యమగండములు ఒక రోజు సూర్యోదయ సమయం నుండి సూర్యాస్తమయం సమయం వరకు గల పగటి కాలాన్ని 8 సమాన భాగాలుగా విభజించి లెక్కిస్తారు. వారం రోజు ఆధారంగా ఖచ్చితమైన సమయాన్ని గ్రహిస్తాము."
                  ) : (
                    "Rahu Kalam, Gulika Kalam, and Yamagandam represent distinct sub-periods within the daylight hours. By obtaining the exact coordinate-synced local sunrise and sunset timings, the diurnal length is divided into exactly 8 equal segments ($Duration = Daylight / 8$), and traditional day-specific segments are allocated."
                  )}
                </p>
              </div>

              {/* Day segments breakdown table */}
              <div className="overflow-x-auto border border-[#D4C3A3] rounded-xl bg-white shadow-3xs w-full max-w-full" id="rahukalam_segments_chart">
                <table className="w-full min-w-[500px] text-left text-[11px] sm:text-[12px] font-sans">
                  <thead className="bg-[#FAF7F1] border-b border-[#D4C3A3]">
                    <tr>
                      <th className="px-3 py-2 text-amber-950 font-bold">{currentLanguage === "ml" ? "ദിവസം" : currentLanguage === "te" ? "వారం" : "Weekday"}</th>
                      <th className="px-3 py-2 text-red-950 font-bold text-center">Rahu (രാഹു)</th>
                      <th className="px-3 py-2 text-amber-950 font-bold text-center">Gulika (ഗുളികൻ)</th>
                      <th className="px-3 py-2 text-teal-950 font-bold text-center">Yama (യമൻ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4C3A3]/40 text-neutral-700 font-mono text-[11px]">
                    <tr className={new Date().getDay() === 1 ? "bg-amber-100/40" : ""}>
                      <td className="px-3 py-1.5 font-sans font-semibold">{currentLanguage === "ml" ? "തിങ്കൾ" : currentLanguage === "te" ? "సోమవారం" : "Monday"}</td>
                      <td className="px-3 py-1.5 text-center text-red-800">2nd Part (07:30 - 09:00)</td>
                      <td className="px-3 py-1.5 text-center text-amber-800">6th Part (13:30 - 15:00)</td>
                      <td className="px-3 py-1.5 text-center text-teal-800">4th Part (10:30 - 12:00)</td>
                    </tr>
                    <tr className={new Date().getDay() === 2 ? "bg-amber-100/40" : ""}>
                      <td className="px-3 py-1.5 font-sans font-semibold">{currentLanguage === "ml" ? "ചൊവ്വ" : currentLanguage === "te" ? "మంగళవారం" : "Tuesday"}</td>
                      <td className="px-3 py-1.5 text-center text-red-800">7th Part (15:00 - 16:30)</td>
                      <td className="px-3 py-1.5 text-center text-amber-800">5th Part (12:00 - 13:30)</td>
                      <td className="px-3 py-1.5 text-center text-teal-800">3rd Part (09:00 - 10:30)</td>
                    </tr>
                    <tr className={new Date().getDay() === 3 ? "bg-amber-100/40" : ""}>
                      <td className="px-3 py-1.5 font-sans font-semibold">{currentLanguage === "ml" ? "ബുധൻ" : currentLanguage === "te" ? "బుధవారం" : "Wednesday"}</td>
                      <td className="px-3 py-1.5 text-center text-red-800">5th Part (12:00 - 13:30)</td>
                      <td className="px-3 py-1.5 text-center text-amber-800">4th Part (10:30 - 12:00)</td>
                      <td className="px-3 py-1.5 text-center text-teal-800">2nd Part (07:30 - 09:00)</td>
                    </tr>
                    <tr className={new Date().getDay() === 4 ? "bg-amber-100/40" : ""}>
                      <td className="px-3 py-1.5 font-sans font-semibold">{currentLanguage === "ml" ? "വ്യാഴം" : currentLanguage === "te" ? "గురువారం" : "Thursday"}</td>
                      <td className="px-3 py-1.5 text-center text-red-800">6th Part (13:30 - 15:00)</td>
                      <td className="px-3 py-1.5 text-center text-amber-800">3rd Part (09:00 - 10:30)</td>
                      <td className="px-3 py-1.5 text-center text-teal-800">1st Part (06:00 - 07:30)</td>
                    </tr>
                    <tr className={new Date().getDay() === 5 ? "bg-amber-100/40" : ""}>
                      <td className="px-3 py-1.5 font-sans font-semibold">{currentLanguage === "ml" ? "വെള്ളി" : currentLanguage === "te" ? "శుక్రవారం" : "Friday"}</td>
                      <td className="px-3 py-1.5 text-center text-red-800">4th Part (10:30 - 12:00)</td>
                      <td className="px-3 py-1.5 text-center text-amber-800">2nd Part (07:30 - 09:00)</td>
                      <td className="px-3 py-1.5 text-center text-teal-800">7th Part (15:00 - 16:30)</td>
                    </tr>
                    <tr className={new Date().getDay() === 6 ? "bg-amber-100/40" : ""}>
                      <td className="px-3 py-1.5 font-sans font-semibold">{currentLanguage === "ml" ? "ശനി" : currentLanguage === "te" ? "శనివారం" : "Saturday"}</td>
                      <td className="px-3 py-1.5 text-center text-red-800">3rd Part (09:00 - 10:30)</td>
                      <td className="px-3 py-1.5 text-center text-amber-800">1st Part (06:00 - 07:30)</td>
                      <td className="px-3 py-1.5 text-center text-teal-800">6th Part (13:30 - 15:00)</td>
                    </tr>
                    <tr className={new Date().getDay() === 0 ? "bg-amber-100/40" : ""}>
                      <td className="px-3 py-1.5 font-sans font-semibold">{currentLanguage === "ml" ? "ഞായർ" : currentLanguage === "te" ? "ఆదివారం" : "Sunday"}</td>
                      <td className="px-3 py-1.5 text-center text-red-800">8th Part (16:30 - 18:00)</td>
                      <td className="px-3 py-1.5 text-center text-amber-800">7th Part (15:00 - 16:30)</td>
                      <td className="px-3 py-1.5 text-center text-teal-800">5th Part (12:00 - 13:30)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Dynamic live calculation sandbox */}
              <div className="p-4 rounded-xl border-2 border-dashed border-[#D4C3A3] bg-[#FAF8F5]">
                <span className="text-[9px] uppercase tracking-wider text-[#8D6E63] font-mono font-bold block mb-1">
                  ⚡ {currentLanguage === "ml" ? "തത്സമയ ഗണിത മാതൃക (നിങ്ങളുടെ ലൊക്കേഷനിൽ):" : currentLanguage === "te" ? "తక్షణ లెక్కింపు వివరణ (మీ స్థానములో):" : "Calculations for your active location:"}
                </span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-[12px] font-medium border-b border-[#D4C3A3]/40 pb-2.5">
                  <div>{currentLanguage === "ml" ? "തിരഞ്ഞെടുത്ത സ്ഥലം:" : currentLanguage === "te" ? "ఎంచుకున్న ప్రదేశము:" : "Selected Place:"}</div>
                  <div className="text-right text-[#5D4037] truncate font-sans font-bold min-w-0" title={locationDetails.placeName}>{locationDetails.placeName}</div>

                  <div>{currentLanguage === "ml" ? "സൂര്യോദയ സമയം:" : currentLanguage === "te" ? "సూర్యోదయం:" : "Sunrise Time:"}</div>
                  <div className="text-right font-mono font-bold">{locationDetails.sunrise}</div>

                  <div>{currentLanguage === "ml" ? "സൂര്യസ്തമയം സമയം:" : currentLanguage === "te" ? "సూర్యాస్తమయం:" : "Sunset Time:"}</div>
                  <div className="text-right font-mono font-bold">{locationDetails.sunset}</div>

                  <div>{currentLanguage === "ml" ? "പകലിന്റെ ദൈർഘ്യം:" : currentLanguage === "te" ? "పగటి నిడివి:" : "Day Duration:"}</div>
                  <div className="text-right font-mono font-bold text-[#E65100]">
                    {rahuKalamSteps.durationHours} hrs ({rahuKalamSteps.durationMinutes} mins)
                  </div>

                  <div>{currentLanguage === "ml" ? "ഓരോ ഭാഗത്തിന്റെയും ദൈർഘ്യം:" : currentLanguage === "te" ? "ప్రతి భాగం వ్యవధి:" : "Each Segment size:"}</div>
                  <div className="text-right font-mono font-bold text-amber-800">{rahuKalamSteps.partDuration} mins</div>
                </div>

                <div className="pt-3">
                  <span className="font-bold font-sans text-neutral-800 block text-[12px] mb-2 text-center">
                    {currentLanguage === "ml" ? "ഇന്നത്തെ ദിവസം:" : currentLanguage === "te" ? "ఈ రోజు వారం:" : "Today is:"} 
                    <span className="text-amber-800 ml-1 underline">{rahuKalamSteps.todayName}</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Rahu Box */}
                    <div className="bg-red-50 border border-red-200 px-3 py-2 rounded-xl text-center shadow-3xs">
                      <span className="text-[8px] block uppercase font-mono font-black text-red-950 tracking-wider">
                        {currentLanguage === "ml" ? "രാഹുകാലം" : currentLanguage === "te" ? "రాహుకాలం" : "Rahu Kalam"}
                      </span>
                      <span className="text-[12px] font-mono font-black text-red-900 block mt-0.5">
                        {rahuKalamSteps.todayRahuStart} - {rahuKalamSteps.todayRahuEnd}
                      </span>
                      <span className="text-[8.5px] text-red-700/80 block font-sans mt-0.5">
                        {currentLanguage === "ml" ? `ഭാഗം: ${rahuKalamSteps.partNum}/8` : currentLanguage === "te" ? `భాగం: ${rahuKalamSteps.partNum}/8` : `Segment: ${rahuKalamSteps.partNum}/8`}
                      </span>
                    </div>

                    {/* Gulika Box */}
                    <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-center shadow-3xs">
                      <span className="text-[8px] block uppercase font-mono font-black text-amber-950 tracking-wider">
                        {currentLanguage === "ml" ? "ഗുളികകാലം" : currentLanguage === "te" ? "గుళికా కాలం" : "Gulika Kalam"}
                      </span>
                      <span className="text-[12px] font-mono font-black text-amber-900 block mt-0.5">
                        {rahuKalamSteps.todayGulikaStart} - {rahuKalamSteps.todayGulikaEnd}
                      </span>
                      <span className="text-[8.5px] text-amber-700/80 block font-sans mt-0.5">
                        {currentLanguage === "ml" ? `ഭാഗം: ${rahuKalamSteps.gulikaPartNum}/8` : currentLanguage === "te" ? `భాగం: ${rahuKalamSteps.gulikaPartNum}/8` : `Segment: ${rahuKalamSteps.gulikaPartNum}/8`}
                      </span>
                    </div>

                    {/* Yama Box */}
                    <div className="bg-teal-50 border border-teal-200 px-3 py-2 rounded-xl text-center shadow-3xs">
                      <span className="text-[8px] block uppercase font-mono font-black text-teal-950 tracking-wider">
                        {currentLanguage === "ml" ? "യമകണ്ടകം" : currentLanguage === "te" ? "యమగండం" : "Yamagandam"}
                      </span>
                      <span className="text-[12px] font-mono font-black text-teal-900 block mt-0.5">
                        {rahuKalamSteps.todayYamaStart} - {rahuKalamSteps.todayYamaEnd}
                      </span>
                      <span className="text-[8.5px] text-teal-700/80 block font-sans mt-0.5">
                        {currentLanguage === "ml" ? `ഭാഗം: ${rahuKalamSteps.yamaPartNum}/8` : currentLanguage === "te" ? `భాగం: ${rahuKalamSteps.yamaPartNum}/8` : `Segment: ${rahuKalamSteps.yamaPartNum}/8`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="flex flex-col gap-5 animate-fade-in" id="sastra_tab_location">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-[#D4C3A3] flex items-start gap-4">
                <div className="flex items-center justify-center p-2 rounded-xl bg-orange-100 text-orange-800 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-[12px] sm:text-[13px]">
                  <span className="font-serif font-black text-[#5D4037] block text-[14px]">
                    {currentLanguage === "ml" ? "ലൊക്കേഷൻ കണ്ടെത്തൽ തത്വം" : currentLanguage === "te" ? "భూస్థాన గుర్తింపు సిద్ధాంతం" : "Precision Location Logic"}
                  </span>
                  <span className="text-neutral-600 block mt-1 leading-relaxed">
                    {currentLanguage === "ml" ? (
                      "ഒരു ഉപയോക്താവ് പേജ് തുറക്കുമ്പോൾ ആദ്യം ബ്രൗസറിന്റെ വിശ്വസനീയമായ ജിയോലൊക്കേഷൻ സിസ്റ്റം (Browser Geolocation API) ആണ് ആവശ്യപ്പെടുക. അതിന് അനുവാദം നൽകിയില്ലെങ്കിൽ, ഐപി അടിസ്ഥാനമാക്കിയുള്ള ഓട്ടോമാറ്റിക് റിവേഴ്സ് ലൂക്കപ്പ് സംവിധാനത്തിലേക്ക് കണക്ട് ചെയ്ത് ഏറ്റവും അടുത്തുള്ള നഗരവും അക്ഷാംശ രേഖാംശങ്ങളും നിർണ്ണയിക്കും."
                    ) : currentLanguage === "te" ? (
                      "వినియోగదారుల సమాచారం గోప్యంగా ఉంచుతూ మొదట ఉచిత బ్రౌజర్ లొకేషన్ పర్మిషన్ అడుగుతుంది. ఒకవేళ యూజర్ తిరస్కరిస్తే, ఇంటర్నెట్ IP ఆధారింతంగా ప్రాతిపదిక అక్షాంశాలను సేకరించి ఆ నగరానికి సంబంధించిన సూర్యోదయ సమయాలను సింక్ చేస్తుతాము."
                    ) : (
                      "To ensure immediate accuracy, the app executes a layered lookup strategy. It queries high-precision native browser Geolocation first. If declined, the system transparently utilizes a static IP geolocation database API flow to select coordinates automatically."
                    )}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-serif text-[13px] font-bold text-amber-950 mb-2 border-b border-[#D4C3A3]/40 pb-1 flex items-center gap-1.5">
                  <span className="text-orange-600">●</span>
                  {currentLanguage === "ml" ? "സ്ഥാനവിവരങ്ങൾ സ്വയം എങ്ങനെ മാറ്റാം?" : currentLanguage === "te" ? "మీకు నచ్చిన చోటికి లొకేషన్ ఎలా మార్చాలి?" : "How do I change the active location manually?"}
                </h4>
                <div className="p-4 bg-white border border-[#D4C3A3]/60 rounded-xl flex flex-col gap-2.5 text-[12px] sm:text-[13px] text-neutral-700">
                  <p>
                    {currentLanguage === "ml" ? (
                      "മുകളിൽ നൽകിയിരിക്കുന്ന 'പ്രാദേശിക സൂര്യ ചലനം' എന്ന ബാക്സിന്റെ ഉള്ളിലുള്ള 'എഡിറ്റ് ലൊക്കേഷൻ (കൂട്ടിച്ചേർക്കുക)' എന്ന ബട്ടണിൽ ക്ലിക്ക് ചെയ്താൽ നിങ്ങൾക്ക് ഇഷ്ടമുള്ള നഗരത്തിന്റെ പേര്, അക്ഷാംശ രേഖാംശങ്ങൾ (latitude, longitude) എന്നിവ ഇവിടെ സ്വയം എന്റർ ചെയ്യാവുന്നതാണ്. അതിനനുസരിച്ച് മുഴുവൻ പേജിലെ സ്ഥാനവിവരങ്ങളും മന്ത്രങ്ങളിലെ പ്ലേ പാറ്റേണുകളും ഉടനടി അപ്ഡേറ്റ് ചെയ്യപ്പെടും."
                    ) : currentLanguage === "te" ? (
                      "పైన టెంపుల్ సన్ స్పెసిఫికేషన్స్ బాక్స్ లో గల 'సవరించు/Edit' ఆప్షన్ క్లిక్ చేసి, మీకు కావాల్సిన నగరము పేరు మరియు అక్షాంశ రేఖాంశ రేట్లు స్వయంగా నమోదు చేయవచ్చు. మీరు మార్చిన మరుక్షణమే రాహుకాలం మరియు 30 ముహూర్తాల సమాచారం మారతాయి."
                    ) : (
                      "Within the top golden 'Astrological-Chronometer Altar', select the edit option. You can manually type customized coordinates (Latitude, Longitude), customize the place name, and provide local offset timings. The entire app's timing algorithm shifts immediately on validation."
                    )}
                  </p>
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 mt-1 flex flex-col gap-1 font-mono text-[10px] sm:text-[11px]">
                    <div className="font-sans font-bold text-[#8D6E63] text-[11px] uppercase mb-1">
                      {currentLanguage === "ml" ? "നിലവിലുള്ള ഡിഫോൾട്ട് കേന്ദ്രം:" : currentLanguage === "te" ? "ప్రస్తుత డిఫాల్ట్ ఆలయ కేంద్రం:" : "Active Base Default Fallback:"}
                    </div>
                    <div>🎯 Sri Venkateswara Swamy Temple, Tirumala (tirupati), AP</div>
                    <div>🌐 Coordinates: 13.68° N, 79.35° E</div>
                    <div>⏰ Standard Indian Time Zone Offset: UT +5.5 hours</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'muhurtas' && (
            <div className="flex flex-col gap-5 animate-fade-in" id="sastra_tab_muhurtas">
              <div className="p-4 rounded-2xl bg-[#FCF8F2] border border-[#D4C3A3] flex items-start gap-4 shadow-3xs">
                <div className="flex items-center justify-center p-2 rounded-xl bg-amber-100 text-[#C29200] shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-[12px] sm:text-[13px]">
                  <span className="font-serif font-black text-[#5D4037] block text-[15px]">
                    {currentLanguage === "ml" ? "30 സജീവ വൈദിക മുഹൂർത്തങ്ങളും പ്ലേലിസ്റ്റുകളും" : currentLanguage === "te" ? "30 వైదిక ముహూర్తములు మరియు ప్లేలిస్టులు" : "The 30 Vedic Muhurtas & Playlists Report"}
                  </span>
                  <span className="text-neutral-600 block mt-1 leading-relaxed text-xs">
                    {currentLanguage === "ml" ? (
                      "ഇവിടെ 30 ദിവസേനയുള്ള വൈദിക മുഹൂർത്തങ്ങളുടെ വിവരങ്ങളും അവയ്ക്ക് അനുയോജ്യമായ ഭക്തിഗാന പ്ലേലിസ്റ്റുകളും നൽകിയിരിക്കുന്നു. ഓരോ മുഹൂർത്തത്തിലെയും പ്രധാന ദേവതയെ അടിസ്ഥാനമാക്കിയാണ് ഓഡിയോ ഫയലുകൾ തിരഞ്ഞെടുത്തിരിക്കുന്നത്."
                    ) : currentLanguage === "te" ? (
                      "ఇక్కడ 30 దినసరి వైదిక ముహూర్తముల యొక్క వివరములు మరియు వాటికి తగిన భక్తి కీర్తనల ప్లేలిస్టులు పొందుపరచబడినవి. ప్రతి ముహూర్తమునకు అధిపతియైన దైవము ఆధారముగా ఈ గీతములు ఎంపిక చేయబడినవి."
                    ) : (
                      "Here is the complete scientific report of the 30 daily Vedic Muhurtas (15 Day Muhurtas & 15 Night Muhurtas) with their respective ruling deities, spiritual quality (Shubha/Ashubha), and custom-tailored archival devotional playlists containing appropriate, dedicated audio files."
                    )}
                  </span>
                </div>
              </div>

              {/* Grid of 30 Muhurtas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="muhurtas_report_grid">
                {MUHURTAS_LIST.map((muhurta) => {
                  const playlist = getPlaylistForMuhurta(muhurta.index);
                  const isAuspicious = muhurta.quality.toLowerCase().includes("auspicious") || muhurta.quality.toLowerCase() === "shubha";
                  const qualityColor = isAuspicious 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                    : "bg-rose-50 text-rose-800 border-rose-200";

                  const name = currentLanguage === "ml" 
                    ? muhurta.nameMalayalam 
                    : currentLanguage === "te" 
                      ? muhurta.nameTelugu 
                      : muhurta.nameEnglish;

                  const deity = currentLanguage === "ml" 
                    ? muhurta.deityMalayalam 
                    : currentLanguage === "te" 
                      ? muhurta.deityTelugu 
                      : muhurta.deityEnglish;

                  return (
                    <div 
                      key={muhurta.index} 
                      className="p-4 rounded-xl border border-[#D4C3A3]/40 bg-white shadow-3xs flex flex-col gap-3 hover:border-amber-400 transition-all duration-200"
                    >
                      {/* Header Info */}
                      <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2">
                        <div>
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">
                            {muhurta.isNight ? "🌙 Night" : "☀️ Day"} Muhurta #{muhurta.index}
                          </span>
                          <h4 className="font-serif font-black text-[#5D4037] text-sm leading-tight">
                            {name} <span className="text-xs text-neutral-400">({muhurta.nameSanskrit})</span>
                          </h4>
                          <span className="text-[10.5px] text-stone-600 block mt-0.5">
                            <strong className="text-stone-800">{currentLanguage === "ml" ? "ദേവത:" : currentLanguage === "te" ? "అధిపతి దైవం:" : "Deity:"}</strong> {deity}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wide uppercase shrink-0 ${qualityColor}`}>
                          {muhurta.quality}
                        </span>
                      </div>

                      {/* Associated Playlist of appropriate files */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#8D6E63]">
                          📋 {currentLanguage === "ml" ? "പ്ലേലിസ്റ്റ് ഗാനങ്ങൾ" : currentLanguage === "te" ? "ప్లేలిస్ట్ గీతములు" : "Assigned Playlist"} ({playlist.length} {currentLanguage === "ml" ? "ഗാനങ്ങൾ" : currentLanguage === "te" ? "కీర్తనలు" : "tracks"})
                        </span>
                        {playlist.length === 0 ? (
                          <span className="text-xs text-stone-400 italic font-sans pl-1">
                            No tracks loaded for this specific archetype.
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {playlist.map((track) => {
                              const trackName = currentLanguage === "ml" 
                                ? track.nameMl 
                                : currentLanguage === "te" 
                                  ? track.nameTe 
                                  : track.nameEn;
                              return (
                                <div 
                                  key={track.id} 
                                  className="flex items-center justify-between gap-2 p-1.5 rounded bg-[#FAF7F1] hover:bg-amber-50 border border-[#D4C3A3]/20 text-[11px] font-medium text-stone-700 transition"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                    <span className="truncate" title={trackName}>{trackName}</span>
                                  </div>
                                  <span className="text-[8.5px] uppercase tracking-wider text-[#8D6E63] shrink-0 font-bold bg-[#F1E5D5]/50 px-1 py-0.5 rounded">
                                    {track.category}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="flex flex-col gap-5 animate-fade-in" id="sastra_tab_audio">
              <div className="p-4 rounded-2xl bg-[#FCF8F2] border border-[#D4C3A3] flex items-start gap-4">
                <div className="flex items-center justify-center p-2 rounded-xl bg-amber-100 text-[#C29200] shrink-0">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-[12px] sm:text-[13px]">
                  <span className="font-serif font-black text-[#5D4037] block text-[14px]">
                    {currentLanguage === "ml" ? "ഇൻ്റർനെറ്റ് ആർക്കൈവ് സ്ട്രീമിംഗ്" : currentLanguage === "te" ? "archive.org కీర్తనల స్ట్రీమింగ్" : "Internet Archive Raw Mirror Streaming"}
                  </span>
                  <span className="text-neutral-600 block mt-1 leading-relaxed">
                    {currentLanguage === "ml" ? (
                      "ഈ ആപ്ലിക്കേഷന്റെ എല്ലാ സ്തോത്രങ്ങളും ശബ്ദ മന്ത്രങ്ങളും വിശ്വസനീയമായ ഇൻ്റർനെറ്റ് ആർക്കൈവ് (archive.org) ഫയലുകളിൽ നിന്നാണ് സജ്ജമാക്കിയിരിക്കുന്നത്. ഇത് റോയൽറ്റി ഫ്രീ ഫ്രീക്വൻസികളിൽ ഉള്ളതാണ്. സാധാരണ വെബ് പേജുകളിലെ റീഡയറക്റ്റുകൾ മറികടന്ന് നേരിട്ട് തരംഗങ്ങൾ സ്വീകരിക്കാൻ സബ് ഡൊമെയ്ൻ സ്ട്രീം കണ്ണികൾ ഉപയോഗിച്ചിരിക്കുന്നു."
                    ) : currentLanguage === "te" ? (
                      "మా ప్లాట్‌ఫారమ్ లో గల అన్ని మంత్రాలు మరియు స్తోత్రాలు అంతర్జాతీయ ఇంటర్నెట్ ఆర్కైవ్ (archive.org) యొక్క లైబ్రరీ నుండి సేకరించాము. ఇవన్నీ ఉచిత వినియోగ రకం కిందకు వస్తాయి. ఎటువంటి అంతరాయాలు కలుగకుండా raw `.mp3` ప్లాట్ ద్వారా వీటిని సంధించాము."
                    ) : (
                      "To provide high-quality, continuous playback, the application sources all devotional content and stotras directly from open-source, royalty-free MP3 directories on archive.org. Raw paths are targeted to guarantee high-performance buffered feeds without routing hiccups."
                    )}
                  </span>
                </div>
              </div>

              {/* Audio Count & Statistics Card */}
              <div className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-[#D4C3A3]/60 rounded-2xl" id="sastra_audio_stats_card">
                <h4 className="font-serif text-[13px] font-bold text-amber-950 mb-3 border-b border-[#D4C3A3]/40 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-700">●</span>
                    {currentLanguage === "ml" ? "വൈദിക ഭണ്ഡാര വിവരങ്ങൾ" : currentLanguage === "te" ? "భక్తి భాండాగార సమాచారం" : "Archival Devotional Treasury Statistics"}
                  </div>
                  <span className="font-mono text-[11px] sm:text-xs text-amber-900 font-extrabold bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200/50">
                    {audioStats.total} {currentLanguage === "ml" ? "ഫയലുകൾ" : currentLanguage === "te" ? "ఆడియోలు" : "Total Audio Files"}
                  </span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-white border border-[#D4C3A3]/40 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {currentLanguage === "ml" ? "സഹസ്രനാമങ്ങൾ" : currentLanguage === "te" ? "సహస్రనామాలు" : "Sahasranamams"}
                    </span>
                    <span className="text-[18px] font-serif font-black text-amber-950 mt-1">{audioStats.sahasranamams}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#D4C3A3]/40 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {currentLanguage === "ml" ? "വൈദിക മന്ത്രങ്ങൾ" : currentLanguage === "te" ? "మంత్రాలు" : "Vedic Mantras"}
                    </span>
                    <span className="text-[18px] font-serif font-black text-amber-950 mt-1">{audioStats.mantras}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#D4C3A3]/40 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {currentLanguage === "ml" ? "സ്തോത്രങ്ങൾ" : currentLanguage === "te" ? "స్తోత్రాలు" : "Sacred Stotrams"}
                    </span>
                    <span className="text-[18px] font-serif font-black text-amber-950 mt-1">{audioStats.stotrams}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#D4C3A3]/40 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {currentLanguage === "ml" ? "അഷ്ടകങ്ങൾ" : currentLanguage === "te" ? "అష్టకాలు" : "Ashtakams"}
                    </span>
                    <span className="text-[18px] font-serif font-black text-amber-950 mt-1">{audioStats.ashtakams}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#D4C3A3]/40 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {currentLanguage === "ml" ? "തിരുപ്പതി/സുപ്രഭാതം" : currentLanguage === "te" ? "తిరుపతి/సుప్రభాతం" : "Tirupati / Suprabhatam"}
                    </span>
                    <span className="text-[18px] font-serif font-black text-amber-950 mt-1">{audioStats.suprabhatams}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#D4C3A3]/40 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {currentLanguage === "ml" ? "ഭക്തിഗാനങ്ങൾ" : currentLanguage === "te" ? "భక్తి గీతాలు" : "Devotional Songs"}
                    </span>
                    <span className="text-[18px] font-serif font-black text-amber-950 mt-1">{audioStats.songs}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#D4C3A3]/40 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {currentLanguage === "ml" ? "ഷിർദ്ദി ഭക്തിഗാനങ്ങൾ" : currentLanguage === "te" ? "షిరిడి భక్తి గీతాలు" : "Shirdi Devotion"}
                    </span>
                    <span className="text-[18px] font-serif font-black text-amber-950 mt-1">{audioStats.shirdi}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#D4C3A3]/40 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {currentLanguage === "ml" ? "അയ്യപ്പൻ ഭക്തിഗാനങ്ങൾ" : currentLanguage === "te" ? "అయ్యప్ప భక్తి గీతాలు" : "Ayyappa Devotion"}
                    </span>
                    <span className="text-[18px] font-serif font-black text-amber-950 mt-1">{audioStats.ayyappa}</span>
                  </div>
                  {audioStats.others > 0 && (
                    <div className="p-2.5 bg-white border border-[#D4C3A3]/40 rounded-xl col-span-2 sm:col-span-4 flex flex-col justify-between">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                        {currentLanguage === "ml" ? "മറ്റു ഭക്തിഗാനങ്ങൾ" : currentLanguage === "te" ? "ఇతర భక్తి గీతాలు" : "Devotional Songs & Others"}
                      </span>
                      <span className="text-[18px] font-serif font-black text-amber-950 mt-1">{audioStats.others}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-serif text-[13px] font-bold text-amber-950 mb-2 border-b border-[#D4C3A3]/40 pb-1 flex items-center gap-1.5">
                  <span className="text-amber-700">●</span>
                  {currentLanguage === "ml" ? "സുരക്ഷിത ഓഡിയോ സിസ്റ്റം" : currentLanguage === "te" ? "ఆడియో విశ్వసనీయత" : "Audio Path Verification & Backup Option"}
                </h4>
                <div className="p-4 bg-white border border-[#D4C3A3]/60 rounded-xl space-y-2.5 text-[12px] sm:text-[13px] text-neutral-700">
                  <p>
                    {currentLanguage === "ml" ? (
                      "എഡിറ്റ് മോഡിൽ സ്വന്തമായി സ്റ്റീമിങ് കണ്ണികൾ നൽകാനും അഡ്മിൻ ആക്സസ് വഴി മറ്റുള്ളവ മാറ്റാനും ക്രമീകരണം വരുത്തിയിട്ടുണ്ട്. എല്ലാ ഫയലുകളും ക്ലയന്റുകളുടെ ലോക്കൽ ബ്രൗസറിൽ ഇൻസ്റ്റന്റായി ഡൗൺലോഡ് ചെയ്യപ്പെടാതെ നേരിട്ടുള്ള തരംഗ വിന്യാസത്തിലൂടെ പ്ലേ ചെയ്യുകയാണ് ചെയ്യുന്നത്."
                    ) : currentLanguage === "te" ? (
                      "యాప్ అడ్మిన్ మోడ్ ద్వారా మీ సొంత సబ్ లింక్స్ ను జత చేసే అవకాశాన్ని కల్పించాము. ఇంటర్నెట్ కనెక్షన్ స్పీడ్ ఆధారంగా ఇవి నేరుగా బ్రౌజర్ లో రన్ అవుతాయి."
                    ) : (
                      "All audio payloads are requested client-side using native HTMLMediaElement APIs. Administrators can fully override stable defaults to supply alternate URLs inside the Admin Settings dashboard, which persists configurations directly to responsive storage."
                    )}
                  </p>
                  <p className="text-[11px] text-[#8D6E63] italic flex items-center gap-1">
                    <span>💡</span> 
                    {currentLanguage === "ml" 
                      ? "ഓഡിയോ പ്ലേ തടസ്സപ്പെട്ടാൽ നെറ്റ്വർക്ക് സ്പീഡ് അല്ലെങ്കിൽ ആർക്കൈവ് സർവർ ലൊക്കേഷൻ പരിശോധിക്കുക." 
                      : currentLanguage === "te" 
                        ? "స్తోత్రం ప్లే కాకపోతే, మీ ఇంటర్నెట్ మరియు archive.org కనెక్టివిటీ సరిచూసుకోండి." 
                        : "If buffer delays persist, check your network speeds or direct server connection to archive.org streams."}
                  </p>
                </div>
              </div>

              {/* Link to Archive.org */}
              <div className="flex justify-end pt-2" id="redirect_archive_org_banner">
                <a 
                  href="https://archive.org" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs text-amber-850 hover:text-amber-950 hover:underline font-bold transition cursor-pointer"
                >
                  <span>Browse Internet Archive</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="flex flex-col gap-5 animate-fade-in" id="sastra_tab_support">
              <div className="p-4 rounded-2xl bg-[#FCF8F2] border border-[#D4C3A3] flex items-start gap-4">
                <div className="flex items-center justify-center p-2 rounded-xl bg-amber-100 text-[#C29200] shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-[12px] sm:text-[13px] flex-1">
                  <span className="font-serif font-black text-[#5D4037] block text-[14px]">
                    {currentLanguage === "ml" ? "സഹായവും സപ്പോർട്ടും" : currentLanguage === "te" ? "సహాయం మరియు సపోర్ట్" : "Support & Feedback"}
                  </span>
                  <span className="text-neutral-600 block mt-1 leading-relaxed">
                    {currentLanguage === "ml" ? (
                      "ഈ ആപ്ലിക്കേഷനെക്കുറിച്ചുള്ള നിങ്ങളുടെ വിലയേറിയ അഭിപ്രായങ്ങളും, പുതിയ ഭക്തിഗാനങ്ങളും സ്തോത്രങ്ങളും ഇതിലേക്ക് ചേർക്കുന്നതിനുള്ള നിർദ്ദേശങ്ങളും ഞങ്ങൾ എപ്പോഴും സ്വാഗതം ചെയ്യുന്നു."
                    ) : currentLanguage === "te" ? (
                      "ఈ అప్లికేషన్ పై మీ విలువైన అభిప్రాయాలను మరియు కొత్త భక్తి గీతాలు లేదా స్తోత్రాలను యాప్ లో చేర్చడానికి గల సూచనలను మేము ఎల్లప్పుడూ సంతోషంగా స్వీకరిస్తాము."
                    ) : (
                      "We always welcome your valuable feedback, suggestions, and submissions for new devotional audio tracks to be included in our sacred treasury."
                    )}
                  </span>
                </div>
              </div>

              {/* Developer Contact Card */}
              <div className="p-4 bg-white border border-[#D4C3A3]/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id="developer_contact_card">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-50 border border-amber-200 text-[#8D6E63]">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-[#8D6E63] block">
                      {currentLanguage === "ml" ? "അഡ്മിനിസ്ട്രേറ്റർ & ക്യൂറേറ്റർ" : currentLanguage === "te" ? "నిర్వాహకుడు & క్యూరేటర్" : "Project Administrator & Curator"}
                    </span>
                    <span className="font-serif font-black text-[15px] text-[#3E2723]">
                      Admin Drigganita Music
                    </span>
                  </div>
                </div>

                <a 
                  href="mailto:astromusic@mobitrendz.com" 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5D4037] text-white font-sans font-semibold text-[12px] transition hover:bg-amber-850 cursor-pointer shadow-3xs hover:shadow-xs self-stretch sm:self-auto text-center justify-center"
                >
                  <Mail className="h-4 w-4" />
                  <span>astromusic@mobitrendz.com</span>
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>
              </div>

              {/* Guidelines for Audio Contributions */}
              <div className="border border-amber-600/20 bg-amber-50/20 rounded-2xl p-4 flex flex-col gap-2.5">
                <h4 className="font-serif text-[13px] font-bold text-amber-950 flex items-center gap-1.5">
                  <span className="text-amber-700">●</span>
                  {currentLanguage === "ml" ? "ഓഡിയോകൾ സമർപ്പിക്കുമ്പോൾ:" : currentLanguage === "te" ? "ఆరియాలు సమర్పించేటప్పుడు గమనించవలసినవి:" : "Guidelines for Audio Suggestions"}
                </h4>
                <ul className="list-disc pl-5 text-[12px] space-y-1 text-neutral-700 font-sans">
                  {currentLanguage === "ml" ? (
                    <>
                      <li>ആർക്കൈവ് ചെയ്യപ്പെട്ട ഭക്തിഗാനങ്ങളുടെയോ മന്ത്രങ്ങളുടെയോ <strong>archive.org</strong> ലിങ്കുകൾ നേരിട്ട് നൽകുക.</li>
                      <li>ട്രാക്കിന്റെ പേര്, ദൈവ സങ്കൽപ്പം, സാധ്യമെങ്കിൽ അതിന്റെ വരികൾ (ലിറിക്സ്) എന്നിവ ഉൾപ്പെടുത്തുക.</li>
                      <li>നിങ്ങളുടെ നിർദ്ദേശങ്ങൾ പരിശോധിച്ച ശേഷം അവ അടുത്ത അപ്‌ഡേറ്റിൽ ആപ്പിൽ ഉൾപ്പെടുത്തുന്നതായിരിക്കും.</li>
                    </>
                  ) : currentLanguage === "te" ? (
                    <>
                      <li>ఉచితంగా లభించే భక్తి గీతాల లేదా మంత్రాల <strong>archive.org</strong> లింకులను నేరుగా పంపగలరు.</li>
                      <li>ట్రాక్ యొక్క సరైన పేరు, దేవతా రూపం మరియు వీలైతే వాటి సాహిత్యాన్ని కూడా జతచేయండి.</li>
                      <li>మీరు పంపిన లింకులను పరిశీలించి త్వరలోనే యాప్ లో పొందుపరుస్తాము.</li>
                    </>
                  ) : (
                    <>
                      <li>If you have the <strong>archive.org</strong> link for the audio MP3 mirrors for the chants or hymns, please provide them.</li>
                      <li>Include metadata: title of the track, deity, and lyrics in English/Regional scripts if available.</li>
                      <li>Submissions will be reviewed and integrated directly into the application's core catalog.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#D4C3A3]/40 bg-[#F9F5EE] flex justify-between items-center" id="sastra_modal_footer_row">
          <span className="text-[10px] font-mono font-extrabold text-[#8D6E63]">
            {currentLanguage === "ml" ? "പതിപ്പ്: 2.1.0 • ഭാരതീയ ഗണിതം" : currentLanguage === "te" ? "వెర్షన్: 2.1.0 • భారతీయ గణితం" : "Ver: 2.1.0 • Indian Astrodynamics"}
          </span>
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#5D4037] text-white font-serif font-black text-[12px] hover:bg-amber-850 cursor-pointer shadow-md transition duration-200"
            id="acknowledge_sastra_modal_btn"
          >
            {currentLanguage === "ml" ? "മനസ്സിലായി" : currentLanguage === "te" ? "సరే, తెలిసింది" : "Acknowledge"}
          </button>
        </div>
      </div>
    </div>
  );
}
