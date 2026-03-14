# Responsiveness & device compatibility

The DivineWay site is built to work across common devices and screen sizes.

---

## Viewport & base

- **Viewport:** All pages use `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, so layout scales correctly on phones, tablets, and desktops.
- **Layout:** Fluid containers with `max-width` and responsive grids (flexbox, CSS Grid, Swiper) so content reflows instead of horizontal scrolling.

---

## Breakpoints in use

| Breakpoint | Typical devices | Behaviour |
|------------|------------------|-----------|
| **&lt; 480px** | Small phones | Single-column layouts, stacked sections, smaller typography, full-width CTAs. |
| **480px – 768px** | Phones, large phones | Swiper/cards at 1–1.2 slides; forms and modals full width. |
| **768px – 1024px** | Tablets, small laptops | Hamburger menu; 2-column grids where used (e.g. about); crystals 2–3.5 slides. |
| **1024px – 1280px** | Laptops | Full nav bar; containers ~1040px; multi-column sections. |
| **1280px+** | Desktops | Wider containers (up to 1200px), more spacing. |
| **1920px+** | Large desktops, Smart TVs | Container max 1400px; content stays readable and centered. |

---

## Device summary

| Device type | Compatible | Notes |
|-------------|------------|--------|
| **Phone** | Yes | Single column, touch-friendly nav (hamburger), tap targets ≥44px, WhatsApp float opens app. |
| **Tablet** | Yes | Same as phone up to 1024px (hamburger); above that, full nav. Swiper and cards adapt. |
| **Tab** | Yes | Treated like tablet; same breakpoints and behaviour. |
| **Laptop** | Yes | Full navigation, multi-column content, WhatsApp float opens WhatsApp Web. |
| **Desktop** | Yes | Same as laptop; containers cap width for readability. |
| **Smart TV** | Yes | Large viewport (e.g. 1920×1080); layout uses max-width so content doesn’t over-stretch. No touch assumed; pointer is fine. WhatsApp float opens WhatsApp Web. |

---

## Notes

- **Touch vs pointer:** Media queries use `(pointer: coarse)` where relevant (e.g. WhatsApp: app on touch devices, Web on desktop/TV).
- **Safe areas:** Header uses `env(safe-area-inset-top)` so the nav isn’t hidden by notches or status bars on phones.
- **Swiper:** Crystals and testimonials use Swiper with breakpoints so slide count and spacing adapt by width.
- **Forms & modals:** Full width on small screens; booking form uses a 2-column grid from 480px up.

Overall, the site is **responsive and compatible** across phones, tablets, tabs, laptops, desktops, and smart TVs for layout and core behaviour.
