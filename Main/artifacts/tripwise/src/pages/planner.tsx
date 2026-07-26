import React, { useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useT, useLanguage } from "@/lib/i18n";
import { 
  usePostRecommend, 
  CityRecommendation 
} from "@workspace/api-client-react";
import { 
  Landmark, Mountain, Trees, Waves, Music, Utensils, Heart, Building2, Compass,
  Star, Plane, Thermometer, MapPin, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TravelMap } from "@/components/TravelMap";
import { CityScene } from "@/components/CityScene";

const formSchema = z.object({
  culture: z.number().min(1).max(5),
  adventure: z.number().min(1).max(5),
  nature: z.number().min(1).max(5),
  beaches: z.number().min(1).max(5),
  nightlife: z.number().min(1).max(5),
  cuisine: z.number().min(1).max(5),
  wellness: z.number().min(1).max(5),
  urban: z.number().min(1).max(5),
  seclusion: z.number().min(1).max(5),
  budget_level_encoded: z.number().min(1).max(3),
  temp_avg_yearly: z.number().min(-10).max(50),
  hotel_rating: z.number().min(0).max(5),
  duration: z.enum(["short", "week", "longer"]),
  has_airport: z.boolean(),
  regions: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

const TASTE_DIMS = [
  { id: "culture", icon: Landmark },
  { id: "adventure", icon: Mountain },
  { id: "nature", icon: Trees },
  { id: "beaches", icon: Waves },
  { id: "nightlife", icon: Music },
  { id: "cuisine", icon: Utensils },
  { id: "wellness", icon: Heart },
  { id: "urban", icon: Building2 },
  { id: "seclusion", icon: Compass },
] as const;

const REGIONS = [
  { id: "africa", labelKey: "africa" },
  { id: "asia", labelKey: "asia" },
  { id: "europe", labelKey: "europe" },
  { id: "middleEast", labelKey: "middleEast" },
  { id: "northAmerica", labelKey: "northAmerica" },
  { id: "oceania", labelKey: "oceania" },
  { id: "southAmerica", labelKey: "southAmerica" },
] as const;

// ── Multi-step loading reveal ─────────────────────────────────────────────
function LoadingReveal({ pending, t, isAr }: {
  pending: boolean;
  t: ReturnType<typeof useT>;
  isAr: boolean;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!pending) { setStep(0); return; }
    setStep(0);
    const ts = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 780),
      setTimeout(() => setStep(3), 1280),
      setTimeout(() => setStep(4), 1820),
    ];
    return () => ts.forEach(clearTimeout);
  }, [pending]);

  if (!pending) return null;

  const steps = [
    t("loadingStep1" as any),
    t("loadingStep2" as any),
    t("loadingStep3" as any),
    t("loadingStep4" as any),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card-premium p-10 flex flex-col items-center gap-6 text-center my-8"
    >
      <motion.div
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_4px_20px_rgba(11,31,75,0.28)]"
      >
        <Plane className="w-7 h-7 text-white" />
      </motion.div>
      <p className="text-xl font-bold text-primary">{t("findingDestinations")}</p>
      <div className={`space-y-4 w-full max-w-xs ${isAr ? "text-end" : "text-start"}`}>
        {steps.map((label, i) => (
          <motion.div key={i}
            className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}
            animate={{ opacity: step > i ? 1 : 0.22 }}
            transition={{ duration: 0.4 }}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-300
              ${step > i ? "bg-primary border-primary" : "border-border"}`}>
              {step > i && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-muted-foreground">{label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function Planner() {
  const t = useT();
  const { lang } = useLanguage();
  const recommend = usePostRecommend();
  const [results, setResults] = useState<CityRecommendation[] | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      culture: 3,
      adventure: 3,
      nature: 3,
      beaches: 3,
      nightlife: 3,
      cuisine: 3,
      wellness: 3,
      urban: 3,
      seclusion: 3,
      budget_level_encoded: 2,
      temp_avg_yearly: 22,
      hotel_rating: 4,
      duration: "week",
      has_airport: false,
      regions: [],
    },
  });

  const onSubmit = (data: FormValues) => {
    recommend.mutate({
      data: {
        culture: data.culture,
        adventure: data.adventure,
        nature: data.nature,
        beaches: data.beaches,
        nightlife: data.nightlife,
        cuisine: data.cuisine,
        wellness: data.wellness,
        urban: data.urban,
        seclusion: data.seclusion,
        budget_level_encoded: data.budget_level_encoded,
        temp_avg_yearly: data.temp_avg_yearly,
        HotelRating_encoded: data.hotel_rating,
        rating_was_unknown: data.hotel_rating === 0 ? 1 : 0,
        is_short_trip: data.duration === "short" ? 1 : 0,
        is_one_week: data.duration === "week" ? 1 : 0,
        has_airport: data.has_airport ? 1 : 0,
        region_africa: data.regions.includes("africa") ? 1 : 0,
        region_asia: data.regions.includes("asia") ? 1 : 0,
        region_europe: data.regions.includes("europe") ? 1 : 0,
        region_middle_east: data.regions.includes("middleEast") ? 1 : 0,
        region_north_america: data.regions.includes("northAmerica") ? 1 : 0,
        region_oceania: data.regions.includes("oceania") ? 1 : 0,
        region_south_america: data.regions.includes("southAmerica") ? 1 : 0,
        top_n: 10,
      }
    }, {
      onSuccess: (res) => {
        setResults(res.recommendations);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    const el = document.getElementById(`city-card-${city}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex-1 bg-background pb-20">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          
          {/* SECTION A: Travel Style */}
          <section className="card-premium p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary tracking-tight">{t("travelStyle")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("preferenceSubtitle")}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {TASTE_DIMS.map(({ id, icon: Icon }) => (
                <div key={id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Icon className="w-5 h-5 text-accent" />
                      {t(id as any)}
                    </div>
                    <span className="text-sm text-muted-foreground w-6 h-6 flex items-center justify-center bg-secondary/10 rounded-md">
                      {form.watch(id)}
                    </span>
                  </div>
                  <Controller
                    name={id}
                    control={form.control}
                    render={({ field }) => (
                      <Slider
                        value={[field.value]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={([val]) => field.onChange(val)}
                        className="w-full"
                      />
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/60">
                    <span>{t("lowLabel" as any)}</span>
                    <span>{t("highLabel" as any)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION B: Trip Parameters */}
          <section className="card-premium p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary tracking-tight">{t("tripParameters")}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Left col */}
              <div className="space-y-10">
                {/* Budget */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("budget")}</label>
                  <Controller
                    name="budget_level_encoded"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        {[1, 2, 3].map((val) => {
                          const isSelected = field.value === val;
                          const labels = [t("budgetLow"), t("budgetMid"), t("budgetPremium")];
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => field.onChange(val)}
                              className={`flex flex-col items-center gap-2 flex-1 p-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
                                isSelected 
                                  ? "border-primary bg-primary text-white shadow-[0_4px_16px_rgba(11,31,75,0.2)]"
                                  : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:bg-primary/4"
                              }`}
                            >
                              {labels[val - 1]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("tripDuration")}</label>
                  <Controller
                    name="duration"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex gap-2 p-1 bg-secondary/10 rounded-xl border border-border">
                        {(["short", "week", "longer"] as const).map((val) => {
                          const isSelected = field.value === val;
                          const labels = { short: t("shortTrip"), week: t("oneWeek"), longer: t("longer") };
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => field.onChange(val)}
                              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                isSelected 
                                  ? "bg-white text-primary shadow-sm" 
                                  : "text-muted-foreground hover:text-primary"
                              }`}
                            >
                              {labels[val]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Right col */}
              <div className="space-y-10">
                {/* Temperature */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("temperature")}</label>
                    <span className="text-sm font-medium text-primary bg-secondary/20 px-2 py-1 rounded">
                      {form.watch("temp_avg_yearly")}°C
                    </span>
                  </div>
                  <Controller
                    name="temp_avg_yearly"
                    control={form.control}
                    render={({ field }) => (
                      <Slider
                        value={[field.value]}
                        min={-10}
                        max={50}
                        step={1}
                        onValueChange={([val]) => field.onChange(val)}
                        className="w-full"
                      />
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-blue-500" /> {t("coldLabel" as any)}</span>
                    <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-500" /> {t("hotLabel" as any)}</span>
                  </div>
                </div>

                {/* Hotel Rating */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("hotelRating")}</label>
                  <Controller
                    name="hotel_rating"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => field.onChange(star)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star 
                              className={`w-8 h-8 ${star <= field.value ? "fill-accent text-accent" : "fill-muted text-muted-foreground"}`} 
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                {/* Airport */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/5">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-primary">{t("requiresAirport")}</label>
                    <p className="text-xs text-muted-foreground">{t("requiresAirportDesc" as any)}</p>
                  </div>
                  <Controller
                    name="has_airport"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION C: Regions */}
          <section className="card-premium p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary tracking-tight">{t("regionPreferences")}</h2>
              <p className="text-sm text-muted-foreground mt-1">Select one or more regions, or leave empty for worldwide.</p>
            </div>
            <Controller
              name="regions"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-3">
                  {REGIONS.map((region) => {
                    const isSelected = field.value.includes(region.id);
                    return (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            field.onChange(field.value.filter(r => r !== region.id));
                          } else {
                            field.onChange([...field.value, region.id]);
                          }
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-white text-muted-foreground border-border hover:border-primary/40"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                        {t(region.labelKey as any)}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </section>

          {/* What You'll Get */}
          <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-6 md:p-8">
            <p className={`text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/55 mb-4 ${lang === "ar" ? "text-end" : ""}`}>
              {t("whatYouGet" as any)}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(["getItem1","getItem2","getItem3","getItem4","getItem5"] as const).map((k, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm text-primary/72 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                  <span className="text-primary/40 text-[10px] shrink-0">✦</span>
                  <span>{t(k as any)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-4 pb-8">
            <Button 
              type="submit" 
              size="lg" 
              className="h-auto w-full md:w-auto md:min-w-[320px] rounded-full py-4 px-12 text-base font-semibold bg-primary text-white shadow-[0_4px_20px_rgba(11,31,75,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(11,31,75,0.3)] transition-all duration-200"
              disabled={recommend.isPending}
            >
              {recommend.isPending ? (
                <span className="flex items-center gap-2">
                  <Plane className="w-5 h-5 animate-pulse" />
                  {t("findingDestinations")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  {t("findMyDestinations")}
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Animated loading reveal */}
        <AnimatePresence>
          {recommend.isPending && (
            <LoadingReveal pending={recommend.isPending} t={t} isAr={lang === "ar"} />
          )}
        </AnimatePresence>

        {/* Results Section */}
        <div ref={resultsRef} className="pt-8">
          <AnimatePresence>
            {results && results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-12"
              >
                <div className="section-heading">
                  <h2>{t("resultsHeadline" as any)}</h2>
                  <p>{t("resultsSubheadline" as any)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
                  {results.map((rec, idx) => {
                    // Use airport/hotel data straight from the API (backed by the real CSV dataset)
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
                      <motion.div 
                        key={rec.city}
                        id={`city-card-${rec.city}`}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.07 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        onClick={() => handleCitySelect(rec.city)}
                        className={`card-premium overflow-hidden group cursor-pointer flex flex-col ${
                          selectedCity === rec.city ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                      >
                        <CityScene city={rec.city} className="h-48 w-full shrink-0" />
                        <div className="p-5 flex flex-col flex-1 gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-primary">{rec.city}</h3>
                              <p className="text-sm text-muted-foreground">{rec.country}</p>
                            </div>
                            <div className="rounded-full bg-primary text-white px-3 py-1.5 text-sm font-bold whitespace-nowrap">
                              {Math.round(rec.match_percent)}{t('matchPercent' as any)} {t('matchScore' as any)}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {rec.top_features?.slice(0, 3).map((f) => (
                              <span key={f.feature} className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium">
                                {f.label}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {lang === "ar" && rec.explanation_ar ? rec.explanation_ar : rec.explanation}
                          </p>
                          
                          <div className="border-t border-border mt-auto pt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">✈️</span>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground text-xs">{t('nearestAirport' as any)}</span>
                                <span className="text-xs text-muted-foreground">{airportDisplay}</span>
                              </div>
                            </div>
                            {rec.hotel_name && (
                              <div className="flex items-center gap-2">
                                <span className="text-base">🏨</span>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground text-xs">{t('recommendedHotel' as any)}</span>
                                  <span className="text-xs text-muted-foreground">{rec.hotel_name}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="card-premium overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-border bg-white">
                    <h2 className="text-xl font-bold text-primary">{t("exploreMatchesTitle" as any)}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t("exploreMatchesSubtitle" as any)}</p>
                  </div>
                  <div className="bg-white">
                    <TravelMap 
                      recommendations={results} 
                      selectedCity={selectedCity}
                      onCitySelect={handleCitySelect}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {results && results.length === 0 && (
              <div className="text-center py-20">
                <Compass className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary">{t("noResults")}</h3>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
