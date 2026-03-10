import { Link } from "@tanstack/react-router";
import { Menu, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { getSiteSettings } from "../../lib/localDataStore";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const siteSettings = getSiteSettings();

  const navLinks =
    siteSettings.headerNavLinks.length > 0
      ? siteSettings.headerNavLinks
      : [
          { label: "Work", href: "#featured" },
          { label: "Projects", href: "#projects" },
          { label: "Skills", href: "#skills" },
          { label: "Reviews", href: "#reviews" },
          { label: "Contact", href: "#contact" },
        ];

  const logoText = siteSettings.logoText || "GR";
  const siteName = siteSettings.siteName || "Portfolio";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = href;
    }
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={
          scrolled
            ? {
                background: "rgba(5, 0, 0, 0.85)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                borderBottom: "1px solid var(--theme-border-line)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
              }
            : {
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }
        }
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Top accent line — visible only when scrolled */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, var(--theme-primary) 30%, var(--theme-primary) 70%, transparent 100%)",
                boxShadow: "0 0 8px var(--theme-primary-glow)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            data-ocid="nav.home_link"
            className="flex items-center gap-3 group"
          >
            {siteSettings.logoImageUrl ? (
              <motion.div
                className="relative w-10 h-10 rounded-full overflow-hidden"
                style={{
                  boxShadow:
                    "0 0 0 2px var(--theme-primary), 0 0 12px var(--theme-primary-glow)",
                  animation: "logoPulse 2.5s ease-in-out infinite",
                }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={siteSettings.logoImageUrl}
                  alt={siteName}
                  className="w-full h-full object-cover"
                />
                {/* Animated ring overlay */}
                <span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 0 2px var(--theme-primary)",
                    opacity: 0.7,
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm text-white relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--theme-primary), var(--theme-accent))",
                  boxShadow:
                    "0 0 0 2px var(--theme-primary), 0 0 16px var(--theme-primary-glow)",
                  animation: "logoPulse 2.5s ease-in-out infinite",
                }}
                whileHover={{
                  boxShadow:
                    "0 0 0 2px var(--theme-primary), 0 0 24px var(--theme-primary-glow), 0 0 48px var(--theme-primary-glow2)",
                  scale: 1.08,
                }}
                transition={{ duration: 0.25 }}
              >
                {/* Shimmer overlay */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                  }}
                />
                {logoText.length <= 2 ? (
                  <span className="relative z-10 text-white text-xs font-bold tracking-wider">
                    {logoText}
                  </span>
                ) : (
                  <Zap
                    className="w-4 h-4 text-white relative z-10"
                    fill="white"
                  />
                )}
              </motion.div>
            )}

            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-base gradient-text tracking-tight">
                {siteName}
              </span>
              {siteSettings.siteTagline && (
                <span className="text-[10px] text-muted-foreground/60 font-normal tracking-wide truncate max-w-[160px] hidden sm:block">
                  {siteSettings.siteTagline}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link, i) => (
              <motion.button
                type="button"
                key={link.href + link.label}
                onClick={() => scrollToSection(link.href)}
                className="relative px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                data-ocid="nav.link"
              >
                {link.label}

                {/* Dot indicator on hover */}
                <motion.span
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: "var(--theme-primary)" }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                />

                {/* Neon underline on hover */}
                <motion.span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                  style={{
                    background: "var(--theme-primary)",
                    boxShadow: "0 0 8px var(--theme-primary-glow)",
                  }}
                  initial={{ width: 0 }}
                  whileHover={{ width: "55%" }}
                  transition={{ duration: 0.2 }}
                />

                {/* Hover background */}
                <motion.span
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ background: "var(--theme-primary-dim)" }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                />
              </motion.button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              className="md:hidden relative p-2 rounded-xl transition-colors overflow-hidden"
              style={{
                background: mobileOpen
                  ? "var(--theme-primary-dim)"
                  : "transparent",
                border: "1px solid var(--theme-border-line)",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.92 }}
              data-ocid="nav.mobile.toggle"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X
                      className="w-5 h-5"
                      style={{ color: "var(--theme-primary)" }}
                    />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed top-[68px] left-4 right-4 z-40 rounded-2xl md:hidden overflow-hidden"
            style={{
              background: "rgba(5, 0, 0, 0.95)",
              backdropFilter: "blur(24px) saturate(200%)",
              WebkitBackdropFilter: "blur(24px) saturate(200%)",
              border: "1px solid var(--theme-border-line)",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--theme-primary-dim)",
            }}
          >
            {/* Top accent stripe */}
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--theme-primary), transparent)",
              }}
            />
            <div className="p-3 flex flex-col gap-0.5">
              {navLinks.map((link, i) => (
                <motion.button
                  type="button"
                  key={link.href + link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="text-left px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
                  style={{}}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  whileHover={{
                    backgroundColor: "var(--theme-primary-dim)",
                    x: 4,
                  }}
                  data-ocid="nav.mobile.link"
                >
                  <span
                    className="inline-block w-1 h-1 rounded-full mr-3 align-middle"
                    style={{ background: "var(--theme-primary)" }}
                  />
                  {link.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo pulse animation keyframes */}
      <style>{`
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 0 2px var(--theme-primary), 0 0 12px var(--theme-primary-glow); }
          50% { box-shadow: 0 0 0 3px var(--theme-primary), 0 0 24px var(--theme-primary-glow), 0 0 40px var(--theme-primary-glow2); }
        }
      `}</style>
    </>
  );
}
