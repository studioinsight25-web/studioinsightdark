# Vercel Deployment 404 Error Fix

## Probleem
```
404: NOT_FOUND Code: DEPLOYMENT_NOT_FOUND
```

Dit betekent dat de deployment niet bestaat of is verwijderd.

## Oplossing: Nieuwe Deployment Triggeren

### Optie 1: Via Vercel Dashboard (Aanbevolen)

1. **Ga naar Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecteer project: `studioinsightdark`

2. **Trigger Nieuwe Deployment:**
   - Ga naar **Deployments** tab
   - Klik op **"Deploy"** of **"Redeploy"**
   - Of klik op de 3 dots (⋯) naast een eerdere deployment → **"Redeploy"**

3. **Of via Git Push (automatisch):**
   - Maak een lege commit: `git commit --allow-empty -m "Trigger Vercel deployment"`
   - Push: `git push`

### Optie 2: Via Git (Automatisch)

```bash
# Maak een lege commit om deployment te triggeren
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

### Optie 3: Reconnect Project

Als het project niet meer correct is gekoppeld:

1. **Ga naar Vercel Dashboard**
2. **Settings** → **Git**
3. Check of GitHub repo correct is gekoppeld
4. Als niet: **Disconnect** en opnieuw **Connect Repository**
5. Selecteer: `studioinsight25-web/studioinsightdark`
6. Configureer project settings
7. Klik **Deploy**

## Controleren

Na deployment trigger:
1. Wacht 2-5 minuten
2. Check **Deployments** tab in Vercel
3. Nieuwe deployment zou moeten verschijnen
4. Check of build succesvol is (groene vinkje)

## Als het nog steeds niet werkt

1. **Check Project Settings:**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next` (automatisch)
   - Install Command: `npm install`

2. **Check Environment Variables:**
   - Settings → Environment Variables
   - Zorg dat alle benodigde vars aanwezig zijn:
     - Database connection vars
     - API keys (Mollie, Cloudinary, Brevo, etc.)

3. **Check Build Logs:**
   - Open de failed deployment
   - Bekijk build logs voor errors
   - Fix eventuele errors

4. **Contact Support:**
   - Als niets werkt, check Vercel status: https://vercel-status.com
   - Of contact Vercel support

