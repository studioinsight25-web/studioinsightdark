# Cloudinary Setup Instructies

Cloudinary is geïntegreerd voor image uploads op Vercel. Deze setup is essentieel voor het uploaden van afbeeldingen in productie.

## Stap 1: Cloudinary Account Aanmaken

1. Ga naar [Cloudinary.com](https://cloudinary.com)
2. Maak een gratis account aan (of log in als je er al een hebt)
3. Je krijgt een gratis tier met 25GB storage en 25GB bandwidth/maand

## Stap 2: Dashboard Credentials Ophalen

1. In je Cloudinary Dashboard, ga naar "Settings" (tandwiel icoon bovenaan)
2. Ga naar de "API Keys" sectie
3. Je ziet daar:
   - **Cloud name** (bijv. `demo`)
   - **API Key** (een lange string)
   - **API Secret** (een nog langere string) - KLIK op "Reveal"

Kopieer deze 3 waarden.

## Stap 3: Upload Preset Aanmaken

1. In je Cloudinary Dashboard, ga naar "Settings"
2. Scroll naar beneden naar "Upload" > "Upload presets"
3. Klik op "Add upload preset"
4. Configureer als volgt:
   - **Preset name**: `studio-insight` (of een naam naar keuze)
   - **Signing mode**: "Unsigned"
   - **Use filename**: Vink aan
   - **Unique filename**: Vink aan
   - **Folder**: `studio-insight/products` (optioneel, maar aanbevolen)
   - **Resource type**: "Auto" of "Image"
   - **Image optimization**: 
     - Quality: "Auto:best"
     - Format: "Auto"

5. Klik op "Save" onderaan

## Stap 4: Environment Variables Instellen

### Voor Local Development (.env.local):

Voeg deze regels toe aan je `.env.local` bestand:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=jouw-cloud-name
CLOUDINARY_API_KEY=jouw-api-key
CLOUDINARY_API_SECRET=jouw-api-secret
CLOUDINARY_UPLOAD_PRESET=studio-insight
```

**LET OP**: Vervang `jouw-cloud-name`, `jouw-api-key` en `jouw-api-secret` met je echte waarden!

### Voor Vercel Production:

1. Ga naar je Vercel Dashboard
2. Selecteer je project
3. Ga naar "Settings" > "Environment Variables"
4. Voeg de volgende variabelen toe:

   ```
   CLOUDINARY_CLOUD_NAME = jouw-cloud-name
   CLOUDINARY_API_KEY = jouw-api-key
   CLOUDINARY_API_SECRET = jouw-api-secret
   CLOUDINARY_UPLOAD_PRESET = studio-insight
   ```

5. Selecteer voor elke variabele:
   - Development: ✓
   - Preview: ✓
   - Production: ✓

6. Klik op "Save"

## Stap 5: Verificatie

1. **Local**: Herstart je development server (`npm run dev`)
2. **Vercel**: Wacht tot de deployment klaar is (of trigger een nieuwe deployment)

3. Test de upload:
   - Ga naar je admin panel: `/admin/products/new`
   - Upload een test afbeelding
   - Check de console voor "Uploading to Cloudinary..." log
   - De afbeelding zou nu moeten werken!

## Hoe Het Werkt

De upload API (`/api/upload`) werkt nu als volgt:

1. **Check**: Zijn Cloudinary credentials aanwezig?
2. **Ja**: Upload naar Cloudinary → krijg een URL terug
3. **Nee**: Upload lokaal → krijg een lokale URL terug

Dit betekent:
- ✅ **Local development**: Werkt zonder Cloudinary (valt terug op lokaal)
- ✅ **Production**: Werkt met Cloudinary voor betrouwbare uploads
- ✅ **Flexibel**: Switch gemakkelijk tussen beide

## Troubleshooting

**"Upload fout: Cloudinary upload failed"**
- Check of alle environment variables juist zijn ingesteld
- Check of de upload preset naam klopt
- Check of de API secret correct is (geen extra spaties)

**"Upload works lokaal maar niet op Vercel"**
- Check of de environment variables in Vercel zijn ingesteld
- Check of je "Redeploy" hebt gedaan na het toevoegen van de variabelen
- Ga naar Vercel Dashboard > Settings > Environment Variables

**"Images worden wel geüpload maar niet getoond"**
- Check de console voor de image URL
- Cloudinary URLs zien er zo uit: `https://res.cloudinary.com/your-cloud-name/image/upload/...`
- Check of de URL klopt in je database/product

**Vragen of problemen?**
- Check Cloudinary logs: Dashboard > Media Library > Recent activity
- Check Vercel logs: Dashboard > Deployments > Select deployment > Function logs

## Belangrijke Opmerkingen

⚠️ **Security**: 
- De API Secret is **GEHEIM** - deel deze nooit publiek!
- Zet deze altijd in environment variables, nooit in code

💰 **Free Tier Limits**:
- 25GB storage
- 25GB bandwidth/maand
- Unlimited transformations
- Genoeg voor kleinere websites!

🚀 **Performance**:
- Cloudinary levert geoptimaliseerde images
- Auto-format (WebP, AVIF waar mogelijk)
- Auto-quality voor kleinere bestanden
- CDN wereldwijd voor snelle levering

