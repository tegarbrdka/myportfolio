# NEXUS — Creative Tech Hub Portfolio

A high-performance, animation-rich personal portfolio with full Admin CMS.
Built with React + Vite · Tailwind CSS · GSAP · Lenis

---

## 🚀 Quick Start

```bash
tar -xzf portfolio-nexus-clean.tar.gz
cd portfolio
npm install
npm run dev
```

Open → **http://localhost:5173**

---

## 🔐 Admin Panel

URL: `/admin`

| Field    | Value       |
|----------|-------------|
| Username | `admin`     |
| Password | `nexus2024` |

Change credentials in `src/context/ProjectContext.jsx` → `login()` function.

---

## 🗂️ File Structure

```
src/
├── components/
│   ├── sections/
│   │   ├── HeroSection.jsx       ← Parallax + glitch text + grain overlay
│   │   ├── AboutSection.jsx      ← Word-by-word GSAP text reveal
│   │   ├── ServicesSection.jsx   ← Services grid + dual marquee tickers
│   │   ├── ProjectsSection.jsx   ← GSAP horizontal pin scroll
│   │   ├── StatsSection.jsx      ← Count-up stats + achievement timeline
│   │   └── FooterSection.jsx     ← Curtain reveal + socials
│   └── ui/
│       ├── Navbar.jsx            ← Scroll progress bar + active section highlight
│       ├── Preloader.jsx         ← Stripe-exit loading screen
│       ├── CustomCursor.jsx      ← Magnetic cursor (desktop)
│       └── MarqueeTicker.jsx     ← Infinite GSAP marquee
├── context/
│   └── ProjectContext.jsx        ← Global state + localStorage persistence
├── hooks/
│   └── useLenis.js               ← Lenis smooth scroll synced to GSAP ticker
└── pages/
    ├── Portfolio.jsx             ← Public page (all sections)
    ├── AdminLogin.jsx            ← Login with shake animation
    ├── AdminDashboard.jsx        ← Grid/list project manager
    └── ProjectForm.jsx           ← Add/Edit form with image preview
```

---

## ✨ Feature Checklist

### Public Portfolio
- [x] **Preloader** — stripe-exit animation, 0→100 counter
- [x] **Smooth Scroll** — Lenis + GSAP ScrollTrigger (no jitter)
- [x] **Hero** — massive typographic entrance, text parallax separation, glitch hover, grain overlay, scroll dot
- [x] **About** — word-by-word text reveal on scroll, skills grid, image with parallax
- [x] **Services** — 6-service grid with hover animations + dual infinite marquee tickers
- [x] **Projects** — **GSAP horizontal pin** (vertical scroll → horizontal travel), 3D card tilt, image zoom
- [x] **Stats** — count-up numbers, achievement timeline, availability badge
- [x] **Footer** — curtain/unveil reveal, big marquee text, social links
- [x] **Navbar** — scroll progress bar, active section tracking, "Hire Me" CTA
- [x] **Custom Cursor** — magnetic, shrinks on click, expands on links (desktop only)
- [x] **Mobile Safe** — all heavy GSAP animations disabled via `matchMedia` on ≤768px

### Admin Panel
- [x] Login with mock auth + shake animation on failure
- [x] Dashboard: grid + list view toggle
- [x] Stats strip (total, featured, this year, categories)
- [x] Add project with live image URL preview
- [x] Edit existing project
- [x] Delete with confirm modal
- [x] Real-time sync to portfolio via `ProjectContext`
- [x] `localStorage` persistence across refreshes

---

## 🎨 Design System

| Token         | Value       | Usage                      |
|---------------|-------------|----------------------------|
| `--void`      | `#0B0B0B`   | Main background            |
| `--void-light`| `#121212`   | Cards, admin panels        |
| Cyber Lime    | `#CCFF00`   | Primary accent, CTAs       |
| Electric Blue | `#00E5FF`   | Glitch secondary           |
| Bebas Neue    | Display     | All headlines / titles     |
| Space Mono    | Monospace   | Labels, tags, UI text      |
| DM Sans       | Body        | Descriptions, paragraphs   |

---

## ⚙️ Customization

### Personal Info
- **Hero text, stats** → `src/components/sections/HeroSection.jsx`
- **Bio, skills** → `src/components/sections/AboutSection.jsx`
- **Services** → `src/components/sections/ServicesSection.jsx`
- **Social links, email** → `src/components/sections/FooterSection.jsx`
- **Default projects** → `src/context/ProjectContext.jsx` → `defaultProjects`

### Colors
Edit `tailwind.config.js` → `theme.extend.colors` and `src/index.css` → `:root` vars.

### Connect to Real Backend
Replace the mock functions in `ProjectContext.jsx` with API calls:
```js
const addProject = async (data) => {
  const res = await fetch('/api/projects', { method: 'POST', body: JSON.stringify(data) })
  const project = await res.json()
  setProjects(prev => [project, ...prev])
}
```
The component interface is identical — nothing else needs to change.

---

## 📱 Mobile Behaviour

- Custom cursor hidden
- Horizontal scroll → vertical wrap layout  
- Parallax & pin animations disabled
- All other scroll-trigger animations use simplified timing
