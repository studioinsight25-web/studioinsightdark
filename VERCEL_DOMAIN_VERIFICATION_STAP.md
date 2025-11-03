# 🔐 Vercel Domain Verificatie - studio-insight.nl

## Probleem
Domain status: **"Verification Needed"** - Domein is gekoppeld aan een ander Vercel account.

## ✅ Status Update
- `studio-insight.nl` → ✅ **Valid Configuration** (opgelost!)
- `www.studio-insight.nl` → ⚠️ Nog verificatie nodig

## ✅ Oplossing: TXT Record Toevoegen

### Stap 1: Kopieer de TXT Record Waarden uit Vercel

**Voor studio-insight.nl:**
- **Type:** TXT
- **Naam:** `_vercel`
- **Waarde:** `vc-domain-verify=studio-insight.nl,f6354cea86c3d27cb...` (volledige waarde uit Vercel kopiëren)

**Voor www.studio-insight.nl:**
- **Type:** TXT
- **Naam:** `_vercel`
- **Waarde:** `vc-domain-verify=www.studio-insight.nl,6d27671ba3daf1...` (volledige waarde uit Vercel kopiëren)

### Stap 2: Voeg Records Toe bij DNS Provider

**Voor verschillende providers:**

#### TransIP
1. Log in op TransIP
2. Ga naar **DNS Beheer** → Selecteer `studio-insight.nl`
3. Klik **"Record Toevoegen"**
4. Type: **TXT**
5. Naam: `_vercel`
6. Waarde: Plak de volledige waarde uit Vercel
7. TTL: 3600
8. Klik **"Toevoegen"**

#### Mijndomein
1. Log in op Mijndomein
2. Ga naar **Domeinen** → `studio-insight.nl` → **DNS Records**
3. Klik **"Toevoegen"**
4. Type: **TXT**
5. Hostname: `_vercel`
6. Waarde: Plak de volledige waarde uit Vercel
7. Klik **"Opslaan"**

#### Hostnet
1. Log in op Hostnet
2. Ga naar **Domeinen** → `studio-insight.nl` → **DNS Instellingen**
3. Klik **"Record Toevoegen"**
4. Type: **TXT**
5. Naam: `_vercel`
6. Waarde: Plak de volledige waarde uit Vercel
7. Klik **"Opslaan"**

#### Andere Providers
- Zoek naar **DNS Records** of **DNS Beheer**
- Voeg een **TXT record** toe
- Naam/Hostname: `_vercel`
- Waarde: De volledige verificatie string uit Vercel

### Stap 3: Wachten op DNS Propagation

- DNS wijzigingen kunnen 5-60 minuten duren
- Check propagation: https://dnschecker.org
- Zoek naar: `_vercel.studio-insight.nl` TXT record

### Stap 4: Verifieer in Vercel

1. Ga terug naar Vercel Dashboard
2. **Project Settings** → **Domains**
3. Klik op **"Refresh"** bij beide domeinen
4. Status zou moeten veranderen naar: ✅ **"Valid Configuration"**

### Stap 5: Na Verificatie (Optioneel)

Na succesvolle verificatie kun je de TXT record verwijderen (niet verplicht, maar maakt DNS schoner).

### ⚠️ Belangrijk

- **Kopieer de volledige waarde** uit Vercel (alle tekens inclusief de `vc-domain-verify=...` deel)
- **Zet geen dubbele quotes** om de waarde
- **TTL van 3600** is prima (1 uur)
- **Wacht minimaal 10 minuten** na toevoegen voordat je "Refresh" klikt in Vercel

### 🔍 Troubleshooting

**Als verificatie na 1 uur nog steeds faalt:**
1. Check DNS propagation: https://dnschecker.org/#TXT/_vercel.studio-insight.nl
2. Zorg dat de waarde exact overeenkomt (geen extra spaties)
3. Check of je de record bij de juiste domain hebt toegevoegd
4. Probeer de volledige waarde opnieuw te kopiëren uit Vercel

### 📝 DNS Records Overzicht (na verificatie)

Na verificatie heb je deze records nodig:

**studio-insight.nl:**
```
Type: A (of ALIAS)
Name: @
Value: 76.76.21.21
```

**www.studio-insight.nl:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com (of de nieuwe waarde die Vercel geeft)
```

De TXT records zijn alleen nodig voor verificatie!

