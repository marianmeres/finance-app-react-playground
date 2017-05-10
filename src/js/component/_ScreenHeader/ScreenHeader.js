import App from "../../App";

export default class ScreenHeader extends React.Component {

    B() {
        let config = App.instance.config;
        return `${config.bemNs}-screenheader`; // "B" from BEM
    }

    render() {
        let B = this.B();

        return (
            <header className={B}>
                <div className={`${B}-iconwrap`}>{this.back()}</div>
                <h1 className={`${B}-h`}>{this.props.title}</h1>
                <div className={`${B}-iconwrap`}>{this.avatar()}</div>
            </header>
        );
    }

    avatar() {
        if (!this.props.user) return null;

        let user = this.props.user;
        let B = this.B();

        return (
            <a href="#user" className={`${B}-avatar`}>
                <img src={user.avatar} alt={user.name} />
            </a>
        );
    }

    back() {
        if (!this.props.backScreenId) return null;
        let B = this.B();

        return (
            <a href={`#${this.props.backScreenId}`} className={`${B}-back`}>
                &larr;<span className="sr-only">Back</span>
            </a>
        );
    }
}

ScreenHeader.defaultProps = {
    title: 'Untitled',
};