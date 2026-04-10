# GTM Setup Guide — Cookie Consent Manager

Complete installatiegids voor bartknijnenberg.com via Google Tag Manager (GTM-NPDN3G9K).

## Architectuur

De oplossing bestaat uit **twee kleine onderdelen**:

1. **Squarespace header snippet** (~20 regels) — zet Consent Mode v2 defaults vóór GTM laadt
2. **GTM Custom HTML tag** — banner UI, gebruikersinteractie, consent updates

**Waarom deze splitsing?** Google's officiële richtlijn: `gtag('consent', 'default', ...)` moet vóór GTM laden, niet erbinnen. Wanneer je dit probeert in een GTM Custom HTML tag krijg je de waarschuwing *"gtag-opdrachten in aangepaste HTML werken mogelijk niet naar behoren"*. De defaults-setting is slechts 20 regels code en hoef je maar één keer in Squarespace te plaatsen.

Alle andere logica (banner, consent updates, marketing pixels) blijft in GTM zodat je centraal kunt beheren.

## Waarom deze route?

| Aspect | Voordeel |
|--------|----------|
| **Centraal beheer** | Banner + pixels in GTM, alleen defaults in Squarespace (one-time) |
| **Versioning** | GTM houdt automatisch versies bij, rollback met één klik |
| **Preview mode** | Test wijzigingen veilig voordat ze live gaan |
| **Consent Mode v2 correct** | Defaults vóór GTM = geen timing issues, geen waarschuwingen |
| **GDPR compliant** | Equivalent aan alle commerciële CMPs (Cookiebot, OneTrust, etc.) |
| **Onderhoud** | Updates aan banner zonder Squarespace aan te raken |

## Stap 1 — Squarespace Header Snippet

1. Open **Squarespace → Settings → Advanced → Code Injection**
2. Open `squarespace-head-snippet.html` uit deze repo en kopieer de inhoud
3. Plak de code in het veld **HEADER**, **boven** de bestaande GTM snippet
4. Save

Na deze stap:
- Consent Mode v2 defaults zijn gezet op 'denied'
- GTM laadt vervolgens en respecteert deze defaults
- GA4 stuurt cookieless pings (GDPR-safe) tot er consent is

## Stap 2 — GTM Custom HTML Tag aanmaken

1. Open [tagmanager.google.com](https://tagmanager.google.com)
2. Selecteer container **GTM-NPDN3G9K** (bartknijnenberg.com)
3. Klik **Tags → New**
4. Klik op **Tag Configuration** → **Custom HTML**
5. Open `gtm-custom-html-tag.html` uit deze repo
6. Kopieer **alles** (style + script block) en plak in het HTML veld
7. Onder **Advanced Settings → Consent Settings**:
   - Kies **"No additional consent required"**
   - (Deze tag mag altijd vuren — het IS de consent manager)
8. **Support document.write**: Uitgeschakeld
9. Triggering → **Choose a trigger** → **Consent Initialization - All Pages**
   - Dit is een built-in trigger; als je hem niet ziet, klik **"+"** → **Consent Initialization**
10. **Tag naam**: `Cookie Consent Manager`
11. **Save**

### Eventuele waarschuwingen bij opslaan

Wanneer je op Save klikt kan GTM twee waarschuwingen tonen:

| Waarschuwing | Betekenis | Actie |
|--------------|-----------|-------|
| *"De HTML-code kan een aanroep van document.write() bevatten"* | False positive — GTM scant letterlijk naar de string. Ons script gebruikt het niet. | Klik **Doorgaan** |
| *"gtag-opdrachten in aangepaste HTML werken mogelijk niet naar behoren"* | Geldt alleen voor `gtag('consent', 'default', ...)`. Onze defaults staan al in de Squarespace header (stap 1). De `gtag('consent', 'update', ...)` die we wel in deze tag gebruiken is officieel ondersteund. | Veilig te negeren |

## Stap 3 — GA4 Configuration Tag updaten

Je bestaande GA4 tag moet Consent Mode v2 respecteren (dit is sinds GA4 standaard, maar dubbelcheck):

1. Ga naar **Tags → GA4 Configuration** (je bestaande GA4 tag)
2. Onder **Advanced Settings → Consent Settings**:
   - Zet op **"Require additional consent for tag to fire"**
   - Voeg toe: `analytics_storage`
3. **Save**

Dit betekent: als `analytics_storage = denied` → GA4 stuurt cookieless pings.
Als `analytics_storage = granted` → GA4 plaatst cookies en tracked volledig.

## Stap 4 — Marketing tags voorbereiden (optioneel, voor later)

Wanneer je marketing pixels gaat toevoegen (LinkedIn, Meta, Google Ads), gebruik je deze trigger:

### Custom Trigger: Marketing Consent Given

1. **Triggers → New**
2. Trigger Type: **Custom Event**
3. Event name: `cookie_consent_update`
4. This trigger fires on: **Some Custom Events**
5. Conditions:
   - `cookie_consent_marketing` **equals** `true`
6. Naam: `Marketing Consent Given`
7. **Save**

### Voorbeeld: LinkedIn Insight Tag

1. **Tags → New → Custom HTML**
2. Paste:
```html
<script type="text/javascript">
_linkedin_partner_id = "YOUR_PARTNER_ID";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
```
3. Trigger: **Marketing Consent Given**
4. Advanced → Consent Settings: **No additional consent required** (wij beheren het zelf via de trigger)
5. Naam: `LinkedIn Insight Tag`
6. **Save**

### Voorbeeld: Meta/Facebook Pixel

1. **Tags → New → Custom HTML**
2. Paste:
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```
3. Trigger: **Marketing Consent Given**
4. Naam: `Meta Pixel`
5. **Save**

## Stap 5 — "Cookies beheren" link in footer

Voeg een link toe aan je Squarespace footer zodat bezoekers hun keuze kunnen wijzigen:

1. Squarespace → **Edit Footer**
2. Voeg een text block toe: `Cookies beheren`
3. Markeer de tekst → **Add link** → **Files or external URL**
4. URL: `#manage-cookies`
5. Klik op link in de editor → **Content** → **Add advanced settings**:
   - Click gear icon → **Code injection** or **HTML edit mode**
   - Add class: `manage-cookies`
6. Save

Alternatief: plak een HTML block met:
```html
<a href="#" class="manage-cookies" style="color:#6B7280;font-size:13px;">Cookies beheren</a>
```

## Stap 6 — Testen in Preview Mode

1. GTM → **Preview** (rechtsboven)
2. Voer URL in: `https://www.bartknijnenberg.com`
3. Klik **Connect**
4. In het nieuwe venster: verifieer dat je de cookie banner ziet
5. In het GTM Preview venster (tagassistant.google.com):
   - Tab **Summary** → check dat `Cookie Consent Manager` is gevuurd onder "Consent Initialization"
   - Tab **Consent** → check de default state: alle marketing/ads = `denied`
   - Klik op **"Accept all"** in de banner
   - Tab **Data Layer** → zie het `cookie_consent_update` event
   - Tab **Consent** → alle signalen zouden nu `granted` moeten zijn
6. Test ook **Reject all** in incognito modus

## Stap 7 — Submit & Publish

1. GTM → **Submit** (rechtsboven)
2. Version name: `Cookie Consent Manager v1`
3. Description: `GDPR-compliant consent banner with Google Consent Mode v2`
4. **Publish**

## Stap 8 — Verificatie op productie

1. Bezoek bartknijnenberg.com in incognito
2. Verifieer dat de banner verschijnt
3. Open DevTools → **Application → Cookies**
4. Voordat je klikt: zie dat er GEEN `_ga` cookies zijn (alleen technische)
5. Klik **Accept all** → GA cookies verschijnen
6. Ga naar GA4 → **Realtime** → verifieer dat je pageview doorkomt
7. Klik **Cookies beheren** in de footer → banner verschijnt opnieuw

## Troubleshooting

| Probleem | Oplossing |
|----------|-----------|
| Banner verschijnt niet | Check of `CONFIG.enabled = true` staat. Check GTM Preview of de tag is gevuurd. |
| GA4 tracked ook zonder consent | Check of GA4 tag "Require additional consent for analytics_storage" staat aangevinkt. |
| Banner flickert bij page load | Normaal — de banner verschijnt op DOMContentLoaded. Met Consent Initialization trigger is dit <500ms. |
| Marketing tag vuurt altijd | Check trigger: moet `Marketing Consent Given` zijn, niet `All Pages`. |
| Cookie blijft niet bewaard | Check of domein HTTPS is (Secure flag vereist HTTPS). |

## Versioning

De GTM tag bevat `CONFIG.consentVersion: 1`. Wanneer je je cookie policy wijzigt:

1. Open de Custom HTML tag in GTM
2. Verhoog naar `consentVersion: 2`
3. Submit & publish
4. Alle bezoekers zien automatisch de banner opnieuw (GDPR vereist re-consent bij policy wijzigingen)
