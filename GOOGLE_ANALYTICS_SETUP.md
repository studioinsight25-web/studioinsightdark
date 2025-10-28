# Google Analytics Setup Instructies

## Stap 1: Google Analytics Account Aanmaken
1. Ga naar [Google Analytics](https://analytics.google.com)
2. Maak een account aan of log in
3. Maak een nieuwe property aan voor je website
4. Kies "Web" als platform
5. Voer je website URL in: `https://studio-insight.nl` (of je lokale URL)

## Stap 2: Measurement ID Ophalen
1. In je Google Analytics dashboard, ga naar "Admin" (tandwiel icoon)
2. Klik op "Data Streams" onder je property
3. Klik op je web stream
4. Kopieer de "Measurement ID" (begint met G-)

## Stap 3: Environment Variable Instellen
1. Open het `.env.local` bestand in je project
2. Vervang `G-XXXXXXXXXX` met je echte Measurement ID
3. Bijvoorbeeld: `NEXT_PUBLIC_GA_ID=G-ABC123DEF4`

## Stap 4: Verificatie
1. Start je development server: `npm run dev`
2. Ga naar je website
3. Open browser developer tools (F12)
4. Ga naar de "Network" tab
5. Zoek naar requests naar `google-analytics.com` of `googletagmanager.com`
6. Als je deze ziet, werkt Google Analytics!

## Stap 5: Admin Analytics Pagina
- Ga naar `/admin/analytics` in je admin panel
- Je zult een groene status indicator zien als Google Analytics correct is geconfigureerd
- De pagina toont nu mock data, maar met een echte GA ID krijg je live data

## Troubleshooting
- **Geen data zichtbaar**: Wacht 24-48 uur voor eerste data
- **CSP errors**: De Content Security Policy is al geconfigureerd voor Google Analytics
- **Environment variable niet gelezen**: Herstart je development server na het wijzigen van .env.local

## Belangrijke Opmerkingen
- De Google Analytics code is al geïntegreerd in je website
- Alle e-commerce events (purchases, add to cart, etc.) zijn al geconfigureerd
- De admin analytics pagina is klaar voor live data zodra je GA ID instelt
