/**
 * Local data store using localStorage for admin panel persistence.
 * All admin save/edit/delete operations go here instead of the backend.
 * Portfolio page reads from here first, then falls back to backend/sample data.
 */

import type { ContactInfo, Project, Review } from "../backend";

const PROJECTS_KEY = "portfolio_projects";
const REVIEWS_KEY = "portfolio_reviews";
const CONTACT_KEY = "portfolio_contact";

// ─── Serialization helpers (bigint <-> string) ────────────────

function serializeProject(p: Project): object {
  return {
    ...p,
    id: p.id.toString(),
    order: p.order.toString(),
  };
}

function deserializeProject(raw: Record<string, unknown>): Project {
  return {
    id: BigInt(raw.id as string),
    title: raw.title as string,
    description: raw.description as string,
    imageUrl: raw.imageUrl as string,
    category: raw.category as string,
    link: raw.link as string,
    featured: raw.featured as boolean,
    order: BigInt(raw.order as string),
  };
}

function serializeReview(r: Review): object {
  return {
    ...r,
    id: r.id.toString(),
    rating: r.rating.toString(),
  };
}

function deserializeReview(raw: Record<string, unknown>): Review {
  return {
    id: BigInt(raw.id as string),
    author: raw.author as string,
    role: raw.role as string,
    text: raw.text as string,
    rating: BigInt(raw.rating as string),
    avatarUrl: raw.avatarUrl as string,
  };
}

// ─── Projects ─────────────────────────────────────────────────

export function getLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map(deserializeProject);
  } catch {
    return [];
  }
}

function saveLocalProjects(projects: Project[]): void {
  localStorage.setItem(
    PROJECTS_KEY,
    JSON.stringify(projects.map(serializeProject)),
  );
}

function nextProjectId(projects: Project[]): bigint {
  if (projects.length === 0) return BigInt(1000);
  const max = projects.reduce((m, p) => (p.id > m ? p.id : m), BigInt(999));
  return max + BigInt(1);
}

export function addLocalProject(
  title: string,
  description: string,
  imageUrl: string,
  category: string,
  link: string,
  featured: boolean,
  order: bigint,
): Project {
  const projects = getLocalProjects();
  const newProject: Project = {
    id: nextProjectId(projects),
    title,
    description,
    imageUrl,
    category,
    link,
    featured,
    order,
  };
  saveLocalProjects([...projects, newProject]);
  return newProject;
}

export function updateLocalProject(
  id: bigint,
  title: string,
  description: string,
  imageUrl: string,
  category: string,
  link: string,
  featured: boolean,
  order: bigint,
): void {
  const projects = getLocalProjects();
  const updated = projects.map((p) =>
    p.id === id
      ? { ...p, title, description, imageUrl, category, link, featured, order }
      : p,
  );
  saveLocalProjects(updated);
}

export function deleteLocalProject(id: bigint): void {
  const projects = getLocalProjects();
  saveLocalProjects(projects.filter((p) => p.id !== id));
}

// ─── Reviews ──────────────────────────────────────────────────

export function getLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map(deserializeReview);
  } catch {
    return [];
  }
}

function saveLocalReviews(reviews: Review[]): void {
  localStorage.setItem(
    REVIEWS_KEY,
    JSON.stringify(reviews.map(serializeReview)),
  );
}

function nextReviewId(reviews: Review[]): bigint {
  if (reviews.length === 0) return BigInt(1000);
  const max = reviews.reduce((m, r) => (r.id > m ? r.id : m), BigInt(999));
  return max + BigInt(1);
}

export function addLocalReview(
  author: string,
  role: string,
  text: string,
  rating: bigint,
  avatarUrl: string,
): Review {
  const reviews = getLocalReviews();
  const newReview: Review = {
    id: nextReviewId(reviews),
    author,
    role,
    text,
    rating,
    avatarUrl,
  };
  saveLocalReviews([...reviews, newReview]);
  return newReview;
}

export function updateLocalReview(
  id: bigint,
  author: string,
  role: string,
  text: string,
  rating: bigint,
  avatarUrl: string,
): void {
  const reviews = getLocalReviews();
  const updated = reviews.map((r) =>
    r.id === id ? { ...r, author, role, text, rating, avatarUrl } : r,
  );
  saveLocalReviews(updated);
}

export function deleteLocalReview(id: bigint): void {
  const reviews = getLocalReviews();
  saveLocalReviews(reviews.filter((r) => r.id !== id));
}

// ─── Contact Info ─────────────────────────────────────────────

export function getLocalContact(): ContactInfo | null {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ContactInfo;
  } catch {
    return null;
  }
}

export function saveLocalContact(contact: ContactInfo): void {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
}

export function clearLocalContact(): void {
  localStorage.removeItem(CONTACT_KEY);
}

// ─── Design Settings ──────────────────────────────────────────

export interface DesignSettings {
  primaryColorHue: number; // 0-360, default 20 (red)
  primaryColorChroma: number; // 0-0.37, default 0.26
  glowIntensity: "low" | "medium" | "high"; // default 'medium'
  fontHeading: string; // CSS font-family, default 'Inter'
  fontBody: string; // CSS font-family, default 'Inter'
  animationsEnabled: boolean; // default true
  sections: {
    work: boolean;
    projects: boolean;
    skills: boolean;
    reviews: boolean;
    contact: boolean;
  };
  bgStyle:
    | "pure-black"
    | "dark-gray"
    | "deep-red"
    | "deep-blue"
    | "deep-purple"
    | "midnight"; // default 'pure-black'
  themePreset:
    | "custom"
    | "neon-red"
    | "neon-blue"
    | "neon-green"
    | "neon-purple"
    | "neon-gold"
    | "neon-pink"
    | "cyber-teal"
    | "solar-orange";
  cardStyle: "glass" | "solid" | "minimal" | "bordered";
  buttonStyle: "rounded" | "pill" | "sharp";
  layoutDensity: "compact" | "normal" | "spacious";
}

const DESIGN_KEY = "portfolio_design";

export const DEFAULT_DESIGN_SETTINGS: DesignSettings = {
  primaryColorHue: 20,
  primaryColorChroma: 0.26,
  glowIntensity: "medium",
  fontHeading: "Inter",
  fontBody: "Inter",
  animationsEnabled: true,
  sections: {
    work: true,
    projects: true,
    skills: true,
    reviews: true,
    contact: true,
  },
  bgStyle: "pure-black",
  themePreset: "neon-red",
  cardStyle: "glass",
  buttonStyle: "rounded",
  layoutDensity: "normal",
};

export function getLocalDesignSettings(): DesignSettings {
  try {
    const raw = localStorage.getItem(DESIGN_KEY);
    if (!raw) return { ...DEFAULT_DESIGN_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<DesignSettings>;
    return {
      ...DEFAULT_DESIGN_SETTINGS,
      ...parsed,
      sections: {
        ...DEFAULT_DESIGN_SETTINGS.sections,
        ...(parsed.sections ?? {}),
      },
    };
  } catch {
    return { ...DEFAULT_DESIGN_SETTINGS };
  }
}

export function saveLocalDesignSettings(settings: DesignSettings): void {
  localStorage.setItem(DESIGN_KEY, JSON.stringify(settings));
}

// ─── Hero Settings ────────────────────────────────────────────

export interface HeroSettings {
  tagline: string;
  subtitle: string;
  availabilityText: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stats: Array<{ value: string; label: string }>;
}

const HERO_KEY = "portfolio_hero";

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  tagline: "Hello, I'm",
  subtitle:
    "Crafting beautiful digital experiences with code, design, and AI — from concept to deployment.",
  availabilityText: "Available for new projects",
  ctaPrimary: "View My Work",
  ctaSecondary: "Contact Me",
  stats: [
    { value: "7+", label: "Years Experience" },
    { value: "50+", label: "Projects Shipped" },
    { value: "30+", label: "Happy Clients" },
    { value: "3", label: "Film Awards" },
  ],
};

export function getLocalHeroSettings(): HeroSettings {
  try {
    const raw = localStorage.getItem(HERO_KEY);
    if (!raw) return { ...DEFAULT_HERO_SETTINGS };
    return { ...DEFAULT_HERO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_HERO_SETTINGS };
  }
}

export function saveLocalHeroSettings(settings: HeroSettings): void {
  localStorage.setItem(HERO_KEY, JSON.stringify(settings));
}

// ─── Custom Skills ─────────────────────────────────────────────

export interface CustomSkill {
  id: string;
  name: string;
  category: string;
  level: number; // 1-5
}

const SKILLS_KEY = "portfolio_skills";

export function getLocalCustomSkills(): CustomSkill[] {
  try {
    const raw = localStorage.getItem(SKILLS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomSkill[];
  } catch {
    return [];
  }
}

export function saveLocalCustomSkills(skills: CustomSkill[]): void {
  localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
}

// ─── Social Settings ──────────────────────────────────────────

export interface SocialSettings {
  instagram?: string;
  youtube?: string;
  behance?: string;
  dribbble?: string;
  discord?: string;
  whatsapp?: string;
}

const SOCIAL_KEY = "portfolio_social";

export const DEFAULT_SOCIAL_SETTINGS: SocialSettings = {
  instagram: "",
  youtube: "",
  behance: "",
  dribbble: "",
  discord: "",
  whatsapp: "",
};

export function getSocialSettings(): SocialSettings {
  try {
    const raw = localStorage.getItem(SOCIAL_KEY);
    if (!raw) return { ...DEFAULT_SOCIAL_SETTINGS };
    return { ...DEFAULT_SOCIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SOCIAL_SETTINGS };
  }
}

export function saveSocialSettings(settings: SocialSettings): void {
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(settings));
}

// ─── Project Extras ───────────────────────────────────────────

export interface ProjectExtras {
  id: string; // matches project id as string
  techTags: string[];
  status: "completed" | "in-progress" | "concept";
  year: string;
  /**
   * IDs referencing images stored in IndexedDB via imageStore.ts
   * We no longer store raw base64 here to avoid localStorage 5MB limit.
   */
  imageIds?: string[];
  /** @deprecated Use imageIds instead. Kept for backwards compat migration. */
  extraImages?: string[];
}

const PROJECT_EXTRAS_KEY = "portfolio_project_extras";

export function getProjectExtras(): ProjectExtras[] {
  try {
    const raw = localStorage.getItem(PROJECT_EXTRAS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProjectExtras[];
  } catch {
    return [];
  }
}

export function saveProjectExtras(extras: ProjectExtras[]): void {
  localStorage.setItem(PROJECT_EXTRAS_KEY, JSON.stringify(extras));
}

export function getProjectExtra(id: string): ProjectExtras | undefined {
  return getProjectExtras().find((e) => e.id === id);
}

export function upsertProjectExtra(extra: ProjectExtras): void {
  const all = getProjectExtras();
  const idx = all.findIndex((e) => e.id === extra.id);
  if (idx >= 0) {
    all[idx] = extra;
  } else {
    all.push(extra);
  }
  saveProjectExtras(all);
}

// ─── Site Settings ────────────────────────────────────────────

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoText: string;
  logoImageUrl: string; // base64 or URL for custom logo image
  faviconUrl: string;
  // Header settings
  headerSticky: boolean;
  headerNavLinks: Array<{ label: string; href: string }>;
  // Footer settings
  footerText: string;
  footerShowSocial: boolean;
  footerCopyright: string;
  footerLogoText: string;
  // Advanced
  animatedIcons: boolean;
  cursorGlow: boolean;
  particleBackground: boolean;
  // About section
  aboutImageUrl: string;
  aboutHeading: string;
  aboutBody: string;
}

const SITE_SETTINGS_KEY = "portfolio_site_settings";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Ganesh Raikwar",
  siteTagline: "Full-Stack Developer & Creative Technologist",
  logoText: "GR",
  logoImageUrl: "",
  faviconUrl: "",
  headerSticky: true,
  headerNavLinks: [
    { label: "Work", href: "#featured" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ],
  footerText: "Built with passion and creativity.",
  footerShowSocial: true,
  footerCopyright: "",
  footerLogoText: "GR",
  animatedIcons: true,
  cursorGlow: false,
  particleBackground: false,
  aboutImageUrl: "",
  aboutHeading: "About Me",
  aboutBody: "",
};

export function getSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SITE_SETTINGS };
    return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export function saveSiteSettings(settings: SiteSettings): void {
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
}
