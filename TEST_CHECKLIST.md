# 🧪 Studio Insight Test Checklist

## ✅ **Test Prioriteit: HOOG**
Gezien dat er momenteel 0 orders zijn, is het belangrijk om de volledige betalingsflow te testen voordat de site live gaat.

---

## 1️⃣ **Basic Functionaliteit**

### Homepage & Navigatie
- [ ] Homepage laadt zonder errors
- [ ] Alle navigatie links werken
- [ ] Footer links werken
- [ ] Mobile responsive design werkt

### Product Pagina's
- [ ] `/cursussen` pagina toont alle cursussen
- [ ] `/ebooks` pagina toont alle e-books
- [ ] Product detail pagina's laden correct
- [ ] Product afbeeldingen worden geladen

---

## 2️⃣ **Shopping Cart**

### Cart Functionaliteit
- [ ] **Voeg product toe aan winkelwagen** (van product pagina)
- [ ] Winkelwagen icon toont aantal items
- [ ] **Open winkelwagen modal**
- [ ] Items worden correct getoond met prijzen
- [ ] **Verwijder item uit winkelwagen**
- [ ] Totaal prijs wordt correct berekend
- [ ] **Klik "Naar checkout"** werkt

### Cart Persistence
- [ ] Items blijven in winkelwagen na page refresh (localStorage)
- [ ] Items worden verwijderd na checkout start

---

## 3️⃣ **Authentication**

### Registratie
- [ ] Ga naar `/registreren`
- [ ] Vul registratie formulier in
- [ ] Account wordt aangemaakt
- [ ] Automatisch ingelogd na registratie

### Login
- [ ] Ga naar `/inloggen`
- [ ] Login met bestaand account
- [ ] Session wordt opgeslagen
- [ ] Blijf ingelogd na page refresh
- [ ] Logout werkt correct

---

## 4️⃣ **Checkout & Payment (🔥 KRITIEK)**

### Checkout Proces
- [ ] **Log in als gebruiker**
- [ ] **Voeg product toe aan winkelwagen**
- [ ] **Ga naar `/checkout`**
- [ ] Checkout pagina toont alle items
- [ ] **BTW berekening is correct:**
  - Subtotaal excl. BTW
  - BTW (21%)
  - Totaal incl. BTW
- [ ] **Klik "Betaal" button**

### Mollie Integration
- [ ] **Payment wordt aangemaakt in database**
- [ ] **Redirect naar Mollie checkout werkt**
- [ ] Mollie test pagina laadt
- [ ] **Kies betaalmethode (iDEAL/Creditcard)**
- [ ] **Voltooi testbetaling:**
  - Gebruik Mollie test creditcard: `4111111111111111`
  - Expiry: toekomstige datum
  - CVV: `123`
- [ ] **Redirect terug naar `/payment/success`**

### Payment Success
- [ ] Success pagina laadt
- [ ] Order details worden getoond
- [ ] Order ID is zichtbaar
- [ ] Link naar dashboard werkt

### Webhook & Order Status
- [ ] **Check admin dashboard:** Order status is "paid"
- [ ] **Check database:** Order heeft `payment_status = 'paid'`
- [ ] **Webhook is ontvangen** (check Mollie dashboard logs)
- [ ] **Product toegang is geactiveerd**

---

## 5️⃣ **Product Toegang**

### Dashboard
- [ ] Ga naar `/dashboard`
- [ ] **Gekochte producten worden getoond**
- [ ] Product cards hebben "Open" button
- [ ] Prijs en aankoopdatum zijn zichtbaar

### Cursus Toegang
- [ ] **Klik "Open" op gekochte cursus**
- [ ] Cursus pagina laadt (`/courses/[id]`)
- [ ] Alle cursus content is toegankelijk
- [ ] Video's/lessen zijn beschikbaar

### E-book Toegang
- [ ] **Klik "Open" op gekocht e-book**
- [ ] E-book pagina laadt (`/ebooks/[id]`)
- [ ] Download button is beschikbaar
- [ ] **Download werkt** (test download)

### Access Control
- [ ] **Log uit**
- [ ] **Probeer toegang tot gekochte cursus** (zonder login)
- [ ] Redirect naar login werkt
- [ ] **Probeer toegang tot niet-gekochte cursus**
- [ ] Access denied message wordt getoond

---

## 6️⃣ **Admin Panel**

### Admin Login
- [ ] Ga naar `/admin/login`
- [ ] Login met admin credentials
- [ ] Redirect naar admin dashboard

### Admin Dashboard
- [ ] Dashboard toont:
  - [ ] Totaal Gebruikers (2)
  - [ ] Totaal Producten (1)
  - [ ] Totaal Orders (na test: 1)
  - [ ] Totale Omzet (na test: > €0)

### Product Management
- [ ] **Producten pagina** (`/admin/products`)
- [ ] Producten worden getoond
- [ ] **Nieuw product toevoegen** (`/admin/products/new`)
- [ ] Upload product afbeelding werkt
- [ ] Product wordt opgeslagen
- [ ] **Product bewerken** werkt

### Order Management
- [ ] **Orders pagina** (`/admin/orders`)
- [ ] Test order wordt getoond
- [ ] Order details zijn correct:
  - Order number
  - Klant informatie
  - Producten
  - Bedrag
  - Status (paid/pending)
  - Payment ID

---

## 7️⃣ **Error Handling**

### Edge Cases
- [ ] Checkout zonder items → redirect naar cursussen
- [ ] Checkout zonder login → redirect naar login
- [ ] Payment failure → error message
- [ ] Invalid product ID → 404
- [ ] Network error → error handling

---

## 8️⃣ **Performance & UX**

### Loading States
- [ ] Loading spinners tijdens API calls
- [ ] Buttons zijn disabled tijdens loading
- [ ] Geen dubbele submissions

### Mobile Experience
- [ ] Test op mobile device
- [ ] Touch interactions werken
- [ ] Forms zijn gebruiksvriendelijk op mobile

---

## 📊 **Test Resultaten**

### Test Datum: ___________

### Test Omgeving:
- [ ] Local (localhost:3000)
- [ ] Staging (Vercel preview)
- [ ] Production (studioinsightdark.vercel.app)

### Test Account:
- Email: ___________
- Password: ___________

### Mollie Test Mode:
- [ ] Test API key is geconfigureerd
- [ ] Test payments werken
- [ ] Webhook URL is correct: `https://studioinsightdark.vercel.app/api/payment/webhook`

### Issues Gevonden:
1. ___________
2. ___________
3. ___________

---

## 🚨 **BELANGRIJK: Voor Productie**

- [ ] **Admin authenticatie aanzetten** (middleware.ts regel 11-13)
- [ ] Mollie live API key configureren
- [ ] Production webhook URL instellen
- [ ] Environment variables controleren
- [ ] Database backups ingesteld
- [ ] SSL certificaat actief
- [ ] Error logging geconfigureerd

---

## ✅ **Ready voor Productie?**

Na alle tests:
- [ ] Alle kritieke flows werken
- [ ] Geen kritieke bugs gevonden
- [ ] Performance is acceptabel
- [ ] Security measures zijn actief
- [ ] Documentation is up-to-date

**Status:** [ ] Ready / [ ] Needs Work

