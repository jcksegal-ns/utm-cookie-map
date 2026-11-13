(function () {
	// =====================================================================
	// CONFIGURATION - Modify settings in this section
	// =====================================================================

	// Cookie expiration in days: defaults to 0 for session-only tracking with no 
	// retention across sessions.
	var expirationDays = 0;

	// UTM parameters to capture from URL and their corresponding form field names
	// Format: { 'url_param': 'form_field_name' }
	var utmFieldMap = {
		'utm_source': 'utm_source',
		'utm_medium': 'utm_medium',
		'utm_campaign': 'utm_campaign',
		'utm_content': 'utm_content',
		'utm_term': 'utm_term',
		'msclkid': 'msclkid'              // Bing/Microsoft Ads click ID
	};

	// Form field name for the referrer URL
	var referrerField = 'referrer';

	// Additional browser cookies to capture and map to form fields
	// These capture advertising/analytics identifiers from other platforms
	// Set a value to null or remove the line to disable that cookie
	// Format: { 'cookie_name': 'form_field_name' }
	var cookieFieldMap = {
		'ajs_anonymous_id': 'ajs_anonymous_id',  // Segment anonymous ID
		'li_fat_id': 'li_fat_id',                // LinkedIn click ID
		'_gcl_aw': 'gcl_aw',                     // Google Ads click ID
		'_fbp': 'fbp',                           // Facebook pixel browser ID
		'_fbc': 'fbc'                            // Facebook click ID
	};

	// Set to true to capture Google Analytics Client ID from _ga cookie
	var captureGAClientId = true;
	var gaClientIdField = 'ga_client_id';

	// =====================================================================
	// DO NOT MODIFY BELOW THIS LINE
	// =====================================================================

	function getCookie(name) {
		var nameEQ = name + '=';
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') c = c.substring(1);
			if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
		}
		return null;
	}

	function setCookie(name, value, days) {
		var expires = '';
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = '; expires=' + date.toUTCString();
		}
		document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
	}

	function getQueryParams() {
		var params = {};
		var queryString = window.location.search.substring(1);
		if (!queryString) return params;

		var pairs = queryString.split('&');
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split('=');
			var key = decodeURIComponent(pair[0]);
			var value = pair.length > 1 ? decodeURIComponent(pair[1].replace(/\+/g, ' ')) : '';
			params[key] = value;
		}
		return params;
	}

	function getGAClientId() {
		var gaCookie = getCookie('_ga');
		if (!gaCookie) return null;
		// _ga format: GA1.1.1234567890.1234567890 - client ID is last two parts
		var parts = gaCookie.split('.');
		if (parts.length >= 4) {
			return parts.slice(2).join('.');
		}
		return null;
	}

	function setUTMDataCookie() {
		var queryParams = getQueryParams();
		var utmData = {};

		// Extract UTM parameters from the URL
		for (var param in utmFieldMap) {
			if (utmFieldMap.hasOwnProperty(param) && queryParams[param]) {
				utmData[utmFieldMap[param]] = queryParams[param];
			}
		}

		// Include the referrer URL
		if (referrerField) {
			utmData[referrerField] = document.referrer || '';
		}

		// Set cookie if it doesn't already exist
		if (!getCookie('utmData')) {
			setCookie('utmData', JSON.stringify(utmData), expirationDays);
		}
	}
	setUTMDataCookie();

	function getUTMData() {
		var cookie = getCookie('utmData');
		return cookie ? JSON.parse(cookie) : null;
	}

	function getAdditionalCookieData() {
		var data = {};

		// Capture mapped cookies
		for (var cookieName in cookieFieldMap) {
			if (cookieFieldMap.hasOwnProperty(cookieName) && cookieFieldMap[cookieName]) {
				var value = getCookie(cookieName);
				if (value) {
					data[cookieFieldMap[cookieName]] = value;
				}
			}
		}

		// Capture GA Client ID
		if (captureGAClientId && gaClientIdField) {
			var gaClientId = getGAClientId();
			if (gaClientId) {
				data[gaClientIdField] = gaClientId;
			}
		}

		return data;
	}

	function getAllFieldData() {
		var utmData = getUTMData() || {};
		var cookieData = getAdditionalCookieData();
		// Merge UTM data with cookie data
		for (var key in cookieData) {
			if (cookieData.hasOwnProperty(key)) {
				utmData[key] = cookieData[key];
			}
		}
		return utmData;
	}

	function getAllFieldNames() {
		var fields = [];
		// Add UTM field names
		for (var param in utmFieldMap) {
			if (utmFieldMap.hasOwnProperty(param)) {
				fields.push(utmFieldMap[param]);
			}
		}
		// Add referrer field
		if (referrerField) {
			fields.push(referrerField);
		}
		// Add cookie field names
		for (var cookieName in cookieFieldMap) {
			if (cookieFieldMap.hasOwnProperty(cookieName) && cookieFieldMap[cookieName]) {
				fields.push(cookieFieldMap[cookieName]);
			}
		}
		// Add GA Client ID field
		if (captureGAClientId && gaClientIdField) {
			fields.push(gaClientIdField);
		}
		return fields;
	}

	// Populate a V4 form instance
	function populateV4Form(form) {
		var fieldData = getAllFieldData();
		if (!fieldData || Object.keys(fieldData).length === 0) return;

		form.getFormFieldValues().then(function (result) {
			for (var key in result) {
				var name = result[key].name;
				var fieldName = name.split('/')[1];
				if (fieldData[fieldName]) {
					form.setFieldValue(name, fieldData[fieldName]);
				}
			}
		});
	}

	// Documents to search for legacy forms: the page, plus any same-origin
	// HubSpot form iframes (iframe embeds render the form inside one)
	function getLegacyDocs() {
		var docs = [document];
		var frames = document.querySelectorAll('iframe.hs-form-iframe');
		for (var i = 0; i < frames.length; i++) {
			try {
				if (frames[i].contentDocument) docs.push(frames[i].contentDocument);
			} catch (e) { /* cross-origin iframe: skip */ }
		}
		return docs;
	}

	// Find a legacy form element by form ID, in the page or a form iframe
	function findLegacyForms(formId) {
		var selector = 'form[data-form-id="' + formId + '"], form[id^="hsForm_' + formId + '"]';
		var forms = [];
		getLegacyDocs().forEach(function (doc) {
			var found = doc.querySelectorAll(selector);
			for (var i = 0; i < found.length; i++) forms.push(found[i]);
		});
		return forms;
	}

	// Populate legacy form via DOM. With a form ID, fills that form; without one
	// (or if it isn't found), searches the page and every form iframe.
	function populateLegacyForm(formId) {
		var fieldData = getAllFieldData();
		if (!fieldData || Object.keys(fieldData).length === 0) return;

		var scopes = formId ? findLegacyForms(formId) : [];
		if (scopes.length === 0) scopes = getLegacyDocs();

		var fields = getAllFieldNames();
		scopes.forEach(function (scope) {
			fields.forEach(function (fieldName) {
				var input = scope.querySelector("input[name='" + fieldName + "']");
				if (input && fieldData[fieldName]) {
					input.value = fieldData[fieldName];
				}
			});
		});
	}

	// V4 Forms: Handle existing forms and listen for future forms
	if (typeof HubSpotFormsV4 === 'object') {
		HubSpotFormsV4.getForms().forEach(function (form) {
			populateV4Form(form);
		});
	}
	window.addEventListener('hs-form-event:on-ready', function (event) {
		if (typeof HubSpotFormsV4 === 'object') {
			var form = HubSpotFormsV4.getFormFromEvent(event);
			if (form) {
				populateV4Form(form);
			}
		}
	});

	// Legacy Forms: Handle existing forms and listen for future forms
	populateLegacyForm(null);
	window.addEventListener('message', function (event) {
		if (event.data && event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
			populateLegacyForm(event.data.id);
		}
	});
})();
