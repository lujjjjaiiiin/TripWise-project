import { motion } from "framer-motion";

interface AirplaneWindowProps {
  isActive: boolean;
}

export function AirplaneWindow({ isActive }: AirplaneWindowProps) {
  return (
    <div className="relative w-[280px] h-[380px] md:w-[320px] md:h-[440px] mx-auto select-none">
      {/* Outermost shadow ring */}
      <div
        className="absolute inset-0 rounded-[120px]"
        style={{
          boxShadow: "0 32px 80px rgba(11,31,75,0.28), 0 8px 24px rgba(11,31,75,0.18)",
        }}
      />

      {/* Outer frame — deep navy */}
      <div
        className="absolute inset-0 rounded-[120px] p-[14px]"
        style={{ background: "#0B1F4B" }}
      >
        {/* Middle frame — lighter navy */}
        <div
          className="absolute inset-0 rounded-[112px] m-[14px] p-[10px]"
          style={{ background: "#162B65" }}
        >
          {/* Inner bezel — near-white */}
          <div
            className="absolute inset-0 rounded-[100px] m-[14px] overflow-hidden"
            style={{
              background: "#DDEEFF",
              border: "2px solid rgba(255,255,255,0.5)",
            }}
          >
            {/* Sky gradient — animated */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              animate={{
                background: isActive
                  ? "linear-gradient(175deg, #2563EB 0%, #60A5FA 55%, #BAE6FD 100%)"
                  : "linear-gradient(175deg, #0B1F4B 0%, #1E40AF 55%, #2563EB 100%)",
              }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              style={{
                background: "linear-gradient(175deg, #0B1F4B 0%, #1E40AF 55%, #2563EB 100%)",
              }}
            />

            {/* Clouds */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: isActive ? 1 : 0.3 }}
              transition={{ duration: 1.2 }}
            >
              <div className="cloud cloud-1" />
              <div className="cloud cloud-2" />
              <div className="cloud cloud-3" />
            </motion.div>

            {/* Frost/tint overlay — fades out when active */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              animate={{ opacity: isActive ? 0 : 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{
                background: "rgba(11,31,75,0.55)",
                backdropFilter: "blur(1px)",
              }}
            />

            {/* Glow when active */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                background:
                  "radial-gradient(ellipse at 50% 30%, rgba(125,196,234,0.35) 0%, transparent 70%)",
              }}
            />

            {/* Reflection glint — top-left */}
            <div
              className="absolute top-0 left-0 w-[60%] h-[30%] pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Frame screws — decorative detail */}
      {[
        { top: "18%", left: "4%" },
        { top: "18%", right: "4%" },
        { bottom: "18%", left: "4%" },
        { bottom: "18%", right: "4%" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            ...pos,
            background: "#162B65",
            border: "2px solid rgba(255,255,255,0.15)",
          }}
        />
      ))}

      {/* Active glow ring */}
      <motion.div
        className="absolute inset-0 rounded-[120px] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isActive ? [0, 0.6, 0.3] : 0,
          boxShadow: isActive
            ? [
                "0 0 0 0 rgba(126,184,212,0)",
                "0 0 40px 12px rgba(126,184,212,0.5)",
                "0 0 24px 6px rgba(126,184,212,0.3)",
              ]
            : "0 0 0 0 rgba(126,184,212,0)",
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </div>
  );
}
