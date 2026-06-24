import React, { useState, useEffect } from "react";
import HeroHeader from "./components/HeroHeader";
import JathakamPanel from "./components/JathakamPanel";
import DevotionalPlayer from "./components/DevotionalPlayer";
import SastraReportModal from "./components/SastraReportModal";
import IntroductionModal from "./components/IntroductionModal";
import { Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { TRANSLATIONS } from "./translations";
import { PHILOSOPHICAL_QUOTES } from "./data/quotes";

export default function App() {
  const [language, setLanguage] = useState<'en' | 'ml' | 'te'>(() => {
    try {
      const stored = localStorage.getItem("drik_siddhanta_language");
      if (stored === 'en' || stored === 'ml' || stored === 'te') {
        return stored;
      }
    } catch (e) {}
    return 'en';
  });

  const handleLanguageChange = (lang: 'en' | 'ml' | 'te', isManual: boolean = true) => {
    setLanguage(lang);
    try {
      localStorage.setItem("drik_siddhanta_language", lang);
      if (isManual) {
        localStorage.setItem("drik_siddhanta_language_manually_set", "true");
      }
    } catch (e) {}
  };

  const [isSastraOpen, setIsSastraOpen] = useState<boolean>(false);
  const [isIntroOpen, setIsIntroOpen] = useState<boolean>(() => {
    try {
      const hideIntro = localStorage.getItem("drik_siddhanta_hide_intro");
      return hideIntro !== "true";
    } catch (e) {
      return true;
    }
  });

  // Lifted locationDetails state for global synchronization between header and panels
  const [locationDetails, setLocationDetails] = useState({
    lat: 13.6833,
    lng: 79.3474,
    placeName: "Sri Venkateswara Swamy Temple, Tirumala, Tirupati Urban, Andhra Pradesh 517504, India",
    sunrise: "05:55 AM",
    sunset: "06:35 PM",
    isGeolocated: false,
    loading: true
  });

  // Lifted audio playing states to bind to top banner controls (defaults to false to respect browser interaction rules)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTrackName, setActiveTrackName] = useState<string>("Shiva Devotional Chants");
  const [activeTrackUrl, setActiveTrackUrl] = useState<string>("https://archive.org/download/ShivaPanchaksharaStotram/Shiva%20Panchakshara%20Stotram.mp3");

  // Traditional Philosophy Quote Rotation State (108 Quotes)
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  useEffect(() => {
    // Select a random quote on mounting
    const initialIndex = Math.floor(Math.random() * PHILOSOPHICAL_QUOTES.length);
    setQuoteIndex(initialIndex);

    // Rotate quote every 3 minutes (180000 ms)
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % PHILOSOPHICAL_QUOTES.length);
    }, 180000);

    return () => clearInterval(interval);
  }, []);

  const t = TRANSLATIONS[language];
  const currentQuote = PHILOSOPHICAL_QUOTES[quoteIndex] || PHILOSOPHICAL_QUOTES[0];
  const activeQuoteText = language === 'ml' ? currentQuote.ml : language === 'te' ? currentQuote.te : currentQuote.en;
  const activeQuoteTheme = language === 'ml' ? currentQuote.themeMl : language === 'te' ? currentQuote.themeTe : currentQuote.themeEn;

  return (
    <div className="min-h-screen bg-[#F5EFEB] flex flex-col font-sans relative" id="app_root">
      {/* Global Full-Screen Divine Floating Music Notes */}
      {isPlaying && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-40" id="global_divine_floating_notes">
          <style>{`
            @keyframes screenFloatNote1 {
              0% { transform: translateY(105vh) translateX(0) scale(0.6) rotate(0deg); opacity: 0; }
              10% { opacity: 0.55; }
              90% { opacity: 0.55; }
              100% { transform: translateY(-10vh) translateX(40px) scale(1.2) rotate(45deg); opacity: 0; }
            }
            @keyframes screenFloatNote2 {
              0% { transform: translateY(105vh) translateX(0) scale(0.5) rotate(0deg); opacity: 0; }
              15% { opacity: 0.65; }
              85% { opacity: 0.65; }
              100% { transform: translateY(-10vh) translateX(-50px) scale(1.1) rotate(-60deg); opacity: 0; }
            }
            @keyframes screenFloatNote3 {
              0% { transform: translateY(105vh) translateX(0) scale(0.7) rotate(0deg); opacity: 0; }
              8% { opacity: 0.5; }
              92% { opacity: 0.5; }
              100% { transform: translateY(-10vh) translateX(25px) scale(1.3) rotate(30deg); opacity: 0; }
            }
            .scr-note-1 { animation: screenFloatNote1 14s infinite linear; }
            .scr-note-2 { animation: screenFloatNote2 18s infinite linear; }
            .scr-note-3 { animation: screenFloatNote3 22s infinite linear; }
            .scr-note-4 { animation: screenFloatNote1 16s infinite linear; }
            .scr-note-5 { animation: screenFloatNote2 20s infinite linear; }
            .scr-note-6 { animation: screenFloatNote3 24s infinite linear; }
            .scr-note-7 { animation: screenFloatNote1 15s infinite linear; }
            .scr-note-8 { animation: screenFloatNote2 19s infinite linear; }
          `}</style>
          
          <div className="scr-note-1 absolute bottom-0 left-[5%] text-[#B07D1C]/25 text-2xl font-serif">♪</div>
          <div className="scr-note-2 absolute bottom-0 left-[14%] text-[#C29200]/20 text-3xl font-serif" style={{ animationDelay: "2.5s" }}>♫</div>
          <div className="scr-note-3 absolute bottom-0 left-[23%] text-[#8D6E63]/25 text-2xl font-serif" style={{ animationDelay: "6s" }}>♬</div>
          <div className="scr-note-4 absolute bottom-0 left-[32%] text-[#B07D1C]/20 text-3xl font-serif" style={{ animationDelay: "1s" }}>♩</div>
          <div className="scr-note-5 absolute bottom-0 left-[41%] text-[#C29200]/25 text-2xl font-serif" style={{ animationDelay: "8.5s" }}>♭</div>
          <div className="scr-note-6 absolute bottom-0 left-[50%] text-[#8D6E63]/20 text-3xl font-serif" style={{ animationDelay: "4s" }}>♯</div>
          <div className="scr-note-7 absolute bottom-0 left-[59%] text-[#B07D1C]/25 text-2xl font-serif" style={{ animationDelay: "11s" }}>♮</div>
          <div className="scr-note-8 absolute bottom-0 left-[68%] text-[#C29200]/20 text-4xl font-serif" style={{ animationDelay: "5.5s" }}>♬</div>
          <div className="scr-note-1 absolute bottom-0 left-[75%] text-[#8D6E63]/25 text-2xl font-serif" style={{ animationDelay: "9.5s" }}>♩</div>
          <div className="scr-note-3 absolute bottom-0 left-[84%] text-[#B07D1C]/20 text-3xl font-serif" style={{ animationDelay: "13s" }}>♫</div>
          <div className="scr-note-5 absolute bottom-0 left-[93%] text-[#C29200]/25 text-2xl font-serif" style={{ animationDelay: "7s" }}>♪</div>
          
          <div className="scr-note-2 absolute bottom-0 left-[10%] text-[#B07D1C]/15 text-2xl font-serif" style={{ animationDelay: "11s" }}>♩</div>
          <div className="scr-note-4 absolute bottom-0 left-[28%] text-[#C29200]/20 text-3xl font-serif" style={{ animationDelay: "15s" }}>♭</div>
          <div className="scr-note-6 absolute bottom-0 left-[46%] text-[#8D6E63]/15 text-2xl font-serif" style={{ animationDelay: "3s" }}>♯</div>
          <div className="scr-note-8 absolute bottom-0 left-[64%] text-[#C29200]/20 text-3xl font-serif" style={{ animationDelay: "17s" }}>♮</div>
          <div className="scr-note-2 absolute bottom-0 left-[80%] text-[#B07D1C]/15 text-2xl font-serif" style={{ animationDelay: "10s" }}>♫</div>
        </div>
      )}

      {/* Premium Hero Identity & Language Picker */}
      <HeroHeader 
        currentLanguage={language} 
        onLanguageChange={handleLanguageChange} 
        locationDetails={locationDetails}
        setLocationDetails={setLocationDetails}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        activeTrackName={activeTrackName}
        onOpenSastra={() => setIsSastraOpen(true)}
      />

      {/* Main Single-View Interactive Workspace */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 flex flex-col gap-6 pb-6">
        
        {/* Astrological / Astronomical Workstations (Jathakam Chart & Devotional Soundscapes) */}
        <section className="flex flex-col gap-6" id="astrology_workstation">
          
          {/* Workstation Header and Jathakam Grid Visualizer are hidden per user request */}

          {/* Devotional Soundscape Player for Day & Muhurtas */}
          <DevotionalPlayer 
            currentLanguage={language} 
            locationDetails={locationDetails} 
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            activeTrackName={activeTrackName}
            setActiveTrackName={setActiveTrackName}
            activeTrackUrl={activeTrackUrl}
            setActiveTrackUrl={setActiveTrackUrl}
          />

          {/* 30 Daily Muhurthas and its details shown below Temple Acoustics box */}
          <JathakamPanel 
            currentLanguage={language} 
            locationDetails={locationDetails} 
            onlyShowMuhurtas={true} 
          />

          {/* Slogans/Traditional Philosophy Footer note */}
          <div className="p-4 rounded-3xl border border-[#D4C3A3] bg-[#FCF3E3] text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[100px] transition-all duration-300">
            <span className="absolute bottom-1 right-2 font-serif text-[18px] text-[#8D6E63]/5 font-bold pointer-events-none">
              गणितेन सुबोधनम्
            </span>
            <p className="text-[12px] leading-relaxed text-[#6D4C41] font-medium max-w-2xl">
              {activeQuoteText}
            </p>
            <p className="text-[11px] text-[#C29200] font-bold mt-1.5 tracking-wider uppercase flex items-center justify-center gap-2 flex-wrap">
              <span>— {activeQuoteTheme}</span>
            </p>
            <div className="flex items-center gap-3 mt-2 px-4 z-10">
              <button
                type="button"
                onClick={() => setQuoteIndex((prev) => (prev - 1 + PHILOSOPHICAL_QUOTES.length) % PHILOSOPHICAL_QUOTES.length)}
                className="p-1.5 rounded-full hover:bg-[#F2E5CC] active:scale-95 text-[#8D6E63] transition duration-150 cursor-pointer border border-[#D4C3A3] flex items-center justify-center bg-[#FCFDF2]/80 hover:text-amber-900"
                title="Previous Quote"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FCFDF2] border border-amber-200 text-[#8D6E63]/80 text-[10px] font-sans normal-case shadow-2xs font-semibold">
                {language === "ml" ? "വചനം" : language === "te" ? "సూక్తి" : "Quote"} {currentQuote.id}/108
              </span>
              <button
                type="button"
                onClick={() => setQuoteIndex((prev) => (prev + 1) % PHILOSOPHICAL_QUOTES.length)}
                className="p-1.5 rounded-full hover:bg-[#F2E5CC] active:scale-95 text-[#8D6E63] transition duration-150 cursor-pointer border border-[#D4C3A3] flex items-center justify-center bg-[#FCFDF2]/80 hover:text-amber-900"
                title="Next Quote"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sastra & Technical Alignment Manual Button Box */}
          <div className="w-full text-center animate-fade-in" id="sastra_manual_wrapper">
            <button
              type="button"
              onClick={() => setIsSastraOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-[#FCF3E3] border border-amber-300 text-amber-950 font-sans font-black uppercase tracking-widest transition hover:bg-amber-100 hover:border-amber-400 active:scale-95 shadow-md hover:shadow-lg cursor-pointer duration-150"
              style={{ fontSize: "10px" }}
            >
              <span className="text-sm">📚</span>
              <span>
                {language === "ml" 
                  ? "ശാസ്ത്ര - സാങ്കേതിക വിവരണം കാണുക" 
                  : language === "te" 
                    ? "శాస్త్ర సాంకేతిక వివరణ పుస్తకం తెరువు" 
                    : "Sastra & Technical Alignment Manual / Report"}
              </span>
            </button>
          </div>

        </section>

      </main>

      {/* Footer copyright */}
      <footer className="w-full bg-[#2D241E] text-slate-400 py-2.5 text-center border-t border-[#D4C3A3] font-mono relative overflow-hidden" style={{ fontSize: '8pt', lineHeight: '1.2' }}>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:10px_10px] opacity-40"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 flex justify-center items-center">
          <span>Copyright © MobiTrendz 2026</span>
        </div>
      </footer>

      {/* Interactive Sastra & App Info Report Modal Overlay */}
      <SastraReportModal 
        isOpen={isSastraOpen}
        onClose={() => setIsSastraOpen(false)}
        currentLanguage={language}
        locationDetails={locationDetails}
        onOpenIntro={() => setIsIntroOpen(true)}
      />

      {/* Introduction Onboarding Slides Modal */}
      <IntroductionModal 
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  );
}
