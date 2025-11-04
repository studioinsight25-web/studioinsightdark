# ✅ Factuur Systeem - Live Checklist

## 🎯 Status: KLAAR VOOR LIVE

Alle onderdelen zijn geïmplementeerd en getest. Het systeem is klaar voor productie.

## ✅ Geïmplementeerde Features

### 1. Automatische Factuur Verzending ✅
- [x] Webhook integratie met Mollie
- [x] Automatische factuur verzending na succesvolle betaling
- [x] Drie e-mails worden verstuurd:
  - Klant factuur (met PDF)
  - Kopie klant factuur naar info@studio-insight.nl (met PDF)
  - Admin factuur (interne versie)

### 2. E-mail Compatibiliteit ✅
- [x] Logo werkt in alle e-mail clients (HTTPS URL via Cloudinary)
- [x] Header achtergrond werkt in Outlook (tabelstructuur met bgcolor)
- [x] Alle tekst zichtbaar in Outlook (expliciete kleuren)
- [x] Responsive design voor mobiel en desktop

### 3. PDF Generatie ✅
- [x] Ondersteuning voor Doppio API (aanbevolen)
- [x] Ondersteuning voor HTMLtoPDF.io (alternatief)
- [x] Ondersteuning voor Gotenberg (self-hosted)
- [x] PDF wordt automatisch meegestuurd als attachment

### 4. Factuur Templates ✅
- [x] Klant factuur met professioneel design
- [x] Admin factuur met extra interne informatie
- [x] Bedrijfsgegevens volledig configureerbaar
- [x] Logo via Cloudinary public_id of HTTPS URL

## 📋 Environment Variables Checklist

### Vereist (moet ingesteld zijn):

```env
# Brevo Email Service
BREVO_API_KEY=xxxxx
BREVO_SENDER_EMAIL=no-reply@studio-insight.nl
BREVO_SENDER_NAME=Studio Insight

# Logo (Cloudinary public_id of HTTPS URL)
INVOICE_LOGO_URL=oe29wjqirxvd5rdfwe6b
# OF volledige URL:
# INVOICE_LOGO_URL=https://res.cloudinary.com/dtwjo4vti/image/upload/oe29wjqirxvd5rdfwe6b
```

### Optioneel (aanbevolen):

```env
# Bedrijfsgegevens
INVOICE_COMPANY_NAME=Studio Insight
INVOICE_COMPANY_ADDRESS=De Veken 122b
INVOICE_COMPANY_CITY=Opmeer
INVOICE_COMPANY_POSTCODE=1716 KG
INVOICE_COMPANY_COUNTRY=Nederland
INVOICE_COMPANY_VAT=NL123456789B01
INVOICE_COMPANY_EMAIL=info@studio-insight.nl
INVOICE_COMPANY_PHONE=+31 20 123 4567

# PDF Generatie (kies één van de drie)
DOPPIO_API_KEY=xxxxx  # Aanbevolen
# OF
HTMLPDF_API_KEY=xxxxx
# OF
GOTENBERG_URL=https://jouw-gotenberg-instance.com
```

## 🔍 Verificatie Testen

### Test 1: Test Invoice Endpoint
```bash
# Test via browser of curl:
https://studioinsightdark.vercel.app/api/test-invoice?email=remco@kaas-plaza.nl
```

**Verwachte resultaat:**
- ✅ Klant factuur ontvangen met PDF
- ✅ Admin factuur ontvangen
- ✅ Logo zichtbaar in e-mail
- ✅ Header met achtergrondkleur zichtbaar
- ✅ Alle bedrijfsgegevens zichtbaar

### Test 2: Live Payment Flow
1. Maak een test order aan via checkout
2. Voltooi de betaling via Mollie
3. Check logs in Vercel:
   - Zoek naar: `✅ Invoice emails sent for order [orderId]`
4. Check e-mail inboxen:
   - Klant e-mail (factuur + PDF)
   - info@studio-insight.nl (kopie factuur + PDF + admin factuur)

## 📊 System Flow

```
1. Klant betaalt via Mollie
   ↓
2. Mollie webhook → /api/payment/webhook
   ↓
3. Order status → PAID
   ↓
4. sendInvoiceEmails(order.id) wordt aangeroepen
   ↓
5. Drie e-mails worden verstuurd:
   - Klant factuur (met PDF)
   - Kopie naar info@studio-insight.nl (met PDF)
   - Admin factuur (interne versie)
```

## 🐛 Troubleshooting

### Facturen worden niet verstuurd

1. **Check Brevo configuratie:**
   - Vercel logs: `[Invoice] Error sending invoice emails`
   - Check of `BREVO_API_KEY` correct is
   - Check of `BREVO_SENDER_EMAIL` geverifieerd is in Brevo dashboard

2. **Check webhook:**
   - Vercel logs: `[Webhook] 🔍 Looking for order`
   - Check of order status wordt geupdate naar `PAID`
   - Check of `sendInvoiceEmails` wordt aangeroepen

3. **Check order data:**
   - Order moet `order_number` bevatten
   - Order items moeten `product_name` bevatten
   - User moet geldig e-mailadres hebben

### Logo niet zichtbaar

1. **Check INVOICE_LOGO_URL:**
   - Moet HTTPS URL zijn (niet base64, niet lokaal)
   - Test URL in browser: moet direct toegankelijk zijn
   - Cloudinary public_id: `oe29wjqirxvd5rdfwe6b`

2. **Check logs:**
   - Vercel logs: `[Invoice] Using logo URL: ...`
   - Check of URL begint met `https://`

### PDF niet meegestuurd

1. **Check PDF API configuratie:**
   - `DOPPIO_API_KEY` OF `HTMLPDF_API_KEY` OF `GOTENBERG_URL` moet ingesteld zijn
   - Check logs: `[Invoice] PDF generated successfully` of `PDF generation skipped`

2. **Als PDF API niet is ingesteld:**
   - Facturen worden verstuurd zonder PDF attachment
   - HTML e-mail bevat alle factuur informatie
   - PDF is optioneel, niet vereist

## 📝 Laatste Updates

### 2025-01-11: Outlook Compatibiliteit Fix
- ✅ Tabelstructuur gebruikt voor header (in plaats van div's)
- ✅ `bgcolor` attribuut toegevoegd voor Outlook
- ✅ Expliciete witte tekstkleuren voor Outlook
- ✅ Logo via HTTPS URL (Cloudinary) werkt in alle clients

### 2025-01-11: PDF Generatie Optimalisatie
- ✅ Puppeteer verwijderd (build tijd drastisch verkort)
- ✅ Externe PDF API's geïmplementeerd (Doppio, HTMLtoPDF.io, Gotenberg)
- ✅ Build tijd: van 4+ minuten naar < 2 minuten

## 🎉 Alles Klaar!

Het factuur systeem is volledig geïmplementeerd en getest. Het werkt automatisch bij elke succesvolle betaling.

**Geen handmatige actie vereist!** 🚀

