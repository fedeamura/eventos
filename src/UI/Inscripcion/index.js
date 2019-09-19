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
import { CircularProgress, Button } from "@material-ui/core";

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

class Inscripcion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cargando: true,
      codigo: props.match.params.codigo
    };
  }

  componentDidMount() {
    this.buscarDatos();
  }

  buscarDatos = async () => {
    try {
      var db = window.firebase.firestore();

      this.setState({ cargando: true, error: undefined });

      let idEvento = this.state.codigo.split("_")[0];
      let idActividad = this.state.codigo.split("_")[1];

      await db
        .collection("evento")
        .doc(idEvento)
        .collection("actividad")
        .doc(idActividad)
        .collection("inscripto")
        .doc(this.props.usuario.uid)
        .set({
          uid: this.props.usuario.uid,
          nombre: this.props.usuario.nombre,
          photoURL: this.props.usuario.photoURL
        });

      await db
        .collection("evento")
        .doc(idEvento)
        .update({ ["inscriptos." + this.props.usuario.uid]: true });

      this.setState({ cargando: false });
    } catch (ex) {
      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.setState({ error: mensaje, cargando: false });
    }
  };

  onBotonActividadClick = () => {
    let idEvento = this.state.codigo.split("_")[0];
    let idActividad = this.state.codigo.split("_")[1];
    this.props.redirect("/Actividad/" + idEvento + "/" + idActividad);
  };

  render() {
    return (
      <MiPagina toolbarTitulo="Inscripción a una actividad" toolbarLeftIconVisible={false}>
        {this.state.cargando == true && <React.Fragment>{this.renderCargando()}</React.Fragment>}

        {this.state.cargando == false && (
          <React.Fragment>
            {this.state.error && <React.Fragment>{this.renderError()}</React.Fragment>}

            {this.state.error == undefined && <React.Fragment>{this.renderData()}</React.Fragment>}
          </React.Fragment>
        )}
      </MiPagina>
    );
  }

  renderCargando() {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  renderError() {
    return <Typography>{this.state.error}</Typography>;
  }

  renderData() {
    return (
      <div style={{ padding: 16, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <Typography style={{ textAlign: "center", marginBottom: 16 }} variant="h5">
          Te inscribiste con éxito en la actividad
        </Typography>
        <Typography style={{ textAlign: "center", marginBottom: 32 }}>Además, ya estas participando en un sorteo</Typography>

        <Button onClick={this.onBotonActividadClick} size="small" variant="contained" color="primary">
          Ver actividad
        </Button>
      </div>
    );
  }
}

let componente = Inscripcion;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
