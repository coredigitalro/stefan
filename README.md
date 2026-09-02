# Ștefan Sisteme Acoperiș — site

## Ce conține
- `index.html`, `style.css`, `script.js`, `favicon.svg`
- `robots.txt`, `sitemap.xml` (SEO)
- `assets/img/` — poze reale de pe șantier
- `assets/video/` — filmări + poster frames

## Înainte de publicare
Înlocuiește `DOMENIUL-TAU.ro` cu domeniul real în `robots.txt` și `sitemap.xml`:

    sed -i 's/DOMENIUL-TAU\.ro/domeniul-real.ro/g' robots.txt sitemap.xml

Și în `index.html`, la `<link rel="canonical">` și `og:url` (momentan placeholder `stefansistemeacoperis.ro` — actualizează cu domeniul real cumpărat).

## Formularul de contact
Momentan e doar validare + confirmare vizuală (nu trimite email).
Pentru trimitere reală: Formspree, Web3Forms sau un webhook — se modifică blocul
`/* ============ formular ============ */` din `script.js`.

## Deploy (Vercel)
1. Push pe GitHub
2. Vercel → Add New Project → Import repo
3. Framework Preset: **Other** (fără build command)
4. Settings → Domains → adaugi domeniul
