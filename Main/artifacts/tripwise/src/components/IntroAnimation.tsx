import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroAnimation() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const skip = new URLSearchParams(window.location.search).get("no_intro");
    if (skip) return undefined;
    const hasShown = sessionStorage.getItem("intro_shown");
    if (!hasShown) {
      sessionStorage.setItem("intro_shown", "1");
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "linear-gradient(160deg, #dde0e5 0%, #c8ccd2 100%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
          transition={{ duration: 0.35 }}
        >
          {/* Cabin wall texture strips */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div style={{ position:"absolute", top:"18%", left:0, right:0, height:"2px", background:"rgba(255,255,255,0.18)" }} />
            <div style={{ position:"absolute", top:"22%", left:0, right:0, height:"1px", background:"rgba(0,0,0,0.06)" }} />
            <div style={{ position:"absolute", bottom:"18%", left:0, right:0, height:"2px", background:"rgba(255,255,255,0.18)" }} />
            <div style={{ position:"absolute", bottom:"22%", left:0, right:0, height:"1px", background:"rgba(0,0,0,0.06)" }} />
          </div>

          <div className="flex items-center gap-8 md:gap-12 px-6">
            {[0, 1, 2].map((i) => (
              <AirplaneWindowUnit key={i} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AirplaneWindowUnit({ index }: { index: number }) {
  // Window appears, then shade slides up after a short delay
  const windowDelay = index * 0.12;
  const shadeDelay = 0.6 + index * 0.18; // staggered shade opening

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: windowDelay, ease: "easeOut" }}
      style={{
        position: "relative",
        width: "clamp(110px, 14vw, 175px)",
        height: "clamp(145px, 18vw, 228px)",
      }}
    >
      {/* Outer wall recess / shadow */}
      <div style={{
        position: "absolute",
        inset: "-8px",
        borderRadius: "26px",
        background: "linear-gradient(145deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.04) 100%)",
        filter: "blur(4px)",
      }} />

      {/* Outer frame — thick rounded rect, gray gradient like the photo */}
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: "22px",
        background: "linear-gradient(160deg, #b8bcc4 0%, #9ea3ab 40%, #b2b7bf 100%)",
        boxShadow: "0 6px 28px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.12)",
        padding: "10px",
      }}>
        {/* Inner bevel ring */}
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: "14px",
          background: "linear-gradient(160deg, #c6cad1 0%, #a8adb5 100%)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.18), inset 0 -1px 2px rgba(255,255,255,0.2)",
          padding: "5px",
          position: "relative",
        }}>
          {/* Glass pane area */}
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative",
            background: "#b8d4f0",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)",
          }}>
            {/* Sky background */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, #5ab0f0 0%, #8dd0f8 35%, #c8e8fc 65%, #e8f5ff 100%)",
            }} />

            {/* Cloud layers */}
            <div style={{
              position: "absolute",
              bottom: "8%",
              left: "-20%",
              width: "140%",
              height: "40%",
              background: "radial-gradient(ellipse 60% 40% at 40% 80%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              animation: `cloudDrift ${7 + index * 2}s ease-in-out infinite alternate`,
            }} />
            <div style={{
              position: "absolute",
              bottom: "20%",
              right: "-15%",
              width: "100%",
              height: "30%",
              background: "radial-gradient(ellipse 50% 35% at 60% 70%, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)",
              animation: `cloudDrift ${5 + index * 3}s ease-in-out infinite alternate-reverse`,
            }} />
            <div style={{
              position: "absolute",
              top: "10%",
              left: "10%",
              width: "80%",
              height: "20%",
              background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 100%)",
            }} />

            {/* Glass reflection streak */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "15%",
              width: "22%",
              height: "75%",
              background: "linear-gradient(175deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
              borderRadius: "0 0 8px 8px",
              pointerEvents: "none",
            }} />

            {/* SHADE — slides upward to open */}
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                originY: 0,
              }}
              initial={{ y: "0%" }}
              animate={{ y: "-100%" }}
              transition={{
                duration: 1.0,
                delay: shadeDelay,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {/* Shade body */}
              <div style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, #c8cdd4 0%, #b8bdc4 60%, #a8adb4 100%)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              }} />
              {/* Pull handle at bottom of shade */}
              <div style={{
                position: "absolute",
                bottom: "-6px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "32%",
                height: "8px",
                borderRadius: "0 0 6px 6px",
                background: "linear-gradient(180deg, #9ea3ab 0%, #888d96 100%)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }} />
              {/* Handle grip lines */}
              <div style={{
                position: "absolute",
                bottom: "-3px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "3px",
              }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width: "2px", height: "4px", background: "rgba(255,255,255,0.4)", borderRadius: "1px" }} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
