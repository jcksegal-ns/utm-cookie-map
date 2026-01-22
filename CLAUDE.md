# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains standalone JavaScript snippets that capture UTM parameters and referrer data from URLs, persist them in a first-party cookie (`utmData`), and inject those values into hidden form fields on HubSpot or Marketo marketing automation platform (MAP) forms.

## Architecture

- **Two independent snippets** for HubSpot and Marketo, each available in two formats:
  - `.js` files: For CDN hosting or `<script src>` loading
  - `.html` files: For GTM Custom HTML tags (includes `<script>` wrapper)
- **CDN hosting**: Files served via jsDelivr at `https://cdn.jsdelivr.net/gh/jcksegal-ns/utm-cookie-map@main/`
- **No external dependencies**: Pure ES5 JavaScript, GTM-compatible
- **Cookie name**: `utmData` (JSON-stringified object storing UTM params and referrer)
- **Configuration section**: All user-configurable settings are at the top of each snippet, above a "DO NOT MODIFY BELOW THIS LINE" comment

### Data captured
- UTM parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- Referrer URL
- Additional platform cookies (configurable): Segment (`ajs_anonymous_id`), LinkedIn (`li_fat_id`), Google Ads (`_gcl_aw`), Facebook (`_fbp`, `_fbc`), GA4 Client ID (`_ga`)

## Key Implementation Details

### HubSpot snippet
- Handles both V4 and legacy HubSpot forms independently
- **V4 forms**: Uses `HubSpotFormsV4.getForms()` for existing forms + `hs-form-event:on-ready` listener for future forms. Populates via `form.setFieldValue()`. Field names use format `namespace/fieldname`.
- **Legacy forms**: Direct DOM input selection for existing forms + `message` event listener for `hsFormCallback` events for future forms
- Hybrid approach handles GTM's async loading (forms may already exist or load later)
- Default cookie expiration: 7 days

### Marketo snippet
- Uses load event listener to detect when `MktoForms2` is available
- `MktoForms2.whenReady()` handles both existing and future forms
- Populates fields via `form.vals()` with Salesforce-style field names (e.g., `UTM_Campaign__c`)
- Default cookie expiration: 7 days

## Customization Points

All configuration is in the top section of each snippet (above "DO NOT MODIFY BELOW THIS LINE"):

- **`expirationDays`**: Cookie expiration in days (default: 7)
- **`utmFieldMap`**: Maps URL parameters to form field names
- **`referrerField`**: Form field name for the referrer URL
- **`cookieFieldMap`**: Maps browser cookies (ad platform IDs) to form field names. Set value to `null` to disable.
- **`captureGAClientId`** / **`gaClientIdField`**: Toggle and field name for GA4 Client ID

## Testing

No automated tests. Manual testing workflow:
1. Add snippet to a page with a HubSpot/Marketo form
2. Visit with UTM parameters: `?utm_source=test&utm_medium=cpc`
3. Verify cookie is set in browser DevTools (Application > Cookies)
4. Submit form and verify values appear in MAP/CRM submission record
