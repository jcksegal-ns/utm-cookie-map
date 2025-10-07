# UTM Cookie for MAPs

Tiny, copy‑pasteable HTML snippets that persist UTM and referrer data in a cookie (`utmData`) and inject those values into hidden fields on **HubSpot** or **Marketo** forms on page load.

* HubSpot snippet: [`HubSpot-UTMcookie.html`](https://github.com/jcksegal-ns/utm-cookie-map/blob/main/HubSpot-UTMcookie.html)
* Marketo snippet: [`Marketo-UTMcookie.html`](https://github.com/jcksegal-ns/utm-cookie-map/blob/main/Marketo-UTMcookie.html)

> If you only need one MAP, include just that file. If you use both on different pages, include the matching snippet per page.

---

## Why

Attribution dies when a visitor navigates, returns, or clears query strings. This snippet saves inbound parameters in a first‑party cookie and pushes them into your marketing automation form fields so the values land in your CRM.

---

## What it captures

By default the snippet looks for common UTM keys and basic referrer context. Typical keys include:

* `utm_source`
* `utm_medium`
* `utm_campaign`
* `utm_term`
* `utm_content`
* Original referrer URL

> You can extend or rename mappings to match your property names; see **Customize field mapping** below.

---

## How it works

1. **Parse URL**: On page load, read the current URL for UTM parameters.
2. **Persist**: Store values in a cookie named `utmData` so they survive page changes.
3. **Detect a form**: When a HubSpot or Marketo form is present, the script finds matching **hidden fields**.
4. **Populate**: It fills those fields with values from `utmData`.

No external dependencies. Intended to work in Tag Managers or inline in the page `<head>`/`<body>`.

---

## Quick start

### 1) Create hidden fields on your form

Create properties and add hidden inputs for each value you want to capture. Examples:

**HubSpot form field examples**

```html
<!-- Adjust `name` to your HubSpot property API names -->
<input type="hidden" name="utm_source">
<input type="hidden" name="utm_medium">
<input type="hidden" name="utm_campaign">
<input type="hidden" name="utm_term">
<input type="hidden" name="utm_content">
<input type="hidden" name="original_referrer">
```

**Marketo form field examples**

```html
<!-- Adjust `name` to your Marketo field names (API names) -->
<input type="hidden" name="utm_source">
<input type="hidden" name="utm_medium">
<input type="hidden" name="utm_campaign">
<input type="hidden" name="utm_term">
<input type="hidden" name="utm_content">
<input type="hidden" name="original_referrer__c">
```

> Use your actual property API names. Field labels can differ.

### 2) Include the snippet

Place **one** of the provided files on the page *before* the form renders, or deploy via your tag manager with a trigger that fires on page view:

```html
<!-- HubSpot -->
<script src="/path/to/HubSpot-UTMcookie.html"></script>

<!-- Marketo -->
<script src="/path/to/Marketo-UTMcookie.html"></script>
```

If you prefer inline, copy the file contents into an HTML tag in your CMS or GTM Custom HTML tag.

### 3) Test

* Visit a page with `?utm_source=google&utm_medium=cpc&utm_campaign=test`.
* Submit your form.
* Verify the values appear on the submission record in HubSpot/Marketo and sync through to your CRM.

---

## Customize field mapping

If your property names differ from the UTM keys, edit the mapping section in the snippet to define `URL parameter → form field` pairs. Typical customizations:

* Rename `utm_source` to `first_touch_source` (or any field you track)
* Add `gclid`, `fbclid`, or custom parameters
* Map `document.referrer` into a custom `original_referrer` field

> Keep the cookie key (`utmData`) unless you have a collision with another script.

---

## Cookie details

* **Name**: `utmData`
* **Scope**: First‑party. Domain and path follow your page context.
* **Lifetime**: Set in the snippet. Adjust to your policy.
* **Contents**: Key‑value pairs of captured parameters and referrer info.

> Treat cookies carrying marketing attribution as personal data in many jurisdictions. See **Privacy & compliance**.

---

## Deployment options

* **CMS**: Paste the code into your global head/footer includes.
* **GTM or other TMS**: Use a Custom HTML tag. Trigger on All Pages or specific templates.
* **Single‑page apps**: Fire on route changes if UTMs arrive via client‑side navigation.

---

## Troubleshooting

* **Fields are blank**: Ensure the hidden inputs exist and their `name` attributes match the expected property names.
* **UTMs disappear after navigation**: Confirm the cookie is being set. Check devtools → Application → Cookies for `utmData`.
* **Multiple forms on page**: Confirm the snippet targets the correct form API (HubSpot vs Marketo) and runs after the form library loads.
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
