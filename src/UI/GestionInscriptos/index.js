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
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import memoize from "memoize-one";
import _ from "lodash";
import { CSVLink } from "react-csv";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from "@Componentes/MiDialogoMensaje";
import Header from "@UI/_Header";
import Footer from "@UI/_Footer";

const CVS_HEADERS = [{ label: "Nombre", key: "nombre" }, { label: "Email", key: "email" }, { label: "Fecha", key: "fecha" }];

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

class GestionInscriptos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idEvento: props.match.params.idEvento
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

      var db = window.firebase.firestore();

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

      let docs = await db
        .collection("info")
        .doc("inscripciones")
        .collection("porUsuario")
        .where(`eventos.${idEvento}.inscripto`, "==", true)
        .get();

      let data = docs.docs.map(x => x.data());
      console.log(data);

      let inscriptosDeEvento = _.filter(data, x => {
        return (x.eventos || {})[idEvento] != undefined;
      });

      inscriptosDeEvento = inscriptosDeEvento.map(x => {
        return { ...x.usuario, fecha: x.fecha };
      });

      inscriptosDeEvento = _.uniq(inscriptosDeEvento, x => x.uid);

      this.setState({ cargando: false, inscriptos: inscriptosDeEvento });
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

  onTituloClick = () => {
    this.props.redirect('/Gestion/');
  }

  getEvento = memoize((eventos, idEvento) => {
    return _.find(eventos, x => x.id == idEvento);
  });

  generarCsv = memoize(data => {
    if (data == undefined) return undefined;
    return data.map(x => {
      return {
        nombre: x.nombre,
        email: x.email,
        fecha: x.fecha ? x.fecha.toDate() : new Date()
      };
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
    const { idEvento, cargando, inscriptos } = this.state;
    const { eventos, eventosCargando } = this.props;

    const evento = this.getEvento(eventos, idEvento);

    let paginaCargando = eventosCargando;
    if (paginaCargando == false) {
      if (cargando == true) {
        paginaCargando = true;
      }
    }
    const csvData = this.generarCsv(inscriptos);

    return (
      <MiPagina
        cargando={paginaCargando || false}
        toolbarLeftIconVisible={true}
        onToolbarLeftIconClick={this.onBotonBackClick}
        onToolbarTituloClick={this.onTituloClick}
      >
        {evento && (
          <React.Fragment>
            <Header evento={evento} />

            {/* Participantes */}
            {inscriptos && inscriptos.length != 0 && (
              <React.Fragment>
                <div style={{ display: "flex", marginBottom: 16 }}>
                  <div style={{ flex: 1 }} />
                  <div>
                    {csvData && (
                      <CSVLink data={csvData} headers={CVS_HEADERS} filename={"Inscriptos.csv"} style={{ textDecoration: "none" }}>
                        <Button variant="outlined" size="small" style={{ textDecoration: "none" }}>
                          Descargar
                          </Button>
                      </CSVLink>
                    )}
                  </div>
                </div>

                <Card style={{ borderRadius: 16 }}>
                  <Typography variant="subtitle2" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                    Inscriptos
                    </Typography>
                  <List>
                    {inscriptos.map((x, key) => {
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
      </MiPagina>
    );
  }
}

let componente = GestionInscriptos;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
