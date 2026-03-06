import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Project {
    id: bigint;
    title: string;
    featured: boolean;
    order: bigint;
    link: string;
    description: string;
    imageUrl: string;
    category: string;
}
export interface ContactInfo {
    bio: string;
    linkedin: string;
    title: string;
    twitter: string;
    name: string;
    email: string;
    github: string;
}
export interface UserProfile {
    bio: string;
    name: string;
    email: string;
}
export interface Review {
    id: bigint;
    role: string;
    text: string;
    author: string;
    avatarUrl: string;
    rating: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProject(title: string, description: string, imageUrl: string, category: string, link: string, featured: boolean, order: bigint): Promise<bigint>;
    addReview(author: string, role: string, text: string, rating: bigint, avatarUrl: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProject(id: bigint): Promise<void>;
    deleteReview(id: bigint): Promise<void>;
    getAllProjects(): Promise<Array<Project>>;
    getAllReviews(): Promise<Array<Review>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactInfo(): Promise<ContactInfo | null>;
    getFeaturedProjects(): Promise<Array<Project>>;
    getProjectById(id: bigint): Promise<Project | null>;
    getProjectsByCategory(category: string): Promise<Array<Project>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setContactInfo(name: string, title: string, bio: string, email: string, github: string, linkedin: string, twitter: string): Promise<void>;
    updateProject(id: bigint, title: string, description: string, imageUrl: string, category: string, link: string, featured: boolean, order: bigint): Promise<void>;
    updateReview(id: bigint, author: string, role: string, text: string, rating: bigint, avatarUrl: string): Promise<void>;
    verifyAdminPassword(password: string): Promise<boolean>;
}
