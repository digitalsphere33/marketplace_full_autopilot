# STYLING.md

## UX Philosophy
Trust > Beauty > Cleverness

## Stack
- TailwindCSS
- Framer Motion (micro-animations only)

---

## Design System (Five Essential Skills Implementation)

### 1. Typography System

**Font Selection:**
- Primary: Inter (from FontShare) - clean, modern, highly readable
- Fallback: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto

**Type Scale (Major Third - 1.25 ratio):**
- Base: 16px (1rem)
- Scale values:
  - xs: 0.64rem (10.24px) - small labels
  - sm: 0.8rem (12.8px) - captions
  - base: 1rem (16px) - body text
  - lg: 1.25rem (20px) - subheadings
  - xl: 1.563rem (25px) - card titles
  - 2xl: 1.953rem (31.25px) - section headings
  - 3xl: 2.441rem (39px) - page titles
  - 4xl: 3.052rem (48.8px) - hero headings

**Letter Spacing:**
- Body text: default (0)
- Headings (xl+): -0.02em (tighter)
- Small text (sm, xs): 0.01em (slightly wider)

**Line Height:**
- Body text: 1.5 (150%)
- Headings: 1.2 (120%)
- Compact (buttons, labels): 1 (100%)

### 2. Layout System

**Grid System:**
- Desktop (>1024px): 12-column grid, 24px gap
- Tablet (768px-1023px): 8-column grid, 16px gap
- Mobile (<768px): 4-column grid, 16px gap
- Max container width: 1280px

**Spacing System (8-point grid):**
- 0: 0px
- 1: 8px (0.5rem)
- 2: 16px (1rem)
- 3: 24px (1.5rem)
- 4: 32px (2rem)
- 5: 40px (2.5rem)
- 6: 48px (3rem)
- 8: 64px (4rem)
- 10: 80px (5rem)
- 12: 96px (6rem)

**Visual Hierarchy Principles:**
- **Proximity:** Group related items with consistent spacing
- **Size:** Larger = more important (use type scale)
- **Contrast:** Use weight (font-weight: 400, 600, 700) and opacity (0.6, 0.8, 1.0)
- **Alignment:** Maintain clean vertical and horizontal rhythms

### 3. Color System (60-30-10 Rule)

**60% - Neutral Colors (Backgrounds & Text):**
- Background: #FFFFFF (white)
- Surface: #F9FAFB (gray-50) - cards, sections
- Border: #E5E7EB (gray-200) - dividers
- Text Primary: #111827 (gray-900) - main text
- Text Secondary: #6B7280 (gray-500) - supporting text
- Text Disabled: #9CA3AF (gray-400)

**30% - Secondary Colors (Cards, Headers, Visuals):**
- Primary: #1D4ED8 (blue-700) - main brand color
- Primary Light: #3B82F6 (blue-500) - hover states
- Primary Dark: #1E40AF (blue-800) - active states

**10% - Accent Colors (Buttons, CTAs):**
- Success: #15803D (green-700) - confirmations, success states
- Warning: #B45309 (amber-700) - warnings, important notices
- Error: #B91C1C (red-700) - errors, destructive actions
- Info: #0891B2 (cyan-600) - information, tips

**Color Techniques:**
- Use opacity for variations (e.g., bg-primary/10, bg-primary/50)
- Maintain WCAG AAA contrast ratios:
  - Large text (18px+): minimum 3:1
  - Small text (<18px): minimum 4.5:1
  - Interactive elements: minimum 3:1

**Contrast Ratios:**
- Text Primary on White: 15.8:1 ✓
- Primary Blue on White: 7.8:1 ✓
- Success Green on White: 6.9:1 ✓
- All combinations exceed WCAG AAA standards

### 4. Component Standards

**Buttons:**
- Height: 40px (mobile), 48px (desktop)
- Padding: 16px horizontal, 12px vertical
- Border radius: 8px
- Font weight: 600 (semibold)
- Primary CTA: blue-700 background, white text
- Secondary: white background, blue-700 border and text
- Hover state: 10% darker, slight scale (1.02)

**Cards:**
- Background: white or gray-50
- Border: 1px solid gray-200
- Border radius: 12px
- Padding: 24px
- Shadow: subtle (0 1px 3px rgba(0,0,0,0.1))

**Forms:**
- Input height: 48px
- Border: 1px solid gray-300
- Focus: 2px blue-500 ring
- Padding: 12px 16px
- Border radius: 8px
- Error state: red-500 border, red-100 background

### 5. Conversion Design Optimization

**CTA Placement Strategy:**
- Hero section: Primary CTA above fold (visible in <3 seconds)
- Navigation: Sticky "Sell Now" or "Sign Up" button
- Content sections: CTA every 2-3 scroll sections
- Footer: Secondary CTA for last chance conversion

**Trust Elements:**
- Seller ratings: ⭐ 5-star system with review count
- Trust badges: Payment security, verified sellers
- Social proof: "X sellers joined this month"
- Testimonials: Real seller success stories with photos
- Reviews: Display prominently on product pages

**Single Page Goal Implementation:**
- Homepage: Get users to browse/search products
- Product page: Add to cart / Buy now
- Seller onboarding: Complete KYC verification
- Checkout: Complete purchase
- Each page has ONE primary action (clear hierarchy)

**Clear Value Proposition:**
- Homepage hero: "South Africa's Trusted Marketplace"
- Seller page: "Start Selling in 24 Hours"
- Buyer page: "Shop Local. Support SA Sellers."

---

## Visual Rules
- Large spacing (minimum 24px between major sections)
- Clear CTAs (minimum 48px height, high contrast)
- Obvious trust indicators (ratings, badges, testimonials)
- Mobile-first design (touch-friendly 48px minimum targets)

## Responsive Breakpoints
```css
/* Mobile-first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

## Animation Guidelines
- Micro-animations only (button hovers, page transitions)
- Duration: 150-300ms (feel instant)
- Easing: ease-in-out (natural motion)
- Avoid: Auto-play carousels, parallax effects, excessive motion