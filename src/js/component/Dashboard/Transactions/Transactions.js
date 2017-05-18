import App from "../../../App";
import ScreenHeader from "../../_ScreenHeader/ScreenHeader";
import Account from "../../../model/Account";
import Spinner from "../../_Spinner/Spinner";
import Transaction from "../../../model/Transaction";
import {mm_formatMoney} from "../../../_lib/mm/utils";

export default class Transactions extends React.Component {

    /**
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            _pendingTx: false,
            _inputLabelId: null,
            inputValue: '',
        };

        this.onClickTxDelete = this.onClickTxDelete.bind(this);
        this.onClickTxAdd = this.onClickTxAdd.bind(this);
        this.onClickAccountDelete = this.onClickAccountDelete.bind(this);
        this.onClickUpdateLabel = this.onClickUpdateLabel.bind(this);
    }

    /**
     * @param e
     */
    onClickAccountDelete(e) {
        e.preventDefault();
        if (!this.props.account) return;
        if (confirm(`Delete "${this.props.account.label}"?`)) {
            let pr = this.props.handleDeleteAccount(this.props.account);
            pr.then && pr.then(() => this.props.actions.navigateTo('index')); // hm...
        }
    }

    /**
     * @param tx
     * @param e
     */
    onClickTxDelete(tx, e) {
        e.preventDefault();
        if (!this.props.account) return; // sanity check
        if (confirm(`Delete "${tx.label}"?`)) {
            this.setState({_pendingTx: tx.id});
            let _resetPending = () => this.setState({_pendingTx: false});
            this.props.handleTxDelete(this.props.account, tx)
                .then(_resetPending, _resetPending)
                .catch(_resetPending) // still needed if onRejected is already handled?
        }
    }

    /**
     * @param e
     */
    onClickTxAdd(e) {
        e.preventDefault();
        if (!this.props.account) return; // sanity check

        let input = prompt('Enter transaction amount:', '1.00');
        let amt = parseFloat(input);
        if (Number.isNaN(amt)) return console.warn(`Ignoring NaN input "${input}"...`);
        if (!amt) return console.warn("Ignoring zero amount");
        if (Math.abs(amt) > 999999) return alert("This app is not for you. Go consult your private banker!");

        let defaultCateg = App.instance.getCategsForAmt(amt)[0].label;
        let label = prompt("Enter transaction label:", "Untitled");
        if (!label || label.trim() === "") return;

        this.props.handleTxAdd(this.props.account, new Transaction({
            label: label, category: defaultCateg, amount: amt
        }));
    }

    /**
     * @param tx
     * @param e
     */
    onClickUpdateLabel(tx, e) {
        e.preventDefault();

        this.setState({
            inputValue: tx.label,
            _inputLabelId: tx.id,
        });

        // if (!this.props.account || !tx) return; // sanity check
        // let input = prompt("New label:", tx.label);
        // if (!input) return;
        // tx.label = input.trim();
        //
        // this.setState({_pendingTx: tx.id});
        // let _resetPending = () => this.setState({_pendingTx: false});
        // this.props.handleTxEdit(this.props.account, tx)
        //     .then(_resetPending, _resetPending)
        //     .catch(_resetPending) // still needed if onRejected is already handled?
    }

    onChangeTypeInput(tx, e) {
        e.preventDefault();

        this.setState({inputValue: e.target.value});
    }

    onInputSubmit(tx, e) {
        e.preventDefault();

        let input = this.state.inputValue.trim();
        if (!input.length) { // ignore
            this.setState({
                inputValue: '', _inputLabelId: null
            });
            return;
        }

        tx.label = input; // samotne setnutie

        this.setState({_pendingTx: tx.id});
        let _resetPending = () => this.setState({_pendingTx: false, _inputLabelId: null, inputValue: ''});
        this.props.handleTxEdit(this.props.account, tx)
            .then(_resetPending, _resetPending)
            .catch(_resetPending) // still needed if onRejected is already handled?
    }

    /**
     * @param tx
     * @param e
     */
    onClickUpdateAmount(tx, e) {
        e.preventDefault();
        if (!this.props.account || !tx) return; // sanity check
        let amt = parseFloat(prompt("New amount:", tx.amount));
        if (!amt || Number.isNaN(amt)) return;
        if (Math.abs(amt) > 999999) return alert("This app is not for you. Go consult your private banker!");

        let old = tx.amount;
        tx.amount = amt;

        // if we have changed debit to credit (or opposite)
        if ((old < 0 && amt > 0) || (old > 0 && amt < 0)) {
            // we have to update category as well (using first available)
            tx.category = App.instance.getCategsForAmt(tx.amount)[0];
        }

        this.setState({_pendingTx: tx.id});
        let _resetPending = () => this.setState({_pendingTx: false});
        this.props.handleTxEdit(this.props.account, tx)
            .then(_resetPending, _resetPending)
            .catch(_resetPending) // still needed if onRejected is already handled?
    }

    /**
     * @param tx
     * @param e
     */
    onChangeUpdateCategory(tx, e) {
        e.preventDefault();
        tx.category = e.target.value;

        this.setState({_pendingTx: tx.id});
        let _resetPending = () => this.setState({_pendingTx: false});
        this.props.handleTxEdit(this.props.account, tx)
            .then(_resetPending, _resetPending)
            .catch(_resetPending) // still needed if onRejected is already handled?
    }

    /**
     * @returns {string}
     * @constructor
     */
    B() {
        return `${App.instance.config.bemNs}-transactions`; // "B" from BEM
    }

    /**
     * @returns {XML}
     */
    render() {
        let config = App.instance.config;
        let ns = config.bemNs;
        let B = this.B();

        return (
            <section className={`${B} ${ns}-screen-inner`}>
                <ScreenHeader title="Account Transactions" user={this.props.user}
                    backScreenId="index"
                />
                <div className={`${B}-content ${ns}-screen-body`}>
                    {this.renderAccountTransactions()}
                </div>
                <div className={`${B}-footer ${ns}-screen-footer`}>
                    <button className="btn btn-danger"
                        onClick={this.onClickAccountDelete}>
                        <i className="fa fa-trash" aria-hidden="true" />
                        &nbsp;Delete This Account
                    </button>
                    <button className="btn btn-primary float-right"
                        onClick={this.onClickTxAdd}>
                        <i className="fa fa-plus-circle" aria-hidden="true" />
                        &nbsp;Add Transaction
                    </button>
                </div>
            </section>
        );
    }

    /**
     * @returns {XML}
     */
    renderAccountTransactions() {
        if (this.props._isPendingFetch) {
            return <Spinner/>;
        }
        if (!this.props.account) {
            return <div><p>Account not found!</p><p><a href="#index">&rarr; Go to my accounts</a></p></div>;
        }

        let config = App.instance.config;
        let ns = config.bemNs;
        let B = this.B();
        let a = this.props.account;
        let _posneg = (amt) => amt ? (amt < 0 ? 'neg' : 'pos') : '';
        let categs = config.transactionCategories;
        let sum = a.transactions.reduce((sum, t) => sum + t.amount, 0);
        let sumPosNeg = _posneg(sum);
        let app = App.instance;

        return (
            <div className={`${B}-txs`}>
                <h2 className={`${ns}-screen-body-h`}>{a.label}</h2>
                <div className={`${B}-txs-th`}>
                    <div className={`${B}-txs-thitem ${B}-txs-thitem__label`}>
                        Label
                    </div>
                    <div className={`${B}-txs-thitem ${B}-txs-thitem__label2`}>
                        Category
                    </div>
                    <div className={`${B}-txs-thitem ${B}-txs-thitem__amt`}>
                        Amount
                    </div>
                </div>

                {a.transactions.map((t, idx) => {
                    let posneg = _posneg(t.amount);
                    return (
                    <div key={t.id} className={`${B}-txs-trwrap`}>
                        <div className={`${B}-txs-trspinnerbox`}>
                            {this.state._pendingTx === t.id ? <Spinner/> : null}
                        </div>

                        <div className={`${B}-txs-tr`}>
                            <div className={`${B}-txs-tritem ${B}-txs-tritem__label`}>
                            {
                                this.state._inputLabelId === t.id
                                    ? (
                                        <form onSubmit={this.onInputSubmit.bind(this, t)}>
                                            <input type="text"
                                                value={this.state.inputValue}
                                                onChange={this.onChangeTypeInput.bind(this, t)}
                                            />
                                        </form>
                                    )
                                    : (
                                        <button onClick={this.onClickUpdateLabel.bind(this, t)}>
                                            <strong>{t.label}</strong>
                                        </button>
                                    )
                            }
                                <br/>
                                <small>{new Date(t.created).toLocaleString()}</small>
                            </div>
                            <div className={`${B}-txs-tritem ${B}-txs-tritem__label2`}>
                                <select className="custom-select" value={t.category}
                                    onChange={this.onChangeUpdateCategory.bind(this, t)}>
                                {app
                                    .getCategsForAmt(t.amount)
                                    .map((c) => {
                                        return (
                                            <option key={c.id} value={c.label}>
                                                {c.label}
                                            </option>
                                        );
                                    })
                                }
                                </select>
                            </div>
                            <div className={[
                                `${B}-txs-tritem`,
                                `${B}-txs-tritem__sum`,
                                `${B}-txs-tritem__${posneg}`
                            ].join(" ")}>
                                <button
                                    onClick={this.onClickUpdateAmount.bind(this, t)}
                                    dangerouslySetInnerHTML={{
                                    __html: mm_formatMoney(t.amount).split(" ").join("&nbsp;")
                                }} />
                            </div>

                        </div>

                        <a href="javascript:void(0)" className={`${B}-txs-trx`}
                           onClick={this.onClickTxDelete.bind(this, t)} >
                            <span className={`${B}-txs-trx-x__outer`}>
                                <span className={`${B}-txs-trx-x__inner`}>
                                    &times;
                                </span>
                            </span>
                        </a>
                    </div>
                    );
                })}

                <div className={`${B}-txs-th ${B}-txs-th__foot`}>
                    <div className={[
                        `${B}-txs-thitem`,
                        `${B}-txs-thitem__label`,
                        `${B}-txs-thitem__label__foot`
                    ].join(" ")} >
                        Total
                    </div>
                    <div className={[
                        `${B}-txs-thitem`,
                        `${B}-txs-thitem__amt`,
                        `${B}-txs-thitem__amt__${sumPosNeg}`,
                        `${B}-txs-thitem__amt__foot`
                    ].join(" ")}>
                        <span dangerouslySetInnerHTML={{
                            __html: mm_formatMoney(sum).split(" ").join("&nbsp;")
                        }} />
                    </div>
                </div>

            </div>
        );
    }
}

// <i className="fa fa-times-circle" aria-hidden="true" />
// <span className="sr-only">Delete</span>