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
import { Card, CircularProgress, ListItem, ListItemText, List, Avatar, ListItemAvatar, Button } from "@material-ui/core";
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

class ActividadSorteo extends React.Component {
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

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
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

  onSorteoClick = async () => {
    try {
      this.setState({ cargando: true });

      var db = window.firebase.firestore();

      let doc = await db
        .collection("evento")
        .doc(this.state.idEvento)
        .collection("actividad")
        .doc(this.state.idActividad)
        .collection("inscripto")
        .get();

      let data = doc.docs.map(x => {
        return x.data();
      });
      if (data.length == 0) {
        this.setState({ cargando: false });
        return;
      }

      var min = 0;
      var max = data.length - 1;
      var random = Math.floor(Math.random() * (+max - +min)) + +min;

      let ganador = data[random];

      await db
        .collection("evento")
        .doc(this.state.idEvento)
        .collection("actividad")
        .doc(this.state.idActividad)
        .update({ ganadorSorteo: { uid: ganador.uid, nombre: ganador.nombre, photoURL: ganador.photoURL } });
      this.setState({ cargando: false });
    } catch (ex) {
      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.setState({ error: mensaje, cargando: false });
    }
  };

  render() {
    return (
      <MiPagina toolbarTitulo="Sorteo" toolbarLeftIconVisible={true}>
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
        <Typography variant="h5">{data.nombre}</Typography>
        <Typography variant="body2">{data.descripcion}</Typography>

        <Card style={{ padding: 8, marginTop: 16 }}>
          <Typography variant="subtitle2">Ganador del sorteo</Typography>
          {data.ganadorSorteo == undefined && <Typography>Aun nadie</Typography>}
          {data.ganadorSorteo && <Typography>{data.ganadorSorteo.nombre}</Typography>}
        </Card>
        <Button onClick={this.onSorteoClick} style={{ marginTop: 16 }} variant="contained" color="primary">
          Realizar sorteo
        </Button>

        {/* <Card style={{ marginTop: 16 }}>
          <Typography style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }} variant="subtitle2">
            Inscriptos
          </Typography>
          <List>
            {Object.keys(data.inscriptos || {}).map((key, index) => {
              let inscripto = data.inscriptos[key];

              return (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar src={inscripto.photoURL}></Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={inscripto.nombre}></ListItemText>
                </ListItem>
              );
            })}
          </List>
        </Card> */}
      </React.Fragment>
    );
  }
}

let componente = ActividadSorteo;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
