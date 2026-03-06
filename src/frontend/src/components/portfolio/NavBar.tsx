import { Link } from "@tanstack/react-router";
import { Menu, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Work", href: "#featured" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-strong" : "bg-transparent"
        }`}
        style={
          scrolled
            ? { borderBottom: "1px solid oklch(0.65 0.26 20 / 0.15)" }
            : {}
        }
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            data-ocid="nav.home_link"
            className="flex items-center gap-2 group"
          >
            <motion.div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.24 22), oklch(0.55 0.28 10))",
              }}
              whileHover={{
                boxShadow:
                  "0 0 16px oklch(0.65 0.26 20 / 0.6), 0 0 32px oklch(0.65 0.26 20 / 0.3)",
                scale: 1.1,
              }}
              transition={{ duration: 0.2 }}
            >
              <Zap className="w-4 h-4 text-white" fill="white" />
            </motion.div>
            <span className="font-display font-bold text-lg gradient-text">
              Portfolio
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => (
              <motion.button
                type="button"
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="relative px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ color: "oklch(0.9 0.01 20)" }}
              >
                {link.label}
                {/* Red neon underline on hover */}
                <motion.span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                  style={{
                    background: "oklch(0.65 0.26 20)",
                    boxShadow: "0 0 6px oklch(0.65 0.26 20 / 0.8)",
                  }}
                  initial={{ width: 0 }}
                  whileHover={{ width: "60%" }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            ))}
          </div>

          {/* Admin + mobile */}
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/admin"
                data-ocid="nav.admin_link"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium glass transition-all duration-200 hover:text-primary"
                style={{
                  border: "1px solid oklch(0.65 0.26 20 / 0.3)",
                }}
              >
                Admin
              </Link>
            </motion.div>

            {/* Mobile menu button */}
            <motion.button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.9 }}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass-strong md:hidden"
            style={{ borderBottom: "1px solid oklch(0.65 0.26 20 / 0.2)" }}
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  type="button"
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {link.label}
                </motion.button>
              ))}
              <Link
                to="/admin"
                className="px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all"
                style={{ color: "oklch(0.75 0.24 22)" }}
                onClick={() => setMobileOpen(false)}
              >
                Admin Panel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
