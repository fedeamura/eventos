export default {
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: "#fcca56",
      contrastText: "#000"
    },
    secondary: {
      main: "#fcca56",
      contrastText: "#000"
    },
    background: {
      default: "#f8f8f8"
    },
    formControl: {
      color: "black"
    }
  },
  overrides: {
    MuiCheckbox: {
      colorSecondary: {
        color: "rgba(0,0,0,0.7)",
        "&$checked": {
          color: "rgba(0,0,0,0.7)"
        }
      }
    }
  }
};
