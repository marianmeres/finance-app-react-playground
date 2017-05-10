import App from "../../../App";
import ScreenHeader from "../../_ScreenHeader/ScreenHeader";
import Account from "../../../model/Account";

export default class User extends React.Component {

    /**
     * @param props
     */
    constructor(props) {
        super(props);
        this.deleteAllUserData = this.deleteAllUserData.bind(this);
    }

    /**
     * @param e
     */
    deleteAllUserData(e) {
        e.preventDefault();
        if (confirm("Are you sure?")) {
            this.props.handleDeleteAllUserData();
        }
    }

    /**
     * @returns {XML}
     */
    render() {
        let config = App.instance.config;
        let ns = config.bemNs;
        let B = `${ns}-user`; // "B" from BEM
        let user = this.props.user;

        // sanity check
        if (!user) return <p>Error: missing user?!</p>;

        return (
            <section className={`${B} ${ns}-screen-inner`}>
                <ScreenHeader title="Settings" user={user}
                    backScreenId={this.props.backScreenId}
                />
                <div className={`${B} ${ns}-screen-body`}>
                    <h2 className={`${ns}-screen-body-h`}>Hello, {user.first_name}!</h2>
                    <p>This is your settings screen...</p>
                </div>
                <div className={`${B}-footer ${ns}-screen-footer`}>
                    <button onClick={this.deleteAllUserData} className="btn btn-danger">
                        <i className="fa fa-trash" aria-hidden="true"/>
                        &nbsp;Delete all my accounts
                    </button>
                    <a href="#logout" className="btn btn-primary float-right">
                        <i className="fa fa-sign-out" aria-hidden="true"/>&nbsp;Logout
                    </a>
                </div>
            </section>
        )
    }
}