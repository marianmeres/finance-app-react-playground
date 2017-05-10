import Index from "./Index/Index";
import App from "../../App";
import User from "./User/User";
import Logout from "./Logout/Logout";
import Account from "../../model/Account";
import Transactions from "./Transactions/Transactions";
import Report from "./Report/Report";

export default class Dashboard extends React.Component {

    /**
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            accounts: [],
            _isPendingAccountsFetch: false,
        };

        //
        this.handleLogOut = this.handleLogOut.bind(this);
        this.handleCreateRandomAccounts = this.handleCreateRandomAccounts.bind(this);
        this.handleAccountChange = this.handleAccountChange.bind(this);
        this.handleAccountAdd = this.handleAccountAdd.bind(this);
        this.handleDeleteAllUserData = this.handleDeleteAllUserData.bind(this);
        this.handleTxAdd = this.handleTxAdd.bind(this);
        this.handleTxDelete = this.handleTxDelete.bind(this);
        this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
        this.handleTxEdit = this.handleTxEdit.bind(this);
        this._panic = this._panic.bind(this);
    }

    /**
     * @param err
     * @private
     */
    _panic(err) {
        console.error(err);
        alert(`Error: ${err}`);
    }

    /**
     *
     */
    componentDidMount() {
        this.setState({_isPendingAccountsFetch: true});
        Account
            .fetchAllByUserId(this.props.user.id)
            .then(
                (accounts) => this.setState({_isPendingAccountsFetch: false, accounts: accounts}),
                () => this.setState({_isPendingAccountsFetch: false})
            )
            .catch(this._panic);
    }

    /**
     * @param e
     */
    handleCreateRandomAccounts(e) {
        e.preventDefault();
        let accounts = Account.getRandomSample();
        //console.log(accounts, JSON.stringify(accounts)); return;

        this.setState({_isPendingAccountsFetch: true});
        return Account
            .saveAllForUserId(this.props.user.id, accounts)
            .then(
                (accounts) => this.setState({_isPendingAccountsFetch: false, accounts: accounts}),
                () => this.setState({_isPendingAccountsFetch: false})
            )
            .catch(this._panic);
    }

    /**
     * @param e
     */
    handleLogOut(e) {
        e.preventDefault();
        this.props.setUser(null);
    }

    /**
     * @param account
     */
    handleAccountChange(account) {
        let idx = this.state.accounts.indexOf(account);

        if (!!~idx) {
            // https://facebook.github.io/react/docs/react-component.html
            // Never mutate this.state directly ... treat this.state as if it were immutable.
            let newState = Object.assign({}, this.state);
            newState.accounts[idx] = account;
            newState._isPendingAccountsFetch = account.id;

            this.setState(newState);

            return Account
                .saveAllForUserId(this.props.user.id, newState.accounts)
                .then(
                    (accounts) => {
                        this.setState({
                            _isPendingAccountsFetch: false, accounts: accounts // set accounts not really needed...
                        });
                    },
                    () => this.setState({_isPendingAccountsFetch: false})
                )
                .catch(this._panic);

        } else {
            this._panic("Account not found?!")
        }
    }

    /**
     * @param label
     */
    handleAccountAdd(label) {
        let state = Object.assign({}, this.state);
        if (!state.accounts) state.accounts = [];
        state.accounts.push(new Account({label: label}));

        state._isPendingAccountsFetch = true;
        this.setState(state);
        return Account
            .saveAllForUserId(this.props.user.id, state.accounts)
            .then(
                (accounts) => {
                    this.setState({
                        _isPendingAccountsFetch: false, accounts: accounts // set accounts not really needed...
                    });
                },
                () => this.setState({_isPendingAccountsFetch: false})
            )
            .catch(this._panic);
    }

    /**
     *
     */
    handleDeleteAllUserData() {
        let id = this.props.user.id;
        return Account
            .deleteAllByUserId(id)
            .then(() => {
                this.setState({ accounts: [] });
                this.props.actions.navigateTo('index');
            })
            .catch(this._panic);
    }

    /**
     * @param account
     * @returns {*}
     */
    handleDeleteAccount(account) {
        let state = Object.assign({}, this.state);
        let aIdx = state.accounts.indexOf(account);
        if (!~aIdx) return this._panic(`Account "${account.id}" not found?!`);
        state.accounts.splice(aIdx, 1);

        return Account
            .saveAllForUserId(this.props.user.id, state.accounts)
            .then(() => this.setState(state))
            .catch(this._panic)
    }

    /**
     * @param account
     * @param transaction
     * @returns {*}
     */
    handleTxAdd(account, transaction) {
        let state = Object.assign({}, this.state);
        let aIdx = state.accounts.indexOf(account);
        if (!~aIdx) return this._panic(`Account "${account.id}" not found?!`);
        state.accounts[aIdx].transactions.push(transaction);
        this.setState(state);

        return Account
            .saveAllForUserId(this.props.user.id, state.accounts)
            .catch(this._panic)
    }

    /**
     * @param account
     * @param tx
     */
    handleTxEdit(account, tx) {
        let state = Object.assign({}, this.state);
        let aIdx = state.accounts.indexOf(account);
        if (!~aIdx) return this._panic(`Account "${account.id}" not found?!`);
        let tIdx = state.accounts[aIdx].transactions.indexOf(tx);
        if (!~tIdx) return this._panic(`Transaction "${tx.id}" not found in account "${account.id}"?!`);
        state.accounts[aIdx].transactions[tIdx] = tx;
        this.setState(state);

        return Account
            .saveAllForUserId(this.props.user.id, state.accounts)
            .catch(this._panic)
    }

    /**
     * @param account
     * @param tx
     * @returns {*}
     */
    handleTxDelete(account, tx) {
        let state = Object.assign({}, this.state);
        let aIdx = state.accounts.indexOf(account);
        if (!~aIdx) return this._panic(`Account "${account.id}" not found?!`);
        let tIdx = state.accounts[aIdx].transactions.indexOf(tx);
        if (!~tIdx) return this._panic(`Transaction "${tx.id}" not found in account "${account.id}"?!`);
        state.accounts[aIdx].transactions.splice(tIdx, 1);
        this.setState(state);

        return Account
            .saveAllForUserId(this.props.user.id, state.accounts)
            .catch(this._panic)
    }

    /**
     * @returns {XML}
     */
    render() {
        let config = App.instance.config;
        let ns = config.bemNs;
        let B = `${ns}-index`; // "B" from BEM
        let screen;

        let params = this.props.screenId.split("/");
        let _screenId = params[0];
        params.splice(0, 1);

        switch (_screenId) {
            case 'user':
                screen = <User
                    user={this.props.user}
                    actions={this.props.actions}
                    backScreenId="index"
                    handleDeleteAllUserData={this.handleDeleteAllUserData}
                />;
                break;

            case 'logout':
                // hm... see comments in Logout.js
                screen = <Logout actions={this.props.actions} />;
                break;

            case 'account':
                let account = null;
                let accountId = params[0];
                if (!this.state._isPendingAccountsFetch && this.state.accounts) {
                    account = this.state.accounts.filter((a) => a.id === accountId)[0];
                }
                screen = <Transactions
                    user={this.props.user}
                    actions={this.props.actions}
                    account={account}
                    handleTxAdd={this.handleTxAdd}
                    handleTxEdit={this.handleTxEdit}
                    handleTxDelete={this.handleTxDelete}
                    handleDeleteAccount={this.handleDeleteAccount}
                    _isPendingFetch={this.state._isPendingAccountsFetch}
                />;
                break;

            case 'report':
                screen = <Report
                    user={this.props.user}
                    accounts={this.state.accounts}
                    _isPendingFetch={this.state._isPendingAccountsFetch}
                />;
                break;

            case 'index':
            default:
                screen = <Index
                    user={this.props.user}
                    actions={this.props.actions}
                    accounts={this.state.accounts}
                    handleCreateRandomAccounts={this.handleCreateRandomAccounts}
                    handleAccountChange={this.handleAccountChange}
                    handleAccountAdd={this.handleAccountAdd}
                    _isPendingFetch={this.state._isPendingAccountsFetch}
                />;
        }

        return <div className={`${B} ${ns}-screen-outer`}>{screen}</div>;
    }
}

Dashboard.defaultProps = {
    screenId: 'index',
};