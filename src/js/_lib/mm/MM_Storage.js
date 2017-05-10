
/**
 * Few utilities on top of session/localStorage:
 * - normalized values de/serialization
 * - expiration features ("valid until")
 * - auto namespace prefix
 * - ...
 */
export default class MM_Storage {

    /**
     * @param _prefix
     * @param isSession
     * @param _defaultTtlMs
     */
    constructor(_prefix, isSession = false, _defaultTtlMs = 0) {
        this._prefix = _prefix;
        this._storage = isSession ? window.sessionStorage : window.localStorage;
        this._defaultTtlMs = _defaultTtlMs;
        this.logger = (err) => console.warn(`MM_Storage: ${err}`);
    }

    /**
     * @param msg
     */
    log(msg) {
        MM_Storage._isFunction(this.logger) && this.logger(msg);
    }

    /**
     * API for direct access to underlying storage
     * @returns {Storage}
     */
    get native() {
        return this._storage;
    }

    /**
     * @param key
     * @param val
     */
    setItemNative(key, val) {
        try {
            this.native.setItem(key, val);
        } catch(e) {
            console.error(e);
            this.log(`!setItem(${key}) ${e}`);
        }
    }

    /**
     * @param key
     * @returns {string|null}
     */
    getItemNative(key) {
        return this.native.getItem(key);
    }

    /**
     * @param key
     * @param val
     * @param ttlMs
     * @returns {MM_Storage}
     */
    setItem(key, val, ttlMs = null) {
        if (ttlMs === null) ttlMs = this._defaultTtlMs;
        try {
            this._storage.setItem(this._key(key), JSON.stringify({
                _validUntil: (ttlMs ? (new Date(Date.now() + ttlMs)) : 0),
                payload: val,
            }));
        } catch(e) {
            console.error(e);
            this.log(`!setItem(${key}) ${e}`);
            if (/quota/i.test(e)) this.removeExpired(); // too naive?
        }
        return this;
    }

    /**
     * @param key
     * @param fallbackValue
     * @returns {any}
     */
    getItem(key, fallbackValue = null) {
        key = this._key(key);
        let val = this._storage.getItem(key);
        if (null === val) return val; // not found
        try {

            val = JSON.parse(val);

            if (!val || val['payload'] === void 0 || val['_validUntil'] === void 0) { // wrong format?
                this._storage.removeItem(key);
                return null;
            }

            // 0 = valid always
            if (val['_validUntil'] && (new Date(val['_validUntil'])) < (new Date())) {
                this._storage.removeItem(key);
                return null;
            }

            val = val['payload'];

            if (val === null && fallbackValue !== void 0) { // val = null is legit
                val = fallbackValue;
            }
            return val;

        } catch (e) { // corrupted json?
            console.error(e);
        }

        return null;
    }

    /**
     * @param key
     * @returns {MM_Storage}
     */
    removeItem(key) {
        this._storage.removeItem(this._key(key));
        return this;
    }

    /**
     * @returns {MM_Storage}
     */
    removeAll() {
        this._storage.clear();
        return this;
    }

    /**
     *
     */
    removeExpired() {
        this.log(`removeExpired()`);
        for (let i = 0, len = this._storage.length; i < len; ++i) {
            let key = this._storage.key(i);
            this.getItem(key); // this cleans up
        }
    }

    /**
     * @param rgxStr
     * @param prefix
     * @returns {number}
     */
    removeMatching(rgxStr, prefix = null) {
        if (prefix === null) prefix = this._prefix;
        let rx = new RegExp(
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            "^" + (prefix + rgxStr).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'
        );
        //console.log(rx);
        let counter = 0;
        for (let i = 0; i < this._storage.length; ++i) {
            let key = this._storage.key(i);
            if (rx.test(key)) {
                this._storage.removeItem(key);
                counter++;
                i--; // because remove above has shortened the length
            }
        }
        return counter;
    }

    /**
     * @param key
     * @returns {string}
     * @private
     */
    _key(key) {
        return this._prefix + key;
    }

    /**
     * taken from underscore
     * @param obj
     * @returns {boolean}
     * @private
     */
    static _isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }

}
