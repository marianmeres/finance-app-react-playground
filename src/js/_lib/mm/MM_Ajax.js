/**
 * @param method
 * @param url
 * @param data
 * @returns {Promise}
 * @private
 */
function _request(method, url, data) {

    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        xhr.onload = function() { // onload === readyState.DONE
            if (xhr.status >= 200 && xhr.status < 400) {
                resolve(xhr.responseText);
            } else {
                reject(Error(xhr.statusText)); // server error
            }
        };

        xhr.onerror = function() { // network error
            reject(Error("Network Error"));
        };

        xhr.send(data ? _serialize(data) : null);
    });

}

/**
 * @param params
 * @returns {string}
 * @private
 */
function _serialize(params) {
    return Object
        .keys(params || {})
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
}

/**
 *
 */
export default class MM_Ajax {

    /**
     * @param url
     * @param data
     * @returns {Promise}
     */
    static get(url, data) {
        if (data) {
            url += (/\?/.test(url) ? `&` : `?`) + _serialize(data);
        }
        return _request('GET', url, null);
    }

    /**
     * @param url
     * @param data
     * @returns {Promise}
     */
    static post(url, data) {
        return _request('POST', url, data);
    }

}


