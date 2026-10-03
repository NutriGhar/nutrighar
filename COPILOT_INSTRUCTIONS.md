# GitHub Copilot Instructions for NutriGhar

You are working on **NutriGhar**, a premium e-commerce web platform for artisanal, handcrafted Indian sweets, clean protein, stone-ground peanut butters, and healthy snacks.

---

## 1. Golden Rules (Must Always Follow)

1. **DO NOT change the existing UI design or layout**:
   - The user is happy with the visual aesthetic, branding, colors, and layout.
   - Only make targeted spacing, alignment, and brightness/contrast refinements.
   - Never replace sections with different designs or redesign existing components.
2. **Make surgical edits only**:
   - Modify only the specific lines or classes needed.
   - Never rewrite entire components when fixing CSS or layout issues.
3. **Verify admin portal data synchronization**:
   - Any product, category, or content updated via the admin portal MUST immediately reflect on the live storefront.

---

## 2. Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + `@tailwindcss/postcss`
- **Database**: PostgreSQL with Prisma ORM (`@prisma/client` v6)
- **State Management**:
  - `ContentContext.tsx`: Manages dynamic website content (banners, announcements, testimonials) via `/api/content` and `localStorage` cache.
  - `CartContext.tsx`: Manages shopping cart and order persistence.
  - `CustomerAuthContext.tsx`: Manages customer authentication sessions.

---

## 3. Brand Color Palette & Visual Style

| Color Name | Hex Code | Tailwind Usage |
|---|---|---|
| Deep Forest Green | `#1E382B` | Primary buttons, headers, brand accents |
| Brand Green Light | `#2A4F3C` | Button hover states |
| Warm Sand / Cream | `#FAF7F2` | Page background, cards (`--background`) |
| Light Sand | `#F6F1EA` | Section backgrounds, contrast strips |
| Warm Sand Beige | `#EFE8DE` | Newsletter background, secondary blocks |
| Terracotta | `#9C5838` | Eyebrow badges, tags, pricing highlights |
| Ochre Gold | `#C68841` | Secondary accents, star ratings |
| Charcoal | `#1C1917` | Primary typography (`--foreground`) |
| Muted Stone | `#6B635B` | Subtitles, descriptions, secondary text |
| Border Cream | `#E8E1D7` | Subtle section dividers |
| Border Stone | `border-stone-200` | Card borders |

---

## 4. UI Spacing, Card Geometry & Safe-Zone Rules

### A. Card Corner Radius: Always Use `rounded-2xl`, NOT `rounded-3xl`
- **Why**: `rounded-3xl` applies a `24px` corner radius. If card padding is `16px–24px`, the 24px corner curve cuts into the text, clipping:
  - The first letter of city names (e.g., `Delhi`, `Bengaluru`) at the bottom-left corner of testimonial cards.
  - The `E` in `Explore Collection` at the bottom-left corner of category cards.
  - The star rating `★★★★★` at the top-left corner.
  - The `Pure Natural` badge at the bottom-right of product cards.
- **Rule**: Standardize all cards to **`rounded-2xl`** (`16px` radius).
- **Safe Zone Rule**: Card horizontal padding (`p-6` = 24px) must always exceed corner radius (16px) by at least 8px so content sits completely on flat card area.

### B. Do NOT Add `overflow-hidden` to Cards With Top/Bottom Text
- Adding `overflow-hidden` to a card where stars or badges sit near the border will chop them in half.
- If an image inside the card needs rounded corners, apply `overflow-hidden` to the **image container `<div>` only**, not to the entire card container.

### C. Consistent Left Alignment (No Staggered Indents)
- Do NOT add one-off `pl-1.5` or `pl-2` to only single lines of text (e.g., the location line) inside a card.
- All card elements (stars, quote, divider, author name, city name) must share the same left padding.

### D. Section & Heading Spacing Standard
- **Heading margin-bottom**: Apply `mb-8` (`2rem`) directly to the `<h2>` heading element.
- **Card grid margin-top**: Apply `mt-4` (`1rem`) directly to the outer grid container `<div>`.
- **Card grid gap**: Standardize on `gap-4 sm:gap-6 lg:gap-8`.
- **Card internal padding**:
  - Category Cards: `p-4 sm:p-5 pb-5 sm:pb-6`
  - Product Cards: Image `h-44 sm:h-64`, body `p-3.5 sm:p-4`
  - Testimonial Cards: `p-6 sm:p-7`

---

## 5. Admin Portal & Live Website Sync Rules

### A. Products Sync (`/app/admin/products` ↔ `/products`, `/`)
- When creating or editing products in the admin portal:
  - Database table: `Product` in Prisma schema.
  - Form fields: `name`, `slug`, `price`, `originalPrice`, `categoryId`, `image`, `images`, `stockQuantity`, `weight`, `isActive`, `isFeatured`, `isBestSeller`.
  - API endpoint: `POST /api/products` and `PUT /api/products/[id]`.
  - Storefront uses `GET /api/products?active=true` — ensure `isActive: true` is set for products to be visible on the public store.

### B. Categories Sync (`/app/admin/categories` ↔ Homepage Collections)
- Category model in Prisma: `Category` (`@@map("categories")`).
- Default categories are seeded from `DEFAULT_CATEGORIES` in `lib/db.ts`.
- Icons must never contain corrupted characters like `??`. Use `formatCategory()` in `lib/db.ts` which sanitizes emoji and assigns fallback icons.
- Sync endpoint: `POST /api/categories/sync` calls `syncOfficialCategories()`.

### C. Content Management Sync (`/app/admin/content` ↔ Homepage Sections)
- Managed via `WebsiteContent` table in Prisma (`section` key + `data` JSON).
- Sections include: `hero`, `announcement`, `curatedCollections`, `testimonials`, `brandStory`, `whyChooseUs`, `productSpotlight`, `newsletter`, `footer`.
- When an admin saves changes in `/app/admin/content`:
  1. API updates `WebsiteContent` row via `upsert`.
  2. Client receives response and calls `localStorage.setItem('nutrighar_custom_content', JSON.stringify(data.data))`.
  3. Client dispatches `window.dispatchEvent(new CustomEvent('nutrighar_content_updated', { detail: data.data }))`.
  4. All listening storefront components re-render immediately.

---

## 6. Development & Coding Conventions

1. **PowerShell / Windows Compatibility**:
   - When running CLI scripts on Windows, use `cmd.exe /c "..."` or native Node scripts.
   - Do not pass unescaped `$` variables in PowerShell `-Command` strings.
2. **UTF-8 Encoding**:
   - Always read and write files with explicit `UTF-8` encoding.
   - Preserve Unicode symbols: `★`, `₹`, `🌿`, `✓`, `→`, and directional quotation marks.
3. **Responsive Breakpoints**:
   - Mobile: Default `< 640px` (2 columns for product/category grids)
   - Tablet: `sm:` (`>= 640px`) and `md:` (`>= 768px`) (3 columns)
   - Desktop: `lg:` (`>= 1024px`) and `xl:` (`>= 1280px`) (4 columns)
