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
export default class Logout extends React.Component {

    componentWillMount() {
        this.props.actions.logOut();
    }

    render() {
        return null;
    }
}