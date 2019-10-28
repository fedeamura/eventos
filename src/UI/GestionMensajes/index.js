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
import { IconButton, Fab, Checkbox, FormControlLabel } from "@material-ui/core";

//Icons
import IconDeleteOutlined from "@material-ui/icons/DeleteOutlined";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from "@Componentes/MiDialogoMensaje";
import DialogoForm from "@Componentes/MiDialogoForm";

//Rules
import Rules_Evento from "../../Rules/Rules_Evento";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    eventos: state.Gestion.eventos,
    eventosCargando: state.Gestion.eventosCargando,
    eventosReady: state.Gestion.eventosReady,
    mensajes: state.Eventos.mensajes
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

class GestionMensajes extends React.Component {
  constructor(props) {
    super(props);

    const idEvento = props.match.params.idEvento;
    this.state = {
      idEvento: idEvento,
      mensajes: (props.mensajes || {})[idEvento] || []
    };
  }

  componentWillMount() {
    this.init();
  }

  componentWillReceiveProps(nextProps) {
    const idEventoNuevo = nextProps.match.params.idEvento;
    const idEventoActual = this.state.idEvento;
    if (idEventoNuevo != idEventoActual) {
      window.location.reload();
      return;
    }

    if (nextProps.mensajes != this.props.mensajes) {
      this.setState({ mensajes: nextProps.mensajes[idEventoActual] || [] });
    }
  }

  componentWillUnmount() {
    Rules_Evento.dejarDeEscucharMensajes(this.state.id);
  }

  init = async () => {
    try {
      this.setState({ cargando: true });
      const { idEvento } = this.state;

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

        this.setState({ cargando: false });
        return;
      }

      Rules_Evento.escucharMensajes(idEvento);

      this.setState({ cargando: false });
    } catch (ex) {
      let mensaje = typeof ex === "object" ? ex.message : ex;
      console.log("Error", mensaje);
      this.setState({ cargando: false });
      this.mostrarDialogoMensaje({
        mensaje,
        autoCerrar: false,
        botonNoVisible: true,
        botonNoMensaje: "Volver",
        onBotonNoClick: () => {
          setTimeout(() => {
            this.onBotonBackClick();
          }, 300);
        },
        botonSiMensaje: "Reintentar",
        onBotonSiClick: () => {
          setTimeout(() => {
            this.init();
          }, 300);
        }
      });
    }
  };

  onBotonBackClick = () => {
    this.props.redirect("/Gestion/Panel/" + this.state.idEvento);
  };

  onBotonBorrarClick = mensaje => {
    this.setState({ mensajes: _.filter(this.state.mensajes, x => x.id != mensaje.id) });
  };

  onBotonNuevoClick = () => {
    this.setState({ dialogoNuevoVisible: true });
  };

  onDialogoNuevoClose = () => {
    this.setState({
      dialogoNuevoVisible: false
    });
  };

  onDialogoNuevoBotonSiClick = data => {
    if (data.mensaje.trim() == "") {
      this.mostrarDialogoMensaje({ mensaje: "Ingrese el mensaje" });
      return;
    }

    this.setState({ dialogoNuevoVisible: false });

    let idMax = 0;
    this.state.mensajes.forEach(x => {
      if (x.id > idMax) {
        idMax = x.id;
      }
    });

    idMax += 1;

    this.setState({
      dialogoNuevoMensaje: false,
      mensajes: [
        ...this.state.mensajes,
        {
          id: idMax,
          fechaCreacion: new Date(),
          mensaje: data.mensaje.trim()
        }
      ]
    });
  };

  onBotonGuardarClick = async () => {
    try {
      const { idEvento } = this.state;

      const db = window.firebase.firestore();

      let data = {};
      this.state.mensajes.forEach(x => {
        data[x.id] = {
          id: x.id,
          fechaCreacion: x.fechaCreacion,
          mensaje: x.mensaje,
          visible: x.visible || false
        };
      });

      await db
        .collection("info")
        .doc("mensajes")
        .collection("porEvento")
        .doc(idEvento)
        .set(
          {
            mensajes: data
          },
          {
            merge: true
          }
        );

      this.setState({ dialogoNuevoVisible: false });

      this.mostrarDialogoMensaje({ mensaje: "Mensajes guardados" });
    } catch (ex) {
      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.mostrarDialogoMensaje({ mensaje });
    }
  };

  getEvento = memoize((eventos, idEvento) => {
    return _.find(eventos, x => x.id == idEvento);
  });

  getMensajes = memoize((mensajes, idEvento) => {
    if (mensajes == undefined || idEvento == undefined) return [];
    let lista = _.orderBy(mensajes || [], "fechaCreacion");

    let id = 0;
    lista.forEach(x => {
      id += 1;
      x.id = id;
    });
    return lista;
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
    const { idEvento, mensajes } = this.state;
    const { eventos, eventosCargando } = this.props;

    const evento = this.getEvento(eventos, idEvento);
    const listaMensajes = this.getMensajes(mensajes, idEvento);

    const color = evento && evento.color;
    const theme = this.getTheme(color);

    return (
      <MuiThemeProvider theme={theme}>
        <MiPagina
          cargando={eventosCargando || false}
          toolbarTitulo="Mensajes"
          toolbarLeftIconVisible={true}
          toolbarLeftIconClick={this.onBotonBackClick}
        >
          {evento && (
            <React.Fragment>
              <div style={{ width: "100%" }}>
                <img src={evento.logo} style={{ maxWidth: "100%", objectFit: "contain", maxHeight: 100, marginBottom: 16 }} />
              </div>

              <div style={{ marginBottom: 16, display: "flex" }}>
                <div style={{ flex: 1 }} />

                <Button size="small" variant="outlined" color="primary" onClick={this.onBotonNuevoClick}>
                  Nuevo
                </Button>
              </div>

              {(listaMensajes == undefined || listaMensajes.length == 0) && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16
                  }}
                >
                  <Typography style={{ textAlign: "center" }}>Aún no tiene ningún mensaje cargado</Typography>
                </div>
              )}

              {listaMensajes &&
                listaMensajes.length != 0 &&
                listaMensajes.map((mensaje, index) => {
                  return (
                    <Card
                      style={{
                        display: "flex",
                        padding: 16,
                        marginBottom: 16,
                        borderRadius: 16
                      }}
                      key={index}
                    >
                      <div style={{ flex: 1 }}>
                        <Typography>{mensaje.mensaje}</Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={mensaje.visible || false}
                              onChange={e => {
                                let m = this.state.mensajes;
                                m.forEach(m1 => {
                                  if (m1.id == mensaje.id) {
                                    m1.visible = e.target.checked;
                                  }
                                });

                                this.setState({
                                  mensajes: [...m]
                                });
                              }}
                            />
                          }
                          label="Visible"
                        />
                      </div>

                      <div>
                        <IconButton
                          onClick={() => {
                            this.onBotonBorrarClick(mensaje);
                          }}
                        >
                          <IconDeleteOutlined style={{ fontSize: 16 }} />
                        </IconButton>
                      </div>
                    </Card>
                  );
                })}

              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Fab size="small" variant="extended" color="primary" onClick={this.onBotonGuardarClick}>
                  Guardar cambios
                </Fab>
              </div>
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

          <DialogoForm
            titulo="Nuevo mensaje"
            visible={this.state.dialogoNuevoVisible || false}
            inputs={[
              {
                key: "mensaje",
                label: "Mensaje...."
              }
            ]}
            textoNo="Cancelar"
            textoSi="Crear"
            autoCerrarBotonSi={false}
            onClose={this.onDialogoNuevoClose}
            onBotonSiClick={this.onDialogoNuevoBotonSiClick}
          />
        </MiPagina>
      </MuiThemeProvider>
    );
  }
}

let componente = GestionMensajes;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
