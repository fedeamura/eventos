import "./public-path";
import { hot } from "react-hot-loader";
import * as React from "react";
import ReactDOM from "react-dom";
import { unregister } from "./registerServiceWorker";

//Theme
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import themeData from './theme';

//Date pickers
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import arLocale from "date-fns/locale/es";

//REDUX
import { Provider } from "react-redux";
import configureStore, { history } from "@Redux/Store/index";

//Router
import { ConnectedRouter } from "connected-react-router";

//Mi App
import AppHot from "./indexHot";

const store = configureStore(/* provide initial state if any */);
unregister();

const theme = createMuiTheme(themeData);

let MiApp = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={arLocale}>
        <MuiThemeProvider theme={theme}>
          <AppHot />
        </MuiThemeProvider>
      </MuiPickersUtilsProvider>
    </ConnectedRouter>
  </Provider>
);

ReactDOM.render(<MiApp />, document.getElementById("root"));

export const MiStore = store;