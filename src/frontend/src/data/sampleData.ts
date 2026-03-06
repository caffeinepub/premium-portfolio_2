import type { ContactInfo, Project, Review } from "../backend";

export const sampleProjects: Project[] = [
  {
    id: BigInt(1),
    title: "E-Commerce Platform",
    description:
      "Full-stack online store with real-time inventory, Stripe payments, and admin dashboard. Built with React, Node.js, and PostgreSQL serving 10k+ monthly users.",
    imageUrl: "/assets/generated/project-ecommerce.dim_800x500.jpg",
    category: "Web Dev",
    link: "https://github.com",
    featured: true,
    order: BigInt(1),
  },
  {
    id: BigInt(2),
    title: "Brand Identity Design",
    description:
      "Complete visual identity for a Series A fintech startup — logo system, typography, color palette, and brand guidelines spanning 80+ pages.",
    imageUrl: "/assets/generated/project-brand.dim_800x500.jpg",
    category: "Design",
    link: "https://dribbble.com",
    featured: true,
    order: BigInt(2),
  },
  {
    id: BigInt(3),
    title: "AI Chat Assistant",
    description:
      "NLP-powered conversational assistant using GPT-4 and custom fine-tuning. Handles multi-turn dialogue, context persistence, and 15 languages.",
    imageUrl: "/assets/generated/project-ai-chat.dim_800x500.jpg",
    category: "AI",
    link: "https://github.com",
    featured: true,
    order: BigInt(3),
  },
  {
    id: BigInt(4),
    title: "Cinematic Edit Reel",
    description:
      "Award-winning highlight reel showcasing 3 years of professional video work. Color-graded in DaVinci Resolve with custom sound design.",
    imageUrl: "/assets/generated/project-video.dim_800x500.jpg",
    category: "Editing",
    link: "https://vimeo.com",
    featured: true,
    order: BigInt(4),
  },
  {
    id: BigInt(5),
    title: "Animated Portfolio",
    description:
      "3D-animated personal portfolio with WebGL canvas, custom shader effects, and GSAP scroll animations. Scores 98 on Lighthouse performance.",
    imageUrl: "/assets/generated/project-portfolio.dim_800x500.jpg",
    category: "Web Dev",
    link: "https://github.com",
    featured: false,
    order: BigInt(5),
  },
  {
    id: BigInt(6),
    title: "Mobile App UI System",
    description:
      "Comprehensive iOS design system for a health-tech startup. 200+ components, 4 theme variants, and Figma tokens synced to Xcode.",
    imageUrl: "/assets/generated/project-mobile.dim_800x500.jpg",
    category: "Design",
    link: "https://dribbble.com",
    featured: false,
    order: BigInt(6),
  },
  {
    id: BigInt(7),
    title: "Image Recognition API",
    description:
      "Production-grade computer vision API with 94.2% accuracy on COCO dataset. Supports real-time object detection, segmentation, and pose estimation.",
    imageUrl: "/assets/generated/project-vision.dim_800x500.jpg",
    category: "AI",
    link: "https://github.com",
    featured: false,
    order: BigInt(7),
  },
  {
    id: BigInt(8),
    title: "Documentary Short Film",
    description:
      "5-minute documentary short on urban beekeeping, screened at 3 film festivals. Shot on RED Cinema, edited in Premiere Pro with DaVinci color grade.",
    imageUrl: "/assets/generated/project-documentary.dim_800x500.jpg",
    category: "Editing",
    link: "https://vimeo.com",
    featured: false,
    order: BigInt(8),
  },
];

export const sampleReviews: Review[] = [
  {
    id: BigInt(1),
    author: "Alex Johnson",
    role: "CEO at TechStart",
    text: "Exceptional work delivered ahead of schedule. The attention to detail and technical depth were remarkable. Our platform saw a 40% increase in user engagement after launch.",
    rating: BigInt(5),
    avatarUrl: "/assets/generated/avatar-1.dim_200x200.jpg",
  },
  {
    id: BigInt(2),
    author: "Maria Chen",
    role: "Creative Director at Studio Novo",
    text: "The design work was outstanding — truly understood our brand's essence and elevated it beyond what we imagined. I've worked with many designers; this was different.",
    rating: BigInt(5),
    avatarUrl: "/assets/generated/avatar-2.dim_200x200.jpg",
  },
  {
    id: BigInt(3),
    author: "David Park",
    role: "Lead Engineer at Axiom Labs",
    text: "Collaborated seamlessly with our team. The AI model integration was flawless, and the code quality was production-ready from day one. Would hire again without hesitation.",
    rating: BigInt(5),
    avatarUrl: "/assets/generated/avatar-3.dim_200x200.jpg",
  },
];

export const sampleContactInfo: ContactInfo = {
  name: "Ganesh Raikwar",
  title: "Full-Stack Developer & Creative Technologist",
  bio: "I craft digital experiences at the intersection of engineering and design. With 7+ years building products that millions use, I bring both technical depth and visual sensibility to every project.",
  email: "ganesh@portfolio.dev",
  github: "ganeshraikwar",
  linkedin: "ganeshraikwar",
  twitter: "ganeshraikwar",
};
