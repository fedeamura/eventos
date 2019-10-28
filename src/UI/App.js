import React from "react";

//Styles
import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";
import "./style.css";
import "react-virtualized/styles.css";

//Router
import { withRouter } from "react-router-dom";
import { Route } from "react-router-dom";
import { AnimatedSwitch } from "react-router-transition";

//REDUX
import { connect } from "react-redux";
import { login, cerrarSesion, setInscripciones } from "@Redux/Actions/usuario";
import { setEventos as setEventos, setInit as setEventosInit } from "@Redux/Actions/eventos";

//Componentes
import _ from "lodash";

//Mis componentes
import PanelLogin from "@UI/_PanelLogin";
import asyncComponent from "./AsyncComponent";
import CircularProgress from "@material-ui/core/CircularProgress";

//Rules
import Rules_Evento from '../Rules/Rules_Evento';

const Inicio = asyncComponent(() => import("@UI/Inicio"));
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
  },
  setInscripciones: data => {
    dispatch(setInscripciones(data));
  },
  setEventos: (data) => {
    dispatch(setEventos(data));
  },
  setEventosInit: () => {
    dispatch(setEventosInit());
  }
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cargandoUsuario: true,
      cargandoInscripciones: true,
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
      this.setState({ cargandoInscripciones: false });
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
    this.unsubscribeFirebaseAuth && this.unsubscribeFirebaseAuth();
    Rules_Evento.dejarDeEscucharGanadores();
    Rules_Evento.dejarDeEscucharMensajes();
  }

  onLogin = async () => {
    const db = window.firebase.firestore();
    const { usuario } = this.props;

    this.props.setEventosInit();
    let dataEventos = await db
      .collection('eventos')
      .get();
    let eventos = dataEventos.docs.map((x) => x.data());

    this.listenerInscripciones && this.listenerInscripciones();
    this.listenerInscripciones = db
      .collection('info')
      .doc('inscripciones')
      .collection('porUsuario')
      .doc(usuario.uid)
      .onSnapshot((data) => {

        let info = data.data() || {};
        let inscripciones = {};
        Object.keys(info).forEach((a) => {
          if (a != 'usuario') {
            inscripciones[a] = [];

            Object.keys(info[a]).forEach((b) => {
              if (b != 'inscripto') {
                inscripciones[a].push(b);
              }
            });
          }
        });

        this.props.setInscripciones(inscripciones);
        const eventosInscriptos = Object.keys(inscripciones);

        let infoFinal = [];
        eventos.forEach((evento) => {
          if (eventosInscriptos.indexOf(evento.id) != -1) {
            infoFinal.push(evento);
          }
        });

        this.props.setEventos(infoFinal);
        this.setState({ cargandoInscripciones: false });
      }, () => {
        this.props.setInscripciones({});
        this.props.setEventos([]);
        this.setState({ cargandoInscripciones: false });
      });
  }

  onLogout = () => {
    this.listenerInscripciones && this.listenerInscripciones();
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
    const { cargandoUsuario, cargandoInscripciones } = this.state;
    const { classes, usuario } = this.props;

    const cargando = cargandoUsuario == true || cargandoInscripciones == true;

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
    let base = "";
    return (
      <main className={classes.content}>
        <AnimatedSwitch atEnter={{ opacity: 0 }} atLeave={{ opacity: 0 }} atActive={{ opacity: 1 }} className={"switch-wrapper"}>

          <Route exact path={`${base}/`} component={Inicio} />

          <Route exact path={`${base}/Inscripcion/:codigo`} component={Inscripcion} />

          <Route exact path={`${base}/ScanQR`} component={ScanQR} />

          <Route exact path={`${base}/Evento/:id`} component={Evento} />

          <Route exact path={`${base}/Actividad/:idEvento/:idActividad`} component={Actividad} />

          {/* Gestion */}
          <Route exact path={`${base}/Gestion`} component={Gestion} />

          <Route exact path={`${base}/Gestion/Panel/:idEvento`} component={GestionPanel} />

          <Route exact path={`${base}/Gestion/Sorteo/:idEvento`} component={GestionSorteo} />

          <Route exact path={`${base}/Gestion/Inscriptos/:idEvento`} component={GestionInscriptos} />

          <Route exact path={`${base}/Gestion/Mensajes/:idEvento`} component={GestionMensajes} />

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
