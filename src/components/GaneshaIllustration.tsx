import React from "react";

interface GaneshaIllustrationProps {
  className?: string;
}

export default function GaneshaIllustration({ className = "w-16 h-16" }: GaneshaIllustrationProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} id="ganesha_vector_wrapper">
      <svg
        viewBox="0 0 200 220"
        className="w-full h-full filter drop-shadow-[0_2.5px_4.5px_rgba(62,39,35,0.35)] transition-transform duration-300 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="ganesha_svg_element"
      >
        <defs>
          {/* Rich High-Contrast Traditional Gold/Bronze Gradient (No light/faded colors) */}
          <linearGradient id="ganeshaGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3E2723" />     {/* Deepest Sacred Charcoal-Brown */}
            <stop offset="30%" stopColor="#5D4037" />    {/* Warm Dark Bronze */}
            <stop offset="65%" stopColor="#B07D1C" />    {/* Rich Terracotta Gold */}
            <stop offset="85%" stopColor="#8D6E63" />    {/* Saturated Medium Bronze */}
            <stop offset="100%" stopColor="#3E2723" />   {/* Deep Sacred Closing */}
          </linearGradient>
          
          {/* Richer Traditional Saffron/Amber Radial Aura */}
          <radialGradient id="auraRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE082" stopOpacity="0.55" />  {/* Warm Amber Core */}
            <stop offset="60%" stopColor="#FFCC80" stopOpacity="0.25" /> {/* Saffron Glow */}
            <stop offset="100%" stopColor="#FCF3E3" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft Warm Saffron/Amber Aura */}
        <circle cx="100" cy="100" r="85" fill="url(#auraRadial)" />

        {/* Outer Sacred Decorative Mandala Circle (Sharper, bolder) */}
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="url(#ganeshaGoldGradient)"
          strokeWidth="1.25"
          strokeDasharray="4 5"
          opacity="0.8"
        />

        {/* --- LORD GANESHA OUTLINES --- */}
        <g stroke="url(#ganeshaGoldGradient)" strokeLinecap="round" strokeLinejoin="round">
          
          {/* 1. Divine Crown (Mukut) */}
          {/* Base of Crown (Bolder and subtly filled for depth) */}
          <path d="M 65 55 L 135 55 L 125 45 L 75 45 Z" strokeWidth="2.5" fill="#FCEFDC" fillOpacity="0.2" />
          <path d="M 70 45 L 130 45" strokeWidth="2" />
          
          {/* Crown Spire Tiers */}
          <path d="M 78 45 C 80 25, 120 25, 122 45" strokeWidth="2.5" />
          <path d="M 85 35 C 87 18, 113 18, 115 35" strokeWidth="2" />
          <path d="M 92 25 L 100 10 L 108 25 Z" strokeWidth="2" fill="#B07D1C" fillOpacity="0.25" />
          
          {/* Jewel on Top (Bindu) */}
          <circle cx="100" cy="6" r="3.5" fill="url(#ganeshaGoldGradient)" stroke="none" />
          
          {/* Decorative Crown Details */}
          <path d="M 90 50 L 110 50" strokeWidth="1.5" />
          <circle cx="100" cy="30" r="3" fill="url(#ganeshaGoldGradient)" stroke="none" />

          {/* 2. Forehead & Tilak (Tri-Pundra & Ganesha's Sacred Mark) */}
          {/* Horizontal lines of Shiva connection (Tri-Pundra) */}
          <path d="M 83 68 L 117 68" strokeWidth="2" opacity="0.9" />
          <path d="M 80 72 L 120 72" strokeWidth="2" opacity="0.9" />
          <path d="M 83 76 L 117 76" strokeWidth="2" opacity="0.9" />
          
          {/* Sacred U-Shaped Tilak in gold */}
          <path d="M 93 61 C 93 61, 100 80, 100 80 C 100 80, 107 61, 107 61" strokeWidth="3" />
          
          {/* Vivid Vermillion Red Spot inside Tilak (stands out beautifully!) */}
          <circle cx="100" cy="70" r="3.2" fill="#B71C1C" stroke="#3E2723" strokeWidth="0.5" />

          {/* 3. Infinite Ears (Shurpakarna) */}
          {/* Left Ear - large and sweeping, symbolizing listening to all prayers */}
          <path
            d="M 68 55 
               C 25 55, 15 110, 65 115 
               C 70 115, 75 105, 70 95 
               C 65 85, 55 75, 71 65"
            strokeWidth="3"
            fill="#FCF8F2"
            fillOpacity="0.1"
          />
          {/* Left Ear Inner Detail Curves */}
          <path d="M 55 68 C 38 75, 40 95, 60 100" strokeWidth="1.75" opacity="0.8" />
          <path d="M 48 80 C 36 85, 41 102, 53 104" strokeWidth="1" opacity="0.6" />

          {/* Right Ear - sweeping symmetrically */}
          <path
            d="M 132 55 
               C 175 55, 185 110, 135 115 
               C 130 115, 125 105, 130 95 
               C 135 85, 145 75, 129 65"
            strokeWidth="3"
            fill="#FCF8F2"
            fillOpacity="0.1"
          />
          {/* Right Ear Inner Detail Curves */}
          <path d="M 145 68 C 162 75, 160 95, 140 100" strokeWidth="1.75" opacity="0.8" />
          <path d="M 152 80 C 164 85, 159 102, 147 104" strokeWidth="1" opacity="0.6" />

          {/* 4. Beautiful Meditative Eyes */}
          {/* Left Eye */}
          <path d="M 75 84 C 79 88, 86 88, 90 83" strokeWidth="2.5" />
          <path d="M 73 83 C 78 81, 85 81, 90 83" strokeWidth="1.5" opacity="0.6" />
          {/* Right Eye */}
          <path d="M 125 84 C 121 88, 114 88, 110 83" strokeWidth="2.5" />
          <path d="M 127 83 C 122 81, 115 81, 110 83" strokeWidth="1.5" opacity="0.6" />

          {/* 5. Tusks (Ekadanta) */}
          {/* Left Tusk (Broken tusk, symbolizing sacrifice for writing the Mahabharata) */}
          <path d="M 86 102 L 75 104 L 84 108 Z" strokeWidth="1.5" fill="url(#ganeshaGoldGradient)" />
          
          {/* Right Tusk (Full and sharp) */}
          <path d="M 114 102 L 127 105 L 115 110 Z" strokeWidth="1.5" fill="url(#ganeshaGoldGradient)" />

          {/* 6. Magnificent Curved Trunk (Vakratunda) */}
          {/* The flowing trunk sweeps gracefully to the left, forming a sacred spiral of prosperity */}
          <path
            d="M 88 88 
               C 88 120, 105 145, 105 170 
               C 105 192, 75 194, 70 172
               C 66 156, 80 146, 92 153
               C 100 158, 97 170, 84 170
               C 76 170, 78 162, 84 162"
            strokeWidth="3.6"
          />
          {/* Outer edge of the trunk to define its volume beautifully */}
          <path
            d="M 112 88 
               C 112 120, 119 142, 118 166 
               C 117 182, 102 188, 92 184
               C 82 180, 83 175, 90 175"
            strokeWidth="2"
            opacity="0.9"
          />

          {/* Beautiful horizontal ring markings on the Trunk */}
          <path d="M 94 110 C 97 112, 103 112, 106 110" strokeWidth="1.5" opacity="0.9" />
          <path d="M 95 120 C 98 122, 104 122, 107 120" strokeWidth="1.5" opacity="0.9" />
          <path d="M 96 130 C 99 132, 105 132, 108 130" strokeWidth="1.5" opacity="0.9" />
          <path d="M 97 140 C 100 142, 106 142, 109 140" strokeWidth="1.5" opacity="0.9" />

          {/* 7. Divine Modak (The sweet representing the ultimate reward of spiritual practice) */}
          <path
            d="M 52 165 
               C 50 152, 62 144, 62 144 
               C 62 144, 63 150, 66 156 
               C 69 162, 54 170, 52 165 Z"
            strokeWidth="2"
            fill="url(#ganeshaGoldGradient)"
            fillOpacity="0.4"
          />
          {/* Small stripes on the modak */}
          <path d="M 55 153 C 58 158, 60 163, 61 166" strokeWidth="1" />
          <path d="M 58 149 C 61 154, 63 159, 64 162" strokeWidth="1" />

          {/* 8. Little Mushika (The humble mouse/vehicle) near the bottom right */}
          <path
            d="M 134 178 
               C 134 174, 142 170, 148 174 
               C 152 177, 150 182, 142 182 Z"
            strokeWidth="1.5"
            fill="url(#ganeshaGoldGradient)"
            fillOpacity="0.2"
          />
          {/* Tail */}
          <path d="M 148 174 C 153 172, 156 175, 158 178" strokeWidth="1" />
          {/* Ears */}
          <circle cx="138" cy="174" r="2" fill="url(#ganeshaGoldGradient)" stroke="none" />
        </g>
      </svg>
    </div>
  );
}

