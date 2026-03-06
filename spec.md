# Premium Portfolio

## Current State
- Portfolio site with hero, featured carousel, projects, skills, reviews, contact sections
- NavBar has public "Admin" link visible to everyone (desktop and mobile menu)
- Admin panel at `/admin` -- login calls backend `verifyAdminPassword()` which causes "Connection error"
- Admin has 3 tabs: Projects, Reviews, Contact Info -- all working via localStorage
- No design customization controls exist
- No live preview in admin

## Requested Changes (Diff)

### Add
- Design Settings tab in Admin panel with:
  - Primary accent color picker (red shades + custom)
  - Background color options (pure black, dark gray, deep red-black)
  - Font family picker for headings and body (5+ options)
  - Animation toggle (enable/disable all animations site-wide)
  - Section visibility toggles (show/hide Work, Projects, Skills, Reviews, Contact sections)
  - Neon glow intensity slider (low/medium/high)
- Live preview iframe panel inside Admin panel showing portfolio in real-time as settings change
- Settings persisted to localStorage and applied on portfolio page load
- Skills section editor in Admin panel -- add/edit/delete skills with icon picker
- Hero section editor -- edit tagline, subtitle, availability badge text
- localDataStore additions: `saveLocalDesignSettings`, `getLocalDesignSettings`, `saveLocalSkills`, `getLocalSkills`, `saveLocalHero`, `getLocalHero`

### Modify
- Admin login: replace `client.verifyAdminPassword(password)` backend call with a pure localStorage/hardcoded password check (password: "portfolio2024") -- no backend call, no "Connection error"
- NavBar: remove the desktop "Admin" button link and the mobile "Admin Panel" link entirely -- admin only accessible via direct URL `/admin`

### Remove
- Backend `verifyAdminPassword` call from admin login flow

## Implementation Plan
1. Fix AdminLogin component: replace async backend call with synchronous password check against hardcoded "portfolio2024"
2. Remove Admin link from NavBar desktop and mobile sections
3. Add `saveLocalDesignSettings`, `getLocalDesignSettings`, `saveLocalSkills`, `getLocalSkills`, `saveLocalHero`, `getLocalHero` to localDataStore.ts
4. Create DesignSettingsTab component inside AdminPage.tsx with color, font, animation, section visibility, glow intensity controls
5. Create SkillsTab component in AdminPage.tsx for managing skills list
6. Create HeroTab component in AdminPage.tsx for editing hero text
7. Add live preview iframe panel (split-view or tab) in Admin dashboard that renders `/?preview=1` and refreshes on any settings change
8. Apply design settings on PortfolioPage and NavBar via CSS variables or Tailwind classes from localStorage on page load
9. Apply section visibility settings on PortfolioPage to show/hide sections
10. Apply hero edits on HeroSection from localStorage
