import MM_Storage from "./_lib/mm/MM_Storage";

/**
 * Something like a "service locator" object.
 * Name "App" is a little misleading...
 */
export default class App {

    constructor(config) {
        this.config = config;
    }

    get storage() {
        this._storage = this._storage || new MM_Storage('finapp|');
        return this._storage;
    }

    /**
     * DRY
     */
    get creditCategs() {
        let categs = this.config.transactionCategories;
        return categs.filter((c) => c.type === "credit");
    }

    /**
     * DRY
     */
    get debitCategs() {
        let categs = this.config.transactionCategories;
        return categs.filter((c) => c.type === "debit");
    }

    /**
     * DRY
     * @param amt
     * @returns {*}
     */
    getCategsForAmt(amt) {
        return amt < 0 ? this.debitCategs : this.creditCategs;
    }
}

/**
 * A little implementation hack - static property which will hold the actual
 * instance of itself...
 *
 * @type {null}
 */
App.instance = null;
