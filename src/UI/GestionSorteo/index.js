import React from "react";

//Styles
import styles from "./styles";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import themeData from "../../theme";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { setEventos as setEventosGestion, setInit as setEventosGestionInit } from "@Redux/Actions/gestion";

//Componentes
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import memoize from "memoize-one";
import _ from "lodash";
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Fab, Dialog, DialogContent } from "@material-ui/core";
import Lottie from "react-lottie";
import * as animSorteoCargando from "@Resources/animaciones/sorteo_cargando.json";
import * as animSorteoGanador from "@Resources/animaciones/sorteo_ganador.json";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from "@Componentes/MiDialogoMensaje";

//Rules
import Rules_Evento from "../../Rules/Rules_Evento";

const lottieCargando = {
  loop: true,
  autoplay: true,
  animationData: animSorteoCargando,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

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
    eventos: state.Gestion.eventos,
    eventosCargando: state.Gestion.eventosCargando,
    eventosReady: state.Gestion.eventosReady,
    ganadores: state.Eventos.ganadores
  };
};

const mapDispatchToProps = dispatch => ({
  redirect: url => {
    dispatch(push(url));
  },
  setEventosGestion: data => {
    dispatch(setEventosGestion(data));
  },
  setEventosGestionInit: () => {
    dispatch(setEventosGestionInit());
  }
});

class GestionSorteo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idEvento: props.match.params.idEvento,
      cargando: false,
      ausentes: []
    };
  }

  componentDidMount() {
    Rules_Evento.escucharGanadores(this.state.idEvento);
    if (this.props.ganadores && this.props.ganadores[this.state.idEvento]) {
      this.init();
    }
  }

  componentWillUnmount() {
    Rules_Evento.dejarDeEscucharGanadores();
  }

  componentWillReceiveProps(nextProps) {
    const idEventoNuevo = nextProps.match.params.idEvento;
    const idEventoActual = this.state.idEvento;
    if (idEventoNuevo != idEventoActual) {
      window.location.reload();
      return;
    }

    if (nextProps.ganadores != this.props.ganadores) {
      if (nextProps.ganadores && nextProps.ganadores[this.state.idEvento]) {
        setTimeout(() => {
          this.init();
        }, 300);
      }
    }
  }

  init = async () => {
    try {
      this.setState({ cargando: true });
      const { idEvento } = this.state;

      var db = window.firebase.firestore();

      if (this.props.eventos == undefined) {
        this.props.setEventosGestionInit();

        const db = window.firebase.firestore();
        let data = await db
          .collection("eventos")
          .where("roles." + this.props.usuario.uid, ">=", 2)
          .get();

        let eventos = data.docs.map(x => x.data());
        this.props.setEventosGestion(eventos);
      }

      const evento = _.find(this.props.eventos, x => x.id == idEvento);
      if (evento == undefined) {
        this.mostrarDialogoMensaje({
          autoCerrar: false,
          mensaje: "No tiene el permiso necesario para realizar esta operación",
          onBotonSiClick: () => {
            setTimeout(() => {
              this.props.redirect("/Gestion");
            }, 300);
          }
        });

        this.setState({ cargando: false, sinPermiso: false, ready: true });
        return;
      }

      let docs = await db
        .collection("info")
        .doc("inscripciones")
        .collection("porUsuario")
        .where(idEvento + ".inscripto", "==", true)
        .get();

      let data = docs.docs.map(x => {
        return x.data();
      });

      let participantes = [];

      data.forEach(x => {
        let cantidad = _.filter(Object.keys(x[idEvento]), x => {
          return x != "inscripto";
        }).length;

        participantes.push({
          ...x.usuario,
          cantidad
        });
      });

      this.setState({ participantes: [...participantes], cargando: false, ready: true });
    } catch (ex) {
      let mensaje = typeof ex === "object" ? ex.message : ex;
      console.log("Error", mensaje);
    }
  };

  onSorteoClick = async () => {
    try {
      const { idEvento, participantes, ausentes, sinPermiso } = this.state;
      const { eventos, ganadores } = this.props;

      const evento = this.getEvento(eventos, idEvento);
      if (evento == undefined) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({ mensaje: "Sin evento" });
        return;
      }
      if (participantes == undefined || participantes.length == 0) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({ mensaje: "Sin participantes" });
        return;
      }

      let listaGanadores = this.getGanadores(ganadores, idEvento, sinPermiso);
      if (listaGanadores == undefined) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({ mensaje: "Sin ganadores" });
        return;
      }

      let listaParticipantes = this.getParticipantes(participantes, listaGanadores, ausentes);
      if (listaParticipantes == undefined || listaParticipantes.length == 0) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({ mensaje: "Sin participantes" });
        return;
      }

      //Mas probabilidad cuando mas participaron
      let listaFinal = [];
      listaParticipantes.forEach(participante => {
        for (let i = 0; i < participante.cantidad; i++) {
          listaFinal.push(participante);
        }
      });
      listaParticipantes = listaFinal;

      var ganador = listaParticipantes[Math.floor(Math.random() * listaParticipantes.length)];

      this.setState({ dialogoSorteoVisible: true, dialogoSorteoCargandoVisible: true, dialogoSorteoGanadorVisible: false });
      var db = window.firebase.firestore();
      await db
        .collection("info")
        .doc("ganadores")
        .collection("porEvento")
        .doc(idEvento)
        .set(
          {
            ganadores: {
              [`${ganador.uid}`]: {
                uid: ganador.uid,
                nombre: ganador.nombre,
                photoURL: ganador.photoURL,
                email: ganador.email
              }
            }
          },
          { merge: true }
        );

      this.setState({
        dialogoSorteoCargandoVisible: false,
        dialogoSorteoGanadorVisible: true,
        dialogoSorteoGanadorData: ganador
      });
    } catch (ex) {
      this.setState({
        cargando: false,
        dialogoSorteoCargandoVisible: false,
        dialogoSorteoGanadorVisible: false,
        dialogoSorteoVisible: false
      });

      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.mostrarDialogoMensaje({ mensaje });
    }
  };

  onBotonNoPresenteClick = async () => {
    this.setState({ cargando: true, dialogoSorteoVisible: false });

    const { dialogoSorteoGanadorData } = this.state;

    try {
      const { idEvento } = this.state;

      var db = window.firebase.firestore();
      await db
        .collection("info")
        .doc("ganadores")
        .collection("porEvento")
        .doc(idEvento)
        .set(
          {
            ganadores: {
              [dialogoSorteoGanadorData.uid]: window.firebase.firestore.FieldValue.delete()
            }
          },
          { merge: true }
        );
      this.setState({ cargando: false, ausentes: [...this.state.ausentes, dialogoSorteoGanadorData] });
    } catch (ex) {
      this.setState({ cargando: false });
      this.mostrarDialogoMensaje({ mensaje: "Error procesando la solicitud" });
    }
  };

  onGanadorClick = ganador => {
    this.mostrarDialogoMensaje({
      mensaje: "¿Desea quitar el ganador?",
      botonNoVisible: true,
      botonNoMensaje: "No",
      botonSiMensaje: "Si",
      onBotonSiClick: () => {
        this.setState({ cargando: true });

        setTimeout(async () => {
          try {
            const { idEvento } = this.state;

            var db = window.firebase.firestore();
            await db
              .collection("info")
              .doc("ganadores")
              .collection("porEvento")
              .doc(idEvento)
              .set(
                {
                  ganadores: {
                    [ganador.uid]: window.firebase.firestore.FieldValue.delete()
                  }
                },
                { merge: true }
              );
            this.setState({ cargando: false, ausentes: [...this.state.ausentes, ganador] });
          } catch (ex) {
            this.setState({ cargando: false });
            this.mostrarDialogoMensaje({ mensaje: "Error procesando la solicitud" });
          }
        }, 300);
      }
    });
  };

  onAusenteClick = ausente => {
    this.mostrarDialogoMensaje({
      titulo: "Confirme operación",
      mensaje: "¿Desea quitar de la lista de ausentes al usuario seleccionado?",
      botonNoMensaje: "Cancelar",
      botonNoVisible: true,
      botonSiMensaje: "Si",
      onBotonSiClick: () => {
        setTimeout(() => {
          let a = this.state.ausentes.filter(x => {
            return x.uid != ausente.uid;
          });
          this.setState({ ausentes: a });
        }, 300);
      }
    });
  };

  onBotonBackClick = () => {
    this.props.redirect("/Gestion/Panel/" + this.state.idEvento);
  };

  getEvento = memoize((eventos, idEvento) => {
    return _.find(eventos, x => x.id == idEvento);
  });

  getParticipantes = memoize((participantes, ganadores, ausentes, sinPermiso) => {
    if (sinPermiso == true) return [];

    if (participantes == undefined || ganadores == undefined) return undefined;

    let listaIdsGanadores = ganadores.map(x => {
      return x.uid;
    });

    let listaIdsAusentes = ausentes.map(x => {
      return x.uid;
    });

    let listaFinal = [];
    participantes.forEach(x => {
      if (listaIdsGanadores.indexOf(x.uid) == -1 && listaIdsAusentes.indexOf(x.uid) == -1) {
        listaFinal.push(x);
      }
    });

    console.log(listaFinal);

    return listaFinal;
  });

  getGanadores = memoize((ganadores, idEvento, sinPermiso) => {
    if (sinPermiso == true) return [];
    if (ganadores == undefined) return undefined;

    return ganadores[idEvento] || [];
  });

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

  //Dialogo mensaje
  mostrarDialogoMensaje = comando => {
    this.setState({
      dialogoMensajeVisible: true,
      dialogoMensajeTitulo: comando.titulo || "",
      dialogoMensajeMensaje: comando.mensaje || "",
      dialogoMensajeBotonSiVisible: comando.botonSiVisible != undefined ? comando.botonSiVisible : true,
      dialogoMensajeBotonSiMensaje: comando.botonSiMensaje || "Aceptar",
      dialogoMensajeBotonSiClick: comando.onBotonSiClick,
      dialogoMensajeBotonNoVisible: comando.botonNoVisible != undefined ? comando.botonNoVisible : false,
      dialogoMensajeBotonNoMensaje: comando.botonNoMensaje || "Cancelar",
      dialogoMensajeBotonNoClick: comando.onBotonNoClick,
      dialogoMensajeAutoCerrar: comando.autoCerrar != undefined ? comando.autoCerrar : true
    });
  };

  onDialogoMensajeClose = () => {
    if (this.state.dialogoMensajeAutoCerrar != true) return;
    this.setState({ dialogoMensajeVisible: false });
  };

  onDialogoMensajeBotonSiClick = () => {
    if (this.state.dialogoMensajeBotonSiClick == undefined) {
      this.setState({ dialogoMensajeVisible: false });
      return;
    }
    let resultado = this.state.dialogoMensajeBotonSiClick();
    if (resultado != false) {
      this.setState({ dialogoMensajeVisible: false });
    }
  };

  onDialogoMensajeBotonNoClick = () => {
    if (this.state.dialogoMensajeBotonNoClick == undefined) {
      this.setState({ dialogoMensajeVisible: false });
      return;
    }

    let resultado = this.state.dialogoMensajeBotonNoClick();
    if (resultado != false) {
      this.setState({ dialogoMensajeVisible: false });
    }
  };

  render() {
    const { idEvento, cargando, participantes, ausentes, sinPermiso, ready } = this.state;
    const { eventos, eventosCargando, ganadores } = this.props;

    let evento, listaGanadores, listaParticipantes;
    if (ready == true) {
      evento = this.getEvento(eventos, idEvento);
      listaGanadores = this.getGanadores(ganadores, idEvento, sinPermiso);
      listaParticipantes = this.getParticipantes(participantes, listaGanadores, ausentes, sinPermiso);
    }

    let paginaCargando = eventosCargando;
    if (paginaCargando == false) {
      if (cargando == true) {
        paginaCargando = true;
      }
    }

    const color = evento && evento.color;
    let theme = this.getTheme(color);

    return (
      <MuiThemeProvider theme={theme}>
        <MiPagina
          cargando={paginaCargando || false}
          toolbarTitulo="Sorteo"
          toolbarLeftIconVisible={true}
          toolbarLeftIconClick={this.onBotonBackClick}
        >
          {evento && (
            <React.Fragment>
              <div style={{ width: "100%" }}>
                <img src={evento.logo} style={{ maxWidth: "100%", objectFit: "contain", maxHeight: 100, marginBottom: 16 }} />
              </div>

              {listaParticipantes && listaParticipantes.length != 0 && (
                <React.Fragment>
                  <div
                    style={{
                      marginBottom: 16,
                      marginTop: 16,
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Fab variant="extended" color="primary" onClick={this.onSorteoClick}>
                      Sortear
                    </Fab>
                  </div>
                </React.Fragment>
              )}

              {/* Ganadores */}
              {listaGanadores.length != 0 && (
                <Card style={{ borderRadius: 16, marginBottom: 32 }}>
                  <Typography variant="subtitle2" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                    Ganadores
                  </Typography>
                  <List>
                    {listaGanadores.map((ganador, index) => {
                      return (
                        <ListItem
                          button
                          key={index}
                          onClick={() => {
                            this.onGanadorClick(ganador);
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar src={ganador.photoURL}></Avatar>
                          </ListItemAvatar>
                          <ListItemText>{ganador.nombre}</ListItemText>
                        </ListItem>
                      );
                    })}
                  </List>
                </Card>
              )}

              {/* Ausentes */}
              {ausentes.length != 0 && (
                <Card style={{ borderRadius: 16, marginBottom: 32 }}>
                  <Typography variant="subtitle2" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                    Ausentes
                  </Typography>
                  <List>
                    {ausentes.map((ganador, index) => {
                      return (
                        <ListItem
                          button
                          key={index}
                          onClick={() => {
                            this.onAusenteClick(ganador);
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar src={ganador.photoURL}></Avatar>
                          </ListItemAvatar>
                          <ListItemText>{ganador.nombre}</ListItemText>
                        </ListItem>
                      );
                    })}
                  </List>
                </Card>
              )}

              {/* Participantes */}
              {listaParticipantes && listaParticipantes.length != 0 && (
                <Card style={{ borderRadius: 16 }}>
                  <Typography variant="subtitle2" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                    Participantes
                  </Typography>
                  <List>
                    {listaParticipantes.map((x, key) => {
                      return (
                        <ListItem button key={key}>
                          <ListItemAvatar>
                            <Avatar src={x.photoURL}></Avatar>
                          </ListItemAvatar>
                          <ListItemText>{x.nombre}</ListItemText>
                        </ListItem>
                      );
                    })}
                  </List>
                </Card>
              )}
            </React.Fragment>
          )}

          <Dialog fullWidth open={this.state.dialogoSorteoVisible || false}>
            <DialogContent>
              {this.state.dialogoSorteoCargandoVisible == true && (
                <React.Fragment>
                  <Lottie options={lottieCargando} height={130} width={130} style={{ minHeight: "130px" }} />
                  <Typography variant="h6" style={{ textAlign: "center", marginTop: 16 }}>
                    Sorteando...
                  </Typography>
                </React.Fragment>
              )}

              {this.state.dialogoSorteoGanadorVisible == true && (
                <React.Fragment>
                  <Lottie options={lottieGanador} height={180} width={180} style={{ minHeight: "180px" }} />
                  <div
                    style={{
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: 16,
                      display: "flex",
                      padding: 16,
                      marginTop: 32,
                      marginBottom: 32,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column"
                    }}
                  >
                    <Avatar
                      style={{ marginBottom: 16, width: 72, height: 72 }}
                      src={this.state.dialogoSorteoGanadorData && this.state.dialogoSorteoGanadorData.photoURL}
                    />
                    <Typography style={{ textAlign: "center" }} variant="h5">
                      {this.state.dialogoSorteoGanadorData && this.state.dialogoSorteoGanadorData.nombre}
                    </Typography>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column"
                    }}
                  >
                    <Typography>¿Está presente?</Typography>
                    <div style={{ marginTop: 16 }}>
                      <Button size="small" onClick={this.onBotonNoPresenteClick}>
                        No
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          this.setState({ dialogoSorteoVisible: false });
                        }}
                      >
                        Si
                      </Button>
                    </div>
                  </div>
                </React.Fragment>
              )}
            </DialogContent>
          </Dialog>

          {/* Dialogo mensaje */}
          <DialogoMensaje
            visible={this.state.dialogoMensajeVisible || false}
            titulo={this.state.dialogoMensajeTitulo || ""}
            mensaje={this.state.dialogoMensajeMensaje || ""}
            onClose={this.onDialogoMensajeClose}
            botonSiVisible={this.state.dialogoMensajeBotonSiVisible || false}
            textoSi={this.state.dialogoMensajeBotonSiMensaje || ""}
            onBotonSiClick={this.onDialogoMensajeBotonSiClick}
            autoCerrarBotonSi={false}
            botonNoVisible={this.state.dialogoMensajeBotonNoVisible || false}
            textoNo={this.state.dialogoMensajeBotonNoMensaje || ""}
            onBotonNoClick={this.onDialogoMensajeBotonNoClick}
            autoCerrarBotonNo={false}
          />
        </MiPagina>
      </MuiThemeProvider>
    );
  }
}

let componente = GestionSorteo;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
