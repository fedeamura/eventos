import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import memoize from "memoize-one";
import _ from "lodash";
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Fab } from "@material-ui/core";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from "@Componentes/MiDialogoMensaje";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    data: state.Data.data,
    dataReady: state.Data.ready,
    dataCargando: state.Data.cargando
  };
};

const mapDispatchToProps = dispatch => ({
  redirect: url => {
    dispatch(push(url));
  }
});

class Sorteo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idEvento: props.match.params.idEvento,
      cargando: false
    };
  }

  componentDidMount() {
    if (this.props.dataReady == true) {
      this.buscarParticipantes();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataReady != this.props.dataReady && nextProps.dataReady == true) {
      this.buscarParticipantes();
    }
  }

  buscarParticipantes = async () => {
    try {
      this.setState({ cargando: true });
      const { idEvento } = this.state;

      var db = window.firebase.firestore();
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
      this.setState({ participantes: [...participantes], cargando: false });
    } catch (ex) {}
  };

  onSorteoClick = async () => {
    try {
      this.setState({ cargando: true });

      const { idEvento, participantes } = this.state;
      const { data } = this.props;

      const evento = this.getEvento(data, idEvento);
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

      let listaGanadores = this.getGanadores(evento);
      if (listaGanadores == undefined) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({ mensaje: "Sin ganadores" });
        return;
      }

      let listaParticipantes = this.getParticipantes(participantes, listaGanadores);
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

      var db = window.firebase.firestore();
      await db
        .collection("info")
        .doc("eventos")
        .update({
          [`info.${idEvento}.ganadores.${ganador.uid}`]: {
            uid: ganador.uid,
            nombre: ganador.nombre,
            photoURL: ganador.photoURL
          }
        });

      this.setState({ cargando: false });

      this.mostrarDialogoMensaje({
        titulo: "Ganador: " + ganador.nombre,
        mensaje: "¿Está presente?",
        botonNoVisible: true,
        botonNoMensaje: "No",
        onBotonNoClick: () => {
          this.setState({ cargando: true });

          setTimeout(async () => {
            try {
              const { idEvento } = this.state;

              var db = window.firebase.firestore();
              await db
                .collection("info")
                .doc("eventos")
                .update({
                  [`info.${idEvento}.ganadores.${ganador.uid}`]: window.firebase.firestore.FieldValue.delete()
                });

              this.setState({ cargando: false });
            } catch (ex) {
              this.setState({ cargando: false });
              this.mostrarDialogoMensaje({ mensaje: "Error procesando la solicitud" });
            }
          }, 300);
        },
        botonSiMensaje: "Si"
      });
    } catch (ex) {
      this.setState({ cargando: false });

      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.mostrarDialogoMensaje({ mensaje });
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
              .doc("eventos")
              .update({
                [`info.${idEvento}.ganadores.${ganador.uid}`]: window.firebase.firestore.FieldValue.delete()
              });
            this.setState({ cargando: false });
          } catch (ex) {
            this.setState({ cargando: false });
            this.mostrarDialogoMensaje({ mensaje: "Error procesando la solicitud" });
          }
        }, 300);
      }
    });
  };

  onBotonBackClick = () => {
    this.props.redirect("/Evento/" + this.state.idEvento);
  };

  getEvento = memoize((data, idEvento) => {
    data = data || {};
    let eventos = data.eventos || [];
    return _.find(eventos, x => x.id == idEvento);
  });

  getParticipantes = memoize((participantes, ganadores) => {
    if (participantes == undefined || ganadores == undefined) return undefined;

    let listaIdsGanadores = ganadores.map(x => {
      return x.uid;
    });

    let listaFinal = [];
    participantes.forEach(x => {
      if (listaIdsGanadores.indexOf(x.uid) == -1) {
        listaFinal.push(x);
      }
    });

    return listaFinal;
  });

  getGanadores = memoize(evento => {
    if (evento == undefined) return undefined;
    let g = [];
    Object.keys(evento.ganadores || {}).forEach(key => {
      let data = evento.ganadores[key];
      if (data != undefined) {
        g.push(data);
      }
    });

    return g;
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
    const { idEvento, cargando, participantes } = this.state;
    const { data, dataCargando, dataReady } = this.props;

    const evento = this.getEvento(data, idEvento);
    let listaGanadores = this.getGanadores(evento);
    let listaParticipantes = this.getParticipantes(participantes, listaGanadores);

    let paginaCargando = dataCargando;
    if (paginaCargando == false) {
      if (cargando == true) {
        paginaCargando = true;
      }
    }

    return (
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
              </React.Fragment>
            )}
          </React.Fragment>
        )}

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
    );
  }
}

let componente = Sorteo;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
