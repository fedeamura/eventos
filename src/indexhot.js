import "./public-path";
import React from "react";
import { hot } from "react-hot-loader/root";
// import { setConfig } from "react-hot-loader";

import App from "@UI/App";
import { unregister } from "./registerServiceWorker";

import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import arLocale from "date-fns/locale/es";

//REDUX
import { Provider } from "react-redux";
import configureStore, { history } from "@Redux/Store/index";

//Router
import { ConnectedRouter } from "connected-react-router";

const store = configureStore(/* provide initial state if any */);
// setConfig({ pureSFC: true });
unregister();

let MiApp = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={arLocale}>
        <App />
      </MuiPickersUtilsProvider>
    </ConnectedRouter>
  </Provider>
);
export default hot(MiApp);
