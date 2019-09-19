import React from "react";

//Styles
import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";
import "./style.css";
import "react-virtualized/styles.css";

//Router
import { withRouter } from "react-router-dom";
import { Route, Switch } from "react-router-dom";
import { AnimatedSwitch } from "react-router-transition";

//REDUX
import { connect } from "react-redux";
import { login, cerrarSesion } from "@Redux/Actions/usuario";

//Mis componentes
import PanelLogin from "@UI/_PanelLogin";
import asyncComponent from "./AsyncComponent";
import { CircularProgress, Typography } from "@material-ui/core";
const Inicio = asyncComponent(() => import("@UI/Inicio"));
const Inscripcion = asyncComponent(() => import("@UI/Inscripcion"));
const Evento = asyncComponent(() => import("@UI/Evento"));
const Actividad = asyncComponent(() => import("@UI/Actividad"));
const ActividadSorteo = asyncComponent(() => import("@UI/ActividadSorteo"));
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
    let user = window.firebase.auth().currentUser;
    if (user) {
      this.props.login(this.convertirFirebaseUser(user));
    } else {
      this.props.cerrarSesion();
    }

    this.unsubscribeFirebaseAuth = window.firebase.auth().onAuthStateChanged(user => {
      console.log("Usuario change", user);
      if (user) {
        this.props.login(this.convertirFirebaseUser(user));
      } else {
        this.props.cerrarSesion();
      }

      this.setState({ cargandoUsuario: false });
    });
  }

  componentWillUnmount() {
    this.unsubscribeFirebaseAuth && this.unsubscribeFirebaseAuth();
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

  revalidateUser() {
    let firebaseUser = window.firebase.auth().currentUser;
    let reduxUser = this.props.usuario;

    if ((firebaseUser == undefined) != (reduxUser == undefined)) {
      if (firebaseUser) {
        this.props.login(this.convertirFirebaseUser(firebaseUser));
      } else {
        this.props.cerrarSesion();
      }
    }
  }

  render() {
    const { classes } = this.props;
    this.revalidateUser();

    return (
      <div className={classes.root}>
        <CssBaseline />
        {this.state.cargandoUsuario == true && (
          <div className={classes.contenedorCargandoUsuario}>
            <CircularProgress />
          </div>
        )}

        {this.state.cargandoUsuario == false && (
          <React.Fragment>
            {this.props.usuario == undefined && <PanelLogin />}

            {this.props.usuario && <React.Fragment>{this.renderContent()}</React.Fragment>}
          </React.Fragment>
        )}
      </div>
    );
  }

  renderContent() {
    const { classes } = this.props;
    let base = "";
    return (
      <main className={classes.content}>
        {/* <Switch> */}
        <AnimatedSwitch atEnter={{ opacity: 0 }} atLeave={{ opacity: 0 }} atActive={{ opacity: 1 }} className={"switch-wrapper"}>
          <Route
            exact
            location={this.props.location}
            key={Math.random()}
            path={`${base}/`}
            render={({ location, match }) => <Inicio key={this.props.location.key} match={match} />}
          />

          <Route
            exact
            location={this.props.location}
            key={Math.random()}
            path={`${base}/Inscripcion/:codigo`}
            render={({ location, match }) => <Inscripcion key={this.props.location.key} match={match} />}
          />

          <Route
            exact
            location={this.props.location}
            key={Math.random()}
            path={`${base}/Evento/:id`}
            render={({ location, match }) => <Evento key={this.props.location.key} match={match} />}
          />

          <Route
            exact
            location={this.props.location}
            key={Math.random()}
            path={`${base}/Actividad/:idEvento/:idActividad`}
            render={({ location, match }) => <Actividad key={this.props.location.key} match={match} />}
          />
          <Route
            exact
            location={this.props.location}
            key={Math.random()}
            path={`${base}/ActividadSorteo/:idEvento/:idActividad`}
            render={({ location, match }) => <ActividadSorteo key={this.props.location.key} match={match} />}
          />
          {/* <Route
            // key={this.props.location.key}
            location={this.props.location}
            render={({ location, match }) => <Pagina404 key={this.props.location.key} match={match} />}
          /> */}
        </AnimatedSwitch>
        {/* </Switch> */}
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
