# Cookie Consent Manager — bartknijnenberg.com

GDPR-proof cookie consent manager voor Framer met Google Consent Mode v2.

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
│ worden pas geladen na expliciete marketing-consent           │
└─────────────────────────────────────────────────────────────┘
```

## Categorieën

| Categorie | Standaard | Wat het doet |
|-----------|-----------|-------------|
| **Noodzakelijk** | Altijd aan | Site functionaliteit, CSRF, consent cookie |
| **Analytics** | Uit | GA4 mag cookies plaatsen (GTM draait altijd) |
| **Marketing** | Uit | Facebook Pixel, LinkedIn Insight, Google Ads laden |

## Status

De consent banner is standaard **uitgeschakeld** (`enabled: false`). GTM + GA4 draaien in denied mode (cookieless pings). Zodra je marketing pixels toevoegt, zet je `enabled: true` en verschijnt de banner automatisch.

## Installatie in Framer

### Stap 1: Code injection
1. Open je Framer project
2. Ga naar **Settings → General → Custom Code**
3. Plak de inhoud van `framer-head-injection.html` in **Start of `<head>`**
4. **Verwijder** eventueel bestaande GTM snippets (dit script laadt GTM zelf)

### Stap 2: Marketing pixels toevoegen
Bewerk het `marketingPixels` array in de CONFIG sectie:

```javascript
marketingPixels: [
  // Facebook Pixel
  {
    src: 'https://connect.facebook.net/en_US/fbevents.js',
    onLoad: function() {
      fbq('init', 'YOUR_PIXEL_ID');
      fbq('track', 'PageView');
    }
  },
  // LinkedIn Insight Tag
  {
    src: 'https://snap.licdn.com/li.lms-analytics/insight.min.js'
  },
  // Google Ads
  {
    src: 'https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX',
    onLoad: function() { gtag('config', 'AW-XXXXXXXXX'); }
  }
]
```

### Stap 3: "Cookies beheren" link in footer
Voeg in je Framer footer een link toe met:
- **class**: `manage-cookies`
- Of **data-attribute**: `data-cookie-consent="manage"`

Dit opent de consent banner opnieuw zodat bezoekers hun voorkeuren kunnen wijzigen.

### Stap 4: GTM configuratie
In Google Tag Manager:
1. Ga naar **Admin → Container Settings**
2. Zet **"Enable consent overview"** aan
3. Configureer je GA4 tag met **"Require additional consent for ad features"**
4. Zet marketing tags (FB Pixel etc.) op trigger: `cookie_consent_update` waar `cookie_consent_marketing = true`

## Bestanden

| Bestand | Doel |
|---------|------|
| `framer-head-injection.html` | Alles-in-één voor Framer (CSS + JS) — dit plak je in Framer |
| `cookie-consent-manager.js` | Standalone JS (voor development/reference) |
| `cookie-consent-styles.css` | Standalone CSS (voor development/reference) |

## GDPR Compliance

- **Consent Mode v2**: Google's officiële standaard sinds maart 2024
- **Default denied**: Alle storage types starten als 'denied'
- **Cookieless pings**: GA4 stuurt geanonimiseerde data zonder cookies wanneer denied
- **Geen pre-ticked boxes**: Alle optionele categorieën starten als uit
- **Reject all**: Bezoekers kunnen alles weigeren met één klik
- **Cookie opslag**: Consent keuze wordt 365 dagen bewaard
- **Cookie cleanup**: Bij intrekken analytics consent worden GA cookies verwijderd
- **Privacy link**: Directe link naar /privacy-policy in de banner

## Taalondersteuning

Automatische taaldetectie op basis van URL pad:
- `/nl-nl/`, `/over`, `/diensten`, etc. → Nederlands
- Alle andere paden → Engels
