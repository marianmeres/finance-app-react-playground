import App from "../../App";
import User from "../../model/User";
import Login from "../Login/Login";
import Dashboard from "../Dashboard/Dashboard";
import Spinner from "../_Spinner/Spinner";

export default class Root extends React.Component {

    /**
     * @param props
     */
    constructor(props) {
        super(props);

        //
        this.state = {
            user: null,
            screenId: window.location.hash.substr(1),
            _isPendingUserFetch: true,
        };

        //
        this.setUser = this.setUser.bind(this);
        this.logOut = this.logOut.bind(this);
        this.onHashChange = this.onHashChange.bind(this);
        this.navigateTo = this.navigateTo.bind(this);
    }

    /**
     *
     */
    onHashChange() {
        this.navigateTo(window.location.hash.substr(1));
    }

    /**
     *
     */
    componentDidMount() {
        //
        //window.location.hash = ''; // reset hash on app start...
        // hack to postpone the addEventListener on the next tick, otherwise fired
        // immediatelly (even if the actual change is above)
        // see https://codepen.io/marianmeres/pen/QvOdLY
        //setTimeout(() => window.addEventListener('hashchange', this.onHashChange), 0);
        // UPDATE: as I am not reseting the hash anymore, the above is not needed
        window.addEventListener('hashchange', this.onHashChange);

        this.setState({_isPendingUserFetch: true});
        User.fetch()
            .then((user) => {
                this.setState({_isPendingUserFetch: false});
                this.setUser(user);
            })
            .catch((err) => {
                console.error(err);
                this.setState({_isPendingUserFetch: false});
            });
    }

    /**
     * clean up... which will never happen actually (this is the root component)
     */
    componentWillUnmount() {
        App.instance = null;
        window.removeEventListener('hashchange', this.onHashChange);
    }

    /**
     * sets user to local state AND to persistance layer
     * @param user
     */
    setUser(user) {
        this.setState({user: user});
        User
            .save(user)
            .catch((err) => console.error(err)); // always catch
    }

    /**
     *
     */
    logOut() {
        this.setUser(null);
        window.location.hash = '';
    }

    /**
     * @param screenId
     */
    navigateTo(screenId) {
        // make the hash the top authority, so always keep it in sync...
        if (screenId !== window.location.hash.substr(1)) {
            return window.location.hash = screenId;
        }
        this.setState({screenId: screenId});
    }

    /**
     * There must be better ways to do this...
     * @returns {*}
     */
    actions() {
        return {
            logOut: this.logOut,
            navigateTo: this.navigateTo,
        }
    }

    /**
     * @returns {XML}
     */
    render() {
        let config = App.instance.config;
        let B = `${config.bemNs}-root`; // "B" from BEM
        let screen;

        if (this.state._isPendingUserFetch) {
            screen = <Spinner customCssCls="fa-2x"/>;
        }
        else if (this.state.user && this.state.user.isAuthenticated()) {
            screen = <Dashboard
                screenId={this.state.screenId}
                user={this.state.user}
                setUser={this.setUser}
                actions={this.actions()}
            />
        }
        else {
            screen = <Login
                loginApiEndpoint={config.loginApiEndpoint}
                setUser={this.setUser}
            />
        }

        return (
            <div className={B}>
                {screen}
            </div>
        );
    }

    /**
     * this is just to illustrate the ability to expose only custom API... see main.js
     */
    foo() {
        alert('bar');
    }
}
