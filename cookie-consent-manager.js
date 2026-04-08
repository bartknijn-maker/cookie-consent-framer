/**
 * GDPR Cookie Consent Manager for Framer
 * bartknijnenberg.com
 *
 * Architecture:
 * - GTM + GA4 load ALWAYS with Google Consent Mode v2
 *   → Without consent: cookieless pings only (no cookies stored, GDPR-compliant)
 *   → With analytics consent: full GA4 tracking with cookies
 * - Marketing pixels (Facebook, LinkedIn, etc.) are COMPLETELY BLOCKED
 *   until the user explicitly accepts marketing cookies
 *
 * Categories:
 * - Necessary: always on (site functionality, CSRF, consent cookie itself)
 * - Analytics: controls whether GA4 may store cookies (GTM always loads)
 * - Marketing: controls loading of Facebook Pixel, LinkedIn Insight, etc.
 *
 * Features:
 * - Google Consent Mode v2 (default denied, signals sent immediately)
 * - Bilingual (EN/NL) with auto-detection
 * - Remembers choice for 365 days
 * - "Manage cookies" footer link support
 *
 * Installation: Paste in Framer → Settings → General → Custom Code → Start of <head>
 * IMPORTANT: This script MUST be the FIRST script in <head>, before GTM
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION — Edit these values for your setup
  // ============================================================
  var CONFIG = {
    gtmId: 'GTM-NPDN3G9K',
    consentCookieName: 'bk_cookie_consent',
    consentCookieDays: 365,
    // Marketing pixels — ONLY loaded after explicit consent
    // Add your pixel script URLs here:
    marketingPixels: [
      // { src: 'https://connect.facebook.net/en_US/fbevents.js', onLoad: function() { fbq('init', 'YOUR_PIXEL_ID'); fbq('track', 'PageView'); } },
      // { src: 'https://snap.licdn.com/li.lms-analytics/insight.min.js' },
      // { src: 'https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX', onLoad: function() { gtag('config', 'AW-XXXXXXXXX'); } },
    ]
  };

  // ============================================================
  // TRANSLATIONS
  // ============================================================
  var TRANSLATIONS = {
    en: {
      title: 'We value your privacy',
      description: 'We use cookies to improve your experience, analyze site traffic, and for marketing purposes. You can choose which cookies to accept.',
      acceptAll: 'Accept all',
      rejectAll: 'Reject all',
      customize: 'Customize',
      savePreferences: 'Save preferences',
      necessary: 'Necessary',
      necessaryDesc: 'Essential for the website to function. Cannot be disabled.',
      analytics: 'Analytics',
      analyticsDesc: 'Help us understand how visitors use our website (Google Analytics).',
      marketing: 'Marketing',
      marketingDesc: 'Used to deliver relevant ads and track campaign performance.',
      privacyLink: 'Privacy Policy',
      poweredBy: ''
    },
    nl: {
      title: 'We waarderen je privacy',
      description: 'We gebruiken cookies om je ervaring te verbeteren, siteverkeer te analyseren en voor marketingdoeleinden. Je kunt kiezen welke cookies je accepteert.',
      acceptAll: 'Alles accepteren',
      rejectAll: 'Alles weigeren',
      customize: 'Aanpassen',
      savePreferences: 'Voorkeuren opslaan',
      necessary: 'Noodzakelijk',
      necessaryDesc: 'Essentieel voor de werking van de website. Kan niet uitgeschakeld worden.',
      analytics: 'Analyse',
      analyticsDesc: 'Helpen ons begrijpen hoe bezoekers de website gebruiken (Google Analytics).',
      marketing: 'Marketing',
      marketingDesc: 'Gebruikt om relevante advertenties te tonen en campagneprestaties te meten.',
      privacyLink: 'Privacybeleid',
      poweredBy: ''
    }
  };

  // ============================================================
  // GOOGLE CONSENT MODE v2 — Default: deny all
  // Must run BEFORE GTM loads
  // ============================================================
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'granted',  // necessary cookies
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 500
  });

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  function detectLanguage() {
    var path = window.location.pathname;
    var nlPages = ['/nl-nl', '/over', '/diensten', '/werk', '/contact-nl', '/ervaring', '/vaardigheden'];
    for (var i = 0; i < nlPages.length; i++) {
      if (path.indexOf(nlPages[i]) === 0) return 'nl';
    }
    return 'en';
  }

  function getTranslations() {
    return TRANSLATIONS[detectLanguage()] || TRANSLATIONS.en;
  }

  function setConsentCookie(value) {
    var d = new Date();
    d.setTime(d.getTime() + (CONFIG.consentCookieDays * 24 * 60 * 60 * 1000));
    document.cookie = CONFIG.consentCookieName + '=' + encodeURIComponent(JSON.stringify(value)) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax;Secure';
  }

  function getConsentCookie() {
    var name = CONFIG.consentCookieName + '=';
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf(name) === 0) {
        try {
          return JSON.parse(decodeURIComponent(c.substring(name.length)));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  function deleteTrackingCookies() {
    // Remove GA cookies
    var cookiesToDelete = ['_ga', '_gid', '_gat'];
    var hostname = window.location.hostname;
    var domains = [hostname, '.' + hostname];

    // Find _ga_* cookies
    document.cookie.split(';').forEach(function(c) {
      var name = c.trim().split('=')[0];
      if (name.indexOf('_ga_') === 0) cookiesToDelete.push(name);
    });

    cookiesToDelete.forEach(function(name) {
      domains.forEach(function(domain) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + domain;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });
    });
  }

  // ============================================================
  // GTM — Loads ALWAYS (Consent Mode v2 handles restrictions)
  // GA4 runs inside GTM and respects consent signals:
  //   denied  → cookieless pings only (no cookies, GDPR-safe)
  //   granted → full tracking with cookies
  // ============================================================
  function loadGTM() {
    if (window.__gtmLoaded) return;
    window.__gtmLoaded = true;

    (function(w,d,s,l,i){
      w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',CONFIG.gtmId);
  }

  // Load GTM immediately — consent mode is already set to 'denied'
  // so GA4 will only send cookieless pings until consent is given
  loadGTM();

  // ============================================================
  // CONSENT APPLICATION
  // ============================================================
  function applyConsent(consent) {
    // Update Google Consent Mode v2
    // This tells GTM/GA4 whether they may store cookies
    gtag('consent', 'update', {
      'analytics_storage': consent.analytics ? 'granted' : 'denied',
      'ad_storage': consent.marketing ? 'granted' : 'denied',
      'ad_user_data': consent.marketing ? 'granted' : 'denied',
      'ad_personalization': consent.marketing ? 'granted' : 'denied',
      'personalization_storage': consent.marketing ? 'granted' : 'denied'
    });

    // Push consent event to dataLayer (GTM triggers can listen for this)
    window.dataLayer.push({
      'event': 'cookie_consent_update',
      'cookie_consent_analytics': consent.analytics,
      'cookie_consent_marketing': consent.marketing
    });

    // If analytics denied, clean up any existing GA cookies
    if (!consent.analytics) {
      deleteTrackingCookies();
    }

    // Marketing pixels — ONLY load after explicit consent
    if (consent.marketing) {
      loadMarketingPixels();
    }
  }

  function loadMarketingPixels() {
    CONFIG.marketingPixels.forEach(function(pixel) {
      var src = pixel.src || pixel;
      if (document.querySelector('script[src="' + src + '"]')) return;
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      if (pixel.onLoad) {
        s.onload = pixel.onLoad;
      }
      document.head.appendChild(s);
    });
  }

  // ============================================================
  // BANNER UI
  // ============================================================
  function createBanner() {
    var t = getTranslations();
    var lang = detectLanguage();
    var privacyUrl = lang === 'nl' ? '/privacy-policy' : '/privacy-policy';

    var overlay = document.createElement('div');
    overlay.id = 'bk-consent-overlay';

    var banner = document.createElement('div');
    banner.id = 'bk-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', t.title);
    banner.setAttribute('aria-modal', 'true');

    banner.innerHTML = ''
      + '<div class="bk-consent-inner">'
      + '  <div class="bk-consent-header">'
      + '    <h2>' + t.title + '</h2>'
      + '    <p>' + t.description + '</p>'
      + '  </div>'
      + '  <div class="bk-consent-categories" id="bk-consent-categories" style="display:none;">'
      + '    <div class="bk-consent-category">'
      + '      <div class="bk-consent-cat-header">'
      + '        <label class="bk-consent-toggle">'
      + '          <input type="checkbox" checked disabled>'
      + '          <span class="bk-toggle-slider bk-toggle-locked"></span>'
      + '        </label>'
      + '        <div class="bk-consent-cat-text">'
      + '          <strong>' + t.necessary + '</strong>'
      + '          <span>' + t.necessaryDesc + '</span>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '    <div class="bk-consent-category">'
      + '      <div class="bk-consent-cat-header">'
      + '        <label class="bk-consent-toggle">'
      + '          <input type="checkbox" id="bk-consent-analytics">'
      + '          <span class="bk-toggle-slider"></span>'
      + '        </label>'
      + '        <div class="bk-consent-cat-text">'
      + '          <strong>' + t.analytics + '</strong>'
      + '          <span>' + t.analyticsDesc + '</span>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '    <div class="bk-consent-category">'
      + '      <div class="bk-consent-cat-header">'
      + '        <label class="bk-consent-toggle">'
      + '          <input type="checkbox" id="bk-consent-marketing">'
      + '          <span class="bk-toggle-slider"></span>'
      + '        </label>'
      + '        <div class="bk-consent-cat-text">'
      + '          <strong>' + t.marketing + '</strong>'
      + '          <span>' + t.marketingDesc + '</span>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '  <div class="bk-consent-actions">'
      + '    <button class="bk-btn bk-btn-reject" id="bk-reject-all">' + t.rejectAll + '</button>'
      + '    <button class="bk-btn bk-btn-customize" id="bk-customize">' + t.customize + '</button>'
      + '    <button class="bk-btn bk-btn-accept" id="bk-accept-all">' + t.acceptAll + '</button>'
      + '  </div>'
      + '  <div class="bk-consent-actions bk-consent-save" id="bk-save-row" style="display:none;">'
      + '    <button class="bk-btn bk-btn-accept" id="bk-save-prefs">' + t.savePreferences + '</button>'
      + '  </div>'
      + '  <div class="bk-consent-footer">'
      + '    <a href="' + privacyUrl + '">' + t.privacyLink + '</a>'
      + '  </div>'
      + '</div>';

    overlay.appendChild(banner);
    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('bk-accept-all').addEventListener('click', function() {
      saveAndClose({ necessary: true, analytics: true, marketing: true });
    });

    document.getElementById('bk-reject-all').addEventListener('click', function() {
      saveAndClose({ necessary: true, analytics: false, marketing: false });
    });

    document.getElementById('bk-customize').addEventListener('click', function() {
      var cats = document.getElementById('bk-consent-categories');
      var saveRow = document.getElementById('bk-save-row');
      var customizeBtn = document.getElementById('bk-customize');
      if (cats.style.display === 'none') {
        cats.style.display = 'block';
        saveRow.style.display = 'flex';
        customizeBtn.style.display = 'none';
      }
    });

    document.getElementById('bk-save-prefs').addEventListener('click', function() {
      saveAndClose({
        necessary: true,
        analytics: document.getElementById('bk-consent-analytics').checked,
        marketing: document.getElementById('bk-consent-marketing').checked
      });
    });
  }

  function saveAndClose(consent) {
    consent.timestamp = new Date().toISOString();
    setConsentCookie(consent);
    applyConsent(consent);
    removeBanner();
  }

  function removeBanner() {
    var overlay = document.getElementById('bk-consent-overlay');
    if (overlay) {
      overlay.classList.add('bk-consent-hiding');
      setTimeout(function() { overlay.remove(); }, 300);
    }
  }

  // ============================================================
  // "MANAGE COOKIES" LINK SUPPORT
  // Attach to any element with data-cookie-consent="manage"
  // or class "manage-cookies"
  // ============================================================
  function setupManageCookiesLinks() {
    document.addEventListener('click', function(e) {
      var target = e.target.closest('[data-cookie-consent="manage"], .manage-cookies');
      if (target) {
        e.preventDefault();
        // Remove existing cookie to show banner again
        document.cookie = CONFIG.consentCookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        // Load existing preferences into the form
        var existing = getConsentCookie();
        createBanner();
        if (existing) {
          var cats = document.getElementById('bk-consent-categories');
          var saveRow = document.getElementById('bk-save-row');
          var customizeBtn = document.getElementById('bk-customize');
          cats.style.display = 'block';
          saveRow.style.display = 'flex';
          customizeBtn.style.display = 'none';
          var analyticsBox = document.getElementById('bk-consent-analytics');
          var marketingBox = document.getElementById('bk-consent-marketing');
          if (analyticsBox) analyticsBox.checked = existing.analytics;
          if (marketingBox) marketingBox.checked = existing.marketing;
        }
      }
    });
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================
  function init() {
    var consent = getConsentCookie();
    if (consent) {
      // User already made a choice — apply consent signals
      // GTM is already running with 'denied' defaults;
      // this updates to their stored preferences
      applyConsent(consent);
    } else {
      // No consent yet — GTM runs in denied mode (cookieless pings)
      // Show banner to ask for consent
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBanner);
      } else {
        createBanner();
      }
    }
    setupManageCookiesLinks();
  }

  init();
})();
