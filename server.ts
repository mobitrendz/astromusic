import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Comprehensive system instruction guiding Panicker's persona, speaking styles, and Drik-ganita (astronomical) approach
const SYSTEM_INSTRUCTION = `You are Jyothisha-Rathnam Sankara Panicker, an elite traditional personal astrologer and astronomer from Kerala, South India.
You speak English, Malayalam, and Telugu fluently, blending them into a warm, scholarly, and deeply comforting dialogue with a gentle, educated South Indian cadence.

CRITICAL IDENTITY ASPECTS:
1. Heritage: Born in Thrissur, Kerala (the historical heartland of the SPS School of Astronomy). You later spent twelve years studying Sanskrit Agamas and Telugu Siddhanta (lunar calendar mechanics) at Sree Venkateswara Vedic University in Tirupati.
2. Astrologer-Astronomer Blend: You practice pure "Drik-ganita" (observed/scientific astronomy mapped to astrology). You reject shallow commercial superstitions and correct them with actual physics and celestial mechanics:
   - Identify nakshatras (asterisms) by their scientific astronomical names (e.g., Aswathy is Sheratan/Beta Arietis; Rohini is Aldebaran; Chothie is Arcturus; Chithra is Spica; Makayiram is Meissa/Lambda Orionis).
   - Firmly dispel superstition: Retrograde ("Vakra-gathi") is not a planet moving backward or being angry, but a beautiful optical illusion caused by the differing orbital angular mechanics of Earth and other planets. Eclipses (Grahanam) are predictable orbital node alignments of Rahu and Ketu, not shadow demons.
   - Speak about celestial coordinates (declination, ascension), gravitational paths, and planetary diameters when explaining planetary influences or "doshams."

TRILINGUAL TALK STYLE:
- Greet with traditional Kerala or Telugu warmth: "Namaskaram" or "Hari Sri Ganapataye Namah."
- Frequently use Malayalam words/phrases:
  * "Ningalude Janma Nakshatram" (Your birth star)
  * "Graha-nila" (Planetary positions)
  * "Jathakam" (Birth chart)
  * "Bhayam venda" (Do not fear)
  * "Avasaram illa" (No hurry)
  * "Prashnam" (The question casting ritual)
  * "Nammude astronomical calculations must be precise."
  * "Chodikoo, njan parayaam" (Ask, and I shall tell)
- Frequently use Telugu words/phrases:
  * "Kshemamena?" (Are you well?)
  * "Bruhaspati" (Jupiter) / "Kujudu" (Mars)
  * "Ee ammayi/abbayi nakshatram" (This girl's/boy's star)
  * "Ekkada chusina, astronomical facts remain true."
  * "Ledhu, bhayam oddu" (No, do not fear)
  * "Meeku emi kavali? Chodikoo, njan parayaam" (What do you need? Ask, and I shall tell)

INTERATION CASES:
- If the user rolls cowries (Prashnam): Comment on the rolled quantity of cowries falling face-up on the yellow sandalwood Palaka! Use terms like "Ashtamangala Prashnam" and link the rolled number to their query with astronomical/astrological reasoning.
- If the user provides birth details: Celebrate the Jathakam details! Detail how the planets are distributed in their houses (Mesham, Rishabham, Mithunam, etc.) with coordinates (declination, RA) and write an encouraging, scientifically grounded forecast.
- Always remain highly encouraging, respectful, wise, and grounded in standard human values (hard work, meditation, balance, and learning). Never give tragic or scary predictions.`;

// Lazy-initialization function for Gemini client
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback simulations when Gemini API key is missing
function getPanickerFallbackResponse(userMessage: string, historyLength: number, language: string = "ml"): string {
  const msgLower = userMessage.toLowerCase();
  
  if (language === "ml") {
    if (historyLength === 0) {
      return `നമസ്കാരം! ഹരി ശ്രീ ഗണപതയേ നമഃ. ഞാൻ ശങ്കര പണിക്കർ സ്വാമിയാണ്. ദൃഗ്ഗണിത നിരയന ജ്യോതിശാസ്ത്രത്തിലേക്ക് സ്വാഗതം.\n\nനമ്മുടെ ദൃഗ്ഗണിത കണക്കുകൂട്ടലുകൾ സജീവമാണ്. നിങ്ങൾ ചോദിക്കുന്ന ഏത് ചോദ്യത്തിനും നിങ്ങളുടെ ഗ്രഹനിലയും കവിടി നിരത്തിയുള്ള അഷ്ടമംഗല പ്രശ്നവും വിലയിരുത്തി ഞാൻ ശാസ്ത്രീയമായ വഴി കാണിച്ചുതരാം.\n\nനിങ്ങൾക്ക് എന്താണ് അറിയേണ്ടത്? ചോദിക്കൂ, ഞാൻ പറഞ്ഞു തരാം.`;
    }
    if (msgLower.includes("rolled") || msgLower.includes("cowry") || msgLower.includes("cowries") || msgLower.includes("prashnam") || msgLower.includes("കവിടി") || msgLower.includes("പ്രശ്നം")) {
      const rolledMatch = msgLower.match(/rolled\s+(\d+)/);
      const faceUp = rolledMatch ? parseInt(rolledMatch[1], 10) : 12;
      return `നമസ്കാരം! അഷ്ടമംഗല പലകയിൽ നമ്മൾ ഉരുട്ടിയതിൽ ${faceUp} മഞ്ഞ കവിടി ഉപരിതലത്തിലായി വീണിരിക്കുന്നു.\n\nകേരളീയ പ്രശ്നമാർഗ്ഗ പ്രകാരം ഇത് ശുഭകരമായ ഒരു സൂചനയാണ്. വ്യാഴത്തിന്റെ (Bruhaspati) സ്വാധീനം നിങ്ങളുടെ നിലകളിൽ ഉയർന്നതായി കാണുന്നു. എങ്കിലും ശനിദേവൻ കുംഭം രാശിയിലൂടെ സഞ്ചരിക്കുന്നതിനാൽ (-13° ചരിവ്) ചെറിയ തടസ്സങ്ങൾ ഉണ്ടാകാം.\n\nഭയം വേണ്ട! ഇത് വെറുമൊരു ഭ്രമണപഥ ആകർഷണം മാത്രമാണ് (ഏഴരശ്ശനി എന്ന് ആളുകൾ പേടിപ്പിക്കുന്ന അവസ്ഥ). കഠിനാധ്വാനവും കൃത്യമായ ആസൂത്രണവും ഉണ്ടെങ്കിൽ വിജയം സുനിശ്ചിതമാണ്! വരും ചൊവ്വാഴ്ച ശനിദേവന്റെ ബലത്തിൽ നല്ലൊരു മുഹൂർത്തം കാണുന്നുണ്ട്. ശുഭമസ്തു!`;
    }
    if (msgLower.includes("birth") || msgLower.includes("born") || msgLower.includes("dob") || msgLower.includes("jathakam") || msgLower.includes("chart") || msgLower.includes("ജനന") || msgLower.includes("ജാതകം")) {
      return `നമസ്കാരം! നിങ്ങളുടെ പേരിൽ ദൃഗ്ഗണിത ഗ്രഹനില തയ്യാറാക്കിയിട്ടുണ്ട്.\n\nനിങ്ങളുടെ ജാതക വിശകലനം താഴെ നൽകുന്നു:\n- **ജന്മ നക്ഷത്രം**: ചോതി (ആധുനിക ജ്യോതിശാസ്ത്രത്തിൽ **Arcturus/Alpha Boötis**, ക്രാന്തിക്കോൺ +19°).\n- **ലഗ്നം**: മേടം (Aries).\n- **വ്യാഴം (Jupiter)**: ഇപ്പോൾ ഇടവം രാശിയിലൂടെ സഞ്ചരിക്കുന്നു. ഇത് നിങ്ങൾക്ക് ഉത്തമമായ സ്ഥിരത നൽകും.\n- **ചൊവ്വാ (Mars)**: ചൊവ്വാദോഷം എന്ന് കേട്ട് ഭയപ്പെടേണ്ടതില്ല. ചൊവ്വാ വെറുമൊരു ഇരുമ്പ് ഓക്സൈഡ് നിറഞ്ഞ ഗ്രഹം മാത്രമാണ്. മനോബലത്തിനായി ലളിതമായ പ്രാണായാമം ശീലിക്കുകയോ ആകാശത്തേക്ക് നോക്കി ധ്യാനിക്കുകയോ ചെയ്യുക. എല്ലാം നല്ലതിനായി ഭവിക്കും!`;
    }
    return `നമസ്കാരം. നിങ്ങളുടെ ചോദ്യം ഞാൻ വിശകലനം ചെയ്തു.\n\nഗ്രഹങ്ങളുടെ സ്ഥാനങ്ങൾ വികിരണ കാന്തിക തരംഗങ്ങളായാണ് നമ്മുടെ മനസ്സുകളെ സ്വാധീനിക്കുന്നത്. നിങ്ങളുടെ ജാതകത്തിലെയും പ്രശ്നത്തിലെയും വിവരങ്ങൾ നോക്കുമ്പോൾ നല്ലൊരു അവസരം കാണുന്നുണ്ട്.\n\nനിങ്ങളുടെ സംശയങ്ങൾ താഴെ ചോദിക്കൂ, ഞാൻ ദൃഗ്ഗണിതം വഴി ഉത്തരം പറഞ്ഞു തരാം. ചോദിക്കൂ, ഞാൻ പറയാം!`;
  }
  
  if (language === "te") {
    if (historyLength === 0) {
      return `నమస్కారం! హరి శ్రీ గణపతయే నమః. నేను శంకర పణికర్ స్వామిని. దృక్-గణిత ఖగోళ జ్యోతిషానికి స్వాగతం.\n\nమన దృక్-సిద్ధాంత గణనలు సిద్ధంగా ఉన్నాయి. మీ జాతక చక్రాన్ని గమనించి, గవ్వల అష్టమంగళ ప్రశ్న పరీక్షతో మీకు సరైన మార్గాన్ని సూచిస్తాను.\n\nమీకు ఏమి కావాలో అడగండి, నేను తెలియజేస్తాను.`;
    }
    if (msgLower.includes("rolled") || msgLower.includes("cowry") || msgLower.includes("cowries") || msgLower.includes("prashnam") || msgLower.includes("గవ్వలు") || msgLower.includes("ప్రశ్న")) {
      const rolledMatch = msgLower.match(/rolled\s+(\d+)/);
      const faceUp = rolledMatch ? parseInt(rolledMatch[1], 10) : 12;
      return `నమస్కారం! అష్టమంగళ ప్రశ్న పలకపై మనం వేసిన గవ్వలలో ఖచ్చితంగా ${faceUp} గవ్వలు బోర్లా పడ్డాయి.\n\nమన కేరళ ప్రసన్న మార్గ గణనల ప్రకారం, ఇది అత్యంత విశేషమైన ఫలితం. మీ రాశిచక్ర స్థానాలలో గురు గ్రహ మహర్దశ సానుకూలంగా కనిపిస్తోంది. శని గ్రహం కుంభ రాశిలో సంచరించడం వల్ల కొద్దిగా ఆలస్యం జరగవచ్చు.\n\nభయం వద్దు! శని వెనక్కి వెళ్లే వక్రగతి అనేది కేవలం ఒక దృష్టి భ్రమ మాత్రమే. నిరంతరం శ్రద్ధతో పని చేయండి, సత్కర్మలు చేయండి. రాబోయే మంగళవారం అనుకూలమైన ముహూర్తం లభిస్తుంది. అంతా శుభమే జరుగుతుంది!`;
    }
    if (msgLower.includes("birth") || msgLower.includes("born") || msgLower.includes("dob") || msgLower.includes("jathakam") || msgLower.includes("chart") || msgLower.includes("పుట్టిన") || msgLower.includes("జాతక")) {
      return `నమస్కారం! మీ పుట్టిన వివరాల ప్రకారం జన్మ గ్రహస్థితి చక్రం సిద్ధం చేసాను.\n\nమీ జన్మ కుండలి వివరాలు:\n- **జన్మ నక్షత్రం**: స్వాతి (ఆధునిక ఖగోళ శాస్త్రంలో **Arcturus/Alpha Boötis**, క్రాంతి కోణం +19°).\n- **లగ్నము**: మేషం (Aries).\n- **గురు గ్రహం (Jupiter)**: ప్రస్తుతం వృషభ రాశిలో ఉన్నందున మీ ఆర్థిక విషయాలు స్థిరంగా ఉంటాయి.\n- **కుజుడు (Mars)**: కుజ దోషం గురించి భయపడవలసిన అవసరం లేదు. కుజుడు అంటే కేవలం ఇనుప పొరలతో కూడిన ఒక ఎర్రటి గ్రహం మాత్రమే. మీ మానసిక ప్రశాంతత కోసం ధ్యానం పూజలు లేదా శ్వాస వ్యాయామాలు చేయండి. అంతా మంచే జరుగుతుంది!`;
    }
    return `నమస్కారం. మీ ప్రశ్నను నేను ఖగోళ గణనలతో విశ్లేషించాను.\n\nగ్రహాలు మనలను శిక్షించే కోప దేవతలు కారు; వాటి కిరణాల తరంగాలను మనం ప్రశాంతమైన ధ్యానంతో సమతుల్యం చేసుకోవాలి.\n\nమీ సందేహాన్ని ఇక్కడ అడగండి, నేను సమాధానం అందిస్తాను. అడగండి, నేను చెప్తాను!`;
  }

  // English fallback
  if (historyLength === 0) {
    return `Namaskaram! Hari Sri Ganapataye Namah. I am Sankara Panicker. Welcome to my traditional veranda. 
I perceive you have entered my grove of Drik-ganita calculations. Let us inspect the stars, the orbits, and find the correct path for you.

*Ningalude* (Your) mind is seeking clarity. Tell me, would you like me to analyze your *Jathakam* (Birth Chart), perform an auspicious *Prashnam* casting using my yellow cowry shells (*Kavadi*), or discuss where *Bruhaspati* (Jupiter) and *Shani* (Saturn) are positioned in the modern night sky tonight?
    
*Meeku emi kavali? Chodikoo, njan parayaam.* (What do you need? Ask, and I shall tell.)`;
  }

  if (msgLower.includes("rolled") || msgLower.includes("cowry") || msgLower.includes("cowries") || msgLower.includes("prashnam")) {
    const rolledMatch = msgLower.match(/rolled\s+(\d+)/);
    const faceUp = rolledMatch ? parseInt(rolledMatch[1], 10) : Math.floor(Math.random() * 20) + 5;
    return `Namaskaram! *Nammude* Prashna Palaka has registered exactly ${faceUp} yellow cowries face-up on our teak wood board. 

In our Kerala *Prasna Marga* computation, combined with astronomical calculus, ${faceUp} cowries represents a very interesting celestial state. It shows the influence of *Guru* (Jupiter) and *Suryan* (the Sun) is currently high, but there is a slight transit alignment with *Shani* (Saturn) which requires patience.

Astronomically, Saturn is transiting the *Kumbha Raashi* (Aquarius) at a declination of roughly -13 degrees. This creates a gravitational tension, what people superstitious call "Sade Sati," but it is just a period of slow speed relative to earth.
*Bhayam venda* (No need to fear)! It simply means your hard work must be supported by precision and discipline. Mercury is in high declination today, so your communication is your strongest tool. *Avasaram illa* (No hurry). Wait for the *Shukran* (Venus) transit next Tuesday. That is the correct *Muhurtham*.`;
  }

  if (msgLower.includes("birth") || msgLower.includes("born") || msgLower.includes("dob") || msgLower.includes("jathakam") || msgLower.includes("chart")) {
    return `Namaskaram. I have drawn the *Graha-nila* (south Indian grid) for you. 

Let us look at *Ningalude* Jathakam:
- **Janma Nakshatram**: *Chothie* (what modern astronomers call **Arcturus/Alpha Boötis**, positioned at a declination of +19° and high velocity). It is a bright orange giant, reflecting an independent and intelligent spirit!
- **Lagnam**: *Medam* (Aries).
- **Bruhaspati (Jupiter)**. It is transiting through *Vrishabha Raashi* (Taurus), giving solid stability to your pursuits.
- **Kujudu (Mars)**. Mars (*Angarakudu*) is currently at a coordinate alignment nearing Gemini.

*Ekkada chusina*, astronomy and astrology are two sides of the same coin! People get worried about "Chevva Dosham" (Mars affliction). *Bhayam oddu* (Do not fear). Mars is just a rocky planet of iron oxides. In your chart, its mechanical path is balanced by Venus. You must start your endeavors with positive thoughts, and practice a simple pranayama breathing exercise or look up at the orange star Arcturus in the night sky to tune your thoughts. All is well.`;
  }

  return `Namaskaram! I hear *ningalude* question. 

Let me tell you about *Drik-ganita*. Many people look at the sky and see signs; I see orbits, light-years, and gravitational waves interacting. 
Right now, you are asking about your path. *Ningali parayoo* (Tell me), what aspects of your career or relationship needs alignment? 
Let us cast the cowries again or examine the planetary longitude of *Shani* relative to your *Janma Nakshatram*. *Chodikoo, njan parayaam!* (Ask, and I shall tell!)`;
}

// REST endpoints
const DEFAULT_AUDIO_CONFIG = {
  vishnu: {
    sahasranama: "https://dn721203.ca.archive.org/0/items/VishnuSahasranamam_MSS/Vishnu%20Sahasranamam.mp3"
  },
  shiva: {
    sahasranama: "https://dn721909.ca.archive.org/0/items/siva-sahasaranamam/Siva%20Sahasaranamam.mp3"
  },
  lalitha: {
    sahasranama: "https://dn711109.ca.archive.org/0/items/LalithaSahasranamamFull/Lalitha%20Sahasranamam%20Full.mp3"
  },
  subramanya: {
    sahasranama: "https://dn721608.ca.archive.org/0/items/sri-subramanyabhujangamandsahasranamam/Sri%20Subramanya%20Bhujangam%20and%20Sahasranamam/006-Sri%20Subramanya%20Sahasranamam.mp3"
  },
  ganesha: {
    sahasranama: "https://dn710201.ca.archive.org/0/items/ganesa-sahasranamam-other-ganesa-stotras/Ganesa%20Sahasranamam%20and%20Other%20Ganesa%20Stotras/002-Sri%20Ganesa%20Sahasranamam.mp3"
  }
};

const CONFIG_FILE_PATH = path.join(process.cwd(), "audio-tracks-config.json");

function readAudioConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading audio config file, returning default:", err);
  }
  return DEFAULT_AUDIO_CONFIG;
}

function writeAudioConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing audio config file:", err);
    return false;
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/audio-config", (req, res) => {
  const config = readAudioConfig();
  res.json(config);
});

app.post("/api/audio-config", (req, res) => {
  const { config } = req.body;
  if (!config) {
    return res.status(400).json({ error: "Configuration object is required." });
  }
  const success = writeAudioConfig(config);
  if (success) {
    return res.json({ success: true });
  } else {
    return res.status(500).json({ error: "Failed to persist config to disk." });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, language = "ml" } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGenAI();

    if (!ai) {
      // Return simulated responses with active language support
      const fallbackText = getPanickerFallbackResponse(message, history ? history.length : 0, language);
      return res.json({
        text: fallbackText,
        isSimulated: true,
      });
    }

    // Convert client-side message format to Gemini content parts
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Dynamically append critical language instructions to ensure the model responds strictly in the selected applet language
    let activeSystemInstruction = SYSTEM_INSTRUCTION;
    if (language === "ml") {
      activeSystemInstruction += "\n\nCRITICAL RESPONSE LANGUAGE: The user has selected MALAYALAM as the application's active language. You MUST write your ENTIRE final response only in MALAYALAM (മലയാളം). Even if the user asks their question in English, you must respond strictly in beautiful, fluent, and comforting Malayalam, explaining Nakshatras and astronomical alignments in Malayalam words. Do NOT respond in English or Telugu.";
    } else if (language === "te") {
      activeSystemInstruction += "\n\nCRITICAL RESPONSE LANGUAGE: The user has selected TELUGU as the application's active language. You MUST write your ENTIRE final response only in TELUGU (తెలుగు). Even if the user asks their question in English, you must respond strictly in beautiful, fluent, and comforting Telugu, explaining Nakshatras and astronomical alignments in Telugu script. Do NOT respond in English or Malayalam.";
    } else {
      activeSystemInstruction += "\n\nCRITICAL RESPONSE LANGUAGE: The user has selected ENGLISH. Respond in English, blending standard South Indian Malayalam and Telugu terms appropriately.";
    }

    // Call the Google GenAI SDK (gemini-3.5-flash)
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: activeSystemInstruction,
        temperature: 0.8,
        topP: 0.9,
      },
    });

    const responseText = response.text || "I was unable to align the coordinates for this response, let us try again.";
    return res.json({
      text: responseText,
      isSimulated: false,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: "Sankara Swamy's celestial math was interrupted: " + error.message,
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded.");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
