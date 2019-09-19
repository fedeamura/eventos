import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import Typography from "@material-ui/core/Typography";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import { Card, CircularProgress } from "@material-ui/core";
import { green } from "@material-ui/core/colors";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario
  };
};

const mapDispatchToProps = dispatch => ({
  redirect: url => {
    dispatch(push(url));
  }
});

class Actividad extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idEvento: props.match.params.idEvento,
      idActividad: props.match.params.idActividad,
      data: undefined,
      error: undefined,
      cargando: true
    };
  }

  componentDidMount() {
    this.buscarInfo();
  }

  buscarInfo = async () => {
    try {
      this.setState({ cargando: true, error: undefined });

      var db = window.firebase.firestore();

      this.unsubscribe && this.unsubscribe();
      this.unsubscribe = await db
        .collection("evento")
        .doc(this.state.idEvento)
        .collection("actividad")
        .doc(this.state.idActividad)
        .onSnapshot(doc => {
          let data = doc.data();
          if (data == undefined) {
            this.setState({ data: undefined, cargando: false });
            return;
          }

          this.setState({ data, cargando: false });
        });
    } catch (ex) {
      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.setState({ error: mensaje, cargando: false });
    }
  };

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  render() {
    return (
      <MiPagina toolbarTitulo="Actividad" toolbarLeftIconVisible={true}>
        {/* cargando */}
        {this.state.cargando == true && <React.Fragment>{this.renderCargando()}</React.Fragment>}

        {this.state.cargando == false && (
          <React.Fragment>
            {/* Error  */}
            {this.state.error && <React.Fragment>{this.renderError()}</React.Fragment>}

            {/* data  */}
            {this.state.error == undefined && <React.Fragment>{this.renderData()}</React.Fragment>}
          </React.Fragment>
        )}
      </MiPagina>
    );
  }

  renderCargando() {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  renderError() {
    return <Typography>{this.state.error}</Typography>;
  }

  renderData() {
    const { data } = this.state;
    const { usuario } = this.props;

    if (data == undefined) {
      return (
        <React.Fragment>
          <Typography>La actividad indicada no existe</Typography>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {data.ganadorSorteo && data.ganadorSorteo.uid == usuario.uid && (
          <Card style={{ padding: 8, backgroundColor: green["500"], marginBottom: 32 }}>
            <Typography variant="body1" style={{ color: "white" }}>
              ¡Ganaste el sorteo!
            </Typography>
            <Typography variant="body2" style={{ color: "white" }}>
              Mostrá esta pantalla a algun disertante del evento para recibir tu premio
            </Typography>
          </Card>
        )}

        <Typography variant="h5">{data.nombre}</Typography>
        <Typography variant="body2">{data.descripcion}</Typography>
      </React.Fragment>
    );
  }
}

let componente = Actividad;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
