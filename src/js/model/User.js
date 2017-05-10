import MM_Ajax from "../_lib/mm/MM_Ajax";
import App from "../App";

export default class User {

    constructor(data) {
        this._data = Object.assign({}, User.defaults, data || {});
    }

    get id()         { return this._data.id; }
    get first_name() { return this._data.first_name; }
    get last_name()  { return this._data.last_name; }
    get avatar()     { return this._data.avatar; }
    get name()       { return `${this.first_name} ${this.last_name}`.trim(); }

    toJSON() {
        return this._data;
    }

    save() {
        return User.save(this);
    }

    isAuthenticated() {
        return !!this.id; // quick-n-dirty
    }

    static get defaults() {
        return {
            id: null,
            first_name: null,
            last_name: null,
            avatar: null,
        }
    }

    /**
     * Saves current app user to storage.
     *
     * I'm simulating the implementation to be async (to be closer to the real world)
     *
     * @param dataOrUser
     * @returns {Promise}
     */
    static save(dataOrUser) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                App.instance.storage.setItem('user', dataOrUser);
                resolve(dataOrUser instanceof User ? dataOrUser : new User(dataOrUser));
            }, 100);
        });
    }

    /**
     * Fetches current app user data from storage. If we would be fetching from server,
     * the actual lower level request (ajax, websockets...) would need to obviously
     * send some credentials (via cookie or otherwise). This is completely omitted here.
     *
     * I'm simulating the implementation to be async (to be closer to the real world)
     *
     * @returns {Promise}
     */
    static fetch() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let data = App.instance.storage.getItem('user');
                resolve(data ? new User(data) : null)
            }, 100);
        });
    }

    /**
     *
     * @param username
     * @param password
     * @returns {Promise.<TResult>}
     */
    static fetchByUsernameAndPassword(username, password) {

        return MM_Ajax
            .post(App.instance.config.loginApiEndpoint, {username, password}) // es6 short notation!
            .then((respTxt) => {
                let data = JSON.parse(respTxt);
                if (data.error) throw new Error(data.error);
                return new User(data.payload)
            })
            .catch((msg) => {
                // first, "low level" catch (to be improved in a real world... perhaps with some logging...)
                alert(`Error: ${msg}`);
                // and rethrow to allow handling in upper level context too
                throw msg;
            });

    }
}
