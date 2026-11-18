# ⚡ VoltKart — Next-Gen 3D Interactive Electronics E-Commerce

VoltKart is an award-winning, Awwwards-level 3D e-commerce platform for cutting-edge electronics (Smartphones, Laptops, 4K/8K TVs, Studio Audio, and High-Performance GaN/Thunderbolt Accessories). Built with **Three.js**, **GSAP (ScrollTrigger & Flip)**, **Lenis Smooth Scroll**, and a custom **Real-Time Hardware Compatibility Engine ("Will It Work With My Setup?")**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The site will be live at `http://localhost:5173/`.

### 3. Build for Production
```bash
npm run build
```

---

## 📁 Project Architecture

```
voltkart/
├── index.html                   # Semantic HTML5 single-page application & modal templates
├── package.json                 # Dependencies (Three.js, GSAP, Lenis, Vanilla-Tilt, Confetti)
├── vite.config.js               # Optimized Vite configuration with Rollup manual chunking
├── public/
│   ├── favicon.svg              # Neon SVG brand favicon
│   └── images/
│       └── products/            # 29 custom vector SVG product graphics
├── src/
│   ├── main.js                  # App orchestrator, event delegation, and filter state
│   ├── styles/
│   │   ├── base.css             # CSS reset, typography, CSS variables, dark futuristic theme
│   │   ├── layout.css           # Header, navigation, containers, responsive grid layouts
│   │   ├── components.css       # Cards, drawers, modals, buttons, sliders, comparison matrix
│   │   ├── animations.css       # Glitch, shimmer, rocket trail, keyframes, prefers-reduced-motion
│   │   └── theme.css            # Dark/Light mode theme tokens and circular reveal clip
│   ├── data/
│   │   ├── products.js          # 29 catalog products with detailed hardware specifications
│   │   └── devices.js           # 32 device profiles (16 Phones, 9 Laptops, 7 TVs)
│   └── modules/
│       ├── compatibility.js     # 14-rule compatibility evaluation engine & NLP parser
│       ├── hero3d.js            # Three.js 3D Phone with scroll-scrubbed layer explosion
│       ├── showcase3d.js        # Three.js Pinned 360° Orbit Laptop with SVG spec line draws
│       ├── cart.js              # Slide-in drawer, fly-to-cart Bezier arc, coupon codes, audit
│       ├── wishlist.js          # Wishlist drawer & 14-particle heart burst animation
│       ├── compare.js           # Floating dock & side-by-side spec comparison matrix
│       ├── emi.js               # Interactive EMI calculator with animated tenure sliders
│       ├── dealTimer.js         # 3D mechanical flip countdown timer & stock claim bar
│       ├── statsCounter.js      # ScrollTrigger count-up metric numbers
│       ├── scramble.js          # Cyberpunk text scramble/decode effect on headings
│       ├── liquidDistortion.js  # SVG feTurbulence ripple distortion on image hover
│       ├── floatingShapes.js    # Canvas geometric shards reacting to mouse & scroll speed
│       ├── spotlight.js         # Cursor-following radial spotlight on dark sections
│       ├── myDevicesPanel.js    # Ecosystem profile drawer, scanlines & circular gauge
│       ├── quickview.js         # Morphing modal with specs, gauge & embedded EMI tool
│       ├── search.js            # Smart live search overlay with matched text highlighting
│       ├── recentlyViewed.js    # LocalStorage history tracker & carousel
│       ├── preloader.js         # 0-100% counter, SVG logo draw & curtain reveal
│       ├── theme.js             # Circular reveal theme toggle (View Transition API)
│       ├── cursor.js            # Magnetic dot + trailing ring with "VIEW" & "DRAG" states
│       ├── transitions.js       # Lenis smooth scrolling synced with ScrollTrigger
│       └── toast.js             # Stackable glassmorphic notification system
```

---

## 🛠️ How to Extend

### 1. How to Add a New Product
Open `src/data/products.js` and add an object to the `products` array:

```javascript
{
  id: 'prod-mob-6',
  name: 'Volt Quantum Pro 5G',
  brand: 'VoltKart',
  category: 'Mobiles', // 'Mobiles' | 'Laptops' | 'TVs' | 'Audio' | 'Accessories'
  price: 999,
  oldPrice: 1099,
  rating: 4.9,
  reviews: 340,
  badge: 'Flagship 5G',
  image: '/images/products/phone-quantum.svg',
  description: '6.8-inch Dynamic AMOLED 2X, Snapdragon 8 Gen 3, 65W fast charge.',
  specs: {
    portType: 'USB-C (USB 3.2 Gen 2)',
    chargingWattage: 65,
    fastChargeProtocol: 'USB-PD 3.0 PPS',
    screenSize: '6.8 inches',
    refreshRate: '120Hz LTPO',
    battery: '5000 mAh'
  },
  features: ['Under-display camera', 'Titanium frame', 'Dual stereo speakers']
}
```

*For an Adapter/Cable product, include:*
```javascript
solvesProblem: 'laptop_missing_hdmi_or_usb_a', // Links to compatibility rule recommendations
compatibleTargetTypes: ['laptop', 'phone']
```

---

### 2. How to Add a New Device Profile
Open `src/data/devices.js` and append to `phones`, `laptops`, or `tvs`:

#### Adding a Phone:
```javascript
{
  id: 'phone-pixel-9-pro',
  name: 'Google Pixel 9 Pro',
  brand: 'Google',
  portType: 'USB-C',
  fastChargeWattage: 27,
  headphoneJack: false,
  wirelessCharging: true,
  bluetoothVersion: '5.3',
  releaseYear: 2024
}
```

#### Adding a Laptop:
```javascript
{
  id: 'laptop-zenbook-duo-2024',
  name: 'ASUS Zenbook Duo (2024)',
  brand: 'ASUS',
  ports: {
    usbC: 2,
    thunderbolt4: 2,
    usbA: 1,
    hdmi: 1,
    hdmiVersion: '2.1 TMDS'
  },
  powerInputWattage: 65,
  displaySupport: 'Dual 4K@60Hz'
}
```

---

### 3. How to Add a New Compatibility Rule
Open `src/modules/compatibility.js` and add a new rule function into the `rules` array inside `initRules()`:

```javascript
{
  id: 'rule-vr-headset-bandwidth',
  name: 'VR Headset USB Bandwidth Check',
  check: (prod, { laptop }) => {
    // Check if product is a high-bandwidth VR headset needing DisplayPort over USB-C
    if (prod.category === 'Accessories' && prod.specs?.requiresDisplayPortOverUsbC) {
      if (laptop && !laptop.ports.thunderbolt4 && !laptop.ports.usb4) {
        return {
          status: 'needs_adapter',
          score: 45,
          reason: `Your ${laptop.name} does not support Thunderbolt 4/USB4 DP Alt Mode. Requires an external powered DisplayPort adapter.`,
          recommendedProductId: 'prod-acc-1' // ID of the adapter solving this
        };
      }
    }
    return null; // Return null if rule does not apply
  }
}
```

Each rule returns:
- `status`: `'compatible'` | `'works_with_limits'` | `'needs_adapter'`
- `score`: `0` to `100` (drives the circular compatibility meter)
- `reason`: Friendly plain-English explanation shown on product cards and in quick-view
- `recommendedProductId`: The product ID for the one-click "Add Recommended Adapter" fix

---

## 🎨 Complete Catalog of Animations Implemented

| # | Animation / Motion System | Implementation Details |
|---|---|---|
| 1 | **Preloader Counter & Curtain Reveal** | SVG path dash-offset animation, 0–100% numerical counter, followed by a vertical split-curtain wipe into the site. |
| 2 | **Circular View Transition Theme Toggle** | Sun/Moon rotation and seamless circular clip-path expansion originating directly from the toggle coordinates. |
| 3 | **Interactive Custom Cursor** | Instant cyan dot and lerping trailing glass ring that dynamically morphs into centered **"VIEW"** and **"DRAG"** badges on hover. |
| 4 | **Hero 3D Gadget & Mouse Parallax** | Three.js procedural phone with brushed titanium chassis, 3-lens camera plateau, dynamic canvas screen texture with animated waveforms, dynamic island, and mouse parallax. |
| 5 | **Hero Exploded View on Scroll** | GSAP ScrollTrigger timeline breaking the phone into floating separated layers (receding titanium chassis, forward floating A18 chip, descending battery). |
| 6 | **Hero Orbiting Neon Rings & Starfield** | Double 3D neon cyan and purple torus rings rotating in opposition, accompanied by an ambient 200-particle starfield. |
| 7 | **Hero Text Blur & Scale-Out** | Cinematic scroll-scrubbed fade, scale-down (0.9), and progressive Gaussian blur (`blur(8px)`) as user scrolls out of the hero. |
| 8 | **Cyberpunk Logo Glitch** | Text split with chromatic aberration (cyan & rose color separation) and skew keyframe animation on logo hover. |
| 9 | **Section Text Scramble / Decode** | Cyberpunk matrix glyph decode effect cycling through random characters (`!<>-_\\/[]{}—=+*^?#01`) before resolving left-to-right into the original heading. |
| 10 | **Section Titles Outline-to-Fill** | Dynamic text fill and ambient cyan glow pulse triggered as section headings scroll into view. |
| 11 | **Horizontal Categories Gallery** | 3D tilt cards, glow sweep, mousewheel horizontal scroll mapping, and mouse-drag scrolling. |
| 12 | **Featured Product Deck Fan-Out** | Product cards enter with a staggered playing-card fan spread (`-8°` to `+8°` rotation), snapping cleanly into the grid slots on scroll. |
| 13 | **3D Tilt & Specular Shine Cards** | Vanilla-Tilt 3D card tilt with cursor glare reflection and diagonal shine sweep on hover. |
| 14 | **Liquid / Ripple Distortion on Images** | SVG `feTurbulence` and `feDisplacementMap` filter animating ripple frequency and scale on product card image hover. |
| 15 | **Fly-to-Cart Bezier Arc** | Cloned product thumbnail follows a parabolic cubic-bezier curve from the clicked card into the navbar cart icon, triggering a cart shake and badge pop. |
| 16 | **Cart Confetti Cannon Burst** | Multi-colored celebratory confetti explosion upon adding items to cart or applying discount coupons (`VOLT10`, `CYBER20`, `SUPER50`). |
| 17 | **Wishlist 14-Particle Heart Burst** | Radial spark explosion from the heart button when saving an item to the wishlist. |
| 18 | **Dynamic Number Rolling Totals** | Easing integer roll on cart subtotal, discount, and final total amounts. |
| 19 | **Free Shipping Progress Bar** | Animated fill bar tracking progress toward the $500 free shipping threshold. |
| 20 | **Card Repositioning with GSAP Flip** | Instantaneous yet fluid animation of product cards gliding smoothly into new grid slots during sorting and filtering. |
| 21 | **Quick-View Morph Modal** | Modal scales and expands directly outward from the clicked product card's exact viewport bounding box. |
| 22 | **Circular Compatibility Meter (0–100%)** | Animated SVG circular gauge that fills with a color-coded gradient (Green/Yellow/Red) based on setup synergy score. |
| 23 | **Interactive EMI Slider** | Smooth input range sliders updating monthly installment calculations and color-coded visual breakdowns in real time. |
| 24 | **Pinned 360° 3D Laptop Showcase** | Pinned viewport with 360° camera orbit, dynamic illuminated screen, keyboard deck glow, and orbiting neon rings. |
| 25 | **SVG Spec Callout Line Draws** | Glowing cyan connector lines (`callout-line-svg`) that dynamically draw their stroke paths as specs are introduced during the 3D showcase scroll. |
| 26 | **Showcase Real-Time Colorway Swap** | Instant material recoloring (Space Titanium, Cyber Cyan, Quantum Purple) triggered both during scroll phases and via interactive swatches. |
| 27 | **"Check Your Setup" Ambient Scanlines** | High-voltage neon scanline sweeping across the setup demo card while the plain-English NLP analyzer parses device inputs. |
| 28 | **3D Flip Countdown Timer** | Split-flap 3D card flipping animation on hours, minutes, and seconds as time ticks down. |
| 29 | **Deal Progress Bar Glow** | Animated linear gradient fill indicating 78% claimed flash deal inventory. |
| 30 | **ScrollTrigger Metric Counters** | Numbers count up smoothly on scroll (48,500+ Customers, 29+ Curated Innovations, 140+ Device Profiles, 99.8% Synergy Match). |
| 31 | **Infinite Brand Logo Marquee** | Continuous horizontal loop marquee of verified hardware standards that smoothly pauses/slows on hover. |
| 32 | **Product Comparison Dock & Matrix** | Floating dock slides up with item count; comparison modal displays side-by-side specs with a pulsing `★ BEST VALUE` badge. |
| 33 | **Floating Geometric Cyber Shards** | Canvas overlay with floating polyhedra reacting to mouse parallax and vertical scroll speed. |
| 34 | **Interactive Cursor Spotlight** | Radial lighting mask following the cursor across dark sections to illuminate subtle surface textures. |
| 35 | **Elastic Button Press Feedback** | Tactile scale bounce (`scale(0.92)`) with spring physics on every button press. |
| 36 | **Rocket Launch with Flame Trail** | Back-to-Top rocket button with an animated flickering SVG flame jet that launches upward off-screen when triggered. |
| 37 | **Newsletter Subscribe Button Morph** | Subscribe button morphs to a glowing green checkmark with a celebratory confetti shower upon valid submission. |
| 38 | **Skeleton Shimmer Loading States** | Shimmering gradient loading placeholders for catalog cards. |
| 39 | **Prefers-Reduced-Motion Fallbacks** | Full accessibility support gracefully replacing high-intensity motion with subtle opacity fades when reduced motion is requested. |

---

## 💻 Tech Stack & Dependencies

- **Vite** — High-speed ES module bundler & local dev server
- **Three.js (r160+)** — WebGL 3D rendering for Hero phone and Pinned laptop showcase
- **GSAP (GreenSock) 3.12+** — Core timelines, ScrollTrigger, Flip plugin, and Bezier arcs
- **Lenis** — Hardware-accelerated smooth scrolling
- **Vanilla-Tilt** — Gyroscopic 3D tilt effects with glare highlights
- **Canvas-Confetti** — Physics-based particle confetti showers
- **Google Fonts** — Space Grotesk (Display Headings) & Poppins (Technical Body)

---

## 🔒 State Persistence
All customer selections (Shopping Bag, Wishlist, Saved Hardware Setup, and Recently Viewed History) are persisted to `localStorage` wrapped in resilient `try/catch` handlers with automatic fallback defaults.
