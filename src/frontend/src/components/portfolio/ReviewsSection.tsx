import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Quote, Star } from "lucide-react";
import { motion } from "motion/react";
import type { Review } from "../../backend";

const STAR_POSITIONS = [1, 2, 3, 4, 5] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {STAR_POSITIONS.map((pos) => (
        <motion.div
          key={pos}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: pos * 0.05, type: "spring", stiffness: 300 }}
        >
          <Star
            className={`w-4 h-4 ${
              pos <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
            style={
              pos <= rating
                ? { filter: "drop-shadow(0 0 3px rgba(250,200,0,0.5))" }
                : {}
            }
          />
        </motion.div>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const initials = review.author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, x: index % 2 === 0 ? -10 : 10 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.12 }}
      whileHover={{ y: -4 }}
      className="relative p-7 rounded-2xl glass group transition-all duration-300 cursor-default"
    >
      {/* Red quote icon */}
      <motion.div
        className="absolute top-5 right-5"
        animate={{
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          delay: index * 0.5,
        }}
      >
        <Quote
          className="w-8 h-8"
          style={{ color: "var(--theme-primary)" }}
          fill="currentColor"
        />
      </motion.div>

      {/* Rating */}
      <StarRating rating={Number(review.rating)} />

      {/* Review text */}
      <p className="mt-4 mb-6 text-foreground/80 leading-relaxed italic">
        "{review.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar
          className="w-11 h-11"
          style={{
            boxShadow: "0 0 0 2px var(--theme-primary-border)",
          }}
        >
          <AvatarImage src={review.avatarUrl} alt={review.author} />
          <AvatarFallback
            className="font-bold text-sm"
            style={{
              background: "var(--theme-primary-mid)",
              color: "var(--theme-text-primary)",
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-foreground text-sm">
            {review.author}
          </div>
          <div className="text-xs text-muted-foreground">{review.role}</div>
        </div>
      </div>

      {/* Theme hover border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 0 1px var(--theme-primary-border), 0 0 16px var(--theme-primary-low)",
        }}
      />
    </motion.div>
  );
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <section id="reviews" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--theme-primary-low) 0%, transparent 60%)",
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
              style={{ background: "var(--theme-accent)" }}
              animate={{
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
              Testimonials
            </span>
            <motion.div
              className="h-px w-12"
              style={{ background: "var(--theme-accent)" }}
              animate={{
                boxShadow: [
                  "0 0 4px var(--theme-accent-border)",
                  "0 0 8px var(--theme-accent)",
                  "0 0 4px var(--theme-accent-border)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.4,
              }}
            />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            What Clients <span className="gradient-text">Say</span>
          </h2>
        </motion.div>

        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
            data-ocid="reviews.empty_state"
          >
            <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No reviews yet. Check back soon!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <ReviewCard
                key={review.id.toString()}
                review={review}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
