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

  // All icons use red theme to match email icon
  const redGlow = "oklch(0.65 0.26 20 / 0.5)";
  const redHover = "oklch(0.78 0.24 22)";

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
      {/* Background — red neon */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, oklch(0.55 0.28 15 / 0.06) 0%, transparent 55%), radial-gradient(ellipse at 70% 40%, oklch(0.65 0.26 20 / 0.06) 0%, transparent 55%)",
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
              style={{ background: "oklch(0.65 0.26 20)" }}
              animate={{
                boxShadow: [
                  "0 0 4px oklch(0.65 0.26 20 / 0.4)",
                  "0 0 10px oklch(0.65 0.26 20 / 0.8)",
                  "0 0 4px oklch(0.65 0.26 20 / 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.span
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "oklch(0.75 0.24 22)" }}
              animate={{
                textShadow: [
                  "0 0 0px transparent",
                  "0 0 8px oklch(0.65 0.26 20 / 0.5)",
                  "0 0 0px transparent",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              Get In Touch
            </motion.span>
            <motion.div
              className="h-px w-12"
              style={{ background: "oklch(0.65 0.26 20)" }}
              animate={{
                boxShadow: [
                  "0 0 4px oklch(0.65 0.26 20 / 0.4)",
                  "0 0 10px oklch(0.65 0.26 20 / 0.8)",
                  "0 0 4px oklch(0.65 0.26 20 / 0.4)",
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
            {/* Red decorative orb */}
            <motion.div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.65 0.26 20 / 0.10) 0%, transparent 70%)",
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
                    "linear-gradient(135deg, oklch(0.65 0.26 20 / 0.2), oklch(0.55 0.28 15 / 0.2))",
                  border: "1px solid oklch(0.65 0.26 20 / 0.35)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 8px oklch(0.65 0.26 20 / 0.2)",
                    "0 0 20px oklch(0.65 0.26 20 / 0.4)",
                    "0 0 8px oklch(0.65 0.26 20 / 0.2)",
                  ],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <User
                  className="w-9 h-9"
                  style={{ color: "oklch(0.75 0.24 22 / 0.7)" }}
                />
              </motion.div>

              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                  {contact.name}
                </h3>
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: "oklch(0.75 0.24 22)" }}
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
                            "0 0 6px oklch(0.65 0.26 20 / 0.35), inset 0 0 6px oklch(0.65 0.26 20 / 0.08)",
                            "0 0 14px oklch(0.65 0.26 20 / 0.65), inset 0 0 10px oklch(0.65 0.26 20 / 0.15)",
                            "0 0 6px oklch(0.65 0.26 20 / 0.35), inset 0 0 6px oklch(0.65 0.26 20 / 0.08)",
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
                          background: "oklch(0.65 0.26 20 / 0.08)",
                          border: "1.5px solid oklch(0.65 0.26 20 / 0.45)",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "oklch(0.65 0.26 20 / 0.2)";
                          el.style.borderColor = "oklch(0.65 0.26 20 / 0.8)";
                          el.style.boxShadow =
                            "0 0 20px oklch(0.65 0.26 20 / 0.7), 0 0 40px oklch(0.65 0.26 20 / 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "oklch(0.65 0.26 20 / 0.08)";
                          el.style.borderColor = "oklch(0.65 0.26 20 / 0.45)";
                          el.style.boxShadow = "";
                        }}
                      >
                        <link.icon
                          size={18}
                          className="transition-colors duration-200"
                          color="oklch(0.78 0.24 22)"
                        />
                      </motion.a>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="text-xs font-medium"
                      style={{
                        background: "oklch(0.1 0.01 15)",
                        border: "1px solid oklch(0.65 0.26 20 / 0.3)",
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
