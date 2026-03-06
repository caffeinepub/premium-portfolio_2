import { ArrowUpRight, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";
import type { ContactInfo } from "../../backend";

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
}

export default function ContactSection({ contact }: ContactSectionProps) {
  if (!contact) return null;

  const socialLinks: SocialLink[] = [
    contact.email && {
      label: "Email",
      icon: Mail,
      href: `mailto:${contact.email}`,
      glowColor: "oklch(0.65 0.26 20 / 0.4)",
      hoverColor: "oklch(0.78 0.24 22)",
    },
    contact.github && {
      label: "GitHub",
      icon: SiGithub,
      href: `https://github.com/${contact.github}`,
      glowColor: "oklch(0.85 0 0 / 0.3)",
      hoverColor: "oklch(0.9 0 0)",
    },
    contact.linkedin && {
      label: "LinkedIn",
      icon: SiLinkedin,
      href: `https://linkedin.com/in/${contact.linkedin}`,
      glowColor: "oklch(0.65 0.18 230 / 0.4)",
      hoverColor: "oklch(0.65 0.18 230)",
    },
    contact.twitter && {
      label: "X / Twitter",
      icon: SiX,
      href: `https://twitter.com/${contact.twitter}`,
      glowColor: "oklch(0.85 0 0 / 0.3)",
      hoverColor: "oklch(0.9 0 0)",
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

          {/* Social links grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {socialLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto") ? undefined : "_blank"}
                rel={
                  link.href.startsWith("mailto")
                    ? undefined
                    : "noopener noreferrer"
                }
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl glass transition-all duration-200 relative overflow-hidden"
              >
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: link.glowColor
                      .replace("/ 0.4)", "/ 0.15)")
                      .replace("/ 0.3)", "/ 0.15)"),
                  }}
                  whileHover={{
                    boxShadow: `0 0 12px ${link.glowColor}, 0 0 24px ${link.glowColor.replace("/ 0.4)", "/ 0.2)").replace("/ 0.3)", "/ 0.15)")}`,
                  }}
                >
                  <link.icon
                    size={22}
                    className="transition-colors duration-200"
                    color={link.hoverColor}
                  />
                </motion.div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {link.label}
                </span>
                <ArrowUpRight className="absolute top-3 right-3 w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Red neon glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${link.glowColor}`,
                  }}
                />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
