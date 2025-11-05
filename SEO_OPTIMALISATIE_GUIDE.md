# SEO & Geo-Optimalisatie Guide - Studio Insight

## ✅ Geïmplementeerde SEO Functionaliteiten

### 1. **Structured Data (JSON-LD)**
- ✅ **Organization Schema**: Bedrijfsinformatie voor Google
- ✅ **LocalBusiness Schema**: Geo-targeting voor Nederland (Opmeer)
- ✅ **Product Schema**: Voor alle cursussen, e-books en reviews
- ✅ **Course Schema**: Specifiek voor cursussen
- ✅ **Book Schema**: Specifiek voor e-books
- ✅ **Breadcrumb Schema**: Navigatie structuur
- ✅ **Website Schema**: Zoekfunctionaliteit

**Locatie**: `lib/seo.ts`, `components/StructuredData.tsx`

### 2. **Dynamic Sitemap**
- ✅ Alle actieve producten automatisch in sitemap
- ✅ Prioriteiten gebaseerd op product type en featured status
- ✅ LastModified dates uit database
- ✅ Change frequency per pagina type

**Locatie**: `app/sitemap.ts`

### 3. **Meta Tags Optimalisatie**
- ✅ Dynamische meta titles per product
- ✅ Dynamische meta descriptions (max 160 karakters)
- ✅ Keywords generatie per product
- ✅ Open Graph tags voor social media
- ✅ Twitter Card tags
- ✅ Canonical URLs
- ✅ Geo-targeting meta tags (Nederland)

**Locatie**: `app/products/[id]/metadata.ts`, `lib/metadata.ts`

### 4. **Geo-Optimalisatie voor Nederland**
- ✅ **hreflang tags**: `nl-NL` en `nl` geconfigureerd
- ✅ **LocalBusiness Schema**: Adres, coordinaten, geo-targeting
- ✅ **Geo meta tags**: `geo.region`, `geo.placename`, `geo.position`
- ✅ **Locale settings**: `nl_NL` voor Open Graph
- ✅ **Nederlandse keywords**: "online cursussen nederland", "e-learning nederland"

**Locatie**: `lib/seo.ts`, `lib/metadata.ts`

### 5. **Robots.txt Optimalisatie**
- ✅ Admin, dashboard en API routes geblokkeerd
- ✅ Product pagina's toegankelijk
- ✅ AI bots geblokkeerd (GPTBot, ChatGPT, Claude)
- ✅ Googlebot heeft toegang tot public content
- ✅ Sitemap referentie

**Locatie**: `app/robots.ts`

### 6. **Breadcrumbs**
- ✅ Visuele breadcrumb navigatie
- ✅ Structured data voor breadcrumbs
- ✅ Accessibility verbeteringen

**Locatie**: `components/Breadcrumbs.tsx`

## 📊 SEO Best Practices Geïmplementeerd

### Technical SEO
1. ✅ **Canonical URLs**: Elke pagina heeft unieke canonical
2. ✅ **XML Sitemap**: Automatisch gegenereerd met alle producten
3. ✅ **Robots.txt**: Correct geconfigureerd
4. ✅ **Structured Data**: Volledige Schema.org implementatie
5. ✅ **Meta Tags**: Compleet en dynamisch
6. ✅ **Image Alt Tags**: In product afbeeldingen

### Content SEO
1. ✅ **Dynamische Descriptions**: Per product gegenereerd
2. ✅ **Keywords**: Automatisch gegenereerd op basis van product data
3. ✅ **Titles**: Optimalisatie (max 60 karakters)
4. ✅ **Descriptions**: Optimalisatie (max 160 karakters)

### Local SEO
1. ✅ **Nederlandse Locale**: `nl_NL` overal
2. ✅ **Adres Schema**: Volledige adresinformatie
3. ✅ **Geo Coordinates**: Opmeer coordinaten
4. ✅ **Nederlandse Keywords**: In metadata

### Performance SEO
1. ✅ **Next.js Image Optimization**: Automatisch
2. ✅ **Server Components**: Waar mogelijk
3. ✅ **Dynamic Imports**: Voor betere performance

## 🔧 Environment Variables Vereist

```bash
# Base URL (moet HTTPS zijn voor productie)
NEXT_PUBLIC_BASE_URL=https://studio-insight.nl

# Google Search Console Verification
GOOGLE_SITE_VERIFICATION=your-verification-code-here
```

## 📝 Te Verificeren in Google Search Console

1. **Sitemap Indienen**:
   - URL: `https://studio-insight.nl/sitemap.xml`
   - Indienen in Google Search Console

2. **Structured Data Testen**:
   - Google Rich Results Test: https://search.google.com/test/rich-results
   - Test elke product pagina

3. **Mobile-Friendly Test**:
   - Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly

4. **PageSpeed Insights**:
   - Test alle belangrijke pagina's
   - URL: https://pagespeed.web.dev/

## 🎯 Toekomstige Verbeteringen

### Korte Termijn
- [ ] Google Search Console setup
- [ ] Google Analytics Enhanced E-commerce events
- [ ] Open Graph afbeeldingen genereren per product
- [ ] FAQ Schema toevoegen aan relevante pagina's

### Lange Termijn
- [ ] Blog/artikelen sectie voor content marketing
- [ ] User reviews met Review Schema
- [ ] Video content met VideoObject Schema
- [ ] Multi-language support (als nodig)
- [ ] AMP pages voor mobile

## 📈 SEO Monitoring

### Belangrijke Metrics
1. **Organic Traffic**: Google Analytics
2. **Keyword Rankings**: Google Search Console
3. **Click-Through Rate (CTR)**: Google Search Console
4. **Average Position**: Google Search Console
5. **Impressions**: Google Search Console

### Tools
- **Google Search Console**: Gratis, essentieel
- **Google Analytics**: Voor traffic analyse
- **Ahrefs/SEMrush**: Voor keyword research (optioneel)
- **Screaming Frog**: Voor technical SEO audit (optioneel)

## 🔍 Zoekwoord Strategie

### Primary Keywords
- "online cursussen nederland"
- "e-learning nederland"
- "digitale cursussen"
- "ondernemerscursussen"
- "studio cursussen"

### Long-tail Keywords
- "online cursus podcasten nederland"
- "videobewerking cursus online"
- "content strategie cursus"
- "e-book marketing nederland"

### Product-specifieke Keywords
- Per product automatisch gegenereerd in `generateKeywords()`
- Gebaseerd op product naam, type, category, level

## 🚀 Deployment Checklist

- [ ] `NEXT_PUBLIC_BASE_URL` is correct (https://studio-insight.nl)
- [ ] `GOOGLE_SITE_VERIFICATION` is gezet
- [ ] Sitemap.xml is bereikbaar op `/sitemap.xml`
- [ ] Robots.txt is bereikbaar op `/robots.txt`
- [ ] Alle product pagina's hebben structured data
- [ ] Meta tags zijn correct per pagina
- [ ] Images hebben alt tags
- [ ] Canonical URLs zijn correct
- [ ] Geo-targeting meta tags zijn aanwezig

## 📞 Support

Voor vragen over SEO implementatie:
- Check de code in `lib/seo.ts` voor structured data
- Check `app/sitemap.ts` voor sitemap logica
- Check `lib/metadata.ts` voor globale meta tags

