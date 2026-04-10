# Cookie Consent Manager — bartknijnenberg.com

GDPR-proof cookie consent manager met Google Consent Mode v2. Feature-equivalent aan Cookiebot op alle relevante punten.

## Aanbevolen installatie: via GTM

**De beste methode** — zie [`GTM-SETUP.md`](./GTM-SETUP.md) voor de complete stap-voor-stap gids.

Deze route geeft je:
- Centraal beheer in GTM (geen Squarespace edits na setup)
- Versioning en rollback
- Preview mode om te testen
- Marketing tags als reguliere GTM tags met consent triggers
- Updates zonder developer

## Architectuur

```
┌─────────────────────────────────────────────────────────────┐
│ ALTIJD ACTIEF (Consent Mode v2)                             │
│                                                             │
│ GTM + GA4 laden direct met 'denied' defaults:               │
│   → Zonder consent: cookieless pings (geen cookies)         │
│   → Met analytics consent: volledige GA4 tracking           │
├─────────────────────────────────────────────────────────────┤
│ GEBLOKKEERD TOT CONSENT                                     │
│                                                             │
│ Marketing pixels (Facebook, LinkedIn, Google Ads, etc.)     │
│ vuren pas na expliciete marketing-consent                    │
│ In GTM: gebruik trigger "Marketing Consent Given"           │
└─────────────────────────────────────────────────────────────┘
```

## Categorieën

| Categorie | Standaard | Wat het doet |
|-----------|-----------|-------------|
| **Noodzakelijk** | Altijd aan | Site functionaliteit, CSRF, consent cookie |
| **Analytics** | Uit | GA4 mag cookies plaatsen (GTM draait altijd) |
| **Marketing** | Uit | Facebook Pixel, LinkedIn Insight, Google Ads vuren |

## Bestanden

| Bestand | Doel |
|---------|------|
| **`gtm-custom-html-tag.html`** | **AANBEVOLEN** — plak dit in een Custom HTML tag in GTM |
| **`GTM-SETUP.md`** | **AANBEVOLEN** — stap-voor-stap installatiegids voor GTM |
| `framer-head-injection.html` | Alternatief voor Framer (bevat eigen GTM loader) |
| `cookie-consent-manager.js` | Standalone JS (reference / development) |
| `cookie-consent-styles.css` | Standalone CSS (reference / development) |

## GDPR Compliance

- **Consent Mode v2**: Google's officiële standaard sinds maart 2024 (alle 4 signalen)
- **Default denied**: Alle storage types starten als 'denied'
- **Cookieless pings**: GA4 stuurt geanonimiseerde data zonder cookies wanneer denied
- **Geen pre-ticked boxes**: Alle optionele categorieën starten als uit
- **Reject all**: Bezoekers kunnen alles weigeren met één klik (gelijke prominentie als Accept)
- **Consent ID**: Unieke UUID per consent voor audit bewijs (GDPR Art. 7)
- **Versie-tracking**: `consentVersion` flag forceert re-consent bij policy wijzigingen
- **Consent opslag**: 365 dagen (GDPR maximum is 24 maanden)
- **Cookie cleanup**: Bij intrekken analytics consent worden GA cookies automatisch verwijderd
- **Privacy link**: Directe link naar /privacy-policy in de banner
- **WCAG accessible**: Dialog role, aria-labels, keyboard navigation

## Vergelijking met Cookiebot

| Feature | Cookiebot | Deze CMP |
|---------|-----------|----------|
| Google Consent Mode v2 | Ja | Ja |
| Script blocking | Automatisch | Via GTM triggers |
| Granulaire categorieën | 4 | 3 (voldoende voor deze site) |
| Consent intrekken | Ja | Ja (via `.manage-cookies` link) |
| Consent-ID / audit log | Ja | Ja (UUID in cookie) |
| Versie-tracking / re-consent | Ja | Ja (consentVersion) |
| Gelijke prominentie knoppen | Ja | Ja |
| Dark/light theme | Ja | Ja (dark, brand-matched) |
| Tweetalig (EN/NL) | Ja (47+ talen) | Ja (EN/NL auto-detect) |
| Kosten | €12–144/mnd | Gratis, open source |

## Taalondersteuning

Automatische taaldetectie op basis van URL pad:
- `/nl-nl/`, `/over`, `/diensten`, etc. → Nederlands
- Alle andere paden → Engels

## Snelstart

1. Lees [`GTM-SETUP.md`](./GTM-SETUP.md)
2. Kopieer `gtm-custom-html-tag.html`
3. Installeer als Custom HTML tag in GTM met Consent Initialization trigger
4. Test in GTM Preview mode
5. Publish

Voor vragen: zie de troubleshooting sectie in `GTM-SETUP.md`.
