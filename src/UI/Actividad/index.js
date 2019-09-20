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

//Colores
import green from "@material-ui/core/colors/green";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from '@Componentes/MiDialogoMensaje';

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario
  };
};

const mapDispatchToProps = dispatch => ({
  redirect: url => {
    dispatch(push(url));
  }
});

class Actividad extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idEvento: props.match.params.idEvento,
      idActividad: props.match.params.idActividad,
      data: undefined,
      cargando: true
    };
  }

  componentDidMount() {
    this.buscarInfo();
  }

  buscarInfo = async () => {
    try {
      this.setState({ cargando: true, dialogoMensajeVisible: false });

      var db = window.firebase.firestore();

      this.unsubscribe && this.unsubscribe();
      this.unsubscribe = await db
        .collection("evento")
        .doc(this.state.idEvento)
        .collection("actividad")
        .doc(this.state.idActividad)
        .onSnapshot(doc => {
          let data = doc.data();
          if (data == undefined) {
            this.setState({ cargando: false });
            this.mostrarDialogoMensaje({
              autoCerrar: false,
              mensaje: 'La actividad indicada no existe',
              botonSiMensaje: 'Volver',
              onBotonSiClick: () => {
                this.props.redirect('/Evento/' + this.state.idEvento);
              }
            });
            return;
          }

          this.setState({ data, cargando: false });
        });
    } catch (ex) {
      this.setState({ cargando: false });

      this.mostrarDialogoMensaje({
        autoCerrar: false,
        mensaje: 'Ocurrió un error. Por favor intente nuevamente',
        botonNoVisible: true,
        botonNoMensaje: 'Volver',
        onBotonNoClick: () => {
          setTimeout(() => {
            this.props.redirect('/Evento/' + this.state.idEvento);
          }, 300)
        },
        botonSiMensaje: 'Reintentar',
        onBotonSiClick: () => {
          this.setState({ cargando: true });
          setTimeout(() => {
            this.buscarInfo();
          }, 300)
        }
      });
    }
  };

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

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
    const { cargando, data } = this.state;
    const { usuario } = this.props;

    return (
      <MiPagina
        cargando={cargando || false}
        toolbarTitulo="Actividad" toolbarLeftIconVisible={true}>


        {data && (
          <React.Fragment>
            {data.ganadorSorteo && data.ganadorSorteo.uid == usuario.uid && (
              <Card style={{
                borderRadius: 16,
                padding: 16,
                backgroundColor: green["500"],
                marginBottom: 32
              }}>
                <Typography variant="body1" style={{ color: "white" }}>
                  ¡Ganaste el sorteo!
            </Typography>
                <Typography variant="body2" style={{ color: "white" }}>
                  Mostrá esta pantalla a algun disertante del evento para recibir tu premio
            </Typography>
              </Card>
            )}

            <Typography variant="h5">{data.nombre}</Typography>
            <Typography variant="body2">{data.descripcion}</Typography>
          </React.Fragment>
        )}


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

let componente = Actividad;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
