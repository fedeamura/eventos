import "./public-path";
import { hot } from "react-hot-loader";
import * as React from "react";
// import ReactDOM from "@hot-loader/react-dom";
import ReactDOM from "react-dom";
import IndexHot from "./indexhot";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: "#149257"
    },
    secondary: {
      main: "#149257"
    },
    background: {
      default: "#eee"
    }
  }
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <IndexHot />
  </MuiThemeProvider>,
  document.getElementById("root")
);
