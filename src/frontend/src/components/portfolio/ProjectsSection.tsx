import { ExternalLink, FolderOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "../../backend";

const CATEGORIES = ["All", "Web Dev", "Design", "AI", "Editing"] as const;

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "Web Dev": {
    bg: "oklch(0.65 0.26 20 / 0.15)",
    text: "oklch(0.78 0.24 22)",
    border: "oklch(0.65 0.26 20 / 0.35)",
  },
  Design: {
    bg: "oklch(0.55 0.28 15 / 0.15)",
    text: "oklch(0.72 0.26 18)",
    border: "oklch(0.55 0.28 15 / 0.35)",
  },
  AI: {
    bg: "oklch(0.60 0.25 25 / 0.15)",
    text: "oklch(0.75 0.22 28)",
    border: "oklch(0.60 0.25 25 / 0.35)",
  },
  Editing: {
    bg: "oklch(0.70 0.22 30 / 0.15)",
    text: "oklch(0.80 0.20 32)",
    border: "oklch(0.70 0.22 30 / 0.35)",
  },
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x =
      ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -6;
    const y = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 6;
    setTilt({ x, y });
  };

  const colors =
    CATEGORY_COLORS[project.category] || CATEGORY_COLORS["Web Dev"];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: (index % 4) * 0.1 }}
      className="group relative"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 });
        setHovered(false);
      }}
    >
      <div
        className="relative rounded-2xl overflow-hidden glass h-full flex flex-col transition-all duration-300"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          boxShadow: hovered
            ? "0 12px 40px oklch(0 0 0 / 0.5), 0 0 20px oklch(0.65 0.26 20 / 0.15)"
            : "0 8px 32px oklch(0 0 0 / 0.4)",
        }}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          <img
            src={
              project.imageUrl ||
              "/assets/generated/project-ecommerce.dim_800x500.jpg"
            }
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent" />

          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
              }}
            >
              {project.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1 mb-4">
            {project.description}
          </p>

          {project.link && (
            <motion.a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors group/link"
              whileHover={{ x: 2 }}
            >
              View Project
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </motion.a>
          )}
        </div>

        {/* Red neon hover border glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow:
              "inset 0 0 0 1px oklch(0.65 0.26 20 / 0.35), inset 0 0 20px oklch(0.65 0.26 20 / 0.04)",
          }}
        />
      </div>
    </motion.div>
  );
}

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="h-px flex-1 max-w-12"
              style={{ background: "oklch(0.55 0.28 15)" }}
              animate={{
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  "0 0 4px oklch(0.55 0.28 15 / 0.4)",
                  "0 0 8px oklch(0.55 0.28 15 / 0.8)",
                  "0 0 4px oklch(0.55 0.28 15 / 0.4)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
            />
            <span
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "oklch(0.70 0.26 18)" }}
            >
              All Work
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Every <span className="gradient-text-alt">Project</span>
          </h2>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <motion.button
                type="button"
                key={cat}
                data-ocid="projects.tab"
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeCategory === cat
                    ? "bg-primary/20 text-primary"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
                style={
                  activeCategory === cat
                    ? {
                        borderColor: "oklch(0.65 0.26 20 / 0.5)",
                        boxShadow:
                          "0 0 12px oklch(0.65 0.26 20 / 0.3), 0 0 24px oklch(0.65 0.26 20 / 0.1)",
                      }
                    : { borderColor: "oklch(0.35 0.06 15 / 0.5)" }
                }
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
              data-ocid="projects.empty_state"
            >
              <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No projects in this category yet.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id.toString()}
                  project={project}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
