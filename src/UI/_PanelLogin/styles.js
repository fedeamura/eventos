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
    },
    contenedorCargando: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "white",
      pointerEvents: "none",
      opacity: 0,
      transition: "all 0.3s",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "&.visible": {
        opacity: 1,
        pointerEvents: "auto"
      }
    }
  };
};
export default styles;
