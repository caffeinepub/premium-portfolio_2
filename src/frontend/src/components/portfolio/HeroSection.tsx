import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { getLocalHeroSettings } from "../../lib/localDataStore";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Dynamic theme particles -- read from CSS variables set by applyDesignToDOM
    const style = getComputedStyle(document.documentElement);
    const p1 =
      style.getPropertyValue("--theme-particle-1").trim() ||
      "rgba(255, 60, 60,";
    const p2 =
      style.getPropertyValue("--theme-particle-2").trim() ||
      "rgba(220, 30, 30,";
    const p3 =
      style.getPropertyValue("--theme-particle-3").trim() ||
      "rgba(255, 100, 80,";
    const p4 =
      style.getPropertyValue("--theme-particle-4").trim() ||
      "rgba(200, 20, 50,";
    const colors = [p1, p2, p3, p4];

    const count = Math.min(
      80,
      Math.floor((canvas.width * canvas.height) / 12000),
    );
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    const drawConnections = (particles: Particle[]) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `${p1}${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      drawConnections(particles);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        const pulseOpacity = p.opacity + Math.sin(p.pulse) * 0.2;
        const pulseRadius = p.radius + Math.sin(p.pulse * 0.7) * 0.3;

        // Glow effect
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          pulseRadius * 4,
        );
        gradient.addColorStop(0, `${p.color}${pulseOpacity})`);
        gradient.addColorStop(1, `${p.color}0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.min(pulseOpacity * 1.5, 1)})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  );
}

interface HeroSectionProps {
  contactName?: string;
  contactTitle?: string;
}

export default function HeroSection({
  contactName,
  contactTitle,
}: HeroSectionProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const heroSettings = getLocalHeroSettings();
  const name = contactName || "Ganesh Raikwar";
  const title = contactTitle || "Full-Stack Developer & Creative Technologist";

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      {/* Theme gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, var(--theme-primary-dim) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 20% 70%, var(--theme-accent-dim) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 80% 60%, var(--theme-primary-glow-sm) 0%, transparent 60%)",
        }}
      />
      {/* Bottom fade to background */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Floating theme orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="relative px-8 py-6 text-base font-semibold bg-primary text-primary-foreground transition-all duration-300"
          style={{
            boxShadow:
              "0 0 20px var(--theme-primary-glow), 0 0 40px var(--theme-primary-glow2)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--theme-accent-dim) 0%, transparent 70%)",
            top: "20%",
            right: "8%",
          }}
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.6, 0.9, 0.6] }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--theme-primary-low) 0%, transparent 70%)",
            bottom: "20%",
            left: "15%",
          }}
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm font-medium text-muted-foreground"
            style={{ border: "1px solid var(--theme-primary-border)" }}
            animate={{
              boxShadow: [
                "0 0 8px var(--theme-primary-glow2)",
                "0 0 16px var(--theme-primary-glow)",
                "0 0 8px var(--theme-primary-glow2)",
              ],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{heroSettings.availabilityText}</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </motion.div>
        </motion.div>

        <motion.h1
          className="font-display text-5xl sm:text-7xl md:text-8xl font-extrabold leading-none mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
        >
          <motion.span
            className="text-foreground"
            animate={{
              textShadow: [
                "0 0 0px transparent",
                "0 0 20px var(--theme-primary-glow2)",
                "0 0 0px transparent",
              ],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          >
            {heroSettings.tagline}
          </motion.span>
          <br />
          <motion.span
            className="gradient-text"
            animate={{
              filter: [
                "drop-shadow(0 0 8px var(--theme-primary-glow))",
                "drop-shadow(0 0 20px var(--theme-primary))",
                "drop-shadow(0 0 8px var(--theme-primary-glow))",
              ],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            {name}
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4 font-light"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
        >
          {title}
        </motion.p>

        <motion.p
          className="text-base text-muted-foreground/70 max-w-xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
        >
          {heroSettings.subtitle}
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.55 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="relative px-8 py-6 text-base font-semibold bg-primary text-primary-foreground transition-all duration-300"
              style={{
                boxShadow:
                  "0 0 20px var(--theme-primary-glow), 0 0 40px var(--theme-primary-glow2)",
              }}
              onClick={() => scrollToSection("projects")}
              data-ocid="hero.primary_button"
            >
              <span className="relative z-10">{heroSettings.ctaPrimary}</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-base font-semibold glass hover:border-primary/60 transition-all duration-300"
              style={{ borderColor: "var(--theme-primary-border)" }}
              onClick={() => scrollToSection("contact")}
              data-ocid="hero.secondary_button"
            >
              {heroSettings.ctaSecondary}
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8"
          style={{ borderTop: "1px solid var(--theme-border-line)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {heroSettings.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="font-display text-2xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        onClick={() => scrollToSection("featured")}
        aria-label="Scroll down"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </motion.button>
    </section>
  );
}
