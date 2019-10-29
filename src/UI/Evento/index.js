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
import Card from "@material-ui/core/Card";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";
import Lottie from "react-lottie";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import Header from "@UI/_Header";
import Footer from "@UI/_Footer";

//Rules
import Rules_Evento from "../../Rules/Rules_Evento";

//Icons
import IconMessageOutlined from "@material-ui/icons/MessageOutlined";
import MdiIcon from "@mdi/react";
import { mdiQrcodeScan } from "@mdi/js";

//Lotties
import * as animSorteoGanador from "@Resources/animaciones/sorteo_ganador.json";

const lottieGanador = {
  loop: false,
  autoplay: true,
  animationData: animSorteoGanador,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

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
    return _.filter(mensajes[evento] || [], x => x.visible == true);
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
    const { usuario, eventos, eventosReady, eventosCargando, ganadores, inscripciones, mensajes } = this.props;

    const evento = this.getEvento(eventos, id);
    const grupos = this.getGrupos(evento);
    const listaMensajes = this.getMensajes(mensajes, id);
    const esGanador = this.esGanador(ganadores, id, usuario.uid);
    const color = evento && evento.color;

    return (
      <MiPagina
        cargando={eventosCargando || false}
        toolbarSubtitulo={evento ? evento.nombre : "..."}
        toolbarLeftIconVisible={true}
        toolbarLeftIconClick={this.onBotonBackClick}
      >
        {eventosReady && (
          <React.Fragment>
            {evento == undefined && <Typography>No existe</Typography>}

            {/* Cargue los eventos  */}
            {evento && (
              <React.Fragment>
                <React.Fragment>
                  <Header evento={evento} />

                  {/* Ganadores */}
                  {esGanador == true && (
                    <div style={{ padding: 16, borderRadius: 16, marginTop: 16, marginBottom: 32 }}>
                      <Lottie options={lottieGanador} height={100} width={100} style={{ minHeight: "100px", marginBottom: 16 }} />
                      <Typography style={{ textAlign: "center" }}>¡Ganaste un sorteo!</Typography>
                    </div>
                  )}

                  {/* Mensajes */}
                  {listaMensajes && listaMensajes.length != 0 && (
                    <Card
                      style={{
                        marginTop: 16,
                        flex: 1,
                        borderRadius: 16,
                        backgroundColor: "white",
                        color: "black"
                      }}
                    >
                      <div
                        style={{
                          padding: 16,
                          backgroundColor: "rgba(0,0,0,0.025)",
                          borderBottom: "1px solid rgba(0,0,0,0.1)",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <IconMessageOutlined style={{ fontSize: 16, marginRight: 8, color: "black" }} />
                        <Typography style={{ color: "black" }}>Mensajes</Typography>
                      </div>

                      <List>
                        {listaMensajes.map((x, indexMensaje) => {
                          const tieneTitulo = x.titulo && x.titulo.trim() != "";

                          const titulo = tieneTitulo ? x.titulo.trim() : x.mensaje.trim();
                          const mensaje = tieneTitulo ? x.mensaje.trim() : "";

                          return (
                            <ListItem key={indexMensaje} divider>
                              <ListItemText primary={titulo} secondary={mensaje} />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Card>
                  )}

                  {/* Actividades  */}
                  {evento.conActividades != true && (
                    <div
                      style={{
                        marginTop: 32,
                        padding: 16,
                        borderRadius: 16,
                        border: "1px solid rgba(0,0,0, 0.1)"
                      }}
                    >
                      <Typography style={{ textAlign: "center" }}>Ya estás inscripto en el evento</Typography>
                    </div>
                  )}

                  {evento.conActividades == true && grupos && (
                    <Typography
                      variant="subtitle2"
                      style={{
                        marginTop: 32,
                        marginLeft: 8,
                        marginBottom: 16
                      }}
                    >
                      Actividades
                    </Typography>
                  )}

                  {evento.conActividades == true &&
                    grupos &&
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

                  {/* Sponsors */}
                  <Footer evento={evento} />

                  {evento.conActividades == true && (
                    <React.Fragment>
                      {/* Espacio para que se vea el boton */}
                      <div style={{ height: 72 }} />

                      {/* Boton escanear */}
                      <Fab
                        color="primary"
                        variant="extended"
                        onClick={this.onBotonScanClick}
                        style={{
                          position: "absolute",
                          right: 16,
                          bottom: 16,
                          backgroundColor: color
                        }}
                      >
                        <MdiIcon path={mdiQrcodeScan} title="Escanear código QR" size={1} style={{ marginRight: 8 }} color="black" />
                        Escanear
                      </Fab>
                    </React.Fragment>
                  )}
                </React.Fragment>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
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
