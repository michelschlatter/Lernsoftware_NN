/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */


//Original Source: https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js/42993094
/**
 * Gets a parameter from url
 * @param {string} urlParam
 */
var getUrlParameter = function getUrlParameter(urlParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === urlParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

/**
 * Santizes the HTML to prevent XSS
 * @param {string} html
 */
var sanitizeHtml = function (html) { 
    if (html) {
        if (typeof html !== 'string') {
            html = html.toString();
        }

        html = html.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .replace(/`/g, '&#x60;')
            .replace(/=/g, '&#x3D;');
    }
    return html;
}

  /**
     * Compares if two floats are equal
     * @param {int} digitsCount
     * @param {float} float1
     * @param {float} float2
     * @returns {bool}
     */
    var compareFloat = function (digits, float1, float2) {
        let factor = Math.pow(10, digits);
        return parseFloat((Math.round(float1 * factor) / factor).toFixed(digits)) == parseFloat((Math.round(float2 * factor) / factor).toFixed(digits));
    }