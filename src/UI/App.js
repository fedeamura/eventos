import React from "react";

//Styles
import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";
import "./style.css";
import "react-virtualized/styles.css";

//Router
import { withRouter } from "react-router-dom";
import { Route, Redirect } from "react-router-dom";
import { AnimatedSwitch } from "react-router-transition";

//REDUX
import { connect } from "react-redux";
import { login, cerrarSesion } from "@Redux/Actions/usuario";

//Mis componentes
import PanelLogin from "@UI/_PanelLogin";
import asyncComponent from "./AsyncComponent";
import CircularProgress from "@material-ui/core/CircularProgress";

//Rules
import Rules_Evento from "../Rules/Rules_Evento";
import Rules_Data from '../Rules/Rules_Data';
import { Typography } from "../../node_modules/@material-ui/core";

const Inscripcion = asyncComponent(() => import("@UI/Inscripcion"));
const Evento = asyncComponent(() => import("@UI/Evento"));
const Actividad = asyncComponent(() => import("@UI/Actividad"));
const ScanQR = asyncComponent(() => import("@UI/ScanQR"));
const Gestion = asyncComponent(() => import("@UI/Gestion"));
const GestionPanel = asyncComponent(() => import("@UI/GestionPanel"));
const GestionSorteo = asyncComponent(() => import("@UI/GestionSorteo"));
const GestionInscriptos = asyncComponent(() => import("@UI/GestionInscriptos"));
const GestionMensajes = asyncComponent(() => import("@UI/GestionMensajes"));
const Pagina404 = asyncComponent(() => import("@UI/_Pagina404"));

const ERROR_CRITICO_URL = 'ERROR_CRITICO_URL';
const ERROR_CRITICO_EVENTO_NO_EXISTE = 'ERROR_CRITICO_EVENTO_NO_EXISTE';
const ERROR_CRITICO_ERROR_LEYENDO = 'ERROR_CRITICO_ERROR_LEYENDO';

//Redux
const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario
  };
};

const mapDispatchToProps = dispatch => ({
  login: comando => {
    dispatch(login(comando));
  },
  cerrarSesion: () => {
    dispatch(cerrarSesion());
  }
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorCritico: undefined,
      cargandoUsuario: true,
      cargandoData: false,
    };
  }

  componentDidMount() {
    let url = window.location.href;
    if (url.indexOf("localhost") == -1) {
      if (url.indexOf("http://") != -1) {
        let partesUrl = url.split("http://");
        let urlNueva = "https://" + partesUrl[1];
        window.location.href = urlNueva;
        return;
      }
    }

    this.unsubscribeFirebaseAuth = window.firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.login(this.convertirFirebaseUser(user));
        this.onLogin();
      } else {
        this.props.cerrarSesion();
        this.onLogout();
      }

      this.setState({ cargandoUsuario: false });
    });
  }


  componentWillUnmount() {
    Rules_Data.dejarDeEscuchar();
  }

  componentDidUpdate() {
  }

  onLogin = async () => {
    this.escucharDatos();
  };

  onLogout = () => {
    Rules_Data.dejarDeEscuchar();
  };


  escucharDatos = () => {
    const { usuario } = this.props;

    this.setState({ cargandoData: true, errorCritico: undefined });

    const url = window.location.href;
    if (url.toLowerCase().indexOf('/gestion') != -1) {
      this.setState({ modoGestion: true, modoScan: false, cargandoData: false });
      return;
    }

    if (url.toLowerCase().indexOf('/scanqr') != -1) {
      this.setState({ modoGestion: false, modoScan: true, cargandoData: false });
      return;
    }

    const partesUrl = url.split('/');
    // console.log('Partes url', url);
    if (partesUrl < 4) {
      Rules_Data.dejarDeEscuchar();
      this.setState({ errorCritico: ERROR_CRITICO_URL, cargandoData: false });
      return;
    }

    const idEvento = partesUrl[3];
    // console.log('Id evento', idEvento);
    this.setState({ idEvento: idEvento });
    Rules_Data.escuchar(idEvento, usuario.uid, () => {
      // console.log('Data ready');
      this.setState({ cargandoData: false });
    }, (error) => {
      Rules_Data.dejarDeEscuchar();
      this.setState({ errorCritico: error, cargandoData: false })
    })
  }

  convertirFirebaseUser = user => {
    return {
      nombre: user.displayName,
      photoURL: user.photoURL,
      email: user.email,
      emailVerificado: user.emailVerified,
      uid: user.uid
    };
  };

  render() {
    const { cargandoUsuario, cargandoData, errorCritico } = this.state;
    const { classes, usuario } = this.props;

    const cargando = cargandoUsuario == true || cargandoData == true;

    if (errorCritico != undefined) {
      return <div />;
    }

    return (
      <div className={classes.root}>
        <CssBaseline />

        {cargando == true && <React.Fragment>{this.renderCargando()}</React.Fragment>}

        {cargando == false && (
          <React.Fragment>
            {usuario == undefined && <PanelLogin />}

            {usuario != undefined && <React.Fragment>{this.renderContent()}</React.Fragment>}
          </React.Fragment>
        )}
      </div>
    );
  }

  renderCargando() {
    const { classes } = this.props;

    return (
      <div className={classes.contenedorCargandoUsuario}>
        <CircularProgress />
      </div>
    );
  }

  renderContent() {
    const { classes } = this.props;
    const { idEvento, modoGestion, modoScan } = this.state;

    return (
      <main className={classes.content}>
        <AnimatedSwitch atEnter={{ opacity: 0 }} atLeave={{ opacity: 0 }} atActive={{ opacity: 1 }} className={"switch-wrapper"}>


          {/* Gestion */}
          {modoGestion == true && (
            <React.Fragment>

              <Route exact path={`/Gestion`} component={modoGestion == true ? Gestion : null} />

              <Route exact path={`/Gestion/Panel/:idEvento`} component={modoGestion == true ? GestionPanel : null} />

              <Route exact path={`/Gestion/Sorteo/:idEvento`} component={modoGestion == true ? GestionSorteo : null} />

              <Route exact path={`/Gestion/Inscriptos/:idEvento`} component={modoGestion == true ? GestionInscriptos : null} />

              <Route exact path={`/Gestion/Mensajes/:idEvento`} component={modoGestion == true ? GestionMensajes : null} />
            </React.Fragment>
          )}


          {idEvento && (
            <React.Fragment>

              <Route exact path={`/${idEvento}/ScanQR`} component={ScanQR} />

              {/* Evento */}
              <Route exact path={`/${idEvento}`} component={Evento} />

              {/* Actividad */}
              <Route exact path={`/${idEvento}/Data/:idActividad`} component={Actividad} />

              {/* Inscripcion */}
              <Route exact path={`/${idEvento}/Inscripcion/:idActividad`} component={Inscripcion} />

            </React.Fragment>
          )}

          <Route component={Pagina404} />
        </AnimatedSwitch>
      </main>
    );
  }
}

const styles = theme => {
  return {
    root: {
      display: "flex",
      width: "100%",
      height: "100%",
      overflow: "hidden"
    },
    content: {
      display: "flex",
      flexGrow: 1,
      overflow: "auto",
      overflow: "hidden"
    },
    contenedorCargandoUsuario: {
      backgroundColor: "white",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  };
};

let componente = App;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
componente = withRouter(componente);
export default componente;
