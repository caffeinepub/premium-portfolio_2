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
import {
  getLocalContact,
  getLocalDesignSettings,
  getLocalProjects,
  getLocalReviews,
} from "../lib/localDataStore";

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply design settings (font, animation) to document root
  useEffect(() => {
    const settings = getLocalDesignSettings();
    document.documentElement.style.setProperty(
      "--font-heading",
      `${settings.fontHeading}, sans-serif`,
    );
    document.documentElement.style.setProperty(
      "--font-body",
      `${settings.fontBody}, sans-serif`,
    );
    if (!settings.animationsEnabled) {
      document.documentElement.style.setProperty("--animation-duration", "0s");
    } else {
      document.documentElement.style.removeProperty("--animation-duration");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // Load localStorage data first (synchronous)
      const localProjects = getLocalProjects();
      const localReviews = getLocalReviews();
      const localContact = getLocalContact();

      try {
        const client = await getBackend();
        const [allProjects, allReviews, contactInfo] = await Promise.all([
          client.getAllProjects().catch(() => [] as Project[]),
          client.getAllReviews().catch(() => [] as Review[]),
          client.getContactInfo().catch(() => null),
        ]);

        // Merge: localStorage projects take priority (shown first), then backend
        const backendProjects =
          allProjects.length > 0 ? allProjects : sampleProjects;
        const mergedProjects =
          localProjects.length > 0
            ? [
                ...localProjects,
                ...backendProjects.filter(
                  (bp) => !localProjects.find((lp) => lp.id === bp.id),
                ),
              ]
            : backendProjects;

        setProjects(mergedProjects);
        setFeaturedProjects(mergedProjects.filter((p) => p.featured));

        // Merge reviews
        const backendReviews =
          allReviews.length > 0 ? allReviews : sampleReviews;
        const mergedReviews =
          localReviews.length > 0
            ? [
                ...localReviews,
                ...backendReviews.filter(
                  (br) => !localReviews.find((lr) => lr.id === br.id),
                ),
              ]
            : backendReviews;
        setReviews(mergedReviews);

        // Contact: localStorage takes priority
        setContact(localContact ?? contactInfo ?? sampleContactInfo);
      } catch {
        // Backend failed entirely — use localStorage + sample data
        const fallbackProjects =
          localProjects.length > 0 ? localProjects : sampleProjects;
        setProjects(fallbackProjects);
        setFeaturedProjects(fallbackProjects.filter((p) => p.featured));
        setReviews(localReviews.length > 0 ? localReviews : sampleReviews);
        setContact(localContact ?? sampleContactInfo);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const designSettings = getLocalDesignSettings();

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
            {designSettings.sections.work && (
              <FeaturedCarousel projects={featuredProjects} />
            )}
            {designSettings.sections.projects && (
              <ProjectsSection projects={projects} />
            )}
            {designSettings.sections.skills && <SkillsSection />}
            {designSettings.sections.reviews && (
              <ReviewsSection reviews={reviews} />
            )}
            {designSettings.sections.contact && (
              <ContactSection contact={contact} />
            )}
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
