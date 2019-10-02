import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import Typography from "@material-ui/core/Typography";
import memoize from "memoize-one";
import Fab from "@material-ui/core/Fab";
import _ from "lodash";

//componentes
import Card from "@material-ui/core/Card";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";

//Mis componentes
import MiPagina from "@UI/_MiPagina";

//Icons
import MdiIcon from "@mdi/react";
import { mdiQrcodeScan } from "@mdi/js";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    data: state.Data.data,
    dataCargando: state.Data.cargando,
    dataReady: state.Data.ready
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
      id: props.match.params.id
    };
  }

  componentWillReceiveProps(nextProps) {
    let id = nextProps.match.params.id;
    if (id != this.state.id) {
      this.setState({ id });
    }
  }

  onActividadClick = a => {
    this.props.redirect("/Actividad/" + this.state.id + "/" + a.id);
  };

  onBotonScanClick = () => {
    this.props.redirect("/ScanQR");
  };

  getEvento = memoize((data, id) => {
    data = data || {};
    let eventos = data.eventos || [];
    return _.find(eventos, x => x.id == id);
  });

  onBotonBackClick = () => {
    this.props.redirect("/");
  };

  render() {
    const { data, dataCargando, dataReady, usuario } = this.props;
    const { id } = this.state;

    let evento = this.getEvento(data, id);

    let grupos = [];
    let actividadesPorGrupo = {};
    if (evento) {
      actividadesPorGrupo = _.groupBy(evento.actividades, "grupo");
      grupos = _.orderBy(Object.keys(actividadesPorGrupo));
    }

    let ganador = false;
    if (evento && usuario) {
      if ((evento.ganadores || {})[usuario.uid] != undefined) {
        ganador = true;
      }
    }

    return (
      <MiPagina
        cargando={dataCargando || false}
        toolbarTitulo={evento ? evento.nombre : "..."}
        toolbarLeftIconVisible={false}
        toolbarLeftIconClick={this.onBotonBackClick}
      >
        {/* Cargue los eventos  */}
        {dataReady && (
          <React.Fragment>
            {/* Evento no existente  */}
            {evento == undefined && <Typography>No existe</Typography>}

            {/* Evento existente */}
            {evento && (
              <React.Fragment>
                <div style={{ width: "100%" }}>
                  <img src={evento.logo} style={{ maxWidth: "100%", objectFit: "contain", maxHeight: 100, marginBottom: 16 }} />
                </div>

                {/* <Typography variant="h5">{evento.nombre}</Typography> */}
                <Typography variant="body2">{evento.descripcion}</Typography>

                {ganador == true && (
                  <Card style={{ padding: 16, borderRadius: 16, backgroundColor: "green", color: "white", marginTop: 32 }}>
                    <Typography>¡Ganaste un sorteo!</Typography>
                  </Card>
                )}

                {/* Actividades  */}

                {grupos && (
                  <Typography variant="subtitle2" style={{ marginTop: 32, marginBottom: 16 }}>
                    Actividades
                  </Typography>
                )}
                {grupos &&
                  grupos.map((grupo, index) => {
                    let actividades = _.orderBy(actividadesPorGrupo[grupo], "nombre");
                    let color = actividades[0].color;

                    let listaActividades = actividades.map((actividad, key) => {
                      return (
                        <ListItem
                          button
                          key={key}
                          onClick={() => {
                            this.onActividadClick(actividad);
                          }}
                        >
                          <ListItemText primary={actividad.nombre}></ListItemText>
                          <ListItemSecondaryAction>
                            <Checkbox checked={actividad.inscripto == true} />
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    });

                    return (
                      <Card key={index} style={{ marginTop: 16, borderRadius: 16, borderLeft: "8px solid " + color }}>
                        <Typography style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }} variant="subtitle2">
                          {grupo}
                        </Typography>
                        <List>{listaActividades}</List>
                      </Card>
                    );
                  })}

                <div style={{ height: 72 }} />
              </React.Fragment>
            )}
          </React.Fragment>
        )}

        {/* Boton escanear */}
        <Fab color="primary" onClick={this.onBotonScanClick} style={{ position: "absolute", right: 16, bottom: 16 }}>
          <MdiIcon path={mdiQrcodeScan} title="Escanear código QR" size={1} color="white" />
        </Fab>
      </MiPagina>
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
