# Brevo Email Troubleshooting

## Probleem: "Bevestigingsmail verzonden" melding, maar email komt niet aan

### Stap 1: Check/Update Environment Variables op Vercel

**Hoe je een nieuwe API key toevoegt/update in Vercel:**

1. Ga naar je Vercel project → **Settings** → **Environment Variables**
2. Zoek naar `BREVO_API_KEY`
3. Als deze bestaat maar je weet niet of deze correct is:
   - Klik op de key om te bewerken
   - **Of** verwijder de oude en maak een nieuwe aan
4. **Nieuwe API key toevoegen:**
   - Klik op **"Add New"**
   - Key: `BREVO_API_KEY`
   - Value: Plak hier de volledige API key die je net in Brevo hebt gekopieerd
   - Selecteer alle environments: Production, Preview, Development
   - Klik op **"Save"**
5. **Belangrijk:** Na het toevoegen/updaten van environment variables moet je je deployment opnieuw deployen of een nieuwe deployment triggeren

Ga naar je Vercel project → Settings → Environment Variables en controleer:

**Verplicht:**
- ✅ `BREVO_API_KEY` - Je Brevo API key
- ✅ `NEXT_PUBLIC_BASE_URL` - Je website URL (bijv. `https://studio-insight.nl`)

**Optioneel:**
- `BREVO_SENDER_EMAIL` - Standaard: `no-reply@studio-insight.nl` (MOET geverifieerd zijn in Brevo!)
- `BREVO_SENDER_NAME` - Standaard: `Studio Insight`
- `BREVO_LIST_ID` - List ID voor bevestigde subscribers

### Stap 2: Check Brevo Dashboard

1. **Ga naar https://app.brevo.com**
2. **Verifieer je sender email:**
   - Ga naar **Settings** → **Senders & IP**
   - Zorg dat je sender email (`BREVO_SENDER_EMAIL` of `no-reply@studio-insight.nl`) **geverifieerd** is
   - Als deze niet geverifieerd is, kun je geen emails verzenden!

3. **Check/Regenereer je API key:**
   - Ga naar **Settings** → **API Keys** (https://app.brevo.com/settings/keys/api)
   - **⚠️ Belangrijk:** Brevo toont API keys om veiligheidsredenen niet volledig
   - Als je de volledige key niet meer weet, maak je een nieuwe aan:
     1. Klik op **"Generate a new API key"** of **"Create a new API key"**
     2. Geef een naam (bijv. "Studio Insight Production")
     3. Selecteer permissies: **✓ SMTP** en **✓ Email Campaigns** (optioneel)
     4. **Kopieer de volledige API key onmiddellijk** - deze wordt maar één keer getoond!
     5. Sla deze op een veilige plek op
   - Update de key in Vercel (zie hieronder)

4. **Check rate limits:**
   - Ga naar je account dashboard
   - Controleer of je niet je dagelijkse/maandelijkse limiet hebt bereikt

### Stap 3: Test de Configuratie

**Lokaal (development):**
```
http://localhost:3000/api/newsletter/check
```

**Production (met secret):**
```
https://studio-insight.nl/api/newsletter/check?secret=YOUR_SECRET
```

**Test email verzenden:**
```
http://localhost:3000/api/newsletter/check?test=je@email.com
```

### Stap 4: Check Server Logs

Na een nieuwsbrief inschrijving, check de logs in Vercel:

1. Ga naar je Vercel project → Deployments
2. Klik op de laatste deployment → Functions
3. Bekijk de logs voor:
   - `✅ Brevo confirmation email sent:` (succes)
   - `❌ Brevo API error:` (fout)
   - `⚠️ WARNING: Newsletter subscription created but email NOT sent:` (waarschuwing)

### Veel Voorkomende Problemen

#### 1. "Sender email not verified"
**Oplossing:** Verifieer je sender email in Brevo dashboard (Settings → Senders & IP)

#### 2. "Invalid API key" of "BREVO_API_KEY not configured"
**Oplossing:** 
1. Genereer een nieuwe API key in Brevo (Settings → API Keys → Generate new)
2. **Kopieer de volledige key onmiddellijk** (wordt maar 1x getoond!)
3. Ga naar Vercel → Settings → Environment Variables
4. Update `BREVO_API_KEY` met de nieuwe key
5. Trigger een nieuwe deployment (of wacht op automatische redeployment)

#### 3. "Rate limit exceeded"
**Oplossing:** Wacht tot je limiet is gereset, of upgrade je Brevo plan

#### 4. "No messageId returned"
**Oplossing:** Dit betekent dat Brevo de email heeft geaccepteerd maar niet verzonden. Check:
- Is sender email geverifieerd?
- Zijn er domain restrictions?
- Is de email adres in een blacklist?

### Debug Mode

In development mode worden extra error details getoond aan gebruikers. In production worden alleen algemene meldingen getoond maar worden alle errors gelogd in de server logs.

### Contact

Als het probleem aanhoudt na deze checks:
1. Check de exacte error message in Vercel logs
2. Check je Brevo account status
3. Neem contact op met Brevo support als het een account/configuratie probleem is

