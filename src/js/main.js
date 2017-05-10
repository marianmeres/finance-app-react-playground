import Root from "./component/Root/Root";
import App from "./App";

/**
 * @param id
 * @param config
 * @returns {*}
 */
function factory(id, config) {

    App.instance = new App(config);

    let _reactRoot = ReactDOM.render(<Root />, document.getElementById(id));

    // this is our outer application exposed api...
    return {
        foo: () => _reactRoot.foo(),
    };
}

/**
 * global expose
 * @type {factory}
 */
window.appFactory = factory;