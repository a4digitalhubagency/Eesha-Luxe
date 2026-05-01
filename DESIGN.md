# Design System Document: The Editorial Ethereal

## 1. Overview & Creative North Star: "The Digital Atelier"
This design system is built to transform a standard e-commerce interface into a high-end digital editorial experience. Our Creative North Star is **"The Digital Atelier"**—a space that feels curated, bespoke, and intentionally spacious. 

We break the "template" look by rejecting rigid, boxed-in layouts. Instead, we embrace **Intentional Asymmetry** and **Tonal Depth**. This means product images may overlap with typography, and hierarchy is defined by soft shifts in background value rather than hard lines. The goal is to make the user feel as though they are flipping through a premium fashion retrospective, not scrolling through a database.

---

## 2. Colors & Surface Philosophy
The palette utilizes a sophisticated mix of warm neutrals and high-contrast accents to evoke a sense of modern femininity and luxury.

### Tonal Palette
- **Primary (Soft Pink):** `#705862` (Text/Iconography) | `primary_container`: `#f8d7e3` (Surface accents)
- **Secondary (Deep Brown):** `#695b5b` (Deep contrast and grounding elements)
- **Surface Tiers:** 
  - `surface_container_lowest`: `#ffffff` (Floating cards and elevated content)
  - `surface`: `#f9f9f9` (Main background)
  - `surface_container_low`: `#f3f3f3` (Section differentiation)

### The "No-Line" Rule
To maintain an ultra-minimal aesthetic, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For instance, a `surface_container_low` section should sit against a `surface` background to denote a change in context.

### Glass & Gradient Signature
For floating elements—such as sticky mobile CTAs or navigation bars—use **Glassmorphism**. Apply `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur. To add "visual soul," primary buttons should feature a subtle linear gradient from `primary` to `primary_fixed_dim` at a 135-degree angle, preventing the UI from feeling "flat" or "cheap."

---

## 3. Typography: The Editorial Voice
The typography system relies on a high-contrast pairing of a sophisticated Serif and a functional Sans-Serif.

- **Display & Headlines (Noto Serif):** Used for large editorial moments. The `display-lg` (`3.5rem`) and `headline-lg` (`2rem`) levels should be treated as graphic elements. Use generous letter-spacing (-2%) for headlines to evoke a "Didot-style" fashion masthead.
- **Titles & Body (Manrope):** Used for navigation, product titles, and descriptions. `body-lg` (`1rem`) provides the clarity required for luxury e-commerce.
- **Labels (Manrope):** `label-sm` (`0.6875rem`) must be set in All-Caps with a `0.1rem` letter-spacing for a premium, tagged look.

---

## 4. Elevation & Depth: Tonal Layering
We move away from traditional shadows in favor of **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by "stacking." Place a `surface_container_lowest` card on a `surface_container_low` background. This creates a soft, natural lift that feels like fine paper.
- **Ambient Shadows:** Shadows are reserved for high-interaction floating elements (e.g., Drawers). Use a blur of `32px` at 4% opacity, using the `on_surface` color as the shadow tint. 
- **The Ghost Border:** If a boundary is required for accessibility (e.g., Input fields), use the `outline_variant` token at 20% opacity. **Never use 100% opaque borders.**
- **Glassmorphism:** Apply to the "Slide-over Drawers" for filters. The semi-transparent surface allows the product imagery to bleed through, softening the transition between the UI layers.

---

## 5. Components

### Buttons
- **Primary:** High-contrast `primary` fill. Large horizontal padding (`spacing-6`). Rectangular with `DEFAULT` (4px) roundedness for a sharp, modern edge.
- **Secondary:** Subtle `outline_variant` (Ghost Border) with `on_surface` text. Use for "Add to Wishlist" or "View Details."

### Premium Product Cards
- **Construction:** No borders, no shadows. Use a `surface_container_lowest` background. 
- **Imagery:** Aspect ratio should be a vertical 4:5 (Editorial format). 
- **Interaction:** On hover, the image should subtly scale (1.02x) while the background shifts to `primary_container`.

### Slide-over Drawers (Mobile Filters)
- **Style:** 90% width, anchoring from the right.
- **Surface:** Glassmorphic `surface_container_lowest` with backdrop-blur. Use `spacing-10` for top-padding to allow the header to breathe.

### Input Fields
- **Style:** Underline only (bottom border at 1px `outline_variant`). 
- **Active State:** Border transitions to `primary` with a `2px` weight. Labels float above in `label-sm`.

### Checkboxes & Radios
- **Style:** Minimalist. Checkboxes use `none` roundedness (square). The "Selected" state is a solid `secondary` fill with a white checkmark.

---

## 6. Do's and Don'ts

### Do
- **Use White Space as a Luxury:** If you think there is enough space, add `spacing-4` more. Generous margins communicate exclusivity.
- **Asymmetric Layouts:** Allow images to be slightly offset from the text grid to create an editorial feel.
- **Tonal Transitions:** Use background shifts to guide the eye from the Hero section to the Product Grid.

### Don't
- **Don't use Divider Lines:** Never use a horizontal rule `<hr>` to separate products or sections. Use `spacing-16` or background color shifts.
- **Don't use Standard Shadows:** Avoid the "fuzzy box" look. If a shadow is visible enough to be noticed, it is too dark.
- **Don't Over-round:** Limit use of `full` roundedness. Stick to `sm` (2px) or `DEFAULT` (4px) to maintain a sharp, high-fashion architectural feel.
- **Don't Crowded Content:** Avoid "Buy Now" buttons that touch the edges of product cards. Everything needs room to breathe.