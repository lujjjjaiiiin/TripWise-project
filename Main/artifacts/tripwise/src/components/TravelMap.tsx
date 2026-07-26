import React, { useEffect, useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Line } from "react-simple-maps";
import { CityRecommendation } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface TravelMapProps {
  recommendations: CityRecommendation[];
  selectedCity: string | null;
  onCitySelect: (city: string) => void;
}

interface TooltipState {
  city: string;
  country: string;
  matchPercent: number;
  airportDisplay: string;
  x: number;
  y: number;
}

export function TravelMap({ recommendations, selectedCity, onCitySelect }: TravelMapProps) {
  const validRecs = useMemo(() => {
    return recommendations.filter(r => r.longitude != null && r.latitude != null);
  }, [recommendations]);

  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    if (selectedCity) {
      const city = validRecs.find(c => c.city === selectedCity);
      if (city && city.longitude != null && city.latitude != null) {
        setPosition({ coordinates: [city.longitude, city.latitude], zoom: 4 });
      }
    } else if (validRecs.length > 0) {
      let latSum = 0;
      let lonSum = 0;
      validRecs.forEach(c => {
        latSum += c.latitude!;
        lonSum += c.longitude!;
      });
      setPosition({
        coordinates: [lonSum / validRecs.length, latSum / validRecs.length],
        zoom: 2,
      });
    }
  }, [selectedCity, validRecs]);

  if (validRecs.length === 0) return null;

  return (
    <div
      className="w-full h-[480px] rounded-xl overflow-hidden bg-[#0B1F4B] relative shadow-inner border-[4px] border-white/10"
      onMouseLeave={() => setTooltip(null)}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140 }}
        width={800}
        height={480}
        className="w-full h-full"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos) => setPosition(pos as any)}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1E3A6E"
                  stroke="#2D5499"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#2D5499", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Dashed connecting lines */}
          {validRecs.map((rec, i) => {
            if (i === validRecs.length - 1) return null;
            const next = validRecs[i + 1];
            return (
              <Line
                key={`line-${i}`}
                from={[rec.longitude!, rec.latitude!]}
                to={[next.longitude!, next.latitude!]}
                stroke="#7EB8D4"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray="4 4"
                style={{ opacity: 0.4 }}
              />
            );
          })}

          {/* Markers */}
          {validRecs.map((rec, i) => {
            const isFirst = i === 0;
            const isSelected = selectedCity === rec.city;
            const _unkn = new Set(["unknown", "none", "nan", "n/a", ""]);
            const _clean = (s?: string | null) => (!s || _unkn.has(s.toLowerCase())) ? null : s;
            const cleanName = _clean(rec.airport_name);
            const cleanIata = _clean(rec.iata);
            const airportDisplay = cleanName && cleanIata
              ? `${cleanName} (${cleanIata})`
              : cleanName
                ? cleanName
                : cleanIata
                  ? `International Airport (${cleanIata})`
                  : "—";

            return (
              <Marker
                key={rec.city}
                coordinates={[rec.longitude!, rec.latitude!]}
                onClick={() => {
                  onCitySelect(rec.city);
                  setTooltip(null);
                }}
                onMouseEnter={(e: React.MouseEvent) => {
                  const svg = (e.target as SVGElement).closest("svg");
                  const rect = svg?.getBoundingClientRect();
                  const parent = (e.target as SVGElement).closest(".rsm-marker") as SVGGElement | null;
                  setTooltip({
                    city: rec.city,
                    country: rec.country,
                    matchPercent: Math.round(rec.match_percent),
                    airportDisplay,
                    x: e.clientX - (rect?.left ?? 0),
                    y: e.clientY - (rect?.top ?? 0),
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Pulse ring for selected */}
                {isSelected && (
                  <circle
                    r={18}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2}
                    opacity={0.6}
                    className="pointer-events-none animate-pulse"
                  />
                )}
                {/* Rank badge glow for #1 */}
                {isFirst && (
                  <circle r={14} fill="#0B1F4B" opacity={0.5} className="pointer-events-none" />
                )}
                {/* Main dot */}
                <circle
                  r={isFirst ? 10 : 7}
                  fill={isFirst ? "#F59E0B" : isSelected ? "#ffffff" : "#7EB8D4"}
                  stroke={isFirst ? "#ffffff" : "#0B1F4B"}
                  strokeWidth={isFirst ? 2.5 : 1.5}
                  className="cursor-pointer"
                  style={{ filter: isFirst ? "drop-shadow(0 0 6px rgba(245,158,11,0.8))" : undefined }}
                />
                {/* #1 label */}
                {isFirst && (
                  <text
                    textAnchor="middle"
                    y={-17}
                    style={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      fill: "#F59E0B",
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                      pointerEvents: "none",
                    }}
                  >
                    #1
                  </text>
                )}
                {/* Rank number inside dot for others */}
                {!isFirst && (
                  <text
                    textAnchor="middle"
                    y={4}
                    style={{
                      fontSize: "7px",
                      fontWeight: "bold",
                      fill: "#0B1F4B",
                      pointerEvents: "none",
                    }}
                  >
                    {i + 1}
                  </text>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 pointer-events-none"
            style={{
              left: Math.min(tooltip.x + 12, 500),
              top: Math.max(tooltip.y - 80, 8),
            }}
          >
            <div className="bg-white rounded-xl shadow-xl border border-border px-4 py-3 min-w-[200px]">
              <p className="font-bold text-primary text-sm">{tooltip.city}</p>
              <p className="text-xs text-muted-foreground">{tooltip.country}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                <span className="text-xs font-semibold text-primary">{tooltip.matchPercent}% Match</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">✈️ {tooltip.airportDisplay}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }))}
          className="w-9 h-9 bg-white text-primary rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 font-bold text-lg"
        >
          +
        </button>
        <button
          onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))}
          className="w-9 h-9 bg-white text-primary rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 font-bold text-lg"
        >
          −
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-sm" />
          <span className="text-white text-[10px] font-medium">#1 Match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7EB8D4]" />
          <span className="text-white text-[10px] font-medium">Other matches</span>
        </div>
      </div>
    </div>
  );
}
