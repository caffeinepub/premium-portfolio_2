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
