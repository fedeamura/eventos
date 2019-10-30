import React from "react";

//Styles
import styles from "./styles";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { setEventos as setEventosGestion, setInit as setEventosGestionInit } from "@Redux/Actions/gestion";

//Componentes
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Fab from "@material-ui/core/Fab";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import memoize from "memoize-one";
import _ from "lodash";

//Icons
import IconDeleteOutlined from "@material-ui/icons/DeleteOutlined";
import IconDragIndicatorOutlined from "@material-ui/icons/DragIndicatorOutlined";
import IconVisibilityOutlined from "@material-ui/icons/VisibilityOutlined";
import IconVisibilityOffOutlined from "@material-ui/icons/VisibilityOffOutlined";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from "@Componentes/MiDialogoMensaje";
import DialogoForm from "@Componentes/MiDialogoForm";
import Header from "@UI/_Header";
import Footer from "@UI/_Footer";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    eventos: state.Gestion.eventos,
    eventosCargando: state.Gestion.eventosCargando,
    eventosReady: state.Gestion.eventosReady
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

class GestionRoles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idEvento: props.match.params.idEvento,
      cargando: false,
      mensajes: undefined
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
  }

  init = async () => {
    try {
      this.setState({ cargando: true });
      const { idEvento } = this.state;

      //Busco los eventos en los que soy supervisor
      if (this.props.eventos == undefined) {
        this.props.setEventosGestionInit();

        const email = this.props.usuario.email;
        var path = new window.firebase.firestore.FieldPath('roles', email);

        const db = window.firebase.firestore();
        let data = await db
          .collection("eventos")
          .where(path, ">=", 2)
          .get();

        let eventos = data.docs.map(x => x.data());
        this.props.setEventosGestion(eventos);
      }

      //Valido el permiso
      const evento = _.find(this.props.eventos, x => x.id == idEvento);
      if (evento == undefined) {
        this.mostrarDialogoMensaje({
          autoCerrar: false,
          mensaje: "No tiene el permiso necesario para realizar esta operación",
          onBotonSiClick: () => {
            setTimeout(() => {
              this.onBotonBackClick();
            }, 300);
          }
        });

        this.setState({ cargando: false });
        return;
      }

      //Busco los mensajes
      const db = window.firebase.firestore();
      var data = await db
        .collection("info")
        .doc("mensajes")
        .collection("porEvento")
        .doc(idEvento)
        .get();
      data = data.data();
      let mensajes = data.mensajes || {};
      let listaMensajes = [];
      Object.keys(mensajes).forEach(id => {
        listaMensajes.push(mensajes[id]);
      });

      this.setState({ cargando: false, mensajes: listaMensajes });
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

  getListaReordenada = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  getItemStyle = (isDragging, draggableStyle, visible) => ({
    userSelect: "none",
    borderRadius: 16,
    marginBottom: 8,
    display: "flex",
    opacity: visible == true ? 1 : 0.4,
    // padding: 8 * 2,
    // margin: `0 0 ${8}px 0`,

    // change background colour if dragging
    background: isDragging ? "#eee" : "white",

    // styles we need to apply on draggables
    ...draggableStyle
  });

  getListStyle = isDraggingOver => ({});

  onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = this.getListaReordenada(this.state.mensajes, result.source.index, result.destination.index);

    this.setState({
      mensajes: items
    });
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
    if (data.titulo.trim() == "" && data.mensaje.trim() == "") {
      this.mostrarDialogoMensaje({ mensaje: "Ingrese el titulo o el mensaje" });
      return;
    }

    let titulo = data.titulo.trim() != "" ? data.titulo.trim() : undefined;
    let mensaje = data.mensaje.trim() != "" ? data.mensaje.trim() : undefined;

    if (mensaje == undefined) {
      mensaje = titulo;
      titulo = undefined;
    }

    this.setState({ dialogoNuevoVisible: false });

    this.setState({
      dialogoNuevoMensaje: false,
      mensajes: [
        ...this.state.mensajes,
        {
          id: this.state.mensajes.length + 1,
          fechaCreacion: new Date(),
          titulo: titulo,
          mensaje: mensaje
        }
      ]
    });
  };

  onBotonGuardarClick = async () => {
    try {
      this.setState({ cargando: true });
      const { idEvento } = this.state;

      const db = window.firebase.firestore();

      let index = 1;
      let data = {};
      this.state.mensajes.forEach(x => {
        const tieneTitulo = x.titulo && x.titulo.trim() != "";

        data[index] = {
          id: index,
          fechaCreacion: x.fechaCreacion,
          mensaje: x.mensaje.trim(),
          visible: x.visible || false
        };

        if (tieneTitulo) {
          data[index].titulo = x.titulo.trim();
        }

        index += 1;
      });

      await db
        .collection("info")
        .doc("mensajes")
        .collection("porEvento")
        .doc(idEvento)
        .set({
          mensajes: data
        });

      this.setState({ dialogoNuevoVisible: false, cargando: false });

      this.mostrarDialogoMensaje({ mensaje: "Mensajes guardados" });
    } catch (ex) {
      this.setState({ cargando: false });
      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.mostrarDialogoMensaje({ mensaje });
    }
  };

  getEvento = memoize((eventos, idEvento) => {
    return _.find(eventos, x => x.id == idEvento);
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
    const { idEvento, mensajes, cargando } = this.state;
    const { eventos, eventosCargando } = this.props;

    const evento = this.getEvento(eventos, idEvento);

    const cargandoPagina = eventosCargando == true || cargando == true;
    return (
      <MiPagina
        cargando={cargandoPagina || false}
        toolbarLeftIconVisible={true}
        onToolbarLeftIconClick={this.onBotonBackClick}
      >
        {evento && mensajes && (
          <React.Fragment>
            <Header evento={evento} />

            <div style={{ marginBottom: 16, display: "flex", marginTop: 32 }}>
              <div style={{ flex: 1 }} />

              <Button size="small" variant="outlined" onClick={this.onBotonNuevoClick}>
                Nuevo
              </Button>
            </div>

            {(mensajes == undefined || mensajes.length == 0) && (
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

            {mensajes && mensajes.length != 0 && (
              <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} style={this.getListStyle(snapshot.isDraggingOver)}>
                      {mensajes.map((item, index) => {
                        const tieneTitulo = item.titulo && item.titulo.trim() != "";

                        return (
                          <Draggable key={item.id + ""} draggableId={item.id + ""} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style, item.visible)}
                              >
                                <div style={{ flex: 1, padding: 16 }}>
                                  {tieneTitulo && <Typography variant={"subtitle2"}>{item.titulo.trim()}</Typography>}
                                  <Typography variant="body1">{item.mensaje.trim()}</Typography>
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    padding: 4,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    alignSelf: "baseline"
                                  }}
                                >
                                  <IconButton
                                    onClick={() => {
                                      let m = this.state.mensajes;
                                      m.forEach(m1 => {
                                        if (m1.id == item.id) {
                                          m1.visible = !m1.visible;
                                        }
                                      });

                                      this.setState({
                                        mensajes: [...m]
                                      });
                                    }}
                                  >
                                    {item.visible == true && <IconVisibilityOffOutlined style={{ fontSize: 16 }} />}
                                    {item.visible != true && <IconVisibilityOutlined style={{ fontSize: 16 }} />}
                                  </IconButton>
                                  <IconButton
                                    onClick={() => {
                                      this.onBotonBorrarClick(item);
                                    }}
                                  >
                                    <IconDeleteOutlined style={{ fontSize: 16 }} />
                                  </IconButton>
                                  <div
                                    {...provided.dragHandleProps}
                                    style={{
                                      margin: 0,
                                      marginRight: 4,
                                      padding: 8,
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center"
                                    }}
                                  >
                                    <IconDragIndicatorOutlined style={{ fontSize: 16 }} />
                                  </div>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 16 }}>
              <Fab variant="extended" color="primary" onClick={this.onBotonGuardarClick}>
                Guardar cambios
              </Fab>
            </div>

            <Footer evento={evento} />
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
              key: "titulo",
              label: "Titulo"
            },
            {
              key: "mensaje",
              label: "Mensaje"
            }
          ]}
          textoNo="Cancelar"
          textoSi="Crear"
          autoCerrarBotonSi={false}
          onClose={this.onDialogoNuevoClose}
          onBotonSiClick={this.onDialogoNuevoBotonSiClick}
        />
      </MiPagina>
    );
  }
}

let componente = GestionRoles;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
