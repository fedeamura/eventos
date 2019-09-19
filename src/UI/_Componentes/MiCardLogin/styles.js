let escudoMuniTextoVerde = require("../../../_Resources/imagenes/escudo_muni_texto_verde.png");
let escudoMuniOnlineAnchoVerde = require("../../../_Resources/imagenes/escudo_muni_online_verde_ancho.png");

const styles = theme => {
  return {
    progress: {
      position: "absolute",
      opacity: 1,
      zIndex: "1",
      height: "8px",
      minHeight: "8px",
      left: 0,
      right: 0,
      top: "0px",
      opacity: 0,
      transition: "opacity 0.3s",
      "&.visible": {
        opacity: 1
      }
    },
    overlayCargando: {
      backgroundColor: "rgba(255,255,255,0.6)",
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      opacity: 0,
      borderRadius: "16px",
      pointerEvents: "none",
      transition: "opacity 0.3s",
      "&.visible": {
        opacity: 1,
        pointerEvents: "auto"
      }
    },
    root: {
      display: "flex",
      width: "100%",
      flexDirection: "row",
      flex: 1,
      overflow: "hidden"
      // height: "100%"
      // justifyContent: "center"
    },
    cardRoot: {
      marginLeft: 0,
      marginRight: 0,
      alignSelf: "center",
      width: "calc(100% - 4rem)",
      maxWidth: 600,
      height: "calc(100% - 4rem)",
      maxHeight: 550,
      opacity: 0,
      transform: "translateY(100px)",
      transition: "all 0.3s",
      "&.modoApp": {
        transform: "translateY(0px) !important",
        maxWidth: "initial !important",
        alignSelf: "center",
        width: "calc(100%)",
        height: "calc(100%)",
        maxHeight: "100%",
        "& > div": {
          borderRadius: 0
        }
      },
      "& > div": {
        borderRadius: theme.spacing(2)
      },
      ["@media (max-height:550px), (max-width:600px)"]: {
        transform: "translateY(-1rem)",
        maxWidth: "initial !important",
        alignSelf: "center",
        width: "calc(100%)",
        height: "calc(100% - 2rem)",
        maxHeight: "100%",
        "& > div": {
          borderRadius: 0
        }
      },
      "&.visible": {
        opacity: 1,
        transform: "translateY(-1rem)",
        ["@media (max-height:550px), (max-width:600px)"]: {
          transform: "translateY(-1rem)"
        }
      }
    },
    cardContent: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      maxHeight: "100%",
      "& > div": {
        display: "flex",
        flexDirection: "column",
        flex: 1
      }
    },
    header: {
      paddingBottom: "0",
      paddingBottom: theme.spacing(2),
      paddingTop: theme.spacing(4),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      ["@media (max-height:550px), (max-width:600px)"]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
      },
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      minHeight: "fit-content"
    },
    contenedorTextosSistema: {
      marginLeft: "16px"
    },
    imagenLogoMuni: {
      flex: 1,
      marginLeft: "9px",
      height: "48px",
      backgroundSize: "contain",
      backgroundImage: `url(${escudoMuniTextoVerde})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center"
    },
    imagenLogoMuniOnline: {
      width: 150,
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(1),
      height: "28px",
      backgroundSize: "contain",
      backgroundImage: `url(${escudoMuniOnlineAnchoVerde})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center"
    },
    content: {
      flex: 1,
      display: "flex",
      flexDirection: "column"
    },
    mainContent: {
      flex: 1,
      overflow: "auto"
    },
    footer: {
      borderTop: "1px solid rgba(0,0,0,0.1)",
      padding: "16px",
      display: "flex"
    },
    footerInfo: {
      marginLeft: theme.spacing(4),
      marginTop: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(1),
      "& .logo": {
        width: 120,
        height: 36,
        filter: "grayscale(100%)",
        marginRight: 8,
        backgroundImage: `url(${escudoMuniTextoVerde})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      },
      "& .link": {
        textDecoration: "underline",
        cursor: "pointer",
        color: "rgba(0,0,0,0.6)"
      },
      "& .separador": {
        width: 8,
        marginLeft: 8,
        marginRight: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: "rgba(0,0,0,0.2)"
      },
      "&.modoApp": {
        display: "none"
      },
      ["@media (max-height:550px), (max-width:600px)"]: {
        marginLeft: theme.spacing(2),
        marginTop: 0
      }
    }
  };
};
export default styles;
