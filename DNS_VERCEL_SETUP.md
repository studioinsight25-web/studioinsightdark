# DNS Instellingen voor Vercel - studio-insight.nl

## 📋 Stap-voor-stap instructies

### 1. Domain toevoegen in Vercel Dashboard
1. Ga naar https://vercel.com/dashboard
2. Selecteer je project `studioinsightdark`
3. Ga naar **Settings** → **Domains**
4. Voeg toe: `studio-insight.nl` en `www.studio-insight.nl`
5. Vercel geeft je dan de exacte DNS records die je nodig hebt

### 2. DNS Records instellen bij je Domain Provider

#### Optie A: Direct bij je Domain Registrar (bijv. TransIP, Mijndomein, Hostnet)

**Voor studio-insight.nl (apex domain):**
- **Type:** `A` record
- **Name/Host:** `@` of `studio-insight.nl` of leeg laten
- **Value/IP:** `76.76.21.21`
- **TTL:** `3600` (of default)

**Voor www.studio-insight.nl:**
- **Type:** `CNAME` record
- **Name/Host:** `www`
- **Value/Target:** `cname.vercel-dns.com`
- **TTL:** `3600` (of default)

#### Optie B: Via je Hosting Provider (als domein daar staat)

**Als je hosting gebruikt TransIP, Mijndomein, Hostnet, etc.:**

1. Log in op je domain/hosting beheer panel
2. Ga naar **DNS Beheer** of **DNS Instellingen**
3. Voeg de volgende records toe:

```
Type: A
Naam: @ (of studio-insight.nl)
Waarde: 76.76.21.21
TTL: 3600

Type: CNAME
Naam: www
Waarde: cname.vercel-dns.com
TTL: 3600
```

### 3. Vercel DNS Records (na toevoegen domain in Vercel)

**Wanneer je het domain hebt toegevoegd in Vercel, krijg je specifieke records zoals:**

Voor studio-insight.nl:
```
Type: A
Name: @
Value: 76.76.21.21
```

Voor www.studio-insight.nl:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. SSL Certificate (automatisch)

Vercel verzorgt automatisch SSL certificaten via Let's Encrypt. Zodra DNS correct is ingesteld, wordt HTTPS automatisch geactiveerd (kan 5-60 minuten duren).

## ⚠️ Belangrijke Notities

1. **DNS Propagation:** Het kan 24-48 uur duren voordat DNS wijzigingen wereldwijd zijn doorgevoerd. Meestal werkt het binnen 1-2 uur.

2. **TTL Waarde:** Gebruik 3600 (1 uur) of de default waarde van je provider.

3. **Meerdere A Records:** Voor apex domain kan je ook meerdere A records toevoegen voor redundancy (Vercel heeft meerdere IPs).

4. **CNAME vs ALIAS:** Als je provider ALIAS records ondersteunt voor apex domain, gebruik die dan in plaats van A record.

## 🔍 Verificatie

Na het instellen van DNS records:
1. Wacht 10-60 minuten
2. Check in Vercel Dashboard → Settings → Domains of de domain status "Valid Configuration" toont
3. Test of `studio-insight.nl` naar je Vercel site gaat

## 📞 Support

Als het niet werkt na 24 uur:
- Check DNS propagation: https://dnschecker.org
- Check Vercel domain status in dashboard
- Neem contact op met je domain provider voor hulp

