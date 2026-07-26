import { useRef } from "react";
import { Link } from "wouter";
import { useT, useLanguage } from "@/lib/i18n";
import { motion, useInView } from "framer-motion";
import {
  Sparkles, MapPin, Brain, ArrowRight,
  Star, Cpu, Globe2, Compass,
} from "lucide-react";

// ── Floating glass destination card ──────────────────────────────────────
function FloatingCard({
  city, country, match, tag1, tag2, delay, className,
}: {
  city: string; country: string; match: number;
  tag1: string; tag2: string; delay: number; className?: string;
}) {
  return (
    <motion.div className={`absolute ${className} z-20 pointer-events-none`}
      initial={{ opacity: 0, scale: 0.82, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.75, delay, ease: "easeOut" }}>
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 4 + delay * 0.6, repeat: Infinity, ease: "easeInOut", delay: delay + 0.8 }}
        className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5
          shadow-[0_8px_32px_rgba(0,0,0,0.28)] min-w-[150px]">
        <div className="text-[9px] font-bold tracking-[0.14em] uppercase text-blue-300 mb-1.5">
          ✦ {match}% MATCH
        </div>
        <div className="text-sm font-bold text-white leading-snug">{city}</div>
        <div className="text-[10px] text-blue-200/55 mb-2">{country}</div>
        <div className="flex gap-1.5">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-blue-200 font-medium">{tag1}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-blue-200 font-medium">{tag2}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Animated globe SVG ────────────────────────────────────────────────────
const GLOBE_DOTS = [
  { x: 95,  y: 110 },
  { x: 113, y: 220 },
  { x: 208, y: 90  },
  { x: 220, y: 184 },
  { x: 260, y: 143 },
  { x: 314, y: 96  },
  { x: 340, y: 238 },
];

const GLOBE_ARCS = [
  { d: "M 95,110 Q 150,55 208,90",   delay: 0.0 },
  { d: "M 208,90 Q 261,47 314,96",   delay: 0.5 },
  { d: "M 95,110 Q 104,165 113,220", delay: 0.9 },
  { d: "M 208,90 Q 214,137 220,184", delay: 0.3 },
  { d: "M 260,143 Q 287,120 314,96", delay: 0.7 },
  { d: "M 314,96 Q 327,167 340,238", delay: 1.1 },
];

function GlobeSVG() {
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="hg-glow" cx="52%" cy="50%" r="48%">
          <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <clipPath id="hg-clip">
          <circle cx={200} cy={170} r={148} />
        </clipPath>
      </defs>

      <circle cx={200} cy={170} r={158} fill="url(#hg-glow)" />
      <circle cx={200} cy={170} r={148} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />

      <g clipPath="url(#hg-clip)" opacity={0.06}>
        {[60, 100, 140, 170, 200, 240, 280].map(y => (
          <line key={y} x1={52} y1={y} x2={348} y2={y} stroke="white" strokeWidth={0.8} />
        ))}
        {[80, 120, 165, 200, 240, 280, 320].map(x => (
          <line key={x} x1={x} y1={22} x2={x} y2={318} stroke="white" strokeWidth={0.8} />
        ))}
      </g>

      {GLOBE_ARCS.map((arc, i) => (
        <motion.path key={i} d={arc.d}
          fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="5 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 2.5, delay: arc.delay, ease: "easeInOut" }} />
      ))}

      {GLOBE_DOTS.map((dot, i) => (
        <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.2 + i * 0.1 }}>
          <motion.circle cx={dot.x} cy={dot.y} fill="none" stroke="#93c5fd" strokeWidth={1}
            initial={{ r: 5, opacity: 0.5 }}
            animate={{ r: [5, 14, 5], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }} />
          <circle cx={dot.x} cy={dot.y} r={4} fill="#60a5fa" />
          <circle cx={dot.x} cy={dot.y} r={2} fill="white" />
        </motion.g>
      ))}
    </svg>
  );
}

// ── Scroll-triggered card wrapper ─────────────────────────────────────────
function ScrollCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className="card-premium"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  );
}

// ── Main Home ─────────────────────────────────────────────────────────────
export function Home() {
  const t = useT();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const pipeRef = useRef<HTMLDivElement>(null);
  const pipeInView = useInView(pipeRef, { once: true, margin: "-80px" });

  const prefBars = [
    { key: "culture",   pct: 78 },
    { key: "nature",    pct: 88 },
    { key: "beaches",   pct: 62 },
    { key: "cuisine",   pct: 90 },
    { key: "adventure", pct: 72 },
  ];

  return (
    <div className={`flex-1 flex flex-col bg-background ${isAr ? "" : ""}`}
      dir={isAr ? "rtl" : "ltr"}>

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[calc(100vh-3.5rem)] bg-[#0B1F4B] overflow-hidden flex items-center">
        {/* Atmospheric depth layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-25%] right-[-10%] w-[65%] aspect-square rounded-full bg-blue-600/13 blur-[140px]" />
          <div className="absolute bottom-[-20%] left-[-8%] w-[45%] aspect-square rounded-full bg-indigo-700/10 blur-[110px]" />
          <div className="absolute top-[35%] left-[15%] w-[32%] aspect-square rounded-full bg-sky-500/6 blur-[80px]" />
        </div>

        <div className="container mx-auto px-6 py-20 max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.12fr] gap-10 lg:gap-6 items-center">

            {/* LEFT — copy */}
            <div className={`flex flex-col gap-6 ${isAr ? "items-end text-end" : "items-start"}`}>
              <motion.div
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                  bg-blue-400/13 border border-blue-400/22 text-blue-200 text-[11px] font-bold tracking-[0.1em] uppercase">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                {t("heroBadge")}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="text-[2.7rem] md:text-[3.6rem] lg:text-[4.2rem] font-extrabold text-white
                  leading-[1.05] tracking-[-0.03em]">
                {t("heroTitle")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="text-lg md:text-xl font-semibold text-blue-100/75 leading-snug max-w-[430px]">
                {t("heroTagline" as any)}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.26 }}
                className="text-sm md:text-[15px] text-blue-200/55 leading-relaxed max-w-[440px]">
                {t("heroSubtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.36 }}
                className={`flex flex-wrap gap-3 ${isAr ? "justify-end" : ""}`}>
                <Link href="/planner">
                  <button className="group flex items-center gap-2.5 bg-white text-[#0B1F4B]
                    px-8 py-3.5 rounded-full text-sm font-bold
                    shadow-[0_4px_24px_rgba(0,0,0,0.2)]
                    hover:shadow-[0_8px_36px_rgba(0,0,0,0.3)]
                    hover:-translate-y-0.5 transition-all duration-200">
                    {t("planMyTrip")}
                    <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5
                      ${isAr ? "rotate-180" : ""}`} />
                  </button>
                </Link>
                <Link href="/explore">
                  <button className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold
                    text-white/70 border border-white/17
                    hover:bg-white/8 hover:-translate-y-0.5 transition-all duration-200">
                    <MapPin className="w-4 h-4 shrink-0" />
                    {t("exploreDestinations")}
                  </button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.52 }}
                className={`flex flex-wrap items-center gap-4 text-sm text-blue-200/50 ${isAr ? "flex-row-reverse" : ""}`}>
                <span><strong className="text-white font-bold">316</strong> {t("destinationsCount" as any)}</span>
                <span className="w-px h-3 bg-white/12" />
                <span><strong className="text-white font-bold">7</strong> {t("regionsCount" as any)}</span>
                <span className="w-px h-3 bg-white/12" />
                <span className="text-blue-300 font-medium">{t("aiPoweredLabel" as any)}</span>
              </motion.div>
            </div>

            {/* RIGHT — globe visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.12, ease: "easeOut" }}
              className="relative w-full flex justify-center lg:justify-end order-first lg:order-last">
              <div className="relative w-full max-w-[520px] aspect-square">
                <GlobeSVG />
                <FloatingCard city="Hallstatt" country="Austria" match={92}
                  tag1="Nature" tag2="Culture" delay={1.6}
                  className="-top-2 -left-6" />
                <FloatingCard city="Kyoto" country="Japan" match={87}
                  tag1="Culture" tag2="Cuisine" delay={2.0}
                  className="top-8 -right-6" />
                <FloatingCard city="Monaco" country="Monaco" match={95}
                  tag1="Urban" tag2="Luxury" delay={2.4}
                  className="bottom-24 -left-8" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. VALUE STRIP ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            {[
              { Icon: Sparkles, labelKey: "strip1" },
              { Icon: Brain,    labelKey: "strip2" },
              { Icon: Compass,  labelKey: "strip3" },
              { Icon: Globe2,   labelKey: "strip4" },
            ].map(({ Icon, labelKey }, i) => (
              <div key={i} className={`flex items-center gap-3 px-6 py-5 ${isAr ? "flex-row-reverse" : ""}`}>
                <div className="w-9 h-9 rounded-xl bg-primary/7 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary leading-tight">{t(labelKey as any)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. PIPELINE — "From preferences to places" ──────────────────── */}
      <section className="bg-secondary/5 border-b border-border py-20 md:py-28 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="section-heading" ref={pipeRef}>
            <h2>{t("fromPrefTitle" as any)}</h2>
            <p>{t("fromPrefSubtitle" as any)}</p>
          </div>

          <div className={`flex flex-col md:flex-row items-stretch gap-4 ${isAr ? "md:flex-row-reverse" : ""}`}>

            {/* Preferences */}
            <div className="flex-1 card-premium p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/55 mb-5">
                {isAr ? "أسلوب سفرك" : "Your Style"}
              </p>
              <div className="space-y-4">
                {prefBars.map((p, i) => (
                  <motion.div key={p.key}
                    initial={{ opacity: 0, x: isAr ? 14 : -14 }}
                    animate={pipeInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold text-primary">{t(p.key as any)}</span>
                    </div>
                    <div className="h-1.5 bg-secondary/15 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={pipeInView ? { width: `${p.pct}%` } : {}}
                        transition={{ duration: 1.1, delay: 0.35 + i * 0.12, ease: "easeOut" }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Arrow → */}
            <div className="hidden md:flex items-center justify-center px-2">
              <div className={`flex flex-col items-center gap-1 ${isAr ? "scale-x-[-1]" : ""}`}>
                <motion.div className="h-px w-10 bg-gradient-to-r from-transparent to-primary/40"
                  initial={{ scaleX: 0 }} animate={pipeInView ? { scaleX: 1 } : {}}
                  style={{ originX: 0 }} transition={{ duration: 0.7, delay: 0.9 }} />
                <span className="text-primary/35 text-xs mt-0.5">→</span>
              </div>
            </div>

            {/* AI Engine */}
            <motion.div
              className="flex-shrink-0 card-premium p-7 flex flex-col items-center justify-center gap-4 min-w-[176px]"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={pipeInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.65, delay: 0.65 }}>
              <motion.div
                animate={{ boxShadow: [
                  "0 0 0 0 rgba(11,31,75,0)",
                  "0 0 0 16px rgba(11,31,75,0.08)",
                  "0 0 0 0 rgba(11,31,75,0)",
                ]}}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-bold text-primary">TripWise AI</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isAr ? "تحليل ومطابقة" : "Analyzing & Matching"}
                </p>
              </div>
            </motion.div>

            {/* Arrow → */}
            <div className="hidden md:flex items-center justify-center px-2">
              <div className={`flex flex-col items-center gap-1 ${isAr ? "scale-x-[-1]" : ""}`}>
                <motion.div className="h-px w-10 bg-gradient-to-r from-primary/40 to-transparent"
                  initial={{ scaleX: 0 }} animate={pipeInView ? { scaleX: 1 } : {}}
                  style={{ originX: 0 }} transition={{ duration: 0.7, delay: 1.1 }} />
                <span className="text-primary/35 text-xs mt-0.5">→</span>
              </div>
            </div>

            {/* Destinations */}
            <div className="flex-1 card-premium p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/55 mb-5">
                {isAr ? "وجهاتك المخصصة" : "Your Destinations"}
              </p>
              <div className="space-y-3">
                {[
                  { city: isAr ? "هالشتات، النمسا" : "Hallstatt, Austria", pct: 92 },
                  { city: isAr ? "كيوتو، اليابان" : "Kyoto, Japan",        pct: 87 },
                  { city: "Monaco",                                          pct: 95 },
                ].map((d, i) => (
                  <motion.div key={i}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5"
                    initial={{ opacity: 0, x: isAr ? -14 : 14 }}
                    animate={pipeInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 1.25 + i * 0.14 }}>
                    <div className="w-2 h-2 rounded-full bg-primary/50 shrink-0" />
                    <span className="text-sm font-medium text-primary flex-1">{d.city}</span>
                    <span className="text-xs font-bold text-blue-600 shrink-0">
                      {d.pct}{isAr ? "٪" : "%"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. WHY TRIPWISE ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="section-heading">
            <h2>{t("whyTripwise")}</h2>
            <p>{t("whyTripwiseDesc" as any)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: Star,   tkTitle: "benefit1Title" as const, tkBody: "benefit1Body" as const },
              { Icon: Cpu,    tkTitle: "benefit2Title" as const, tkBody: "benefit2Body" as const },
              { Icon: Globe2, tkTitle: "benefit3Title" as const, tkBody: "benefit3Body" as const },
            ].map(({ Icon, tkTitle, tkBody }, i) => (
              <ScrollCard key={i} delay={i * 0.1}>
                <div className="p-8 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary">{t(tkTitle as any)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(tkBody as any)}</p>
                </div>
              </ScrollCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FINAL CTA ────────────────────────────────────────────────── */}
      <section className="bg-[#0B1F4B] py-20 md:py-24 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.h2
            className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            {isAr ? "ابدأ رحلتك الآن." : "Ready to find your next destination?"}
          </motion.h2>
          <motion.p className="text-blue-200/55 text-sm mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}>
            {isAr ? "دعنا نختار لك." : "Let us choose for you."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <Link href="/planner">
              <button className="group inline-flex items-center gap-2.5 bg-white text-[#0B1F4B]
                px-10 py-4 rounded-full text-sm font-bold
                shadow-[0_4px_24px_rgba(0,0,0,0.2)]
                hover:shadow-[0_10px_36px_rgba(0,0,0,0.3)]
                hover:-translate-y-0.5 transition-all duration-200">
                {t("planMyTrip")}
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5
                  ${isAr ? "rotate-180" : ""}`} />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
