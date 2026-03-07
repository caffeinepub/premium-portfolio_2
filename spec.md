# Premium Portfolio

## Current State

- Portfolio page shows projects with only the primary (first) image -- no image slider/carousel when multiple images are uploaded
- `FeaturedCarousel.tsx` and `ProjectsSection.tsx` use `useProjectImage` hook which only loads the primary `idb:` image reference stored in `project.imageUrl`
- `ProjectExtras` has `imageIds: string[]` storing all image IDs in IndexedDB, but neither `FeaturedCarousel` nor `ProjectsSection` uses those additional images
- Admin Panel (Projects tab) only shows and manages projects stored in `localStorage` (`getLocalProjects()`). Default/backend/sample projects (from `sampleData.ts`) are NOT shown in admin -- user cannot edit or delete them
- `PortfolioPage.tsx` merges localStorage projects with backend/sample projects for display, but admin panel never seeds/imports sample projects so they can't be managed

## Requested Changes (Diff)

### Add
- **Multi-image slider on project cards**: When a project has multiple images (imageIds.length > 1), show image navigation arrows and dot indicators on hover. Clicking through images shows each in the card's image area with a smooth fade/slide transition
- **Image slider in FeaturedCarousel cards**: Center card (and side cards) should cycle through all project images, not just the primary one
- **Image slider in ProjectsSection cards**: Each project card should show a mini image slider with left/right arrow buttons (appear on hover) and dot indicators for multiple images
- **"Import Default Projects" button** in admin Projects tab: On first load, if localStorage has no projects, automatically offer to import sample projects. Also add a button "Load Default Projects" that imports sampleProjects into localStorage so they can be edited/deleted via admin panel
- A new hook `useProjectImages` (plural) that loads ALL images for a project given imageIds array from ProjectExtras

### Modify
- `FeaturedCarousel.tsx` -- `ProjectCard` component: Add internal image slider state. Load all images via imageIds from ProjectExtras. Show previous/next arrows on hover, dot indicators. Animate between images with fade transition
- `ProjectsSection.tsx` -- `ProjectCard` component: Same multi-image slider treatment. Small arrows appear on card hover for image navigation
- `AdminPage.tsx` -- `ProjectsTab`: When localStorage has 0 projects, show an "Import Default Projects" button (in addition to "Add Project"). This imports sampleProjects into localStorage so they appear in admin and can be managed. Also show count of default vs custom projects
- `PortfolioPage.tsx` -- After import, projects should update in real time

### Remove
- Nothing removed

## Implementation Plan

1. **Add `useProjectImages` hook** in `src/frontend/src/hooks/useProjectImages.ts`:
   - Accepts `imageIds: string[]` and `primaryImageUrl: string`, `fallback: string`
   - Returns `{ images: string[], isLoading: boolean, primaryIndex: number }`
   - Loads all images from IndexedDB using `loadImages(imageIds)`
   - Falls back to primaryImageUrl if imageIds empty

2. **Update `FeaturedCarousel.tsx` -- `ProjectCard`**:
   - Import `useProjectImages` hook
   - Add `imageIndex` state (0-indexed)
   - Load all project images using `getProjectExtra(project.id).imageIds`
   - Show image navigation: left/right arrows appear on hover, dot indicators at bottom of image area
   - Smooth fade transition between images
   - Auto-stop image cycling when project carousel is navigating

3. **Update `ProjectsSection.tsx` -- `ProjectCard`**:
   - Same multi-image slider treatment
   - Compact arrows (small, semi-transparent) appear on card hover
   - Dot indicators at bottom overlay

4. **Update `AdminPage.tsx` -- `ProjectsTab`**:
   - Import `sampleProjects` from `../data/sampleData`
   - Add `handleImportDefaults()` function: calls `addLocalProject` for each sample project, then calls `upsertProjectExtra` with empty extras
   - Show "Import Default Projects" button in empty state AND as a secondary button in the header when projects exist
   - After import, refresh project list

5. **Validate** with typecheck and build
