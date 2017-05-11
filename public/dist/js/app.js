(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MM_Storage = require("./_lib/mm/MM_Storage");

var _MM_Storage2 = _interopRequireDefault(_MM_Storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Something like a "service locator" object.
 * Name "App" is a little misleading...
 */
var App = function () {
    function App(config) {
        _classCallCheck(this, App);

        this.config = config;
    }

    _createClass(App, [{
        key: "getCategsForAmt",


        /**
         * DRY
         * @param amt
         * @returns {*}
         */
        value: function getCategsForAmt(amt) {
            return amt < 0 ? this.debitCategs : this.creditCategs;
        }
    }, {
        key: "storage",
        get: function get() {
            this._storage = this._storage || new _MM_Storage2.default('finapp|');
            return this._storage;
        }

        /**
         * DRY
         */

    }, {
        key: "creditCategs",
        get: function get() {
            var categs = this.config.transactionCategories;
            return categs.filter(function (c) {
                return c.type === "credit";
            });
        }

        /**
         * DRY
         */

    }, {
        key: "debitCategs",
        get: function get() {
            var categs = this.config.transactionCategories;
            return categs.filter(function (c) {
                return c.type === "debit";
            });
        }
    }]);

    return App;
}();

/**
 * A little implementation hack - static property which will hold the actual
 * instance of itself...
 *
 * @type {null}
 */


exports.default = App;
App.instance = null;
},{"./_lib/mm/MM_Storage":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @param method
 * @param url
 * @param data
 * @returns {Promise}
 * @private
 */
function _request(method, url, data) {

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        xhr.onload = function () {
            // onload === readyState.DONE
            if (xhr.status >= 200 && xhr.status < 400) {
                resolve(xhr.responseText);
            } else {
                reject(Error(xhr.statusText)); // server error
            }
        };

        xhr.onerror = function () {
            // network error
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
    return Object.keys(params || {}).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
}

/**
 *
 */

var MM_Ajax = function () {
    function MM_Ajax() {
        _classCallCheck(this, MM_Ajax);
    }

    _createClass(MM_Ajax, null, [{
        key: 'get',


        /**
         * @param url
         * @param data
         * @returns {Promise}
         */
        value: function get(url, data) {
            if (data) {
                url += (/\?/.test(url) ? '&' : '?') + _serialize(data);
            }
            return _request('GET', url, null);
        }

        /**
         * @param url
         * @param data
         * @returns {Promise}
         */

    }, {
        key: 'post',
        value: function post(url, data) {
            return _request('POST', url, data);
        }
    }]);

    return MM_Ajax;
}();

exports.default = MM_Ajax;
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Few utilities on top of session/localStorage:
 * - normalized values de/serialization
 * - expiration features ("valid until")
 * - auto namespace prefix
 * - ...
 */
var MM_Storage = function () {

    /**
     * @param _prefix
     * @param isSession
     * @param _defaultTtlMs
     */
    function MM_Storage(_prefix) {
        var isSession = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var _defaultTtlMs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        _classCallCheck(this, MM_Storage);

        this._prefix = _prefix;
        this._storage = isSession ? window.sessionStorage : window.localStorage;
        this._defaultTtlMs = _defaultTtlMs;
        this.logger = function (err) {
            return console.warn('MM_Storage: ' + err);
        };
    }

    /**
     * @param msg
     */


    _createClass(MM_Storage, [{
        key: 'log',
        value: function log(msg) {
            MM_Storage._isFunction(this.logger) && this.logger(msg);
        }

        /**
         * API for direct access to underlying storage
         * @returns {Storage}
         */

    }, {
        key: 'setItemNative',


        /**
         * @param key
         * @param val
         */
        value: function setItemNative(key, val) {
            try {
                this.native.setItem(key, val);
            } catch (e) {
                console.error(e);
                this.log('!setItem(' + key + ') ' + e);
            }
        }

        /**
         * @param key
         * @returns {string|null}
         */

    }, {
        key: 'getItemNative',
        value: function getItemNative(key) {
            return this.native.getItem(key);
        }

        /**
         * @param key
         * @param val
         * @param ttlMs
         * @returns {MM_Storage}
         */

    }, {
        key: 'setItem',
        value: function setItem(key, val) {
            var ttlMs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            if (ttlMs === null) ttlMs = this._defaultTtlMs;
            try {
                this._storage.setItem(this._key(key), JSON.stringify({
                    _validUntil: ttlMs ? new Date(Date.now() + ttlMs) : 0,
                    payload: val
                }));
            } catch (e) {
                console.error(e);
                this.log('!setItem(' + key + ') ' + e);
                if (/quota/i.test(e)) this.removeExpired(); // too naive?
            }
            return this;
        }

        /**
         * @param key
         * @param fallbackValue
         * @returns {any}
         */

    }, {
        key: 'getItem',
        value: function getItem(key) {
            var fallbackValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            key = this._key(key);
            var val = this._storage.getItem(key);
            if (null === val) return val; // not found
            try {

                val = JSON.parse(val);

                if (!val || val['payload'] === void 0 || val['_validUntil'] === void 0) {
                    // wrong format?
                    this._storage.removeItem(key);
                    return null;
                }

                // 0 = valid always
                if (val['_validUntil'] && new Date(val['_validUntil']) < new Date()) {
                    this._storage.removeItem(key);
                    return null;
                }

                val = val['payload'];

                if (val === null && fallbackValue !== void 0) {
                    // val = null is legit
                    val = fallbackValue;
                }
                return val;
            } catch (e) {
                // corrupted json?
                console.error(e);
            }

            return null;
        }

        /**
         * @param key
         * @returns {MM_Storage}
         */

    }, {
        key: 'removeItem',
        value: function removeItem(key) {
            this._storage.removeItem(this._key(key));
            return this;
        }

        /**
         * @returns {MM_Storage}
         */

    }, {
        key: 'removeAll',
        value: function removeAll() {
            this._storage.clear();
            return this;
        }

        /**
         *
         */

    }, {
        key: 'removeExpired',
        value: function removeExpired() {
            this.log('removeExpired()');
            for (var i = 0, len = this._storage.length; i < len; ++i) {
                var key = this._storage.key(i);
                this.getItem(key); // this cleans up
            }
        }

        /**
         * @param rgxStr
         * @param prefix
         * @returns {number}
         */

    }, {
        key: 'removeMatching',
        value: function removeMatching(rgxStr) {
            var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (prefix === null) prefix = this._prefix;
            var rx = new RegExp(
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            "^" + (prefix + rgxStr).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            //console.log(rx);
            var counter = 0;
            for (var i = 0; i < this._storage.length; ++i) {
                var key = this._storage.key(i);
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

    }, {
        key: '_key',
        value: function _key(key) {
            return this._prefix + key;
        }

        /**
         * taken from underscore
         * @param obj
         * @returns {boolean}
         * @private
         */

    }, {
        key: 'native',
        get: function get() {
            return this._storage;
        }
    }], [{
        key: '_isFunction',
        value: function _isFunction(obj) {
            return !!(obj && obj.constructor && obj.call && obj.apply);
        }
    }]);

    return MM_Storage;
}();

exports.default = MM_Storage;
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mm_uid = mm_uid;
exports.mm_getRandomArbitrary = mm_getRandomArbitrary;
exports.mm_getRandomInt = mm_getRandomInt;
exports.mm_formatMoney = mm_formatMoney;
/**
 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * @returns {string}
 */
function mm_uid() {
    var s4 = function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toLowerCase();
    };
    //return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    return s4() + s4(); // would be enough for this demo
}

/**
 * Returns a random number between min and max
 * @param min
 * @param max
 * @returns {*}
 */
function mm_getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min and max
 * @param min
 * @param max
 * @returns {*}
 */
function mm_getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * credit: somewhere I don't remember...
 * @param number
 * @param decimals
 * @param decimalSep
 * @param thousandSep
 * @returns {string}
 */
function mm_formatMoney(number, decimals, decimalSep, thousandSep) {
    var n = number;
    var c = decimals;
    var d = decimalSep;
    var t = thousandSep;

    c = isNaN(c = Math.abs(c)) ? 2 : c; // number of decimals
    d = d === undefined ? "." : d; // decimal separator
    t = t === undefined ? " " : t; // thousands separator
    var s = n < 0 ? "-" : ""; // sign
    var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
    var j = i.length;
    j = j > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Index = require("./Index/Index");

var _Index2 = _interopRequireDefault(_Index);

var _App = require("../../App");

var _App2 = _interopRequireDefault(_App);

var _User = require("./User/User");

var _User2 = _interopRequireDefault(_User);

var _Logout = require("./Logout/Logout");

var _Logout2 = _interopRequireDefault(_Logout);

var _Account = require("../../model/Account");

var _Account2 = _interopRequireDefault(_Account);

var _Transactions = require("./Transactions/Transactions");

var _Transactions2 = _interopRequireDefault(_Transactions);

var _Report = require("./Report/Report");

var _Report2 = _interopRequireDefault(_Report);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Dashboard = function (_React$Component) {
    _inherits(Dashboard, _React$Component);

    /**
     * @param props
     */
    function Dashboard(props) {
        _classCallCheck(this, Dashboard);

        var _this = _possibleConstructorReturn(this, (Dashboard.__proto__ || Object.getPrototypeOf(Dashboard)).call(this, props));

        _this.state = {
            accounts: [],
            _isPendingAccountsFetch: false
        };

        //
        _this.handleLogOut = _this.handleLogOut.bind(_this);
        _this.handleCreateRandomAccounts = _this.handleCreateRandomAccounts.bind(_this);
        _this.handleAccountChange = _this.handleAccountChange.bind(_this);
        _this.handleAccountAdd = _this.handleAccountAdd.bind(_this);
        _this.handleDeleteAllUserData = _this.handleDeleteAllUserData.bind(_this);
        _this.handleTxAdd = _this.handleTxAdd.bind(_this);
        _this.handleTxDelete = _this.handleTxDelete.bind(_this);
        _this.handleDeleteAccount = _this.handleDeleteAccount.bind(_this);
        _this.handleTxEdit = _this.handleTxEdit.bind(_this);
        _this._panic = _this._panic.bind(_this);
        return _this;
    }

    /**
     * @param err
     * @private
     */


    _createClass(Dashboard, [{
        key: "_panic",
        value: function _panic(err) {
            console.error(err);
            alert("Error: " + err);
        }

        /**
         *
         */

    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            this.setState({ _isPendingAccountsFetch: true });
            _Account2.default.fetchAllByUserId(this.props.user.id).then(function (accounts) {
                return _this2.setState({ _isPendingAccountsFetch: false, accounts: accounts });
            }, function () {
                return _this2.setState({ _isPendingAccountsFetch: false });
            }).catch(this._panic);
        }

        /**
         * @param e
         */

    }, {
        key: "handleCreateRandomAccounts",
        value: function handleCreateRandomAccounts(e) {
            var _this3 = this;

            e.preventDefault();
            var accounts = _Account2.default.getRandomSample();
            //console.log(accounts, JSON.stringify(accounts)); return;

            this.setState({ _isPendingAccountsFetch: true });
            return _Account2.default.saveAllForUserId(this.props.user.id, accounts).then(function (accounts) {
                return _this3.setState({ _isPendingAccountsFetch: false, accounts: accounts });
            }, function () {
                return _this3.setState({ _isPendingAccountsFetch: false });
            }).catch(this._panic);
        }

        /**
         * @param e
         */

    }, {
        key: "handleLogOut",
        value: function handleLogOut(e) {
            e.preventDefault();
            this.props.setUser(null);
        }

        /**
         * @param account
         */

    }, {
        key: "handleAccountChange",
        value: function handleAccountChange(account) {
            var _this4 = this;

            var idx = this.state.accounts.indexOf(account);

            if (!!~idx) {
                // https://facebook.github.io/react/docs/react-component.html
                // Never mutate this.state directly ... treat this.state as if it were immutable.
                var newState = Object.assign({}, this.state);
                newState.accounts[idx] = account;
                newState._isPendingAccountsFetch = account.id;

                this.setState(newState);

                return _Account2.default.saveAllForUserId(this.props.user.id, newState.accounts).then(function (accounts) {
                    _this4.setState({
                        _isPendingAccountsFetch: false, accounts: accounts // set accounts not really needed...
                    });
                }, function () {
                    return _this4.setState({ _isPendingAccountsFetch: false });
                }).catch(this._panic);
            } else {
                this._panic("Account not found?!");
            }
        }

        /**
         * @param label
         */

    }, {
        key: "handleAccountAdd",
        value: function handleAccountAdd(label) {
            var _this5 = this;

            var state = Object.assign({}, this.state);
            if (!state.accounts) state.accounts = [];
            state.accounts.push(new _Account2.default({ label: label }));

            state._isPendingAccountsFetch = true;
            this.setState(state);
            return _Account2.default.saveAllForUserId(this.props.user.id, state.accounts).then(function (accounts) {
                _this5.setState({
                    _isPendingAccountsFetch: false, accounts: accounts // set accounts not really needed...
                });
            }, function () {
                return _this5.setState({ _isPendingAccountsFetch: false });
            }).catch(this._panic);
        }

        /**
         *
         */

    }, {
        key: "handleDeleteAllUserData",
        value: function handleDeleteAllUserData() {
            var _this6 = this;

            var id = this.props.user.id;
            return _Account2.default.deleteAllByUserId(id).then(function () {
                _this6.setState({ accounts: [] });
                _this6.props.actions.navigateTo('index');
            }).catch(this._panic);
        }

        /**
         * @param account
         * @returns {*}
         */

    }, {
        key: "handleDeleteAccount",
        value: function handleDeleteAccount(account) {
            var _this7 = this;

            var state = Object.assign({}, this.state);
            var aIdx = state.accounts.indexOf(account);
            if (!~aIdx) return this._panic("Account \"" + account.id + "\" not found?!");
            state.accounts.splice(aIdx, 1);

            return _Account2.default.saveAllForUserId(this.props.user.id, state.accounts).then(function () {
                return _this7.setState(state);
            }).catch(this._panic);
        }

        /**
         * @param account
         * @param transaction
         * @returns {*}
         */

    }, {
        key: "handleTxAdd",
        value: function handleTxAdd(account, transaction) {
            var state = Object.assign({}, this.state);
            var aIdx = state.accounts.indexOf(account);
            if (!~aIdx) return this._panic("Account \"" + account.id + "\" not found?!");
            state.accounts[aIdx].transactions.push(transaction);
            this.setState(state);

            return _Account2.default.saveAllForUserId(this.props.user.id, state.accounts).catch(this._panic);
        }

        /**
         * @param account
         * @param tx
         */

    }, {
        key: "handleTxEdit",
        value: function handleTxEdit(account, tx) {
            var state = Object.assign({}, this.state);
            var aIdx = state.accounts.indexOf(account);
            if (!~aIdx) return this._panic("Account \"" + account.id + "\" not found?!");
            var tIdx = state.accounts[aIdx].transactions.indexOf(tx);
            if (!~tIdx) return this._panic("Transaction \"" + tx.id + "\" not found in account \"" + account.id + "\"?!");
            state.accounts[aIdx].transactions[tIdx] = tx;
            this.setState(state);

            return _Account2.default.saveAllForUserId(this.props.user.id, state.accounts).catch(this._panic);
        }

        /**
         * @param account
         * @param tx
         * @returns {*}
         */

    }, {
        key: "handleTxDelete",
        value: function handleTxDelete(account, tx) {
            var state = Object.assign({}, this.state);
            var aIdx = state.accounts.indexOf(account);
            if (!~aIdx) return this._panic("Account \"" + account.id + "\" not found?!");
            var tIdx = state.accounts[aIdx].transactions.indexOf(tx);
            if (!~tIdx) return this._panic("Transaction \"" + tx.id + "\" not found in account \"" + account.id + "\"?!");
            state.accounts[aIdx].transactions.splice(tIdx, 1);
            this.setState(state);

            return _Account2.default.saveAllForUserId(this.props.user.id, state.accounts).catch(this._panic);
        }

        /**
         * @returns {XML}
         */

    }, {
        key: "render",
        value: function render() {
            var config = _App2.default.instance.config;
            var ns = config.bemNs;
            var B = ns + "-index"; // "B" from BEM
            var screen = void 0;

            var params = this.props.screenId.split("/");
            var _screenId = params[0];
            params.splice(0, 1);

            switch (_screenId) {
                case 'user':
                    screen = React.createElement(_User2.default, {
                        user: this.props.user,
                        actions: this.props.actions,
                        backScreenId: "index",
                        handleDeleteAllUserData: this.handleDeleteAllUserData
                    });
                    break;

                case 'logout':
                    // hm... see comments in Logout.js
                    screen = React.createElement(_Logout2.default, { actions: this.props.actions });
                    break;

                case 'account':
                    var account = null;
                    var accountId = params[0];
                    if (!this.state._isPendingAccountsFetch && this.state.accounts) {
                        account = this.state.accounts.filter(function (a) {
                            return a.id === accountId;
                        })[0];
                    }
                    screen = React.createElement(_Transactions2.default, {
                        user: this.props.user,
                        actions: this.props.actions,
                        account: account,
                        handleTxAdd: this.handleTxAdd,
                        handleTxEdit: this.handleTxEdit,
                        handleTxDelete: this.handleTxDelete,
                        handleDeleteAccount: this.handleDeleteAccount,
                        _isPendingFetch: this.state._isPendingAccountsFetch
                    });
                    break;

                case 'report':
                    screen = React.createElement(_Report2.default, {
                        user: this.props.user,
                        accounts: this.state.accounts,
                        _isPendingFetch: this.state._isPendingAccountsFetch
                    });
                    break;

                case 'index':
                default:
                    screen = React.createElement(_Index2.default, {
                        user: this.props.user,
                        actions: this.props.actions,
                        accounts: this.state.accounts,
                        handleCreateRandomAccounts: this.handleCreateRandomAccounts,
                        handleAccountChange: this.handleAccountChange,
                        handleAccountAdd: this.handleAccountAdd,
                        _isPendingFetch: this.state._isPendingAccountsFetch
                    });
            }

            return React.createElement(
                "div",
                { className: B + " " + ns + "-screen-outer" },
                screen
            );
        }
    }]);

    return Dashboard;
}(React.Component);

exports.default = Dashboard;


Dashboard.defaultProps = {
    screenId: 'index'
};
},{"../../App":1,"../../model/Account":16,"./Index/Index":6,"./Logout/Logout":7,"./Report/Report":8,"./Transactions/Transactions":9,"./User/User":10}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../../../App");

var _App2 = _interopRequireDefault(_App);

var _ScreenHeader = require("../../_ScreenHeader/ScreenHeader");

var _ScreenHeader2 = _interopRequireDefault(_ScreenHeader);

var _Account = require("../../../model/Account");

var _Account2 = _interopRequireDefault(_Account);

var _Spinner = require("../../_Spinner/Spinner");

var _Spinner2 = _interopRequireDefault(_Spinner);

var _utils = require("../../../_lib/mm/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Index = function (_React$Component) {
    _inherits(Index, _React$Component);

    /**
     * @param props
     */
    function Index(props) {
        _classCallCheck(this, Index);

        var _this = _possibleConstructorReturn(this, (Index.__proto__ || Object.getPrototypeOf(Index)).call(this, props));

        _this.handleClickAccountAdd = _this.handleClickAccountAdd.bind(_this);
        return _this;
    }

    /**
     * @param account
     * @param e
     */


    _createClass(Index, [{
        key: "handleClickAccountEdit",
        value: function handleClickAccountEdit(account, e) {
            e.preventDefault();
            var name = prompt("New account name:", account.label);
            if (name) {
                name = name.trim();
                if (name !== '') {
                    account.label = name;
                    this.props.handleAccountChange(account);
                }
            }
        }

        /**
         * @param e
         */

    }, {
        key: "handleClickAccountAdd",
        value: function handleClickAccountAdd(e) {
            e.preventDefault();
            var name = prompt("Account name");
            if (name) {
                name = name.trim();
                if (name !== '') {
                    this.props.handleAccountAdd(name);
                }
            }
        }

        /**
         * @returns {XML}
         */

    }, {
        key: "render",
        value: function render() {
            var config = _App2.default.instance.config;
            var ns = config.bemNs;
            var B = ns + "-index"; // "B" from BEM

            //
            var accounts = this.props.accounts; // shortcut
            var addDisabled = accounts && accounts.length >= config.maxAccountsLimit;

            return React.createElement(
                "section",
                { className: B + " " + ns + "-screen-inner" },
                React.createElement(_ScreenHeader2.default, { title: "My Accounts", user: this.props.user }),
                React.createElement(
                    "div",
                    { className: B + "-content " + ns + "-screen-body" },
                    React.createElement(
                        "h2",
                        { className: ns + "-screen-body-h" },
                        "My accounts"
                    ),
                    this.renderAccountsList()
                ),
                React.createElement(
                    "div",
                    { className: B + "-footer " + ns + "-screen-footer" },
                    React.createElement(
                        "a",
                        { href: "#report", className: "btn btn-secondary" },
                        React.createElement("i", { className: "fa fa-pie-chart", "aria-hidden": "true" }),
                        "\xA0Report"
                    ),
                    React.createElement(
                        "button",
                        { className: "btn btn-primary float-right",
                            disabled: addDisabled,
                            onClick: this.handleClickAccountAdd },
                        React.createElement("i", { className: "fa fa-plus-circle", "aria-hidden": "true" }),
                        "\xA0Add account"
                    )
                )
            );
        }

        /**
         *
         */

    }, {
        key: "renderAccountsList",
        value: function renderAccountsList() {
            var _this2 = this;

            if (this.props._isPendingFetch === true) {
                // of first load
                return React.createElement(_Spinner2.default, null);
            }

            var accounts = this.props.accounts;
            if (!accounts || !accounts.length) {
                return React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "p",
                        null,
                        this.props.user.first_name,
                        ", you haven't added any accounts yet."
                    ),
                    React.createElement(
                        "button",
                        { onClick: this.props.handleCreateRandomAccounts, className: "btn btn-secondary" },
                        "Add few random samples now!"
                    )
                );
            }

            var config = _App2.default.instance.config;
            var ns = config.bemNs;
            var B = ns + "-index"; // "B" from BEM

            var _posneg = function _posneg(amt) {
                return amt ? amt < 0 ? 'neg' : 'pos' : '';
            };
            var sum = accounts.reduce(function (sum, a) {
                return sum + a.balance;
            }, 0);
            var sumPosNeg = _posneg(sum);

            return React.createElement(
                "div",
                { className: B + "-accounts" },
                React.createElement(
                    "div",
                    { className: B + "-accounts-th" },
                    React.createElement(
                        "div",
                        { className: B + "-accounts-thitem " + B + "-accounts-thitem__label" },
                        "Label"
                    ),
                    React.createElement(
                        "div",
                        { className: B + "-accounts-thitem " + B + "-accounts-thitem__sum" },
                        "Balance"
                    )
                ),
                accounts.map(function (a, idx) {
                    var posneg = _posneg(a.balance);
                    return React.createElement(
                        "div",
                        { key: a.id, className: B + "-accounts-trwrap" },
                        React.createElement(
                            "div",
                            { className: B + "-accounts-trspinnerbox" },
                            _this2.props._isPendingFetch === a.id ? React.createElement(_Spinner2.default, null) : null
                        ),
                        React.createElement(
                            "a",
                            { href: "#account/" + a.id, className: B + "-accounts-tr" },
                            React.createElement(
                                "div",
                                { className: B + "-accounts-tritem " + B + "-accounts-tritem__label" },
                                React.createElement(
                                    "strong",
                                    null,
                                    a.label
                                ),
                                React.createElement("br", null),
                                React.createElement(
                                    "small",
                                    null,
                                    "Last: ",
                                    a.lastTransaction ? (0, _utils.mm_formatMoney)(a.lastTransaction.amount) + " (" + new Date(a.lastTransaction.created).toLocaleString() + ")" : 'n/a'
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: [B + "-accounts-tritem", B + "-accounts-tritem__sum", B + "-accounts-tritem__" + posneg].join(" ") },
                                React.createElement("span", { dangerouslySetInnerHTML: {
                                        __html: a.balanceFormatted.split(" ").join("&nbsp;")
                                    } })
                            )
                        ),
                        React.createElement(
                            "a",
                            { href: "javascript:void(0)", className: B + "-accounts-trx",
                                onClick: _this2.handleClickAccountEdit.bind(_this2, a) },
                            React.createElement("i", { className: "fa fa-pencil", "aria-hidden": "true" }),
                            React.createElement(
                                "span",
                                { className: "sr-only" },
                                "Edit"
                            )
                        )
                    );
                }),
                React.createElement(
                    "div",
                    { className: B + "-accounts-th " + B + "-accounts-th__foot" },
                    React.createElement(
                        "div",
                        { className: [B + "-accounts-thitem", B + "-accounts-thitem__label", B + "-accounts-thitem__label__foot"].join(" ") },
                        "Total"
                    ),
                    React.createElement(
                        "div",
                        { className: [B + "-accounts-thitem", B + "-accounts-thitem__sum", B + "-accounts-thitem__sum__" + sumPosNeg, B + "-accounts-thitem__sum__foot"].join(" ") },
                        React.createElement("span", { dangerouslySetInnerHTML: {
                                __html: (0, _utils.mm_formatMoney)(sum).split(" ").join("&nbsp;")
                            } })
                    )
                )
            );
        }
    }]);

    return Index;
}(React.Component);

exports.default = Index;
},{"../../../App":1,"../../../_lib/mm/utils":4,"../../../model/Account":16,"../../_ScreenHeader/ScreenHeader":13,"../../_Spinner/Spinner":14}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * NOTE: I think this component is technically correct (from the React's perspective),
 * but doesn't feel right. Since react components are **view** components
 * and this (Logout) by design does not render at all, it is simply a hack...
 *
 * In my current implementation I have a route "#logout" to perform the logout, which
 * could be easily done in different ways (e.g. onClick={this.logout}) and maybe
 * I would not be writing this comment, but sooner or later it would pop up somewhere
 * else that - ultimately - I think I'm missing a (controller/dispatch) layer
 * on top of the react components...
 *
 * Is this where Redux should help? (At the time of writing this comment I have very
 * limited knowledge about Redux...)
 */
var Logout = function (_React$Component) {
    _inherits(Logout, _React$Component);

    function Logout() {
        _classCallCheck(this, Logout);

        return _possibleConstructorReturn(this, (Logout.__proto__ || Object.getPrototypeOf(Logout)).apply(this, arguments));
    }

    _createClass(Logout, [{
        key: "componentWillMount",
        value: function componentWillMount() {
            this.props.actions.logOut();
        }
    }, {
        key: "render",
        value: function render() {
            return null;
        }
    }]);

    return Logout;
}(React.Component);

exports.default = Logout;
},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../../../App");

var _App2 = _interopRequireDefault(_App);

var _ScreenHeader = require("../../_ScreenHeader/ScreenHeader");

var _ScreenHeader2 = _interopRequireDefault(_ScreenHeader);

var _Spinner = require("../../_Spinner/Spinner");

var _Spinner2 = _interopRequireDefault(_Spinner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Report = function (_React$Component) {
    _inherits(Report, _React$Component);

    /**
     * @param props
     */
    function Report(props) {
        _classCallCheck(this, Report);

        var _this = _possibleConstructorReturn(this, (Report.__proto__ || Object.getPrototypeOf(Report)).call(this, props));

        _this.state = { type: 'Debits' }; // acts as title
        _this.chart = null;

        //
        _this.updateChart = _this.updateChart.bind(_this);
        _this.onClickDebit = _this.onClickDebit.bind(_this);
        _this.onClickCredit = _this.onClickCredit.bind(_this);
        return _this;
    }

    /**
     *
     */


    _createClass(Report, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var data = {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ["#f0ad4e", "#ffd500", "#0275d8", "#5bc0de", "#ff5b77", "#613d7c"]
                }]
            };

            this.chart = new Chart(this.el, {
                type: 'doughnut',
                data: data
            });

            this.updateChart();
        }

        /**
         *
         */

    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            this.chart.destroy();
            this.chart = null;
        }
    }, {
        key: "onClickDebit",
        value: function onClickDebit(e) {
            e.preventDefault();
            this.setState({ type: 'Debits' });
        }
    }, {
        key: "onClickCredit",
        value: function onClickCredit(e) {
            e.preventDefault();
            this.setState({ type: 'Credits' });
        }

        /**
         *
         */

    }, {
        key: "updateChart",
        value: function updateChart() {
            if (this.props._isPendingFetch) return;
            if (!this.props.accounts) return;
            if (!this.chart) return;

            // normalize
            var type = /credit/i.test(this.state.type) ? 'credit' : 'debit';

            var map = {};
            this.props.accounts.forEach(function (a) {
                a.transactions.forEach(function (t) {
                    if (type === 'credit' && t.amount < 0) return;
                    if (type === 'debit' && t.amount > 0) return;
                    if (!map[t.category]) map[t.category] = 0;
                    map[t.category] += Math.abs(t.amount);
                });
            });
            //console.log(type, map);


            var labels = [];
            var data = [];
            Object.keys(map).forEach(function (k) {
                labels.push(k);
                data.push(map[k]);
            });
            //console.log(labels, data);

            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = data;
            this.chart.update();
        }

        /**
         * @returns {XML}
         */

    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var config = _App2.default.instance.config;
            var ns = config.bemNs;
            var B = ns + "-report"; // "B" from BEM
            var user = this.props.user;

            this.updateChart();

            // quick n dirty
            var crCls = this.state.type === 'Credits' ? 'btn-info' : 'btn-outline-info';
            var dbCls = this.state.type === 'Debits' ? 'btn-info' : 'btn-outline-info';

            var MaybeNotFound = function MaybeNotFound() {
                if (_this2.props._isPendingFetch) return null;
                if (!_this2.props.accounts || !_this2.props.accounts.length) {
                    return React.createElement(
                        "p",
                        null,
                        "No accounts found... ",
                        React.createElement(
                            "a",
                            { href: "#index" },
                            "Go create one!"
                        )
                    );
                }
                return null;
            };

            return React.createElement(
                "section",
                { className: B + " " + ns + "-screen-inner" },
                React.createElement(_ScreenHeader2.default, { title: "Report", user: user, backScreenId: "index" }),
                React.createElement(
                    "div",
                    { className: B + " " + ns + "-screen-body" },
                    React.createElement(
                        "h2",
                        { className: ns + "-screen-body-h" },
                        "My ",
                        this.state.type
                    ),
                    React.createElement(MaybeNotFound, null),
                    React.createElement(
                        "div",
                        { className: B + "-canvaswrap" },
                        React.createElement("canvas", { ref: function ref(el) {
                                return _this2.el = el;
                            }, width: "500", height: "300" })
                    )
                ),
                React.createElement(
                    "div",
                    { className: B + "-footer " + ns + "-screen-footer" },
                    React.createElement(
                        "button",
                        { className: "btn " + dbCls, onClick: this.onClickDebit },
                        React.createElement("i", { className: "fa fa-pie-chart", "aria-hidden": "true" }),
                        "\xA0 Debits"
                    ),
                    React.createElement(
                        "button",
                        { className: "btn " + crCls + " pull-right", onClick: this.onClickCredit },
                        React.createElement("i", { className: "fa fa-pie-chart", "aria-hidden": "true" }),
                        "\xA0 Credits"
                    )
                )
            );
        }
    }]);

    return Report;
}(React.Component);

exports.default = Report;
},{"../../../App":1,"../../_ScreenHeader/ScreenHeader":13,"../../_Spinner/Spinner":14}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../../../App");

var _App2 = _interopRequireDefault(_App);

var _ScreenHeader = require("../../_ScreenHeader/ScreenHeader");

var _ScreenHeader2 = _interopRequireDefault(_ScreenHeader);

var _Account = require("../../../model/Account");

var _Account2 = _interopRequireDefault(_Account);

var _Spinner = require("../../_Spinner/Spinner");

var _Spinner2 = _interopRequireDefault(_Spinner);

var _Transaction = require("../../../model/Transaction");

var _Transaction2 = _interopRequireDefault(_Transaction);

var _utils = require("../../../_lib/mm/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Transactions = function (_React$Component) {
    _inherits(Transactions, _React$Component);

    /**
     * @param props
     */
    function Transactions(props) {
        _classCallCheck(this, Transactions);

        var _this = _possibleConstructorReturn(this, (Transactions.__proto__ || Object.getPrototypeOf(Transactions)).call(this, props));

        _this.state = {
            _pendingTx: false
        };

        _this.onClickTxDelete = _this.onClickTxDelete.bind(_this);
        _this.onClickTxAdd = _this.onClickTxAdd.bind(_this);
        _this.onClickAccountDelete = _this.onClickAccountDelete.bind(_this);
        _this.onClickUpdateLabel = _this.onClickUpdateLabel.bind(_this);
        return _this;
    }

    /**
     * @param e
     */


    _createClass(Transactions, [{
        key: "onClickAccountDelete",
        value: function onClickAccountDelete(e) {
            var _this2 = this;

            e.preventDefault();
            if (!this.props.account) return;
            if (confirm("Delete \"" + this.props.account.label + "\"?")) {
                var pr = this.props.handleDeleteAccount(this.props.account);
                pr.then && pr.then(function () {
                    return _this2.props.actions.navigateTo('index');
                }); // hm...
            }
        }

        /**
         * @param tx
         * @param e
         */

    }, {
        key: "onClickTxDelete",
        value: function onClickTxDelete(tx, e) {
            var _this3 = this;

            e.preventDefault();
            if (!this.props.account) return; // sanity check
            if (confirm("Delete \"" + tx.label + "\"?")) {
                this.setState({ _pendingTx: tx.id });
                var _resetPending = function _resetPending() {
                    return _this3.setState({ _pendingTx: false });
                };
                this.props.handleTxDelete(this.props.account, tx).then(_resetPending, _resetPending).catch(_resetPending); // still needed if onRejected is already handled?
            }
        }

        /**
         * @param e
         */

    }, {
        key: "onClickTxAdd",
        value: function onClickTxAdd(e) {
            e.preventDefault();
            if (!this.props.account) return; // sanity check

            var input = prompt('Enter transaction amount:', '1.00');
            var amt = parseFloat(input);
            if (Number.isNaN(amt)) return console.warn("Ignoring NaN input \"" + input + "\"...");
            if (!amt) return console.warn("Ignoring zero amount");
            if (Math.abs(amt) > 999999) return alert("This app is not for you. Go consult your private banker!");

            var defaultCateg = _App2.default.instance.getCategsForAmt(amt)[0].label;
            var label = prompt("Enter transaction label:", "Untitled");
            if (!label || label.trim() === "") return;

            this.props.handleTxAdd(this.props.account, new _Transaction2.default({
                label: label, category: defaultCateg, amount: amt
            }));
        }

        /**
         * @param tx
         * @param e
         */

    }, {
        key: "onClickUpdateLabel",
        value: function onClickUpdateLabel(tx, e) {
            var _this4 = this;

            e.preventDefault();
            if (!this.props.account || !tx) return; // sanity check
            var input = prompt("New label:", tx.label);
            if (!input) return;
            tx.label = input.trim();

            this.setState({ _pendingTx: tx.id });
            var _resetPending = function _resetPending() {
                return _this4.setState({ _pendingTx: false });
            };
            this.props.handleTxEdit(this.props.account, tx).then(_resetPending, _resetPending).catch(_resetPending); // still needed if onRejected is already handled?
        }

        /**
         * @param tx
         * @param e
         */

    }, {
        key: "onClickUpdateAmount",
        value: function onClickUpdateAmount(tx, e) {
            var _this5 = this;

            e.preventDefault();
            if (!this.props.account || !tx) return; // sanity check
            var amt = parseFloat(prompt("New amount:", tx.amount));
            if (!amt || Number.isNaN(amt)) return;
            if (Math.abs(amt) > 999999) return alert("This app is not for you. Go consult your private banker!");

            var old = tx.amount;
            tx.amount = amt;

            // if we have changed debit to credit (or opposite)
            if (old < 0 && amt > 0 || old > 0 && amt < 0) {
                // we have to update category as well (using first available)
                tx.category = _App2.default.instance.getCategsForAmt(tx.amount)[0];
            }

            this.setState({ _pendingTx: tx.id });
            var _resetPending = function _resetPending() {
                return _this5.setState({ _pendingTx: false });
            };
            this.props.handleTxEdit(this.props.account, tx).then(_resetPending, _resetPending).catch(_resetPending); // still needed if onRejected is already handled?
        }

        /**
         * @param tx
         * @param e
         */

    }, {
        key: "onChangeUpdateCategory",
        value: function onChangeUpdateCategory(tx, e) {
            var _this6 = this;

            e.preventDefault();
            tx.category = e.target.value;

            this.setState({ _pendingTx: tx.id });
            var _resetPending = function _resetPending() {
                return _this6.setState({ _pendingTx: false });
            };
            this.props.handleTxEdit(this.props.account, tx).then(_resetPending, _resetPending).catch(_resetPending); // still needed if onRejected is already handled?
        }

        /**
         * @returns {string}
         * @constructor
         */

    }, {
        key: "B",
        value: function B() {
            return _App2.default.instance.config.bemNs + "-transactions"; // "B" from BEM
        }

        /**
         * @returns {XML}
         */

    }, {
        key: "render",
        value: function render() {
            var config = _App2.default.instance.config;
            var ns = config.bemNs;
            var B = this.B();

            return React.createElement(
                "section",
                { className: B + " " + ns + "-screen-inner" },
                React.createElement(_ScreenHeader2.default, { title: "Account Transactions", user: this.props.user,
                    backScreenId: "index"
                }),
                React.createElement(
                    "div",
                    { className: B + "-content " + ns + "-screen-body" },
                    this.renderAccountTransactions()
                ),
                React.createElement(
                    "div",
                    { className: B + "-footer " + ns + "-screen-footer" },
                    React.createElement(
                        "button",
                        { className: "btn btn-danger",
                            onClick: this.onClickAccountDelete },
                        React.createElement("i", { className: "fa fa-trash", "aria-hidden": "true" }),
                        "\xA0Delete This Account"
                    ),
                    React.createElement(
                        "button",
                        { className: "btn btn-primary float-right",
                            onClick: this.onClickTxAdd },
                        React.createElement("i", { className: "fa fa-plus-circle", "aria-hidden": "true" }),
                        "\xA0Add Transaction"
                    )
                )
            );
        }

        /**
         * @returns {XML}
         */

    }, {
        key: "renderAccountTransactions",
        value: function renderAccountTransactions() {
            var _this7 = this;

            if (this.props._isPendingFetch) {
                return React.createElement(_Spinner2.default, null);
            }
            if (!this.props.account) {
                return React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "p",
                        null,
                        "Account not found!"
                    ),
                    React.createElement(
                        "p",
                        null,
                        React.createElement(
                            "a",
                            { href: "#index" },
                            "\u2192 Go to my accounts"
                        )
                    )
                );
            }

            var config = _App2.default.instance.config;
            var ns = config.bemNs;
            var B = this.B();
            var a = this.props.account;
            var _posneg = function _posneg(amt) {
                return amt ? amt < 0 ? 'neg' : 'pos' : '';
            };
            var categs = config.transactionCategories;
            var sum = a.transactions.reduce(function (sum, t) {
                return sum + t.amount;
            }, 0);
            var sumPosNeg = _posneg(sum);
            var app = _App2.default.instance;

            return React.createElement(
                "div",
                { className: B + "-txs" },
                React.createElement(
                    "h2",
                    { className: ns + "-screen-body-h" },
                    a.label
                ),
                React.createElement(
                    "div",
                    { className: B + "-txs-th" },
                    React.createElement(
                        "div",
                        { className: B + "-txs-thitem " + B + "-txs-thitem__label" },
                        "Label"
                    ),
                    React.createElement(
                        "div",
                        { className: B + "-txs-thitem " + B + "-txs-thitem__label2" },
                        "Category"
                    ),
                    React.createElement(
                        "div",
                        { className: B + "-txs-thitem " + B + "-txs-thitem__amt" },
                        "Amount"
                    )
                ),
                a.transactions.map(function (t, idx) {
                    var posneg = _posneg(t.amount);
                    return React.createElement(
                        "div",
                        { key: t.id, className: B + "-txs-trwrap" },
                        React.createElement(
                            "div",
                            { className: B + "-txs-trspinnerbox" },
                            _this7.state._pendingTx === t.id ? React.createElement(_Spinner2.default, null) : null
                        ),
                        React.createElement(
                            "div",
                            { className: B + "-txs-tr" },
                            React.createElement(
                                "div",
                                { className: B + "-txs-tritem " + B + "-txs-tritem__label" },
                                React.createElement(
                                    "button",
                                    { onClick: _this7.onClickUpdateLabel.bind(_this7, t) },
                                    React.createElement(
                                        "strong",
                                        null,
                                        t.label
                                    )
                                ),
                                React.createElement("br", null),
                                React.createElement(
                                    "small",
                                    null,
                                    new Date(t.created).toLocaleString()
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: B + "-txs-tritem " + B + "-txs-tritem__label2" },
                                React.createElement(
                                    "select",
                                    { className: "custom-select", value: t.category,
                                        onChange: _this7.onChangeUpdateCategory.bind(_this7, t) },
                                    app.getCategsForAmt(t.amount).map(function (c) {
                                        return React.createElement(
                                            "option",
                                            { key: c.id, value: c.label },
                                            c.label
                                        );
                                    })
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: [B + "-txs-tritem", B + "-txs-tritem__sum", B + "-txs-tritem__" + posneg].join(" ") },
                                React.createElement("button", {
                                    onClick: _this7.onClickUpdateAmount.bind(_this7, t),
                                    dangerouslySetInnerHTML: {
                                        __html: (0, _utils.mm_formatMoney)(t.amount).split(" ").join("&nbsp;")
                                    } })
                            )
                        ),
                        React.createElement(
                            "a",
                            { href: "javascript:void(0)", className: B + "-txs-trx",
                                onClick: _this7.onClickTxDelete.bind(_this7, t) },
                            React.createElement("i", { className: "fa fa-times-circle", "aria-hidden": "true" }),
                            React.createElement(
                                "span",
                                { className: "sr-only" },
                                "Delete"
                            )
                        )
                    );
                }),
                React.createElement(
                    "div",
                    { className: B + "-txs-th " + B + "-txs-th__foot" },
                    React.createElement(
                        "div",
                        { className: [B + "-txs-thitem", B + "-txs-thitem__label", B + "-txs-thitem__label__foot"].join(" ") },
                        "Total"
                    ),
                    React.createElement(
                        "div",
                        { className: [B + "-txs-thitem", B + "-txs-thitem__amt", B + "-txs-thitem__amt__" + sumPosNeg, B + "-txs-thitem__amt__foot"].join(" ") },
                        React.createElement("span", { dangerouslySetInnerHTML: {
                                __html: (0, _utils.mm_formatMoney)(sum).split(" ").join("&nbsp;")
                            } })
                    )
                )
            );
        }
    }]);

    return Transactions;
}(React.Component);

exports.default = Transactions;
},{"../../../App":1,"../../../_lib/mm/utils":4,"../../../model/Account":16,"../../../model/Transaction":17,"../../_ScreenHeader/ScreenHeader":13,"../../_Spinner/Spinner":14}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../../../App");

var _App2 = _interopRequireDefault(_App);

var _ScreenHeader = require("../../_ScreenHeader/ScreenHeader");

var _ScreenHeader2 = _interopRequireDefault(_ScreenHeader);

var _Account = require("../../../model/Account");

var _Account2 = _interopRequireDefault(_Account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var User = function (_React$Component) {
    _inherits(User, _React$Component);

    /**
     * @param props
     */
    function User(props) {
        _classCallCheck(this, User);

        var _this = _possibleConstructorReturn(this, (User.__proto__ || Object.getPrototypeOf(User)).call(this, props));

        _this.deleteAllUserData = _this.deleteAllUserData.bind(_this);
        return _this;
    }

    /**
     * @param e
     */


    _createClass(User, [{
        key: "deleteAllUserData",
        value: function deleteAllUserData(e) {
            e.preventDefault();
            if (confirm("Are you sure?")) {
                this.props.handleDeleteAllUserData();
            }
        }

        /**
         * @returns {XML}
         */

    }, {
        key: "render",
        value: function render() {
            var config = _App2.default.instance.config;
            var ns = config.bemNs;
            var B = ns + "-user"; // "B" from BEM
            var user = this.props.user;

            // sanity check
            if (!user) return React.createElement(
                "p",
                null,
                "Error: missing user?!"
            );

            return React.createElement(
                "section",
                { className: B + " " + ns + "-screen-inner" },
                React.createElement(_ScreenHeader2.default, { title: "Settings", user: user,
                    backScreenId: this.props.backScreenId
                }),
                React.createElement(
                    "div",
                    { className: B + " " + ns + "-screen-body" },
                    React.createElement(
                        "h2",
                        { className: ns + "-screen-body-h" },
                        "Hello, ",
                        user.first_name,
                        "!"
                    ),
                    React.createElement(
                        "p",
                        null,
                        "This is your settings screen..."
                    )
                ),
                React.createElement(
                    "div",
                    { className: B + "-footer " + ns + "-screen-footer" },
                    React.createElement(
                        "button",
                        { onClick: this.deleteAllUserData, className: "btn btn-danger" },
                        React.createElement("i", { className: "fa fa-trash", "aria-hidden": "true" }),
                        "\xA0Delete all my accounts"
                    ),
                    React.createElement(
                        "a",
                        { href: "#logout", className: "btn btn-primary float-right" },
                        React.createElement("i", { className: "fa fa-sign-out", "aria-hidden": "true" }),
                        "\xA0Logout"
                    )
                )
            );
        }
    }]);

    return User;
}(React.Component);

exports.default = User;
},{"../../../App":1,"../../../model/Account":16,"../../_ScreenHeader/ScreenHeader":13}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../../App");

var _App2 = _interopRequireDefault(_App);

var _User = require("../../model/User");

var _User2 = _interopRequireDefault(_User);

var _ScreenHeader = require("../_ScreenHeader/ScreenHeader");

var _ScreenHeader2 = _interopRequireDefault(_ScreenHeader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Login = function (_React$Component) {
    _inherits(Login, _React$Component);

    /**
     * @param props
     */
    function Login(props) {
        _classCallCheck(this, Login);

        var _this = _possibleConstructorReturn(this, (Login.__proto__ || Object.getPrototypeOf(Login)).call(this, props));

        _this.state = {
            username: '',
            password: '',
            _isPendingFormSubmit: false
        };

        //
        _this.handleChange = _this.handleChange.bind(_this);
        _this.handleSubmit = _this.handleSubmit.bind(_this);
        return _this;
    }

    /**
     * @param e
     */


    _createClass(Login, [{
        key: "handleChange",
        value: function handleChange(e) {
            this.setState(_defineProperty({}, e.target.name, e.target.value));
        }

        /**
         * @param e
         */

    }, {
        key: "handleSubmit",
        value: function handleSubmit(e) {
            var _this2 = this;

            e.preventDefault();

            var username = this.state.username;
            var password = this.state.password;

            // we need to handle browser's autofill, which won't fire as change event ;(
            // so hacking it through "ref"...
            // UPDATE: this seems not to be an issue anymore (something else was wrong...)
            // but I'm leaving it here so I can remember
            if (this.$usernameInput.value !== username) username = this.$usernameInput.value;
            if (this.$passwordInput.value !== password) password = this.$passwordInput.value;
            this.setState({ username: username, password: password }); // just to keep in sync

            //
            this.setState({ _isPendingFormSubmit: true });
            _User2.default.fetchByUsernameAndPassword(username, password).then(function (user) {
                _this2.setState({ _isPendingFormSubmit: false });
                _this2.props.setUser(user);
            }).catch(function (err) {
                console.error(err);
                _this2.setState({ _isPendingFormSubmit: false });
            });
        }

        /**
         * @returns {XML}
         */

    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var config = _App2.default.instance.config;
            var ns = config.bemNs;
            var B = ns + "-login"; // "B" from BEM

            return React.createElement(
                "section",
                { className: B + " " + ns + "-screen-outer" },
                React.createElement(
                    "form",
                    { method: "post", className: B + "-screen " + ns + "-screen-inner", onSubmit: this.handleSubmit },
                    React.createElement(_ScreenHeader2.default, { title: "Login" }),
                    React.createElement(
                        "div",
                        { className: B + "-content " + ns + "-screen-body" },
                        React.createElement(
                            "div",
                            { className: B + "-inputs" },
                            React.createElement(
                                "label",
                                null,
                                React.createElement(
                                    "span",
                                    null,
                                    "Username"
                                ),
                                React.createElement("input", { type: "text", name: "username", autoFocus: true, className: "form-control",
                                    required: true,
                                    value: this.state.username,
                                    onChange: this.handleChange
                                    // hack for browser's autofill silence, read above
                                    , ref: function ref(input) {
                                        return _this3.$usernameInput = input;
                                    }
                                })
                            ),
                            React.createElement(
                                "label",
                                null,
                                React.createElement(
                                    "span",
                                    null,
                                    "Password"
                                ),
                                React.createElement("input", { type: "password", name: "password", className: "form-control",
                                    required: true,
                                    value: this.state.password,
                                    onChange: this.handleChange
                                    // hack for browser's autofill silence, read above
                                    , ref: function ref(input) {
                                        return _this3.$passwordInput = input;
                                    }
                                })
                            ),
                            React.createElement(
                                "button",
                                { type: "submit", disabled: this.state._isPendingFormSubmit,
                                    className: "btn btn-primary " + B + "-submit" },
                                "Login"
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: B + "-note" },
                            "TIP: Use first and last name of any member of The Beatles.",
                            React.createElement("br", null),
                            React.createElement(
                                "small",
                                null,
                                React.createElement(
                                    "a",
                                    { href: "https://github.com/marianmeres/finance-app-react-playground" },
                                    "Source of this demo on GitHub"
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);

    return Login;
}(React.Component);

exports.default = Login;
},{"../../App":1,"../../model/User":18,"../_ScreenHeader/ScreenHeader":13}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../../App");

var _App2 = _interopRequireDefault(_App);

var _User = require("../../model/User");

var _User2 = _interopRequireDefault(_User);

var _Login = require("../Login/Login");

var _Login2 = _interopRequireDefault(_Login);

var _Dashboard = require("../Dashboard/Dashboard");

var _Dashboard2 = _interopRequireDefault(_Dashboard);

var _Spinner = require("../_Spinner/Spinner");

var _Spinner2 = _interopRequireDefault(_Spinner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Root = function (_React$Component) {
    _inherits(Root, _React$Component);

    /**
     * @param props
     */
    function Root(props) {
        _classCallCheck(this, Root);

        //
        var _this = _possibleConstructorReturn(this, (Root.__proto__ || Object.getPrototypeOf(Root)).call(this, props));

        _this.state = {
            user: null,
            screenId: window.location.hash.substr(1),
            _isPendingUserFetch: true
        };

        //
        _this.setUser = _this.setUser.bind(_this);
        _this.logOut = _this.logOut.bind(_this);
        _this.onHashChange = _this.onHashChange.bind(_this);
        _this.navigateTo = _this.navigateTo.bind(_this);
        return _this;
    }

    /**
     *
     */


    _createClass(Root, [{
        key: "onHashChange",
        value: function onHashChange() {
            this.navigateTo(window.location.hash.substr(1));
        }

        /**
         *
         */

    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            //
            //window.location.hash = ''; // reset hash on app start...
            // hack to postpone the addEventListener on the next tick, otherwise fired
            // immediatelly (even if the actual change is above)
            // see https://codepen.io/marianmeres/pen/QvOdLY
            //setTimeout(() => window.addEventListener('hashchange', this.onHashChange), 0);
            // UPDATE: as I am not reseting the hash anymore, the above is not needed
            window.addEventListener('hashchange', this.onHashChange);

            this.setState({ _isPendingUserFetch: true });
            _User2.default.fetch().then(function (user) {
                _this2.setState({ _isPendingUserFetch: false });
                _this2.setUser(user);
            }).catch(function (err) {
                console.error(err);
                _this2.setState({ _isPendingUserFetch: false });
            });
        }

        /**
         * clean up... which will never happen actually (this is the root component)
         */

    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            _App2.default.instance = null;
            window.removeEventListener('hashchange', this.onHashChange);
        }

        /**
         * sets user to local state AND to persistance layer
         * @param user
         */

    }, {
        key: "setUser",
        value: function setUser(user) {
            this.setState({ user: user });
            _User2.default.save(user).catch(function (err) {
                return console.error(err);
            }); // always catch
        }

        /**
         *
         */

    }, {
        key: "logOut",
        value: function logOut() {
            this.setUser(null);
            window.location.hash = '';
        }

        /**
         * @param screenId
         */

    }, {
        key: "navigateTo",
        value: function navigateTo(screenId) {
            // make the hash the top authority, so always keep it in sync...
            if (screenId !== window.location.hash.substr(1)) {
                return window.location.hash = screenId;
            }
            this.setState({ screenId: screenId });
        }

        /**
         * There must be better ways to do this...
         * @returns {*}
         */

    }, {
        key: "actions",
        value: function actions() {
            return {
                logOut: this.logOut,
                navigateTo: this.navigateTo
            };
        }

        /**
         * @returns {XML}
         */

    }, {
        key: "render",
        value: function render() {
            var config = _App2.default.instance.config;
            var B = config.bemNs + "-root"; // "B" from BEM
            var screen = void 0;

            if (this.state._isPendingUserFetch) {
                screen = React.createElement(_Spinner2.default, { customCssCls: "fa-2x" });
            } else if (this.state.user && this.state.user.isAuthenticated()) {
                screen = React.createElement(_Dashboard2.default, {
                    screenId: this.state.screenId,
                    user: this.state.user,
                    setUser: this.setUser,
                    actions: this.actions()
                });
            } else {
                screen = React.createElement(_Login2.default, {
                    loginApiEndpoint: config.loginApiEndpoint,
                    setUser: this.setUser
                });
            }

            return React.createElement(
                "div",
                { className: B },
                screen
            );
        }

        /**
         * this is just to illustrate the ability to expose only custom API... see main.js
         */

    }, {
        key: "foo",
        value: function foo() {
            alert('bar');
        }
    }]);

    return Root;
}(React.Component);

exports.default = Root;
},{"../../App":1,"../../model/User":18,"../Dashboard/Dashboard":5,"../Login/Login":11,"../_Spinner/Spinner":14}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../../App");

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScreenHeader = function (_React$Component) {
    _inherits(ScreenHeader, _React$Component);

    function ScreenHeader() {
        _classCallCheck(this, ScreenHeader);

        return _possibleConstructorReturn(this, (ScreenHeader.__proto__ || Object.getPrototypeOf(ScreenHeader)).apply(this, arguments));
    }

    _createClass(ScreenHeader, [{
        key: "B",
        value: function B() {
            var config = _App2.default.instance.config;
            return config.bemNs + "-screenheader"; // "B" from BEM
        }
    }, {
        key: "render",
        value: function render() {
            var B = this.B();

            return React.createElement(
                "header",
                { className: B },
                React.createElement(
                    "div",
                    { className: B + "-iconwrap" },
                    this.back()
                ),
                React.createElement(
                    "h1",
                    { className: B + "-h" },
                    this.props.title
                ),
                React.createElement(
                    "div",
                    { className: B + "-iconwrap" },
                    this.avatar()
                )
            );
        }
    }, {
        key: "avatar",
        value: function avatar() {
            if (!this.props.user) return null;

            var user = this.props.user;
            var B = this.B();

            return React.createElement(
                "a",
                { href: "#user", className: B + "-avatar" },
                React.createElement("img", { src: user.avatar, alt: user.name })
            );
        }
    }, {
        key: "back",
        value: function back() {
            if (!this.props.backScreenId) return null;
            var B = this.B();

            return React.createElement(
                "a",
                { href: "#" + this.props.backScreenId, className: B + "-back" },
                "\u2190",
                React.createElement(
                    "span",
                    { className: "sr-only" },
                    "Back"
                )
            );
        }
    }]);

    return ScreenHeader;
}(React.Component);

exports.default = ScreenHeader;


ScreenHeader.defaultProps = {
    title: 'Untitled'
};
},{"../../App":1}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../../App");

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Spinner = function (_React$Component) {
    _inherits(Spinner, _React$Component);

    function Spinner() {
        _classCallCheck(this, Spinner);

        return _possibleConstructorReturn(this, (Spinner.__proto__ || Object.getPrototypeOf(Spinner)).apply(this, arguments));
    }

    _createClass(Spinner, [{
        key: "render",
        value: function render() {
            var ns = _App2.default.instance.config.bemNs;
            var B = ns + "-spinner"; // "B" from BEM
            return React.createElement(
                "div",
                { className: B },
                React.createElement("i", { className: "fa fa-spinner fa-spin " + this.props.customCssCls }),
                React.createElement(
                    "span",
                    { className: "sr-only" },
                    "Loading..."
                )
            );
        }
    }]);

    return Spinner;
}(React.Component);

exports.default = Spinner;
},{"../../App":1}],15:[function(require,module,exports){
"use strict";

var _Root = require("./component/Root/Root");

var _Root2 = _interopRequireDefault(_Root);

var _App = require("./App");

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param id
 * @param config
 * @returns {*}
 */
function factory(id, config) {

  _App2.default.instance = new _App2.default(config);

  var _reactRoot = ReactDOM.render(React.createElement(_Root2.default, null), document.getElementById(id));

  // this is our outer application exposed api...
  return {
    foo: function foo() {
      return _reactRoot.foo();
    }
  };
}

/**
 * global expose
 * @type {factory}
 */
window.appFactory = factory;
},{"./App":1,"./component/Root/Root":12}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../App");

var _App2 = _interopRequireDefault(_App);

var _Transaction = require("./Transaction");

var _Transaction2 = _interopRequireDefault(_Transaction);

var _utils = require("../_lib/mm/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Account = function () {
    function Account(data) {
        _classCallCheck(this, Account);

        this._data = Object.assign({}, Account.defaults, data || {});
    }

    _createClass(Account, [{
        key: "toJSON",
        value: function toJSON() {
            return this._data;
        }
    }, {
        key: "id",
        get: function get() {
            return this._data.id;
        }
    }, {
        key: "label",
        get: function get() {
            return this._data.label;
        },
        set: function set(val) {
            this._data.label = val.trim();
        }
    }, {
        key: "transactions",
        get: function get() {
            return this._data.transactions;
        }
    }, {
        key: "balance",
        get: function get() {
            return this.transactions.reduce(function (sum, t) {
                return sum + t.amount;
            }, 0);
        }
    }, {
        key: "balanceFormatted",
        get: function get() {
            return (0, _utils.mm_formatMoney)(this.balance, 2);
        }
    }, {
        key: "lastTransaction",
        get: function get() {
            var t = this.transactions;
            if (t.length) return t[t.length - 1];
        }
    }], [{
        key: "fechOneByUserIdAndAccountId",


        /**
         * @param userId
         * @param accountId
         * @returns {Promise.<TResult>}
         */
        value: function fechOneByUserIdAndAccountId(userId, accountId) {
            return Account.fetchAllByUserId(userId).then(function (accounts) {
                return Promise.resolve(accounts ? accounts.filter(function (a) {
                    return a.id === accountId;
                })[0] : null);
            });
        }

        /**
         * I'm simulating the implementation to be async (to be closer to the real world)
         * @param userId
         * @returns {Promise}
         */

    }, {
        key: "fetchAllByUserId",
        value: function fetchAllByUserId(userId) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    var rows = _App2.default.instance.storage.getItem("accounts" + userId);
                    var accounts = rows && rows.length ? rows.map(function (row) {
                        if (row.transactions.length) {
                            row.transactions = row.transactions.map(function (d) {
                                return new _Transaction2.default(d);
                            });
                        }
                        return new Account(row);
                    }) : null;
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

    }, {
        key: "saveAllForUserId",
        value: function saveAllForUserId(userId, accounts) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    _App2.default.instance.storage.setItem("accounts" + userId, accounts);
                    resolve(accounts);
                }, 100);
            });
        }

        /**
         * @returns {Promise}
         */

    }, {
        key: "getRandomSample",
        value: function getRandomSample() {
            var accounts = [];
            ['My personal primary', 'My personal secondary', 'My little business'].forEach(function (label) {
                accounts.push(new Account({
                    label: label,
                    transactions: new Array((0, _utils.mm_getRandomInt)(3, 5)).fill(1) // otherwise below map won't work... wtf?... apparently "Array(1)" is not same as "[undefined]"
                    .map(_Transaction2.default.factoryRandom).sort(function (a, b) {
                        return a.created.valueOf() - b.created.valueOf();
                    })
                }));
            });
            return accounts;
        }

        /**
         * I'm simulating the implementation to be async (to be closer to the real world)
         * @param userId
         * @returns {Promise}
         */

    }, {
        key: "deleteAllByUserId",
        value: function deleteAllByUserId(userId) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    _App2.default.instance.storage.removeItem("accounts" + userId);
                    resolve();
                }, 100);
            });
        }
    }, {
        key: "defaults",
        get: function get() {
            return {
                id: (0, _utils.mm_uid)(),
                label: null,
                transactions: []
            };
        }
    }]);

    return Account;
}();

exports.default = Account;
},{"../App":1,"../_lib/mm/utils":4,"./Transaction":17}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _App = require("../App");

var _App2 = _interopRequireDefault(_App);

var _utils = require("../_lib/mm/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Transaction = function () {
    function Transaction(data) {
        _classCallCheck(this, Transaction);

        this._data = Object.assign({}, Transaction.defaults, data || {});
    }

    _createClass(Transaction, [{
        key: "toJSON",
        value: function toJSON() {
            return this._data;
        }
    }, {
        key: "id",
        get: function get() {
            return this._data.id;
        }
    }, {
        key: "label",
        get: function get() {
            return this._data.label;
        },
        set: function set(v) {
            this._data.label = ("" + v).trim();
        }
    }, {
        key: "category",
        get: function get() {
            return this._data.category;
        },
        set: function set(v) {
            this._data.category = ("" + v).trim();
        }
    }, {
        key: "amount",
        get: function get() {
            return this._data.amount;
        },
        set: function set(v) {
            return this._data.amount = parseFloat(v);
        }
    }, {
        key: "created",
        get: function get() {
            return this._data.created;
        }
    }], [{
        key: "factoryRandom",


        /**
         * @returns {Transaction}
         */
        value: function factoryRandom() {
            var categs = _App2.default.instance.config.transactionCategories;
            var categ = categs[(0, _utils.mm_getRandomInt)(0, categs.length - 1)];
            var amount = (0, _utils.mm_getRandomInt)(1, 2000);
            if (categ.type === 'debit') amount *= -1;
            var now = Date.now();
            return new Transaction({
                label: "Untitled",
                category: categ.label,
                amount: amount,
                created: new Date((0, _utils.mm_getRandomInt)(now, now - 60 * 60 * 24 * 7 * 1000))
            });
        }
    }, {
        key: "defaults",
        get: function get() {
            return {
                id: (0, _utils.mm_uid)(),
                label: null,
                category: null,
                amount: null,
                created: new Date()
            };
        }
    }]);

    return Transaction;
}();

exports.default = Transaction;
},{"../App":1,"../_lib/mm/utils":4}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MM_Ajax = require("../_lib/mm/MM_Ajax");

var _MM_Ajax2 = _interopRequireDefault(_MM_Ajax);

var _App = require("../App");

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = function () {
    function User(data) {
        _classCallCheck(this, User);

        this._data = Object.assign({}, User.defaults, data || {});
    }

    _createClass(User, [{
        key: "toJSON",
        value: function toJSON() {
            return this._data;
        }
    }, {
        key: "save",
        value: function save() {
            return User.save(this);
        }
    }, {
        key: "isAuthenticated",
        value: function isAuthenticated() {
            return !!this.id; // quick-n-dirty
        }
    }, {
        key: "id",
        get: function get() {
            return this._data.id;
        }
    }, {
        key: "first_name",
        get: function get() {
            return this._data.first_name;
        }
    }, {
        key: "last_name",
        get: function get() {
            return this._data.last_name;
        }
    }, {
        key: "avatar",
        get: function get() {
            return this._data.avatar;
        }
    }, {
        key: "name",
        get: function get() {
            return (this.first_name + " " + this.last_name).trim();
        }
    }], [{
        key: "save",


        /**
         * Saves current app user to storage.
         *
         * I'm simulating the implementation to be async (to be closer to the real world)
         *
         * @param dataOrUser
         * @returns {Promise}
         */
        value: function save(dataOrUser) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    _App2.default.instance.storage.setItem('user', dataOrUser);
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

    }, {
        key: "fetch",
        value: function fetch() {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    var data = _App2.default.instance.storage.getItem('user');
                    resolve(data ? new User(data) : null);
                }, 100);
            });
        }

        /**
         *
         * @param username
         * @param password
         * @returns {Promise.<TResult>}
         */

    }, {
        key: "fetchByUsernameAndPassword",
        value: function fetchByUsernameAndPassword(username, password) {

            return _MM_Ajax2.default.post(_App2.default.instance.config.loginApiEndpoint, { username: username, password: password }) // es6 short notation!
            .then(function (respTxt) {
                var data = JSON.parse(respTxt);
                if (data.error) throw new Error(data.error);
                return new User(data.payload);
            }).catch(function (msg) {
                // first, "low level" catch (to be improved in a real world... perhaps with some logging...)
                alert("Error: " + msg);
                // and rethrow to allow handling in upper level context too
                throw msg;
            });
        }
    }, {
        key: "defaults",
        get: function get() {
            return {
                id: null,
                first_name: null,
                last_name: null,
                avatar: null
            };
        }
    }]);

    return User;
}();

exports.default = User;
},{"../App":1,"../_lib/mm/MM_Ajax":2}]},{},[15]);
