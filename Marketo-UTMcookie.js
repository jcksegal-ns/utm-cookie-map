(function() {
    // =====================================================================
    // CONFIGURATION - Modify settings in this section
    // =====================================================================

    // Cookie expiration in days
    var expirationDays = 7;

    // UTM parameters to capture from URL and their corresponding Marketo field names
    // Format: { 'url_param': 'marketo_field_name' }
    var utmFieldMap = {
        'utm_source': 'UTM_Source__c',
        'utm_medium': 'UTM_Medium__c',
        'utm_campaign': 'UTM_Campaign__c',
        'utm_content': 'UTM_Content__c',
        'utm_term': 'UTM_Term__c'
    };

    // Marketo field name for the referrer URL
    var referrerField = 'referrer';

    // Additional browser cookies to capture and map to Marketo fields
    // These capture advertising/analytics identifiers from other platforms
    // Set a value to null or remove the line to disable that cookie
    // Format: { 'cookie_name': 'marketo_field_name' }
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

        // Extract UTM parameters from the URL (store with original param names)
        for (var param in utmFieldMap) {
            if (utmFieldMap.hasOwnProperty(param) && queryParams[param]) {
                utmData[param] = queryParams[param];
            }
        }

        // Include the referrer URL
        utmData.referrer = document.referrer || '';

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

    function populateMarketoForm(form) {
        var utmData = getUTMData();
        var cookieData = getAdditionalCookieData();
        var formValues = {};

        // Map UTM data to Marketo field names
        if (utmData) {
            for (var param in utmFieldMap) {
                if (utmFieldMap.hasOwnProperty(param) && utmData[param]) {
                    formValues[utmFieldMap[param]] = utmData[param];
                }
            }
            // Add referrer
            if (referrerField && utmData.referrer) {
                formValues[referrerField] = utmData.referrer;
            }
        }

        // Add cookie data (already mapped to field names)
        for (var field in cookieData) {
            if (cookieData.hasOwnProperty(field)) {
                formValues[field] = cookieData[field];
            }
        }

        // Set all values on the form
        if (Object.keys(formValues).length > 0) {
            form.vals(formValues);
        }
    }

    function initMarketoForms() {
        if (typeof MktoForms2 !== 'object') {
            document.addEventListener('load', initMarketoForms, true);
        } else if (!initMarketoForms.done) {
            document.removeEventListener('load', initMarketoForms, true);
            initMarketoForms.done = true;
            MktoForms2.whenReady(populateMarketoForm);
        }
    }
    initMarketoForms();
})();
