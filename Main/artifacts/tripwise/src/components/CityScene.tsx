import React from 'react';

type SceneType = "coastal" | "historic" | "mountains" | "urban" | "desert" | "tropical" | "nordic";

const CITY_SCENES: Record<string, SceneType> = {
  "Rijeka": "coastal", "Dubrovnik": "coastal", "Piran": "coastal", "Split": "coastal", "Kotor": "coastal",
  "Valletta": "historic", "Lisbon": "coastal", "Porto": "coastal", "Barcelona": "coastal", "Nice": "coastal",
  "Athens": "coastal", "Santorini": "coastal", "Venice": "coastal", "Amalfi": "coastal", "Jeddah": "coastal",
  "Gdansk": "historic", "Vilnius": "historic", "Krakow": "historic", "Prague": "historic", "Bratislava": "historic",
  "Tallinn": "historic", "Riga": "historic", "Bruges": "historic", "York": "historic", "Sintra": "historic",
  "Sarajevo": "historic", "Ohrid": "historic", "Plovdiv": "historic", "Istanbul": "historic", "Tbilisi": "historic",
  "Rome": "historic", "Florence": "historic", "Amman": "historic", "Chefchaouen": "historic",
  "Keswick": "mountains", "Innsbruck": "mountains", "Zermatt": "mountains", "Bergen": "mountains",
  "Hallstatt": "mountains", "Salzburg": "mountains", "Queenstown": "mountains", "Interlaken": "mountains",
  "Dubai": "urban", "Tokyo": "urban", "Singapore": "urban", "Hong Kong": "urban", "New York": "urban",
  "London": "urban", "Paris": "urban", "Berlin": "urban", "Amsterdam": "urban", "Vienna": "urban",
  "Copenhagen": "urban", "Stockholm": "urban", "Abu Dhabi": "urban", "Doha": "urban",
  "Helsinki": "nordic", "Oslo": "nordic", "Reykjavik": "nordic", "Tromso": "nordic",
  "Petra": "desert", "Marrakech": "desert", "Cairo": "desert", "Luxor": "desert", "Aswan": "desert",
  "Wadi Rum": "desert", "Fez": "desert", "Riyadh": "desert",
  "Bali": "tropical", "Phuket": "tropical", "Maldives": "tropical", "Zanzibar": "tropical",
  "Mauritius": "tropical", "Cancun": "tropical", "Goa": "tropical", "Langkawi": "tropical"
};

function cityHash(name: string): number {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function inferSceneType(city: string): SceneType {
  const types: SceneType[] = ["coastal", "historic", "mountains", "urban", "desert", "tropical", "nordic"];
  return types[cityHash(city) % types.length];
}

export function CityScene({ city, className }: { city: string; className?: string }) {
  const type = CITY_SCENES[city] ?? inferSceneType(city);
  const h = cityHash(city);

  const renderScene = () => {
    switch (type) {
      case "coastal":
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a6fa8] via-[#5bb8f5] to-[#e8f4fb]" style={{ height: '65%' }} />
            <div className="absolute bottom-0 w-full bg-gradient-to-b from-[#2376a0] to-[#7dceed]" style={{ height: '40%' }} />
            <div className="absolute w-full h-[2px] bg-white/80" style={{ top: '60%' }} />
            <div className="absolute top-4 right-8 w-8 h-8 bg-[#fff8d0] rounded-full shadow-[0_0_20px_rgba(255,240,150,0.7)]" />
            <svg className="absolute w-6 h-6 animate-[driftRight_8s_infinite_alternate]" style={{ top: '40%', left: '20%' }} viewBox="0 0 24 24">
              <path d="M2,12 Q6,8 10,12 Q14,8 18,12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <svg className="absolute w-4 h-4 animate-[driftRight_8s_infinite_alternate_reverse]" style={{ top: '30%', left: '60%' }} viewBox="0 0 24 24">
              <path d="M2,12 Q6,8 10,12 Q14,8 18,12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <svg className="absolute w-4 h-5 animate-[floatSlow_4s_infinite_alternate]" style={{ top: '56%', left: '40%' }} viewBox="0 0 16 20">
              <polygon points="8,0 0,16 8,14 16,16" fill="white" />
              <path d="M0,16 Q8,20 16,16 Z" fill="rgba(255,255,255,0.8)" />
            </svg>
          </>
        );

      case "historic":
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#e8c98a] via-[#f0a848] to-[#8a3010]" />
            <div className="absolute bottom-0 w-full h-[12%] bg-[#2a1a08] z-10" />
            <div className="absolute bottom-[10%] left-[20%] w-[15%] h-[60%] bg-[#1a0a04]" style={{ clipPath: 'polygon(50% 0, 100% 30%, 100% 100%, 0 100%, 0 30%)' }}>
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#f0a848]/40" />
            </div>
            <div className="absolute bottom-[10%] left-[45%] w-[20%] h-[75%] bg-[#1a0a04]" style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 100%, 0 100%, 0 25%)' }}>
              <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#f0a848]/40" />
            </div>
            <div className="absolute bottom-[10%] left-[75%] w-[12%] h-[55%] bg-[#1a0a04]" style={{ clipPath: 'polygon(50% 0, 100% 35%, 100% 100%, 0 100%, 0 35%)' }}>
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#f0a848]/40" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/3 bg-[radial-gradient(ellipse_at_bottom,rgba(240,168,72,0.3),transparent_70%)] z-0" />
          </>
        );

      case "mountains":
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#2c4a7c] via-[#4a7ab5] to-[#c8dff0]" />
            <svg className="absolute bottom-0 w-full h-[45%]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <polygon points="0,100 30,20 60,100" fill="#f0f4f8" />
              <polygon points="30,20 60,100 0,100" fill="#6080a8" opacity="0.4" />
              <polygon points="40,100 75,10 100,100" fill="#f0f4f8" />
              <polygon points="75,10 100,100 40,100" fill="#6080a8" opacity="0.4" />
            </svg>
            <div className="absolute bottom-[45%] w-full h-[8%] bg-white/40 blur-[2px]" />
            <div className="absolute bottom-0 left-0 w-full h-[15%] flex justify-around items-end px-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[24px] border-l-transparent border-r-transparent border-b-[#1a3a2a]" />
              ))}
            </div>
          </>
        );

      case "urban":
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#1a2a4a] to-[#2a3a6a]" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute w-[2px] h-[2px] bg-white rounded-full animate-[twinkle_3s_infinite_alternate]" style={{ top: `${(h + i * 17) % 50}%`, left: `${(h + i * 23) % 100}%`, animationDelay: `${i * 0.4}s` }} />
            ))}
            <div className="absolute bottom-[10%] w-full h-[65%] flex items-end justify-center gap-1 sm:gap-2 px-2">
              {[30, 60, 45, 75, 50, 35].map((height, i) => (
                <div key={i} className="relative flex-1 bg-[#0f172a] border border-[#1e293b] rounded-t-sm overflow-hidden" style={{ height: `${height}%` }}>
                  <div className="absolute inset-2 flex flex-wrap gap-1 md:gap-1.5 justify-center mt-2">
                    {[...Array(24)].map((_, j) => (
                      <div key={j} className={`w-[2px] h-[3px] md:w-1 md:h-1.5 ${(h + i + j) % 3 === 0 ? 'bg-[#fcd34d]' : 'bg-transparent'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 w-full h-[10%] bg-[#0a0f1e]/80 backdrop-blur-sm" />
          </>
        );

      case "desert":
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a6a] via-[#e8a840] to-[#f8e8c0]" />
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-16 h-24 bg-[#3a2010] z-10" style={{ clipPath: 'polygon(0% 100%, 0% 20%, 50% 0%, 100% 20%, 100% 100%, 75% 100%, 75% 30%, 50% 15%, 25% 30%, 25% 100%)' }} />
            <svg className="absolute bottom-0 w-full h-[35%] z-20" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,100 L0,40 Q25,20 50,50 T100,30 L100,100 Z" fill="#d4a86a" />
              <path d="M0,100 L0,60 Q30,80 60,50 T100,70 L100,100 Z" fill="#c89050" />
            </svg>
            <div className="absolute inset-0 bg-white/30 animate-[shimmer_4s_ease-in-out_infinite] z-30 pointer-events-none mix-blend-overlay" />
          </>
        );

      case "tropical":
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a6aa0] to-[#a8e8f8]" style={{ height: '70%' }} />
            <div className="absolute bottom-0 w-full bg-[#20b0d0]" style={{ height: '30%' }} />
            <div className="absolute w-full h-[2px] bg-white/60" style={{ top: '70%' }} />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#ffe040] rounded-full shadow-[0_0_30px_rgba(255,224,64,0.6)]" />
            <svg className="absolute bottom-[20%] left-[10%] w-16 h-24" viewBox="0 0 100 100">
              <path d="M50,100 Q40,60 60,20" fill="none" stroke="#1a5a20" strokeWidth="4" />
              <path d="M60,20 Q40,10 30,30 M60,20 Q80,10 90,30 M60,20 Q50,0 70,0" fill="none" stroke="#1a5a20" strokeWidth="6" strokeLinecap="round" />
            </svg>
            <svg className="absolute bottom-[10%] right-[15%] w-20 h-32" viewBox="0 0 100 100">
              <path d="M50,100 Q60,50 40,20" fill="none" stroke="#1a5a20" strokeWidth="5" />
              <path d="M40,20 Q20,10 10,30 M40,20 Q60,10 70,30 M40,20 Q30,0 50,0 M40,20 Q20,30 30,50" fill="none" stroke="#1a5a20" strokeWidth="7" strokeLinecap="round" />
            </svg>
          </>
        );

      case "nordic":
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0818] via-[#1a1040] to-[#2a2060]" />
            <div className="absolute top-[30%] w-[150%] -left-[25%] h-12 bg-[#40e080]/30 blur-xl animate-[auroraWave_8s_infinite_alternate]" style={{ transformOrigin: 'center left' }} />
            <div className="absolute top-[50%] w-[150%] -left-[25%] h-16 bg-[#a040e0]/30 blur-xl animate-[auroraWave_10s_infinite_alternate-reverse]" style={{ transformOrigin: 'center right' }} />
            {[...Array(10)].map((_, i) => (
              <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full animate-[twinkle_4s_infinite_alternate]" style={{ top: `${(h + i * 20) % 60}%`, left: `${(h + i * 30) % 100}%`, animationDelay: `${i * 0.3}s` }} />
            ))}
            <div className="absolute bottom-[8%] w-full h-[20%] flex items-end justify-between px-2 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[32px] border-l-transparent border-r-transparent border-b-[#0f1b29]" style={{ transform: `scale(${1 + ((h + i) % 5) * 0.1})` }} />
              ))}
            </div>
            <div className="absolute bottom-0 w-full h-[8%] bg-[#e8f0f8]" />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`} aria-hidden="true">
      {renderScene()}
    </div>
  );
}