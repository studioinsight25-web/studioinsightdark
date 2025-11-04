# Factuur E-mail Systeem Setup

## Overzicht

Het factuur systeem stuurt automatisch facturen naar zowel de klant als naar jullie (administratie) wanneer een betaling succesvol is voltooid.

## Hoe het werkt

1. **Klant betaalt** via Mollie checkout
2. **Mollie webhook** ontvangt de betalingsbevestiging
3. **Order status** wordt geupdate naar `PAID`
4. **Factuur e-mails** worden automatisch verstuurd:
   - **Klant factuur**: Professionele factuur met alle order details
   - **Administratie factuur**: Interne factuur voor jullie administratie

## Environment Variabelen

Voeg deze variabelen toe aan je Vercel environment variables of `.env.local`:

### Vereist (wordt automatisch gebruikt):
- `BREVO_API_KEY` - Brevo API key voor e-mail versturen
- `BREVO_SENDER_EMAIL` - E-mail adres van afzender
- `BREVO_SENDER_NAME` - Naam van afzender (bijv. "Studio Insight")

### Optioneel (voor bedrijfsgegevens op factuur):

```env
# Bedrijfsgegevens (optioneel - standaard waarden worden gebruikt als niet ingesteld)
INVOICE_COMPANY_NAME=Studio Insight
INVOICE_COMPANY_ADDRESS=De Veken 122b
INVOICE_COMPANY_CITY=Opmeer
INVOICE_COMPANY_POSTCODE=1716 KG
INVOICE_COMPANY_COUNTRY=Nederland
INVOICE_COMPANY_VAT=NL123456789B01  # BTW nummer
INVOICE_COMPANY_EMAIL=info@studio-insight.nl  # Waar facturen naartoe gaan
INVOICE_COMPANY_PHONE=+31 20 123 4567
INVOICE_LOGO_URL=https://res.cloudinary.com/dtwjo4vti/image/upload/studio-insight/logo.png  # Logo URL - MUST be HTTPS (Cloudinary recommended)
```

### PDF Generatie (optioneel - voor PDF attachments):

Het systeem ondersteunt **3 verschillende PDF API's** (kies er één):

**Optie 1: Doppio (Aanbevolen - Gratis tier beschikbaar)**
```env
DOPPIO_API_KEY=jouw_doppio_api_key
```
- Registreer op https://doppio.sh
- Gratis tier: 100 PDF's/maand
- Snel en betrouwbaar

**Optie 2: HTMLtoPDF.io (Alternatief)**
```env
HTMLPDF_API_KEY=jouw_htmlpdf_api_key
```
- Registreer op https://htmlpdf.io
- Gratis tier beschikbaar

**Optie 3: Gotenberg (Self-hosted)**
```env
GOTENBERG_URL=https://jouw-gotenberg-instance.com
```
- Open source, zelf hosten
- Geen API key nodig

**Let op:** Als geen PDF API is geconfigureerd, worden facturen **zonder PDF attachment** verstuurd (alleen HTML e-mail met inline logo).

### Standaard Waarden

Als je geen environment variabelen instelt, worden deze standaard waarden gebruikt:
- **Bedrijfsnaam**: "Studio Insight"
- **Factuur e-mail**: Gebruikt `BREVO_SENDER_EMAIL` of "info@studio-insight.nl"
- **Website**: Gebruikt `NEXT_PUBLIC_BASE_URL` of "https://studio-insight.nl"

## Factuur Details

### Klant Factuur bevat:
- **Logo** (HTTPS URL - werkt in alle e-mail clients, inclusief Outlook)
- Factuurnummer (order_number)
- Orderdatum en betaaldatum
- Klantgegevens (naam, email, adres)
- Productenlijst met prijzen
- Totaalbedrag
- Bedrijfsgegevens (jullie gegevens)
- **PDF attachment** (als PDF API is geconfigureerd)

### Administratie Factuur bevat:
- Logo (HTTPS URL)
- Alle klantgegevens
- Order ID en payment ID
- Volledige productenlijst
- Totaalbedrag
- Markering als "ADMIN" factuur

### PDF Attachment:
- Automatisch gegenereerd van klant factuur HTML
- Wordt meegestuurd als attachment aan:
  - Klant factuur e-mail
  - Kopie factuur naar info@studio-insight.nl
- Bestandsnaam: `Factuur_[ORDERNUMMER].pdf`

## Testen

1. Maak een test order aan
2. Voltooi de betaling via Mollie
3. Check de logs in Vercel voor:
   - `✅ Invoice emails sent for order [orderId]`
4. Check beide e-mail inboxen:
   - Klant e-mail (gebruikt voor test)
   - Administratie e-mail (INVOICE_COMPANY_EMAIL)

## Troubleshooting

### Facturen worden niet verstuurd

1. **Check Brevo configuratie**:
   - `BREVO_API_KEY` is ingesteld
   - `BREVO_SENDER_EMAIL` is geverifieerd in Brevo
   - Sender email is niet geblokkeerd

2. **Check logs**:
   - Zoek naar `[Invoice]` in Vercel logs
   - Check voor error messages

3. **Check order data**:
   - Order moet status `PAID` hebben
   - Order moet `order_number` bevatten
   - Order items moeten `product_name` bevatten

### Factuur ontbreekt gegevens

- **Ontbrekende klantgegevens**: Check of user profiel volledig is ingevuld
- **Ontbrekende producten**: Check of `order_items` table `product_name` bevat
- **Ontbrekende bedrijfsgegevens**: Voeg environment variabelen toe

## Aanpassen Factuur Design

Factuur templates staan in `lib/invoice.ts`:
- `generateCustomerInvoiceHTML()` - Klant factuur template
- `generateAdminInvoiceHTML()` - Administratie factuur template

Je kunt de HTML/CSS aanpassen naar jullie huisstijl.

## Automatische Verzending

Facturen worden **automatisch** verstuurd wanneer:
- Mollie webhook bevestigt dat betaling is gelukt
- Order status wordt geupdate naar `PAID`
- Dit gebeurt in `app/api/payment/webhook/route.ts`

Je hoeft niets handmatig te doen!

## Logo Setup (BELANGRIJK)

Het logo moet worden geüpload naar een publiekelijk toegankelijke HTTPS URL (bijvoorbeeld Cloudinary).

**Stap 1: Upload logo naar Cloudinary**
1. Ga naar https://console.cloudinary.com
2. Upload je logo naar de folder `studio-insight/logo.png`
3. Kopieer de **secure_url** van de geüploade afbeelding

**Stap 2: Stel INVOICE_LOGO_URL in**
Voeg deze environment variable toe in Vercel. Je kunt **twee opties** gebruiken:

**Optie 1: Cloudinary public_id (eenvoudigst)**
```
INVOICE_LOGO_URL=studio-insight/logo
```
De code genereert automatisch de HTTPS URL: `https://res.cloudinary.com/dtwjo4vti/image/upload/studio-insight/logo`

**Optie 2: Volledige HTTPS URL**
```
INVOICE_LOGO_URL=https://res.cloudinary.com/dtwjo4vti/image/upload/studio-insight/logo.png
```

**Belangrijk:**
- ❌ **GEEN** lokale URLs (zoals `/logo.png`) - werken NIET in e-mails
- ❌ **GEEN** base64 inline - werkt NIET in Outlook
- ✅ **WEL** HTTPS URLs (Cloudinary, CDN, etc.) - werken in alle e-mailclients

**Waarom?**
- Outlook blokkeert base64 inline afbeeldingen
- Lokale URLs zijn niet toegankelijk vanuit e-mailclients
- Alleen publiekelijk toegankelijke HTTPS URLs werken betrouwbaar

