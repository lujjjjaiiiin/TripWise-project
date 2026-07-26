import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useT, useLanguage } from "@/lib/i18n";
import { Link } from "wouter";

// ── Animated SVG: destination constellation shown in the hero ──────────────
const DOTS = [
  { x: 92,  y: 112 }, // North America
  { x: 112, y: 212 }, // South America
  { x: 232, y: 88  }, // Europe
  { x: 252, y: 192 }, // Africa
  { x: 302, y: 152 }, // Middle East
  { x: 387, y: 98  }, // Asia
  { x: 438, y: 202 }, // Oceania
];

const ARCS = [
  { d: "M 92,112 Q 162,50 232,88",      delay: 0.2 },
  { d: "M 232,88 Q 309,50 387,98",      delay: 0.6 },
  { d: "M 92,112 Q 102,162 112,212",    delay: 1.0 },
  { d: "M 232,88 Q 242,140 252,192",    delay: 0.4 },
  { d: "M 387,98 Q 412,150 438,202",    delay: 0.8 },
  { d: "M 232,88 Q 267,120 302,152",    delay: 1.2 },
];

function ConstellationMap() {
  return (
    <svg
      viewBox="0 0 560 300"
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
      aria-hidden
    >
      {/* subtle lat/lon grid */}
      {[60, 120, 180, 240].map((y) => (
        <line key={y} x1={0} y1={y} x2={560} y2={y}
          stroke="white" strokeWidth={0.5} strokeOpacity={0.12} />
      ))}
      {[80, 160, 280, 400, 480].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={300}
          stroke="white" strokeWidth={0.5} strokeOpacity={0.12} />
      ))}

      {/* flight arcs */}
      {ARCS.map((arc, i) => (
        <motion.path
          key={i}
          d={arc.d}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={1.5}
          strokeDasharray="4 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 2, delay: arc.delay, ease: "easeInOut" }}
        />
      ))}

      {/* destination dots */}
      {DOTS.map((dot, i) => (
        <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 + i * 0.15 }}>
          {/* outer pulse ring */}
          <motion.circle cx={dot.x} cy={dot.y} fill="none"
            stroke="#93c5fd" strokeWidth={1}
            initial={{ r: 10, opacity: 0.5 }}
            animate={{ r: [10, 18, 10], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }} />
          {/* inner dot */}
          <circle cx={dot.x} cy={dot.y} r={4} fill="#60a5fa" />
          <circle cx={dot.x} cy={dot.y} r={2} fill="white" />
        </motion.g>
      ))}
    </svg>
  );
}

// ── Animated icons for the 3 How It Works steps ───────────────────────────
function SlidersIcon() {
  const bars = [
    { y: 22, width: 44, delay: 0 },
    { y: 40, width: 30, delay: 0.25 },
    { y: 58, width: 50, delay: 0.5 },
  ];
  return (
    <svg viewBox="0 0 80 80" className="w-[72px] h-[72px]">
      {bars.map((b, i) => (
        <g key={i}>
          <rect x={12} y={b.y} width={56} height={6} rx={3} fill="currentColor" opacity={0.15} />
          <motion.rect x={12} y={b.y} rx={3} height={6} fill="currentColor"
            initial={{ width: 0 }}
            animate={{ width: b.width }}
            transition={{ duration: 1.2, delay: b.delay, repeat: Infinity,
              repeatType: "reverse", repeatDelay: 0.8, ease: "easeInOut" }} />
          <motion.circle cy={b.y + 3} r={7} fill="currentColor" stroke="white" strokeWidth={2}
            initial={{ cx: 12 }}
            animate={{ cx: 12 + b.width }}
            transition={{ duration: 1.2, delay: b.delay, repeat: Infinity,
              repeatType: "reverse", repeatDelay: 0.8, ease: "easeInOut" }} />
        </g>
      ))}
    </svg>
  );
}

function NeuralIcon() {
  const nodes = [
    { x: 15, y: 40 },
    { x: 38, y: 18 }, { x: 38, y: 62 },
    { x: 65, y: 40 },
  ];
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3], [1, 2]];
  return (
    <svg viewBox="0 0 80 80" className="w-[72px] h-[72px]">
      {edges.map(([a, b], i) => (
        <motion.line key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="currentColor" strokeWidth={1.5}
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }} />
      ))}
      {nodes.map((n, i) => (
        <motion.circle key={i} cx={n.x} cy={n.y} r={i === 0 || i === 3 ? 7 : 5}
          fill="currentColor"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }} />
      ))}
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 80 80" className="w-[72px] h-[72px]">
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx={40} cy={60} fill="none"
          stroke="currentColor" strokeWidth={1}
          initial={{ r: 2, opacity: 0.6 }}
          animate={{ r: 14 + i * 8, opacity: 0 }}
          transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }} />
      ))}
      <motion.g
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, type: "spring", bounce: 0.5 }}>
        <ellipse cx={40} cy={27} rx={12} ry={13} fill="currentColor" />
        <circle cx={40} cy={26} r={5} fill="white" />
        <motion.line x1={40} y1={40} x2={40} y2={58}
          stroke="currentColor" strokeWidth={3} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }} />
      </motion.g>
    </svg>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────
function StepCard({ number, Icon, title, body, delay = 0 }: {
  number: string; Icon: React.FC; title: string; body: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="card-premium p-8 flex flex-col items-center text-center gap-4">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full
        bg-primary text-white text-xs font-bold shrink-0">{number}</span>
      <div className="text-primary"><Icon /></div>
      <h3 className="text-lg font-bold text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </motion.div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ number, label, delay = 0 }: { number: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center gap-2 py-8 px-4">
      <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">{number}</span>
      <span className="text-sm font-medium text-blue-200 uppercase tracking-widest">{label}</span>
    </motion.div>
  );
}

// ── AI pipeline visualization ──────────────────────────────────────────────
function PipelineBox({ label, sub, delay = 0, highlight = false }: {
  label: string; sub: string[]; delay?: number; highlight?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={`rounded-2xl p-6 flex flex-col items-center text-center gap-3 w-full max-w-[180px]
        ${highlight
          ? "bg-primary text-white shadow-[0_0_30px_rgba(11,31,75,0.3)]"
          : "card-premium"}`}>
      <span className={`text-base font-bold ${highlight ? "text-white" : "text-primary"}`}>{label}</span>
      <div className="flex flex-col gap-1.5 w-full">
        {sub.map((s, i) => (
          <span key={i} className={`text-[11px] font-medium px-2 py-1 rounded-full
            ${highlight ? "bg-white/15 text-blue-100" : "bg-primary/8 text-primary/70"}`}>{s}</span>
        ))}
      </div>
    </motion.div>
  );
}

function PipelineArrow({ delay = 0 }: { delay?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.svg ref={ref} viewBox="0 0 48 24" className="w-10 h-6 text-primary shrink-0"
      initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4, delay }}>
      <motion.line x1={2} y1={12} x2={36} y2={12}
        stroke="currentColor" strokeWidth={2} strokeDasharray="4 3"
        initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: 0.7, delay }} />
      <polyline points="32,7 42,12 32,17"
        fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
    </motion.svg>
  );
}

// ── Main About page ────────────────────────────────────────────────────────
export default function About() {
  const t = useT();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const storyRef = useRef<HTMLDivElement>(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-80px" });
  const missionRef = useRef<HTMLDivElement>(null);
  const missionInView = useInView(missionRef, { once: true, margin: "-80px" });

  return (
    <div className={`flex flex-col min-h-screen bg-background overflow-x-hidden ${isAr ? "font-arabic" : ""}`}
      dir={isAr ? "rtl" : "ltr"}>

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[420px] md:min-h-[500px] bg-[#0B1F4B]
        flex items-center justify-center overflow-hidden">
        {/* animated gradient overlay */}
        <motion.div className="absolute inset-0 bg-gradient-to-br from-[#0B1F4B] via-[#132d66] to-[#0d2558]"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }} />
        <ConstellationMap />

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.span initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-semibold tracking-widest text-blue-300
              uppercase border border-blue-400/30 rounded-full px-4 py-1 mb-6">
            {isAr ? "عن TripWise AI" : "About TripWise AI"}
          </motion.span>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-5">
            {t("aboutTagline" as any)}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-base md:text-lg text-blue-200/90 leading-relaxed mb-8 max-w-xl mx-auto">
            {t("aboutStoryP1" as any)}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}>
            <Link href="/planner">
              <button className="btn-primary px-8 py-3 text-sm font-semibold">
                {t("startPlanning")}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Story ────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 ref={storyRef}
            initial={{ opacity: 0, y: 24 }}
            animate={storyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-2xl md:text-4xl font-extrabold text-primary leading-tight mb-8">
            {t("aboutStoryHeadline" as any)}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={storyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
            {t("aboutStoryP2" as any)}
          </motion.p>
        </div>
      </section>

      {/* ── 3. How It Works ─────────────────────────────────────────────── */}
      <section className="bg-secondary/5 border-t border-border py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              {t("howItWorksSubtitle" as any)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard number="01" Icon={SlidersIcon}
              title={t("youTellUs" as any)} body={t("youTellUsBody" as any)} delay={0} />
            <StepCard number="02" Icon={NeuralIcon}
              title={t("weUnderstand" as any)} body={t("weUnderstandBody" as any)} delay={0.12} />
            <StepCard number="03" Icon={PinIcon}
              title={t("youDiscover" as any)} body={t("youDiscoverBody" as any)} delay={0.24} />
          </div>
        </div>
      </section>

      {/* ── 4. By the Numbers ───────────────────────────────────────────── */}
      <section className="bg-[#0B1F4B] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase
            text-blue-300 mb-8">
            {t("ourNumbers" as any)}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 divide-x divide-white/10">
            <StatCard number="316" label={t("destinationsCount" as any)} delay={0} />
            <StatCard number="7"   label={t("regionsCount" as any)}      delay={0.1} />
            <StatCard number="9"   label={t("dimensionsCount" as any)}   delay={0.2} />
            <StatCard number="100%" label={t("aiPoweredLabel" as any)}   delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── 5. AI Pipeline ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              {isAr
                ? "ثلاث خطوات تحول تفضيلاتك إلى وجهة مثالية."
                : "Three steps that turn your preferences into the perfect destination."}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
            <PipelineBox delay={0}
              label={t("profileLabel" as any)}
              sub={isAr
                ? ["الثقافة", "المغامرة", "الطبيعة", "الميزانية", "أسلوب السفر"]
                : ["Culture", "Adventure", "Nature", "Budget", "Travel Style"]} />
            <PipelineArrow delay={0.3} />
            <PipelineBox delay={0.4} highlight
              label={t("aiEngineLabel" as any)}
              sub={isAr
                ? ["K-Means تجميع", "تشابه جيب التمام", "316 وجهة"]
                : ["K-Means Clustering", "Cosine Similarity", "316 Destinations"]} />
            <PipelineArrow delay={0.7} />
            <PipelineBox delay={0.8}
              label={t("yourMatchLabel" as any)}
              sub={isAr
                ? ["أفضل مطابقة", "خريطة تفاعلية", "تفسير مخصص"]
                : ["Best Match", "Interactive Map", "Personalized Why"]} />
          </div>
        </div>
      </section>

      {/* ── 6. Mission ──────────────────────────────────────────────────── */}
      <section className="bg-[#0B1F4B] py-20 md:py-24 px-6">
        <div className="max-w-2xl mx-auto text-center" ref={missionRef}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={missionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-5">
            {t("ourMission" as any)}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={missionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-8">
            {t("missionBody" as any)}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={missionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}>
            <Link href="/planner">
              <button className="btn-primary px-10 py-3.5 text-sm font-semibold">
                {t("planMyTrip")}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
