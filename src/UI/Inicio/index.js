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
import { Card, ButtonBase, CircularProgress, Button } from "@material-ui/core";

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

class Inicio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cargando: true
    };
  }

  componentDidMount() {
    this.buscarDatos();
  }

  buscarDatos = async () => {
    try {
      this.setState({ cargando: true, error: undefined });

      var db = window.firebase.firestore();

      let data = await db
        .collection("evento")
        .where("inscriptos." + this.props.usuario.uid, "==", true)
        .get();

      let docs = data.docs.map(x => {
        return x.data();
      });

      this.setState({ eventos: docs, cargando: false });
    } catch (ex) {
      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.setState({ error: mensaje, cargando: false });
    }
  };

  onEventoClick = data => {
    this.props.redirect("/Evento/" + data.id);
  };

  render() {
    return (
      <MiPagina toolbarLeftIconVisible={false}>
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
    let eventos = this.state.eventos || [];

    if (eventos.length == 0) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
            flexDirection: "column"
          }}
        >
          <Typography variant="h5" style={{ textAlign: "center", margin: 16, marginBottom: 32, marginTop: 32 }}>
            Escanéa alguno de los codigos QR para empezar
          </Typography>

          {/* <Button variant="contained" color="primary">
            Escanear
          </Button> */}
        </div>
      );
    }

    return eventos.map((evento, index) => {
      return (
        <Card
          key={index}
          style={{ marginBottom: 16, padding: 8 }}
          onClick={() => {
            this.onEventoClick(evento);
          }}
        >
          <Typography>{evento.nombre}</Typography>
        </Card>
      );
    });
  }
}

let componente = Inicio;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
