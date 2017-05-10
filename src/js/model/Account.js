import App from "../App";
import Transaction from "./Transaction";
import {mm_formatMoney, mm_getRandomInt, mm_uid} from "../_lib/mm/utils";

export default class Account {

    constructor(data) {
        this._data = Object.assign({}, Account.defaults, data || {});
    }

    get id() { return this._data.id; }
    get label() { return this._data.label; }
    get transactions() { return this._data.transactions; }

    get balance() {
        return this.transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    get balanceFormatted() {
        return mm_formatMoney(this.balance, 2);
    }

    set label(val) {
        this._data.label = val.trim();
    }

    get lastTransaction() {
        let t = this.transactions;
        if (t.length) return t[t.length-1];
    }

    toJSON() {
        return this._data;
    }

    static get defaults() {
        return {
            id: mm_uid(),
            label: null,
            transactions: []
        }
    }

    /**
     * @param userId
     * @param accountId
     * @returns {Promise.<TResult>}
     */
    static fechOneByUserIdAndAccountId(userId, accountId) {
        return Account
            .fetchAllByUserId(userId)
            .then((accounts) => {
                return Promise.resolve(
                    accounts ? accounts.filter((a) => a.id === accountId)[0] : null
                );
            });
    }

    /**
     * I'm simulating the implementation to be async (to be closer to the real world)
     * @param userId
     * @returns {Promise}
     */
    static fetchAllByUserId(userId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let rows = App.instance.storage.getItem(`accounts${userId}`);
                let accounts = (rows && rows.length)
                    ? rows.map((row) => {
                        if (row.transactions.length) {
                            row.transactions = row.transactions.map((d) => new Transaction(d))
                        }
                        return new Account(row)
                    })
                    : null;
                resolve(accounts);
            }, 100);
        });
    }

    /**
     * I'm simulating the implementation to be async (to be closer to the real world)
     * @param userId
     * @param accounts
     * @returns {Promise}
     */
    static saveAllForUserId(userId, accounts) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                App.instance.storage.setItem(`accounts${userId}`, accounts);
                resolve(accounts);
            }, 100);
        });
    }

    /**
     * @returns {Promise}
     */
    static getRandomSample() {
        let accounts = [];
        ['My personal primary', 'My personal secondary', 'My little business']
            .forEach((label) => {
                accounts.push(new Account({
                    label: label,
                    transactions: (new Array(mm_getRandomInt(3, 5)))
                        .fill(1) // otherwise below map won't work... wtf?... apparently "Array(1)" is not same as "[undefined]"
                        .map(Transaction.factoryRandom)
                        .sort((a, b) => a.created.valueOf() - b.created.valueOf())
                }));
            });
        return accounts;
    }

    /**
     * I'm simulating the implementation to be async (to be closer to the real world)
     * @param userId
     * @returns {Promise}
     */
    static deleteAllByUserId(userId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                App.instance.storage.removeItem(`accounts${userId}`);
                resolve();
            }, 100);
        });
    }

}