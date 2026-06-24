import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  Disc, 
  Heart, 
  Repeat, 
  SkipForward, 
  Award, 
  Sun, 
  Moon, 
  Compass, 
  Sparkles,
  Star,
  Info 
} from "lucide-react";
import { MUHURTAS_LIST, MuhurtaData } from "./JathakamPanel";
import AdminSettingsModal from "./AdminSettingsModal";
import { estimateTimezoneOffset } from "../types";
import { Settings } from "lucide-react";

interface DevotionalPlayerProps {
  currentLanguage: "en" | "ml" | "te";
  locationDetails: {
    sunrise: string;
    sunset: string;
    lat: number;
    lng: number;
  };
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  activeTrackName: string;
  setActiveTrackName: (name: string) => void;
  activeTrackUrl: string;
  setActiveTrackUrl: (url: string) => void;
}

interface DevotionalCategory {
  id: string;
  title: string;
  subSanskrit: string;
  malayalamTitle: string;
  teluguTitle: string;
  associatedDeities: string;
  relatedMuhurtas: string;
  recommendedSahasranama: string;
  recommendedKeerthana: string;
  recommendedBhajana: string;
  activeLyricsSanskrit: string;
  activeLyricsEnglish: string;
  activeLyricsMalayalam: string;
  activeLyricsTelugu: string;
  audioUrl: string;
  baseFreq: number; // Hz for synthesizer C=130.81, C#=138.59, D=146.83, F#=185.00, G#=207.65, A=220.00
  droneScale: string; // "Major", "Minor", "Sus4"
}

// Full dataset for Muhurta-specific Devotional Themes (6 categories)
const MUHURTA_DEVOTIONAL_THEMES: DevotionalCategory[] = [
  {
    id: "vishnu",
    title: "Vishnu Sahasranamam",
    subSanskrit: "विष्णु सहस्रनाम स्तोत्रम्",
    malayalamTitle: "വിഷ്ണു സഹസ്രനാമം",
    teluguTitle: "విష్ణు సహస్రనామము",
    associatedDeities: "Lord Maha Vishnu, Sri Venkateswara, Lord Krishna",
    relatedMuhurtas: "Vara/Varaha (#6), Vishnu (#27), Ahirbudhnya (#18)",
    recommendedSahasranama: "Sri Vishnu Sahasranamam",
    recommendedKeerthana: "Venkateswara Suprabhatam",
    recommendedBhajana: "Sri Vishnu Chant",
    activeLyricsSanskrit: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥",
    activeLyricsEnglish: "Shantakaram bhujagashayanam padmanabham suresham, Vishvadharam gaganasadrisham meghavarnam shubhangam. Lakshmikantam kamalanayanam yogibhirdhyanagamyam, Vande vishnum bhavabhayaharam sarvalokaikanatham.",
    activeLyricsMalayalam: "ശാന്താകാരം ഭുജഗശയനം പത്മനാഭം സുരേശം വിശ്വാധാരം ഗഗനസദൃശം മേഘവർണം ശുഭാംഗം. ലക്ഷ്മീകാന്തം കമലനയനം യോഗിഭിർദ്ധ്യാനഗമ്യം വന്ദേ വിഷ്ണും ഭവഭയഹരം സർവലോകൈകനാഥം.",
    activeLyricsTelugu: "శాంతాకారం భుజగశయనం పద్మనాభం సురేశం విశ్వాధారం గగనసదృశం మేఘవర్ణం శుభాంగమ్. లక్ష్మీకాంతం కమలలయం యోగిభిర్ధ్యానగమ్యం వందే విష్ణుం భవభయహరం సర్వలోకైకనాథమ్.",
    audioUrl: "https://dn721203.ca.archive.org/0/items/VishnuSahasranamam_MSS/Vishnu%20Sahasranamam.mp3",
    baseFreq: 146.83, // D (peaceful sustaining scale)
    droneScale: "Major"
  },
  {
    id: "shiva",
    title: "Siva Sahasaranamam",
    subSanskrit: "शिव सहस्रनाम स्तोत्रम्",
    malayalamTitle: "ശിവ സഹസ്രനാമം",
    teluguTitle: "శివ సహస్రనామము",
    associatedDeities: "Lord Siva, Mahadeva, Rudran, Veerabhadra",
    relatedMuhurtas: "Rudra (#1), Girisha (#16), Ajapada (#17)",
    recommendedSahasranama: "Siva Sahasaranamam",
    recommendedKeerthana: "Shiva Tandava Stotram / Lingashtakam",
    recommendedBhajana: "Om Namah Shivaya (Meditative Chant)",
    activeLyricsSanskrit: "जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां  ",
    activeLyricsEnglish: "Jatataveegalajjala pravahapavitasthale, Galeavalambya lambitam bhujangatungamalikam. Damaddamaddamaddaman ninadavadamarvayam, Chakara chandatandavam.",
    activeLyricsMalayalam: "ജടാടവീഗളജ്ജല പ്രവാഹപാവിതസ്ഥലേ ഗളേവലംബ്യ ലംബിതാം ഭുജംകതുംഗമാലികാം. ഡമഡ്ഡമഡ്ഡമഡ്ഡമൻ പ്രവാഹതാം വിരിഞ്ചി ചകാര ചണ്ഡതാണ്ഡവം തനോതു നഃ ശിവ ശിവം.",
    activeLyricsTelugu: "జటాటవీగలజ్జల ప్రవాహపావితస్థలే గలేవలంబ్య లంబితాం భుజంగతుంగమాలికామ్. డమడ్డమడ్డమడ్డమన్నినాదవడ్డమర్වయం చకార చణ్టతాణ్టవం తనోతు నః శివః శివమ్.",
    audioUrl: "https://dn721909.ca.archive.org/0/items/siva-sahasaranamam/Siva%20Sahasaranamam.mp3",
    baseFreq: 138.59, // C# (deep Shiva meditative pitch)
    droneScale: "Minor"
  },
  {
    id: "lalitha",
    title: "Lalitha Sahasranamam",
    subSanskrit: "ललिता सहस्रनाम स्तोत्रम्",
    malayalamTitle: "ലളിതാ സഹസ്രനാമം",
    teluguTitle: "లలితా సహస్రనామము",
    associatedDeities: "Goddess Adi Parashakti, Durga, Mahalakshmi, Saraswati",
    relatedMuhurtas: "Vasu (#5), Pushya/Pusa (#19), Aditi (#25), Vishvedeva (#7)",
    recommendedSahasranama: "Lalitha Sahasranamam",
    recommendedKeerthana: "Sri Suktam / Kanakadhara Stotram",
    recommendedBhajana: "Mahalakshmi Namastuthe",
    activeLyricsSanskrit: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥ सरस्वती महाभागे विद्ये कमललोचने । विद्यारूपे विशालाक्षि विद्यां देहि नमोऽस्तु ते ॥",
    activeLyricsEnglish: "Om Bhur Bhuvah Svah, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat. Saraswati Mahabhage Vidye Kamalalochane, Vidyarupe Vishalakshi Vidyam Dehi Namostute.",
    activeLyricsMalayalam: "ഓം ഭൂർഭുവഃ സ്വഃ തത്സവിതുർവരേണ്യം ഭർഗോ ദേവസ്യ ധീമഹി ധിയോ യോ നഃ പ്രചോദയാത്. സരസ്വതീ മഹാഭാഗേ വിദ്യേ കമലലോചനേ വിദ്യാരൂപേ വിശാലാക്ഷി വിദ്യാം ദേഹി നമോസ്തുതേ.",
    activeLyricsTelugu: "ఓం భూర్భువః స్వః తత్సవితు౼వారేణ్యం భ౼గో దేవస్య ధీమహి ధియో యో నః ప్రచోదయాత్. సరస్వతీ మహాభాగే విద్యే కమలలోచనే విద్యారూపే విశాలాక్షి విద్యాం దేహి నమోస్తుతే.",
    audioUrl: "https://dn711109.ca.archive.org/0/items/LalithaSahasranamamFull/Lalitha%20Sahasranamam%20Full.mp3",
    baseFreq: 233.08, // Bb (sweet auspicious prosperity key)
    droneScale: "Major"
  },
  {
    id: "subramanya",
    title: "Subramanya Sahasranamam",
    subSanskrit: "सुब्रह्मण्य सहस्रनाम स्तोत्रम्",
    malayalamTitle: "സുബ്രഹ്മണ്യ സഹസ്രനാമം",
    teluguTitle: "సుబ్రహ్మణ్య సహస్రనామము",
    associatedDeities: "Lord Subramanya, Murugan, Kartikeya",
    relatedMuhurtas: "Yama (#21), PURUHUTA (#10), NAKTANCHARA (#12)",
    recommendedSahasranama: "Subramanya Sahasranamam",
    recommendedKeerthana: "Subramanya Bhujangam",
    recommendedBhajana: "Kartikeya Chant",
    activeLyricsSanskrit: "षडाननं कुङ्कुमराघवर्णं महामतिं दिव्यमयूरवाहनम् । रुद्रस्यसूनुं सुरसङ्घनाथं गुहं सदाहं शरणं प्रपद्ये ॥",
    activeLyricsEnglish: "Shadananambhule kukumaragavarnam mahamatim divyamayuravahanam, Rudrasyasunum surasanghanatham guham sadaham sharanam prapadye.",
    activeLyricsMalayalam: "ഷഡാനനം കുങ്കുമരാഗവർണം മഹാമതിം ദിവ്യമയൂരവാഹനം. രുദ്രസ്യസൂനും സുരസംഘനാഥം ഗുഹം സദാഹം ശരണം പ്രപദ്യേ.",
    activeLyricsTelugu: "షడాననం కుంకుమరాగవర్ణం మహామతిం దివ్యమయూరవాహనమ్. రుద్రస్యసూనం సురసంఘనాథం గుహం సదాహం శరణం ప్రపద్యే.",
    audioUrl: "https://dn721608.ca.archive.org/0/items/sri-subramanyabhujangamandsahasranamam/Sri%20Subramanya%20Bhujangam%20and%20Sahasranamam/006-Sri%20Subramanya%20Sahasranamam.mp3",
    baseFreq: 207.65, // G# (deep grounding protective pitch)
    droneScale: "Minor"
  },
  {
    id: "ganesha",
    title: "Ganesha Sahasranamam",
    subSanskrit: "गणेश सहस्रनाम स्तोत्रम्",
    malayalamTitle: "ഗണേശ സഹസ്രനാമം",
    teluguTitle: "గణేశ సహస్రనామము",
    associatedDeities: "Lord Ganesha, Vigneshwara, Ganapathy",
    relatedMuhurtas: "Mitra (#3), Yumigadyuti (#28), Jiva/Guru (#26)",
    recommendedSahasranama: "Ganesha Sahasranamam",
    recommendedKeerthana: "Ganesha Pancharatnam",
    recommendedBhajana: "Vatapi Ganapatim",
    activeLyricsSanskrit: "ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि तन्नो दन्ती प्रचोदयात् ॥ सुमुखश्चैकదन्तశ్చ కపిలో గజకర్ణకః । లంబోదరశ్చ వికటో విఘ్ననాశో వినాయకః ॥",
    activeLyricsEnglish: "Om Ekadantaya Vidmahe Vakratundaya Dhimahi Tanno Danti Prachodayat. Sumukhashchaikantashcha kapilo gajakarnakah, Lambodarashcha vikato vighnanasho vinayakah.",
    activeLyricsMalayalam: "ഓം ഏകദന്തായ വിദ്മഹേ വക്രതുണ്ഡായ ധീമഹി തന്നോ ദന്തീ പ്രചോദയാത്. സരസ്വതീ മഹാഭാഗേ വിദ്യേ കമലലോചനേ പ്രോതാഹി വിഘ്നനാശോ വിനായകഃ.",
    activeLyricsTelugu: "ఓం ఏకదంతాయ విద్మహే వక్రతుండాయ ధీమహి తన్నో దంతీ ప్రచోదయాత్. సుముఖశ్చైకదంతశ్చ కపిలో గజకర్ణకః, లంబోదరశ్చ వికటో విఘ్ననాశో వినాయకః.",
    audioUrl: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/002-Sri%20Ganesa%20Sahasranamam.mp3",
    baseFreq: 185.00, // F# (cognitive clarity intellectual note)
    droneScale: "Sus4"
  }
];

const WEEKDAY_DEVOTIONAL_INFO = [
  { dayIndex: 0, dayName: "Sunday (Bhanuvaram)", deity: "Lord Surya", song: "Aditya Hrudaya Stotram & Surya Ashtakam" },
  { dayIndex: 1, dayName: "Monday (Somavaram)", deity: "Lord Shiva", song: "Lingashtakam & Shiva Panchakshari Stotram" },
  { dayIndex: 2, dayName: "Tuesday (Mangalavaram)", deity: "Sri Hanuman & Lord Muruga", song: "Hanuman Chalisa & Subramanya Bhujangam" },
  { dayIndex: 3, dayName: "Wednesday (Budhavaram)", deity: "Lord Krishna & Vishnu", song: "Madhurashtakam & Sri Vishnu Sahasranamam" },
  { dayIndex: 4, dayName: "Thursday (Guruvaram)", deity: "Lord Dakshinamurthy & Guru", song: "Guru Stotram & Guru Gita Chants" },
  { dayIndex: 5, dayName: "Friday (Sukravaram)", deity: "Goddess Mahalakshmi & Durga", song: "Kanakadhara Stotram & Mahalakshmi Ashtakam" },
  { dayIndex: 6, dayName: "Saturday (Sanivaram)", deity: "Lord Shani & Sri Venkateswara", song: "Shani Chalisa & Sri Venkateswara Suprabhatam" }
];

const getCategoryAudioUrl = (catId: string, trackType: "sahasranama" | "keerthana" | "bhajana") => {
  if (catId === "shiva") return "https://dn721902.ca.archive.org/0/items/siva-sahasranama-stotram/Siva%20Sahasranama%20Stotram-By%20H.H%20Sri%20Jayendra%20Saraswathi%20Swami.mp3";
  if (catId === "vishnu") return "https://dn721203.ca.archive.org/0/items/VishnuSahasranamam_MSS/Vishnu%20Sahasranamam.mp3";
  if (catId === "lalitha") return "https://dn711109.ca.archive.org/0/items/LalithaSahasranamamFull/Lalitha%20Sahasranamam%20Full.mp3";
  if (catId === "subramanya") return "https://dn721608.ca.archive.org/0/items/sri-subramanyabhujangamandsahasranamam/Sri%20Subramanya%20Bhujangam%20and%20Sahasranamam/006-Sri%20Subramanya%20Sahasranamam.mp3";
  if (catId === "ganesha") return "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/002-Sri%20Ganesa%20Sahasranamam.mp3";
  return "https://dn721902.ca.archive.org/0/items/siva-sahasranama-stotram/Siva%20Sahasranama%20Stotram-By%20H.H%20Sri%20Jayendra%20Saraswathi%20Swami.mp3";
};

interface PlaylistTrack {
  id: string;
  nameEn: string;
  nameMl: string;
  nameTe: string;
  url: string;
  category: "mantra" | "stotram" | "suprabhatam" | "sahasranamam" | "songs" | "shirdi";
  lyricsSanskrit: string;
  lyricsEnglish: string;
  lyricsMalayalam: string;
  lyricsTelugu: string;
}

const SACRED_TREASURY_PLAYLIST: PlaylistTrack[] = [
  {
    id: "maha_mrityunjay",
    nameEn: "Maha Mrityunjay Mantra",
    nameMl: "മഹാ മൃത്യുഞ്ജയ മന്ത്രം",
    nameTe: "మహా మృత్యుంజయ మంత్రం",
    url: "https://dn710905.ca.archive.org/0/items/ShivaStotrasAndMantras/80Maha%20Mrityunjay%20Mantra.mp3",
    category: "mantra",
    lyricsSanskrit: "त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ॥ उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात् ॥",
    lyricsEnglish: "We worship the three-eyed Lord who is fragrant and nurtures all. May He liberate us from death like a ripe cucumber is severed from its vine, and guide us to immortality.",
    lyricsMalayalam: "ഞങ്ങൾ ത്രയംബകനെ (മുക്കണ്ണൻ) ആരാധിക്കുന്നു. സുഗന്ധ വാഹിയും പുഷ്ടി വളർത്തുന്നവനുമായ ഭഗവാൻ, വെള്ളരിപ്പഴം വള്ളിയിൽ നിന്നും എന്നപോലെ ഞങ്ങളെ മരണത്തിൽ നിന്നും അമൃതത്വത്തിലേക്ക് വേർപെടുത്തുമാറാകട്ടെ.",
    lyricsTelugu: "మేము మూడు కన్నుల ముక్కంటిని కొలుస్తున్నాము. సుగంధ భరితుడై ప్రాణులను పోషించే ఆ స్వామి, పండిన దోసకాయ తొడిమ నుండి విడివడినట్లు మమ్మల్ని మృత్యువు నుండి అమరత్వానికి విముక్తులను చేయుగాక."
  },
  {
    id: "ganesh_gayatri",
    nameEn: "Ganesh Gayatri Mantra",
    nameMl: "ഗണേശ ഗായത്രി മന്ത്രം",
    nameTe: "గణేశ గాయత్రీ మంత్రం",
    url: "https://dn710801.ca.archive.org/0/items/ShriGaneshGayatriMantra/05ShriGaneshGayatriMantra.mp3",
    category: "mantra",
    lyricsSanskrit: "एकदन्ताय विद्महे वक्रतुण्डाय धीमहि ॥ तन्नो दन्तिः प्रचोदयात् ॥",
    lyricsEnglish: "We pray to the single-tusked Lord, we meditate upon the curved trunk Lord. May that tusker inspire and illuminate our mind.",
    lyricsMalayalam: "ഏകദന്തനെ ഞങ്ങൾ മനസ്സിലാക്കുന്നു, വക്രതുണ്ഡനെ ഞങ്ങൾ ധ്യാനിക്കുന്നു. ആ ഗണപതി ഭഗവാൻ ഞങ്ങളുടെ ബുദ്ധിയെ ഉണർത്തുമാറാകട്ടെ.",
    lyricsTelugu: "ఏకదంతుని మేము గ్రహిస్తున్నాము, వక్రతుండుని మేము ధ్యానిస్తున్నాము. ఆ దంతి గజరాజు మా బుద్ధిని ప్రచోదనం చేయుగాక."
  },
  {
    id: "ganpati_beeja",
    nameEn: "Ganpati Beeja Mantra",
    nameMl: "ഗണപതി ബീജ മന്ത്രം",
    nameTe: "గణపతి బీజ మంత్రం",
    url: "https://dn710905.ca.archive.org/0/items/ShivaStotrasAndMantras/01Ganpati%20Beej%20Mantra.mp3",
    category: "mantra",
    lyricsSanskrit: "ॐ गं गणपतये नमः ॥ विघ्नविनाशनाय शिवसुताय श्रीवरदमूर्तये नमः ॥",
    lyricsEnglish: "Auspicious salutations with 'Gam' to Lord Ganapati, the destroyer of all obstacles, the son of Lord Shiva, and the bestower of blessed boons.",
    lyricsMalayalam: "ഓം ഗം ഗണപതയേ നമഃ. വിഘ്നങ്ങളെ നശിപ്പിക്കുന്നവനും, ശിവപുത്രനും, വരദായകനുമായ ശ്രീ ഗണപതി ഭഗവാനെ ഞങ്ങൾ വണങ്ങുന്നു.",
    lyricsTelugu: "ఓం గం గణపతయే నమః. విఘ్నములను రూపుమాపేవాడు, శివసుతుడు, కోరిన వరములిచ్చే శ్రీ వరదమూర్తికి నమస్కారం."
  },
  {
    id: "devi_stotram",
    nameEn: "Devi Stotram (Aigiri Nandini)",
    nameMl: "ദേവി സ്തോത്രം (അയിഗിരി നന്ദിനി)",
    nameTe: "దేవి స్తోత్రం (అయిగిరి నందిని)",
    url: "https://dn710702.ca.archive.org/0/items/AigiriNandini/gayatri3.mp3",
    category: "stotram",
    lyricsSanskrit: "अयि गिरिनन्दिनि नन्दितमेदिनि विश्वविनोदिनि नन्दिनुते ॥ गिरिवरविन्ध्यशिरोधिनिवासिनि विष्णुविलासिनि जिष्णुनुते ॥",
    lyricsEnglish: "Salutations to the daughter of the mountain, who delights the earth, makes the universe rejoice, and is praised by Nandi. Dweller of the Vindhya range, delight of Vishnu, and praised by Indra.",
    lyricsMalayalam: "പർവ്വതപുത്രിയും, ഭൂമിയെ ആനന്ദിപ്പിക്കുന്നവളും, പ്രപഞ്ചത്തെ സന്തോഷിപ്പിക്കുന്നവളും ആയ ദേവിക്ക് പ്രണാമം. വിന്ധ്യഗിരിയിൽ വസിക്കുന്നവളും വിഷ്ണുപ്രിയയും ആയ സുര പൂജിതേ ജയ ജയ ദേവി.",
    lyricsTelugu: "పర్వతపుత్రి, భూదేవికి ఆనందం కలిగించేది, విశ్వాన్ని వినోదింపజేసే దేవికి నమస్కారం. వింధ్యపర్వతముపై నివసించే విష్ణు విలాసిని దేవికి జయం కలుగుగాక."
  },
  {
    id: "ashtalakshmi_stotram",
    nameEn: "Ashtalakshmi Stotram",
    nameMl: "അഷ്ടലക്ഷ്മി സ്തോത്രം",
    nameTe: "అష్టలక్ష్మీ స్తోత్రం",
    url: "https://ia802800.us.archive.org/5/items/AshtalakshmiStotram/AshtalakshmiStotram.mp3",
    category: "stotram",
    lyricsSanskrit: "सुमनस वन्दित सुन्दरि माधवि चन्द्र सहोदरि हेममये ॥ मुनिगण मण्डित मोक्षप्रदायिनि मञ्जुलभाषिणि वेदनुते ॥",
    lyricsEnglish: "Worshipped by the pure-hearted, beautiful consort of Madhava, sister of the Moon, filled with golden light. Adorned by sages, giver of liberation, sweet-spoken, and praised by the Vedas.",
    lyricsMalayalam: "സജ്ജനങ്ങളാൽ വന്ദിക്കപ്പെടുന്നവളും, ലക്ഷ്മീദേവിയും, ചന്ദ്രന്റെ സഹോദരിയും ആയ സുവർണ്ണമയിയെ വണങ്ങുന്നു. മോക്ഷം നൽകുന്നവളും വേദങ്ങളാൽ വാഴ്ത്തപ്പെടുന്നവളും ആയ അഷ്ടലക്ഷ്മിമാർ തുണയ്ക്കട്ടെ.",
    lyricsTelugu: "సజ్జనలచే పూజింపబడే మంగళకారిణి, చంద్రుని సోదరి, సువర్ణ రూపిణి దేవి. సన్యాసులచే పూజింపబడుతూ మోక్షాన్నిచ్చే అష్టలక్ష్మి దేవికి నమస్కారములు."
  },
  {
    id: "shiva_panchakshar",
    nameEn: "Shiva Panchakshara Stotram",
    nameMl: "ശിവ പഞ്ചാക്ഷര സ്തോത്രം",
    nameTe: "శివ పంచాక్షర స్తోత్రం",
    url: "https://dn710905.ca.archive.org/0/items/ShivaStotrasAndMantras/24Shiva%20Panchakshar%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "नागेन्द्रहाराय त्रिलोचनाय भस्माङ्गरागाय महेश्वराय ॥ नित्याय शुद्धाय दिगम्बराय तस्मै नकाराय नमः शिवाय ॥",
    lyricsEnglish: "Salutations to Shiva, who has the king of snakes as His garland, who has three eyes, whose body is smeared with sacred ash, the supreme Lord. Eternal, pure, and clad in the four directions, salutations to the syllable 'Na'.",
    lyricsMalayalam: "നാഗേന്ദ്രനെ മാലയാക്കിയവനും, മുക്കണ്ണനും, ഭസ്മലേപനം ചാർത്തിയവനുമായ മഹേശ്വരൻ. നിത്യനും ശുദ്ധനും ദിഗംബരനുമായ ഭഗവാന്, 'ന' കാര സ്വരൂപനായ ശിവന് പ്രണാമം.",
    lyricsTelugu: "సర్పరాజును హారముగా ధరించినవాడు, త్రినేత్రుడు, విభూతిని వంటి నిండా పూసుకున్న మహేశ్వరుడు. నిత్యుడు, పరిశుద్ధుడు, దిశలనే వస్త్రములుగా ధరించిన ‘న’కార రూప శివునికి నమస్కారం."
  },
  {
    id: "shiva_shadakshar",
    nameEn: "Shiva Shadakshara Stotram",
    nameMl: "ശിവ ഷഡാക്ഷര സ്തോത്രം",
    nameTe: "శివ షడాక్షర స్తోత్రం",
    url: "https://dn710905.ca.archive.org/0/items/ShivaStotrasAndMantras/25Shiva%20Shadakshar%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "ॐकारं बिन्दुसंयुक्तं नित्यं ध्यायन्ति योगिनः ॥ कामदं मोक्षदं चैव ॐकाराय नमो नमः ॥",
    lyricsEnglish: "The yogis constantly meditate upon the sacred Omkara adorned with the divine bindu. The fulfiller of desires and giver of liberation, salutations to that Omkara.",
    lyricsMalayalam: "യോഗിവര്യന്മാർ നിത്യവും ധ്യാനിക്കുന്ന ബിന്ദുസംയുക്തമായ ഓംകാരം. ആഗ്രഹങ്ങൾ സാധിപ്പിക്കുന്നതും മോക്ഷം തരുന്നതുമായ ഓംകാര സ്വരൂപന് നമസ്കാരം.",
    lyricsTelugu: "యోగీశ్వరులు నిత్యం ధ్యానించే బిందుయుక్త ఓంకారం, కోరికలు తీర్చి మోక్షాన్నిచ్చే ఆ ఓంకార రూప పరమాత్మునికి నమస్కారములు."
  },
  {
    id: "umamaheswara_stotram",
    nameEn: "Umamaheswara Stotram",
    nameMl: "ഉമാമഹേശ്വര സ്തോത്രം",
    nameTe: "ఉమామహేశ్వర స్తోత్రం",
    url: "https://dn710905.ca.archive.org/0/items/ShivaStotrasAndMantras/26Umamaheswara%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "नमः शिवाभ्यां नवयौवनाभ्यां परस्पराश्लिष्टवपुर्धराभ्याम् ॥ नगराजपुत्रीवृषकेतनाभ्यां नमो नमः शङ्करपार्वतीभ्याम् ॥",
    lyricsEnglish: "Salutations to Shiva and Shakti, who possess eternal youth and whose divine bodies are entwined. To the daughter of the mountain king and the one with the bull emblem, salutations to Sankara and Parvati.",
    lyricsMalayalam: "നിത്യയൗവനമുള്ളവരും പരസ്പരം ആശ്ലേഷിച്ച ശരീരത്തോടുകൂടിയവരുമായ ശിവപാർവ്വതിമാർക്ക് പ്രണാമം. പർവ്വതരാജപുത്രിയും വൃഷഭവാഹകനുമായ ശങ്കരപാർവ്വതിമാരെ ഞങ്ങൾ വണങ്ങുന്നു.",
    lyricsTelugu: "నిత్య యౌవనంతో అలరారే పార్వతీ పరమేశ్వరులకు నమస్కారం. పర్వతరాజపుత్రి, నందిని వాహనంగా కల శంకరుని జోడి శంకరపార్వతులకు నమస్కారములు."
  },
  {
    id: "dwadasa_jyothirlinga",
    nameEn: "Dwadasa Jyothirlinga Stotram",
    nameMl: "ദ്വാദശ ജ്യോതിർലിംഗ സ്തോത്രം",
    nameTe: "ద్వాదశ జ్యోతిర్లింగ స్తోత్రం",
    url: "https://dn710905.ca.archive.org/0/items/ShivaStotrasAndMantras/27Dwadasa%20Jyothirlinga%20Stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "सौराष्ट्रे सोमनाथं च श्रीशैले मल्लिकार्जुनम् ॥ उज्जयिन्यां महाकालमोङ्कारममलेश्वरम् ॥",
    lyricsEnglish: "Somanatha in Saurashtra, Mallikarjuna in Srisailam, Mahakala in Ujjain, Omkareshwar in Amaleshwaram.",
    lyricsMalayalam: "സൗരാഷ്ട്രയിലെ സോമനാഥനും, ശ്രീശൈലത്തിലെ മല്ലികാർജ്ജുനനും, ഉജ്ജയിനിയിലെ മഹാകാളനും, ഓംകാരേശ്വരത്തുള്ള അമലേശ്വരനും ചേർന്ന ദ്വാദശ ജ്യോതിർലിംഗങ്ങളെ വണങ്ങുന്നു.",
    lyricsTelugu: "సౌరాష్ట్రంలో సోమనాథుడు, శ్రీశైలంలో మల్లికార్జునుడు, ఉజ్జయినిలో మహాకాళుడు, ఓంకారమమలేశ్వరుడైన జ్యోతిర్లింగాలకు నమస్కారములు."
  },
  {
    id: "shiva_tandav",
    nameEn: "Shiva Tandav Stotram",
    nameMl: "ശിവ താണ്ഡവ സ്തോത്രം",
    nameTe: "శివ తాండవ స్తోత్రం",
    url: "https://dn710905.ca.archive.org/0/items/ShivaStotrasAndMantras/36Shiva%20Tandav%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम् ॥ डमड्डमड्डमड्डमन्निनादवड্ডमर्वयं चकार चण्डताण्डवं तनोतु नः शिवः शिवम् ॥",
    lyricsEnglish: "With His neck consecrated by the flow of water trickling from His dense forest matted hair, and draped with a garland of serpents, He performed the intense Tandava dance to the thumping of the damaru. May Lord Shiva shower auspicious blessings.",
    lyricsMalayalam: "തന്റെ ജടയാകുന്ന കാട്ടിൽ നിന്നും ഒഴുകുന്ന ഗംഗാ തീർത്ഥത്താൽ പവിത്രമായ കഴുത്തിൽ സർപ്പമാലയണിഞ്ഞ്, ഡമരു നാദത്തിനൊപ്പം താണ്ഡവമാടിയ പരമശിവൻ ഞങ്ങൾക്ക് മംഗളം ചൊരിയട്ടെ.",
    lyricsTelugu: "జటలనే అడవి నుండి ప్రవహించే గంగతో తడిసిన ముక్కంటి కంఠసీమలో పాములను హారంగా వేసుకుని, డమరుక ధ్వనులకు అనుగుణంగా ప్రచండ తాండవం చేసిన శివుడు మాకు శ్రేయస్సు కలిగించుగాక."
  },
  {
    id: "sri_venkatesa_suprabhatam",
    nameEn: "Sri Venkatesa Suprabhatam",
    nameMl: "ശ്രീ വെങ്കടേശ സുപ്രഭാതം",
    nameTe: "శ్రీ వేంకటేశ్వర సుప్రభాతం",
    url: "https://dn720605.ca.archive.org/0/items/sri-venkatesa-suprabhatam/-sri%20venkatesa%20suprabhatam.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "कौसल्या सुप्रजा राम पूर्वा संध्या प्रवर्तते ॥ उत्तिष्ठ नरशार्दूल कर्त्तव्यं दैवमाह्निकम् ॥",
    lyricsEnglish: "O Rama, the auspicious son of Kausalya! The dawn is breaking in the East. Arise, O lion among men, the daily divine rituals are to be performed.",
    lyricsMalayalam: "കൗസല്യയുടെ പ്രിയപുത്രനായ രാമാ, കിഴക്ക് ഉഷസ്സുണർന്നു കഴിഞ്ഞു. പുരുഷ സിംഹമേ എഴുന്നേൽക്കൂ, ദിവസേനയുള്ള ദൈവീക കർമ്മങ്ങൾ ചെയ്യാനുള്ള നേരമായി.",
    lyricsTelugu: "కౌసల్యా సుప్రజా రామా పూర్వా సంధ్యా ప్రవర్తతే! ఉత్తిష్ఠ నరశార్దూల కర్తవ్యం దైవమాహ్నికమ్! శ్రీ వేంకటేశ్వరునికి సుప్రభాతం."
  },
  {
    id: "vishnu_sahasranama",
    nameEn: "Sri Vishnu Sahasranamam",
    nameMl: "ശ്രീ വിഷ്ണു സഹസ്രനാമം",
    nameTe: "శ్రీ విష్ణు సహస్రనామము",
    url: "https://dn721203.ca.archive.org/0/items/VishnuSahasranamam_MSS/Vishnu%20Sahasranamam.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥",
    lyricsEnglish: "Shantakaram bhujagashayanam padmanabham suresham, Vishvadharam gaganasadrisham meghavarnam shubhangam. Lakshmikantam kamalanayanam yogibhirdhyanagamyam, Vande vishnum bhavabhayaharam sarvalokaikanatham.",
    lyricsMalayalam: "ശാന്താകാരം ഭുജഗശയനം പത്മനാഭം സുരേശം വിശ്വാധാരം ഗഗനസദൃശം മേഘവർണം ശുഭാംഗം. ലക്ഷ്മീകാന്തം കമലനയനം യോഗിഭിർദ്ധ്യാനഗമ്യം വന്ദേ വിഷ്ണും ഭവഭയഹരം സർവലോകൈകനാഥം.",
    lyricsTelugu: "శాంతాకారం భుజగశయనం పద్మనాభం సురేశం విశ్వాధారం గగనసదృశం మేఘవర్ణం శుభాంగమ్. లక్ష్మీకాంతం కమలలయం యోగిభిర్ధ్యానగమ్యం వందే విష్ణుం భవభయహరం సర్వలోకైకనాథమ్."
  },
  {
    id: "shiva_sahasranama",
    nameEn: "Sri Shiva Sahasranamam",
    nameMl: "ശ്രീ ശിവ സഹസ്രനാമം",
    nameTe: "శ్రీ శివ సహస్రనామము",
    url: "https://dn721909.ca.archive.org/0/items/siva-sahasaranamam/Siva%20Sahasaranamam.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम् ॥ डमड्डमड्डमड्डमन्निनादवड्डमर्वयं चकार चण्डताण्डवं तनोतु नः शिवः शिवम् ॥",
    lyricsEnglish: "Jatataveegalajjala pravahapavitasthale, Galeavalambya lambitam bhujangatungamalikam. Damaddamaddamaddaman ninadavadamarvayam, Chakara chandatandavam.",
    lyricsMalayalam: "ജടാടവീഗളജ്ജല പ്രവാഹപാവിതസ്ഥലേ ഗളേവലംബ്യ ലംബിതാം ഭുജംകതുംഗമാലികാം. ഡമഡ്ഡമഡ്ഡമഡ്ഡമൻ പ്രവാഹതാം വിരിഞ്ചി ചകാര ചണ്ഡതാണ്ഡവം തനോതു നഃ ശിവ ശിവം.",
    lyricsTelugu: "జటాటవీగలజ్జల ప్రవాహపావితస్థలే గలేవలంబ్య లంబితాం భుజంగతుంగమాలికామ్. డమడ్డమడ్డమడ్డమన్నినాదవడ్డమర్వయం చకార చండతాండవం తనోతు నః శివః శివమ్."
  },
  {
    id: "lalitha_sahasranama",
    nameEn: "Sri Lalitha Sahasranamam",
    nameMl: "ശ്രീ ലളിതാ സഹസ്രനാമം",
    nameTe: "శ్రీ లలితా సహస్రనామము",
    url: "https://dn711109.ca.archive.org/0/items/LalithaSahasranamamFull/Lalitha%20Sahasranamam%20Full.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥ सरस्वती महाभागे विद्ये कमललोचने । विद्यारूपे विशालाक्षि विद्यां देहि नमोऽस्तु ते ॥",
    lyricsEnglish: "Om Bhur Bhuvah Svah, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat. Saraswati Mahabhage Vidye Kamalalochane, Vidyarupe Vishalakshi Vidyam Dehi Namostute.",
    lyricsMalayalam: "ഓം ഭൂർഭുവഃ സ്വഃ തത്സവിതുർവരേണ്യം ഭർഗോ ദേവസ്യ ധീമഹി ധിയോ യോ നഃ പ്രചോദയാത്. സരസ്വതീ മഹാഭാഗേ വിദ്യേ കമലലോചനേ വിദ്യാരൂപേ വിശാലാക്ഷി വിദ്യാം ദേഹി നമോസ്തുതേ.",
    lyricsTelugu: "ఓం భూర్భువః స్వః తత్సవితుర్వారేణ్యం భర్గో దేవాస్య ధీమహి ధియో యో నః ప్రచోదయాత్. సరస్వతీ మహాభాగే విద్యే కమలలోచనే విద్యారూపే విశాలాక్షి విద్యాం దేహి నమోస్తుతే."
  },
  {
    id: "subramanya_sahasranama",
    nameEn: "Sri Subramanya Sahasranamam",
    nameMl: "ശ്രീ സുബ്രഹ്മണ്യ സഹസ്രനാമം",
    nameTe: "శ్రీ సుబ్రహ్మణ్య సహస్రనామము",
    url: "https://dn721608.ca.archive.org/0/items/sri-subramanyabhujangamandsahasranamam/Sri%20Subramanya%20Bhujangam%20and%20Sahasranamam/006-Sri%20Subramanya%20Sahasranamam.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "षडाननं कुङ्कुमराघवर्णं महामतिं दिव्यमयूरवाहनम् । रुद्रस्यसूनुं सुरसङ्घनाथं गुहं सदाहं शरणं प्रपद्ये ॥",
    lyricsEnglish: "Shadananambhule kukumaragavarnam mahamatim divyamayuravahanam, Rudrasyasunum surasanghanatham guham sadaham sharanam prapadye.",
    lyricsMalayalam: "ഷഡാനനം കുങ്കുമരാഗവർണം മഹാമതിം ദിവ്യമയൂരവാഹനം. രുദ്രസ്യസൂനും സുരസംഘനാഥം ഗുഹം സദാഹം ശരണം പ്രപദ്യേ.",
    lyricsTelugu: "షడాననం కుంకుమరాగవర్ణం మహామతిం దివ్యమయూరవాహనమ్. రుద్రస్యసూనం సురసంఘనాథం గుహం సదాహం శరణం ప్రపద్యే."
  },
  {
    id: "ganesha_sahasranama",
    nameEn: "Sri Ganesha Sahasranamam",
    nameMl: "ശ്രീ ഗണേശ സഹസ്രനാമം",
    nameTe: "శ్రీ గణేశ సహస్రనామము",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/002-Sri%20Ganesa%20Sahasranamam.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि तन्नो दन्ती प्रचोदयात् ॥ सुमुखश्चैकदन्तश्च कपिलो गजकर्णकः । लम्बोदरश्च विकटो विघ्ननाशो विनायकः ॥",
    lyricsEnglish: "Om Ekadantaya Vidmahe Vakratundaya Dhimahi Tanno Danti Prachodayat. Sumukhashchaikantashcha kapilo gajakarnakah, Lambodarashcha vikato vighnanasho vinayakah.",
    lyricsMalayalam: "ഓം ഏകദന്തായ വിദ്മഹേ वക്രതുണ്ഡായ ധീമഹി തന്നോ ദന്തീ പ്രചോദയാത്. സരസ്വതീ മഹാഭാഗേ വിദ്യേ കമലലോചനേ പ്രോതാഹി വിഘ്നനാശോ വിനായകഃ.",
    lyricsTelugu: "ఓం ఏకదంతాయ విద్మహే వక్రతుండాయ ధీమహి తన్నో దంతీ ప్రచోదయాత్. సుముఖశ్చైకదంతశ్చ కపిలో గజకర్ణకః, లంబోదరశ్చ వికటో విఘ్ననాశో వినాయకః."
  },
  {
    id: "hanuman_chalisa",
    nameEn: "Sri Hanuman Chalisa",
    nameMl: "ശ്രീ ഹനുമാൻ ചാലീസ",
    nameTe: "శ్రీ హనుమాన్ చాలీసా",
    url: "https://dn710901.ca.archive.org/0/items/ShriHanumanChalisa_404/Shri-Hanuman-Chalisa.mp3",
    category: "songs",
    lyricsSanskrit: "श्री गुरु चरण सरोज रज निज मनु मुकुरु सुधारि । बरनऊ रघुबर बिमल जसु जो दायकु फल चारि ॥",
    lyricsEnglish: "shri guru charana saroja raja nija manu mukura sudhaari, baranau raghubara bimala jasu jo daayaku phala chaari.",
    lyricsMalayalam: "ശ്രീ ഗുരു ചരണ സരോജ രജ നിജ മനു മുകുരു സുധാരി, ബരണഊ രഘുബര ബിമല ജസു ജോ ദായക ഫല ചാരി.",
    lyricsTelugu: "శ్రీ గురు చరణ సరోజ రజ నిజ మను ముకుర సుధారి, బరనవూ రఘుబర బిమల జసు జో దాయక ఫల చారి."
  },
  {
    id: "bhaja_govindam",
    nameEn: "Bhaja Govindam",
    nameMl: "ഭജഗോവിന്ദം",
    nameTe: "భజ గోవిందం",
    url: "https://dn711103.ca.archive.org/0/items/BhajaGovindam_469/BhajaGovindam.mp3",
    category: "songs",
    lyricsSanskrit: "भज गोविन्दं भज गोविन्दं गोविन्दं भज मूढमते । संप्राप्ते सन्निहिते काले न हि न हि रक्षति डुकृञ्करणे ॥",
    lyricsEnglish: "bhaja govindam bhaja govindam govindam bhaja muudha-mate, sampraapte sannihite kaale na hi na hi rakshati dukrinkarane.",
    lyricsMalayalam: "ഭജ ഗോവിന്ദം ഭജ ഗോവിന്ദം ഗോവിന്ദം ഭജ മൂഢമതേ, സമ്പ്രാപ്തേ സന്നിഹിതേ കാലേ ന ഹി ന ഹി രക്ഷതി ഡുകൃഞ്കരണേ.",
    lyricsTelugu: "భజ గోవిందం భజ గోవిందం గోవిందం భజ మూఢమతే, సంప్రాప్తే సన్నిహితే కాలే న హి న హి రక్షతి డుకృఞ్కరణే."
  },
  {
    id: "govinda_namalu",
    nameEn: "Govinda Namalu",
    nameMl: "ഗോവിന്ദ നാമാവലി",
    nameTe: "గోవింద నామాలు",
    url: "https://dn710901.ca.archive.org/0/items/ISongs.info01GovindaNamalu/%5BiSongs.info%5D%2001%20-%20Govinda%20Namalu.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "श्री श्रीनिवास गोविंदा श्री वेंकटेश गोविंदा ॥ भक्तवत्सल गोविंदा भागवतप्रिय गोविंदा ॥",
    lyricsEnglish: "Shri Srinivasa Govinda Sri Venkatesa Govinda, Bhaktavatsala Govinda Bhagavatapriya Govinda.",
    lyricsMalayalam: "ശ്രീ ശ്രീനിവാസ ഗോവിന്ദാ ശ്രീ വെങ്കടേശ ഗോവിന്ദാ, ഭക്തവത്സല ഗോവിന്ദാ ഭാഗവതപ്രിയ ഗോവിന്ദാ.",
    lyricsTelugu: "శ్రీ శ్రీనివాస గోవిందా శ్రీ వెంకటేశ గోవిందా, భక్తవత్సల గోవిందా భాగవతప్రియ గోవిందా."
  },
  {
    id: "aarathi_sai_baba",
    nameEn: "Aarathi Sai Baba",
    nameMl: "ആരതി സായി ബാബ",
    nameTe: "హారతి సాయి బాబా",
    url: "https://dn710704.ca.archive.org/0/items/SaiBabaListenOnThursday/5-THURSDAY-SAI%20BABA/2-Aarathi%20SaiBaba.mp3",
    category: "shirdi",
    lyricsSanskrit: "आरती साईबाबा। सौख्यदातार जीव। चरणरजततळी। द्यावी विसावा भक्तजनां॥",
    lyricsEnglish: "Aarathi Sai Baba, giver of joy and peace. May we find shelter at your lotus feet.",
    lyricsMalayalam: "ആരതി സായി ബാബ, സന്തോഷവും സമാധാനവും നൽകുന്നവനെ. അങ്ങയുടെ താമരപ്പൂ പോലുള്ള പാദങ്ങളിൽ ഞങ്ങൾക്ക് അഭയം നൽകേണമേ.",
    lyricsTelugu: "హారతి సాయి బాబా, భక్తులకు సుఖసంతోషాలు చేకూర్చే దైవం. మీ పాద పద్మాల చెంత మాకు ప్రశాంతతను ప్రసాదించండి."
  },
  {
    id: "sai_suprabhatham",
    nameEn: "Suprabhatham",
    nameMl: "സുപ്രഭാതം",
    nameTe: "సుప్రభాతం",
    url: "https://ia801601.us.archive.org/19/items/SaiBabaListenOnThursday/5-THURSDAY-SAI%20BABA/1-Sri%20Satya%20Sai%20Suprabhatham.mp3",
    category: "shirdi",
    lyricsSanskrit: "ईशाय नमो परमात्मने नमो। सर्व मंगलाय नमो साईनाथाय नमो॥",
    lyricsEnglish: "Morning prayers to Sai Nath, welcoming the divine grace and cosmic energy.",
    lyricsMalayalam: "സായി നാഥനെ വന്ദിച്ചുകൊണ്ട് പ്രഭാത പ്രാർത്ഥനകൾ ആരംഭിക്കുന്നു, ദൈവീക കൃപയും ഊർജ്ജവും പ്രസാദിക്കട്ടെ.",
    lyricsTelugu: "సాయి నాథుని స్మరిస్తూ శుభోదయం, దైవిక అనుగ్రహం మరియు ప్రశాంతత అందరికీ కలుగుగాక."
  },
  {
    id: "sai_hey_pandu_ranga",
    nameEn: "Sri SaiBaba - Hey Pandu Ranga",
    nameMl: "ശ്രീ സായിബാബ - ഹേ പാണ്ഡുരംഗ",
    nameTe: "శ్రీ సాయిబాబా - హే పాండురంగ",
    url: "https://dn710704.ca.archive.org/0/items/SaiBabaListenOnThursday/5-THURSDAY-SAI%20BABA/3-Sri%20SaiBaba%20-%20Hey%20Pandu%20Ranga.mp3",
    category: "shirdi",
    lyricsSanskrit: "विठ्ठल हरी विठ्ठल पांडुरंग। साईनाथ महाराज की जय॥",
    lyricsEnglish: "Devotional song linking Sai Baba to the incarnation of Lord Panduranga Vitthala.",
    lyricsMalayalam: "സായി ബാബയെ പാണ്ഡുരംഗ വിഠലന്റെ അവതാരമായി വാഴ്ത്തുന്ന ഭക്തിഗാനം.",
    lyricsTelugu: "సాయిబాబాను సాక్షాత్ ఆ పాండురంగ విఠలుని రూపంగా కీర్తించే మధుర భక్తి గీతం."
  },
  {
    id: "sai_namam_talavagane",
    nameEn: "Sai Namam Talavagane Hayi yedo kaligene",
    nameMl: "സായി നാമം തലവഗനെ ഹായി യേതൊ കലിഗനെ",
    nameTe: "సాయి నామం తలవగానే హాయి ఏదో కలిగెనే",
    url: "https://ia801601.us.archive.org/19/items/SaiBabaListenOnThursday/5-THURSDAY-SAI%20BABA/4-Sai%20Namam%20Talavagane%20Hayi%20yedo%20kaligene.mp3",
    category: "shirdi",
    lyricsSanskrit: "साई नाम स्मरणमात्रेण परम शान्ति प्राप्यते॥",
    lyricsEnglish: "Just by thinking of the name of Sai, a profound peace and joy arises in the heart.",
    lyricsMalayalam: "സായിയുടെ നാമം സ്മരിക്കുമ്പോൾ തന്നെ ഹൃദയത്തിൽ അളവറ്റ ശാന്തിയും സന്തോഷവും അനുഭവപ്പെടുന്നു.",
    lyricsTelugu: "సాయి నామాన్ని తలచుకోగానే మనసుకు ఎంతో హాయి, ఏదో తెలియని అమితానందం కలుగుతుంది."
  }
];

export default function DevotionalPlayer({
  currentLanguage,
  locationDetails,
  isPlaying,
  setIsPlaying,
  activeTrackName,
  setActiveTrackName,
  activeTrackUrl,
  setActiveTrackUrl,
}: DevotionalPlayerProps) {
  // Mode selection: "muhurta" scale or "weekday" scale
  const [chantMode, setChantMode] = useState<"muhurta" | "weekday">("muhurta");
  const [currentLocalTime, setCurrentLocalTime] = useState<Date>(new Date());
  const [selectedThemeId, setSelectedThemeId] = useState<string>("shiva");
  const activeCategory = useMemo(() => {
    return MUHURTA_DEVOTIONAL_THEMES.find(t => t.id === selectedThemeId) || MUHURTA_DEVOTIONAL_THEMES[0];
  }, [selectedThemeId]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const isFirstMount = useRef(true);
  const autoplayBlockedRef = useRef<boolean>(false);
  
  // Loading and Error states for Streaming Vocal Chorus
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // YouTube legacy compatibility states
  const [activeYoutubeId, setActiveYoutubeId] = useState<string | null>(null);
  const [activeYoutubeTitle, setActiveYoutubeTitle] = useState<string>("");

  // Dynamic Audio configurations and Admin settings visibility flags
  const [audioConfig, setAudioConfig] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Fetch initial dynamic links configuration on mount
  useEffect(() => {
    fetch("/api/audio-config")
      .then(res => res.json())
      .then(data => {
        setAudioConfig(data);
      })
      .catch(err => {
        console.error("Failed to load custom audio config:", err);
      });
  }, []);

  const [selectedPlaylistTrack, setSelectedPlaylistTrack] = useState<PlaylistTrack | null>(null);
  const [activePlaylistTab, setActivePlaylistTab] = useState<"all" | "sahasranamam" | "mantra" | "stotram" | "suprabhatam" | "songs">("all");
  const [showAllAudio, setShowAllAudio] = useState<boolean>(false);

  const getDynamicAudioUrl = (catId: string, trackType: "sahasranama" | "keerthana" | "bhajana") => {
    if (audioConfig && audioConfig[catId] && audioConfig[catId][trackType]) {
      return audioConfig[catId][trackType];
    }
    return getCategoryAudioUrl(catId, trackType);
  };

  const getTrackUrl = (track: PlaylistTrack) => {
    if (track.id === "vishnu_sahasranama") {
      return getDynamicAudioUrl("vishnu", "sahasranama");
    }
    if (track.id === "shiva_sahasranama") {
      return getDynamicAudioUrl("shiva", "sahasranama");
    }
    if (track.id === "lalitha_sahasranama") {
      return getDynamicAudioUrl("lalitha", "sahasranama");
    }
    if (track.id === "subramanya_sahasranama") {
      return getDynamicAudioUrl("subramanya", "sahasranama");
    }
    if (track.id === "ganesha_sahasranama") {
      return getDynamicAudioUrl("ganesha", "sahasranama");
    }
    return track.url;
  };

  const playSacredTrack = (url: string, titleName: string) => {
    if (activeTrackUrl === url) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrackUrl(url);
      setActiveTrackName(titleName);
      setIsPlaying(true);
      setSelectedPlaylistTrack(null);
      setAudioSourceMode("stream");
    }
  };

  const playPlaylistTrack = (track: PlaylistTrack) => {
    const trackUrl = getTrackUrl(track);
    if (activeTrackUrl === trackUrl) {
      setIsPlaying(!isPlaying);
    } else {
      const titleName = currentLanguage === "ml" 
        ? track.nameMl 
        : currentLanguage === "te" 
          ? track.nameTe 
          : track.nameEn;
      setActiveTrackUrl(trackUrl);
      setActiveTrackName(titleName);
      setIsPlaying(true);
      setSelectedPlaylistTrack(track);
      setAudioSourceMode("stream");
    }
  };

  // Stotra subtitles & Subliminal Verse State
  const [selectedScript, setSelectedScript] = useState<'sanskrit' | 'english' | 'malayalam' | 'telugu'>(
    currentLanguage === "ml" ? "malayalam" : currentLanguage === "te" ? "telugu" : "sanskrit"
  );
  const [synthVerseOffset, setSynthVerseOffset] = useState<number>(0);

  // Sync script when language switches
  useEffect(() => {
    if (currentLanguage === "ml") {
      setSelectedScript("malayalam");
    } else if (currentLanguage === "te") {
      setSelectedScript("telugu");
    } else {
      setSelectedScript("sanskrit");
    }
  }, [currentLanguage]);

  // Audio elements references
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic Offline/Online Switcher State
  const [audioSourceMode, setAudioSourceMode] = useState<"stream" | "synth">("stream");

  // Rotate verses automatically for the offline synth
  useEffect(() => {
    if (audioSourceMode === "synth" && isPlaying) {
      const intervalId = setInterval(() => {
        setSynthVerseOffset((prev) => prev + 1);
      }, 7000); // Cycle every 7 seconds for continuous meditative vibe
      return () => clearInterval(intervalId);
    }
  }, [audioSourceMode, isPlaying]);

  // Web Audio Synthesizer Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    oscillators: OscillatorNode[];
    gains: GainNode[];
    biquadFilter: BiquadFilterNode | null;
    mainGain: GainNode | null;
  }>({ oscillators: [], gains: [], biquadFilter: null, mainGain: null });

  // Web Audio Synthesizer starts a lush, pure 432Hz string Tanpura drone offline!
  const startTanpuraSynth = () => {
    stopTanpuraSynth();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        console.warn("Web Audio API is not supported by this browser.");
        return;
      }

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Ensure the AudioContext is resumed (essential for bypass of browser autoplay policies)
      if (ctx.state === "suspended") {
        ctx.resume().catch(err => {
          console.warn("Vocal Sanctuary: initial AudioContext resume deferred:", err);
        });
      }

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(550, ctx.currentTime); // Extra warm, classical, organic resonance

      filter.connect(mainGain);
      mainGain.connect(ctx.destination);

      const targetFreq = activeCategory.baseFreq || 207.65;

      // Immersive Vedic Drone harmonics
      // Standard Tanpura voicing: PA (1.5x root), SA (2x root), SA (2x root), SA (root)
      const harmonics = [
        { mult: 0.5, type: "sawtooth" as OscillatorType, val: 0.16, detune: -1.2 }, // Octave below foundation
        { mult: 1.0, type: "triangle" as OscillatorType, val: 0.35, detune: 0 },    // Warm primary tonic
        { mult: 1.0, type: "sawtooth" as OscillatorType, val: 0.08, detune: 5.5 },  // Vibrating secondary octave
        { mult: 1.5, type: "triangle" as OscillatorType, val: 0.22, detune: -2.5 }, // Pure Fifth (Pa)
        { mult: 2.0, type: "sawtooth" as OscillatorType, val: 0.05, detune: 3.5 }   // Shimmering octave up
      ];

      const activeOscs: OscillatorNode[] = [];
      const gainsList: GainNode[] = [];

      harmonics.forEach((h) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = h.type;
        osc.frequency.setValueAtTime(targetFreq * h.mult, ctx.currentTime);
        osc.detune.setValueAtTime(h.detune, ctx.currentTime);

        oscGain.gain.setValueAtTime(h.val * 0.45, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start();

        activeOscs.push(osc);
        gainsList.push(oscGain);
      });

      // A very slow, graceful LFO to handle the swelling, biological Tanpura plucking rhythm/wave
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8-second breathing loop
      lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(mainGain.gain);
      lfo.start();
      activeOscs.push(lfo);

      // Smooth envelope fade-in to emulate organic classical transitions
      const targetVol = isMuted ? 0 : volume;
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(targetVol * 0.45, ctx.currentTime + 1.2);

      synthNodesRef.current = {
        oscillators: activeOscs,
        gains: gainsList,
        biquadFilter: filter,
        mainGain: mainGain
      };

    } catch (err) {
      console.warn("Vocal Sanctuary: offline synth failed to initialize:", err);
    }
  };

  const stopTanpuraSynth = () => {
    const { oscillators, gains, mainGain } = synthNodesRef.current;
    const ctxToClose = audioContextRef.current;

    if (mainGain && ctxToClose) {
      try {
        mainGain.gain.cancelScheduledValues(ctxToClose.currentTime);
        mainGain.gain.setValueAtTime(mainGain.gain.value, ctxToClose.currentTime);
        mainGain.gain.exponentialRampToValueAtTime(0.001, ctxToClose.currentTime + 0.25);
      } catch (e) {}
    }

    // Instantly clear the transient node refs and any matching context ref to prevent race conditions
    synthNodesRef.current = { oscillators: [], gains: [], biquadFilter: null, mainGain: null };
    if (audioContextRef.current === ctxToClose) {
      audioContextRef.current = null;
    }

    setTimeout(() => {
      oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
      gains.forEach(g => {
        try {
          g.disconnect();
        } catch (e) {}
      });
      if (mainGain) {
        try {
          mainGain.disconnect();
        } catch (e) {}
      }
      if (ctxToClose) {
        try {
          if (ctxToClose.state !== "closed") {
            ctxToClose.close().catch(() => {});
          }
        } catch (e) {}
      }
    }, 300);
  };

  // Split lyrics string into structured verses
  const verses = useMemo(() => {
    let lyricsField = "";
    if (selectedPlaylistTrack) {
      if (selectedScript === "sanskrit") lyricsField = selectedPlaylistTrack.lyricsSanskrit || "";
      else if (selectedScript === "english") lyricsField = selectedPlaylistTrack.lyricsEnglish || "";
      else if (selectedScript === "malayalam") lyricsField = selectedPlaylistTrack.lyricsMalayalam || "";
      else if (selectedScript === "telugu") lyricsField = selectedPlaylistTrack.lyricsTelugu || "";
    } else {
      if (selectedScript === "sanskrit") lyricsField = activeCategory.activeLyricsSanskrit || "";
      else if (selectedScript === "english") lyricsField = activeCategory.activeLyricsEnglish || "";
      else if (selectedScript === "malayalam") lyricsField = activeCategory.activeLyricsMalayalam || "";
      else if (selectedScript === "telugu") lyricsField = activeCategory.activeLyricsTelugu || "";
    }

    if (!lyricsField) return [];
    return lyricsField
      .split(/(?:[॥।\.]\s*)+/g)
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }, [activeCategory, selectedScript, selectedPlaylistTrack]);

  const activeVerseIndex = useMemo(() => {
    if (verses.length === 0) return 0;
    if (audioSourceMode === "stream") {
      const duration = audioDuration || 180;
      const pct = audioProgress / duration;
      const idx = Math.floor(pct * verses.length);
      return Math.min(Math.max(idx, 0), verses.length - 1);
    } else {
      return synthVerseOffset % verses.length;
    }
  }, [verses, audioSourceMode, audioProgress, audioDuration, synthVerseOffset]);

  const prevVerse = activeVerseIndex > 0 ? verses[activeVerseIndex - 1] : "";
  const currentVerse = verses[activeVerseIndex] || "";
  const nextVerse = activeVerseIndex < verses.length - 1 ? verses[activeVerseIndex + 1] : "";

  // Sync track detail when category changes
  useEffect(() => {
    const defaultName = activeCategory.title.split("&")[0].trim() + (currentLanguage === "ml" ? " പ്രധാന സ്തോത്രം" : currentLanguage === "te" ? " ప్రధాన స్తోత్రం" : " - Principal Chant");
    const customUrl = getDynamicAudioUrl(activeCategory.id, 'sahasranama');
    setActiveTrackUrl(customUrl);
    setActiveTrackName(defaultName);
    setSelectedPlaylistTrack(null);
    
    // Always start off paused - music plays only when user clicks play
    setIsPlaying(false);
    
    if (isFirstMount.current) {
      isFirstMount.current = false;
    }
    setAudioProgress(0);
    setAudioError(null);
  }, [activeCategory, audioConfig]);

  // Translate default track name when language switches
  useEffect(() => {
    if (!selectedPlaylistTrack) {
      const defaultName = activeCategory.title.split("&")[0].trim() + (currentLanguage === "ml" ? " പ്രധാന സ്തോത്രം" : currentLanguage === "te" ? " ప్రధాన స్తోత్రం" : " - Principal Chant");
      setActiveTrackName(defaultName);
    }
  }, [currentLanguage, activeCategory, selectedPlaylistTrack]);

  // Translate custom playlist track title on the fly when language switches
  useEffect(() => {
    if (selectedPlaylistTrack) {
      const titleName = currentLanguage === "ml" 
        ? selectedPlaylistTrack.nameMl 
        : currentLanguage === "te" 
          ? selectedPlaylistTrack.nameTe 
          : selectedPlaylistTrack.nameEn;
      setActiveTrackName(titleName);
    }
  }, [currentLanguage, selectedPlaylistTrack]);

  // Handle changed track (vocal stream URL change)
  useEffect(() => {
    if (audioSourceMode === "stream" && audioRef.current) {
      setAudioError(null);
      // Pause current
      audioRef.current.pause();
      // Reset progress
      setAudioProgress(0);
      // Explicitly load the new source
      audioRef.current.load();
      
      // If was previously playing, continue playing the new track
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn("Auto-playback for new track change aborted or deferred:", err);
            if (err.name === "NotAllowedError") {
              autoplayBlockedRef.current = true;
              setIsPlaying(false);
              const notAllowedMsg = currentLanguage === "ml"
                ? "സംഗീതം കേൾക്കാൻ പ്ലേ ബട്ടൺ അമർത്തുകയോ സ്ക്രീനിൽ എവിടെയെങ്കിലും തൊടുകയോ ചെയ്യുക"
                : currentLanguage === "te"
                  ? "సంగీతం వినడానికి ప్లే బటన్ నొక్కండి లేదా స్క్రీన్‌పై ఎక్కడైనా తాకండి"
                  : "Tap anywhere on the page to start music playback";
              setAudioError(notAllowedMsg);
            }
          });
        }
      }
    } else if (audioSourceMode === "synth" && isPlaying) {
      // Re-trigger the synthesizer to pick up the base frequency shift smoothly
      startTanpuraSynth();
    }
  }, [activeTrackUrl, audioSourceMode, activeCategory]);

  // Handle play/pause toggling on button press or mode change
  useEffect(() => {
    if (audioSourceMode === "synth") {
      if (isPlaying) {
        startTanpuraSynth();
      } else {
        stopTanpuraSynth();
      }
      
      // Ensure the background HTML5 audio element is silent
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      stopTanpuraSynth();

      if (audioRef.current) {
        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              if (err.name === "NotAllowedError") {
                console.warn("Audio playback promise rejected (expected until user interacts with the page):", err);
              } else {
                console.error("Audio playback promise rejected:", err);
              }
              if (err.name === "NotAllowedError") {
                autoplayBlockedRef.current = true;
                setIsPlaying(false);
                const notAllowedMsg = currentLanguage === "ml"
                  ? "സംഗീതം കേൾക്കാൻ പ്ലേ ബട്ടൺ അമർത്തുകയോ സ്ക്രീനിൽ എവിടെയെങ്കിലും തൊടുകയോ ചെയ്യുക"
                  : currentLanguage === "te"
                    ? "సంగీతం వినడానికి ప్లే బటన్ నొక్కండి లేదా స్క్రీన్‌పై ఎక్కడైనా తాకండి"
                    : "Tap anywhere on the page to start music playback";
                setAudioError(notAllowedMsg);
              } else if (err.name === "AbortError") {
                console.log("Playback aborted due to source swap/load.");
              } else {
                setAudioError("Streaming offline or blocked by corporate firewall.");
                setIsPlaying(false);
              }
            });
          }
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [isPlaying, audioSourceMode]);

  // Handle auto-recovery of play block when user interacts with the page
  useEffect(() => {
    const handleGesture = () => {
      // Resume the AudioContext if we are in synthesizer mode on user gesture
      if (audioSourceMode === "synth") {
        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume().then(() => {
            console.log("Vocal Sanctuary: AudioContext resumed by interactive window gesture.");
          }).catch(e => {});
        } else if (!audioContextRef.current && isPlaying) {
          startTanpuraSynth();
        }
      }
      if (autoplayBlockedRef.current) {
        autoplayBlockedRef.current = false;
        setIsPlaying(true);
      }
    };

    window.addEventListener("click", handleGesture);
    window.addEventListener("touchstart", handleGesture, { once: true });
    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
    };
  }, [audioSourceMode, isPlaying]);

  // Handle stream volume level and synthesizer volume level
  useEffect(() => {
    const targetVolume = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = targetVolume;
    }
    
    if (audioSourceMode === "synth" && synthNodesRef.current.mainGain && audioContextRef.current) {
      try {
        synthNodesRef.current.mainGain.gain.cancelScheduledValues(audioContextRef.current.currentTime);
        synthNodesRef.current.mainGain.gain.setValueAtTime(synthNodesRef.current.mainGain.gain.value, audioContextRef.current.currentTime);
        synthNodesRef.current.mainGain.gain.linearRampToValueAtTime(targetVolume * 0.45, audioContextRef.current.currentTime + 0.15);
      } catch (e) {}
    }
  }, [volume, isMuted, audioSourceMode]);

  // Clean up Web Audio synthesis on unmount
  useEffect(() => {
    return () => {
      stopTanpuraSynth();
    };
  }, []);

  // Dynamic multi-lingual label strings
  const translationStrings = {
    en: {
      heading: "Temple Acoustics & Devotional Soundscape",
      description: "Play spiritual Sahasranama, Keerthana, or Bhajanas matching your day's Gochara and active Muhurta alignment.",
      currentMuhutaTitle: "Active Dynamic Recommendation",
      becauseDay: "Based on Day of Week",
      becauseMuhurta: "Based on Active Muhurta",
      recomSahasra: "Sahasranama (Ancient Chant)",
      recomKeerthana: "Keerthana (Hymn of Praises)",
      recomBhajana: "Devotional Bhajana (Rhythm)",
      lyricsLabel: "Sacred Stotra Subtitles & Subliminal Verse",
      synthLabel: "Vedic 432Hz Tanpura Drone Synth",
      playbackTitle: "Vocal Stream Playback",
      deities: "Divine Deities:",
      muhurtas: "Governed Muhurtas:",
      playText: "Play Sacred Audio",
      pauseText: "Pause Audio",
      ttsText: "Recite Sacred Sloka",
      muteText: "Mute",
      unmuteText: "Unmute",
      autoLabel: "Dynamic recommendation mode active",
    },
    ml: {
      heading: "ക്ഷേത്ര സോപാന സംഗീതം & മന്ത്ര ജപം",
      description: "അതാത് ദിവസത്തെ ഗോചര ഗ്രഹനിലകൾക്കും ഇപ്പോഴത്തെ മുഹൂർത്തങ്ങൾക്കും അനുയോജ്യമായ സഹസ്രനാമം, കീർത്തനങ്ങൾ, ഭജനകൾ എന്നിവ ശ്രവിക്കുക.",
      currentMuhutaTitle: "മുഹൂർത്താനുസൃത ശുപാർശ",
      becauseDay: " Based on Day of Week",
      becauseMuhurta: "Based on Active Muhurta",
      recomSahasra: "സഹസ്രനാമം (അർച്ചന)",
      recomKeerthana: "കീർത്തനം (സംഗീതം)",
      recomBhajana: "ഭക്തിസാന്ദ്രമായ ഭജൻ",
      lyricsLabel: "മന്ത്ര വരികൾ (സംസ്കൃതം, മലയാളം)",
      synthLabel: "വേദ 432Hz തൻപുര സിന്തസൈസർ",
      playbackTitle: "മന്ത്ര ജപ സ്ട്രീം പ്ലേബാക്ക്",
      deities: "ദേവതകൾ:",
      muhurtas: "മുഹൂർത്തങ്ങൾ:",
      playText: "പ്ലേ ചെയ്യുക",
      pauseText: "താൽക്കാലികമായി നിർത്തുക",
      ttsText: "മന്ത്രോച്ചാരണം",
      muteText: "ശബ്ദം നിർത്തുക",
      unmuteText: "ശബ്ദം നൽകുക",
      autoLabel: "മുഹൂർത്താനുസൃത ഗതി സജീവം",
    },
    te: {
      heading: "దేవాలయ సోపాన సంగీతం & మంత్ర జపం",
      description: "ఆయా రోజు గోచార గ్రహ స్థితులకు మరియు ప్రకృత ముహూర్తములకు అనువైన సహస్రనామములు, కీర్తనలు, మరియు bhajanలను ఆలకించండి.",
      currentMuhutaTitle: "ముహూర్త ప్రాధాన్యత సిఫార్సు",
      becauseDay: "వారము ఆధారంగా",
      becauseMuhurta: "ప్రస్తుత ముహూర్తము ఆధారంగా",
      recomSahasra: "సహస్రనామము (అర్చన)",
      recomKeerthana: "కీర్తన (ఆరాధన)",
      recomBhajana: "భక్తి సంకీర్తన",
      lyricsLabel: "మంత్ర అక్షరాలు & ఉపశీర్షికలు",
      synthLabel: "వేద 432Hz తంబుర డ్రోన్ సింథసైజర్",
      playbackTitle: "మంత్ర జప సంచాలనము",
      deities: "దేవతలు:",
      muhurtas: "ముహూర్తాలు:",
      playText: "ప్లే చేయండి",
      pauseText: "తాత్కాలికంగా నిలిపివేయండి",
      ttsText: "మంత్రోచ్ఛారణ",
      muteText: "శబ్దం నిలిపివేయండి",
      unmuteText: "శబ్దం పునరుద్ధరించండి",
      autoLabel: "డైనమిక్ సిఫార్సు మోడ్ సక్రియంగా ఉంది",
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLocalTime(new Date());
    }, 20000); // 20-sec intervals is plenty for Muhurta updates
    return () => clearInterval(interval);
  }, []);

  // Compute the current active Muhurta index dynamically
  const activeMuhurtaData = useMemo(() => {
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
      const localTimeMs = currentLocalTime.getTime() + offsetHours * 3600000;
      const localDate = new Date(localTimeMs);
      return localDate.getUTCHours() * 60 + localDate.getUTCMinutes();
    })();

    const isMuhurtaActive = (idx: number) => {
      const { start, end } = getMuhurtaTimeRange(idx);
      const adjusted = currentMinsLocal < parsedSunrise ? currentMinsLocal + 1440 : currentMinsLocal;
      return adjusted >= start && adjusted < end;
    };

    const activeObj = MUHURTAS_LIST.find((m) => isMuhurtaActive(m.index));
    return activeObj || MUHURTAS_LIST[2]; // Default to Mitra (#3) if not found
  }, [currentLocalTime, locationDetails]);

  // Compute what Devotional Category corresponds to this active Muhurta
  const computedTheme = useMemo(() => {
    const idx = activeMuhurtaData.index;
    
    // 1. Shiva & Fierce
    if ([1, 16, 17, 11, 22].includes(idx)) {
      return MUHURTA_DEVOTIONAL_THEMES[1];
    }
    // 2. Vishnu & Protection
    if ([6, 18, 27, 8].includes(idx)) {
      return MUHURTA_DEVOTIONAL_THEMES[0];
    }
    // 3. Lalitha & Abundance
    if ([5, 7, 13, 19, 20, 25, 30].includes(idx)) {
      return MUHURTA_DEVOTIONAL_THEMES[2];
    }
    // 4. Subramanya & Karmic
    if ([2, 4, 9, 10, 12, 14, 15, 21].includes(idx)) {
      return MUHURTA_DEVOTIONAL_THEMES[3];
    }
    // 5. Ganesha & Wisdom
    return MUHURTA_DEVOTIONAL_THEMES[4];
  }, [activeMuhurtaData]);

  // Daily weekday theme info computed dynamically
  const currentWeekdayInfo = useMemo(() => {
    const day = currentLocalTime.getDay(); // 0 is Sun, 1 is Mon, etc.
    return WEEKDAY_DEVOTIONAL_INFO[day];
  }, [currentLocalTime]);

  // Re-synchronize recommended theme when active Muhurta shifts and user is on "Auto recommendation mode"
  useEffect(() => {
    if (chantMode === "muhurta") {
      setSelectedThemeId(computedTheme.id);
    } else {
      // Find matching theme corresponding to weekday god
      const day = currentLocalTime.getDay();
      if (day === 1) setSelectedThemeId("shiva"); // Monday Shiva
      else if (day === 3) setSelectedThemeId("vishnu"); // Wednesday Vishnu
      else if (day === 4) setSelectedThemeId("ganesha"); // Thursday Ganesha
      else if (day === 5) setSelectedThemeId("lalitha"); // Friday Lalitha
      else if (day === 0) setSelectedThemeId("ganesha"); // Sunday Ganesha / Sun
      else if (day === 2) setSelectedThemeId("subramanya"); // Tuesday Subramanya
      else setSelectedThemeId("shiva"); // Saturday Shiva
    }
  }, [computedTheme, currentWeekdayInfo, chantMode]);

  const text = (translationStrings[currentLanguage] || translationStrings.en) as any;

  return (
    <div className="bg-[#FCF8F2] border border-[#E9DFCE] rounded-2xl md:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col gap-4 sm:gap-5">
      
      {/* Gilded Header & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4C3A3]/45 pb-4">
        <div>
          <h2 className="text-[16px] font-serif font-bold text-[#5D4037] flex items-center gap-2">
            <Compass className="h-5 w-5 text-amber-600 animate-spin" style={{ animationDuration: '40s' }} />
            <span>{text.heading}</span>
          </h2>
          <p className="text-[13px] text-stone-600 mt-1 leading-relaxed max-w-3xl">
            {text.description}
          </p>
        </div>

        {/* Global Track Customization Tabs (Manual Theme Select vs Auto Gochara recomm) */}
        <div className="flex items-center gap-2 self-start shrink-0">
          <div className="flex gap-1 bg-[#F1E5D5] p-1 rounded-xl border border-[#D4C3A3]/30">
            <button
              onClick={() => setChantMode("muhurta")}
              className={"px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer " + (
                chantMode === "muhurta" 
                  ? "bg-amber-600 text-white shadow-2xs" 
                  : "text-stone-600 hover:text-[#5D4037]"
              )}
            >
              <Sparkles className="h-3 w-3" />
              <span>{currentLanguage === "ml" ? "മുഹൂർത്ത ഗതി" : currentLanguage === "te" ? "ముహూర్త గతి" : "Muhurta"}</span>
            </button>
            
            <button
              onClick={() => setChantMode("weekday")}
              className={"px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer " + (
                chantMode === "weekday" 
                  ? "bg-amber-600 text-white shadow-2xs" 
                  : "text-stone-600 hover:text-[#5D4037]"
              )}
            >
              <Compass className="h-3 w-3" />
              <span>{currentLanguage === "ml" ? "ആഴ്ചവഴി" : currentLanguage === "te" ? "వారము" : "Weekday"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendation Panel */}
      <div className="p-4 bg-[#FAF2E1] rounded-2xl border border-[#D4C3A3] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-current animate-pulse" />
            <h3 className="text-[10px] font-bold font-serif uppercase tracking-widest text-[#5D4037]">
              {text.currentMuhutaTitle}
            </h3>
          </div>
          <p className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full">
            {chantMode === "muhurta" 
              ? (text.becauseMuhurta || "Based on Active Muhurta") + ": #" + activeMuhurtaData.index + " " + (
                  currentLanguage === "ml" 
                    ? activeMuhurtaData.nameMalayalam 
                    : currentLanguage === "te" 
                      ? activeMuhurtaData.nameTelugu 
                      : activeMuhurtaData.nameEnglish
                ) + " (" + activeMuhurtaData.nameSanskrit + ")" 
              : (text.becauseDay || "Based on Day of Week") + ": " + currentWeekdayInfo.dayName + " (" + currentWeekdayInfo.deity + ")"
            }
          </p>
        </div>

        {/* Recommended Track Options (Now plays automatically on hit) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
                type="button"
                onClick={() => playSacredTrack(getDynamicAudioUrl(activeCategory.id, 'sahasranama'), activeCategory.recommendedSahasranama)}
                className={"w-full text-left flex items-center justify-between gap-1.5 font-sans p-1.5 rounded-lg transition hover:bg-amber-50/50 group border " + (
                  activeTrackUrl === getDynamicAudioUrl(activeCategory.id, 'sahasranama')
                    ? "bg-amber-50/40 border-amber-300" 
                    : "border-transparent"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Award className="h-3.5 w-3.5 text-[#C29200] shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-[#8D6E63] block text-[9px] leading-tight">{text.recomSahasra}</span>
                    <span className="text-stone-700 text-[10.5px] font-medium block truncate leading-none mt-0.5 group-hover:text-amber-800 transition">{activeCategory.recommendedSahasranama}</span>
                  </div>
                </div>
                <div className={"shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition " + (activeTrackUrl === getDynamicAudioUrl(activeCategory.id, 'sahasranama') ? "bg-amber-600 text-white shadow-3xs" : "bg-red-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white")}>
                  {activeTrackUrl === getDynamicAudioUrl(activeCategory.id, 'sahasranama') && isPlaying ? (
                    <Pause className="h-2.5 w-2.5 text-white animate-pulse" />
                  ) : (
                    <Play className="h-2.5 w-2.5 fill-current" />
                  )}
                </div>
              </button>

<button
                type="button"
                onClick={() => playSacredTrack(getDynamicAudioUrl(activeCategory.id, 'keerthana'), activeCategory.recommendedKeerthana)}
                className={`w-full text-left flex items-center justify-between gap-1.5 font-sans p-1.5 rounded-lg transition hover:bg-amber-50/50 group border ${
                  activeTrackUrl === getDynamicAudioUrl(activeCategory.id, 'keerthana') 
                    ? "bg-amber-50/40 border-amber-300" 
                    : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Disc className="h-3.5 w-3.5 text-[#C29200] shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-[#8D6E63] block text-[9px] leading-tight">{text.recomKeerthana}</span>
                    <span className="text-stone-700 text-[10.5px] font-semibold block truncate leading-none mt-0.5 group-hover:text-amber-800 transition">{activeCategory.recommendedKeerthana}</span>
                  </div>
                </div>
                <div className={`shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition ${activeTrackUrl === getDynamicAudioUrl(activeCategory.id, 'keerthana') ? "bg-amber-600 text-white shadow-3xs" : "bg-red-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"}`}>
                  {activeTrackUrl === getDynamicAudioUrl(activeCategory.id, 'keerthana') && isPlaying ? (
                    <Pause className="h-2.5 w-2.5 text-white animate-pulse" />
                  ) : (
                    <Play className="h-2.5 w-2.5 fill-current" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => playSacredTrack(getDynamicAudioUrl(activeCategory.id, 'bhajana'), activeCategory.recommendedBhajana)}
                className={`w-full text-left flex items-center justify-between gap-1.5 font-sans p-1.5 rounded-lg transition hover:bg-amber-50/50 group border ${
                  activeTrackUrl === getDynamicAudioUrl(activeCategory.id, 'bhajana') 
                    ? "bg-amber-50/40 border-amber-300" 
                    : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-[#8D6E63] block text-[9px] leading-tight">{text.recomBhajana}</span>
                    <span className="text-stone-700 text-[10.5px] font-semibold block truncate leading-none mt-0.5 group-hover:text-amber-800 transition">{activeCategory.recommendedBhajana}</span>
                  </div>
                </div>
                <div className={`shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition ${activeTrackUrl === getDynamicAudioUrl(activeCategory.id, 'bhajana') ? "bg-amber-600 text-white shadow-3xs" : "bg-red-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"}`}>
                  {activeTrackUrl === getDynamicAudioUrl(activeCategory.id, 'bhajana') && isPlaying ? (
                    <Pause className="h-2.5 w-2.5 text-white animate-pulse" />
                  ) : (
                    <Play className="h-2.5 w-2.5 fill-current" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Authentic Archival Devotional Treasury Playlist */}
          <div className="p-4 bg-gradient-to-br from-[#FAF5EC] to-[#FAF2E1] rounded-2xl border border-[#D4C3A3] flex flex-col gap-3 shadow-2xs" id="archival_devotional_playlist_card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#D4C3A3]/40 pb-3" id="playlist_header_row">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 flex items-center justify-center bg-[#5D4037] text-white rounded-xl shadow-xs shrink-0 border border-amber-500/20">
                  <Disc className="h-4 w-4 text-[#FFD54F]" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold font-serif uppercase tracking-widest text-[#5D4037]">
                    {currentLanguage === "ml"
                      ? "വൈദിക ഭക്തി ഭണ്ഡാരം"
                      : currentLanguage === "te"
                        ? "వైదిక భక్తి భాండాగారం"
                        : "Archival Devotional Treasury"}
                  </h3>
                  <p className="text-[9.5px] font-sans font-medium text-[#8D6E63] mt-0.5">
                    {currentLanguage === "ml"
                      ? "പരമ്പരാഗത വൈദിക മന്ത്രങ്ങൾ, സ്തോത്രങ്ങൾ, തിരുപ്പതി ഭക്തിഗാനങ്ങൾ എന്നിവയിൽ നിന്നും തിരഞ്ഞെടുത്ത് കേൾക്കുക"
                      : currentLanguage === "te"
                        ? "సంప్రదాయబద్ధ వైదిక మంత్రాలు, స్తోత్రాలు, మరియు తిరుపతి భక్తి గీతాల నుండి ఎంచుకుని ఆలకించండి"
                        : "Curated collection of traditional Vedic Mantras, Stotrams, and Tirupati devotions"}
                  </p>
                </div>
              </div>

              {/* Tab Selectors */}
              {showAllAudio && (
                <div className="flex flex-wrap gap-1 bg-[#F1E5D5]/80 p-0.5 rounded-lg border border-[#D4C3A3]/20 self-start md:self-auto shadow-inner">
                  {(["all", "sahasranamam", "mantra", "stotram", "suprabhatam", "songs", "shirdi"] as const).map((tab) => {
                    const label = tab === "all"
                      ? (currentLanguage === "ml" ? "എല്ലാം" : currentLanguage === "te" ? "అన్నీ" : "All Chants")
                      : tab === "sahasranamam"
                        ? (currentLanguage === "ml" ? "സഹസ്രനാമം" : currentLanguage === "te" ? "సహస్రనామము" : "Sahasranamam")
                        : tab === "mantra"
                          ? (currentLanguage === "ml" ? "മന്ത്രങ്ങൾ" : currentLanguage === "te" ? "మంత్రాలు" : "Mantras")
                          : tab === "stotram"
                            ? (currentLanguage === "ml" ? "സ്തോത്രങ്ങൾ" : currentLanguage === "te" ? "స్తోత్రాలు" : "Stotrams")
                             : tab === "songs"
                               ? (currentLanguage === "ml" ? "ഭക്തിഗാനങ്ങൾ" : currentLanguage === "te" ? "భక్తి గీతాలు" : "Devotional Songs")
                             : tab === "shirdi"
                               ? (currentLanguage === "ml" ? "ഷിർദ്ദി" : currentLanguage === "te" ? "షిరిడి" : "Shirdi")
                            : (currentLanguage === "ml" ? "തിരുപ്പതി" : currentLanguage === "te" ? "తిరుపతి" : "Tirupati");
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActivePlaylistTab(tab)}
                        className={`px-3 py-1 rounded-md text-[9.5px] font-bold transition-all cursor-pointer ${
                          activePlaylistTab === tab
                            ? "bg-amber-600 text-white shadow-2xs scale-102"
                            : "text-[#5D4037] hover:bg-white/40 hover:text-amber-800"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* View all Audio Toggle Button */}
            <div className="flex justify-center my-1" id="btn_toggle_playlist_container">
              <button
                type="button"
                onClick={() => setShowAllAudio(prev => !prev)}
                className="flex items-center gap-1.5 px-6 py-2 rounded-full border border-[#D4C3A3] bg-[#FCF3E3] text-[#5D4037] hover:bg-[#5D4037] hover:text-[#FCF3E3] transition-all duration-200 font-serif font-bold text-xs shadow-xs"
                id="btn_toggle_playlist_list"
              >
                <Disc className="h-3.5 w-3.5" />
                {showAllAudio ? (
                  currentLanguage === "ml"
                    ? "സംഗീതം മറച്ചുവെക്കുക"
                    : currentLanguage === "te"
                      ? "సంగీతం దాచండి"
                      : "Hide all Music"
                ) : (
                  currentLanguage === "ml"
                    ? "എല്ലാ സംഗീതവും കാണുക"
                    : currentLanguage === "te"
                      ? "అన్ని సంగీతములను చూడండి"
                      : "View all Music"
                )}
              </button>
            </div>

            {/* Playlist Grid */}
            {showAllAudio && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
              {SACRED_TREASURY_PLAYLIST.filter(track => activePlaylistTab === "all" || track.category === activePlaylistTab).map((track) => {
                const isSelected = activeTrackUrl === getTrackUrl(track);
                const displayName = currentLanguage === "ml"
                  ? track.nameMl
                  : currentLanguage === "te"
                    ? track.nameTe
                    : track.nameEn;
                const categoryLabel = track.category === "shirdi"
                  ? (currentLanguage === "ml" ? "ഷിർദ്ദി ഭക്തിഗാനം" : currentLanguage === "te" ? "షిరిడి భక్తి గీతం" : "Shirdi Devotion")
                  : track.category === "songs"
                  ? (currentLanguage === "ml" ? "ഭക്തിഗാനം" : currentLanguage === "te" ? "భక్తి గీతం" : "Devotional Song")
                  : track.category === "mantra"
                  ? (currentLanguage === "ml" ? "മന്ത്രം" : currentLanguage === "te" ? "మంత్రం" : "Mantra")
                  : track.category === "stotram"
                    ? (currentLanguage === "ml" ? "സ്തോത്രം" : currentLanguage === "te" ? "స్తోత్రం" : "Stotram")
                    : (currentLanguage === "ml" ? "തിരുപ്പതി" : currentLanguage === "te" ? "తిరుపతి" : "Tirupati");

                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => playPlaylistTrack(track)}
                    className={`w-full text-left flex items-center justify-between gap-2 p-2 rounded-xl transition border group cursor-pointer ${
                      isSelected
                        ? "bg-[#FEF7EB] border-amber-400 shadow-3xs"
                        : "bg-white/70 border-[#D4C3A3]/40 hover:border-amber-400/60 hover:bg-[#FAF4E9]"
                    }`}
                    title={displayName}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-amber-100 text-amber-700" : "bg-[#F3Ebe0] text-stone-600 group-hover:bg-amber-50 group-hover:text-amber-600"
                      }`}>
                        {track.category === "mantra" ? (
                          <Sparkles className="h-3.5 w-3.5" />
                        ) : track.category === "sahasranamam" ? (
                          <Compass className="h-3.5 w-3.5" />
                        ) : track.category === "stotram" ? (
                          <Disc className="h-3.5 w-3.5" />
                        ) : track.category === "songs" ? (
                          <Music className="h-3.5 w-3.5" />
                        ) : track.category === "shirdi" ? (
                          <Sparkles className="h-3.5 w-3.5" />
                        ) : (
                          <Sun className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10.5px] font-semibold text-stone-800 block truncate group-hover:text-amber-800 transition">
                          {displayName}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider font-bold text-[#8D6E63] mt-0.5 block leading-none">
                          {categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Action indicator */}
                    <div className={`shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition ${
                      isSelected ? "bg-amber-600 text-white shadow-3xs" : "bg-[#FAF4E9] text-amber-700 group-hover:bg-amber-600 group-hover:text-white"
                    }`}>
                      {isSelected && isPlaying ? (
                        <Pause className="h-2.5 w-2.5 text-white animate-pulse" />
                      ) : (
                        <Play className="h-2.5 w-2.5 fill-current" />
                      )}
                    </div>
                  </button>
                );
              })}
              </div>
            )}
          </div>

          {/* Centered Layout for Devotional Player & Audio Controls */}
          <div className="flex flex-col gap-5 mt-1" id="centered_devotional_layout">

            {/* Auditory Stream Control & procedural tanpura */}
            <div className="flex flex-col gap-4" id="auditory_controls_section">

              {/* Modern HTML5 Audio Tag (Unified/Global Stream) */}
              <audio
            ref={audioRef}
            src={activeTrackUrl}
            preload="auto"
            onTimeUpdate={() => {
              if (audioRef.current) {
                setAudioProgress(audioRef.current.currentTime);
              }
            }}
            onDurationChange={() => {
              if (audioRef.current) {
                setAudioDuration(audioRef.current.duration || 180);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              setAudioProgress(0);
            }}
            onLoadStart={() => {
              setIsAudioLoading(true);
              setAudioError(null);
            }}
            onCanPlay={() => {
              setIsAudioLoading(false);
              setAudioError(null);
            }}
            onWaiting={() => {
              setIsAudioLoading(true);
            }}
            onPlaying={() => {
              setIsAudioLoading(false);
              setAudioError(null);
            }}
            onError={() => {
              setIsAudioLoading(false);
              const hostNodeError = audioRef.current?.error;
              console.warn("Sacred audio file stream state warning:", hostNodeError);
              if (hostNodeError && hostNodeError.code !== 1) {
                setAudioError("Sacred audio is temporarily offline or loading slowly.");
              }
            }}
          />

          {/* Gilded Vedic Audio Sanctuary Card */}
          <div className="bg-gradient-to-br from-[#FEF9F1] to-[#FAF2E1] p-4.5 rounded-3xl border border-[#D4C3A3] shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  {isPlaying ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-400"></span>
                  )}
                </span>
                <span className="text-[10px] font-bold text-[#835C3B] font-serif uppercase tracking-widest leading-none">
                  {currentLanguage === "ml" ? "വൈദിക സ്വര സംഗീതാലയം" : currentLanguage === "te" ? "వైదిక స్వర సంకీర్తనాలయం" : "Vedic Vocal Sanctuary"}
                </span>
              </div>
              <span className="text-[8.5px] font-bold font-mono tracking-wider text-amber-800 bg-amber-100/50 px-2.5 py-0.5 rounded-full border border-[#D4C3A3]/25">
                {audioSourceMode === "synth" ? "100% OFFLINE SYNTH" : "100% LIVE STREAM"}
              </span>
            </div>

            {/* Switcher Tabs to toggle between Online Streaming & Offline Synthesizer */}
            <div className="grid grid-cols-2 bg-[#F1E5D5]/80 p-0.5 rounded-xl border border-[#D4C3A3]/30">
              <button
                type="button"
                onClick={() => {
                  setAudioSourceMode("stream");
                  setAudioError(null);
                }}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  audioSourceMode === "stream"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-[#5D4037] hover:bg-[#FAF2E1]/60"
                }`}
              >
                <Music className="h-3 w-3" />
                <span>
                  {currentLanguage === "ml" ? "വോക്കൽ സ്ട്രീം" : currentLanguage === "te" ? "కీర్తనల ప్రసారం" : "Vocal Stream"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAudioSourceMode("synth");
                  setAudioError(null);
                  if (isPlaying) {
                    if (audioContextRef.current) {
                      if (audioContextRef.current.state === "suspended") {
                        audioContextRef.current.resume().catch(() => {});
                      }
                    } else {
                      startTanpuraSynth();
                    }
                  }
                }}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  audioSourceMode === "synth"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-[#5D4037] hover:bg-[#FAF2E1]/60"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>
                  {currentLanguage === "ml" ? "തൻപുര ശ്രുതി" : currentLanguage === "te" ? "తన్పురా శ్రుతి" : "Tanpura Drone"}
                </span>
              </button>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-[#D4C3A3]/25 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-amber-700 bg-amber-50/50 border border-amber-200/40 flex items-center justify-center shrink-0 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: '6s' }}>
                  {audioSourceMode === "synth" ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Music className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-mono leading-none tracking-wider uppercase font-extrabold text-[#8D6E63]">
                    {audioSourceMode === "synth"
                      ? (currentLanguage === "ml" ? "തൻപുര ശ്രുതി സജീവം" : currentLanguage === "te" ? "తన్పురా శ్రుతి సజీవం" : "OFFLINE TANPURA SOUND")
                      : (currentLanguage === "ml" ? "ഇപ്പോൾ കേൾക്കുന്നത്" : currentLanguage === "te" ? "ప్రస్తుతం ఆలకిస్తున్నారు" : "ACTIVE VEDA CHANT")
                    }
                  </p>
                  <h4 className="text-[10px] font-bold text-[#5D4037] font-sans truncate mt-1">
                    {audioSourceMode === "synth"
                      ? `${activeCategory.title} (${activeCategory.droneScale} Pitch @ 432Hz)`
                      : activeTrackName
                    }
                  </h4>
                  <p className="text-[9.5px] text-stone-500 truncate mt-0.5">
                    {audioSourceMode === "synth"
                      ? (currentLanguage === "ml" ? "തത്സമയം തൻപുര സ്വരം സിന്തസൈസ് ചെയ്യുന്നു." : currentLanguage === "te" ? "శ్రుతి పెట్టి అద్భుతమైన ధ్యానధ్వని సృష్టిస్తుంది." : "Procedural real-time sound synthesis.")
                      : selectedPlaylistTrack
                        ? (currentLanguage === "ml"
                          ? `ആർക്കൈവൽ ഭക്തി ശേഖരം • ${selectedPlaylistTrack.category.toUpperCase()}`
                          : currentLanguage === "te"
                            ? `ఆర్కైవల్ భక్తి సేకరణ • ${selectedPlaylistTrack.category.toUpperCase()}`
                            : `Archival Devotional Collection • ${selectedPlaylistTrack.category.toUpperCase()}`)
                        : `Associated deity: ${activeCategory.associatedDeities.split(",")[0]}`
                    }
                  </p>
                </div>
              </div>

              {/* Progress Slider or Active Synth Indicator */}
              {audioSourceMode === "stream" ? (
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={audioDuration || 180}
                    value={audioProgress}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setAudioProgress(val);
                      if (audioRef.current) {
                        audioRef.current.currentTime = val;
                      }
                    }}
                    className="w-full h-1 bg-amber-100/60 rounded-lg accent-amber-600 appearance-auto cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono font-bold text-[#8D6E63]">
                    <span>{formatAudioTime(audioProgress)}</span>
                    <span>{formatAudioTime(audioDuration || 180)}</span>
                  </div>
                </div>
              ) : (
                <div className="py-2.5 px-3 rounded-xl bg-amber-50/50 border border-amber-200/20 text-center animate-pulse">
                  <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-semibold text-amber-800 font-sans tracking-wide">
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                    </span>
                    <span>{activeCategory.droneScale} Scale Continuous Drone</span>
                  </div>
                  <p className="text-[9px] text-[#8D6E63] mt-0.5 font-medium">
                    {currentLanguage === "ml"
                      ? "ഇന്റർനെറ്റ് കണക്ഷൻ ആവശ്യമില്ല. തത്സമയം വിരൽ തൊടാതെ നിർത്താതെ കേൾക്കാം."
                      : currentLanguage === "te"
                        ? "నెట్వర్క్ అవసరం లేదు. నిరంతర ఆడియో ప్రసారం."
                        : "Zero data usage. Pure continuous meditative acoustic resonance."
                    }
                  </p>
                </div>
              )}

              {isAudioLoading && audioSourceMode === "stream" && (
                <div className="text-[9px] font-semibold text-amber-700 flex items-center justify-center gap-1.5 animate-pulse bg-amber-50/45 py-1.5 rounded-lg border border-amber-100/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping"></span>
                  <span>{currentLanguage === "ml" ? "സ്ട്രീം ലോഡ് ചെയ്യുന്നു..." : currentLanguage === "te" ? "ప్రసారం లోడ్ అవుతోంది..." : "Loading high-fidelity audio stream..."}</span>
                </div>
              )}

              {audioError && audioSourceMode === "stream" && (
                <div className="text-[9.5px] font-bold text-red-700 bg-red-50/80 px-2.5 py-2 rounded-xl border border-red-200/40 flex flex-col gap-1.5">
                  <span>{audioError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioSourceMode("synth");
                      setAudioError(null);
                      setIsPlaying(true);
                    }}
                    className="self-start text-[9.5px] text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{currentLanguage === "ml" ? "തൻപുര ശ്രുതി പ്ലേ ചെയ്യുക" : currentLanguage === "te" ? "తన్పురా శ్రుతి ప్లే చేయు" : "Play Tanpura Synth Fallback"}</span>
                  </button>
                </div>
              )}

              {/* Sacred Stotra Subtitles & Subliminal Verse ("Minor Scale, inside the box") */}
              <div className="pt-2 border-t border-[#D4C3A3]/20 flex flex-col gap-2 scale-100" id="stotra_lyrics_box">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500 animate-pulse shrink-0" />
                    <span className="text-[9px] font-bold tracking-wider uppercase text-[#8D6E63] font-mono">
                      {currentLanguage === "ml" ? "സ്തോത്ര ഉപ ശീർഷകങ്ങൾ" : currentLanguage === "te" ? "స్తోత్ర ఉప శీర్షికలు" : "Sacred Stotra Subtitles"}
                    </span>
                  </div>
                  
                  {/* Micro Script Selector */}
                  <div className="flex gap-1 bg-[#F5ECE2]/75 p-0.5 rounded-lg border border-[#D4C3A3]/20">
                    {(["sanskrit", "english", "malayalam", "telugu"] as const).map((scr) => (
                      <button
                        key={scr}
                        type="button"
                        onClick={() => setSelectedScript(scr)}
                        className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold tracking-tight uppercase transition-all duration-200 cursor-pointer ${
                          selectedScript === scr
                            ? "bg-amber-600 text-white shadow-2xs"
                            : "text-[#8D6E63] hover:text-[#5D4037] hover:bg-white/30"
                        }`}
                      >
                        {scr === "sanskrit" && "Skt"}
                        {scr === "english" && "Eng"}
                        {scr === "malayalam" && "Mal"}
                        {scr === "telugu" && "Tel"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtitle Scrolling viewport */}
                <div className="bg-[#FAF6EE] border border-[#D4C3A3]/30 p-2 rounded-xl text-center flex flex-col justify-center min-h-[70px] relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-1 left-2.5 flex items-center gap-1 select-none">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[7.5px] font-mono tracking-widest text-[#8D6E63]/75 uppercase">
                      {audioSourceMode === "synth" ? "Subliminal Drone Logic" : "Live Stream Sync"}
                    </span>
                  </div>

                  {/* Preceding (Subliminal ghost line) */}
                  {prevVerse ? (
                    <p className="text-[11px] text-[#8D6E63]/40 px-2 truncate leading-none transition-all duration-500 mt-1.5 select-none italic font-serif">
                      {prevVerse}
                    </p>
                  ) : (
                    <div className="h-2" />
                  )}

                  {/* Active Main Subtitle line */}
                  <p className="text-[13px] font-bold text-[#5D4037] font-serif leading-snug px-3 py-1 transition-all duration-500 scale-102 mt-0.5 flex items-center justify-center gap-1.5 select-all drop-shadow-2xs">
                    <span className="leading-tight text-center break-words max-w-full">
                      {currentVerse || (currentLanguage === "ml" ? "വിശുദ്ധ മന്ത്രോച്ചാരണങ്ങൾ..." : currentLanguage === "te" ? "దివ్యమైన స్తోత్ర పఠనం..." : "Chanting Sacred Stotras...")}
                    </span>
                  </p>

                  {/* Next (Subliminal ghost line) */}
                  {nextVerse ? (
                    <p className="text-[11px] text-[#8D6E63]/40 px-2 truncate leading-none transition-all duration-500 select-none italic font-serif">
                      {nextVerse}
                    </p>
                  ) : (
                    <div className="h-2" />
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#D4C3A3]/25">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextPlaying = !isPlaying;
                      setIsPlaying(nextPlaying);
                      if (audioSourceMode === "synth" && nextPlaying) {
                        if (audioContextRef.current) {
                          if (audioContextRef.current.state === "suspended") {
                            audioContextRef.current.resume().catch(() => {});
                          }
                        } else {
                          startTanpuraSynth();
                        }
                      }
                    }}
                    className="h-8 w-8 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition shadow-3xs active:scale-95 cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 fill-current translate-x-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (audioSourceMode === "stream") {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          setAudioProgress(0);
                        }
                      } else {
                        if (isPlaying) {
                          startTanpuraSynth();
                        }
                      }
                    }}
                    className="text-[10px] font-bold text-stone-600 hover:text-[#5D4037] bg-[#F5ECE2] hover:bg-[#ebdcc8] border border-[#D4C3A3]/40 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    {currentLanguage === "ml" ? "ആദ്യം മുതൽ" : currentLanguage === "te" ? "మళ్లీ మొదటినుండి" : "Reset" }
                  </button>
                </div>

                {/* Volume & Mute control */}
                <div className="flex items-center gap-1.5 min-w-[125px]">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-stone-600 hover:text-[#5D4037] p-1 transition cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 h-1 bg-amber-100/80 rounded-lg accent-amber-600 appearance-auto cursor-pointer"
                  />
                  <span className="font-mono text-[9px] font-bold text-[#8D6E63] w-6 text-right">
                    {isMuted ? "Mute" : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[9.5px] text-[#A1887F] italic leading-relaxed pl-1">
              {audioSourceMode === "synth"
                ? (currentLanguage === "ml"
                    ? "*വിശുദ്ധ ശീലുകളിൽ അധിഷ്ഠിതമായ 432Hz തൻപുര ധ്വനി. മനസ്സമാധാനത്തിനും അതീന്ദ്രിയ ധ്യാനത്തിനും ഏറ്റവും അനുയോജ്യം."
                    : currentLanguage === "te"
                      ? "*మనోహరమైన 432Hz తన్పురా వాయిద్య రవళి. మానసిక ప్రశాంతతకు మరియు ధ్యాన సాధనకు అనువైనది."
                      : "*Procedural 432Hz Tanpura tuning, engineered directly in your browser. Bypasses firewalls and data limits, optimized for stable meditative practice."
                  )
                : (currentLanguage === "ml"
                    ? "*യൂട്യൂബ് പരസ്യങ്ങളോ തടസ്സങ്ങളോ ഇല്ലാതെ തത്സമയം സ്ട്രീം ചെയ്യുന്ന ഹൈ-ഫിഡിലിറ്റി വൈദിക മന്ത്രങ്ങൾ. പൂർണ്ണ ധ്യാന ശ്രദ്ധയ്ക്ക് ഉത്തമം."
                    : currentLanguage === "te"
                      ? "*యూట్యూబ్ ప్రకటనలు లేదా అంతరాయాలు లేని స్వచ్ఛమైన వైదిక ఆడియో ప్రసారం. సంపూర్ణ ధ్యానానికి అనుకూలం."
                      : "*Pure acoustic streams from high-fidelity digital archives. Zero screen noise, low resource consumption, optimized for quiet Vedic meditation."
                  )
              }
            </p>
          </div>

        </div>

        {/* Right Hand: YouTube Broadcast & Scrolling Karaoke Sloka */}
        <div className="hidden">

          {/* YouTube Live Broadcast player */}
          <div className="rounded-3xl border border-[#D4C3A3] bg-amber-50/25 p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D4C3A3]/35 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-bold text-red-800 font-serif uppercase tracking-widest">
                  {currentLanguage === "ml" ? "യൂട്യൂബ് ഭക്തി സാഗരം" : currentLanguage === "te" ? "యూట్యూబ్ భక్తి తరంగిణి" : "YouTube Sacred Broadcast"}
                </span>
              </div>
              {activeYoutubeId && (
                <button
                  onClick={() => {
                    setActiveYoutubeId(null);
                    setActiveYoutubeTitle("");
                  }}
                  className="text-[9px] font-bold text-stone-500 hover:text-red-700 bg-stone-100 hover:bg-red-50 border border-stone-200/50 hover:border-red-200 px-2.5 py-1 rounded-lg transition"
                >
                  {currentLanguage === "ml" ? "മാറ്റുക" : currentLanguage === "te" ? "తీసివేయి" : "Stop Broadcast"}
                </button>
              )}
            </div>

            {!activeYoutubeId ? (
              <div className="text-center py-6 px-4 bg-white/65 rounded-2xl border border-[#D4C3A3]/20 flex flex-col items-center justify-center gap-2">
                <div className="p-3 bg-red-50 text-red-600 rounded-full animate-bounce">
                  <Music className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-[#5D4037] font-serif">
                    {currentLanguage === "ml" ? "മുഹൂർത്ത ഭജനകൾ പ്ലേ ചെയ്യുക" : currentLanguage === "te" ? "ముహూర్త సంకీర్తనలు వినండి" : "Vedic Devotional Sanctuary"}
                  </h5>
                  <p className="text-[12px] text-stone-500 max-w-[240px] mx-auto mt-1 leading-normal">
                    {currentLanguage === "ml" 
                      ? "മുകളിലുള്ള നിർദ്ദേശിച്ച ഏതെങ്കിലും മന്ത്രത്തിലോ ഭജനയിലോ ക്ലിക്ക് ചെയ്ത് തത്സമയ യൂട്യൂബ് ദർശനം ആസ്വദിക്കുക." 
                      : currentLanguage === "te" 
                        ? "పైన సూచించిన ఏదైనా మంత్రాన్ని లేదా భజనను క్లిక్ చేసి నేరుగా యూట్యూబ్ లో ఆలకించండి." 
                        : "Select any suggested Sahasranama, Keerthana, or Bhajana above to stream the auspicious YouTube performance."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xs border border-red-100 bg-[#1e1e1e]">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${activeYoutubeId}?autoplay=1&modestbranding=1&rel=0&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
                    title={activeYoutubeTitle}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                  ></iframe>
                </div>
                
                <div className="bg-white/95 p-3 rounded-2xl border border-red-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
                  <div className="min-w-0">
                    <p className="text-[9px] font-mono leading-none tracking-wider uppercase font-extrabold text-red-700 animate-pulse flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-red-600 rounded-full"></span>
                      {currentLanguage === "ml" ? "ആലപിക്കുന്നു (യൂട്യൂബ്)" : currentLanguage === "te" ? "ఆలపన (యూట్యూబ్)" : "LIVE BROADCAST (YOUTUBE)"}
                    </p>
                    <h4 className="text-[9.5px] font-bold text-[#5D4037] font-sans truncate mt-1 animate-fadeIn">
                      {activeYoutubeTitle}
                    </h4>
                  </div>
                  
                  <div className="flex gap-1.5 shrink-0">
                    <a
                      href={`https://www.youtube.com/watch?v=${activeYoutubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition shadow-3xs hover:shadow-xs hover:scale-102 hover:no-underline"
                    >
                      <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>
                        {currentLanguage === "ml" ? "യൂട്യൂബിൽ കാണുക" : currentLanguage === "te" ? "యూట్యూబ్ లో ఆలకించండి" : "Watch on YouTube"}
                      </span>
                    </a>
                  </div>
                </div>

                <p className="text-[11.5px] text-stone-500 italic mt-1 leading-relaxed pl-1">
                  {currentLanguage === "ml"
                    ? "*നിർദ്ദേശിച്ച വീഡിയോകളിലെ പബ്ലിഷർ നിയന്ത്രണങ്ങൾ മൂലം ലോഡിംഗ് തടസ്സമുണ്ടായാൽ ദയവായി 'യൂട്യൂബിൽ കാണുക' എന്ന ബട്ടൺ ക്ലിക്ക് ചെയ്യുക (ഇത് തടസ്സമില്ലാത്ത അനുഭവം തരുന്നു)."
                    : currentLanguage === "te"
                      ? "*యూట్యూబ్ ఆంక్షల వల్ల దోషం వస్తే, పైన ఉన్న 'యూట్యూబ్ లో ఆలకించండి' బటన్ ద్వారా నేరుగా సరిగా వినగలరు."
                      : "*If publisher rules block in-app embedding ('Error 153' / restriction), simply click the 'Watch on YouTube' button to play instantly in a new tab."
                  }
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Authorized Link Settings Control Panel Modal Overlay */}
      <AdminSettingsModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        currentLanguage={currentLanguage} 
        currentConfig={audioConfig} 
        onConfigSaved={(newConfig) => setAudioConfig(newConfig)} 
      />

    </div>
  );
}

// Utility function to format progress/duration times
function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds === Infinity) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
