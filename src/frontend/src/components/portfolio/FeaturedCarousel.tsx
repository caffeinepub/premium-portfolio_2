import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "../../backend";
import { useProjectImages } from "../../hooks/useProjectImages";
import { getProjectExtra } from "../../lib/localDataStore";

const CATEGORY_COLORS: Record<string, string> = {
  "Web Dev": "oklch(0.65 0.26 20 / 0.2)",
  Design: "oklch(0.55 0.28 15 / 0.2)",
  AI: "oklch(0.60 0.25 25 / 0.2)",
  Editing: "oklch(0.70 0.22 30 / 0.2)",
};

const CATEGORY_TEXT: Record<string, string> = {
  "Web Dev": "oklch(0.75 0.24 22)",
  Design: "oklch(0.70 0.26 18)",
  AI: "oklch(0.72 0.22 28)",
  Editing: "oklch(0.78 0.20 32)",
};

const STATUS_MAP = {
  completed: { label: "Completed", color: "oklch(0.70 0.18 145)" },
  "in-progress": { label: "In Progress", color: "oklch(0.72 0.20 65)" },
  concept: { label: "Concept", color: "oklch(0.65 0.05 220)" },
};

interface ProjectCardProps {
  project: Project;
  isCenter: boolean;
}

function ProjectCard({ project, isCenter }: ProjectCardProps) {
  const extras = getProjectExtra(project.id.toString());
  const bgColor =
    CATEGORY_COLORS[project.category] || "oklch(0.65 0.26 20 / 0.2)";
  const textColor = CATEGORY_TEXT[project.category] || "oklch(0.75 0.24 22)";
  const status = extras?.status ? STATUS_MAP[extras.status] : null;

  // Load ALL images for this project
  const { images } = useProjectImages(
    extras?.imageIds,
    project.imageUrl,
    "/assets/generated/project-ecommerce.dim_800x500.jpg",
  );

  // Internal image slider state
  const [imgIndex, setImgIndex] = useState(0);
  const [imgDir, setImgDir] = useState(0);
  const [cardHovered, setCardHovered] = useState(false);

  // Reset image index when project changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on project id change
  useEffect(() => {
    setImgIndex(0);
  }, [project.id]);

  const totalImages = images.length;
  const hasMultiple = totalImages > 1;

  const goImgPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgDir(-1);
    setImgIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const goImgNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgDir(1);
    setImgIndex((prev) => (prev + 1) % totalImages);
  };

  const currentImage =
    images[imgIndex] || "/assets/generated/project-ecommerce.dim_800x500.jpg";

  return (
    <div
      className="relative w-full cursor-pointer group"
      style={{
        opacity: isCenter ? 1 : 0.72,
        transform: isCenter ? "scale(1)" : "scale(0.93)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
    >
      <div
        className="relative rounded-2xl overflow-hidden glass transition-all duration-300 group-hover:border-primary/40"
        style={{
          boxShadow: isCenter
            ? "0 20px 60px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.65 0.26 20 / 0.35), 0 0 24px oklch(0.65 0.26 20 / 0.12)"
            : "0 8px 32px oklch(0 0 0 / 0.4)",
        }}
      >
        {/* Image area with slider */}
        <div className="relative h-48 overflow-hidden">
          <AnimatePresence mode="popLayout" custom={imgDir}>
            <motion.img
              key={`${project.id}-img-${imgIndex}`}
              src={currentImage}
              alt={`${project.title} ${imgIndex + 1}`}
              className="w-full h-full object-cover absolute inset-0"
              initial={{ opacity: 0, x: imgDir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: imgDir * -40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${textColor.replace(")", " / 0.3)")}`,
              }}
            >
              {project.category}
            </span>
          </div>

          {/* Year badge */}
          {extras?.year && (
            <div className="absolute top-3 right-3 z-10">
              <span
                className="px-2 py-0.5 rounded-lg text-xs font-medium backdrop-blur-sm"
                style={{
                  background: "oklch(0 0 0 / 0.5)",
                  color: "oklch(0.75 0 0)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                }}
              >
                {extras.year}
              </span>
            </div>
          )}

          {/* External link */}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 z-10 p-1.5 rounded-lg glass opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Multi-image navigation arrows (appear on hover when multiple images) */}
          {hasMultiple && cardHovered && (
            <>
              <button
                type="button"
                onClick={goImgPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: "oklch(0 0 0 / 0.55)",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                  color: "white",
                }}
                aria-label="Previous image"
                data-ocid="featured.img.pagination_prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goImgNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: "oklch(0 0 0 / 0.55)",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                  color: "white",
                }}
                aria-label="Next image"
                data-ocid="featured.img.pagination_next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Image dots indicator */}
          {hasMultiple && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
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
                    width: i === imgIndex ? "16px" : "5px",
                    height: "5px",
                    background:
                      i === imgIndex
                        ? "oklch(0.65 0.26 20)"
                        : "oklch(1 0 0 / 0.5)",
                  }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image count badge (when not hovered) */}
          {hasMultiple && !cardHovered && (
            <div
              className="absolute bottom-2 right-2 z-10 text-[10px] px-1.5 py-0.5 rounded-md font-medium"
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
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
              {project.title}
            </h3>
            {status && (
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{
                  background: `${status.color.replace(")", " / 0.12)")}`,
                  color: status.color,
                  border: `1px solid ${status.color.replace(")", " / 0.3)")}`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: status.color }}
                />
                {status.label}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {project.description}
          </p>

          {/* Tech tags */}
          {extras?.techTags && extras.techTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {extras.techTags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "oklch(0.65 0.26 20 / 0.1)",
                    color: "oklch(0.72 0.16 22)",
                    border: "1px solid oklch(0.65 0.26 20 / 0.2)",
                  }}
                >
                  {tag}
                </span>
              ))}
              {extras.techTags.length > 4 && (
                <span className="text-xs text-muted-foreground/60">
                  +{extras.techTags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FeaturedCarouselProps {
  projects: Project[];
}

export default function FeaturedCarousel({ projects }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = projects.length;

  const goTo = (newIndex: number, dir: number) => {
    setDirection(dir);
    setIndex((newIndex + total) % total);
  };

  const goPrev = () => goTo(index - 1, -1);
  const goNext = () => goTo(index + 1, 1);

  // Auto-advance every 4s
  // biome-ignore lint/correctness/useExhaustiveDependencies: index is used to re-schedule timer on manual navigation
  useEffect(() => {
    if (isPaused || total <= 1) return;
    timerRef.current = setTimeout(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, total, index]);

  if (total === 0) return null;

  // Calculate visible indices: prev, center, next
  const prevIdx = (index - 1 + total) % total;
  const nextIdx = (index + 1) % total;

  // For single project, show only that
  const showSides = total > 1;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <section id="featured" className="py-24 overflow-hidden relative">
      {/* Red neon background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, oklch(0.65 0.26 20 / 0.04) 0%, transparent 60%)",
        }}
      />

      {/* Section header */}
      <div className="container mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="h-px flex-1 max-w-12"
              style={{ background: "oklch(0.65 0.26 20)" }}
              animate={{
                boxShadow: [
                  "0 0 4px oklch(0.65 0.26 20 / 0.4)",
                  "0 0 8px oklch(0.65 0.26 20 / 0.8)",
                  "0 0 4px oklch(0.65 0.26 20 / 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <span
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "oklch(0.75 0.24 22)" }}
            >
              Featured Work
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
            Selected <span className="gradient-text">Projects</span>
          </h2>
        </motion.div>
      </div>

      {/* Carousel */}
      <div
        className="relative container mx-auto px-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Cards window */}
        <div className="flex items-center gap-4 relative">
          {/* Left arrow */}
          {total > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10"
              style={{
                background: "oklch(0.65 0.26 20 / 0.12)",
                border: "1px solid oklch(0.65 0.26 20 / 0.3)",
                color: "oklch(0.75 0.22 22)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.65 0.26 20 / 0.25)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 12px oklch(0.65 0.26 20 / 0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.65 0.26 20 / 0.12)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
              data-ocid="carousel.pagination_prev"
              aria-label="Previous project"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* 3-card layout: prev (desktop) | center | next (desktop) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center overflow-hidden">
            {/* Prev card (desktop only) */}
            {showSides && (
              <div className="hidden md:block">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`prev-${prevIdx}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <ProjectCard project={projects[prevIdx]} isCenter={false} />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Center card */}
            <div
              className={
                showSides ? "" : "md:col-span-3 max-w-sm mx-auto w-full"
              }
            >
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={`center-${index}`}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <ProjectCard project={projects[index]} isCenter={true} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next card (desktop only) */}
            {showSides && (
              <div className="hidden md:block">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`next-${nextIdx}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <ProjectCard project={projects[nextIdx]} isCenter={false} />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right arrow */}
          {total > 1 && (
            <button
              type="button"
              onClick={goNext}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10"
              style={{
                background: "oklch(0.65 0.26 20 / 0.12)",
                border: "1px solid oklch(0.65 0.26 20 / 0.3)",
                color: "oklch(0.75 0.22 22)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.65 0.26 20 / 0.25)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 12px oklch(0.65 0.26 20 / 0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.65 0.26 20 / 0.12)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
              data-ocid="carousel.pagination_next"
              aria-label="Next project"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dot indicators */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {projects.map((_, i) => (
              <button
                type="button"
                // biome-ignore lint/suspicious/noArrayIndexKey: positional dots
                key={i}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === index ? "24px" : "8px",
                  height: "8px",
                  background:
                    i === index
                      ? "oklch(0.65 0.26 20)"
                      : "oklch(0.65 0.26 20 / 0.3)",
                  boxShadow:
                    i === index ? "0 0 8px oklch(0.65 0.26 20 / 0.6)" : "none",
                }}
                aria-label={`Go to project ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
