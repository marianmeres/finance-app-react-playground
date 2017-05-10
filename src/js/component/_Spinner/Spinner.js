import App from "../../App";

export default class Spinner extends React.Component {

    render() {
        let ns = App.instance.config.bemNs;
        let B = `${ns}-spinner`; // "B" from BEM
        return (
            <div className={B}>
                <i className={`fa fa-spinner fa-spin ${this.props.customCssCls}`} />
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

}

