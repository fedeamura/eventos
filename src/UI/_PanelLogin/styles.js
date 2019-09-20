const styles = theme => {
  return {
    root: {
      zIndex: 1000,
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "white",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      padding: theme.spacing(4),
      "& .botones": {
        padding: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        "& .boton": {
          width: 200,
          margin: theme.spacing(1)
        }
      }
    }
  };
};
export default styles;
