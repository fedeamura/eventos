import React from "react";

//Styles
import styles from "./styles";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import themeData from '../../theme';

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { setEventos as setEventosGestion, setInit as setEventosGestionInit } from '@Redux/Actions/gestion';

//Componentes
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import memoize from "memoize-one";
import _ from "lodash";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from "@material-ui/core";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from "@Componentes/MiDialogoMensaje";


const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    eventos: state.Gestion.eventos,
    eventosCargando: state.Gestion.eventosCargando,
    eventosReady: state.Gestion.eventosReady,
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

        const db = window.firebase.firestore();
        let data = await db
          .collection('eventos')
          .where('roles.' + this.props.usuario.uid, '>=', 2)
          .get();


        let eventos = data.docs.map(x => x.data());
        this.props.setEventosGestion(eventos);
      }


      const evento = _.find(this.props.eventos, (x) => x.id == idEvento);
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

      let docs = await db
        .collection("info")
        .doc("inscripciones")
        .collection("porUsuario")
        .where(idEvento + ".inscripto", "==", true)
        .get();

      let data = docs.docs.map(x => x.data());

      let inscriptosDeEvento = _.filter(data, (x) => {
        return x[idEvento] != undefined;
      });

      inscriptosDeEvento = inscriptosDeEvento.map((x) => {
        return x.usuario;
      })

      inscriptosDeEvento = _.uniq(inscriptosDeEvento, (x) => x.uid);

      this.setState({ cargando: false, inscriptos: inscriptosDeEvento });
    } catch (ex) {
      let mensaje = typeof ex === 'object' ? ex.message : ex;
      console.log('Error', mensaje);
      this.setState({ cargando: false });
      this.mostrarDialogoMensaje({
        mensaje,
        autoCerrar: false,
        botonNoVisible: true,
        botonNoMensaje: 'Volver',
        onBotonNoClick: () => {
          setTimeout(() => {
            this.onBotonBackClick();
          }, 300);
        },
        botonSiMensaje: 'Reintentar',
        onBotonSiClick: () => {
          setTimeout(() => {
            this.init();
          }, 300);
        }
      })
    }
  };

  onBotonBackClick = () => {
    this.props.redirect("/Gestion/Panel/" + this.state.idEvento);
  };

  getEvento = memoize((eventos, idEvento) => {
    return _.find(eventos, x => x.id == idEvento);
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
    const { idEvento, cargando, inscriptos } = this.state;
    const { eventos, eventosCargando } = this.props;

    const evento = this.getEvento(eventos, idEvento);

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

              {/* Participantes */}
              {inscriptos && inscriptos.length != 0 && (
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
      </MuiThemeProvider>
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
