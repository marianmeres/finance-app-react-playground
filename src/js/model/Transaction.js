import App from "../App";
import {mm_getRandomInt, mm_uid} from "../_lib/mm/utils";

export default class Transaction {

    constructor(data) {
        this._data = Object.assign({}, Transaction.defaults, data || {});
    }

    get id() { return this._data.id; }
    get label() { return this._data.label; }
    get category() { return this._data.category; }
    get amount() { return this._data.amount; }
    get created() { return this._data.created; }

    set label(v) { this._data.label = `${v}`.trim(); }
    set category(v) { this._data.category = `${v}`.trim(); }
    set amount(v) { return this._data.amount = parseFloat(v); }

    toJSON() {
        return this._data;
    }

    static get defaults() {
        return {
            id: mm_uid(),
            label: null,
            category: null,
            amount: null,
            created: new Date(),
        }
    }

    /**
     * @returns {Transaction}
     */
    static factoryRandom() {
        let categs = App.instance.config.transactionCategories;
        let categ = categs[mm_getRandomInt(0, categs.length - 1)];
        let amount = mm_getRandomInt(1, 2000);
        if (categ.type === 'debit') amount *= -1;
        let now = Date.now();
        return new Transaction({
            label: `Untitled`,
            category: categ.label,
            amount: amount,
            created: new Date(mm_getRandomInt(now, (now - (60 * 60 * 24 * 7 * 1000)))),
        });
    }
}