const styles = theme => {
  return {
    root: {
      display: "flex",
      // alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.05)",
      height: "fit-content",
      maxHeight: 0,
      minHeight: 0,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingTop: 0,
      paddingBottom: 0,
      overflow: "hidden",
      marginBottom: 0,
      "& > div": {
        width: "100%",
        // minHeight: "3rem",
        display: "flex"
      },
      "& > div > .texto": {
        flex: 1
      },
      opacity: 0,
      transition: "max-height 0.3s 0.3s,min-height 0.3s 0.3s, margin 0.3s 0.3s, opacity 0.3s, padding 0.3s 0.3s",
      "&.visible": {
        // padding: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        transition: "max-height 0.3s, min-height 0.3s, margin 0.3s, opacity 0.3s 0.3s, padding 0.3s",
        maxHeight: "50rem",
        opacity: 1
      }
    },
    contenedorInfoUsername: {
      display: "flex",
      "& > .material-icons": {
        marginRight: "0.5rem"
      }
    },
    icono: {
      marginRight: theme.spacing()
    }
  };
};

export default styles;
