# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains standalone JavaScript snippets that capture UTM parameters and referrer data from URLs, persist them in a first-party cookie (`utmData`), and inject those values into hidden form fields on HubSpot or Marketo marketing automation platform (MAP) forms.

## Architecture

- **Two independent snippets**: `HubSpot-UTMcookie.html` and `Marketo-UTMcookie.html` - each is self-contained and platform-specific
- **No external dependencies**: Pure ES5 JavaScript, GTM-compatible
- **Cookie name**: `utmData` (JSON-stringified object)
- **UTM keys tracked**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, plus `referrer`

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

When modifying these snippets:
- **Cookie expiration**: Change `expirationDays` variable at top of each snippet
- **Field mapping**: Edit the field name arrays/objects to match your MAP property API names
- **Additional parameters**: Add keys to the forEach loop that extracts URL params (e.g., `gclid`, `fbclid`)

## Testing

No automated tests. Manual testing workflow:
1. Add snippet to a page with a HubSpot/Marketo form
2. Visit with UTM parameters: `?utm_source=test&utm_medium=cpc`
3. Verify cookie is set in browser DevTools (Application > Cookies)
4. Submit form and verify values appear in MAP/CRM submission record
