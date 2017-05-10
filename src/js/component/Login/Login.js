import App from "../../App";
import User from "../../model/User";
import ScreenHeader from "../_ScreenHeader/ScreenHeader";

export default class Login extends React.Component {

    /**
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            _isPendingFormSubmit: false,
        };

        //
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /**
     * @param e
     */
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    /**
     * @param e
     */
    handleSubmit(e) {
        e.preventDefault();

        let username = this.state.username;
        let password = this.state.password;

        // we need to handle browser's autofill, which won't fire as change event ;(
        // so hacking it through "ref"...
        // UPDATE: this seems not to be an issue anymore (something else was wrong...)
        // but I'm leaving it here so I can remember
        if (this.$usernameInput.value !== username) username = this.$usernameInput.value;
        if (this.$passwordInput.value !== password) password = this.$passwordInput.value;
        this.setState({username, password}); // just to keep in sync

        //
        this.setState({_isPendingFormSubmit: true});
        User
            .fetchByUsernameAndPassword(username, password)
            .then((user) => {
                this.setState({_isPendingFormSubmit: false});
                this.props.setUser(user);
            })
            .catch((err) => {
                console.error(err);
                this.setState({_isPendingFormSubmit: false})
            });
    }

    /**
     * @returns {XML}
     */
    render() {
        let config = App.instance.config;
        let ns = config.bemNs;
        let B = `${ns}-login`; // "B" from BEM

        return (
            <section className={`${B} ${ns}-screen-outer`}>
                <form method="post" className={`${B}-screen ${ns}-screen-inner`} onSubmit={this.handleSubmit}>
                    <ScreenHeader title="Login"/>
                    <div className={`${B}-content ${ns}-screen-body`}>
                        <div className={`${B}-inputs`}>
                            <label>
                                <span>Username</span>
                                <input type="text" name="username" autoFocus={true} className="form-control"
                                    required={true}
                                    value={this.state.username}
                                    onChange={this.handleChange}
                                    // hack for browser's autofill silence, read above
                                    ref={(input) => this.$usernameInput = input}
                                />
                            </label>
                            <label>
                                <span>Password</span>
                                <input type="password" name="password"  className="form-control"
                                    required={true}
                                    value={this.state.password}
                                    onChange={this.handleChange}
                                    // hack for browser's autofill silence, read above
                                    ref={(input) => this.$passwordInput = input }
                                />
                            </label>
                            <button type="submit" disabled={this.state._isPendingFormSubmit}
                                className={`btn btn-primary ${B}-submit`}>
                                Login
                            </button>
                        </div>
                        <div className={`${B}-note`}>
                            TIP: Use first and last name of any member of The Beatles.
                            <br/><small>
                                <a href="https://github.com/marianmeres/finance-app-react-playground">
                                    Source of this demo on GitHub
                                </a>
                            </small>
                        </div>
                    </div>
                </form>
            </section>
        );
    }

}