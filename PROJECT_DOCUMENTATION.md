# THE OUTFIT CLUB — PLATFORM ARCHITECTURE & DOCUMENTATION

## 1. Product Vision
**The Outfit Club** is an exclusively men's fashion e-commerce platform and digital sartorial destination: **"The Sea of Men's Clothing"**. 

Built entirely for the modern man, the platform provides an elevated shopping experience across men's clothing, tailoring, footwear, knitwear, and accessories.

The platform embodies:
- **Exclusively Menswear**: From tailored suiting and everyday relaxed-fit chinos to luxury pima cotton polos, premium denim, handcrafted leather footwear, and minimalist accessories.
- **"The Sea of Men's Clothing"**: A comprehensive ocean of men's sartorial choices for every occasion, silhouette, and aesthetic.
- **Editorial UX**: Contemporary fashion aesthetics, neutral foundations (charcoal, crisp white, deep obsidian, warm neutrals), micro-interactions, responsive hierarchy, and an atmospheric cinematic brand intro.
- **Modern Commerce Stack**: Fast, modular, type-safe architecture built with React 19, TypeScript, Vite, and zero-runtime CSS tokens. No AI/ML gimmicks—pure, polished digital fashion commerce.

---

## 2. Core Features (Target Platform Capabilities)
1. **Curated Product Discovery**: High-resolution editorial browsing, multi-attribute filtering (category, price, sizing, material, color, aesthetic), and detailed garment specifications.
2. **Outfit Studio & Lookbook**: Interactive wardrobe builder enabling users to assemble multi-piece looks, inspect aesthetic harmony, and save personalized capsules.
3. **Styling Concierge**: Algorithmic & personal styling advice for occasions (workwear, evening, weekend, destination).
4. **Sizing Guide & Fit Advisor** *(Future Module)*: Garment measurements and silhouette fitting details.
5. **Commerce & Wardrobe Flow**: Cart drawer, saved wishlist looks, checkout flow, order lifecycle tracking.

---

## 3. Technology Stack
- **Runtime**: Node.js v24+
- **Frontend Core**: React 19, TypeScript
- **Bundler & Tooling**: Vite 8 (with HMR & optimized production bundling)
- **Styling Architecture**: Vanilla CSS Design Tokens (Custom CSS variables, zero runtime overhead, responsive layout system, mobile-first design)
- **Typography**: Google Fonts — *Outfit* (Display / Headings) + *Plus Jakarta Sans* (Body / UI)
- **Icons**: Custom inline vector SVG icons (zero external dependency conflicts, lightweight, pixel-perfect)

---

## 4. Architecture & Directory Structure
```
The Outfit Club/
├── public/                 # Static assets & favicons
├── src/
│   ├── assets/             # Brand logos & media
│   ├── components/
│   │   ├── common/         # Atomic UI components (Button, Badge, Icons)
│   │   ├── layout/         # TopAnnouncementBar, Header, Footer, Navigation
│   │   └── feedback/       # Status, notifications, empty states
│   ├── config/
│   │   └── brand.config.ts # Brand identity, metadata, navigation, top announcements
│   ├── pages/
│   │   ├── HomePage.tsx    # Editorial landing & platform foundation showcase
│   │   └── HomePage.css
│   ├── styles/
│   │   ├── tokens.css      # Core design tokens (colors, typography, spacing, shadows, radii)
│   │   ├── reset.css       # Clean cross-browser reset
│   │   └── layout.css      # Responsive containers, grid, and layout utilities
│   ├── types/
│   │   └── index.ts        # Domain models (ProductItem, OutfitLook, StylingRecommendation, NavItem, BrandInfo)
│   ├── App.tsx             # Root application shell
│   ├── App.css
│   ├── index.css           # Global stylesheet importing tokens, reset, layout
│   └── main.tsx            # Application entry point
├── index.html              # SEO metadata, preconnected fonts, HTML5 shell
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
└── PROJECT_DOCUMENTATION.md
```

---

## 5. Development Roadmap

### ✅ Completed: Module 0 — Foundation & Design System (Task 0.1)
- Clean repository setup with Vite, React 19, TypeScript.
- Comprehensive CSS Design Tokens (`tokens.css`) defining brand palette, typography scale, spacing, radii, and shadows.
- Responsive layout system (`layout.css`) with container queries and mobile drawer navigation.
- Domain TypeScript interfaces (`types/index.ts`) for products, looks, and navigation.
- Modular brand configuration (`brand.config.ts`).
- Clean editorial layout foundation (`TopAnnouncementBar`, `Header`, `HomePage`, `Footer`).
- Build verification and HTTP 200 server response confirmed.

### ✅ Completed: Module 1 — Product Catalog & Discovery System
#### Task 1.1 — Product Data Foundation
- **Product Type Schema (`src/types/product.ts`)**: Extended product contracts with fashion-specific attributes: category, subcategory, slug, fit, aesthetic, availability, materials, color variants, pricing, discount math, ratings, review counts, and ISO creation timestamps.
- **Foundational Dataset (`src/data/products.ts`)**: 36 realistic fashion items covering 5 major categories (Clothing, Tailoring, Knitwear, Footwear, Accessories) and 23 subcategories.
- **Search, Filter & Sort Utilities (`src/data/products.ts`)**: Implemented query, category lookup, multi-attribute filtering, and sorting helper functions.
- **Integrity Validation**: Automated verification script confirms 0 duplicate IDs/slugs, mathematically consistent discount percentages, and type conformance.

#### Task 1.2 — Product Card & Catalog Grid Component
- **ProductCard (`src/components/products/ProductCard.tsx`)**: Editorial 3:4 portrait card with secondary image hover crossfade, accessible wishlist toggle, interactive color swatches with active rings, discount pill, low-stock badge, and inline size tray quick-add interaction.
- **ProductCardSkeleton (`src/components/products/ProductCardSkeleton.tsx`)**: Reusable shimmer loader matching product card dimensions for asynchronous loading states.
- **ProductGrid (`src/components/products/ProductGrid.tsx`)**: Modular responsive catalog grid (2 columns on mobile, 3 columns on tablet, 4 columns on desktop) with empty state rendering and skeleton fallback.

#### Task 1.3 — Filter Sidebar & Search UI
- **Filter State Model (`src/types/product.ts`)**: Defined `CatalogFilterState` and `DEFAULT_FILTER_STATE` for comprehensive multi-attribute discovery.
- **Filter Pipeline (`src/data/products.ts`)**: Implemented `filterProductsByState` with case-insensitive multi-field search, intra-category OR logic, inter-category AND logic, and metadata extraction helpers (`getAvailableSubcategories`, `getAvailableSizes`, `getAvailableColors`, `getMinMaxPrice`).
- **Debounced SearchInput (`src/components/products/SearchInput.tsx`)**: 300ms debounced search bar with instant clear action.
- **FilterSidebar (`src/components/products/FilterSidebar.tsx`)**: Collapsible accordion filter sections (Category, Subcategory, Price Range slider, Sizes, Colors, Fits, Aesthetics, Availability) with active counters and reset.
- **ActiveFilterChips (`src/components/products/ActiveFilterChips.tsx`)**: Individual filter removal chips with exact state isolation, "Clear All" action, and live result count indicator.
- **MobileFilterDrawer (`src/components/products/MobileFilterDrawer.tsx`)**: Slide-over filter modal for tablet and mobile viewports with backdrop blur and escape key handling.
- **CatalogDiscovery (`src/components/products/CatalogDiscovery.tsx`)**: Master discovery coordinator uniting search, sorting, desktop sidebar, mobile drawer, active chips, and responsive grid.

#### Task 1.4 — Catalog Discovery Page Integration, Pagination & View Controls
- **Dedicated `/catalog` Route**: Clean zero-dependency client router with `navigateTo` helper, `useCurrentRoute` hook, and browser back/forward history support (`popstate`).
- **Editorial Catalog Header**: Curated collection title, brand subtitle, dynamic piece count ("36 pieces" / "1 piece" / "No pieces found"), and breadcrumbs (`Home / The Collection / [Category]`).
- **Load More Discovery Mechanism**: Progressive pagination loading 12 garments per batch with visual progress bar indicator ("Showing X of Y pieces"). Pagination resets smoothly whenever search queries or active filter criteria change.
- **View Mode Switcher (`compact` vs `editorial`)**:
  - **Compact Mode**: 4-column desktop, 3-column tablet, 2-column mobile grid for high-density browsing.
  - **Editorial Mode**: 2-column desktop/tablet, 1-column mobile grid showcasing larger imagery and magazine-style product prominence.
  - Persistent icon toggles (`GridCompactIcon` and `GridEditorialIcon`) with accessible labels and active highlight states.
- **URL Query Parameter Synchronization**: Bidirectional sync for `category`, `subcategory`, `search`, and `view` parameters via `window.history.replaceState` without full page refreshes.
- **HomePage Discovery CTAs**: Added "Explore Collection" and "Browse All 36 Pieces" navigation triggers seamlessly leading directly into `/catalog`.

#### Brand Identity — Physical Gravity Opening Animation & Ground Impact with Smoke
- **BrandIntro Component (`src/components/brand/BrandIntro.tsx`)**: High-fashion opening experience featuring sequential gravity drops for each letter of "THE OUTFIT CLUB" set in a minimal dark studio environment (`#09090b`) with soft overhead atmospheric lighting.
- **Letter Landing Impact Dynamics**:
  - **Dynamic Contact Shadow**: Realistic elliptical floor contact shadow (`.letter-contact-shadow`) that flares darker and wider upon impact (`scale(1.35, 1.25)`), then settles into resting ground shadow.
  - **Vertical Squash & Rapid Micro-Shake**: Immediate compression (`scale(1.12, 0.86)`), 2–4 rapid lateral micro-shakes (`translateX(-3.5px)` $\rightarrow$ `+2.8px` $\rightarrow$ `-1.2px`), physical upward bounce, and quick settling within 350ms.
  - **Cinematic Studio Smoke / Dust Burst**: Central billow (`.smoke-core`) and asymmetrical expanding wisps (`.smoke-wisp.wisp-left`, `.smoke-wisp.wisp-right`) rising slightly and dissipating outward with soft atmospheric blur within 450–650ms.
  - **Micro-Particle Flecks**: Tiny discrete particles radiating outward at low angles and dissolving naturally within 460ms.
  - **Ground Baseline Ripple**: Luminous high-contrast baseline impact line expanding outward along the ground plane.
- **Rhythmic Sequential Timing**: Each letter triggers its own synchronized impact effect at the exact moment of ground contact ($T \rightarrow H \rightarrow E \dots \rightarrow B$).
- **Session Control & Accessibility**: Instant Skip button with keyboard `[Esc]` shortcut, `sessionStorage` tracking (`toc_intro_seen`) to prevent repetitive playthroughs on internal navigation, `prefers-reduced-motion` compliance, and "Replay Intro" trigger in the footer.

### ⏳ Current & Future Modules
- **Module 1 (Next Task)**:
  - **Task 1.5**: Product Quick View Modal & Micro-Interactions (or Module 2).
- **Module 2**: Outfit Studio & Look Builder
  - Interactive canvas to mix-and-match garments into looks, aesthetic harmony score, save-to-lookbook feature.
- **Module 3**: Styling Concierge & Personalization
  - Occasion-based styling quiz, curated recommendation engine, capsule wardrobe generator.
- **Module 4**: Commerce Engine & Checkout Flow
  - Shopping bag drawer, state management for cart/wishlist, checkout process mock, order confirmation.
- **Module 5**: Customer Account & Wardrobe Management
  - Sizing advisor & measurement guides, customer profile, saved lookbooks & order history.

---

## 6. Engineering & Development Rules
1. **Preserve Repository Integrity**: Every future module builds upon the existing codebase. Never reset, delete existing work, or switch frameworks without explicit instructions.
2. **Modular & Maintainable**: Keep files focused; maintain strict separation of concerns between UI components, pages, data types, config, and styling.
3. **Production-Minded**: Ensure type safety (`verbatimModuleSyntax` compliant), zero build errors, zero console errors, and high-performance asset loading.
4. **Editorial Aesthetic Standards**: Maintain high-fashion visual hierarchy, generous whitespace, confident typography, and subtle micro-interactions. Avoid generic dashboard or sci-fi templates.
5. **Continuous Documentation**: Update this documentation file as each subsequent module is implemented.
