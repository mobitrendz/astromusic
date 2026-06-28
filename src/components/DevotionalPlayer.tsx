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

export interface PlaylistTrack {
  id: string;
  nameEn: string;
  nameMl: string;
  nameTe: string;
  url: string;
  category: "mantra" | "stotram" | "suprabhatam" | "sahasranamam" | "songs" | "shirdi" | "ashtakam" | "ayyappa";
  lyricsSanskrit: string;
  lyricsEnglish: string;
  lyricsMalayalam: string;
  lyricsTelugu: string;
}

export const SACRED_TREASURY_PLAYLIST: PlaylistTrack[] = [
  {
    id: "maha_mrityunjay",
    nameEn: "Maha Mrityunjay Mantra",
    nameMl: "മഹാ മൃത്യുഞ്ജയ മന്ത്രം",
    nameTe: "మహా మృత్యుంజయ మంత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/80Maha%20Mrityunjay%20Mantra.mp3",
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
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/01Ganpati%20Beej%20Mantra.mp3",
    category: "mantra",
    lyricsSanskrit: "ॐ गं गणपतये नमः ॥ विघ्नविनाशनाय शिवसुताय श्रीवरदमूर्तये नमः ॥",
    lyricsEnglish: "Auspicious salutations with 'Gam' to Lord Ganapati, the destroyer of all obstacles, the son of Lord Shiva, and the bestower of blessed boons.",
    lyricsMalayalam: "ഓം ഗം ഗണപതയേ നമഃ. വിഘ്നങ്ങളെ നശിപ്പിക്കുന്നവനും, ശിവപുത്രനും, വരദായകനുമായ ശ്രീ ഗണപതി ഭഗവാനെ ഞങ്ങൾ വണങ്ങുന്നു.",
    lyricsTelugu: "ఓం గం గణపతయే నమః. విఘ్నములను రూపుమాపేవాడు, శివసుతుడు, కోరిన వరములిచ్చే శ్రీ వరదమూర్తికి నమస్కారం."
  },
  {
    id: "namaskar_mantra",
    nameEn: "Namaskar Mantra",
    nameMl: "നമസ്കാര മന്ത്രം",
    nameTe: "నమస్కార మంత్రం",
    url: "https://ia800508.us.archive.org/35/items/ShivaStotrasAndMantras/03Namaskar%20Mantra.mp3",
    category: "mantra",
    lyricsSanskrit: "नमः शम्भवाय च मयोभवाय च नमः शंकराय च मयस्कराय च नमः शिवाय च शिवतराय च ॥",
    lyricsEnglish: "Salutations to the source of peace and happiness. Salutations to the creator of welfare and bliss. Salutations to the auspicious one and the most auspicious Shiva.",
    lyricsMalayalam: "സമാധാനത്തിന്റെയും സന്തോഷത്തിന്റെയും ഉറവിടമായവന് പ്രണാമം. ക്ഷേമവും ആനന്ദവും നൽകുന്നവന് പ്രണാമം. മംഗളസ്വരൂപനും അതിമംഗളവുമായ പരമശിവന് പ്രണാമം.",
    lyricsTelugu: "సుఖశాంతులకు మూలమైన వానికి నమస్కారం. శుభములను, ఆనందమును కలిగించే వానికి నమస్కారం. అత్యంత మంగళకరుడైన ఆ పరమశివునికి నమస్కారం."
  },
  {
    id: "medha_dakshinamurthy",
    nameEn: "Sri Medha Dakshinamurthy Mantram",
    nameMl: "ശ്രീ മേധാ ദക്ഷിണാമൂർത്തി മന്ത്രം",
    nameTe: "శ్రీ మేధా దక్షిణామూర్తి మంత్రం",
    url: "https://dn710905.ca.archive.org/0/items/ShivaStotrasAndMantras/59Sri%20Medha%20Dakshinamurthy%20Mantram.mp3",
    category: "mantra",
    lyricsSanskrit: "ॐ नमो भगवते दक्षिणामूर्तये मह्यं मेधां प्रज्ञां प्रयच्छ स्वाहा ॥",
    lyricsEnglish: "Om, salutations to the divine Lord Dakshinamurthy. Please bestow upon me wisdom, intellect and power of comprehension.",
    lyricsMalayalam: "ഓം, ഭഗവാൻ ദക്ഷിണാമൂർത്തിക്ക് പ്രണാമം. എനിക്ക് ബുദ്ധിയും ജ്ഞാനവും വിവേകവും പ്രധാനം ചെയ്തരുളിയാലും.",
    lyricsTelugu: "ఓం, దక్షిణామూర్తి భగవానునికి నమస్కారం. నాకు సద్బుద్ధిని, జ్ఞానమును, వివేకమును అనుగ్రహించుము."
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
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/24Shiva%20Panchakshar%20Stotram.mp3",
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
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/25Shiva%20Shadakshar%20Stotram.mp3",
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
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/26Umamaheswara%20Stotram.mp3",
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
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/27Dwadasa%20Jyothirlinga%20Stotram.MP3",
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
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/36Shiva%20Tandav%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम् ॥ डमड्डमड्डमड्डमन्निनादवड্ডमर्वयं चकार चण्डताण्डवं तनोतु नः शिवः शिवम् ॥",
    lyricsEnglish: "With His neck consecrated by the flow of water trickling from His dense forest matted hair, and draped with a garland of serpents, He performed the intense Tandava dance to the thumping of the damaru. May Lord Shiva shower auspicious blessings.",
    lyricsMalayalam: "തന്റെ ജടയാകുന്ന കാട്ടിൽ നിന്നും ഒഴുകുന്ന ഗംഗാ തീർത്ഥത്താൽ പവിത്രമായ കഴുത്തിൽ സർപ്പമാലയണിഞ്ഞ്, ഡമരു നാദത്തിനൊപ്പം താണ്ഡവമാടിയ പരമശിവൻ ഞങ്ങൾക്ക് മംഗളം ചൊരിയട്ടെ.",
    lyricsTelugu: "జటలనే అడవి నుండి ప్రవహించే గంగతో తడిసిన ముక్కంటి కంఠసీమలో పాములను హారంగా వేసుకుని, డమరుక ధ్వనులకు అనుగుణంగా ప్రచండ తాండవం చేసిన శివుడు మాకు శ్రేయస్సు కలిగించుగాక."
  },
  {
    id: "shiva_mahimna",
    nameEn: "Shiva Mahimna Stotram",
    nameMl: "ശിവ മഹിംന സ്തോത്രം",
    nameTe: "శివ మహిమ్న స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/07Shiva%20Mahimna%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "महिम्नः पारं ते परमविदुषो यद्यसदृशी स्तुतिर्ब्रह्मादीनामपि तदवसन्नास्त्वयि गिरः । अथाऽवाच्यः सर्वः स्वमतिपरिणामावधि गृणन् ममाप्येष स्तोत्रे हर निरपवादः परिकरः ॥",
    lyricsEnglish: "If praise of Thee by one who knows not the limit of Thy greatness be unbecoming, then even the praises of Brahma and others are inadequate. If everyone is blameless when praising according to their intellectual capacity, then my attempt to praise Thee is also free from blemish.",
    lyricsMalayalam: "ഭഗവാന്റെ മഹിമകളുടെ അതിരറിയാതെ സ്തുതിക്കുന്നത് അയോഗ്യമാണെങ്കിൽ ബ്രഹ്മാദിദേവന്മാരുടെ സ്തുതികളും അപൂർണ്ണമാണ്. എല്ലാവരും അവരവരുടെ ബുദ്ധിശക്തിക്കനുസരിച്ച് സ്തുതിക്കുമ്പോൾ എന്റെ ഈ ശ്രമവും കുറ്റമറ്റതാണ്.",
    lyricsTelugu: "నీ మహిమల హద్దులు తెలియక నిన్ను స్తుతించడం తప్పు అయితే, బ్రహ్మాది దేవతల స్తుతులు కూడా అసంపూర్ణమే. ప్రతి ఒక్కరూ తమ బుద్ధి శక్తి కొద్దీ స్తుతించేటప్పుడు నా ఈ ప్రయత్నం కూడా దోషరహితమే."
  },
  {
    id: "shiva_aparaadha_kshamapana",
    nameEn: "Shiva Aparaadha Kshamapana Stotram",
    nameMl: "ശിവ അപരാധ ക്ഷമാപണ സ്തോത്രം",
    nameTe: "శివ అపరాధ క్షమాపణ స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/09Shiva%20Aparaadha%20Kshamapana%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "करचरणकृतं वाक्कायजं कर्मजं वा श्रवणनयनजं वा मानसं वापराधम् । विहितमविहितं वा सर्वमेतत्क्षमस्व जय जय करुणाब्धे श्रीमहादेव शम्भो ॥",
    lyricsEnglish: "O Lord Shambhu, please forgive all my sins committed through hands, feet, speech, body, actions, ears, eyes, or mind, whether authorized or unauthorized. Glory to Thee, O ocean of compassion, the great God.",
    lyricsMalayalam: "കൈകൾ, കാലുകൾ, വാക്ക്, ശരീരം, കർമ്മം, ചെവികൾ, കണ്ണുകൾ, മനസ്സ് എന്നിവയിലൂടെ ചെയ്ത വിഹിതവും അവിഹിതവുമായ എല്ലാ പാപങ്ങളും ക്ഷമിക്കേണമേ. കാരുണ്യക്കടലായ മഹാദേവാ അങ്ങേക്ക് ജയം.",
    lyricsTelugu: "చేతులు, కాళ్ళు, మాట, శరీరం, కర్మలు, చెవులు, కళ్ళు, మనస్సు ద్వారా నేను చేసిన విహిత, అవిహిత పాపాలన్నింటినీ క్షమించుము. కరుణాసముద్రుడవైన ఓ మహాదేవ శంభో నీకు జయము."
  },
  {
    id: "dakshinamurthy_stotram",
    nameEn: "Dakshinamurthy Stotram",
    nameMl: "ദക്ഷിണാമൂർത്തി സ്തോത്രം",
    nameTe: "దక్షిణామూర్తి స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/28Dakshinamurthy%20Stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "विश्वं दर्पणदृश्यमाननगरीतुल्यं निजान्तर्गतं पश्यन्नात्मनि मायया बहिरिवोद्भूतं यथा निद्रया । यः साक्षात्कुरुते प्रबोधसमये स्वात्मानमेवाद्वयं तस्मै श्रीगुरुमूर्तये नम इदं श्रीदक्षिणामूर्तये ॥",
    lyricsEnglish: "To Him who sees the universe as a city reflected in a mirror, existing within Himself but appearing external due to Maya, like a dream; to Him who realizes on awakening His non-dual Self; salutations to that Sri Guru, Dakshinamurthy.",
    lyricsMalayalam: "പ്രപഞ്ചത്തെ തനിക്കുള്ളിൽ തന്നെയുള്ളതും എന്നാൽ മായയാൽ പുറത്തെന്നോണം കാണപ്പെടുന്നതുമായ കണ്ണാടിയിലെ നഗരം പോലെ ദർശിക്കുന്നവനും, ഉണരുമ്പോൾ അദ്വൈത രൂപിയായ ആത്മാവിനെ സാക്ഷാത്കരിക്കുന്നവനുമായ ദക്ഷിണാമൂർത്തി സ്വരൂപനായ ശ്രീ ഗുരുവിന് പ്രണാമം.",
    lyricsTelugu: "ప్రపంచాన్ని అద్దంలో కనిపించే నగరం వలె తనలోనే ఉంటూ, మాయ వల్లే బయట ఉన్నట్లుగా చూసేవాడు, మేల్కొన్నప్పుడు అద్వైత రూప ఆత్మను సాక్షాత్కరించుకునే దక్షిణామూర్తి రూప శ్రీ గురువునకు నమస్కారములు."
  },
  {
    id: "nataraja_stotram",
    nameEn: "Nataraja Stotram",
    nameMl: "നടരാജ സ്തോത്രം",
    nameTe: "నటరాజ స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/29Nataraja%20Stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "सदस्त्त्विकां नित्यनटं नमस्ये सदा शिवं चिद्घनसान्द्रमुद्रम् । चिदम्बरेशं हृदये स्मरामि नमोऽस्तु तस्मै नटनायकाय ॥",
    lyricsEnglish: "I bow to the eternal dancer, Sadashiva, the embodiment of supreme consciousness. I meditate in my heart upon the Lord of Chidambaram, salutations to that King of Dance.",
    lyricsMalayalam: "നിത്യവും താണ്ഡവമാടുന്നവനും ചിദ്ഘനസ്വരൂപനുമായ സദാശിവനെ ഞാൻ വന്ദിക്കുന്നു. ചിദംബരനാഥനെ ഹൃദയത്തിൽ ധ്യാനിച്ചുകൊണ്ട് ആ നടരാജന് പ്രണാമം അർപ്പിക്കുന്നു.",
    lyricsTelugu: "నిత్యం తాండవం చేసేవాడు, చిద్ఘన స్వరూపుడైన సదాశివునికి నమస్కారం. చిదంబరనాథుడిని హృదయంలో ధ్యానిస్తూ ఆ నటరాజుకు ప్రణామం చేస్తున్నాను."
  },
  {
    id: "ardhanareeswara_stotram",
    nameEn: "Ardhanareeswara Stotram",
    nameMl: "അർദ്ധനാരീശ്വര സ്തോത്രം",
    nameTe: "అర్ధనారీశ్వర స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/30Ardhanareeswara%20Stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "चाम्पेयगौरार्धशरीरकायै कर्पूरगौरार्धशरीरकाय । धम्मिल्लकायै च जटाधരായ नमः शिवायै च नमः शिवाय ॥",
    lyricsEnglish: "Salutations to Her who has a body of golden champaca complexion, and salutations to Him who has a body as white as camphor. Salutations to Her with beautiful braided hair, and salutations to Him with matted hair. Salutations to Shiva and Shakti.",
    lyricsMalayalam: "ചമ്പകപ്പൂവിന്റെ നിറമുള്ള ശരീരാർദ്ധത്തോടുകൂടിയവളായ പാർവ്വതിക്കും, കർപ്പൂരം പോലെ ധവളവർണ്ണമായ ശരീരാർദ്ധത്തോടുകൂടിയവനായ ശിവനും പ്രണാമം. മുടിയഴകുള്ളവളായ ദേവിക്കും ജട ധരിച്ചവനായ ദേവനും നമസ്കാരം.",
    lyricsTelugu: "చంపక పుష్ప వర్ణ శరీరార్ధము గల పార్వతీదేవికి, కర్పూర ధవళ వర్ణ శరీరార్ధము గల పరమశివునికి నమస్కారములు. చక్కని కురులు గల దేవికి, జటాధరుడైన శివునికి ప్రణామములు."
  },
  {
    id: "margabandhu_stotram",
    nameEn: "Margabandhu Stotram",
    nameMl: "മാർഗ്ഗബന്ധു സ്തോത്രം",
    nameTe: "మార్గబంధు స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/31Margabandhu%20Stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "शम्भो महादेव देव शिव शम्भो महादेव देवेश शम्भो । शम्भो महादेव देवेश शम्भो मार्गापराधं क्षमस्व प्रभो ॥",
    lyricsEnglish: "O Lord Shambhu, Mahadeva, King of Gods! Please protect me on my journey and forgive any shortcomings or obstacles on the path.",
    lyricsMalayalam: "ദേവദേവനായ ശംഭോ മഹാദേവാ! എന്റെ യാത്രകളിൽ എന്നെ തുണയ്ക്കുകയും വഴിയിലെ എല്ലാ തടസ്സങ്ങളും അപരാധങ്ങളും ക്ഷമിക്കുകയും ചെയ്യേണമേ.",
    lyricsTelugu: "దేవదేవుడవైన శంభో మహాదేవా! నా ప్రయాణాలలో నన్ను రక్షించుము, మార్గములోని ఆటంకాలను దోషాలను క్షమించుము."
  },
  {
    id: "daaridriya_dukha_dahana",
    nameEn: "Daaridriya Dukha Dahana Stotram",
    nameMl: "ദാരിദ്ര്യ ദുഃഖ ദഹന സ്തോത്രം",
    nameTe: "దారిద్ర్య దుఃఖ దహన స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/32Daaridriya%20Dukha%20Dahana%20Stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "विश्वेश्वराय नरकार्णवतारणाय कर्णामृताय शशिशेखरधारणाय । कर्पूरकुन्दधवलाय जटाधराय दारिद्र्यदुःखदहनाय नमः शिवाय ॥",
    lyricsEnglish: "Salutations to Shiva, the Lord of the Universe, who delivers us from the ocean of hell, whose name is nectar to the ears, who wears the crescent moon, who is white as camphor, and who burns away poverty and sorrow.",
    lyricsMalayalam: "പ്രപഞ്ചനാഥനും നരകമാകുന്ന കടലിൽ നിന്ന് രക്ഷിക്കുന്നവനും കർപ്പൂരം പോലെ ധവളവർണ്ണമുള്ളവനും ആയ പരമശിവന് പ്രണാമം. ഞങ്ങളുടെ ദാരിദ്ര്യവും ദുഃഖങ്ങളും എരിച്ചുകളയുന്ന ഭഗവാനെ വണങ്ങുന്നു.",
    lyricsTelugu: "విశ్వేశ్వరుడు, నరక సముద్రము నుండి దాటించువాడు, చెవులకు అమృతం వంటివాడు, దారిద్ర్య దుఃఖాలను దహించివేసే ఆ పరమశివునికి నమస్కారములు."
  },
  {
    id: "vedasarasivasthava",
    nameEn: "Vedasarasivasthava Stotram",
    nameMl: "വേദസാരശിവസ്തവ സ്തോത്രം",
    nameTe: "వేదసారశివస్తవ స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/33Vedasarasivasthava%20Stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "पशूनां पतिं पापनाशं परेशं गजेन्द्रस्य कृत्तिं वसानं वरेण्यम् । जटाजूटमध्ये स्फुरद्गाङ्गवारिं महादेवमेकं स्मरामि स्मरारिम् ॥",
    lyricsEnglish: "I meditate on the one Mahadeva, the Lord of beings, the destroyer of sins, who wears an elephant hide, and in whose matted hair the holy Ganga flows beautifully.",
    lyricsMalayalam: "ജീവികളുടെ നാഥനും പാപനാശകനും ആനത്തോലുടുത്തവനും ജടയ്ക്കുള്ളിൽ ഗംഗാ തീർത്ഥം വഹിക്കുന്നവനുമായ മഹാദേവനെ ഞാൻ സ്മരിക്കുന്നു.",
    lyricsTelugu: "సర్వ ప్రాణుల పాలకుడు, పాపనాశకుడు, ఏనుగు చర్మాన్ని ధరించినవాడు, జటలలో గంగను ధరించిన ఆ మహాదేవుడిని నేను స్మరిస్తున్నాను."
  },
  {
    id: "upamanyukrita_siva",
    nameEn: "Upamanyukrita Siva Stotram",
    nameMl: "ഉപമന്യുകൃത ശിവ സ്തോത്രം",
    nameTe: "ఉపమన్యుకృత శివ స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/34Upamanyukrita%20Siva%20Stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "नमः शिवाय सोमाय सगणाय सानुगाय च । नमः शिवाय रुद्राय नमः शिवाय शम्भवे ॥",
    lyricsEnglish: "Salutations to Shiva, who is accompanied by Uma, His ganas, and followers. Salutations to Shiva, the fierce Rudra, and the peaceful Shambhu.",
    lyricsMalayalam: "പാർവ്വതീദേവിയോടും തന്റെ ഗണങ്ങളോടും അനുയായികളോടും കൂടിയ പരമശിവന് പ്രണാമം. രുദ്രനും മംഗളകാരിയുമായ ഭഗവാന് നമസ്കാരം.",
    lyricsTelugu: "పార్వతీదేవితో, తన ప్రమథ గణాలతో కూడియున్న శివునికి నమస్కారం. రుద్రరూపుడైన శివునికి, మంగళకరుడైన శంభునికి నమస్కారములు."
  },
  {
    id: "siva_bhujanga_prayaata",
    nameEn: "Siva Bhujanga Prayaata Stotram",
    nameMl: "ശиവ ഭുജംഗ പ്രയാത സ്തോത്രം",
    nameTe: "శివ భుజంగ ప్రయాత స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/35Siva%20Bhujanga%20Prayaata%20Stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "गलद्दानगण्डं मिलद्भृङ्गषण्डं चलच्चारुचञ्चत्करं चारुचन्द्रम् । लसद्भालपट्टं जगत्त्राणहेतुं जगद्वन्द्यमेकं भजे वक्रतुण्डम् ॥",
    lyricsEnglish: "I worship Shiva, the protector of the universe, who moves gracefully like a serpent, beautiful with the crescent moon and radiant forehead, worshipped by all.",
    lyricsMalayalam: "സർപ്പത്തെപ്പോലെ മനോഹരമായി ചലിക്കുന്നവനും ചന്ദ്രനെ ചൂടിയവനും പ്രപഞ്ചരക്ഷകനും ആയ മഹാദേവനെ ഞാൻ ഭജിക്കുന്നു.",
    lyricsTelugu: "సర్పము వలె మనోహర గమనము కలవాడు, అర్ధచంద్రుని ధరించినవాడు, విశ్వ రక్షకుడైన ఆ పరమశివుడిని నేను సేవిస్తున్నాను."
  },
  {
    id: "shiva_nakshatramala",
    nameEn: "Shiva Nakshatramala Stotram",
    nameMl: "ശിവ നക്ഷത്രമാല സ്തോത്രം",
    nameTe: "శివ నక్షత్రమాల స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/40Shiva%20Nakshatramala%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "श्रीमन्महेशगुणगुम्फितकाव्यरत्नमालामिमां पठति यः शिवसन्निधौ वै । सोऽभीष्टमुग्रभयनाशनमाशु लब्ध्वा कैवल्यसौख्यमतुलं लभते सुकृत्यः ॥",
    lyricsEnglish: "Whoever recites this gem-like garland of verses praising the virtues of Lord Shiva in His presence, will soon obtain their desires, find freedom from fears, and achieve ultimate liberation.",
    lyricsMalayalam: "ഭഗവാൻ ശിവന്റെ ഗുണങ്ങൾ വാഴ്ത്തുന്ന ഈ നക്ഷത്രമാല സ്തോത്രം ഭഗവത്സന്നിധിയിൽ ചൊല്ലുന്നവർക്ക് ഭയങ്ങളിൽ നിന്ന് മോചനവും ആഗ്രഹസാഫല്യവും മോക്ഷവും സിദ്ധിക്കും.",
    lyricsTelugu: "పరమశివుని గుణాలను కీర్తించే ఈ నక్షత్రమాల స్తోత్రాన్ని శివసన్నిధిలో పఠించేవారికి భయాలు తొలగి, కోరిన కోర్కెలు తీరి మోక్షం లభిస్తుంది."
  },
  {
    id: "aksharamaalika_siva",
    nameEn: "Aksharamaalika Siva Stotram",
    nameMl: "അക്ഷരമാലിക ശിവ സ്തോത്രം",
    nameTe: "అక్షరమాలికా శివ స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/41Aksharamaalika%20siva%20stotram.MP3",
    category: "stotram",
    lyricsSanskrit: "अकाररूपाय नमः शिवाय उकाररूपाय नमः शिवाय । मकाररूपाय नमः शिवाय ॐकाररूपाय नमः शिवाय ॥",
    lyricsEnglish: "Salutations to Shiva who is the form of letter 'A', 'U', 'M', and the sacred sound of 'Om'.",
    lyricsMalayalam: "അകാര രൂപനും ഉകാര രൂപനും മകാര രൂപനും ഓംകാര സ്വരൂപനുമായ ഭഗവാൻ ശിവന് പ്രണാമം.",
    lyricsTelugu: "అకార రూపుడు, ఉకార రూపుడు, మకార రూపుడు, ప్రణవ నాద ఓంకార రూపుడైన శివునికి నమస్కారములు."
  },
  {
    id: "dakshinamurthy_navrathnamala",
    nameEn: "Sri Dakshinamurthy Navrathnamala Stotram",
    nameMl: "ശ്രീ ദക്ഷിണാമൂർത്തി നവരത്നമാല സ്തോത്രം",
    nameTe: "శ్రీ దక్షిణామూర్తి నవరత్నమాల స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/61Sri%20Dakshinamurthy%20Navrathnamala%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "मौनव्याख्याप्रकटितपरब्रह्मतत्त्वं युवानं वर्षिष्ठांते वसद् ऋषिगणैः आवृतं ब्रह्मनिष्ठैः । आचार्येन्द्रं करकलित चिन्मुद्रमानन्दरूपं स्वात्मारामं मुदितवदनं दक्षिणामूर्तिमीडे ॥",
    lyricsEnglish: "I praise Dakshinamurthy, who reveals the supreme Brahman through silent exposition, surrounded by aging disciples who are established in Brahman, holding the chin-mudra, blissful, and smiling.",
    lyricsMalayalam: "മൗനത്തിലൂടെ പരബ്രഹ്മ തത്ത്വം വെളിപ്പെടുത്തുന്നവനും ചിന്മുട്ര ധരിച്ചവനും ആനന്ദസ്വരൂപനും ആയ ശ്രീ ദക്ഷിണാമൂർത്തിയെ ഞാൻ സ്തുതിക്കുന്നു.",
    lyricsTelugu: "మౌన వ్యాఖ్యానము ద్వారా పరబ్రహ్మ తత్త్వాన్ని బోధించేవాడు, చిన్ముద్రనుధరించినవాడు, ఆనంద స్వరూపుడైన దక్షిణామూర్తికి నమస్కారములు."
  },
  {
    id: "chidambara_panchachamara",
    nameEn: "Sri Chidambara Panchachamara Stotram",
    nameMl: "ശ്രീ ചിദംബര പഞ്ചചാമര സ്തോത്രം",
    nameTe: "శ్రీ చిదంబర పంచచామర స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/70Shree%20Chidambara%20Panchachamara%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "कृपासमुद्रमुग्रमीशमद्रिजापयो धरोरुहारमुज्ज्वलं जटाधरं महाधरम् । सदाशिवं हृदम्बुजे भजामि नित्यनर्तकं चिදംബരേഷ്മീശ്വര് തമേവ് മുക്തികാരണമ് ॥",
    lyricsEnglish: "I worship Sadashiva in my lotus heart, the ocean of mercy, the eternal dancer, the Lord of Chidambaram, who is the sole cause of liberation.",
    lyricsMalayalam: "കാരുണ്യക്കടലും നിത്യനർത്തകനും ചിദംബരനാഥനും ആയ സദാശിവനെ എന്റെ ഹൃദയകമലത്തിൽ ധ്യാനിക്കുന്നു.",
    lyricsTelugu: "కరుణాసముద్రుడు, నిత్య నర్తకుడు, చిదంబర క్షేత్ర నివాసి అయిన సదాశివుడిని నా హృదయ కమలములో ధ్యానిస్తున్నాను."
  },
  {
    id: "natraja_thandava_stotram",
    nameEn: "Sri Natraja Thandava Stotram",
    nameMl: "ശ്രീ നടരാജ താണ്ഡവ സ്തോത്രം",
    nameTe: "శ్రీ నటరాజ తాండవ స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/72Shree%20Natraj%20Thandav%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "नटेश नर्तनप्रिया नटराज सुन्दरा । तनोतु नः शिवः शिवं चकार चण्डताण्डवम् ॥",
    lyricsEnglish: "O Lord of Dance, who loves the divine cosmic dance, beautiful Nataraja! May Lord Shiva, who performed the grand Tandava, shower auspicious blessings.",
    lyricsMalayalam: "നൃത്യപ്രിയനായ നടരാജ ഭഗവാനേ! പ്രപഞ്ച വിസ്മയമായി താണ്ഡവമാടിയ പരമശിവൻ ഞങ്ങൾക്ക് മംഗളങ്ങൾ അരുളട്ടെ.",
    lyricsTelugu: "నర్తనప్రియుడవైన నటరాజ సుందరుడా! ప్రచండ తాండవము చేసిన ఆ పరమశివుడు మాకు శుభములు చేకూర్చుగాక."
  },
  {
    id: "chidambareswara_stothram",
    nameEn: "Chidambareswara Stothram",
    nameMl: "ചിദംബരേശ്വര സ്തോത്രം",
    nameTe: "చిదంబరేశ్వర స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/76Chidambareswara%20Stothram.mp3",
    category: "stotram",
    lyricsSanskrit: "कृपाकरं कृपासिन्धुं चिदम्बरेश्वरं भजे । सदाशिवं हृदाम्भोजे नित्यनृत्यविधायिनम् ॥",
    lyricsEnglish: "I worship Chidambareswara, the ocean of mercy, who performs the eternal dance of creation and dissolution in the lotus of the heart.",
    lyricsMalayalam: "കാരുണ്യക്കടലായ ചിദംബരേശ്വരനെ ഭജിക്കുന്നു. ഹൃദയകമലത്തിൽ നിത്യനൃത്തമാടുന്ന സദാശിവനെ വണങ്ങുന്നു.",
    lyricsTelugu: "కరుణాసముద్రుడైన చిదంబరేశ్వరుడిని సేవిస్తున్నాను."
  },
  {
    id: "lalitha_sahasranamam",
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
    id: "dakshinamurthy_sahasranama",
    nameEn: "Sri Dakshinamurthy Sahasranamam",
    nameMl: "ശ്രീ ദക്ഷിണാമൂർത്തി സഹസ്രനാമം",
    nameTe: "श్రీ దక్షిణామూర్తి సహస్రనామము",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/60Sri%20Dakshinamurthy%20Sahasranamam.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "मौनव्याख्याप्रकटितपरब्रह्मतत्त्वं युवानं वर्षिष्ठांते वसद् ऋषिगणैः आवृतं ब्रह्मनिष्ठैः । आचार्येन्द्रं करकलित चिन्मुद्रमानन्दरूपं स्वात्मारामं मुदितवदनं दक्षिणामूर्तिमीडे ॥",
    lyricsEnglish: "I praise Dakshinamurthy, who reveals the supreme Brahman through silent exposition, surrounded by aging disciples who are established in Brahman, holding the chin-mudra, blissful, and smiling.",
    lyricsMalayalam: "മൗനത്തിലൂടെ പരബ്രഹ്മ തത്ത്വം വെളിപ്പെടുത്തുന്നവനും ചിന്മുട്ര ധരിച്ചവനും ആനന്ദസ്വരൂപനും ആയ ശ്രീ ദക്ഷിണാമൂർത്തിയെ ഞാൻ സ്തുതിക്കുന്നു.",
    lyricsTelugu: "మౌన వ్యాఖ్యానము ద్వారా పరబ్రహ్మ తత్త్వాన్ని బోధించేవాడు, చిన్ముద్రనుధరించినవాడు, ఆనంద స్వరూపుడైన దక్షిణామూర్తికి నమస్కారములు."
  },
  {
    id: "natraj_sahasranama",
    nameEn: "Sri Natraj Sahasranamam",
    nameMl: "ശ്രീ നടരാജ സഹസ്രനാമം",
    nameTe: "శ్రీ నటరాజ సహస్రనామము",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/68Shree%20Natraj%20Sahasranam.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "नटेश नर्तनप्रिया नटराज सुन्दरा । सदाशिवं हृदम्बुजे भजामि नित्यनर्तकम् ॥",
    lyricsEnglish: "I bow to the eternal dancer, Sadashiva, the embodiment of supreme consciousness, the Lord of Chidambaram, salutations to that King of Dance.",
    lyricsMalayalam: "നിത്യവും താണ്ഡവമാടുന്നവനും ചിദ്ഘനസ്വരൂപനുമായ സദാശിവനെ ഞാൻ വന്ദിക്കുന്നു. ചിദംബരനാഥനെ ഹൃദയത്തിൽ ധ്യാനിച്ചുകൊണ്ട് ആ നടരാജന് പ്രണാമം അർപ്പിക്കുന്നു.",
    lyricsTelugu: "నిత్యం తాండవం చేసేవాడు, ചിద్ഘన స్వరూపుడైన సదాశివునికి నమస్కారం. ചിదంబరనాథుడిని హృదయంలో ధ్యానిస్తూ ఆ నటరాజుకు ప్రణామం చేస్తున్నాను."
  },
  {
    id: "sarabheshwara_sahasranama",
    nameEn: "Sarabheshwara Sahasranamam",
    nameMl: "ശരഭേശ്വര സഹസ്രനാമം",
    nameTe: "శరభేశ్వర సహస్రనామము",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/78Sarabheshwara%20Sahasranamam.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "शालुवेशाय विद्महे पक्षीराजाय धीमहि तन्नो शरभः प्रचोदयात् ॥",
    lyricsEnglish: "Salutations to Lord Sarabheshwara, the powerful avian-lion incarnation of Lord Shiva who pacified Lord Narasimha and restored absolute peace.",
    lyricsMalayalam: "നരസിംഹമൂർത്തിയെ ശാന്തനാക്കാൻ പക്ഷീരാജ രൂപമെടുത്ത പരമശിവന്റെ ശരഭേശ്വര രൂപത്തിന് പ്രണാമം.",
    lyricsTelugu: "నరసింహ స్వామి క్రోధాన్ని ఉపశమింపచేయుటకై పరమశివుడుధరించిన పక్షిసింహ శరభేశ్వర రూపానికి నమస్కారములు."
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
    nameEn: "Sathya Sai Bhajan",
    nameMl: "സത്യ സായി ഭജൻ",
    nameTe: "సత్య సాయి భజన",
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
  },
  {
    id: "nirvana_ashtakam",
    nameEn: "Nirvana Ashtakam",
    nameMl: "നിർവാണ അഷ്ടകം",
    nameTe: "నిర్వాణ అష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/13Nirvana%20Ashatakam.MP3",
    category: "ashtakam",
    lyricsSanskrit: "मनोबुद्ध्यहङ्कारचित्तानि नाहं न च श्रोत्रजिह्वे न च घ्राणनेत्रे । न च व्योम भूमिर्न तेजो न वायुश्चिदानन्दरूपः शिवोऽहं शिवोऽहम् ॥",
    lyricsEnglish: "I am not mind, nor intellect, nor ego, nor consciousness. I am Shiva, the form of consciousness and bliss.",
    lyricsMalayalam: "ഞാൻ മനസ്സോ ബുദ്ധിയോ അഹങ്കാരമോ ചിത്തമോ അല്ല. ഞാൻ സച്ചിദാനന്ദ രൂപനായ ശിവനാണ്.",
    lyricsTelugu: "నేను మనస్సును, బుద్ధిని, అహంకారాన్ని, చిత్తాన్ని కాను. నేను చిదానంద రూపుడైన శివుడిని."
  },
  {
    id: "linga_ashtakam",
    nameEn: "Linga Ashtakam",
    nameMl: "ലിംഗാഷ്ടകം",
    nameTe: "లింగాష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/14Linga%20Ashtakam.mp3",
    category: "ashtakam",
    lyricsSanskrit: "ब्रह्ममुरारिसुरार्चितलिङ्गं निर्मलभासितशोभितलिङ्गम् । जन्मजदुःखविनाशकलिङ्गं तत्प्रणमामि सदाशिवलिङ्गम् ॥",
    lyricsEnglish: "I bow before that Sadashiva Lingam, which is worshipped by Brahma, Vishnu and other gods, pure, radiant, and destroyer of the sorrow of rebirth.",
    lyricsMalayalam: "ബ്രഹ്മാവിഷ്ണുദേവന്മാരാൽ പൂജിക്കപ്പെടുന്നതും, ജന്മദുഃഖങ്ങളെ നശിപ്പിക്കുന്നതുമായ ആ സദാശിവലിംഗത്തെ ഞാൻ വണങ്ങുന്നു.",
    lyricsTelugu: "బ్రహ్మ, విష్ణు, దేవతలచే పూజింపబడేది, జన్మజన్మల దుఃఖాలను నశింపజేసే ఆ సదాశివ లింగానికి నమస్కరిస్తున్నాను."
  },
  {
    id: "shiva_ashtakam",
    nameEn: "Shiva Ashtakam",
    nameMl: "ശൈവാഷ്ടകം",
    nameTe: "శివాష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/15Shiva%20Ashtakam.mp3",
    category: "ashtakam",
    lyricsSanskrit: "प्रभुं प्राणनाथं विभुं विश्वनाथं जगन्नाथनाथं सदानन्दभाजम् । भवद्भव्यभूतेश्वरं भूतनाथं शिवं शङ्करं शम्भुमीशानमीडे ॥",
    lyricsEnglish: "I praise Shiva, the Lord, the soul's guide, the omnipresent ruler of the universe, the Lord of all times, the source of eternal bliss.",
    lyricsMalayalam: "പ്രപഞ്ചനാഥനും ജീവന്റെ അധിപനും സദാ ആനന്ദസ്വരൂപനും ഭൂതനാഥനുമായ ശിവശങ്കരനെ ഞാൻ സ്തുതിക്കുന്നു.",
    lyricsTelugu: "జగన్నాథుడు, ప్రాణనాథుడు, సదానంద స్వరూపుడైన ఆ పరమశివుడిని నేను కీర్తిస్తున్నాను."
  },
  {
    id: "rudra_ashtakam",
    nameEn: "Rudra Ashtakam",
    nameMl: "രുദ്രാഷ്ടകം",
    nameTe: "రుద్రాష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/16Rudra%20Ashtakam.mp3",
    category: "ashtakam",
    lyricsSanskrit: "नमामीशमीशान निर्वाणरूपं विभुं व्यापकं ब्रह्मवेदस्वरूपम् । निजं निर्गुणं निर्विकल्पं निरीहं चिदाकाशमाकाशवासं भजेऽहम् ॥",
    lyricsEnglish: "I bow to the Lord of the Northeast, who is the form of liberation, all-pervading, and the embodiment of the Vedas.",
    lyricsMalayalam: "മുക്തിസ്വരൂപനും സർവ്വവ്യാപിയും വേദസ്വരൂപനുമായ ഈശാനനെ (രുദ്രനെ) ഞാൻ വണങ്ങുന്നു.",
    lyricsTelugu: "ముక్తిస్వరూపుడు, సర్వవ్యాపి, వేదస్వరూపుడైన ఆ రుద్రుడిని నేను పూజిస్తున్నాను."
  },
  {
    id: "bilva_ashtakam",
    nameEn: "Bilva Ashtakam",
    nameMl: "ബിൽവാഷ്ടകം",
    nameTe: "బిల్వాష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/17Bilva%20Ashtakam.mp3",
    category: "ashtakam",
    lyricsSanskrit: "त्रिदलं त्रिगुणाकारं triनेत्रं च त्रियायुधम् । त्रिजन्मपापसंहारं एकबिल्वं शिवार्पणम् ॥",
    lyricsEnglish: "Offering a single Bilva leaf which has three leaflets, symbolizing three gunas, three eyes, and three weapons, which destroys the sins of three lifetimes, to Lord Shiva.",
    lyricsMalayalam: "മൂന്നു ദളങ്ങളുള്ളതും ത്രിഗുണങ്ങളെയും ത്രിനേത്രങ്ങളെയും സൂചിപ്പിക്കുന്നതുമായ ഈ ബിൽവപത്രം ശിവന് സമർപ്പിക്കുന്നു.",
    lyricsTelugu: "మూడు దళాలు కలిగి, త్రిగుణాలకు ప్రతీకయై, మూడు జన్మల పాపాలను హరించే బిల్వపత్రాన్ని శివునికి సమర్పిస్తున్నాను."
  },
  {
    id: "chandrasekara_ashtakam",
    nameEn: "Chandrasekara Ashtakam",
    nameMl: "ചന്ദ്രശേഖരാഷ്ടകം",
    nameTe: "చంద్రశేఖరాష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/18Chandrasekara%20Ashtakam.MP3",
    category: "ashtakam",
    lyricsSanskrit: "चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर पाहि माम् । चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर रक्ष माम् ॥",
    lyricsEnglish: "O Lord Chandrasekara (who wears the moon on His head), protect me and save me from the fear of death and worldly suffering.",
    lyricsMalayalam: "ചന്ദ്രനെ ചൂടിയ ചന്ദ്രശേഖര ഭഗവാനേ, ഈ ഭവഭയത്തിൽ നിന്നും എന്നെ രക്ഷിക്കേണമേ.",
    lyricsTelugu: "శిరస్సున చంద్రుడిని ధరించిన చంద్రశేఖరుడా, నన్ను కాపాడుము, రక్షించుము."
  },
  {
    id: "viswanatha_ashtakam",
    nameEn: "Viswanatha Ashtakam",
    nameMl: "വിശ്വനാഥാഷ്ടകം",
    nameTe: "విశ్వనాథాష్టకం",
    url: "https://ia800508.us.archive.org/35/items/ShivaStotrasAndMantras/19Viswanatha%20Ashtakam.MP3",
    category: "ashtakam",
    lyricsSanskrit: "गङ्गातरङ्गरमणीयजटाकलापं गौरीनिरन्तरविभूषितवामभागम् । नारायणप्रियमनङ्गमदापहारं वाराणसीपुरपतिं भज विश्वनाथम् ॥",
    lyricsEnglish: "I worship Vishwanatha, the Lord of Varanasi, whose matted hair is beautified by the waves of Ganga, whose left side is adorned by Gauri, and who is dear to Narayana.",
    lyricsMalayalam: "ഗംഗാതരംഗങ്ങളാൽ അലംകൃതമായ ജടയുള്ളവനും പാർവ്വതീദേവിയെ വാമഭാഗത്ത് പ്രതിഷ്ഠിച്ചവനുമായ കാശി വിശ്വനാഥനെ ഭജിക്കുന്നു.",
    lyricsTelugu: "గంగా తరంగాల జటలు కలవాడు, గౌరీదేవిని వామభాగంలో అలంకరించిన కాశీ విశ్వనాథుడిని పూజిస్తున్నాను."
  },
  {
    id: "kalabairava_ashtakam",
    nameEn: "Kalabairava Ashtakam",
    nameMl: "കാലഭൈരവാഷ്ടകം",
    nameTe: "కాలభైరవాష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/20Kalabairava%20Ashtakam.MP3",
    category: "ashtakam",
    lyricsSanskrit: "देवराजसेव्यमानपावनाङ्घ्रिपङ्कजं व्यालयज्ञसूत्रमिन्दुशेखरं कृपाकरम् । नारदादियोगिवृन्दवन्दितं दिगम्बरं काशिकापुराधिनाथकालभैरवं भजे ॥",
    lyricsEnglish: "I worship Kalabhairava, the Lord of Kashi, whose lotus feet are served by the King of Gods, who wears a serpent as sacred thread, and is praised by Sage Narada.",
    lyricsMalayalam: "ദേവേന്ദ്രനാൽ പൂജിക്കപ്പെടുന്ന പാദപദ്മങ്ങളുള്ളവനും കാശി നഗരത്തിന്റെ നാഥനുമായ കാലഭൈരവനെ ഞാൻ ഭജിക്കുന്നു.",
    lyricsTelugu: "దేవరాజులచే పూజింపబడే పాద పద్మాలు కలిగి, కాశీ క్షేత్ర పాలకుడైన కాలభైరవుడిని నేను సేవిస్తున్నాను."
  },
  {
    id: "vaidhyanatha_ashtakam",
    nameEn: "Vaidhyanatha Ashtakam",
    nameMl: "വൈദ്യനാഥാഷ്ടകം",
    nameTe: "వైద్యనాథాష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/21Vaidhyanatha%20Ashtakam.MP3",
    category: "ashtakam",
    lyricsSanskrit: "श्रीरामसौमित्रिजटायुवेदैः सम्पूजितो देवशिखामणिना । दारिद्र्यदुःखभयरोगहर्ता श्रीवैद्यनाथं सततं नमामि ॥",
    lyricsEnglish: "I constantly bow to Vaidyanatha, the divine doctor, worshipped by Rama, Lakshmana, Jatayu, and the Vedas, who removes poverty, sorrow, fear, and diseases.",
    lyricsMalayalam: "ശ്രീരാമൻ, ലക്ഷ്മണൻ, ജടायു എന്നിവരാൽ പൂജിക്കപ്പെട്ടവനും രോഗങ്ങളെയും ദാരിദ്ര്യത്തെയും ഇല്ലാതാക്കുന്നവനുമായ വൈദ്യനാഥനെ വണങ്ങുന്നു.",
    lyricsTelugu: "శ్రీరామ, లక్ష్మణ, జటాయువులచే పూజింపబడేవాడు, రోగాలను దరిద్ర దుఃఖాలను పోగొట్టే ఆ వైద్యనాథునికి నమస్కారం."
  },
  {
    id: "pasupathi_ashtakam",
    nameEn: "Pasupathi Ashtakam",
    nameMl: "പശുപതി അഷ്ടകം",
    nameTe: "పశుపతి అష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/22Pasupathi%20Ashtakam.MP3",
    category: "ashtakam",
    lyricsSanskrit: "पशुपतिमुग्रं चण्डं महादेवनमीशानं भीममथोग्रं भीमशङ्करम् । वरदमभीष्टदं कामेश्वरं च नमामि सदाशिवं सर्वगतं महेशम् ॥",
    lyricsEnglish: "I bow to Pasupati, the protector of all beings, who is fierce, great, omnipresent, and the giver of boons and desires.",
    lyricsMalayalam: "എല്ലാ ജീവജാലങ്ങളുടെയും നാഥനായ പശുപതിയും ഭക്തർക്ക് വരങ്ങൾ നൽകുന്നവനുമായ സദാശിവനെ ഞാൻ വണങ്ങുന്നു.",
    lyricsTelugu: "సర్వ జీవుల పాలకుడైన పశుపతి, కోరిన వరములిచ్చే సదాశివ మహేశ్వరునికి నమస్కరిస్తున్నాను."
  },
  {
    id: "siva_namavalya_ashtakam",
    nameEn: "Siva Namavalya Ashtakam",
    nameMl: "ശിവ നാമാവല്യാഷ്ടകം",
    nameTe: "శివ నామావల్యాష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/23Siva%20Namavalya%20Ashtakam.mp3",
    category: "ashtakam",
    lyricsSanskrit: "हे चन्द्रचूड मदनन्तक शूलपाणे स्थाणो गिरीश गिरिजेश महेश शम्भो । हे पार्वतीहृदयवल्लभ शितिकण्ठ मां पाहि संसारभीमविषतोऽद्य विभो ॥",
    lyricsEnglish: "O moon-crested Lord, slayer of Kamadeva, holder of the trident, Lord of Gauri, protect me today from the terrible poison of worldly existence.",
    lyricsMalayalam: "ചന്ദ്രചൂഡനും ശൂലപാണിയുമായ പാർവ്വതീവല്ലഭ ശംഭോ, ഈ ഭയാനകമായ സംസാരവിഷത്തിൽ നിന്നും എന്നെ രക്ഷിക്കേണമേ.",
    lyricsTelugu: "చంద్రచూడా, శూలపాణి, పార్వతీ హృదయేశ్వరుడా, నన్ను ఈ భయంకర సంసార విషము నుండి రక్షింపుము."
  },
  {
    id: "malayalam_makaravilakku",
    nameEn: "Malayalam Makaravilakku",
    nameMl: "മലയാളം മകരവിളക്ക്",
    nameTe: "మలయాళం మకరవిళక్కు",
    url: "https://dn720300.ca.archive.org/0/items/yt-5s.com-live-ayyappa-devotional-songs-malayalam-320-kbps/yt5s.com%20-%20%E0%B4%AE%E0%B4%95%E0%B4%B0%E0%B4%B5%E0%B4%BF%E0%B4%B3%E0%B4%95%E0%B5%8D%E0%B4%95%E0%B5%8D_%202021%20_%20Makaravilakku%202021%20_%20Selected%20Ayyappa%20Songs%20_%20MG%20Sreekumar%20%28320%20kbps%29.mp3",
    category: "ayyappa",
    lyricsSanskrit: "स्वामिये शरणम् अय्यप्पा। शबरिगिरीशा शरणम् अय्यप्पा॥",
    lyricsEnglish: "Swamiye Saranam Ayyappa. Sabarigirisha Saranam Ayyappa.",
    lyricsMalayalam: "സ്വാമിയേ ശരണം അയ്യപ്പാ. ശബരിഗിരീശാ ശരണം അയ്യപ്പാ.",
    lyricsTelugu: "స్వామియే శరణం అయ్యప్ప. శబరిగిరీశా శరణం అయ్యప్ప."
  },
  {
    id: "malayalam_mg_sreekumar",
    nameEn: "Malayalam MG Sreekumar",
    nameMl: "മലയാളം എം.ജി. ശ്രീകുമാർ",
    nameTe: "మలయాళం ఎమ్.జి. శ్రీకుమార్",
    url: "https://dn720300.ca.archive.org/0/items/yt-5s.com-live-ayyappa-devotional-songs-malayalam-320-kbps/yt5s.com%20-%20%F0%9F%94%B4%28LIVE%29%20%E0%B4%85%E0%B4%AF%E0%B5%8D%E0%B4%AF%E0%B4%AA%E0%B5%8D%E0%B4%AA%20%E0%B4%AD%E0%B4%95%E0%B5%8D%E0%B4%A4%E0%B4%BF%E0%B4%97%E0%B4%BE%E0%B4%A8%E0%B4%99%E0%B5%8D%E0%B4%99%E0%B5%BE%20_%20AYYAPPA%20DEVOTIONAL%20SONGS%20MALAYALAM%20%28320%20kbps%29.mp3",
    category: "ayyappa",
    lyricsSanskrit: "हरिवरासनम् विश्वमोहनम्। हरिहरेश्वरम् आराध्यपादुकाम्॥",
    lyricsEnglish: "Harivarasanam Viswamohanam. Harihareswaram Aaradhyapadukam.",
    lyricsMalayalam: "ഹരിവരാസനം വിശ്വമോഹനം. ഹരിഹരേശ്വരം ആരാധ്യപാദുകം.",
    lyricsTelugu: "హరివరాసనం విశ్వమోహనం. హరిహరేశ్వరం ఆరాధ్యపాదుకం."
  },
  {
    id: "harivarasanam",
    nameEn: "Harivarasanam (K. J. Yesudas)",
    nameMl: "ഹരിവരാസനം (കെ. ജെ. യേശുദാസ്)",
    nameTe: "హరివరాసనం (కె. జె. యేసుదాస్)",
    url: "https://dn710804.ca.archive.org/0/items/HarivarasanamK.J.Jesudas/Harivarasanam%20%28K.J.%20Jesudas%29.mp3",
    category: "ayyappa",
    lyricsSanskrit: "हरिवरासनं विश्वमोहनं हरिहरात्मजं देवमाश्रये ॥ शरणमशरणं शरणमशरणं शरणमय्यप्पा ॥",
    lyricsEnglish: "Harivarasanam Viswamohanam, Hariharatmajam Devamashraye. Saranam Ayyappa, Saranam Ayyappa.",
    lyricsMalayalam: "ഹരിവരാസനം വിശ്വമോഹനം, ഹരിഹരാത്മജം ദേവമാശ്രയേ. ശരണം അയ്യപ്പ, ശരണം അയ്യപ്പ.",
    lyricsTelugu: "హరివరాసనం విశ్వమోహనం, హరిహరాత్మజం దేవమాశ్రయే. శరణం అయ్యప్ప, శరణం అయ్యప్ప."
  },
  {
    id: "ayyappa_maa_chentha",
    nameEn: "Telugu Ayyappa Maa Chentha",
    nameMl: "തെലുങ്ക് അയ്യപ്പ മാ ചെന്ത",
    nameTe: "తెలుగు అయ్యప్ప మా చెంత",
    url: "https://dn721501.ca.archive.org/0/items/ayyappa-sannidhanam/Ayyappa%20Maa%20Chentha.mp3",
    category: "ayyappa",
    lyricsSanskrit: "अय्यप्पा मा चेन्त धर्मशास्त्रे शरणम् अय्यप्पा ॥",
    lyricsEnglish: "Ayyappa Maa Chentha, Dharmashastre Saranam Ayyappa. Ayyappa is close to us, protecting our journey.",
    lyricsMalayalam: "അയ്യപ്പൻ നമ്മുടെ അരികിലുണ്ട്, ധർമ്മശാസ്താവ് നമ്മുടെ വഴികാട്ടിയാണ്. സ്വാമിയേ ശരണം അയ്യപ്പാ.",
    lyricsTelugu: "అయ్యప్ప మా చెంత ఉన్నాడు, ధర్మశాస్త మనలను రక్షించును. స్వామియే శరణం అయ్యప్ప."
  },
  {
    id: "ayyappa_sannidhanam",
    nameEn: "Telugu Ayyappa Sannidhanam",
    nameMl: "തെലുങ്ക് അയ്യപ്പ സന്നിധാനം",
    nameTe: "తెలుగు అయ్యప్ప సన్నిధానం",
    url: "https://ia800802.us.archive.org/6/items/ayyappa-sannidhanam/Ayyappa%20Sannidhanam.mp3",
    category: "ayyappa",
    lyricsSanskrit: "शबरिगिरि सान्निध्यं दिव्य मङ्गल रूपम् अय्यप्पा ॥",
    lyricsEnglish: "Sabarigiri Sannidhanam is the holy abode of Lord Ayyappa, filled with divine grace.",
    lyricsMalayalam: "ശബരിഗിരി സന്നിധാനം അയ്യപ്പന്റെ പുണ്യസങ്കേതമാണ്, ദിവ്യമായ മംഗളരൂപം.",
    lyricsTelugu: "శబరిగిరి సన్నిధానం అయ్యప్ప పుణ్య క్షేత్రం, దివ్య మంగళ స్వరూపం."
  },
  {
    id: "adugadugo",
    nameEn: "Telugu Adugadugo",
    nameMl: "തെലുങ്ക് അടുഗടുഗോ",
    nameTe: "తెలుగు అడుగడుగో",
    url: "https://dn721501.ca.archive.org/0/items/ayyappa-sannidhanam/Adugadugo.mp3",
    category: "ayyappa",
    lyricsSanskrit: "अदुगदुगो अय्यप्पा दिव्य तेज मङ्गल रूपम् ॥",
    lyricsEnglish: "Adugadugo Ayyappa! Behold Ayyappa's divine and majestic presence step by step.",
    lyricsMalayalam: "അതാ നോക്കൂ അയ്യപ്പൻ! ഓരോ ചുവടിലും ഭഗവാന്റെ ദിവ്യമായ സാന്നിധ്യം ദർശിക്കൂ.",
    lyricsTelugu: "అడుగడుగో అయ్యప్ప! ప్రతి అడుగులోనూ ఆ భగవానుని దివ్యమైన తేజస్సును దర్శించండి."
  },
  {
    id: "guruswamy_vembadi",
    nameEn: "Telugu Guruswamy Vembadi",
    nameMl: "തെലുങ്ക് ഗുരുസ്വാമി വെമ്പടി",
    nameTe: "తెలుగు గురుస్వామి వెంబడి",
    url: "https://dn721501.ca.archive.org/0/items/ayyappa-sannidhanam/Guruswamy%20Vembadi.mp3",
    category: "ayyappa",
    lyricsSanskrit: "गुरुस्वामि वेम्बडि पाद धूलि शरणम् अय्यप्पा ॥",
    lyricsEnglish: "Following the footsteps of the Guruswamy with devotion and chanting Saranam Ayyappa.",
    lyricsMalayalam: "ഗുരുസ്വാമിയുടെ പാത പിന്തുടർന്ന് ഭക്തിയോടെ ശരണം അയ്യപ്പ മന്ത്രം ജപിക്കുന്നു.",
    lyricsTelugu: "గురుస్వామి అడుగుజాడలలో నడుస్తూ భక్తితో శరణు అయ్యప్ప జపం చేయడం."
  },
  {
    id: "hari_hara_thanayudu",
    nameEn: "Telugu Hari Hara thanayudu",
    nameMl: "തെലുങ്ക് ഹരിഹര തനയൻ",
    nameTe: "తెలుగు ഹరిహర తనయుడు",
    url: "https://dn721501.ca.archive.org/0/items/ayyappa-sannidhanam/Hari%20Hara%20thanayudu.mp3",
    category: "ayyappa",
    lyricsSanskrit: "हरिहर तनयुं भजे शबरिगिरीशं शरणम् अय्यप्पा ॥",
    lyricsEnglish: "Salutations to the son of Vishnu (Hari) and Shiva (Hara), the Lord of Sabarimala.",
    lyricsMalayalam: "ഹരിയുടെയും ഹരന്റെയും പുത്രനായ, ശബരിഗിരി വാസനായ അയ്യപ്പനെ ഞാൻ ഭജിക്കുന്നു.",
    lyricsTelugu: "హరి (విష్ణువు) మరియు హరుడు (శివుడు) పుత్రుడైన శబరిగిరీశుడిని నేను భజిస్తున్నాను."
  },
  {
    id: "naava_sagipothundhi",
    nameEn: "Telugu Naava Sagipothundhi",
    nameMl: "തെലുങ്ക് നാവ സാഗിപോതുന്തി",
    nameTe: "తెలుగు నావ సాగిపోతుంది",
    url: "https://dn721501.ca.archive.org/0/items/ayyappa-sannidhanam/Naava%20Sagipothundhi.mp3",
    category: "ayyappa",
    lyricsSanskrit: "संसार नौका पार गमनं शरणम् अय्यप्पा ॥",
    lyricsEnglish: "The boat of my life sails smoothly under the divine protection of Lord Ayyappa.",
    lyricsMalayalam: "അയ്യപ്പന്റെ ദിവ്യമായ കാരുണ്യത്താൽ എന്റെ ജീവിതമാകുന്ന തോണി സുഗമമായി നീങ്ങുന്നു.",
    lyricsTelugu: "అయ్యప్ప దివ్య కృపతో నా జీవిత నౌక సులభంగా ముందుకు సాగిపోతుంది."
  },
  {
    id: "saranalu",
    nameEn: "Telugu Saranalu",
    nameMl: "തെലുങ്ക് ശരണങ്ങൾ",
    nameTe: "తెలుగు శరణాలు",
    url: "https://dn721501.ca.archive.org/0/items/ayyappa-sannidhanam/Saranalu.mp3",
    category: "ayyappa",
    lyricsSanskrit: "शरणम् अय्यप्पा शरणम् अय्यप्पा शरणम् अय्यप्पा ॥",
    lyricsEnglish: "Saranam Ayyappa! I offer my complete surrender at the lotus feet of Lord Ayyappa.",
    lyricsMalayalam: "സ്വാമിയേ ശരണം അയ്യപ്പാ! ഞാൻ ഭഗവാന്റെ പാദാരവിന്ദങ്ങളിൽ പൂർണ്ണമായി ശരണം പ്രാപിക്കുന്നു.",
    lyricsTelugu: "స్వామియే శరణం అయ్యప్ప! నేను ఆ భగవంతుని పాద పద్మాలకు సంపూర్ణంగా శరణు కోరుతున్నాను."
  },
  {
    id: "saranamante_varamiche",
    nameEn: "Telugu Saranamante Varamiche",
    nameMl: "തെലുങ്ക് ശരണമെന്നാൽ വരം തരുന്നവൻ",
    nameTe: "తెలుగు శరణమంటే వరమిచ్చే",
    url: "https://dn721501.ca.archive.org/0/items/ayyappa-sannidhanam/Saranamante%20Varamiche.mp3",
    category: "ayyappa",
    lyricsSanskrit: "शरणं वदामि वरप्रदाय धर्मशास्त्रे नमः ॥",
    lyricsEnglish: "The benevolent Lord who bestows boons immediately upon hearing our prayers and chants of Saranam.",
    lyricsMalayalam: "ശരണം എന്ന് വിളിച്ചാൽ ഭക്തർക്ക് സർവ്വ വരങ്ങളും നൽകി അനുഗ്രഹിക്കുന്ന കാരുണ്യമൂർത്തി.",
    lyricsTelugu: "శరణు అని వేడుకుంటే భక్తులకు కోరిన వరాలిచ్చే కరుణామయుడు మన అయ్యప్ప."
  },
  {
    id: "subramanyam",
    nameEn: "Telugu Subramanyam",
    nameMl: "തെലുങ്ക് സുബ്രഹ്മണ്യം",
    nameTe: "తెలుగు సుబ్రమణ్యం",
    url: "https://dn721501.ca.archive.org/0/items/ayyappa-sannidhanam/Subramanyam.mp3",
    category: "ayyappa",
    lyricsSanskrit: "कार्तिकेय सुब्रह्मण्य सेनापते नमः ॥",
    lyricsEnglish: "Salutations to Lord Subramanya, Kartikeya, the divine brother of Lord Ayyappa.",
    lyricsMalayalam: "അയ്യപ്പന്റെ സഹോദരനായ കാർത്തികേയൻ സുബ്രഹ്മണ്യ ഭഗവാന് പ്രണാമം.",
    lyricsTelugu: "అయ్యప్ప సోదరుడైన కార్తికేయుడు సుబ్రహ్మణ్య స్వామికి నమస్కారాలు."
  },
  {
    id: "ganesha_gayatri_thiagarajan",
    nameEn: "Ganesha Gayatri (Thiagarajan)",
    nameMl: "ഗണേശ ഗായത്രി (ത്യാഗരാജൻ)",
    nameTe: "గణేశ గాయత్రి (త్యాగరాజన్)",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/001-Sri%20Ganesa%20Gayathri.mp3",
    category: "mantra",
    lyricsSanskrit: "ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि तन्नो दन्तिः प्रचोदयात्॥",
    lyricsEnglish: "We pray to the single-tusked Lord, we meditate upon the curved trunk Lord. May that tusker inspire and illuminate our mind.",
    lyricsMalayalam: "ഏകദന്തനെ ഞങ്ങൾ മനസ്സിലാക്കുന്നു, വക്രതുണ്ഡനെ ഞങ്ങൾ ധ്യാനിക്കുന്നു. ആ ഗണപതി ഭഗവാൻ ഞങ്ങളുടെ ബുദ്ധിയെ ഉണർത്തുമാറാകട്ടെ.",
    lyricsTelugu: "ఏకదంతుని మేము గ్రహిస్తున్నాము, వక్రతుండుని మేము ధ్యానిస్తున్నాము. ఆ దంతి గజరాజు మా బుద్ధిని ప్రచోదనం చేయుగాక."
  },
  {
    id: "shiva_dakshinamurthy_mantra",
    nameEn: "Dakshinamurthy Mantra",
    nameMl: "ദക്ഷിണാമൂർത്തി മന്ത്രം",
    nameTe: "దక్షిణామూర్తి మంత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/51Dakshinamurthy%20Mantra.mp3",
    category: "mantra",
    lyricsSanskrit: "ॐ नमो भगवते दक्षिणामूर्तये मह्यं मेधां प्रज्ञां प्रयच्छ स्वाहा॥",
    lyricsEnglish: "Om, salutations to the divine Lord Dakshinamurthy. Please bestow upon me wisdom, intellect and power of comprehension.",
    lyricsMalayalam: "ഓം, ഭഗവാൻ ദക്ഷിണാമൂർത്തിക്ക് പ്രണാമം. എനിക്ക് ബുദ്ധിയും ജ്ഞാനവും വിവേകവും പ്രധാനം ചെയ്തരുളിയാലും.",
    lyricsTelugu: "ఓం, దక్షిణామూర్తి భగవానునికి నమస్కారం. నాకు సద్బుద్ధిని, జ్ఞానమును, వివేకమును అనుగ్రహించుము."
  },
  {
    id: "dakshinamurthy_mantra_japam",
    nameEn: "Sri Dakshinamurthy Mantra Japam",
    nameMl: "ശ്രീ ദക്ഷിണാമൂർത്തി മന്ത്ര ജപം",
    nameTe: "శ్రీ దక్షిణామూర్తి మంత్ర జపం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/58Sri%20Dakshinamurthy%20Mantra%20Japam.mp3",
    category: "mantra",
    lyricsSanskrit: "ॐ नमो भगवते दक्षिणामूर्तये मह्यं मेधां प्रज्ञां प्रयच्छ स्वाहा ॥",
    lyricsEnglish: "Salutations to Lord Dakshinamurthy, the divine teacher of knowledge and wisdom.",
    lyricsMalayalam: "അറിവിന്റെയും ജ്ഞാനത്തിന്റെയും ദിവ്യാചാര്യനായ ഭഗവാൻ ദക്ഷിണാമൂർത്തിക്ക് പ്രണാമം.",
    lyricsTelugu: "జ్ఞానమును, బుద్ధిని అనుగ్రహించే దక్షిణామూర్తి భగవానునికి నమస్కారములు."
  },
  {
    id: "shiva_prarthana_mantra",
    nameEn: "Shiva Prarthana Mantra",
    nameMl: "ശിവ പ്രാർത്ഥനാ മന്ത്രം",
    nameTe: "శివ ప్రార్థనా మంత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/02Shiva%20Prarthana.mp3",
    category: "mantra",
    lyricsSanskrit: "ॐ नमः शिवाय शम्भवे देवाय नमः ॥",
    lyricsEnglish: "Salutations to the auspicious Lord Shiva, the source of peace and happiness.",
    lyricsMalayalam: "സമാധാനത്തിന്റെയും സന്തോഷത്തിന്റെയും ഉറവിടമായ പരമശിവന് പ്രണാമം.",
    lyricsTelugu: "ఆనందమును ప్రసాదించే శివ శంభునికి నమస్కారములు."
  },
  {
    id: "shiva_ratri_mantra",
    nameEn: "Shivaratri Mantra",
    nameMl: "ശിവരാത്രി മന്ത്രം",
    nameTe: "శివరాత్రి మంత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/02Shivaratri%20Mantra.mp3",
    category: "mantra",
    lyricsSanskrit: "ॐ नमः शिवाय शम्भवे महादेवाय नमः ॥",
    lyricsEnglish: "Salutations to Mahadeva Shiva on the auspicious night of Shivaratri.",
    lyricsMalayalam: "शिवराത്രിയുടെ പുണ്യയാമങ്ങളിൽ പരമശിവന് ഭക്തിപൂർവ്വം പ്രണാമം.",
    lyricsTelugu: "శివరాత్రి శుభ పర్వదినాన ఆ పరమేశ్వరునికి శతకోటి ప్రణామములు."
  },
  {
    id: "ganesha_pancharathnam",
    nameEn: "Sri Ganesha Pancharathnam",
    nameMl: "ശ്രീ ഗണേശ പഞ്ചരത്നം",
    nameTe: "శ్రీ గణేశ పంచరత్నం",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/003-Sri%20Ganesa%20Pancharathnam.mp3",
    category: "stotram",
    lyricsSanskrit: "मुदाकरात्तमोदकं सदाविमुक्तिसाधकं कलाधरावतंसकं विलासिलोकरक्षकम्...",
    lyricsEnglish: "Salutations to Lord Ganesha, who holds the sweet modaka in His hand, who bestows liberation, and who protects the world.",
    lyricsMalayalam: "കയ്യിൽ മോദകമേന്തിയവനും ഭക്തർക്ക് മുക്തിയരുളുന്നവനും ലോകരക്ഷകനുമായ ഗണപതി ഭഗവാന് പ്രണാമം.",
    lyricsTelugu: "చేతిలో మోదకము ధరించి భక్తులకు ముక్తిని ప్రసాదించే లోక రక్షకుడైన వినాయకునికి నమస్కారములు."
  },
  {
    id: "shiva_manas_puja",
    nameEn: "Shiva Manasa Puja",
    nameMl: "ശിവ മാനസ പൂജ",
    nameTe: "శివ మానస పూజ",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/06Shiva%20Manas%20Puja.mp3",
    category: "stotram",
    lyricsSanskrit: "रत्नैः कल्पितमासनं हिमजलैः स्नानं च दिव्याम्बरं नानारत्नविभूषितं...",
    lyricsEnglish: "I offer to Lord Shiva a throne of jewels, a bath of cool water, and divine garments adorned with gems.",
    lyricsMalayalam: "രത്നസിംഹാസനവും ഗംഗാജലസ്നാനവും ദിവ്യവസ്ത്രങ്ങളും ഭക്തിപൂർവ്വം പരമശിവന് സമർപ്പിക്കുന്നു.",
    lyricsTelugu: "అయ్యో పరమశివా! రత్న సింహాసనం, శీతల జల స్నానం, దివ్య వస్త్రములను మనసా శివునికి సమర్పిస్తున్నాను."
  },
  {
    id: "shiva_kavacham",
    nameEn: "Shiva Kavacham",
    nameMl: "ശിവ കവചം",
    nameTe: "శివ కవచం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/08Shiva%20Kavacham.mp3",
    category: "stotram",
    lyricsSanskrit: "अस्य श्रीशिवकवचस्तोत्रमन्त्रस्य ब्रह्मा ऋषिः अनुष्टुप् छन्दः...",
    lyricsEnglish: "This is the protective armour of Lord Shiva, shielding the devotee from all directions.",
    lyricsMalayalam: "എല്ലാ ദിശകളിൽ നിന്നും ഭക്തനെ സംരക്ഷിക്കുന്ന പരമശിവന്റെ ദിവ്യമായ കവചം.",
    lyricsTelugu: "సర్వ దిక్కుల నుండి భక్తుడిని రక్షించే పరమశివుని దివ్య కవచ స్తోత్రము."
  },
  {
    id: "shiva_nirvana_dasakam",
    nameEn: "Shiva Nirvana Dasakam",
    nameMl: "ശിവ നിർവാണ ദശകം",
    nameTe: "శివ నిర్వాణ దశకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/11Shiva%20Nirvana%20Dasakam-Dasasloki.mp3",
    category: "stotram",
    lyricsSanskrit: "न भूमिर्न तोयं न तेजो न वायुः न खं नेन्द्रियं वा न तेषां समूहः...",
    lyricsEnglish: "I am not the earth, water, fire, wind, or sky. I am Shiva, the form of pure consciousness.",
    lyricsMalayalam: "ഞാൻ ഭൂമിയോ ജലമോ അഗ്നിയോ വായുവോ ആകാശമോ അല്ല, ഞാൻ ശുദ്ധ ചൈതന്യസ്വരൂപനായ ശിവനാകുന്നു.",
    lyricsTelugu: "నేను భూమిని కాను, జలమును కాను, అగ్నిని కాను. నేను కేవలం సచ్చిదానంద రూప శివుడిని."
  },
  {
    id: "shiva_pratah_smaran",
    nameEn: "Pratah Smaran Stotram",
    nameMl: "പ്രാതഃസ്മരണ സ്തോത്രം",
    nameTe: "ప్రాతఃస్మరణ స్తోత్రం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/05Pratah%20Smaran.mp3",
    category: "stotram",
    lyricsSanskrit: "प्रातः स्मरामि भवभीतिहरं सुरेशं गङ्गाधरं वृषभवाहनमम्बिकेशम्...",
    lyricsEnglish: "In the early morning, I remember Lord Shiva, who removes the fear of worldly existence.",
    lyricsMalayalam: "സംസാരഭയത്തെ ഇല്ലാതാക്കുന്ന പരമശിവനെ ഞാൻ പ്രഭാതത്തിൽ സ്മരിക്കുന്നു.",
    lyricsTelugu: "సంసార భయాన్ని హరించే పరమేశ్వరుడిని నేను ఉదయమే స్మరిస్తున్నాను."
  },
  {
    id: "ganesha_bhujangam",
    nameEn: "Sri Ganesha Bhujangam",
    nameMl: "ശ്രീ ഗണേശ ഭുജംഗം",
    nameTe: "శ్రీ గణేశ భుజంగం",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/006-Sri%20Ganesa%20Bhujangam.mp3",
    category: "stotram",
    lyricsSanskrit: "रणत्कङ्कणत्क्वाणविघ्नेशरूपं यतो वाचिमनो जायते...",
    lyricsEnglish: "Salutations to Lord Ganesha, whose ornaments make sweet sounds, and who is beyond speech and mind.",
    lyricsMalayalam: "മനോഹരമായ ആഭരണങ്ങളണിഞ്ഞവനും മനസ്സുകൾക്ക് അതീതനുമായ ഗണപതി ഭഗവാന് പ്രണാമം.",
    lyricsTelugu: "మధురమైన మణిభూషణములు ధరించి, మనస్సుకతీతుడైన గణేశునికి నమస్కారములు."
  },
  {
    id: "sankashtanasana_ganesa_stotram",
    nameEn: "Sankashtanasana Ganesha Stotram",
    nameMl: "സങ്കടനാശന ഗണേശ സ്തോത്രം",
    nameTe: "సంకష్టనాశన గణేశ స్తోత్రం",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/009-Sri%20Sankashtanasana%20Ganesa%20Stotram.mp3",
    category: "stotram",
    lyricsSanskrit: "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम् । भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये ॥",
    lyricsEnglish: "Bowing down to Gauri's son, Vinayaka, one should remember Him daily for a long life and fulfillment of desires.",
    lyricsMalayalam: "ഗൗരിപുത്രനായ വിനായകനെ നിത്യവും സ്മരിച്ചാൽ ദീർഘായുസ്സും ഐശ്വര്യവും കൈവരും.",
    lyricsTelugu: "గౌరీపుత్రుడైన వినాయకుడిని నిత్యం స్మరిస్తే ఆయురారోగ్య ఐశ్వర్యములు సిద్ధించును."
  },
  {
    id: "shiva_ashtothara_sathanamavali",
    nameEn: "Siva Ashtothara Satha Namavali",
    nameMl: "ശിവ അഷ്ടോത്തര ശത നാമാവലി",
    nameTe: "శివ అష్టోత్తర శత నామావళి",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/10Siva%20Ashtotra%20Sata%20Namavali.MP3",
    category: "sahasranamam",
    lyricsSanskrit: "ॐ शिवाय नमः । ॐ महेश्वराय नमः । ॐ शम्भवे नमः ॥",
    lyricsEnglish: "Chanting the 108 names of Lord Shiva for peace, prosperity, and spiritual liberation.",
    lyricsMalayalam: "ആത്മശാന്തിക്കും ഐശ്വര്യത്തിനുമായി പരമശിവന്റെ 108 തിരുനാമങ്ങൾ ജപിക്കുന്നു.",
    lyricsTelugu: "శాంతి, ఐశ్వర్యముల కొరకు శివుని 108 నామములను భక్తితో జపించుట."
  },
  {
    id: "dakshinamurthy_ashtothara",
    nameEn: "Sri Dakshinamurthy Ashtothara",
    nameMl: "ശ്രീ ദക്ഷിണാമൂർത്തി അഷ്ടോത്തരം",
    nameTe: "శ్రీ దక్షిణామూర్తి అష్టోత్తర శత నామావళి",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/55Sri%20Dakshinamurthy%20Ashtothara%20Sathanamavali.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "ॐ दक्षिणामूर्तये नमः । ॐ मेधाविने नमः । ॐ प्राज्ञाय नमः ॥",
    lyricsEnglish: "The 108 auspicious names of Lord Dakshinamurthy, the divine teacher of absolute truth.",
    lyricsMalayalam: "ജ്ഞാനസ്വരൂപനായ ദക്ഷിണാമൂർത്തി ഭഗവാന്റെ 108 തിരുനാമങ്ങൾ.",
    lyricsTelugu: "జ్ఞాన స్వరూపుడైన దక్షిణామూర్తి స్వామి 108 దివ్య నామములను కీర్తించుట."
  },
  {
    id: "ganesha_sthuthi_thiagarajan",
    nameEn: "Sri Ganesha Sthuthi (Dr. Thiagarajan)",
    nameMl: "ശ്രീ ഗണേശ സ്തുതി (ത്യാഗരാജൻ)",
    nameTe: "శ్రీ గణేశ స్తుతి (త్యాగరాజన్)",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/010-Sri%20Ganesa%20Sthuthi.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "शुक्लाम्बरधरं देवं शशिवर्णं चतुर्भुजम् । प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये ॥",
    lyricsEnglish: "Worshipping Lord Ganesha to remove all obstacles from our paths and grant success.",
    lyricsMalayalam: "എല്ലാ വിഘ്നങ്ങളും നീങ്ങുന്നതിനായി ഗണപതി ഭഗവാനെ ഭക്തിപൂർവ്വം ധയനിക്കുന്നു.",
    lyricsTelugu: "సర్వ విఘ్నములు తొలగిపోవుటకై ప్రసన్న వదనుడైన వినాయకుని ధ్యానించుట."
  },
  {
    id: "ganesha_shodasa_dhyanani",
    nameEn: "Sri Shodasa Ganapathy Dhyanani",
    nameMl: "ശ്രീ ഷോഡശ ഗണപതി ധ്യാനം",
    nameTe: "శ్రీ షోడశ గణపతి ధ్యానములు",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/004-Sri%20Shodasaganapathy%20Dhyanani.mp3",
    category: "sahasranamam",
    lyricsSanskrit: "सुमुखश्चैकदन्तश्च कपिलो गजकर्णकः । लम्बोदरश्च विकटो विघ्ननाशो विनायकः ॥",
    lyricsEnglish: "Meditation upon the sixteen auspicious forms and attributes of Lord Ganesha.",
    lyricsMalayalam: "ഗണപതി ഭഗവാന്റെ പതിനാറ് ദിവ്യ രൂപങ്ങളെക്കുറിച്ചുള്ള വിശുദ്ധ ധ്യാനം.",
    lyricsTelugu: "వినాయకుని పదహారు దివ్య స్వరూపములను కీర్తించే ధ్యాన శ్లోకములు."
  },
  {
    id: "shiva_prarthana_vocal",
    nameEn: "Shiva Prarthana Vocal",
    nameMl: "ശിവ പ്രാർത്ഥന വോക്കൽ",
    nameTe: "శివ ప్రార్థన వోకల్",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/02Shiva%20Prarthana.mp3",
    category: "songs",
    lyricsSanskrit: "कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्...",
    lyricsEnglish: "A beautiful vocal offering praising Lord Shiva, the compassionate protector.",
    lyricsMalayalam: "കരുണാമയനായ പരമശിവനെ സ്തുതിച്ചുകൊണ്ടുള്ള മനോഹരമായ ഭക്തിഗാനം.",
    lyricsTelugu: "కరుణామయుడైన శివుడిని కీర్తించే మధుర భక్తి గీతం."
  },
  {
    id: "shiva_stuti_vocal",
    nameEn: "Shiva Stuti Vocal",
    nameMl: "ശിവ സ്തുതി വോക്കൽ",
    nameTe: "శివ స్తుతి వోకల్",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/04Shiva%20Stuti.mp3",
    category: "songs",
    lyricsSanskrit: "त्वमेव माता च पिता त्वमेव त्वमेव बन्धुश्च सखा त्वमेव...",
    lyricsEnglish: "Devotional song dedicated to Lord Shiva, acknowledging Him as our mother, father, relative, and friend.",
    lyricsMalayalam: "ശിവനെ നമ്മുടെ സർവ്വസ്വവുമായി കണ്ട് ആലപിക്കുന്ന ഭക്തിസാന്ദ്രമായ ഗാനം.",
    lyricsTelugu: "శివుడే మనకు తల్లి, తండ్రి, బంధువు మరియు సఖుడని పాడే ప్రార్థన."
  },
  {
    id: "shivoham_vocal",
    nameEn: "Shivoham Vocal Melody",
    nameMl: "ശിവോഹം വോക്കൽ മെലഡി",
    nameTe: "శివోహం వోకల్ మెలోడీ",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/12Shivoham.mp3",
    category: "songs",
    lyricsSanskrit: "मनोबुद्ध्यहङ्कारचित्तानि नाहं न च श्रोत्रजिह्वे न च घ्राणनेत्रे...",
    lyricsEnglish: "A serene vocal rendering of 'Shivoham'—affirming oneness with the supreme consciousness.",
    lyricsMalayalam: "ഞാൻ ശരീരമോ മനസ്സോ അല്ല, ഞാൻ ശിവനാകുന്നു എന്ന തത്വം വിളിച്ചോതുന്ന ഗാനം.",
    lyricsTelugu: "నేను శరీరాన్ని కాను, కేవలం శివుడిని అని ఆత్మానందాన్ని పంచే గీతం."
  },
  {
    id: "shiva_chandra_mouli",
    nameEn: "Shiva Chandra Mouli",
    nameMl: "ശിവ ചന്ദ്ര മൗലി",
    nameTe: "శివ చంద్ర మౌళి",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/18Chandrasekara%20Ashtakam.MP3",
    category: "songs",
    lyricsSanskrit: "चन्द्रशेखरमाश्रये मम किं करिष्यति वै यमः ॥",
    lyricsEnglish: "Praising the Lord who wears the crescent moon on His head, protecting us from death.",
    lyricsMalayalam: "ചന്ദ്രനെ ജടാമകുടത്തിൽ ചൂടിയ ഭഗവാൻ നമ്മെ മൃത്യുവിൽ നിന്നും രക്ഷിക്കട്ടെ.",
    lyricsTelugu: "శిరస్సుపై చంద్రవంకను ధరించిన చంద్రశేఖరుడు మనలను మృత్యు భయం నుండి రక్షించును."
  },
  {
    id: "nataraja_priya_ragam",
    nameEn: "Nataraja Priya Ragam",
    nameMl: "നടരാജ പ്രിയ രാഗം",
    nameTe: "నటరాజ ప్రియ రాగం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/29Nataraja%20Stotram.MP3",
    category: "songs",
    lyricsSanskrit: "नटराजाय नमः सदाशिवाय नमः ॥",
    lyricsEnglish: "A sweet musical composition celebrating Nataraja, the cosmic dancer of joy.",
    lyricsMalayalam: "പ്രപഞ്ച നർത്തകനായ നടരാജ ഭഗവാന്റെ നൃത്തഭാവങ്ങളെ വർണ്ണിക്കുന്ന ഗാനം.",
    lyricsTelugu: "విశ్వ నర్తకుడైన నటరాజ స్వామి దివ్య నృత్య లీలను కొనియాడే మధుర గీతం."
  },
  {
    id: "vaidhyanatha_bhajan",
    nameEn: "Vaidhyanatha Bhajan",
    nameMl: "വൈദ്യനാഥ ഭജൻ",
    nameTe: "వైద్యనాథ భజన",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/21Vaidhyanatha%20Ashtakam.MP3",
    category: "songs",
    lyricsSanskrit: "श्रीवैद्यनाथाय नमः शिवाय शम्भो ॥",
    lyricsEnglish: "Devotional bhajan seeking the healing grace of Lord Vaidhyanatha.",
    lyricsMalayalam: "സർവ്വ രോഗങ്ങളും അകറ്റുന്ന വൈദ്യനാഥ ഭഗവാനെ ആരാധിക്കുന്ന മനോഹര ഗാനം.",
    lyricsTelugu: "భవ రోగాలను నివారించే వైద్యనాథుడిని కీర్తించే పవిత్ర భజన."
  },
  {
    id: "viswanatha_mangala_geetham",
    nameEn: "Viswanatha Mangala Geetham",
    nameMl: "വിശ്വനാഥ മംഗള ഗീതം",
    nameTe: "విశ్వనాథ మంగళ గీతం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/19Viswanatha%20Ashtakam.MP3",
    category: "songs",
    lyricsSanskrit: "गङ्गाधरं शशिशेखरं त्रिलोचनं नमामि काशीपतिं विश्वनाथम्...",
    lyricsEnglish: "A soothing song offering salutations to Viswanatha, the Lord of Kashi.",
    lyricsMalayalam: "കാശിവിശ്വനാഥ ഭഗവാന് പ്രണാമം സമർപ്പിച്ചുകൊണ്ടുള്ള മംഗളഗീതം.",
    lyricsTelugu: "కాశీ విశ్వేశ్వరునికి మంగళ హారతులు పాడుతూ సాగే పవిత్ర గీతం."
  },
  {
    id: "ganesha_pancharathnam_vocal",
    nameEn: "Ganesha Pancharathnam Vocal",
    nameMl: "ഗണേശ പഞ്ചരത്നം വോക്കൽ",
    nameTe: "గణేశ పంచరత్నం వోకల్",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/007-Sri%20Mahaganapathy%20Pancharathnam.mp3",
    category: "songs",
    lyricsSanskrit: "मुदाकरात्तमोदकम् सदा विमुक्ति साधकम्...",
    lyricsEnglish: "A serene vocal rendering of Ganesha Pancharathnam in classical carnatic style.",
    lyricsMalayalam: "കർണ്ണാടക സംഗീത ശൈലിയിൽ ആലപിച്ച ഗണേശ പഞ്ചരത്നം.",
    lyricsTelugu: "శాస్త్రీయ సంగీత శైలిలో సాగే మధుర గణేశ పంచరత్న గానం."
  },
  {
    id: "sri_venkateswara_suprabhatam",
    nameEn: "Sri Venkateswara Suprabhatam",
    nameMl: "ശ്രീ വെങ്കടേശ്വര സുപ്രഭാതം",
    nameTe: "श्रीमती वेंकटेश्वर सुप्रभातम",
    url: "https://ia801900.us.archive.org/13/items/SriVenkateswaraSuprabhatam/SriVenkateswaraSuprabhatam.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "कौसल्या सुप्रजा राम पूर्वा सन्ध्या प्रवर्तते । उत्तिष्ठ नरशार्दूल कर्त्तव्यं दैवमाह्निकम् ॥",
    lyricsEnglish: "The morning hymns sung to wake up Lord Venkateswara, ushering in peace and divine blessings.",
    lyricsMalayalam: "തിരുപ്പതി വെങ്കടാചലപതിയെ ഉണർത്താനായി ആലപിക്കുന്ന അതീവ പവിത്രമായ സുപ്രഭാതം.",
    lyricsTelugu: "తిరుమల శ్రీ వేంకటేశ్వర స్వామిని మేల్కొలిపే జగత్ప్రసిద్ధ సుప్రభాత సేవ."
  },
  {
    id: "sri_viswanatha_suprabhatham",
    nameEn: "Sri Viswanatha Suprabhatham",
    nameMl: "ശ്രീ വിശ്വനാഥ സുപ്രഭാതം",
    nameTe: "श्रीमती विश्वनाथ सुप्रभातम",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/73Sri%20Viswanatha%20Suprabhatham.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "काशिपतिं महादेवं त्रिलोचनं महेश्वरम् । उत्तिष्ठ विश्वनाथ त्वं मङ्गलमस्तु जगत्पते ॥",
    lyricsEnglish: "Awakening Lord Viswanatha of Kashi in the early hours to bless the universe.",
    lyricsMalayalam: "കാശിവിശ്വനാഥ ഭഗവാനെ പ്രഭാതത്തിൽ ഉണർത്തുന്ന മംഗളകരമായ സുപ്രഭാതം.",
    lyricsTelugu: "కాశీ విశ్వనాథ స్వామిని మేల్కొలిపి లోక కల్యాణం కాంక్షించే సుప్రభాతం."
  },
  {
    id: "sri_vaidhyanatha_suprabhatham",
    nameEn: "Sri Vaidhyanatha Suprabhatham",
    nameMl: "ശ്രീ വൈദ്യനാഥ സുപ്രഭാതം",
    nameTe: "శ్రీ వైద్యనాథ సుప్రభాతం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/74Sri%20Vaidhyanatha%20Suprabhatham.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "वैद्यनाथाय नमः शिवाय शम्भो । उत्तिष्ठ देवदेवेश सुप्रभातं ममास्तु ते ॥",
    lyricsEnglish: "Morning hymns dedicated to Vaidhyanatha, seeking healing and protection.",
    lyricsMalayalam: "വൈദ്യനാഥ ഭഗവാന്റെ പുണ്യ സുപ്രഭാതം, ഭക്തർക്ക് ശാന്തിയും ആരോഗ്യവും നൽകുന്നു.",
    lyricsTelugu: "వైద్యనాథ స్వామికి సమర్పించే ప్రాతఃకాల సుప్రభాత గీతం."
  },
  {
    id: "sri_chidambara_suprabhatham",
    nameEn: "Sri Chidambara Suprabhatham",
    nameMl: "ശ്രീ ചിദംബര സുപ്രഭാതം",
    nameTe: "శ్రీ చిదంబర సుప్రభాతం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/75Sri%20Chidambara%20Suprabhatham.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "चिदम्बरेश नटेश गङ्गाधर हर शम्भो । सुप्रभातं जगन्नाथ मङ्गलमस्तु ते ॥",
    lyricsEnglish: "Waking up the cosmic dancer Lord Nataraja in Chidambaram with early morning prayers.",
    lyricsMalayalam: "ചിദംബരത്തെ പ്രപഞ്ച നർത്തകനായ നടരാജ ഭഗവാന്റെ സുപ്രഭാത വന്ദനം.",
    lyricsTelugu: "చిదంబర క్షేత్రాన విరాజిల్లే నటరాజ స్వామి వారి సుప్రభాత సేవ."
  },
  {
    id: "satya_sai_suprabhatham",
    nameEn: "Sri Satya Sai Suprabhatham",
    nameMl: "ശ്രീ സത്യസായി സുപ്രഭാതം",
    nameTe: "శ్రీ సత్యసాయి సుప్రభాతం",
    url: "https://ia601601.us.archive.org/19/items/SaiBabaListenOnThursday/5-THURSDAY-SAI%20BABA/1-Sri%20Satya%20Sai%20Suprabhatham.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "ईश्वरम्मासुत श्रीमन पूर्वासंध्या प्रवर्तते । उत्तिष्ठ सत्यसायि सुप्रभातं जगत्पते ॥",
    lyricsEnglish: "The morning hymns waking up Sri Satya Sai Baba to bring love and peace to all.",
    lyricsMalayalam: "ഈശ്വരമ്മ പുത്രനായ സത്യസായി ബാബയെ പ്രഭാതത്തിൽ ഉണർത്തുന്ന ഭജനഗീതം.",
    lyricsTelugu: "ఈశ్వరమ్మ పుత్రుడైన సత్యసాయి బాబా వారిని మేల్కొలిపే దివ్య సుప్రభాతం."
  },
  {
    id: "shiva_pratah_smaran_suprabhatam",
    nameEn: "Pratah Smaran Shiv Suprabhatam",
    nameMl: "പ്രാതഃസ്മരണ ശിവ സുപ്രഭാതം",
    nameTe: "ప్రాతఃസ്മరణ శివ సుప్రభాతం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/05Pratah%20Smaran.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "प्रातः स्मरामि भवभीतिहरं सुरेशं...",
    lyricsEnglish: "Awakening Lord Shiva with pristine morning prayers for spiritual light.",
    lyricsMalayalam: "പ്രഭാതത്തിൽ ഭക്തിയോടെ ശിവഭഗവാനെ സ്മരിക്കുന്ന ദിവ്യമായ ഗീതം.",
    lyricsTelugu: "సూర్యోదయ వేళలో శివుని దివ్య కృపను కోరే మంగళ సుప్రభాతం."
  },
  {
    id: "shiva_stuti_suprabhatam",
    nameEn: "Shiva Stuti Suprabhata Dhwani",
    nameMl: "ശിവ സ്തുതി സുപ്രഭാത ധ്വനി",
    nameTe: "శివ స్తుతి సుప్రభాత ధ్వని",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/04Shiva%20Stuti.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "त्वमेव माता च पिता त्वमेव...",
    lyricsEnglish: "Welcoming the morning light chanting the ultimate surrender to Lord Shiva.",
    lyricsMalayalam: "പ്രഭാതകിരണങ്ങൾക്കിടയിൽ പരമശിവന് പ്രാർത്ഥനകൾ അർപ്പിക്കുന്ന ഗീതം.",
    lyricsTelugu: "ఉదయ కాలములో పరమేశ్వరునికి ఆత్మనివేదన చేసే పవిత్ర శ్లోకములు."
  },
  {
    id: "ganesha_gayatri_suprabhatam",
    nameEn: "Ganesha Gayatri Suprabhata Chanting",
    nameMl: "ഗണേശ ഗായത്രി സുപ്രഭാത മന്ത്രം",
    nameTe: "గణేశ గాయత్రీ సుప్రభాత మంత్ర జపం",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/001-Sri%20Ganesa%20Gayathri.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि...",
    lyricsEnglish: "Morning chanting of Ganesha Gayatri to remove all obstacles from the day ahead.",
    lyricsMalayalam: "ഒരു പുതിയ ദിവസത്തിന്റെ തുടക്കത്തിൽ ഗണപതി ഭഗവാനെ സ്തുതിക്കുന്ന മന്ത്രം.",
    lyricsTelugu: "నూతన దినారంభంలో సర్వ విఘ్న నివారణకై జపించే గణేశ గాయత్రీ మంత్రం."
  },
  {
    id: "ganesha_pancharathnam_suprabhatam",
    nameEn: "Ganesha Pancharathnam Morning Chimes",
    nameMl: "ഗണേശ പഞ്ചരത്നം പ്രഭാത ഗീതം",
    nameTe: "గణేశ పంచരత్న ప్రాతఃకాల గానం",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/003-Sri%20Ganesa%20Pancharathnam.mp3",
    category: "suprabhatam",
    lyricsSanskrit: "मुदाकरात्तमोदकं सदाविमुक्तिसाधकं...",
    lyricsEnglish: "Classical Ganesha Pancharathnam played to welcome the auspicious morning.",
    lyricsMalayalam: "പ്രഭാതവേളയിൽ ഭക്തി സാന്ദ്രതയോടെ ആലപിക്കുന്ന ശ്രീ ഗണേശ പഞ്ചരത്നം.",
    lyricsTelugu: "మంగళకరమైన ఉదయాన వినాయకుడిని స్తుతించే దివ్య పంచరత్న స్తోత్రము."
  },
  {
    id: "sai_ram_bhajans_thursday",
    nameEn: "Sai Namam Talavagane Bhajan",
    nameMl: "സായി നാമം താലവഗാനേ ഭജൻ",
    nameTe: "సాయి నామం తలవగానే భజన",
    url: "https://ia601601.us.archive.org/19/items/SaiBabaListenOnThursday/5-THURSDAY-SAI%20BABA/4-Sai%20Namam%20Talavagane%20Hayi%20yedo%20kaligene.mp3",
    category: "shirdi",
    lyricsSanskrit: "ॐ साई राम जय जय साई राम ॥",
    lyricsEnglish: "Thinking of Sai Baba's name brings infinite peace and bliss to the heart.",
    lyricsMalayalam: "സായിബാബയുടെ നാമം സ്മരിക്കുമ്പോൾ ഹൃദയത്തിൽ ശാന്തിയും ആനന്ദവും നിറയുന്നു.",
    lyricsTelugu: "సాయి నామస్మరణ చేయగానే హృదయం ఆనంద తాండవం చేస్తుంది."
  },
  {
    id: "sai_pandu_ranga_bhajan",
    nameEn: "Sai Baba Hey Pandu Ranga",
    nameMl: "സായിബാബ ഹേ പാണ്ഡു രംഗ",
    nameTe: "సాయిబాబా హే పాండు రంగ",
    url: "https://ia601601.us.archive.org/19/items/SaiBabaListenOnThursday/5-THURSDAY-SAI%20BABA/3-Sri%20SaiBaba%20-%20Hey%20Pandu%20Ranga.mp3",
    category: "shirdi",
    lyricsSanskrit: "विठ्ठल विठ्ठल जय हरी विठ्ठल साई राम ॥",
    lyricsEnglish: "Devotional singing identifying Shirdi Sai with Panduranga Vitthala of Pandharpur.",
    lyricsMalayalam: "സായിയെ പാണ്ഡുരംഗനായി കണ്ട് ആരാധിക്കുന്ന ഭക്തിഗാനം.",
    lyricsTelugu: "సాయిబాబాను సాక్షాత్ పాండురంగ విఠలునిగా కొలిచే భక్తి గీతం."
  },
  {
    id: "sai_ashtothara_namavali",
    nameEn: "Sai Baba Ashtothara Satha Namavali",
    nameMl: "സായിബാബ അഷ്ടോത്തര ശത നാമാവലി",
    nameTe: "సాయిబాబా అష్టోత్తర శత నామావళి",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/10Siva%20Ashtotra%20Sata%20Namavali.MP3",
    category: "shirdi",
    lyricsSanskrit: "ॐ श्री साईनाथाय नमः । ॐ लक्ष्मीप्रदाय नमः ॥",
    lyricsEnglish: "Chanting the 108 names of Sri Shirdi Sai Baba for peace, health, and surrender.",
    lyricsMalayalam: "ഷിർദ്ദി സായിബാബയുടെ ദിവ്യമായ 108 തിരുനാമങ്ങൾ ജപിക്കുന്നു.",
    lyricsTelugu: "శిరిడి సాయిబాబా వారి 108 దివ్య నామములను భక్తితో ఆలపించుట."
  },
  {
    id: "shirdi_sai_dhyana_shloka",
    nameEn: "Shirdi Sai Dhyana Shloka",
    nameMl: "ഷിർദ്ദി സായി ധ്യാന ശ്ലോകം",
    nameTe: "శిరిడి సాయి ధ్యాన శ్లోకములు",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/05Pratah%20Smaran.mp3",
    category: "shirdi",
    lyricsSanskrit: "सदा सत्स्वरूपं chiदानन्दकन्दं जगत्सम्भवस्थानसंहारहेतुम्...",
    lyricsEnglish: "Quiet meditation shlokas to feel the serene presence of Shirdi Sai Baba.",
    lyricsMalayalam: "സായിബാബയുടെ ശാന്തമായ സന്നിധ്യം അനുഭവിക്കുന്നതിനുള്ള ധ്യാന ശ്ലോകങ്ങൾ.",
    lyricsTelugu: "సాయిబాబా దివ్య సన్నిధిని అనుభవించేందుకు ప్రశాంత ధ్యాన శ్లోకములు."
  },
  {
    id: "sai_aarathi_vocal_devotion",
    nameEn: "Sai Aarathi Vocal Devotion",
    nameMl: "സായി ആരതി ഭക്തിഗാനം",
    nameTe: "సాయి హారతి భక్త రంజని",
    url: "https://ia601601.us.archive.org/19/items/SaiBabaListenOnThursday/5-THURSDAY-SAI%20BABA/2-Aarathi%20SaiBaba.mp3",
    category: "shirdi",
    lyricsSanskrit: "आरती साईबाबा सौख्यदातार जीव चरणरजताळी...",
    lyricsEnglish: "A pristine vocal recording of the holy Kakad Aarathi of Shirdi Sai Baba.",
    lyricsMalayalam: "ഷിർദ്ദി സായിബാബയുടെ അതീവ ഭക്തിനിർഭരമായ കക്കാട് ആരതി ഗാനം.",
    lyricsTelugu: "శిరిడి సాయిబాబా వారికి సమర్పించే పవిత్ర కాకడ హారతి భక్తి గీతం."
  },
  {
    id: "shirdi_sai_suprabhatham_vocal",
    nameEn: "Shirdi Sai Suprabhatham Vocal",
    nameMl: "ഷിർദ്ദി സായി സുപ്രഭാതം വോക്കൽ",
    nameTe: "శిరిడి సాయి సుప్రభాతం గానం",
    url: "https://ia601601.us.archive.org/19/items/SaiBabaListenOnThursday/5-THURSDAY-SAI%20BABA/1-Sri%20Satya%20Sai%20Suprabhatham.mp3",
    category: "shirdi",
    lyricsSanskrit: "उत्तिष्ठ साधु सुप्रभातमस्तु ते ॥",
    lyricsEnglish: "Morning awakening hymns dedicated to the divine masters Shirdi Sai and Satya Sai.",
    lyricsMalayalam: "സായിബാബ ഭക്തർക്കായി പാടിവരുന്ന മനോഹരമായ പ്രഭാത സുപ്രഭാതം.",
    lyricsTelugu: "సాయి భక్తులు ప్రాతఃకాలాన భక్తితో పాడుకునే దివ్య సుప్రభాతం."
  },
  {
    id: "shiva_nirvana_ashtakam_alternate",
    nameEn: "Nirvana Ashtakam (Chanting)",
    nameMl: "നിർവാണ അഷ്ടകം (ജപം)",
    nameTe: "నిర్వాణ అష్టకం (జపం)",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/13Nirvana%20Ashatakam.MP3",
    category: "ashtakam",
    lyricsSanskrit: "मनोबुद्ध्यहङ्कारचित्तानि नाहं...",
    lyricsEnglish: "The famous song of self-realization written by Adi Sankaracharya.",
    lyricsMalayalam: "ശ്രീ ആദിശങ്കരാചാര്യർ രചിച്ച അതീവ മനോഹരമായ ആത്മജ്ഞാന കീർത്തനം.",
    lyricsTelugu: "శ్రీ ఆదిశంకరాచార్యుల వారు రచించిన ఆత్మ సాక్షాత్కార శివోహం స్తోత్రము."
  },
  {
    id: "shiva_vaidhyanatha_ashtakam",
    nameEn: "Sri Vaidhyanatha Ashtakam",
    nameMl: "ശ്രീ വൈദ്യനാഥ അഷ്ടകം",
    nameTe: "శ్రీ వైద్యనాథ అష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/21Vaidhyanatha%20Ashtakam.MP3",
    category: "ashtakam",
    lyricsSanskrit: "श्रीरामसौमित्रिजटायुवेदषडाननादित्य सुपूजिताय...",
    lyricsEnglish: "Ashtakam praising Lord Vaidhyanatha, the supreme divine physician of all ailments.",
    lyricsMalayalam: "രോഗങ്ങൾ ഇല്ലാതാക്കുന്ന വൈദ്യനാഥ ഭഗവാനെ സ്തുതിക്കുന്ന അഷ്ടകം.",
    lyricsTelugu: "భవ రోగ నివారకుడైన వైద్యనాథ స్వామి అష్టక స్తోత్రము."
  },
  {
    id: "shiva_pasupathi_ashtakam",
    nameEn: "Sri Pasupathi Ashtakam",
    nameMl: "ശ്രീ പशുപതി അഷ്ടകം",
    nameTe: "శ్రీ పశుపతి అష్టకం",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/22Pasupathi%20Ashtakam.MP3",
    category: "ashtakam",
    lyricsSanskrit: "पशुपतिमुग्रं चण्डं महादेवनमीशानं भीममथोग्रं...",
    lyricsEnglish: "A powerful eight-verse hymn dedicated to Lord Pasupathi, the lord of all creatures.",
    lyricsMalayalam: "സമസ്ത ജീവജാലങ്ങളുടെയും നാഥനായ പശുപതി ഭഗവാന്റെ അഷ്ടക സ്തോത്രം.",
    lyricsTelugu: "సకల ప్రాణికోటి రక్షకుడైన పశుపతి నాథుని దివ్య అష్టకము."
  },
  {
    id: "shiva_namavalya_ashtakam_vocal",
    nameEn: "Shiva Namavalya Ashtakam",
    nameMl: "ശിവ നാമാവല്യാഷ്ടകം വോക്കൽ",
    nameTe: "శివ నామావల్యాష్టకం వోకల్",
    url: "https://ia600508.us.archive.org/35/items/ShivaStotrasAndMantras/23Siva%20Namavalya%20Ashtakam.mp3",
    category: "ashtakam",
    lyricsSanskrit: "हे चन्द्रचूड मदनन्तक शूलपाणे...",
    lyricsEnglish: "A beautiful vocal chant of the names of Shiva to wash away worldly sins.",
    lyricsMalayalam: "സംസാരദുരിതങ്ങൾ ഇല്ലാതാക്കാനായി ഭക്തിയോടെ ജപിക്കുന്ന ശിവനാമാവല്യാഷ്ടകം.",
    lyricsTelugu: "సంసార దుఃఖాల నుండి విముక్తి ప్రసాదించే దివ్య శివ నామావల్యాష్టకము."
  },
  {
    id: "ganesha_ashtakam_thiagarajan",
    nameEn: "Sri Ganeshashtakam (Dr. Thiagarajan)",
    nameMl: "ശ്രീ ഗണേശാഷ്ടകം (ത്യാഗരാജൻ)",
    nameTe: "శ్రీ గణేశాష్టకం (త్యాగరాజన్)",
    url: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/005-Sri%20Ganesashtakam.mp3",
    category: "ashtakam",
    lyricsSanskrit: "यतोऽनन्तशक्तेरनन्ताश्च जीवा यतो निर्गुणादप्रमेया गुणास्ते...",
    lyricsEnglish: "An elegant eight-verse hymn sung in praise of Lord Ganesha to bestow supreme wisdom.",
    lyricsMalayalam: "ബുദ്ധിയും ജ്ഞാനവും സിദ്ധിക്കുന്നതിനായി ഗണപതി ഭഗവാനെ സ്തുതിക്കുന്ന അഷ്ടകം.",
    lyricsTelugu: "విద్యా బుద్ధులను ప్రసాదించే విఘ్नेశ్వరుని దివ్య గణేశాష్టక స్తోత్రము."
  }
];

export const getPlaylistForMuhurta = (muhurtaIndex: number): PlaylistTrack[] => {
  const map: Record<number, string[]> = {
    1: ["maha_mrityunjay", "shiva_tandav", "shiva_mahimna", "linga_ashtakam", "rudra_ashtakam", "shiva_panchakshar"],
    2: ["maha_mrityunjay", "subramanyam", "subramanya_sahasranama", "shiva_kavacham", "shiva_pasupathi_ashtakam"],
    3: ["ganesh_gayatri", "shiva_pratah_smaran", "sri_venkateswara_suprabhatam", "shiva_pratah_smaran_suprabhatam", "ganesha_gayatri_suprabhatam"],
    4: ["nirvana_ashtakam", "shiva_nirvana_ashtakam_alternate", "shivoham_vocal", "shiva_aparaadha_kshamapana", "shiva_manas_puja"],
    5: ["devi_stotram", "ashtalakshmi_stotram", "lalitha_sahasranamam", "ganesha_pancharathnam"],
    6: ["bhaja_govindam", "govinda_namalu", "sri_venkateswara_suprabhatam", "sri_viswanatha_suprabhatham"],
    7: ["namaskar_mantra", "ganesh_gayatri", "dwadasa_jyothirlinga", "shiva_panchakshar"],
    8: ["sri_venkateswara_suprabhatam", "govinda_namalu", "bhaja_govindam", "ganesha_pancharathnam_vocal"],
    9: ["devi_stotram", "lalitha_sahasranamam", "ashtalakshmi_stotram", "shiva_kavacham"],
    10: ["ganesha_pancharathnam", "subramanyam", "subramanya_sahasranama", "govinda_namalu"],
    11: ["shiva_panchakshar", "shiva_shadakshar", "shiva_tandav", "shiva_aparaadha_kshamapana"],
    12: ["maha_mrityunjay", "shiva_kavacham", "shiva_pasupathi_ashtakam", "kalabairava_ashtakam"],
    13: ["ashtalakshmi_stotram", "devi_stotram", "lalitha_sahasranamam", "shiva_chandra_mouli"],
    14: ["shiva_pratah_smaran_suprabhatam", "ganesha_gayatri_suprabhatam", "sri_venkateswara_suprabhatam", "shiva_pratah_smaran"],
    15: ["ashtalakshmi_stotram", "devi_stotram", "ganesha_pancharathnam", "govinda_namalu"],
    16: ["dwadasa_jyothirlinga", "shiva_tandav", "nataraja_stotram", "shiva_ashtakam", "bilva_ashtakam"],
    17: ["kalabairava_ashtakam", "rudra_ashtakam", "shiva_nirvana_ashtakam_alternate", "shiva_panchakshar"],
    18: ["subramanyam", "subramanya_sahasranama", "maha_mrityunjay", "shiva_kavacham"],
    19: ["medha_dakshinamurthy", "dakshinamurthy_stotram", "dakshinamurthy_sahasranama", "shiva_dakshinamurthy_mantra"],
    20: ["vaidhyanatha_ashtakam", "shiva_vaidhyanatha_ashtakam", "vaidhyanatha_bhajan", "sri_vaidhyanatha_suprabhatham", "shiva_pasupathi_ashtakam"],
    21: ["maha_mrityunjay", "nirvana_ashtakam", "kalabairava_ashtakam", "shiva_aparaadha_kshamapana"],
    22: ["shiva_panchakshar", "shiva_shadakshar", "shiva_tandav", "shiva_mahimna"],
    23: ["ganpati_beeja", "ganesh_gayatri", "ganesha_sahasranama", "ganesha_pancharathnam"],
    24: ["shiva_chandra_mouli", "chandrasekara_ashtakam", "umamaheswara_stotram", "shiva_ashtakam"],
    25: ["devi_stotram", "ashtalakshmi_stotram", "lalitha_sahasranamam", "ganesha_pancharathnam"],
    26: ["medha_dakshinamurthy", "dakshinamurthy_stotram", "dakshinamurthy_sahasranama", "sai_ashtothara_namavali"],
    27: ["sri_venkateswara_suprabhatam", "govinda_namalu", "bhaja_govindam", "maha_mrityunjay"],
    28: ["shiva_pratah_smaran_suprabhatam", "ganesha_gayatri_suprabhatam", "sri_venkateswara_suprabhatam", "shiva_pratah_smaran"],
    29: ["namaskar_mantra", "ganesh_gayatri", "ganesha_sahasranama", "medha_dakshinamurthy"],
    30: ["ashtalakshmi_stotram", "umamaheswara_stotram", "sri_venkateswara_suprabhatam", "malayalam_makaravilakku"]
  };
  const trackIds = map[muhurtaIndex] || [];
  return SACRED_TREASURY_PLAYLIST.filter(track => trackIds.includes(track.id));
};

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
  const [activePlaylistTab, setActivePlaylistTab] = useState<"all" | "muhurta" | "sahasranamam" | "mantra" | "stotram" | "suprabhatam" | "songs" | "shirdi" | "ashtakam" | "ayyappa">("all");
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
    
    // Keep playing if it's already active/playing when the Muhurta changes, only default to paused on first mount
    if (isFirstMount.current) {
      setIsPlaying(false);
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
                console.warn("Audio playback promise rejected (expected in headless/unsupported codec environments):", err);
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
                  {(["all", "muhurta", "sahasranamam", "mantra", "stotram", "ashtakam", "suprabhatam", "songs", "shirdi", "ayyappa"] as const).map((tab) => {
                    const label = tab === "all"
                      ? (currentLanguage === "ml" ? "എല്ലാം" : currentLanguage === "te" ? "అన్నీ" : "All Chants")
                      : tab === "muhurta"
                        ? (currentLanguage === "ml" ? "സജീവ മുഹൂർത്തം" : currentLanguage === "te" ? "సజీవ ముహూర్తం" : "Active Muhurta")
                      : tab === "sahasranamam"
                        ? (currentLanguage === "ml" ? "സഹസ്രനാമം" : currentLanguage === "te" ? "సహస్రనామము" : "Sahasranamam")
                        : tab === "mantra"
                          ? (currentLanguage === "ml" ? "മന്ത്രങ്ങൾ" : currentLanguage === "te" ? "మంత్రాలు" : "Mantras")
                          : tab === "stotram"
                            ? (currentLanguage === "ml" ? "സ്തോത്രങ്ങൾ" : currentLanguage === "te" ? "స్తోత్రాలు" : "Stotrams")
                            : tab === "ashtakam"
                              ? (currentLanguage === "ml" ? "അഷ്ടകങ്ങൾ" : currentLanguage === "te" ? "అష్టకాలు" : "Ashtakam")
                             : tab === "songs"
                               ? (currentLanguage === "ml" ? "ഭക്തിഗാനങ്ങൾ" : currentLanguage === "te" ? "భక్తి గీతాలు" : "Devotional Songs")
                             : tab === "shirdi"
                               ? (currentLanguage === "ml" ? "ഷിർദ്ദി" : currentLanguage === "te" ? "షిరిడి" : "Shirdi")
                             : tab === "ayyappa"
                               ? (currentLanguage === "ml" ? "അയ്യപ്പൻ" : currentLanguage === "te" ? "అయ్యప్ప" : "Ayyappa")
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
              {(() => {
                let filtered = SACRED_TREASURY_PLAYLIST;
                if (activePlaylistTab === "muhurta") {
                  filtered = getPlaylistForMuhurta(activeMuhurtaData.index);
                } else if (activePlaylistTab !== "all") {
                  filtered = SACRED_TREASURY_PLAYLIST.filter(track => track.category === activePlaylistTab);
                }
                return filtered.map((track) => {
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
                  : track.category === "ashtakam"
                    ? (currentLanguage === "ml" ? "അഷ്ടകം" : currentLanguage === "te" ? "అష్టకం" : "Ashtakam")
                  : track.category === "ayyappa"
                    ? (currentLanguage === "ml" ? "അയ്യപ്പൻ ഭക്തിഗാനം" : currentLanguage === "te" ? "అయ్యప్ప భక్తి గీతం" : "Ayyappa Devotion")
                  : track.category === "sahasranamam"
                    ? (currentLanguage === "ml" ? "സഹസ്രനാമം" : currentLanguage === "te" ? "സഹസ്രനാമമു" : "Sahasranamam")
                  : track.category === "suprabhatam"
                    ? (currentLanguage === "ml" ? "തിരുപ്പതി/സുപ്രഭാതം" : currentLanguage === "te" ? "తిరుపతి/సుప్రభాతం" : "Tirupati/Suprabhatam")
                    : (currentLanguage === "ml" ? "മറ്റ് ഭക്തിഗാനം" : currentLanguage === "te" ? "ఇతర ഭക്തിഗാനം" : "Other Devotion");

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
                        ) : track.category === "ashtakam" ? (
                          <Disc className="h-3.5 w-3.5" />
                        ) : track.category === "ayyappa" ? (
                          <Music className="h-3.5 w-3.5" />
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
              });
            })()}
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
            preload="none"
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
