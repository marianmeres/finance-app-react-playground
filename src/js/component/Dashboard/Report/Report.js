
import App from "../../../App";
import ScreenHeader from "../../_ScreenHeader/ScreenHeader";
import Spinner from "../../_Spinner/Spinner";

export default class Report extends React.Component {

    /**
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {type: 'Debits'}; // acts as title
        this.chart = null;

        //
        this.updateChart = this.updateChart.bind(this);
        this.onClickDebit = this.onClickDebit.bind(this);
        this.onClickCredit = this.onClickCredit.bind(this);
    }

    /**
     *
     */
    componentDidMount() {
        let data = {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [
                        "#f0ad4e",
                        "#ffd500",
                        "#0275d8",
                        "#5bc0de",
                        "#ff5b77",
                        "#613d7c",
                    ]
                }]
        };

        this.chart = new Chart(this.el, {
            type: 'doughnut',
            data: data,
        });

        this.updateChart();
    }

    /**
     *
     */
    componentWillUnmount() {
        this.chart.destroy();
        this.chart = null;
    }

    onClickDebit(e) {
        e.preventDefault();
        this.setState({type: 'Debits'})
    }

    onClickCredit(e) {
        e.preventDefault();
        this.setState({type: 'Credits'})
    }

    /**
     *
     */
    updateChart() {
        if (this.props._isPendingFetch) return;
        if (!this.props.accounts) return;
        if (!this.chart) return;

        // normalize
        let type = /credit/i.test(this.state.type) ? 'credit' : 'debit';

        let map = {};
        this.props.accounts.forEach((a) => {
            a.transactions.forEach((t) => {
                if (type === 'credit' && t.amount < 0) return;
                if (type === 'debit' && t.amount > 0) return;
                if (!map[t.category]) map[t.category] = 0;
                map[t.category] += Math.abs(t.amount);
            })
        });
        //console.log(type, map);


        let labels = [];
        let data = [];
        Object.keys(map).forEach((k) => {
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
    render() {
        let config = App.instance.config;
        let ns = config.bemNs;
        let B = `${ns}-report`; // "B" from BEM
        let user = this.props.user;

        this.updateChart();

        // quick n dirty
        let crCls = this.state.type === 'Credits' ? 'btn-info' : 'btn-outline-info';
        let dbCls = this.state.type === 'Debits' ? 'btn-info' : 'btn-outline-info';


        let MaybeNotFound = () => {
            if (this.props._isPendingFetch) return null;
            if (!this.props.accounts || !this.props.accounts.length) {
                return <p>No accounts found... <a href="#index">Go create one!</a></p>;
            }
            return null;
        };

        return (
            <section className={`${B} ${ns}-screen-inner`}>
                <ScreenHeader title="Report" user={user} backScreenId='index' />
                <div className={`${B} ${ns}-screen-body`}>
                    <h2 className={`${ns}-screen-body-h`}>
                        My {this.state.type}
                    </h2>
                    <MaybeNotFound/>
                    <div className={`${B}-canvaswrap`}>
                        <canvas ref={el => this.el = el} width="500" height="300" />
                    </div>
                </div>
                <div className={`${B}-footer ${ns}-screen-footer`}>
                    <button className={`btn ${dbCls}`} onClick={this.onClickDebit}>
                        <i className="fa fa-pie-chart" aria-hidden="true" />&nbsp;
                        Debits
                    </button>
                    <button className={`btn ${crCls} pull-right`} onClick={this.onClickCredit}>
                        <i className="fa fa-pie-chart" aria-hidden="true" />&nbsp;
                        Credits
                    </button>
                </div>
            </section>
        );
    }
}
