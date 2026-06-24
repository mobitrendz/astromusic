import React, { useState, useEffect } from "react";
import { 
  X, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  Music,
  ChevronRight,
  Info
} from "lucide-react";

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: 'en' | 'ml' | 'te';
  currentConfig: any;
  onConfigSaved: (newConfig: any) => void;
}

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

const CATEGORIES = [
  {
    id: "vishnu",
    name: "Sri Vishnu Sahasranamam",
    sanskrit: "विष्णु सहस्रनाम",
    sahasranamaName: "Vishnu Sahasranamam"
  },
  {
    id: "shiva",
    name: "Sri Siva Sahasaranamam",
    sanskrit: "शिव सहस्रनाम",
    sahasranamaName: "Siva Sahasaranamam"
  },
  {
    id: "lalitha",
    name: "Sri Lalitha Sahasranamam",
    sanskrit: "ललिता सहस्रनाम",
    sahasranamaName: "Lalitha Sahasranamam"
  },
  {
    id: "subramanya",
    name: "Sri Subramanya Sahasranamam",
    sanskrit: "सुब्रह्मण्य सहस्रनाम",
    sahasranamaName: "Subramanya Sahasranamam"
  },
  {
    id: "ganesha",
    name: "Sri Ganesha Sahasranamam",
    sanskrit: "गणेश सहस्रनाम",
    sahasranamaName: "Ganesha Sahasranamam"
  }
];

export default function AdminSettingsModal({ 
  isOpen, 
  onClose, 
  currentLanguage, 
  currentConfig, 
  onConfigSaved 
}: AdminSettingsModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Editable configuration local state
  const [editConfig, setEditConfig] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("shiva");
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Initialize editable config whenever currentConfig or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (currentConfig) {
        setEditConfig(JSON.parse(JSON.stringify(currentConfig)));
      } else {
        setEditConfig(JSON.parse(JSON.stringify(DEFAULT_AUDIO_CONFIG)));
      }
      setSaveSuccess(false);
      setSaveError(null);
      setShowResetConfirm(false);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  // Update track link in state
  const handleLinkChange = (catId: string, trackType: "sahasranama" | "keerthana" | "bhajana", value: string) => {
    setEditConfig((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        [catId]: {
          ...prev[catId],
          [trackType]: value
        }
      };
    });
    // Clear save flags
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Reset to static defaults
  const handleResetDefaults = () => {
    setEditConfig(JSON.parse(JSON.stringify(DEFAULT_AUDIO_CONFIG)));
    setSaveSuccess(false);
    setSaveError(null);
    setShowResetConfirm(false);
  };

  // Submit link modifications to disk persistence
  const handleSaveConfig = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/audio-config", {
         method: "POST",
         headers: { 
           "Content-Type": "application/json",
           "Authorization": `Bearer SANKARA_SWAMY_SECRET_TOKEN_2026`
         },
         body: JSON.stringify({ config: editConfig })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveSuccess(true);
        onConfigSaved(editConfig);
      } else {
        setSaveError(data.error || "Unable to save audio configuration.");
      }
    } catch (err) {
      console.error("Save Configuration Error:", err);
      setSaveError("Failed to reach server to persist audio links.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#F5EFEB] rounded-3xl border-2 border-[#C29200] shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Banner Golden line */}
        <div className="h-2 w-full bg-[#C29200]"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D4C3A3]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#2D241E] flex items-center justify-center border border-[#C29200]">
              <Music className="h-4.5 w-4.5 text-[#C29200]" />
            </div>
            <div>
              <h3 className="font-serif text-[14px] font-extrabold text-[#5D4037] leading-none">
                Sree Sankara Swamy Audios Sanctuary
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#C29200] mt-1 font-bold">
                Dynamic Audio Link Customization Console
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 bg-stone-100/50 hover:bg-stone-100 p-1.5 rounded-full transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
          {/* Configure Settings Panel */}
          <div className="flex flex-col gap-5">
            
            {/* Alert notifications */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-2 items-center">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
                <span className="font-semibold">All audio streaming configurations updated and saved immediately on disk!</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-start">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-medium">{saveError}</span>
              </div>
            )}

            {/* Dynamic Categories Tab Header with gilded borders */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full border-b border-[#D4C3A3] scrollbar-thin">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold tracking-tight shrink-0 transition ${
                    activeTab === cat.id 
                      ? "bg-[#2D241E] text-[#C29200] border-t-2 border-[#C29200]" 
                      : "bg-[#FCF3E3] text-[#5D4037] border border-[#D4C3A3]/60 hover:bg-amber-100/30"
                  }`}
                >
                  {cat.name.split("&")[0].trim()}
                </button>
              ))}
            </div>

            {/* Active Tab Panel Inputs */}
            {editConfig && CATEGORIES.map((cat) => {
              if (cat.id !== activeTab) return null;
              return (
                <div key={cat.id} className="flex flex-col gap-4 animate-fadeIn">
                  
                  {/* Header of Active Category */}
                  <div className="p-4 rounded-2xl bg-[#FCF3E3] border border-[#D4C3A3] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                    <div>
                      <h4 className="font-serif text-[12px] font-extrabold text-[#5D4037] flex items-center gap-1.5">
                        <Music className="h-4 w-4 text-[#C29200]" />
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-serif italic mt-0.5">
                        Assigned to Drik-ganita Muhurtas matching Vedic Devotions
                      </p>
                    </div>
                    <span className="text-[9.5px] font-extrabold text-[#C29200] bg-[#2D241E] border border-[#C29200]/30 px-2 py-0.5 rounded-md font-serif text-center sm:text-right">
                      {cat.sanskrit}
                    </span>
                  </div>

                  <div className="text-[9.5px] text-[#8D6E63] font-sans flex gap-1.5 bg-orange-50/50 p-2.5 rounded-xl border border-orange-100/60 leading-relaxed">
                    <Info className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                    <span>Ensure links refer directly to raw MP3 streams on server nodes (like Ca.archive.org or Ia.archive.org) so direct HTML5 streaming playback loads without page redirects.</span>
                  </div>

                  {/* Six editable tracks */}
                  <div className="flex flex-col gap-4.5 mt-1">
                    
                    {/* Sahasranama */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-[#8D6E63] pl-1 font-bold">
                        <span>Sahasranama Path Hymn URL</span>
                        <span className="text-stone-700 font-sans italic lowercase pr-1">{cat.sahasranamaName}</span>
                      </div>
                      <input 
                        type="text"
                        value={editConfig[cat.id]?.sahasranama || ""}
                        onChange={(e) => handleLinkChange(cat.id, "sahasranama", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D4C3A3] bg-white text-stone-800 text-[11.5px] focus:outline-none focus:ring-1 focus:ring-[#C29200] font-mono"
                        placeholder="Paste direct .mp3 link"
                      />
                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#2D241E] border-t border-[#D4C3A3] flex flex-col sm:flex-row items-center justify-between gap-3">
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-rose-300 font-bold">Are you sure?</span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2.5 py-1 rounded-lg bg-rose-900 border border-rose-600 text-rose-100 text-[10px] font-mono uppercase tracking-wider transition hover:bg-rose-800 cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-600 text-stone-300 text-[10px] font-mono uppercase tracking-wider transition hover:bg-stone-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl border border-[#D4C3A3]/20 hover:border-[#D4C3A3] text-stone-300 hover:text-stone-100 text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Defaults Reset
            </button>
          )}
          
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#C29200] hover:bg-[#C29200]/90 text-stone-900 text-[10.5px] font-mono uppercase tracking-widest font-extrabold flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isLoading ? "Saving..." : "Save Links"}
          </button>
        </div>

      </div>
    </div>
  );
}
