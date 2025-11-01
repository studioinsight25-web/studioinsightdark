# Brevo Email Troubleshooting

## Probleem: "Bevestigingsmail verzonden" melding, maar email komt niet aan

### Stap 1: Check Environment Variables op Vercel

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

3. **Check je API key:**
   - Ga naar **Settings** → **API Keys**
   - Controleer dat je API key actief is
   - Zorg dat je API key **SMTP/Email sending** permissies heeft

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

#### 2. "Invalid API key"
**Oplossing:** Regenerate je API key in Brevo en update deze in Vercel environment variables

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

