# Factuur Automatisch Systeem - Studio Insight

## ✅ Volledige Functionaliteit Overzicht

### 1. **Automatische Factuur Verzending**
- ✅ **Webhook integratie**: Na succesvolle betaling via Mollie wordt automatisch een factuur verzonden
- ✅ **Locatie**: `app/api/payment/webhook/route.ts` (regel 91-103)
- ✅ **Wanneer**: Direct na bevestiging van betaling (status = 'paid')
- ✅ **Emails verzonden**:
  - Customer factuur (naar klant)
  - Admin factuur (naar info@studio-insight.nl)
  - Customer copy (kopie naar info@studio-insight.nl)

### 2. **Factuurnummer Format**
- ✅ **Format**: `SI-{timestamp}-{random}`
- ✅ **Voorbeeld**: `SI-1762351457135-ABC123XYZ`
- ✅ **Locatie**: 
  - Order nummer: `lib/orders-database.ts` (regel 33)
  - Factuur nummer: `lib/invoice.ts` (regel 583)

### 3. **BTW Berekenen en Weergave**
- ✅ **BTW Percentage**: 21%
- ✅ **Prijzen**: Alle prijzen in database zijn **INCLUSIEF BTW** (in cents)
- ✅ **Factuur toont**:
  - Subtotaal (excl. BTW)
  - BTW (21%)
  - Totaal (incl. BTW)
- ✅ **Locatie**: `lib/invoice.ts` (regel 574-579, 325-338)

### 4. **Prijs Systeem**
- **Product prijzen**: Opgeslagen in **cents** (bijv. 9900 = €99,00)
- **Database velden**: DECIMAL(10,2) - prijzen worden als nummers opgeslagen
- **Conversie**: Bij weergave wordt gedeeld door 100
- **BTW**: Prijzen zijn inclusief BTW, wordt achteraf berekend voor factuur

### 5. **Factuur Flow**

```
1. Klant koopt product → Order aangemaakt
   └─ Order nummer: SI-{timestamp}-{random}
   └─ Status: PENDING
   └─ Prijzen opgeslagen in cents (inclusief BTW)

2. Klant betaalt via Mollie
   └─ Mollie webhook wordt aangeroepen
   └─ Payment status: PAID

3. Webhook verwerkt betaling
   └─ Order status → PAID
   └─ sendInvoiceEmails(order.id) wordt aangeroepen
   └─ Factuur wordt gegenereerd met BTW breakdown

4. Emails worden verzonden
   └─ Customer: Factuur met PDF bijlage
   └─ Admin: Interne factuur + Customer copy
```

### 6. **Test Endpoints**

#### Test Invoice (met echte producten):
```
GET https://studio-insight.nl/api/test-invoice?email=remco@kaas-plaza.nl
```
- Gebruikt echte producten uit database
- 1 cursus wordt gebruikt
- BTW wordt correct berekend

#### Factuur voor bestaande order:
```
GET https://studio-insight.nl/api/invoice/send?orderNumber=SI-...&email=remco@kaas-plaza.nl
```
- Zoekt order op basis van ordernummer of ID
- Genereert factuur met echte order data
- Verstuurt test email

### 7. **Factuur Details**

#### Customer Factuur bevat:
- Studio Insight logo (HTTPS URL)
- Factuurnummer (SI-...)
- Klantgegevens
- Producten lijst met prijzen
- **BTW Breakdown**:
  - Subtotaal (excl. BTW)
  - BTW (21%)
  - Totaal (incl. BTW)
- Betalingsbevestiging
- PDF bijlage (als geconfigureerd)

#### Admin Factuur bevat:
- Zelfde informatie als customer factuur
- Extra: Admin badge
- Interne administratieve informatie

### 8. **Environment Variables Vereist**

```bash
# Email (Brevo)
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=info@studio-insight.nl
BREVO_SENDER_NAME=Studio Insight

# Company Details (voor facturen)
INVOICE_COMPANY_NAME=Studio Insight
INVOICE_COMPANY_ADDRESS=De Veken 122b
INVOICE_COMPANY_CITY=Opmeer
INVOICE_COMPANY_POSTCODE=1716 KG
INVOICE_COMPANY_COUNTRY=Nederland
INVOICE_COMPANY_VAT=NL123456789B01  # BTW nummer
INVOICE_COMPANY_EMAIL=info@studio-insight.nl

# Logo (Cloudinary of HTTPS URL)
INVOICE_LOGO_URL=https://res.cloudinary.com/.../studio-insight/logo
# OF
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# PDF Generation (optioneel)
DOPPIO_API_KEY=...  # OF
HTMLPDF_API_KEY=...  # OF
GOTENBERG_URL=...
```

### 9. **Error Handling**

- ✅ Webhook faalt niet als factuur verzenden mislukt
- ✅ Errors worden gelogd in Vercel logs
- ✅ Fallback: Als order niet gevonden wordt, probeert webhook metadata
- ✅ PDF generatie is optioneel (email werkt zonder PDF)

### 10. **Logging**

Controleer Vercel logs voor:
- ✅ `✅ Invoice emails sent for order [orderId]` - Succes
- ⚠️ `⚠️ Invoice emails partially sent` - Gedeeltelijk succes
- ❌ `❌ Error sending invoice emails` - Fout

### 11. **Testing Checklist**

- [x] Order nummer begint met "SI-"
- [x] Factuur nummer begint met "SI-"
- [x] BTW wordt correct berekend (21%)
- [x] BTW breakdown wordt getoond in factuur
- [x] Automatische verzending na betaling werkt
- [x] Test endpoints werken
- [x] Echte producten worden gebruikt in test invoices
- [x] PDF generatie werkt (als geconfigureerd)
- [x] Email verzending werkt via Brevo

### 12. **Bekende Issues / Verbeteringen**

1. **Prijzen in database**: Opgeslagen in cents in DECIMAL veld (werkt maar niet ideaal)
2. **PDF generatie**: Vereist externe API (DOPPIO_API_KEY of HTMLPDF_API_KEY)
3. **Logo URL**: Moet HTTPS zijn voor email clients (Outlook blokkeert base64)

### 13. **Toekomstige Verbeteringen**

- [ ] Factuur nummer sequentieel maken (SI-0001, SI-0002, etc.)
- [ ] Factuur nummer database tabel voor tracking
- [ ] Factuur herverzenden functionaliteit
- [ ] Factuur download vanuit dashboard
- [ ] Factuur preview voor betaling

