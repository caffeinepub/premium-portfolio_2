import { ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import type { Project } from "../../backend";

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

function TiltCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const y = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const bgColor =
    CATEGORY_COLORS[project.category] || "oklch(0.65 0.26 20 / 0.2)";
  const textColor = CATEGORY_TEXT[project.category] || "oklch(0.75 0.24 22)";

  return (
    <div
      ref={cardRef}
      className="relative flex-shrink-0 w-72 sm:w-80 cursor-pointer group"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative rounded-2xl overflow-hidden glass transition-all duration-300"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          boxShadow: isHovered
            ? "0 20px 60px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.65 0.26 20 / 0.4), 0 0 20px oklch(0.65 0.26 20 / 0.2)"
            : "0 8px 32px oklch(0 0 0 / 0.4)",
          transition: "transform 0.15s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={
              project.imageUrl ||
              "/assets/generated/project-ecommerce.dim_800x500.jpg"
            }
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
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

          {/* External link */}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 p-1.5 rounded-lg glass opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Red shimmer on hover */}
          {isHovered && (
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, transparent 0%, oklch(0.65 0.26 20 / 0.04) 50%, transparent 100%)",
              }}
            />
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
  const displayProjects =
    projects.length > 0 ? [...projects, ...projects, ...projects] : [];
  const durationSeconds = Math.max(20, displayProjects.length * 4);

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
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

        <div
          className="flex gap-6 animate-marquee animate-marquee-pause"
          style={{
            ["--marquee-duration" as string]: `${durationSeconds}s`,
            width: "max-content",
            paddingLeft: "1.5rem",
          }}
        >
          {displayProjects.map((project, i) => (
            <TiltCard key={`${project.id.toString()}-${i}`} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
