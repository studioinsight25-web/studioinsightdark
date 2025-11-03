# 🚨 Vercel Deployment 404 - Handmatige Oplossing

## Probleem
De deployment bestaat niet (404) en automatische deployments starten niet.

## ✅ Stap-voor-stap Oplossing

### Stap 1: Check Vercel Dashboard
1. Ga naar: **https://vercel.com/dashboard**
2. Log in met je account
3. Zoek naar project: **studioinsightdark**
   - Als je het niet ziet → **Import Project**

### Stap 2A: Als Project NIET bestaat → Import
1. Klik op **"Add New"** → **"Project"**
2. Klik op **"Import Git Repository"**
3. Zoek naar: **studioinsight25-web/studioinsightdark**
4. Als het niet verschijnt:
   - Klik op **"Adjust GitHub App Permissions"**
   - Geef toegang tot de repository
5. Selecteer het project en klik **"Import"**
6. Configureer:
   - **Framework Preset:** Next.js (automatisch gedetecteerd)
   - **Root Directory:** `./` (leeg laten)
   - **Build Command:** `npm run build` (automatisch)
   - **Output Directory:** `.next` (automatisch)
   - **Install Command:** `npm install` (automatisch)
7. Klik **"Deploy"**

### Stap 2B: Als Project WEL bestaat maar geen deployment start → Reconnect Git
1. Ga naar je project: **studioinsightdark**
2. Ga naar **Settings** → **Git**
3. Check of repository is gekoppeld:
   - Moet zijn: `studioinsight25-web/studioinsightdark`
4. Als NIET gekoppeld of verkeerde repo:
   - Klik op **"Disconnect"** (als er een disconnect optie is)
   - Klik op **"Connect Git Repository"**
   - Selecteer: `studioinsight25-web/studioinsightdark`
   - Klik **"Save"**

### Stap 3: Handmatig Deployment Triggeren
1. Ga naar **Deployments** tab in je project
2. Klik op **"Deploy"** (grote knop bovenaan)
   - Of klik op de 3 dots (⋯) naast een eerdere deployment
   - Selecteer **"Redeploy"**
3. Wacht 2-5 minuten
4. Check de deployment status (moet groen worden)

### Stap 4: Check Environment Variables
Als deployment faalt, check:
1. **Settings** → **Environment Variables**
2. Zorg dat deze aanwezig zijn:
   - Database connection vars
   - `BREVO_API_KEY`
   - `MOLLIE_API_KEY`
   - `CLOUDINARY_*` vars
   - `NEXT_PUBLIC_BASE_URL`

### Stap 5: Als niets werkt → Vercel CLI
1. Installeer Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Deploy: `vercel --prod`

## 🔍 Troubleshooting

**Check 1: Is GitHub repository toegankelijk?**
- Ga naar: https://github.com/studioinsight25-web/studioinsightdark
- Check of je toegang hebt
- Check of `main` branch bestaat

**Check 2: Vercel GitHub Integration**
- Vercel Dashboard → Settings → Git
- Check of GitHub is geautoriseerd
- Check of juiste repository is geselecteerd

**Check 3: Build Logs**
- Ga naar laatste deployment
- Check build logs voor errors
- Fix eventuele errors

## 📞 Contact
Als dit allemaal niet werkt:
1. Check Vercel Status: https://vercel-status.com
2. Vercel Support: https://vercel.com/support

