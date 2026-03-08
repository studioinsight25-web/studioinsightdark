# studio-insight.nl wijst naar Scheduler i.p.v. Studio website

## Probleem
studio-insight.nl toont "Insight Scheduler" in plaats van de Studio Insight website (cursussen, e-books, reviews).

## Oorzaak
Het domein is toegewezen aan het **verkeerde Vercel-project** (Scheduler i.p.v. studioinsightdark/studio-insight).

## Oplossing

### Stap 1: Domein verwijderen van Scheduler-project
1. Ga naar https://vercel.com/dashboard
2. Open het **Insight Scheduler** project (of het project dat nu studio-insight.nl toont)
3. Ga naar **Settings** → **Domains**
4. Zoek `studio-insight.nl` en `www.studio-insight.nl`
5. Klik op de **3 puntjes** → **Remove** voor beide domeinen

### Stap 2: Domein toevoegen aan Studio website-project
1. Ga naar https://vercel.com/dashboard
2. Open het **studioinsightdark** project (of **studio-insight** – afhankelijk van welke je als productie gebruikt)
3. Ga naar **Settings** → **Domains**
4. Klik **Add**
5. Voeg toe: `studio-insight.nl`
6. Voeg toe: `www.studio-insight.nl`
7. Klik **Add**

### Stap 3: DNS verifiëren
- De DNS records (A: 76.76.21.21, CNAME: cname.vercel-dns.com) blijven hetzelfde
- Vercel wijst het domein nu automatisch naar het juiste project
- Wacht 5–60 minuten voor SSL en propagatie

### Stap 4: Controleren
- Na 10–60 minuten: https://studio-insight.nl
- Je zou nu de Studio Insight website moeten zien (cursussen, e-books, reviews). 
