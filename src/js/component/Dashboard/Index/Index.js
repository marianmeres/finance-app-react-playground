import App from "../../../App";
import ScreenHeader from "../../_ScreenHeader/ScreenHeader";
import Account from "../../../model/Account";
import Spinner from "../../_Spinner/Spinner";
import {mm_formatMoney} from "../../../_lib/mm/utils";

export default class Index extends React.Component {

    /**
     * @param props
     */
    constructor(props) {
        super(props);
        this.handleClickAccountAdd = this.handleClickAccountAdd.bind(this);
    }

    /**
     * @param account
     * @param e
     */
    handleClickAccountEdit(account, e) {
        e.preventDefault();
        let name = prompt("New account name:", account.label);
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
    handleClickAccountAdd(e) {
        e.preventDefault();
        let name = prompt("Account name");
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
    render() {
        let config = App.instance.config;
        let ns = config.bemNs;
        let B = `${ns}-index`; // "B" from BEM

        //
        let accounts = this.props.accounts; // shortcut
        let addDisabled = (accounts && accounts.length >= config.maxAccountsLimit);

        return (
            <section className={`${B} ${ns}-screen-inner`}>
                <ScreenHeader title="My Accounts" user={this.props.user}/>
                <div className={`${B}-content ${ns}-screen-body`}>
                    <h2 className={`${ns}-screen-body-h`}>My accounts</h2>
                    {this.renderAccountsList()}
                </div>
                <div className={`${B}-footer ${ns}-screen-footer`}>
                    <a href='#report' className="btn btn-secondary">
                        <i className="fa fa-pie-chart" aria-hidden="true" />&nbsp;Report
                    </a>
                    <button className="btn btn-primary float-right"
                        disabled={addDisabled}
                        onClick={this.handleClickAccountAdd}>
                        <i className="fa fa-plus-circle" aria-hidden="true" />&nbsp;Add account
                    </button>
                </div>
            </section>
        )
    }

    /**
     *
     */
    renderAccountsList() {
        if (this.props._isPendingFetch === true) { // of first load
            return <Spinner/>;
        }

        let accounts = this.props.accounts;
        if (!accounts || !accounts.length) {
            return (
                <div>
                    <p>{this.props.user.first_name}, you haven't added any accounts yet.</p>
                    <button onClick={this.props.handleCreateRandomAccounts} className="btn btn-secondary">
                        Add few random samples now!
                    </button>
                </div>
            );
        }

        let config = App.instance.config;
        let ns = config.bemNs;
        let B = `${ns}-index`; // "B" from BEM

        let _posneg = (amt) => amt ? (amt < 0 ? 'neg' : 'pos') : '';
        let sum = accounts.reduce((sum, a) => sum + a.balance, 0);
        let sumPosNeg = _posneg(sum);


        return (
            <div className={`${B}-accounts`}>
                <div className={`${B}-accounts-th`}>
                    <div className={`${B}-accounts-thitem ${B}-accounts-thitem__label`}>
                        Label
                    </div>
                    <div className={`${B}-accounts-thitem ${B}-accounts-thitem__sum`}>
                        Balance
                    </div>
                </div>
                {accounts.map((a, idx) => {
                    let posneg = _posneg(a.balance);
                    return(
                    <div key={a.id} className={`${B}-accounts-trwrap`}>
                        <div className={`${B}-accounts-trspinnerbox`}>
                            {this.props._isPendingFetch === a.id ? <Spinner/> : null}
                        </div>
                        <a href={`#account/${a.id}`} className={`${B}-accounts-tr`}>
                            <div className={`${B}-accounts-tritem ${B}-accounts-tritem__label`}>
                                <strong>{a.label}</strong><br/>
                                <small>Last: {
                                    a.lastTransaction ? (
                                        mm_formatMoney(a.lastTransaction.amount)
                                        + " ("
                                        + (new Date(a.lastTransaction.created)).toLocaleString()
                                        + ")"
                                    ) : 'n/a'
                                }</small>
                            </div>
                            <div className={[
                                    `${B}-accounts-tritem`,
                                    `${B}-accounts-tritem__sum`,
                                    `${B}-accounts-tritem__${posneg}`
                                ].join(" ")}>
                                <span dangerouslySetInnerHTML={{
                                    __html: a.balanceFormatted.split(" ").join("&nbsp;")
                                }} />
                            </div>
                        </a>
                        {/* button would be better, but I'm having a little hard
                            time with css on button here, so, for simplicity, keeping "a" for now */}
                        <a href="javascript:void(0)" className={`${B}-accounts-trx`}
                            onClick={this.handleClickAccountEdit.bind(this, a)} >
                            <i className="fa fa-pencil" aria-hidden="true" />
                            <span className="sr-only">Edit</span>
                        </a>
                    </div>
                    )
                })}
                <div className={`${B}-accounts-th ${B}-accounts-th__foot`}>
                    <div className={[
                            `${B}-accounts-thitem`,
                            `${B}-accounts-thitem__label`,
                            `${B}-accounts-thitem__label__foot`
                        ].join(" ")} >
                        Total
                    </div>
                    <div className={[
                            `${B}-accounts-thitem`,
                            `${B}-accounts-thitem__sum`,
                            `${B}-accounts-thitem__sum__${sumPosNeg}`,
                            `${B}-accounts-thitem__sum__foot`
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