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

/**
 * Background color values for each bgStyle option (OKLCH lightness chroma hue)
 */
const BG_STYLE_MAP: Record<DesignSettings["bgStyle"], string> = {
  "pure-black": "0.08 0.015 15",
  "dark-gray": "0.10 0.01 0",
  "deep-red": "0.09 0.03 15",
  "deep-blue": "0.08 0.02 235",
  "deep-purple": "0.08 0.02 280",
  midnight: "0.08 0.015 230",
};

/**
 * Apply design settings to document CSS variables so the portfolio
 * reflects theme changes immediately without a page reload.
 *
 * Key variables exposed (for use in inline styles across all components):
 *   --theme-primary          : full oklch() color string for the primary
 *   --theme-primary-dim      : primary at 0.12 opacity
 *   --theme-primary-mid      : primary at 0.25 opacity
 *   --theme-primary-border   : primary at 0.30 opacity
 *   --theme-primary-glow     : primary at 0.40 opacity
 *   --theme-accent           : full oklch() accent (hue-5)
 *   --theme-accent-dim       : accent at 0.10 opacity
 *   --theme-text-primary     : lighter tint of primary (for text)
 *   --theme-bg               : full oklch() background
 *   --theme-particle-1..4    : rgba colours for particle canvas
 */
export function applyDesignToDOM(settings: DesignSettings): void {
  const root = document.documentElement;
  const h = settings.primaryColorHue;
  const c = settings.primaryColorChroma ?? 0.26;
  const c2 = Math.min(c + 0.02, 0.37);
  const h2 = h - 5;

  // ── Tailwind / shadcn CSS-var tokens (L C H fragments, no oklch() wrapper) ──
  root.style.setProperty("--primary", `0.65 ${c} ${h}`);
  root.style.setProperty("--ring", `0.65 ${c} ${h}`);
  root.style.setProperty("--accent", `0.55 ${c2} ${h2}`);
  root.style.setProperty("--sidebar-primary", `0.65 ${c} ${h}`);
  root.style.setProperty("--sidebar-ring", `0.65 ${c} ${h}`);
  root.style.setProperty("--chart-1", `0.65 ${c} ${h}`);

  // ── Background ──────────────────────────────────────────────────────────────
  const bgValue = BG_STYLE_MAP[settings.bgStyle] ?? BG_STYLE_MAP["pure-black"];
  root.style.setProperty("--background", bgValue);
  root.style.setProperty(
    "--card",
    bgValue.replace(/^([\d.]+)/, (_, l) =>
      String(Math.min(Number.parseFloat(l) + 0.03, 0.99)),
    ),
  );

  // ── Glow vars (used in keyframe animations in index.css) ────────────────────
  root.style.setProperty("--glow-red", `oklch(0.65 ${c} ${h} / 0.5)`);
  root.style.setProperty("--glow-red-strong", `oklch(0.65 ${c} ${h} / 0.85)`);
  root.style.setProperty("--glow-red-subtle", `oklch(0.65 ${c} ${h} / 0.2)`);
  root.style.setProperty("--glow-crimson", `oklch(0.55 ${c2} ${h2} / 0.5)`);
  root.style.setProperty(
    "--glow-crimson-strong",
    `oklch(0.55 ${c2} ${h2} / 0.85)`,
  );

  // ── Theme helper vars (full oklch strings, for use in inline style={{}}) ────
  // Use these in components instead of hardcoded oklch(0.65 0.26 20 / ...)
  root.style.setProperty("--theme-primary", `oklch(0.65 ${c} ${h})`);
  root.style.setProperty("--theme-primary-dim", `oklch(0.65 ${c} ${h} / 0.12)`);
  root.style.setProperty("--theme-primary-low", `oklch(0.65 ${c} ${h} / 0.08)`);
  root.style.setProperty("--theme-primary-mid", `oklch(0.65 ${c} ${h} / 0.25)`);
  root.style.setProperty(
    "--theme-primary-border",
    `oklch(0.65 ${c} ${h} / 0.30)`,
  );
  root.style.setProperty(
    "--theme-primary-glow",
    `oklch(0.65 ${c} ${h} / 0.40)`,
  );
  root.style.setProperty(
    "--theme-primary-glow2",
    `oklch(0.65 ${c} ${h} / 0.15)`,
  );
  root.style.setProperty(
    "--theme-primary-glow-sm",
    `oklch(0.65 ${c} ${h} / 0.07)`,
  );
  root.style.setProperty("--theme-accent", `oklch(0.55 ${c2} ${h2})`);
  root.style.setProperty(
    "--theme-accent-dim",
    `oklch(0.55 ${c2} ${h2} / 0.10)`,
  );
  root.style.setProperty(
    "--theme-accent-border",
    `oklch(0.55 ${c2} ${h2} / 0.30)`,
  );
  root.style.setProperty(
    "--theme-text-primary",
    `oklch(0.75 ${c * 0.92} ${h})`,
  );
  root.style.setProperty(
    "--theme-text-secondary",
    `oklch(0.70 ${c * 0.85} ${h + 2})`,
  );
  root.style.setProperty("--theme-bg", `oklch(${bgValue})`);
  root.style.setProperty("--theme-border-line", `oklch(0.65 ${c} ${h} / 0.20)`);

  // Particle canvas colours (rgba format used in canvas API)
  // Approximated from OKLCH → sRGB for hue families
  const particleRgb = hueToParticleRgb(h);
  root.style.setProperty("--theme-particle-1", `rgba(${particleRgb[0]},`);
  root.style.setProperty("--theme-particle-2", `rgba(${particleRgb[1]},`);
  root.style.setProperty("--theme-particle-3", `rgba(${particleRgb[2]},`);
  root.style.setProperty("--theme-particle-4", `rgba(${particleRgb[3]},`);

  // ── Body background ──────────────────────────────────────────────────────────
  document.body.style.backgroundColor = `oklch(${bgValue})`;
  document.body.style.backgroundImage = [
    `radial-gradient(ellipse 80% 50% at 20% -10%, oklch(0.65 ${c} ${h} / 0.07) 0%, transparent 60%)`,
    `radial-gradient(ellipse 60% 40% at 80% 100%, oklch(0.55 ${c2} ${h2} / 0.05) 0%, transparent 60%)`,
  ].join(", ");

  // ── Fonts ────────────────────────────────────────────────────────────────────
  root.style.setProperty(
    "--font-heading",
    `${settings.fontHeading}, sans-serif`,
  );
  root.style.setProperty("--font-body", `${settings.fontBody}, sans-serif`);

  // ── Animations ───────────────────────────────────────────────────────────────
  if (!settings.animationsEnabled) {
    root.style.setProperty("--animation-duration", "0s");
  } else {
    root.style.removeProperty("--animation-duration");
  }

  // ── gradient-text utility (update dynamically) ───────────────────────────────
  // Inject a <style> tag with the current gradient-text definition
  let dynStyle = document.getElementById(
    "__theme-gradient-text",
  ) as HTMLStyleElement | null;
  if (!dynStyle) {
    dynStyle = document.createElement("style");
    dynStyle.id = "__theme-gradient-text";
    document.head.appendChild(dynStyle);
  }
  dynStyle.textContent = `
    .gradient-text {
      background: linear-gradient(135deg, oklch(0.78 ${c * 0.92} ${h + 2}), oklch(0.55 ${c2} ${h2})) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    .gradient-text-alt {
      background: linear-gradient(135deg, oklch(0.55 ${c2} ${h2}), oklch(0.78 ${c * 0.92} ${h + 2})) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    .glass {
      background: oklch(${bgValue} / 0.60) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border: 1px solid var(--theme-border-line) !important;
    }
    .glass-strong {
      background: oklch(${bgValue} / 0.88) !important;
      backdrop-filter: blur(24px) saturate(200%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
      border: 1px solid var(--theme-border-line) !important;
    }
    .glass-red {
      background: oklch(${bgValue} / 0.70) !important;
      backdrop-filter: blur(20px) saturate(200%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(200%) !important;
      border: 1px solid var(--theme-primary-border) !important;
      box-shadow: inset 0 0 30px var(--theme-primary-dim), 0 0 20px var(--theme-primary-low) !important;
    }
    .neon-border {
      border: 1px solid var(--theme-primary-glow) !important;
      box-shadow: 0 0 8px var(--theme-primary-border), inset 0 0 8px var(--theme-primary-dim) !important;
    }
    .neon-border-strong {
      border: 1px solid oklch(0.65 ${c} ${h} / 0.8) !important;
      box-shadow: 0 0 15px var(--theme-primary-glow), 0 0 30px var(--theme-primary-glow2), inset 0 0 15px var(--theme-primary-dim) !important;
    }
  `;
}

/** Map OKLCH hue to approximate particle RGB strings for canvas rendering */
function hueToParticleRgb(hue: number): string[] {
  // Hue families → RGB approximations
  if (hue < 40) {
    // Red/Orange-red
    return ["255, 60, 60", "220, 30, 30", "255, 100, 80", "200, 20, 50"];
  }
  if (hue < 80) {
    // Orange/Yellow
    return ["255, 160, 30", "230, 130, 20", "255, 200, 50", "210, 100, 10"];
  }
  if (hue < 150) {
    // Green
    return ["30, 220, 80", "20, 180, 60", "60, 240, 100", "10, 160, 50"];
  }
  if (hue < 200) {
    // Teal/Cyan
    return ["20, 220, 200", "10, 180, 180", "40, 240, 220", "0, 160, 160"];
  }
  if (hue < 260) {
    // Blue
    return ["40, 100, 255", "20, 70, 230", "60, 130, 255", "10, 50, 210"];
  }
  if (hue < 320) {
    // Purple/Magenta
    return ["180, 50, 255", "150, 30, 220", "200, 80, 255", "130, 20, 200"];
  }
  if (hue < 360) {
    // Pink/Rose
    return ["255, 60, 160", "230, 30, 130", "255, 100, 190", "210, 20, 120"];
  }
  // Default: red
  return ["255, 60, 60", "220, 30, 30", "255, 100, 80", "200, 20, 50"];
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
