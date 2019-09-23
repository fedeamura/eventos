import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import _ from 'lodash';

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from '@Componentes/MiDialogoMensaje';

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

class Inscripcion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cargando: true,
      codigo: props.match.params.codigo
    };
  }

  componentDidMount() {
    if (this.props.dataReady == true) {
      this.inscribir();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataReady == true && this.props.dataReady == false) {
      this.inscribir();
    }
  }

  inscribir = async () => {
    try {

      this.setState({ cargando: true });

      var db = window.firebase.firestore();
      const codigo = this.state.codigo;
      if (codigo == undefined || codigo == '' || codigo.split('_').length != 2) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({
          autoCerrar: false,
          mensaje: 'El código QR escaneado es inválido',
          botonSiMensaje: 'Volver',
          onBotonSiClick: () => {
            setTimeout(() => {
              this.props.redirect('/')
            }, 300);
          }
        });
        return;
      }

      let idEvento = this.state.codigo.split("_")[0].toLowerCase();
      let idActividad = this.state.codigo.split("_")[1].toLowerCase();

      const { data, usuario } = this.props;

      //Busco el evento
      let eventos = data.eventos || [];
      let evento = _.find(eventos, (x) => x.id == idEvento);

      //El evento no existe
      if (evento == undefined) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({
          autoCerrar: false,
          mensaje: 'El código QR escaneado es inválido',
          botonSiMensaje: 'Volver',
          onBotonSiClick: () => {
            setTimeout(() => {
              this.props.redirect('/')
            }, 300);
          }
        });
        return;
      }

      //Busco la actividad
      let actividades = evento.actividades || [];
      let actividad = _.find(actividades, (x) => x.id == idActividad);

      //La activdad no existe
      if (actividad == undefined) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({
          autoCerrar: false,
          mensaje: 'El código QR escaneado es inválido',
          botonSiMensaje: 'Volver',
          onBotonSiClick: () => {
            setTimeout(() => {
              this.props.redirect('/')
            }, 300);
          }
        });
        return;
      }

      //Inscribo
      await db.collection('info').doc('inscripciones').collection('porUsuario').doc(usuario.uid).set({
        usuario: {
          nombre: usuario.nombre,
          photoURL: usuario.photoURL,
          uid: usuario.uid,
        },
        [evento.id]: {
          [actividad.id]: true
        },
      }, { merge: true })

      this.setState({ cargando: false, data: true });
    } catch (ex) {
      console.log(ex);
      this.setState({ cargando: false });

      this.mostrarDialogoMensaje({
        autoCerrar: false,
        mensaje: 'Error procesando la solicitud',
        botonNoVisible: true,
        botonNoMensaje: 'Volver',
        onBotonNoClick: () => {
          setTimeout(() => {
            this.props.redirect('/')
          }, 300);
        },
        botonSiMensaje: 'Reintentar',
        onBotonSiClick: () => {
          this.setState({ cargando: true });
          setTimeout(() => {
            this.buscarDatos();
          }, 300);
        }
      });
    }
  };

  onBotonActividadClick = () => {
    let idEvento = this.state.codigo.split("_")[0];
    let idActividad = this.state.codigo.split("_")[1];
    this.props.redirect("/Actividad/" + idEvento + "/" + idActividad);
  };

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

    return (
      <MiPagina
        cargando={cargando || false}
        toolbarTitulo="Inscripción a una actividad"
        toolbarLeftIconVisible={false}>


        {data && (
          <div style={{ padding: 16, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <Typography style={{ textAlign: "center", marginBottom: 16 }} variant="h5">
              Te inscribiste con éxito en la actividad
            </Typography>
            <Typography style={{ textAlign: "center", marginBottom: 32 }}>Además, ya estas participando en un sorteo</Typography>

            <Button onClick={this.onBotonActividadClick} size="small" variant="contained" color="primary">
              Ver actividad
            </Button>
          </div>
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

let componente = Inscripcion;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
