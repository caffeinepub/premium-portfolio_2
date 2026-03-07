import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpRight, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import {
  SiBehance,
  SiDiscord,
  SiDribbble,
  SiGithub,
  SiInstagram,
  SiLinkedin,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";
import type { ContactInfo } from "../../backend";
import type { SocialSettings } from "../../lib/localDataStore";

interface SocialLink {
  label: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    color?: string;
  }>;
  href: string;
  glowColor: string;
  hoverColor: string;
}

interface ContactSectionProps {
  contact: ContactInfo | null;
  social?: SocialSettings;
}

export default function ContactSection({
  contact,
  social,
}: ContactSectionProps) {
  if (!contact) return null;

  // All icons use current theme -- CSS variables are read at render time
  const redGlow = "var(--theme-primary-glow)";
  const redHover = "var(--theme-text-primary)";

  const socialLinks: SocialLink[] = [
    contact.email && {
      label: "Email",
      icon: Mail,
      href: `mailto:${contact.email}`,
      glowColor: redGlow,
      hoverColor: redHover,
    },
    contact.github && {
      label: "GitHub",
      icon: SiGithub,
      href: `https://github.com/${contact.github}`,
      glowColor: redGlow,
      hoverColor: redHover,
    },
    contact.linkedin && {
      label: "LinkedIn",
      icon: SiLinkedin,
      href: `https://linkedin.com/in/${contact.linkedin}`,
      glowColor: redGlow,
      hoverColor: redHover,
    },
    contact.twitter && {
      label: "X / Twitter",
      icon: SiX,
      href: `https://twitter.com/${contact.twitter}`,
      glowColor: redGlow,
      hoverColor: redHover,
    },
    // New social platforms from SocialSettings
    social?.instagram && {
      label: "Instagram",
      icon: SiInstagram,
      href: `https://instagram.com/${social.instagram.replace(/^@/, "")}`,
      glowColor: redGlow,
      hoverColor: redHover,
    },
    social?.youtube && {
      label: "YouTube",
      icon: SiYoutube,
      href: social.youtube.startsWith("http")
        ? social.youtube
        : `https://youtube.com/@${social.youtube}`,
      glowColor: redGlow,
      hoverColor: redHover,
    },
    social?.behance && {
      label: "Behance",
      icon: SiBehance,
      href: `https://behance.net/${social.behance}`,
      glowColor: redGlow,
      hoverColor: redHover,
    },
    social?.dribbble && {
      label: "Dribbble",
      icon: SiDribbble,
      href: `https://dribbble.com/${social.dribbble}`,
      glowColor: redGlow,
      hoverColor: redHover,
    },
    social?.discord && {
      label: "Discord",
      icon: SiDiscord,
      href: "https://discord.com",
      glowColor: redGlow,
      hoverColor: redHover,
    },
    social?.whatsapp && {
      label: "WhatsApp",
      icon: SiWhatsapp,
      href: `https://wa.me/${social.whatsapp.replace(/[^0-9]/g, "")}`,
      glowColor: redGlow,
      hoverColor: redHover,
    },
  ].filter(Boolean) as SocialLink[];

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, var(--theme-accent-dim) 0%, transparent 55%), radial-gradient(ellipse at 70% 40%, var(--theme-primary-low) 0%, transparent 55%)",
        }}
      />

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div
              className="h-px w-12"
              style={{ background: "var(--theme-primary)" }}
              animate={{
                boxShadow: [
                  "0 0 4px var(--theme-primary-glow)",
                  "0 0 10px var(--theme-primary)",
                  "0 0 4px var(--theme-primary-glow)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.span
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--theme-text-primary)" }}
              animate={{
                textShadow: [
                  "0 0 0px transparent",
                  "0 0 8px var(--theme-primary-glow)",
                  "0 0 0px transparent",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              Get In Touch
            </motion.span>
            <motion.div
              className="h-px w-12"
              style={{ background: "var(--theme-primary)" }}
              animate={{
                boxShadow: [
                  "0 0 4px var(--theme-primary-glow)",
                  "0 0 10px var(--theme-primary)",
                  "0 0 4px var(--theme-primary-glow)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.3,
              }}
            />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Let's <span className="gradient-text">Connect</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden glass-red"
          >
            {/* Decorative orb */}
            <motion.div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, var(--theme-primary-dim) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar placeholder */}
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--theme-primary-mid), var(--theme-accent-dim))",
                  border: "1px solid var(--theme-primary-glow)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 8px var(--theme-primary-border)",
                    "0 0 20px var(--theme-primary-glow)",
                    "0 0 8px var(--theme-primary-border)",
                  ],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <User
                  className="w-9 h-9"
                  style={{ color: "var(--theme-text-primary)", opacity: 0.7 }}
                />
              </motion.div>

              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                  {contact.name}
                </h3>
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  {contact.title}
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm max-w-lg">
                  {contact.bio}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Social links — icons only with tooltips, circle border, red glow animated */}
          <TooltipProvider delayDuration={200}>
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.a
                        href={link.href}
                        target={
                          link.href.startsWith("mailto") ? undefined : "_blank"
                        }
                        rel={
                          link.href.startsWith("mailto")
                            ? undefined
                            : "noopener noreferrer"
                        }
                        whileHover={{ scale: 1.15, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          boxShadow: [
                            "0 0 6px var(--theme-primary-border), inset 0 0 6px var(--theme-primary-low)",
                            "0 0 14px var(--theme-primary-glow), inset 0 0 10px var(--theme-primary-dim)",
                            "0 0 6px var(--theme-primary-border), inset 0 0 6px var(--theme-primary-low)",
                          ],
                        }}
                        transition={{
                          boxShadow: {
                            duration: 2.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.18,
                          },
                        }}
                        className="group relative flex items-center justify-center rounded-full transition-all duration-300"
                        style={{
                          width: "46px",
                          height: "46px",
                          background: "var(--theme-primary-low)",
                          border: "1.5px solid var(--theme-primary-glow)",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "var(--theme-primary-mid)";
                          el.style.borderColor = "var(--theme-primary)";
                          el.style.boxShadow =
                            "0 0 20px var(--theme-primary-glow), 0 0 40px var(--theme-primary-border)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "var(--theme-primary-low)";
                          el.style.borderColor = "var(--theme-primary-glow)";
                          el.style.boxShadow = "";
                        }}
                      >
                        <link.icon
                          size={18}
                          className="transition-colors duration-200"
                          color="var(--theme-text-primary)"
                        />
                      </motion.a>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="text-xs font-medium"
                      style={{
                        background: "oklch(0.1 0.01 15)",
                        border: "1px solid var(--theme-primary-border)",
                        color: "oklch(0.85 0 0)",
                      }}
                    >
                      {link.label}
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
}
