import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "../../backend";
import { useProjectImages } from "../../hooks/useProjectImages";
import { getProjectExtra } from "../../lib/localDataStore";

const CATEGORIES = ["All", "Web Dev", "Design", "AI", "Editing"] as const;

// All category colors now use CSS variables, so they auto-update with theme
const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "Web Dev": {
    bg: "var(--theme-primary-dim)",
    text: "var(--theme-text-primary)",
    border: "var(--theme-primary-border)",
  },
  Design: {
    bg: "var(--theme-accent-dim)",
    text: "var(--theme-text-secondary)",
    border: "var(--theme-accent-border)",
  },
  AI: {
    bg: "var(--theme-primary-dim)",
    text: "var(--theme-text-primary)",
    border: "var(--theme-border-line)",
  },
  Editing: {
    bg: "var(--theme-primary-mid)",
    text: "var(--theme-text-secondary)",
    border: "var(--theme-primary-border)",
  },
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  const extras = getProjectExtra(project.id.toString());

  // Load ALL images for this project
  const { images } = useProjectImages(
    extras?.imageIds,
    project.imageUrl,
    "/assets/generated/project-ecommerce.dim_800x500.jpg",
  );

  // Internal image slider state
  const [imgIndex, setImgIndex] = useState(0);
  const [imgDir, setImgDir] = useState(0);

  const totalImages = images.length;
  const hasMultiple = totalImages > 1;

  // Reset image index when project changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on project id change
  useEffect(() => {
    setImgIndex(0);
  }, [project.id]);

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

  const goImgPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setImgDir(-1);
    setImgIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const goImgNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setImgDir(1);
    setImgIndex((prev) => (prev + 1) % totalImages);
  };

  const currentImage =
    images[imgIndex] || "/assets/generated/project-ecommerce.dim_800x500.jpg";

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
            ? "0 12px 40px oklch(0 0 0 / 0.5), 0 0 20px var(--theme-primary-glow2)"
            : "0 8px 32px oklch(0 0 0 / 0.4)",
        }}
      >
        {/* Image area with slider */}
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          <AnimatePresence mode="popLayout" custom={imgDir}>
            <motion.img
              key={`${project.id}-img-${imgIndex}`}
              src={currentImage}
              alt={`${project.title} ${imgIndex + 1}`}
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              initial={{ opacity: 0, x: imgDir * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: imgDir * -30 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3 z-10">
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

          {/* Image navigation arrows (appear on hover when multiple images) */}
          {hasMultiple && hovered && (
            <>
              <button
                type="button"
                onClick={goImgPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "oklch(0 0 0 / 0.6)",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                  color: "white",
                }}
                aria-label="Previous image"
                data-ocid="projects.img.pagination_prev"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={goImgNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "oklch(0 0 0 / 0.6)",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                  color: "white",
                }}
                aria-label="Next image"
                data-ocid="projects.img.pagination_next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Image dots indicator (bottom overlay) */}
          {hasMultiple && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
              {images.map((_, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional dots
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgDir(i > imgIndex ? 1 : -1);
                    setImgIndex(i);
                  }}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === imgIndex ? "14px" : "4px",
                    height: "4px",
                    background:
                      i === imgIndex
                        ? "var(--theme-primary)"
                        : "oklch(1 0 0 / 0.5)",
                  }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image count (when multiple, not hovered) */}
          {hasMultiple && !hovered && (
            <div
              className="absolute bottom-2 right-2 z-10 text-[9px] px-1.5 py-0.5 rounded font-medium"
              style={{
                background: "oklch(0 0 0 / 0.6)",
                color: "oklch(0.85 0 0)",
              }}
            >
              {imgIndex + 1}/{totalImages}
            </div>
          )}
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

        {/* Theme hover border glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow:
              "inset 0 0 0 1px var(--theme-primary-glow), inset 0 0 20px var(--theme-primary-low)",
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
              style={{ background: "var(--theme-accent)" }}
              animate={{
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  "0 0 4px var(--theme-accent-border)",
                  "0 0 8px var(--theme-accent)",
                  "0 0 4px var(--theme-accent-border)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
            />
            <span
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--theme-text-secondary)" }}
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
                        borderColor: "var(--theme-primary-glow)",
                        boxShadow:
                          "0 0 12px var(--theme-primary-border), 0 0 24px var(--theme-primary-dim)",
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
