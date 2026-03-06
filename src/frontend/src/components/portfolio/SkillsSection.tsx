import { BrainCircuit } from "lucide-react";
import { motion } from "motion/react";
import {
  SiAdobeaftereffects,
  SiAdobephotoshop,
  SiAdobepremierepro,
  SiDocker,
  SiFigma,
  SiGit,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRust,
  SiTensorflow,
  SiTypescript,
} from "react-icons/si";

interface Skill {
  name: string;
  Icon: React.ComponentType<{
    size?: number;
    style?: React.CSSProperties;
    className?: string;
  }>;
  glowColor: string;
  category: "Languages" | "Frameworks" | "Tools" | "Design";
}

const SKILLS: Skill[] = [
  {
    name: "JavaScript",
    Icon: SiJavascript,
    glowColor: "oklch(0.85 0.18 95)",
    category: "Languages",
  },
  {
    name: "TypeScript",
    Icon: SiTypescript,
    glowColor: "oklch(0.65 0.18 235)",
    category: "Languages",
  },
  {
    name: "Python",
    Icon: SiPython,
    glowColor: "oklch(0.7 0.15 245)",
    category: "Languages",
  },
  {
    name: "Rust",
    Icon: SiRust,
    glowColor: "oklch(0.68 0.18 30)",
    category: "Languages",
  },
  {
    name: "React",
    Icon: SiReact,
    glowColor: "oklch(0.72 0.19 210)",
    category: "Frameworks",
  },
  {
    name: "Next.js",
    Icon: SiNextdotjs,
    glowColor: "oklch(0.85 0 0)",
    category: "Frameworks",
  },
  {
    name: "Node.js",
    Icon: SiNodedotjs,
    glowColor: "oklch(0.72 0.18 145)",
    category: "Frameworks",
  },
  {
    name: "TensorFlow",
    Icon: SiTensorflow,
    glowColor: "oklch(0.7 0.2 45)",
    category: "Frameworks",
  },
  {
    name: "PostgreSQL",
    Icon: SiPostgresql,
    glowColor: "oklch(0.65 0.15 225)",
    category: "Tools",
  },
  {
    name: "Docker",
    Icon: SiDocker,
    glowColor: "oklch(0.65 0.18 220)",
    category: "Tools",
  },
  {
    name: "Git",
    Icon: SiGit,
    glowColor: "oklch(0.68 0.2 25)",
    category: "Tools",
  },
  {
    name: "AI / ML",
    Icon: BrainCircuit,
    glowColor: "oklch(0.65 0.26 20)",
    category: "Tools",
  },
  {
    name: "Figma",
    Icon: SiFigma,
    glowColor: "oklch(0.75 0.22 295)",
    category: "Design",
  },
  {
    name: "Photoshop",
    Icon: SiAdobephotoshop,
    glowColor: "oklch(0.65 0.15 220)",
    category: "Design",
  },
  {
    name: "Premiere Pro",
    Icon: SiAdobepremierepro,
    glowColor: "oklch(0.6 0.22 295)",
    category: "Design",
  },
  {
    name: "After Effects",
    Icon: SiAdobeaftereffects,
    glowColor: "oklch(0.55 0.22 295)",
    category: "Design",
  },
];

const CATEGORY_ORDER = ["Languages", "Frameworks", "Tools", "Design"] as const;

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.04 }}
      whileHover={{ scale: 1.08, y: -4 }}
      className="relative flex flex-col items-center gap-3 p-5 rounded-2xl glass cursor-default group transition-all duration-200"
    >
      {/* Icon with glow */}
      <motion.div
        className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{
          background: `${skill.glowColor.replace(")", " / 0.15)")}`,
        }}
        whileHover={{
          boxShadow: `0 0 12px ${skill.glowColor.replace(")", " / 0.5)")}, 0 0 24px ${skill.glowColor.replace(")", " / 0.2)")}`,
        }}
      >
        {/* Pulse ring on hover */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `0 0 0 2px ${skill.glowColor.replace(")", " / 0.4)")}`,
          }}
        />
        <skill.Icon size={26} style={{ color: skill.glowColor }} />
      </motion.div>

      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
        {skill.name}
      </span>

      {/* Glow border on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${skill.glowColor.replace(")", " / 0.35)")}`,
        }}
      />
    </motion.div>
  );
}

export default function SkillsSection() {
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    skills: SKILLS.filter((s) => s.category === cat),
  }));

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      {/* Background — red neon gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, oklch(0.55 0.28 15 / 0.06) 0%, transparent 60%), radial-gradient(ellipse at 30% 50%, oklch(0.65 0.26 20 / 0.06) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
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
              Expertise
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
            Skills & <span className="gradient-text">Tools</span>
          </h2>
        </motion.div>

        {/* Skills by category */}
        <div className="space-y-10">
          {byCategory.map(({ category, skills }, catIndex) => (
            <div key={category}>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-3"
              >
                <span>{category}</span>
                <div
                  className="h-px flex-1"
                  style={{ background: "oklch(0.25 0.05 15 / 0.5)" }}
                />
              </motion.h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {skills.map((skill, i) => (
                  <SkillCard key={skill.name} skill={skill} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
