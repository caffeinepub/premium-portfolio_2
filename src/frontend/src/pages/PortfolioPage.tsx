import { useEffect, useState } from "react";
import type { ContactInfo, Project, Review } from "../backend";
import ContactSection from "../components/portfolio/ContactSection";
import FeaturedCarousel from "../components/portfolio/FeaturedCarousel";
import HeroSection from "../components/portfolio/HeroSection";
import NavBar from "../components/portfolio/NavBar";
import ProjectsSection from "../components/portfolio/ProjectsSection";
import ReviewsSection from "../components/portfolio/ReviewsSection";
import SkillsSection from "../components/portfolio/SkillsSection";
import {
  sampleContactInfo,
  sampleProjects,
  sampleReviews,
} from "../data/sampleData";
import { getBackend } from "../lib/backendClient";

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const client = await getBackend();
        const [allProjects, featured, allReviews, contactInfo] =
          await Promise.all([
            client.getAllProjects(),
            client.getFeaturedProjects(),
            client.getAllReviews(),
            client.getContactInfo(),
          ]);

        setProjects(allProjects.length > 0 ? allProjects : sampleProjects);
        setFeaturedProjects(
          featured.length > 0
            ? featured
            : sampleProjects.filter((p) => p.featured),
        );
        setReviews(allReviews.length > 0 ? allReviews : sampleReviews);
        setContact(contactInfo ?? sampleContactInfo);
      } catch {
        // Use sample data on error
        setProjects(sampleProjects);
        setFeaturedProjects(sampleProjects.filter((p) => p.featured));
        setReviews(sampleReviews);
        setContact(sampleContactInfo);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main>
        <HeroSection
          contactName={contact?.name}
          contactTitle={contact?.title}
        />

        {!loading && (
          <>
            <FeaturedCarousel projects={featuredProjects} />
            <ProjectsSection projects={projects} />
            <SkillsSection />
            <ReviewsSection reviews={reviews} />
            <ContactSection contact={contact} />
          </>
        )}

        {loading && (
          <div className="py-40 flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full border-2 border-transparent border-t-primary animate-spin"
              data-ocid="portfolio.loading_state"
            />
          </div>
        )}
      </main>

      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {contact?.name || "Portfolio"}. All rights reserved.
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
