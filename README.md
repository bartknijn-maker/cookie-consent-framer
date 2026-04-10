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
| **`squarespace-head-snippet.html`** | **STAP 1** — plak in Squarespace header boven GTM (Consent Mode defaults) |
| **`gtm-custom-html-tag.html`** | **STAP 2** — plak in Custom HTML tag in GTM (banner + logic) |
| **`GTM-SETUP.md`** | **INSTRUCTIES** — complete stap-voor-stap installatiegids |
| `framer-head-injection.html` | Alternatief voor Framer (all-in-one, laadt GTM zelf) |
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
2. Plak `squarespace-head-snippet.html` in Squarespace header (boven GTM)
3. Plak `gtm-custom-html-tag.html` in een Custom HTML tag in GTM
4. Trigger: Consent Initialization - All Pages
5. Update je GA4 tag met Consent Settings
6. Voeg "Cookies beheren" link toe in de footer
7. Test in GTM Preview mode → Publish

Voor vragen: zie de troubleshooting sectie in `GTM-SETUP.md`.
