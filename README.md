# UTM Cookie for MAPs

Tiny, copy‑pasteable HTML snippets that persist UTM and referrer data in a cookie (`utmData`) and inject those values into hidden fields on **HubSpot** or **Marketo** forms.

* HubSpot snippet: [`HubSpot-UTMcookie.html`](https://github.com/jcksegal-ns/utm-cookie-map/blob/main/HubSpot-UTMcookie.html)
* Marketo snippet: [`Marketo-UTMcookie.html`](https://github.com/jcksegal-ns/utm-cookie-map/blob/main/Marketo-UTMcookie.html)

**Zero dependencies** · **ES5 compatible** · **GTM ready**

> If you only need one MAP, include just that file. If you use both on different pages, include the matching snippet per page.

---

## Why

Attribution dies when a visitor navigates, returns, or clears query strings. This snippet saves inbound parameters in a first‑party cookie and pushes them into your marketing automation form fields so the values land in your CRM.

---

## What it captures

**UTM parameters** (from URL query string):

* `utm_source`
* `utm_medium`
* `utm_campaign`
* `utm_term`
* `utm_content`
* Original referrer URL

**Additional platform cookies** (read from browser):

* `ajs_anonymous_id` — Segment anonymous ID
* `li_fat_id` — LinkedIn click ID
* `_gcl_aw` — Google Ads click ID
* `_fbp` — Facebook pixel browser ID
* `_fbc` — Facebook click ID
* `_ga` — Google Analytics Client ID (parsed)

> All field mappings are configurable in the snippet's configuration section.

---

## How it works

1. **Parse URL**: On page load, read the current URL for UTM parameters.
2. **Persist**: Store values in a cookie named `utmData` (7-day expiration) so they survive page changes.
3. **Detect forms**: Listen for form ready events to catch both existing and dynamically loaded forms.
4. **Populate**: Fill hidden fields with values from `utmData`.

### HubSpot form detection

* **V4 forms**: Uses `hs-form-event:on-ready` event + `HubSpotFormsV4` API
* **Legacy forms**: Uses `hsFormCallback` message events + DOM selection

### Marketo form detection

* Uses `MktoForms2.whenReady()` which handles both existing and future forms

Pure ES5 JavaScript with no external dependencies. Works in Google Tag Manager Custom HTML tags or inline in the page.

---

## Quick start

### 1) Create hidden fields on your form

Create properties and add hidden inputs for each value you want to capture. Examples:

**HubSpot form field examples**

Create hidden fields in your HubSpot form with these property names:

* `utm_source`
* `utm_medium`
* `utm_campaign`
* `utm_term`
* `utm_content`
* `referrer`

For additional cookies: `ajs_anonymous_id`, `li_fat_id`, `gcl_aw`, `fbp`, `fbc`, `ga_client_id`

The snippet handles both V4 forms (via API) and legacy forms (via DOM).

**Marketo form field examples**

The snippet expects Salesforce-style API names by default:

* `UTM_Source__c`
* `UTM_Medium__c`
* `UTM_Campaign__c`
* `UTM_Term__c`
* `UTM_Content__c`
* `referrer`

For additional cookies: `ajs_anonymous_id`, `li_fat_id`, `gcl_aw`, `fbp`, `fbc`, `ga_client_id`

> Edit `utmFieldMap` and `cookieFieldMap` in the configuration section to match your Marketo field API names.

### 2) Include the snippet

**Google Tag Manager (recommended)**

1. Create a new Custom HTML tag
2. Copy the entire contents of the snippet file
3. Set trigger to "All Pages" or your preferred page view trigger

The snippet uses event listeners to detect forms, so it works regardless of whether it fires before or after the form loads.

**Direct include**

```html
<script src="/path/to/HubSpot-UTMcookie.html"></script>
<!-- or -->
<script src="/path/to/Marketo-UTMcookie.html"></script>
```

### 3) Test

* Visit a page with `?utm_source=google&utm_medium=cpc&utm_campaign=test`.
* Submit your form.
* Verify the values appear on the submission record in HubSpot/Marketo and sync through to your CRM.

---

## Configuration

All settings are in the **CONFIGURATION** section at the top of each snippet (above "DO NOT MODIFY BELOW THIS LINE").

| Variable | Purpose |
|----------|---------|
| `expirationDays` | Cookie expiration in days (default: 7) |
| `utmFieldMap` | Maps URL params to form field names |
| `referrerField` | Form field name for referrer URL |
| `cookieFieldMap` | Maps browser cookies to form field names |
| `captureGAClientId` | Enable/disable GA Client ID capture |
| `gaClientIdField` | Form field name for GA Client ID |

**To disable a cookie**: Set its value to `null` in `cookieFieldMap`, or remove the line.

**To add a custom parameter**: Add an entry to `utmFieldMap` (for URL params) or `cookieFieldMap` (for cookies).

---

## Cookie details

* **Name**: `utmData`
* **Scope**: First‑party. Domain and path follow your page context.
* **Lifetime**: 7 days by default. Change `expirationDays` in the snippet to adjust.
* **Contents**: JSON-encoded object with UTM parameters and referrer.

> Treat cookies carrying marketing attribution as personal data in many jurisdictions. See **Privacy & compliance**.

---

## Deployment options

* **CMS**: Paste the code into your global head/footer includes.
* **GTM or other TMS**: Use a Custom HTML tag. Trigger on All Pages or specific templates.
* **Single‑page apps**: Fire on route changes if UTMs arrive via client‑side navigation.

---

## Troubleshooting

* **Fields are blank**: Ensure hidden fields exist with `name` attributes matching the field names in `utmFieldMap` and `cookieFieldMap`.
* **UTMs disappear after navigation**: Check devtools → Application → Cookies for `utmData`.
* **HubSpot V4 fields not populating**: V4 field names use format `namespace/fieldname`. The snippet extracts the part after the `/` to match.
* **Marketo fields not populating**: Verify your Marketo field API names match those in the configuration section.
* **Additional cookies not captured**: Ensure the third-party script (GA, Facebook, etc.) has set the cookie before this snippet runs.
* **Consent banners**: If you gate cookies behind consent, fire this script only after marketing consent is granted.

---

## Privacy & compliance

This project stores user attribution data in a first‑party cookie. Ensure your consent banner and privacy policy disclose this and that you respect regional requirements (GDPR, CCPA).

---

## Roadmap ideas

* Optional first‑touch vs last‑touch handling
* Expiration strategy and overwrite rules
* Built‑in mapping config for popular field schemas

Open issues or PRs if you want these.

---

## Contributing

Fork, branch, and open a pull request. Include a brief test plan describing how you validated form population in your MAP.

---

## License

MIT. See `LICENSE` if present, or include one in your fork.

---

## Support

Questions or implementation help: **[jack@netspinnr.com](mailto:jack@netspinnr.com)**.

If this saved you time, consider a tip: <[https://buy.st](https://buy.st)
