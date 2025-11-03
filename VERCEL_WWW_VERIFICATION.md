# 🌐 www.studio-insight.nl Verificatie

## Status
- ✅ `studio-insight.nl` - Valid Configuration (werkt!)
- ⚠️ `www.studio-insight.nl` - Verification Needed

## Oplossing voor www.studio-insight.nl

Je hebt 2 opties:

### Optie 1: TXT Record Toevoegen (aanbevolen)

1. **Ga naar je DNS provider** (TransIP, Mijndomein, etc.)
2. **Voeg TXT record toe:**
   ```
   Type: TXT
   Naam: _vercel
   Waarde: vc-domain-verify=www.studio-insight.nl,6d27671ba3daf1... 
          (volledige waarde uit Vercel kopiëren)
   TTL: 3600
   ```
3. **Wacht 10-60 minuten**
4. **In Vercel:** Klik "Refresh" bij www.studio-insight.nl

### Optie 2: CNAME Record (sneller, maar check eerst in Vercel)

In Vercel zie je bij www.studio-insight.nl een CNAME record:
- **Type:** CNAME
- **Name:** `www`
- **Value:** `894efc62a8b5fa4e.vercel-dns-017.com.`

**Zorg dat deze CNAME record bestaat in je DNS:**
1. Ga naar DNS provider
2. Check of CNAME voor `www` bestaat met waarde `894efc62a8b5fa4e.vercel-dns-017.com.`
3. Als niet: voeg toe en wacht 10-60 minuten
4. In Vercel: Klik "Refresh"

## Belangrijk
- **TXT record** is nodig voor verificatie (eigenaarschap)
- **CNAME record** is nodig voor routing (traffic)
- Beide kunnen tegelijk bestaan

## Na Verificatie
Zodra beide domeinen ✅ "Valid Configuration" tonen:
- `studio-insight.nl` → redirect naar `www.studio-insight.nl` ✅
- `www.studio-insight.nl` → serveert de website ✅
- HTTPS wordt automatisch geactiveerd door Vercel

