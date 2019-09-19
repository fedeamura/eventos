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
import { Card, CircularProgress, ListItem, ListItemText, List, ListItemSecondaryAction, Checkbox } from "@material-ui/core";

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

class Evento extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.id,
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
      let refEvento = db.collection("evento").doc(this.state.id);

      let doc = await refEvento.get();
      let data = doc.data();
      if (data == undefined) {
        this.setState({ data: undefined, cargando: false });
        return;
      }

      this.setState({ data, cargando: false });
    } catch (ex) {
      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.setState({ error: mensaje, cargando: false });
    }
  };

  onActividadClick = a => {
    this.props.redirect("/Actividad/" + this.state.id + "/" + a.id);
  };

  render() {
    return (
      <MiPagina toolbarTitulo="Evento" toolbarLeftIconVisible={true}>
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

    if (data == undefined) {
      return (
        <React.Fragment>
          <Typography>El evento indicado no existe</Typography>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Typography variant="h5">{data.nombre}</Typography>
        <Typography variant="body2">{data.descripcion}</Typography>

        <Card style={{ marginTop: 16 }}>
          <Typography style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }} variant="subtitle2">
            Actividades
          </Typography>
          <List>
            {(data.actividades || []).map((a, index) => {
              return (
                <ListItem
                  key={index}
                  button
                  onClick={() => {
                    this.onActividadClick(a);
                  }}
                >
                  <ListItemText primary={a.nombre}></ListItemText>
                </ListItem>
              );
            })}
          </List>
        </Card>
      </React.Fragment>
    );
  }
}

let componente = Evento;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
