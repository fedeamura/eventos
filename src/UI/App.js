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
import { login, cerrarSesion } from "@Redux/Actions/usuario";
import { setData, setCargando, setReady } from "@Redux/Actions/data";

//Componentes
import _ from "lodash";

//Mis componentes
import PanelLogin from "@UI/_PanelLogin";
import asyncComponent from "./AsyncComponent";
import CircularProgress from "@material-ui/core/CircularProgress";

const Inicio = asyncComponent(() => import("@UI/Inicio"));
const Inscripcion = asyncComponent(() => import("@UI/Inscripcion"));
const Evento = asyncComponent(() => import("@UI/Evento"));
const Actividad = asyncComponent(() => import("@UI/Actividad"));
const Sorteo = asyncComponent(() => import("@UI/Sorteo"));
const ScanQR = asyncComponent(() => import("@UI/ScanQR"));
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
  setData: data => {
    dispatch(setData(data));
  },
  setReady: data => {
    dispatch(setReady(data));
  },
  setCargando: data => {
    dispatch(setCargando(data));
  }
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cargandoUsuario: true
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
    this.unsubscribeFirebaseAuth && this.unsubscribeFirebaseAuth();
    this.listenerDataEventos && this.listenerDataEventos();
    this.listenerDataUsuario && this.listenerDataUsuario();
  }

  onLogin = () => {
    const db = window.firebase.firestore();
    this.listenerDataEventos && this.listenerDataEventos();
    this.listenerDataUsuario && this.listenerDataUsuario();

    this.props.setCargando(true);
    this.listenerDataEventos = db
      .collection("info")
      .doc("eventos")
      .onSnapshot(doc => {
        if (!doc.exists) {
          console.log("Eventos", {});
          this.props.setReady(true);
          this.props.setCargando(false);
          this.props.setData({});
          return;
        }

        let data = doc.data();
        if (data == undefined) {
          console.log("Eventos", {});
          this.props.setReady(true);
          this.props.setCargando(false);
          this.props.setData({});
          return;
        }

        //Obtengo los eventos
        let map = data.info || {};
        let eventos = Object.keys(map).map(key => {
          let data = map[key];

          //Formateo las actividades
          let actividades = [];
          Object.keys(data.actividades || {}).map(key => {
            let actividad = (data.actividades || {})[key];
            actividades.push(actividad);
          });

          data.actividades = actividades;
          return data;
        });

        const { usuario } = this.props;
        //Obtengo la info del usuario
        this.listenerDataUsuario && this.listenerDataUsuario();
        this.listenerDataUsuario = db
          .collection("info")
          .doc("inscripciones")
          .collection("porUsuario")
          .doc(usuario.uid)
          .onSnapshot(docUsuario => {
            //La info del usuario no existe
            if (!docUsuario.exists) {
              console.log("Eventos", eventos);
              this.props.setReady(true);
              this.props.setCargando(false);
              this.props.setData({
                eventos
              });
              return;
            }

            //La info del usuario no existe
            let dataUsuario = docUsuario.data();
            if (dataUsuario == undefined) {
              console.log("Eventos", eventos);
              this.props.setReady(true);
              this.props.setCargando(false);
              this.props.setData({
                eventos
              });
              return;
            }

            //Proceso la info del usuario
            Object.keys(dataUsuario).forEach(keyEvento => {
              let inscripcionEvento = dataUsuario[keyEvento];
              let evento = _.find(eventos, x => x.id == keyEvento);
              if (evento && inscripcionEvento && Object.keys(inscripcionEvento).length != 0) {
                evento.inscripto = true;

                Object.keys(inscripcionEvento).forEach(keyActividad => {
                  let actividades = evento.actividades || [];
                  let actividad = _.find(actividades, x => x.id == keyActividad);
                  if (actividad) {
                    actividad.inscripto = true;
                  }
                });
              }
            });

            this.props.setReady(true);
            this.props.setCargando(false);
            this.props.setData({
              eventos
            });
          });
      });
  };

  onLogout = () => {
    this.listenerDataEventos && this.listenerDataEventos();
    this.listenerDataUsuario && this.listenerDataUsuario();
  };

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
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline />

        {this.state.cargandoUsuario == true && <React.Fragment>{this.renderCargando()}</React.Fragment>}

        {this.state.cargandoUsuario == false && (
          <React.Fragment>
            {this.props.usuario == undefined && <PanelLogin />}

            {this.props.usuario != undefined && <React.Fragment>{this.renderContent()}</React.Fragment>}
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
          {/* <Redirect exact from="/" to="Evento/oniet" /> */}

          <Route exact path={`${base}/`} component={Inicio} />

          <Route exact path={`${base}/Inscripcion/:codigo`} component={Inscripcion} />

          <Route exact path={`${base}/ScanQR`} component={ScanQR} />

          <Route exact path={`${base}/Evento/:id`} component={Evento} />

          <Route exact path={`${base}/Actividad/:idEvento/:idActividad`} component={Actividad} />

          <Route exact path={`${base}/Sorteo/:idEvento`} component={Sorteo} />

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
