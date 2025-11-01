# 🔑 Brevo API Key Setup Guide

## Probleem: API Key niet volledig zichtbaar in Brevo

**Brevo toont API keys om veiligheidsredenen niet volledig.** Dit is normaal gedrag. Als je de volledige key niet meer weet, moet je een nieuwe genereren.

## Stap-voor-stap: Nieuwe API Key Aanmaken

### Stap 1: Genereer nieuwe API Key in Brevo

1. **Ga naar Brevo Dashboard:**
   - Login op https://app.brevo.com
   - Ga naar **Settings** → **API Keys**
   - Of direct: https://app.brevo.com/settings/keys/api

2. **Maak nieuwe API Key:**
   - Klik op **"Generate a new API key"** of **"Create a new API key"**
   - Geef een duidelijke naam (bijv. "Studio Insight Production" of "Studio Insight Vercel")
   - Selecteer de juiste permissies:
     - ✅ **SMTP** (nodig voor email verzending)
     - ✅ **Email Campaigns** (optioneel, alleen als je campaigns gebruikt)
   - Klik op **"Generate"** of **"Create"**

3. **⚠️ BELANGRIJK - Kopieer de key onmiddellijk:**
   - De volledige API key wordt **maar één keer** getoond
   - **Kopieer de hele key** (ziet eruit als: `xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Sla deze tijdelijk op een veilige plek op (password manager, notitie app, etc.)
   - Je kunt deze later niet meer volledig inzien in Brevo!

### Stap 2: Update in Vercel Environment Variables

1. **Ga naar Vercel:**
   - Login op https://vercel.com
   - Ga naar je project: **studioinsightdark** (of je project naam)
   - Klik op **Settings** → **Environment Variables**

2. **Update de BREVO_API_KEY:**
   - Zoek naar `BREVO_API_KEY` in de lijst
   - **Optie A - Bestaande key updaten:**
     - Klik op de key om te bewerken
     - Plak de nieuwe API key in het "Value" veld
     - Klik op **"Save"**
   - **Optie B - Nieuwe key toevoegen (als deze nog niet bestaat):**
     - Klik op **"Add New"**
     - Key: `BREVO_API_KEY`
     - Value: Plak de nieuwe API key
     - Selecteer alle environments: ✅ Production, ✅ Preview, ✅ Development
     - Klik op **"Save"**

3. **Trigger nieuwe deployment:**
   - Na het updaten van environment variables moet je een nieuwe deployment triggeren
   - **Methode 1:** Push een kleine wijziging naar GitHub (dit triggert automatisch een deployment)
   - **Methode 2:** Ga naar **Deployments** tab → **Redeploy** → Selecteer de laatste deployment → **Redeploy**
   - **Methode 3:** Wacht tot de automatische redeployment (kan enkele minuten duren)

### Stap 3: Verifieer dat het werkt

1. **Test lokaal (als je lokaal ontwikkelt):**
   - Update je `.env.local` file met de nieuwe `BREVO_API_KEY`
   - Test de nieuwsbrief inschrijving

2. **Test in production:**
   - Na de Vercel deployment, test de nieuwsbrief inschrijving op je live site
   - Check de Vercel logs voor errors:
     - Vercel Dashboard → Deployments → Laatste deployment → Functions → Logs
   - Zoek naar: `✅ Brevo confirmation email sent:` (succes) of `❌ Brevo API error:` (fout)

### Veel Gemaakte Fouten

❌ **De API key niet direct kopiëren** - Dan zie je hem nooit meer volledig!
✅ **Oplossing:** Direct kopiëren en opslaan

❌ **Key alleen in Production environment zetten**
✅ **Oplossing:** Zet de key in alle environments (Production, Preview, Development)

❌ **Geen nieuwe deployment triggeren na het updaten**
✅ **Oplossing:** Redeploy je Vercel project na het updaten van environment variables

❌ **Verkeerde permissies op de API key**
✅ **Oplossing:** Zorg dat **SMTP** permissie is aangevinkt in Brevo

### Hulp nodig?

Als je de API key niet kunt zien of als er problemen zijn:
1. Check de Vercel logs voor de exacte error message
2. Controleer in Brevo of de API key actief is (Settings → API Keys)
3. Controleer of je sender email geverifieerd is (Settings → Senders & IP)
4. Neem contact op met Brevo support als het een account probleem is

