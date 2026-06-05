# Claude Code Build Prompt — Egyptian Canadian Company Website

> **How to use this file:** Open Claude Code in your project folder and paste everything below
> (from "PROJECT BRIEF" onward) as your first message. Claude Code will scaffold the whole site.
> Keep this file in your repo as `BUILD_SPEC.md` for reference.

---

PROJECT BRIEF
=============

Build a complete, production-ready, **static multilingual website** for an agricultural import/export
company called **Egyptian Canadian Company (EC / ECC)**. This is a rebuild of a previous brochure
site (ec-egypt.com) that was taken offline. All original content is provided below verbatim. The new
site must be cleaner, faster, mobile-first, and — critically — **fully indexable by Google** (the old
site had SEO problems; do NOT repeat them).

The site will be hosted on **GitHub Pages**, so it must be 100% static (no server/backend, no database).

---

TECH STACK & CONSTRAINTS
========================

- Plain **HTML5 + CSS3 + vanilla JavaScript** only. No build step required, no frameworks.
  (If you prefer, you may use a tiny static generator, but the published output must be plain static files that GitHub Pages serves directly.)
- Mobile-first, fully responsive (breakpoints: 480px, 768px, 1024px, 1280px).
- No external paid dependencies. Google Fonts is allowed.
- All internal links must be **relative** so the site works on a GitHub Pages subpath
  (e.g. `username.github.io/ec-egypt/`) AND on a custom domain.
- Total page weight target: under 1.5 MB per page (compress images).
- Must pass Lighthouse with 90+ on Performance, Accessibility, Best Practices, and SEO.

---

REPOSITORY STRUCTURE
====================

```
/
├── index.html              # Home
├── about.html              # About Us + Team
├── products.html           # Products catalogue
├── contact.html            # Contact + form
├── css/
│   └── style.css           # All styles (single file is fine)
├── js/
│   └── main.js             # Nav toggle, counters, testimonial slider
├── images/
│   ├── logo.png
│   ├── logo_footer.png
│   ├── hero_1.jpg
│   ├── pics/               # team photos
│   ├── person_1.jpg ... person_4.jpg   # testimonial avatars
│   └── products2/          # product photos (12 items)
├── robots.txt              # MUST allow all crawlers
├── sitemap.xml             # list all 4 pages
├── site.webmanifest
├── favicon.ico
├── CNAME                   # (only if using a custom domain)
└── BUILD_SPEC.md           # this file
```

> **Images note:** The actual product/team photos are downloaded separately (via the provided
> `Download-Images.bat` script). Place them in `images/` following the same paths. Until the real
> photos are added, generate tasteful placeholder boxes with the product name so the layout is testable.

---

DESIGN SYSTEM
=============

Professional, trustworthy, food-trade aesthetic. Clean and modern, NOT cluttered.

**Color palette** (CSS variables in :root):
```css
--color-primary:   #1B5E3F;   /* deep agricultural green */
--color-primary-d: #123F2A;   /* darker green for hovers */
--color-accent:    #C9A227;   /* warm gold */
--color-ink:       #1A1A1A;   /* body text */
--color-muted:     #6B6B6B;   /* secondary text */
--color-bg:        #FFFFFF;
--color-bg-soft:   #F6F3EC;   /* warm off-white section background */
--color-line:      #E5E0D5;   /* borders */
```
(You may refine these, but keep a green + gold professional direction.)

**Typography:**
- Headings: `'Playfair Display', serif` (elegant, premium).
- Body & UI: `'Inter', sans-serif`.
- Arabic text: `'Cairo', 'Tajawal', sans-serif` with `direction: rtl` applied only to Arabic blocks.
- Base font size 16px, line-height 1.6, generous heading sizes.

**Components to build:**
- Top contact bar (thin strip above header): phone, WhatsApp link, "Have a question?"
- Sticky header: logo left, nav center/right (Home, About, Products, Contact), mobile hamburger.
- Hero sections with a heading, short subheading, and a primary CTA button.
- Animated stat counters (count up on scroll).
- Service cards (3-up grid, icon + title + text).
- Team grid (responsive cards: photo, name, role).
- Product grid (responsive cards: photo, Arabic name, English name).
- Testimonial slider (auto-rotating, with manual dots/arrows).
- CTA banner ("We Are Here For You!").
- Footer: logo, short blurb, product links, contact links, copyright.

**Buttons:** solid gold primary, outlined secondary, rounded 6px, hover transitions.
**Spacing:** consistent 8px scale. Sections padded ~80px top/bottom on desktop, ~48px on mobile.
**Animations:** subtle fade/slide-in on scroll. Keep it elegant, not flashy.

---

GLOBAL ELEMENTS (every page)
============================

**Top contact bar:**
- Text: "Have a question?"
- Phone: `01009577227` → link `tel:+201009577227`
- WhatsApp: link `https://api.whatsapp.com/send?phone=201061130918`

**Header navigation:**
- Logo links to `index.html`
- Menu: Home | About | Products | Contact
- Products menu can have a dropdown with: Red lentils, Lupine, Faba bean, Popcorn, Black-eyed beans (all linking to `products.html`)

**Footer:**
- Footer logo + blurb: "One of the top food import and export companies in Egypt."
- "Products" column: Red lentils, Lupine, Faba bean, Popcorn, Black-eyed beans
- "Contact" column: Phone, Email, WhatsApp
- Social: Facebook `https://www.facebook.com/basalfactory`, Location `https://goo.gl/maps/5za31Y7hW6uAE3yUA`
- Copyright line: "© Egyptian Canadian Company. All rights reserved."

---

PAGE 1 — HOME (index.html)
==========================

**<title>:** Egyptian Canadian Company | Pulses Import & Export in Egypt
**meta description:** Egyptian Canadian Company (EC) imports and exports world pulses — lentils, chickpeas, faba beans and more — to wholesalers and food manufacturers in Egypt and beyond.

**Hero section:**
- Heading: "Egyptian Canadian Company"
- Subheading: "One of the top food import and export companies in Egypt."
- CTA button: "Our Products" → products.html
- Background: hero_1.jpg with a dark green overlay for text contrast.

**About teaser section:**
- Small label: "About Us"
- Heading: "Egyptian Canadian Company (EC)"
- Paragraph: "EC is an Egyptian importing company bringing world pulses to wholesalers and food manufacture in Egypt and surrounding countries."
- Three pill badges: Import · Export · Trading in food manufacture
- "Read details" button → about.html

**Stats counter section** (animated count-up):
- 10,700 — Number of Clients
- 82 — Years of Experience
- 80 — Employees
- 5,300 — Cups of Coffee

**Services section** ("What We Do", 3 cards):
1. **Food Industry** — "Food industry from farming and food production, packaging and distribution, to retail and catering."
2. **Importing Food Products** — "We import food in Egypt and surrounding countries."
3. **Exporting Food** — "Exporting food from Egypt and other surrounding countries."

**CTA banner:**
- Heading: "We Are Here For You!"
- Text: "Contact or visit us and we'll be happy to work together."
- Button: "Contact Us" → contact.html

**Testimonials section** (use the 4 testimonials listed in the ABOUT page section below).

---

PAGE 2 — ABOUT (about.html)
===========================

**<title>:** About Us | Egyptian Canadian Company
**meta description:** Meet the team behind Egyptian Canadian Company — decades of international pulse-trade experience serving food manufacturers across Egypt and the region.

**Page hero:** Heading "About Us", small breadcrumb Home / About.

**Intro — "Egyptian Canadian Company (EC)":**
"EC: is an Egyptian importing company bringing world pulses to wholesalers and food manufacture in Egypt and surrounding countries."
Badges: Import · Export · Trading in food manufacture

**Stats** (same four counters as home).

**"Our Team" section intro:**
"Our team collectively has international trade experience and accord careful personal attention for every shipment. We have exceptional procedures in place to facilitate efficient movement of farm product to the end user. Our team can directly take care of your specific requirements and all necessary documentation to meet our customer needs."

**Team grid** (photo / name / role) — image files in `images/pics/`:
| Name | Role | Photo |
|------|------|-------|
| Gamal Basal | Owner | pics/GamalBasal.jpg |
| Mohsen Basal | Owner | pics/MohsenBasal.jpg |
| Mohamed Mohsen | Board of Directors | pics/MohamedMohsen.jpg |
| Ahmed Mohsen | Board of Directors | pics/AhmedMohsen.jpg |
| Abelrahman Gamal | Board of Directors | pics/AbelrahmanGamal.jpg |
| Mohamed Essily | Manager | pics/MohamedEssily.jpg |
| Hesham Ageez | Sales | pics/HeshamAgeez.jpg |

**CTA banner:** "We Are Here For You! Contact or visit us and we'll be happy to work together." → Contact Us.

**Testimonials section** ("Happy Clients") — image files `images/person_X.jpg`:

1. **R&D Manager — International Food Manufacturer** (person_1.jpg)
"ECC are pleasant to deal with and have great customer focus. They have a varied product offering with an innovative portfolio and are pro active, speedy and innovative in offering bespoke products, very reactive and expert support given to facilitate specific requirements. Excellent NPD product turn around and delivery to fulfil last minute trial requests or deadlines."

2. **Kristian Hansen — Area Sales Manager, Alsiano A/S** (person_2.jpg)
"We have experienced very high knowhow from ECC in suggesting and providing our customers with the right solution adapted to any specific request. We get very quick and professional replies to requests and ECC provide us with very good sample kits which allow us to present ECC products in a professional manner. ECC key contacts have a very professional, friendly and positive attitude, this makes our working day a little more easier and better."

3. **Purchasing Manager — Sweden** (person_4.jpg)
"ECC are a very flexible supplier who will do its best to keep their customers happy they present many good new product ideas, innovative flavours and colours. ECC is very responsive to its customers wishes and will do everything in their power to match what the customer needs for its project, they are always on time and willing to co-operate – You are my favourite supplier!"

4. **R&D department — Food Company** (person_3.jpg)
"ECC are a great company to work with, friendly and efficient. With a great product range, ECC can always supply me several inclusions samples to choose from so that I can choose the best one for my application. ECC are always willing to look at developing specific inclusions for my requirements. Top quality inclusions delivered on time with no extra fuss."

---

PAGE 3 — PRODUCTS (products.html)
=================================

**<title>:** Our Products | Egyptian Canadian Company
**meta description:** Browse our pulses range — chickpeas, lentils, faba beans, lupine and more — available for wholesale and food manufacture.

**Page hero:** Heading "Our Products".

**Product grid** — responsive cards, each showing the product photo, the **Arabic name (large)** and the **English name (smaller, muted)** beneath. Photos in `images/products2/`:

| # | Arabic name | English name | Image file |
|---|-------------|--------------|-----------|
| 1 | أرز بسمتي | Basmati Rice | products2/01-basmati-rice.jpeg |
| 2 | ترمس | Lupine | products2/02-lupine-tirmis.jpeg |
| 3 | حمص 10 ملم | Chickpeas 10 mm | products2/03-chickpeas-10mm.jpeg |
| 4 | حمص 14 ملم | Chickpeas 14 mm | products2/04-chickpeas-14mm.jpeg |
| 5 | حمص | Chickpeas | products2/05-chickpeas.jpeg |
| 6 | عدس اصفر مجروش | Yellow Split Lentils | products2/06-yellow-split-lentils.jpeg |
| 7 | عدس بجبه | Whole Lentils | products2/07-whole-lentils.jpeg |
| 8 | فول استرالي عريض | Australian Faba Bean (Wide) | products2/08-australian-faba-wide.jpeg |
| 9 | فول استرالي | Australian Faba Bean | products2/09-australian-faba.jpeg |
| 10 | فول انجليزي | English Faba Bean | products2/10-english-faba.jpeg |
| 11 | فول ليتواني | Lithuanian Faba Bean | products2/11-lithuanian-faba.jpeg |
| 12 | فول مجروش | Split Faba Bean | products2/12-split-faba.jpeg |

Apply `dir="rtl"` and the Arabic font to the Arabic name element so it renders correctly.
Add an "Inquire" / WhatsApp button on each card linking to the WhatsApp number with a prefilled
message like: `https://api.whatsapp.com/send?phone=201061130918&text=I'm interested in [Product]`.

---

PAGE 4 — CONTACT (contact.html)
===============================

**<title>:** Contact Us | Egyptian Canadian Company
**meta description:** Get in touch with Egyptian Canadian Company for pulse supply, quotes, and partnership inquiries.

**Page hero:** Heading "Contact us".

**Contact form** — fields: First Name, Last Name, Email Address, Tel. Number, Message, + Send button.
> Since this is a static site with no backend, wire the form using **Formspree** (or similar) —
> add a clear `<!-- TODO: replace with your Formspree endpoint -->` comment. As a fallback, also show
> a "Send via WhatsApp" button that opens WhatsApp with the message.

**Contact details block:**
- Phone: 01009577227 (`tel:+201009577227`)
- WhatsApp: +20 106 113 0918
- Facebook: facebook.com/basalfactory
- Location: embed a Google Map or link to `https://goo.gl/maps/5za31Y7hW6uAE3yUA`

---

SEO REQUIREMENTS (CRITICAL — DO NOT SKIP)
=========================================

The old site was invisible to Google. The new one must be fully indexable:

1. **robots.txt** must ALLOW all crawlers:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://YOUR-DOMAIN/sitemap.xml
   ```
2. **NO `noindex` / `nofollow`** meta tags anywhere. Do not add them.
3. Every page: unique `<title>` and `<meta name="description">` (provided above).
4. **sitemap.xml** listing all 4 pages.
5. **Open Graph + Twitter Card** meta tags on every page (og:title, og:description, og:image, og:url, og:type).
6. **JSON-LD structured data** on the home page using schema.org `Organization` (name: Egyptian Canadian Company, url, logo, telephone +201009577227, sameAs Facebook, address Egypt).
7. Semantic HTML5: one `<h1>` per page, proper `<header>/<nav>/<main>/<section>/<footer>`, descriptive `alt` text on every image.
8. Canonical `<link rel="canonical">` on every page.
9. `lang="en"` on the html element; mark Arabic inline blocks with `lang="ar" dir="rtl"`.
10. Fast loading: lazy-load below-the-fold images (`loading="lazy"`), compress images.

---

ACCESSIBILITY & QUALITY
=======================
- All interactive elements keyboard-accessible; visible focus states.
- Color contrast AA minimum.
- `aria-label`s on icon-only buttons (hamburger, slider arrows, social icons).
- Forms have associated `<label>`s.
- Test at 320px width — no horizontal scroll.

---

DEPLOYMENT — GITHUB PAGES
=========================

After building, set up deployment:

1. Initialize the repo and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial build: Egyptian Canadian Company website"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
2. In the GitHub repo: **Settings → Pages → Source = Deploy from a branch → main / root → Save.**
3. The site goes live at `https://USERNAME.github.io/REPO/` within ~1 minute.
4. **Custom domain (optional):** add a `CNAME` file containing your domain (e.g. `ec-egypt.com`),
   then point your domain's DNS (A records to GitHub Pages IPs + a CNAME for www) at GitHub.
   Enable "Enforce HTTPS" in Pages settings.

Provide me with a short README at the end explaining how to (a) add the real images,
(b) connect the contact form (Formspree), and (c) attach a custom domain.

---

BUILD ORDER
===========
1. Scaffold folder structure + shared CSS variables + header/footer partials.
2. Build index.html fully (it exercises most components).
3. Reuse components for about, products, contact.
4. Add robots.txt, sitemap.xml, manifest, favicon, JSON-LD.
5. Run a Lighthouse pass and fix anything under 90.
6. Write the README and the git/GitHub Pages deployment steps.

Start now. Ask me only if something is genuinely ambiguous; otherwise use sensible defaults and proceed.
