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
    inscripciones: state.Usuario.inscripciones,
    evento: state.Evento.data,
    ganadores: state.Evento.ganadores,
    mensajes: state.Evento.mensajes,
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
  }

  onActividadClick = a => {
    const { evento } = this.props;
    this.props.redirect(`/${evento.id}/Data/${a.id}`);
  };

  onBotonScanClick = () => {
    const { evento } = this.props;
    this.props.redirect(`/${evento.id}/ScanQR`);
  };

  onTituloClick = () => {

  }

  getGrupos = memoize(evento => {
    if (evento == undefined) return [];

    const actividades = evento.actividades || [];
    let actividadesPorGrupo = _.groupBy(actividades, "grupo");
    return _.orderBy(Object.keys(actividadesPorGrupo));
  });

  getActividades = memoize((evento, grupo) => {
    if (evento == undefined || grupo == undefined) return [];
    let actividades = evento.actividades || [];
    actividades = actividades.filter(x => x.grupo == grupo);
    return _.orderBy(actividades, x => (x.nombre || "").toLowerCase());
  });

  getMensajes = memoize((mensajes) => {
    if (mensajes == undefined) return [];
    return _.filter(mensajes, x => x.visible == true);
  });

  esGanador = memoize((ganadores, uid) => {
    if (ganadores == undefined || uid == undefined) return false;
    console.log(ganadores);

    return _.find(ganadores, x => x.uid == uid) != undefined;
  });

  estaInscripto = memoize((inscripciones) => {
    if (inscripciones == undefined) return false;
    return inscripciones.length != 0;
  });

  estaInscriptoEnActividad = memoize((inscripciones, idEvento, idActividad) => {
    if (inscripciones == undefined || idEvento == undefined || idActividad == undefined) return false;
    return inscripciones.indexOf(idActividad) != -1;
  });

  render() {
    const { usuario, evento, ganadores, inscripciones, mensajes } = this.props;
    if (evento == undefined) return <div />;

    const grupos = this.getGrupos(evento);
    const listaMensajes = this.getMensajes(mensajes);
    const esInscripto = this.estaInscripto(inscripciones);
    const esGanador = this.esGanador(ganadores, usuario.uid);

    return (
      <MiPagina
        toolbarLeftIconVisible={false}
        onToolbarTituloClick={this.onTituloClick}
      >
        {evento && (
          <React.Fragment>
            <React.Fragment>
              <Header evento={evento} />

              {/* Esta inscripto */}
              {esInscripto == true && (

                <React.Fragment>

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
                            <ListItem key={indexMensaje} divider={indexMensaje != listaMensajes.length - 1}>
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
                      console.log('Actividades', actividades);

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

                </React.Fragment>
              )}

              {/* No inscripto */}
              {esInscripto == false && (
                <div
                  style={{
                    marginTop: 32,
                    padding: 16,
                    borderRadius: 16,
                    border: "1px solid rgba(0,0,0, 0.1)"
                  }}
                >
                  <Typography style={{ textAlign: "center" }}>No estás inscripto en el evento</Typography>
                </div>
              )}

              {/* Sponsors */}
              <Footer evento={evento} />

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
                  bottom: 16
                }}
              >
                <MdiIcon path={mdiQrcodeScan} title="Escanear código QR" size={1} style={{ marginRight: 8 }} color="black" />
                Escanear QR
              </Fab>

            </React.Fragment>
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
