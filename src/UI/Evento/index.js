import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import themeData from "../../theme";

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

//Rules
import Rules_Evento from "../../Rules/Rules_Evento";

//Icons
import MdiIcon from "@mdi/react";
import { mdiQrcodeScan } from "@mdi/js";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    eventos: state.Eventos.data,
    eventosCargando: state.Eventos.cargando,
    eventosReady: state.Eventos.ready,
    ganadores: state.Eventos.ganadores,
    mensajes: state.Eventos.mensajes,
    inscripciones: state.Usuario.inscripciones
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

  componentDidMount() {
    Rules_Evento.escucharGanadores(this.state.id);
    Rules_Evento.escucharMensajes(this.state.id);
  }

  componentWillReceiveProps(nextProps) {
    let id = nextProps.match.params.id;
    if (id != this.state.id) {
      this.setState({ id });
      Rules_Evento.escucharGanadores(id);
      Rules_Evento.escucharMensajes(id);
    }
  }

  onActividadClick = a => {
    this.props.redirect("/Actividad/" + this.state.id + "/" + a.id);
  };

  onBotonScanClick = () => {
    this.props.redirect("/ScanQR");
  };

  onBotonBackClick = () => {
    this.props.redirect("/");
  };

  getTheme = memoize(color => {
    if (color == undefined) return createMuiTheme(themeData);
    return createMuiTheme({
      ...themeData,
      palette: {
        ...themeData.palette,
        primary: {
          ...themeData.palette.main,
          main: color
        },
        secondary: {
          ...themeData.palette.secondary,
          main: color
        }
      }
    });
  });

  getEvento = memoize((data, id) => {
    if (data == undefined || id == undefined) return undefined;
    return _.find(data, x => x.id == id);
  });

  getGrupos = memoize(data => {
    if (data == undefined) return [];

    let actividades = Object.keys(data.actividades || {}).map(key => {
      return data.actividades[key];
    });
    let actividadesPorGrupo = _.groupBy(actividades, "grupo");
    return _.orderBy(Object.keys(actividadesPorGrupo));
  });

  getActividades = memoize((data, grupo) => {
    if (data == undefined || grupo == undefined) return [];

    let actividades = Object.keys(data.actividades || {}).map(key => {
      return data.actividades[key];
    });
    actividades = actividades.filter(x => x.grupo == grupo);
    return _.orderBy(actividades, x => (x.nombre || "").toLowerCase());
  });

  getMensajes = memoize((mensajes, evento) => {
    if (mensajes == undefined || evento == undefined) return [];
    return _.orderBy(_.filter(mensajes[evento] || [], x => x.visible == true), "fechaCreacion");
  });

  esGanador = memoize((ganadores, idEvento, uid) => {
    if (ganadores == undefined || idEvento == undefined || uid == undefined) return false;
    if (ganadores[idEvento] == undefined) return false;
    const ganadoresDeEvento = ganadores[idEvento];
    return _.find(ganadoresDeEvento, x => x.uid == uid) != undefined;
  });

  estaInscriptoEnActividad = memoize((inscripciones, idEvento, idActividad) => {
    if (inscripciones == undefined || idEvento == undefined || idActividad == undefined) return false;

    let inscripcionesDeEvento = inscripciones[idEvento];
    if (inscripcionesDeEvento == undefined) return false;
    return inscripcionesDeEvento.indexOf(idActividad) != -1;
  });

  render() {
    const { id } = this.state;
    const { usuario, eventos, eventosCargando, ganadores, inscripciones, mensajes } = this.props;

    const evento = this.getEvento(eventos, id);
    const grupos = this.getGrupos(evento);
    const listaMensajes = this.getMensajes(mensajes, id);
    const esGanador = this.esGanador(ganadores, id, usuario.uid);

    const color = evento && evento.color;
    const theme = this.getTheme(color);

    return (
      <MuiThemeProvider theme={theme}>
        <MiPagina
          cargando={eventosCargando || false}
          toolbarSubtitulo={evento ? evento.nombre : "..."}
          toolbarLeftIconVisible={true}
          toolbarLeftIconClick={this.onBotonBackClick}
        >
          <React.Fragment>
            {evento == undefined && <Typography>No existe</Typography>}

            {/* Cargue los eventos  */}
            {evento && (
              <React.Fragment>
                <React.Fragment>
                  <div style={{ width: "100%" }}>
                    <img src={evento.logo} style={{ maxWidth: "100%", objectFit: "contain", maxHeight: 100, marginBottom: 16 }} />
                  </div>

                  <Typography variant="h5">{evento.nombre}</Typography>
                  <Typography variant="body2">{evento.descripcion}</Typography>

                  {/* Ganadores */}
                  {esGanador == true && (
                    <Card style={{ padding: 16, borderRadius: 16, backgroundColor: "green", color: "white", marginTop: 32 }}>
                      <Typography>¡Ganaste un sorteo!</Typography>
                    </Card>
                  )}

                  {/* Mensajes */}
                  {listaMensajes && listaMensajes.length != 0 && (
                    <React.Fragment>
                      <Typography
                        variant="subtitle2"
                        style={{
                          marginTop: 32,
                          marginLeft: 8,
                          marginBottom: 16
                        }}
                      >
                        Mensajes
                      </Typography>
                      <Card style={{ padding: 16, borderRadius: 16, backgroundColor: "white", color: "black" }}>
                        {listaMensajes.map((x, indexMensaje) => {
                          return (
                            <Typography
                              key={indexMensaje}
                              style={{
                                paddingBottom: 8,
                                paddingTop: 8,
                                borderBottom: indexMensaje != listaMensajes.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none"
                              }}
                            >
                              {x.mensaje}
                            </Typography>
                          );
                        })}
                      </Card>
                    </React.Fragment>
                  )}

                  {/* Actividades  */}
                  {grupos && (
                    <Typography
                      variant="subtitle2"
                      style={{
                        marginTop: 56,
                        marginLeft: 8,
                        marginBottom: 16
                      }}
                    >
                      Actividades
                    </Typography>
                  )}

                  {grupos &&
                    grupos.map((grupo, indexGrupo) => {
                      const actividades = this.getActividades(evento, grupo);

                      let colorGrupo = undefined;
                      if (actividades.length != 0) {
                        colorGrupo = actividades[0].color;
                      }

                      const listaActividades = actividades.map((actividad, key) => {
                        const inscripto = this.estaInscriptoEnActividad(inscripciones, evento.id, actividad.id);

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
                              <Checkbox checked={inscripto == true} />
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      });

                      return (
                        <Card
                          key={indexGrupo}
                          style={{
                            marginTop: 16,
                            borderRadius: 16,
                            borderLeft: "8px solid " + colorGrupo
                          }}
                        >
                          {(grupo || "").trim() != "" && (
                            <Typography
                              style={{
                                paddingLeft: 16,
                                paddingRight: 16,
                                paddingTop: 16
                              }}
                              variant="subtitle2"
                            >
                              {grupo}
                            </Typography>
                          )}

                          <List>{listaActividades}</List>
                        </Card>
                      );
                    })}
                  {/* {grupos && (
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
                    }); */}

                  {/* return (
                      <Card key={index} style={{ marginTop: 16, borderRadius: 16, borderLeft: "8px solid " + color }}>
                        <Typography style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }} variant="subtitle2">
                          {grupo}
                        </Typography>
                        <List>{listaActividades}</List>
                      </Card>
                    );
                  })} */}

                  <div style={{ height: 72 }} />
                </React.Fragment>
              </React.Fragment>
            )}
          </React.Fragment>

          {/* Boton escanear */}
          <Fab
            color="primary"
            onClick={this.onBotonScanClick}
            style={{
              position: "absolute",
              right: 16,
              bottom: 16,
              backgroundColor: color
            }}
          >
            <MdiIcon path={mdiQrcodeScan} title="Escanear código QR" size={1} color="white" />
          </Fab>
        </MiPagina>
      </MuiThemeProvider>
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
