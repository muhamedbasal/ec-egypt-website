# Egyptian Canadian Company — Website (ec-egypt.com)

A clean, fast, mobile-first **static** website for Egyptian Canadian Company (EC / ECC),
an agricultural import/export company specialising in world pulses.

Plain **HTML5 + CSS3 + vanilla JS** — no build step, no backend, no database.
Works as-is on GitHub Pages, Hostinger, or any static host.

## Pages

| File | Page |
|------|------|
| `index.html` | Home |
| `about.html` | About + Team |
| `products.html` | Products catalogue (12 items) |
| `contact.html` | Contact + form |

## Structure

```
/
├── index.html  about.html  products.html  contact.html
├── css/style.css
├── js/main.js
├── images/
│   ├── logo.png  logo_footer.png  hero_1.jpg  hero_2.jpg
│   ├── person_1.jpg … person_4.jpg      (testimonial avatars)
│   ├── products/3.jpg                    (featured packshot)
│   ├── pics/                             (team photos — add these)
│   └── products2/                        (12 product photos — add these)
├── robots.txt  sitemap.xml  site.webmanifest  favicon.ico  CNAME
├── BUILD_SPEC.md
└── README.md
```

## (a) Adding the real images

The hero, logos, testimonial avatars and favicon are the **original recovered images**
from the old site. Two folders still need real photos:

- **Team photos** → `images/pics/` with these exact filenames:
  `GamalBasal.jpg, MohsenBasal.jpg, MohamedMohsen.jpg, AhmedMohsen.jpg,
   AbelrahmanGamal.jpg, MohamedEssily.jpg, HeshamAgeez.jpg`
- **Product photos** → `images/products2/` with these exact filenames:
  `01-basmati-rice.jpeg, 02-lupine-tirmis.jpeg, 03-chickpeas-10mm.jpeg,
   04-chickpeas-14mm.jpeg, 05-chickpeas.jpeg, 06-yellow-split-lentils.jpeg,
   07-whole-lentils.jpeg, 08-australian-faba-wide.jpeg, 09-australian-faba.jpeg,
   10-english-faba.jpeg, 11-lithuanian-faba.jpeg, 12-split-faba.jpeg`

Until those files exist, the cards automatically show a tasteful placeholder box
with the product/person name — nothing breaks. Just drop the files in and commit.
Recommended: square photos (~600×600) for team, ~800×600 for products, optimised < 150 KB.

## (b) Connecting the contact form (Formspree)

1. Create a free form at <https://formspree.io> and copy your form ID.
2. In `contact.html`, find:
   `action="https://formspree.io/f/YOUR_FORM_ID"` and replace `YOUR_FORM_ID`.
3. Done — submissions arrive in your email. A **Send via WhatsApp** button is always
   available as a fallback (it prefills the message from the form fields).

## (c) Custom domain (ec-egypt.com)

The `CNAME` file already contains `ec-egypt.com`.

**GitHub Pages:** Settings → Pages → Source = `main` / root → Save.
Then point DNS at GitHub: four A records to `185.199.108–111.153`, plus a
`www` CNAME to `<username>.github.io`. Enable **Enforce HTTPS**.

**Hostinger / cPanel:** upload all files to `public_html/` (or connect the repo via Git).
Static files are served directly — no Node needed.

## Local preview

Just open `index.html` in a browser, or run any static server, e.g.:

```bash
python -m http.server 8080
```

## SEO

Unique titles + meta descriptions, canonical links, Open Graph / Twitter cards,
`robots.txt` (allow all), `sitemap.xml`, JSON-LD Organization on the home page,
semantic HTML, lazy-loaded images. No `noindex` anywhere.
