# Premium Portfolio

## Current State
Full-stack portfolio with Motoko backend and React frontend. Current design uses electric blue/cyan + purple theme with glass morphism. Admin panel exists at `/admin` with password `portfolio2024`. Portfolio sections: Hero, Featured Carousel, Projects, Skills, Reviews, Contact.

## Requested Changes (Diff)

### Add
- Red neon glow keyframes: `pulse-glow-red`, `neon-flicker`, `neon-border-pulse`
- Per-element entrance animations using framer-motion across all portfolio sections
- Red neon variants for glass utilities: `glass-red`, `glow-red`, `glow-red-text`
- Animated red gradient background mesh in Hero

### Modify
- **index.css**: Replace all blue/cyan/purple OKLCH tokens with red neon palette. Primary becomes deep red `oklch(0.65 0.26 20)`, accent becomes crimson `oklch(0.55 0.28 15)`. All glow variables updated to red variants.
- **HeroSection**: Animate each word/line with staggered motion, pulsing red neon ring around avatar/badge, floating particles become red
- **NavBar**: Red neon active state, animated hover underlines, scroll-triggered glass blur intensification
- **FeaturedCarousel**: Red neon card borders on hover, animated slide transitions
- **ProjectsSection**: Staggered card entrance animations, red neon hover glow on project cards
- **SkillsSection**: Animated skill bars/icons with red neon pulse, staggered entrance
- **ReviewsSection**: Review cards slide in from sides with stagger, red star icons glow
- **ContactSection**: Input focus red neon glow, animated send button
- **AdminPage**: Red neon theme matching main site, login screen red glow

### Remove
- All cyan/blue glow references
- Purple accent color references

## Implementation Plan
1. Update `index.css` with full red neon OKLCH design token overhaul + new keyframes
2. Update HeroSection with staggered motion animations and red neon effects
3. Update NavBar with red neon hover/active states
4. Update FeaturedCarousel with red neon card borders
5. Update ProjectsSection with staggered entrance + red hover glow
6. Update SkillsSection with animated red neon pulses
7. Update ReviewsSection with slide-in animations + red stars
8. Update ContactSection with red neon focus effects
9. Update AdminPage login/dashboard with red neon theme
10. Validate and deploy
