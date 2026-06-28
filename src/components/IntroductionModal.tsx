import React, { useState } from "react";
import { 
  X, 
  Compass, 
  MapPin, 
  Activity, 
  Music, 
  Calendar, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Globe,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface IntroductionModalProps {
  currentLanguage: 'en' | 'ml' | 'te';
  onLanguageChange: (lang: 'en' | 'ml' | 'te') => void;
  isOpen: boolean;
  onClose: () => void;
}

interface SlideItem {
  id: number;
  icon: React.ReactNode;
  titleEn: string;
  titleMl: string;
  titleTe: string;
  descEn: string;
  descMl: string;
  descTe: string;
}

export default function IntroductionModal({ currentLanguage, onLanguageChange, isOpen, onClose }: IntroductionModalProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("drik_siddhanta_hide_intro", "true");
    }
    onClose();
  };

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const slides: SlideItem[] = [
    {
      id: 0,
      icon: <Sparkles className="w-8 h-8 text-amber-600" />,
      titleEn: "Welcome to 108 Drigganita Music",
      titleMl: "108 ദൃഗ്ഗണിത സംഗീതത്തിലേക്ക് സ്വാഗതം",
      titleTe: "108 దృగ్గణిత సంగీతానికి స్వాగతం",
      descEn: "Experience a sacred astronomical music system combining traditional Vedic calculations with real-time devotional chants.",
      descMl: "പരമ്പരാഗത വൈദിക ഗണനങ്ങളും തത്സമയ ഭക്തിഗാനങ്ങളും സമന്വയിപ്പിക്കുന്ന വിശിഷ്ടമായ ഒരു ജ്യോതിശാസ്ത്ര സംഗീത സമ്പ്രദായം അനുഭവിക്കുക.",
      descTe: "సాంప్రదాయ వైదిక గణనలను మరియు నిజసమయ భక్తి గీతాలను సమన్వయపరిచే విశిష్ట ఖగోళ సంగీత ప్రక్రియను అనుభవించండి."
    },
    {
      id: 1,
      icon: <Music className="w-8 h-8 text-amber-600" />,
      titleEn: "Present Muhurtha Audio Playback",
      titleMl: "തത്സമയ മുഹൂർത്ത ഓഡിയോ പ്ലേബാക്ക്",
      titleTe: "ప్రస్తుత ముహూర్త ఆడియో ప్లేబ్యాక్",
      descEn: "The application automatically plays the appropriate Sahasranama or divine chant corresponding to the active planetary hour of the day.",
      descMl: "പ്രാദേശിക സമയം അടിസ്ഥാനമാക്കി കൃത്യമായ മുഹൂർത്തത്തിൽ ആ മുഹൂർത്തത്തിന് അനുയോജ്യമായ സഹസ്രനാമങ്ങളും മന്ത്രങ്ങളും ആപ്ലിക്കേഷൻ സ്വയം പ്ലേ ചെയ്യുന്നു.",
      descTe: "ప్రస్తుత ముహూర్తం ఆధారంగా దానికి అనువైన సహస్రనామము లేదా భక్తి గీతాన్ని ఈ అప్లికేషన్ స్వయంచాలకంగా ప్లే చేస్తుంది."
    },
    {
      id: 2,
      icon: <Calendar className="w-8 h-8 text-amber-600" />,
      titleEn: "Complete 30 Muhurthas Calculation",
      titleMl: "മുപ്പത് മുഹൂർത്തങ്ങളുടെ ഗണനം",
      titleTe: "30 ముహూర్తాల సమగ్ర గణన",
      descEn: "The application calculates all the 30 daily Muhurthas (15 day and 15 night intervals) with precise start and end times based on local Sunrise.",
      descMl: "സൂര്യോദയ സമയം അടിസ്ഥാനമാക്കി ഒരു ദിവസത്തിലെ മുപ്പത് മുഹൂർത്തങ്ങളുടെയും (15 പകൽ മുഹൂർത്തങ്ങളും 15 രാത്രി മുഹൂർത്തങ്ങളും) കൃത്യമായ ആരംഭ - അവസാന സമയങ്ങൾ കണക്കാക്കുന്നു.",
      descTe: "అప్లికేషన్ సూర్యోదయం మరియు సూర్యాస్తమయం ఆధారంగా రోజులోని మొత్తం 30 ముహూర్తాల (15 పగలు మరియు 15 రాత్రి) ఖచ్చితమైన ప్రారంభ మరియు ముగింపు సమయాలను లెక్కిస్తుంది."
    },
    {
      id: 3,
      icon: <MapPin className="w-8 h-8 text-amber-600" />,
      titleEn: "Dynamic Location Customization",
      titleMl: "പ്രാദേശിക ലൊക്കേഷൻ ക്രമീകരണം",
      titleTe: "స్థాన ఆధారిత ఖచ్చితమైన లెక్కలు",
      descEn: "Users can easily search and edit their location if the application does not pick up their correct coordinates by default.",
      descMl: "ആപ്ലിക്കേഷൻ നിങ്ങളുടെ ശരിയായ ലൊക്കേഷൻ സ്വയം കണ്ടെത്തിയില്ലെങ്കിൽ നിങ്ങൾക്ക് വളരെ എളുപ്പത്തിൽ ലൊക്കേഷൻ തിരയാനും തിരുത്താനും സാധിക്കും.",
      descTe: "అప్లికేషన్ మీ ప్రస్తుత స్థానాన్ని గుర్తించకపోతే, మీరు సులభంగా మీ లోకేషన్ ను వెతికి మార్చుకోవచ్చు."
    },
    {
      id: 4,
      icon: <Activity className="w-8 h-8 text-amber-600" />,
      titleEn: "Precise Solar Kalam Timings",
      titleMl: "കൃത്യമായ രാഹു-ഗുളികാദികൾ",
      titleTe: "ఖచ్చితమైన సౌర కాలాల సమయాలు",
      descEn: "The application calculates the precise start and end times of Rahu Kalam, Gulika Kalam, and Yamagandam based on local Sunrise and Sunset.",
      descMl: "നിങ്ങളുടെ പ്രദേശത്തെ സൂര്യോദയ - സൂര്യാസ്തമയ സമയങ്ങൾ അടിസ്ഥാനമാക്കി രാഹുകാലം, ഗുളികകാലം, യമകണ്ടം എന്നിവയുടെ കൃത്യമായ സമയം കണക്കാക്കുന്നു.",
      descTe: "మీ ప్రాంతంలోని సూర్యోదయం మరియు సూర్యాస్తమయం ఆధారంగా రాహుకాలం, గుళికా కాలం మరియు యమగండం యొక్క ఖచ్చితమైన సమయాలను ఇది లెక్కిస్తుంది."
    },
    {
      id: 5,
      icon: <Music className="w-8 h-8 text-amber-600" />,
      titleEn: "Comprehensive Devotional Treasury",
      titleMl: "വിപുലമായ ഭക്തിഗാന ശേഖരം",
      titleTe: "సమగ్ర భక్తి గీతాల భాండాగారం",
      descEn: "'View all Music' lists all available devotional audio tracks categorized by Sahasranamams, Mantras, Stotrams, Songs, and Shirdi Sai chants.",
      descMl: "'View all Music' എന്നതിലൂടെ സഹസ്രനാമങ്ങൾ, മന്ത്രങ്ങൾ, സ്തോത്രങ്ങൾ, ഭക്തിഗാനങ്ങൾ, ഷിർദ്ദി ഗാനങ്ങൾ എന്നിവ വിഭാഗം തിരിച്ചു കാണാനും കേൾക്കാനും സാധിക്കും.",
      descTe: "'View all Music' ద్వారా లభించే అన్ని భక్తి గీతాలు, మంత్రాలు, సహస్రనామాలు మరియు షిరిడి సాయి పాటలను వర్గాల వారీగా సులభంగా వీక్షించవచ్చు."
    },
    {
      id: 6,
      icon: <Compass className="w-8 h-8 text-amber-600" />,
      titleEn: "Details of Day & Night Muhurthas",
      titleMl: "പകൽ - രാത്രി മുഹൂർത്തങ്ങൾ",
      titleTe: "పగలు & రాత్రి ముహూర్తాల వివరాలు",
      descEn: "'View all Muhurthas' displays structural details of all 15 daytime and 15 night-time Muhurthas with their ruling deities and attributes.",
      descMl: "'View all Muhurthas' വഴി ഒരു ദിവസത്തിലെ മുഴുവൻ മുഹൂർത്തങ്ങളുടെയും അധിപന്മാരെയും അവയുടെ പ്രത്യേകതകളെയും കുറിച്ചുള്ള വിവരങ്ങൾ അറിയാൻ കഴിയും.",
      descTe: "'View all Muhurthas' ద్వారా పగలు మరియు రాత్రికి సంబంధించిన మొత్తం 30 ముహూర్తాల అధిపతులు మరియు వాటి శుభ/అశుభ వివరాలను తెలుసుకోవచ్చు."
    },
    {
      id: 7,
      icon: <BookOpen className="w-8 h-8 text-amber-600" />,
      titleEn: "Sastra & Technical Alignment Manual",
      titleMl: "ശാസ്ത്രീയ - സാങ്കേതിക വിവരണം",
      titleTe: "శాస్త్ర & సాంకేతిక వివరణ పుస్తకం",
      descEn: "The integrated Sastra Manual explains the complete mathematical formulas, scriptural foundations, and technical alignments used in the calculations.",
      descMl: "ആപ്ലിക്കേഷനിലെ ഗണനങ്ങളുടെ ശാസ്ത്രീയ അടിത്തറകളും പ്രമാണങ്ങളും ഫോർമുലകളും 'SASTRA & TECHNICAL ALIGNMENT MANUAL / REPORT' എന്നതിൽ വിശദീകരിച്ചിരിക്കുന്നു.",
      descTe: "ఈ అప్లికేషన్ లోని గణనల వెనుక ఉన్న శాస్త్రీయ సూత్రాలు మరియు పూర్తి వివరాలు 'SASTRA & TECHNICAL ALIGNMENT MANUAL / REPORT' లో నిక్షిప్తమై ఉన్నాయి."
    }
  ];

  const current = slides[currentSlide];

  const getTitle = () => {
    if (currentLanguage === "ml") return current.titleMl;
    if (currentLanguage === "te") return current.titleTe;
    return current.titleEn;
  };

  const getDesc = () => {
    if (currentLanguage === "ml") return current.descMl;
    if (currentLanguage === "te") return current.descTe;
    return current.descEn;
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-hidden"
        id="introduction_overlay"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ ease: "easeOut", duration: 0.2 }}
          className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] bg-[#FAF6F0] rounded-3xl border border-[#D4C3A3] shadow-2xl flex flex-col overflow-y-auto sm:overflow-hidden scrollbar-none"
          id="introduction_modal_box"
        >
          {/* Top Header Background Pattern */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700"></div>

          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-full hover:bg-amber-100 text-[#8D6E63] hover:text-amber-900 transition duration-150 cursor-pointer z-10"
            title="Close Introduction"
            id="intro_close_button"
          >
            <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          {/* Header Area with Logo and Language Selector (Side-by-side on all screens) */}
          <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-[#D4C3A3]/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl">🕉️</span>
              <span className="font-serif font-black text-[#3E2723] text-[13px] sm:text-[15px] tracking-tight uppercase">
                {currentLanguage === "ml" ? "ആപ്പ് പരിചയം" : currentLanguage === "te" ? "యాప్ పరిచయం" : "Application Tour"}
              </span>
            </div>

            {/* In-modal Language Picker in English, Malayalam, Telugu Order */}
            <div className="flex items-center gap-1 mr-8 sm:mr-8" id="intro_language_picker">
              <Globe className="w-3.5 h-3.5 text-[#8D6E63] hidden sm:inline" />
              <div className="flex bg-[#F1E5D5] p-0.5 rounded-lg border border-[#D4C3A3]/50 text-[10px] font-bold">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md transition cursor-pointer ${
                    currentLanguage === 'en' 
                      ? 'bg-[#5D4037] text-white' 
                      : 'text-[#5D4037] hover:bg-amber-50/50'
                  }`}
                >
                  <span className="sm:inline hidden">English</span>
                  <span className="sm:hidden">EN</span>
                </button>
                <button
                  onClick={() => onLanguageChange('ml')}
                  className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md transition cursor-pointer ${
                    currentLanguage === 'ml' 
                      ? 'bg-[#5D4037] text-white' 
                      : 'text-[#5D4037] hover:bg-amber-50/50'
                  }`}
                >
                  <span className="sm:inline hidden">മലയാളം</span>
                  <span className="sm:hidden">മല</span>
                </button>
                <button
                  onClick={() => onLanguageChange('te')}
                  className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md transition cursor-pointer ${
                    currentLanguage === 'te' 
                      ? 'bg-[#5D4037] text-white' 
                      : 'text-[#5D4037] hover:bg-amber-50/50'
                  }`}
                >
                  <span className="sm:inline hidden">తెలుగు</span>
                  <span className="sm:hidden">తెలు</span>
                </button>
              </div>
            </div>
          </div>

          {/* Slide Content Area - Reduced paddings and min-height on mobile */}
          <div 
            className="px-4 py-4 sm:px-8 sm:py-6 flex flex-col items-center text-center min-h-[170px] sm:min-h-[220px] justify-center relative touch-pan-y select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-3 sm:gap-4 w-full"
              >
                {/* Visual Icon Halo - Responsive sizing */}
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center shadow-xs text-amber-700 shrink-0">
                  {React.cloneElement(current.icon as React.ReactElement, { className: "w-6 h-6 sm:w-8 sm:h-8 text-amber-600" })}
                </div>

                <div className="flex flex-col gap-1 sm:gap-2 max-w-sm">
                  <h3 className="font-serif font-black text-[#3E2723] text-[14px] sm:text-[18px]">
                    {getTitle().includes("108") ? (
                      <>
                        {getTitle().split("108")[0]}
                        <span className="font-sans font-normal tracking-normal mx-0.5 align-baseline">108</span>
                        {getTitle().split("108")[1]}
                      </>
                    ) : (
                      getTitle()
                    )}
                  </h3>
                  <p className="text-[#5D4037] text-[12px] sm:text-[13px] leading-relaxed font-sans font-medium font-serif-ml">
                    {getDesc()}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls and Slide Indicators - Compact padding on mobile */}
          <div className="px-4 py-3 sm:px-5 sm:py-4 bg-[#FCF8F2] border-t border-[#D4C3A3]/40 flex flex-col gap-2.5 sm:gap-3.5 mt-auto">
            
            {/* Indicators and Navigation */}
            <div className="flex flex-col gap-2.5 sm:gap-3.5" id="intro_nav_wrapper">
              
              {/* Dots indicator (Centered) */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5" id="intro_dots_indicator">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide 
                        ? 'w-4 sm:w-5 bg-amber-700' 
                        : 'w-1.5 sm:w-2 bg-amber-200 hover:bg-amber-300'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation buttons row with responsive fonts */}
              <div className="flex items-center justify-between w-full" id="intro_buttons_row">
                {/* Skip / Back button */}
                {currentSlide > 0 ? (
                  <button
                    onClick={prevSlide}
                    className="inline-flex items-center gap-0.5 py-1 px-2 text-[#8D6E63] hover:text-[#5D4037] font-semibold text-[11px] sm:text-[12px] transition cursor-pointer hover:bg-amber-100/50 rounded-xl"
                    id="intro_back_button"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{currentLanguage === "ml" ? "പിന്നോട്ട്" : currentLanguage === "te" ? "వెనుకకు" : "Back"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="py-1 px-2.5 text-[#8D6E63] hover:text-[#5D4037] font-semibold text-[11px] sm:text-[12px] transition cursor-pointer hover:bg-amber-100/50 rounded-xl"
                    id="intro_skip_button"
                  >
                    {currentLanguage === "ml" ? "ഒഴിവാക്കുക" : currentLanguage === "te" ? "దాటవేయి" : "Skip"}
                  </button>
                )}

                {/* Next / Finish button */}
                <button
                  onClick={nextSlide}
                  className="inline-flex items-center gap-1 py-1 px-3 bg-[#5D4037] hover:bg-[#3E2723] text-white font-bold text-[11px] sm:text-[12px] transition cursor-pointer rounded-xl shadow-3xs"
                  id="intro_next_button"
                >
                  <span>
                    {currentSlide === slides.length - 1 
                      ? (currentLanguage === "ml" ? "തുടങ്ങാം" : currentLanguage === "te" ? "ప్రారంభించు" : "Get Started")
                      : (currentLanguage === "ml" ? "അടുത്തത്" : currentLanguage === "te" ? "తరువాత" : "Next")
                    }
                  </span>
                  {currentSlide < slides.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>

            {/* "Do not show again" Checkbox - Extremely clean and compact */}
            <div className="flex items-center justify-center pt-1.5 border-t border-[#D4C3A3]/20">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none py-0.5 group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="sr-only"
                    id="intro_dont_show_again_input"
                  />
                  <div className={`w-3.5 h-3.5 rounded border transition duration-150 flex items-center justify-center ${
                    dontShowAgain 
                      ? 'bg-amber-700 border-amber-800' 
                      : 'border-[#8D6E63]/60 bg-white group-hover:border-[#5D4037]'
                  }`}>
                    {dontShowAgain && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                  </div>
                </div>
                <span className="text-[#8D6E63] text-[10px] sm:text-[11px] font-medium font-sans">
                  {currentLanguage === "ml" 
                    ? "ഇനി ഈ ആപ്പ് പരിചയം കാണിക്കേണ്ടതില്ല" 
                    : currentLanguage === "te" 
                      ? "మరలా ఈ పరిచయాన్ని చూపించవద్దు" 
                      : "Do not show this introduction again"}
                </span>
              </label>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
