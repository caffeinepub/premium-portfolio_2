# Premium Portfolio

## Current State
- Full portfolio with hero, carousel, projects, skills, reviews, and contact sections
- Admin panel at /admin with password "portfolio2024"
- Red neon theme with glass morphism
- Hero section uses a blue neural-network background image (looks wrong - should be black/red)
- Backend requires Principal-based admin role for all write operations
- Frontend verifies password but doesn't grant admin Principal role, so all save operations fail with "Unauthorized: Only admins can..." error

## Requested Changes (Diff)

### Add
- Password-based admin auth: backend should accept admin password directly on write functions so frontend can save without needing a Principal-based role

### Modify
- Hero background: remove blue image, use pure black CSS background with red neon gradients
- Backend write functions (addProject, updateProject, deleteProject, addReview, updateReview, deleteReview, setContactInfo) to accept an adminPassword parameter and validate it server-side

### Remove
- Dependency on Principal-based admin role for password-authenticated operations

## Implementation Plan
1. Regenerate backend with password parameter on all admin write functions
2. Update frontend components (AdminPage.tsx) to pass password with each write call
3. Store verified password in session state after login
4. Fix hero background CSS (already done)
