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
import Lottie from "react-lottie";
import _ from 'lodash';

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from "@Componentes/MiDialogoMensaje";
import Header from '@UI/_Header';
import Footer from '@UI/_Footer';

//Lotties
import * as animSuccess from "@Resources/animaciones/anim_success.json";

const lottieSuccess = {
  loop: false,
  autoplay: true,
  animationData: animSuccess,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    evento: state.Evento.data
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
      idActividad: props.match.params.idActividad,
      evento: undefined,
      actividad: undefined
    };
  }

  componentDidMount() {
    this.inscribir();
  }

  inscribir = async () => {
    try {
      const { evento } = this.props;
      const { idActividad } = this.state;
      this.setState({ cargando: true });

      var db = window.firebase.firestore();
      if (evento == undefined || idActividad == undefined || idActividad.trim() == "") {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({
          autoCerrar: false,
          mensaje: "El código QR escaneado es inválido",
          botonSiMensaje: "Volver",
          onBotonSiClick: () => {
            setTimeout(() => {
              this.props.redirect("/");
            }, 300);
          }
        });
        return;
      }

      const { usuario } = this.props;

      const actividad = _.find(evento.actividades, (x) => x.id == idActividad);
      if (actividad == undefined) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({
          autoCerrar: false,
          mensaje: "El código QR escaneado es inválido",
          botonSiMensaje: "Volver",
          onBotonSiClick: () => {
            setTimeout(() => {
              this.props.redirect("/");
            }, 300);
          }
        });
        return;
      }


      //Inscribo
      await db
        .collection("info")
        .doc("inscripciones")
        .collection("porUsuario")
        .doc(usuario.uid)
        .set(
          {
            fecha: new Date(),
            usuario: {
              nombre: usuario.nombre,
              email: usuario.email,
              photoURL: usuario.photoURL,
              uid: usuario.uid
            },
            eventos: {
              [evento.id]: {
                inscripto: true,
                actividades: {
                  [idActividad]: {
                    inscripto: true,
                    fecha: new Date()
                  }
                }
              }
            }
          },
          { merge: true }
        );

      this.setState({
        cargando: false,
        actividad
      });
    } catch (ex) {
      this.setState({ cargando: false });

      this.mostrarDialogoMensaje({
        autoCerrar: false,
        mensaje: "Error procesando la solicitud",
        botonNoVisible: true,
        botonNoMensaje: "Volver",
        onBotonNoClick: () => {
          setTimeout(() => {
            this.props.redirect("/");
          }, 300);
        },
        botonSiMensaje: "Reintentar",
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
    const { evento } = this.props;
    const { actividad } = this.state;
    if (evento.conActividades == true) {
      this.props.redirect(`/${evento.id}/Data/${actividad.id}`);
    } else {
      this.props.redirect(`/${evento.id}`);
    }
  };

  onTituloClick = () => {

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
    const { evento } = this.props;
    const { cargando, actividad } = this.state;
    if (evento == undefined) return <div />;

    return (
      <MiPagina
        cargando={cargando || false}
        toolbarLeftIconVisible={false}
        onToolbarTituloClick={this.onTituloClick}
      >
        {evento && actividad && (
          <React.Fragment>
            <Header evento={evento} />

            <div style={{
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 16,
              padding: 16,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column"
            }}>

              <Lottie options={lottieSuccess} height={180} width={180} style={{ minHeight: "180px", marginBottom: 16 }} />

              <Typography style={{ textAlign: "center", marginBottom: 16 }} variant="h5">
                {evento.conActividades == false ? `Te inscribiste con éxito en el evento ${evento.nombre}` : `Te escribiste con éxito en la actividad ${actividad.nombre}`}
              </Typography>
              <Typography style={{ textAlign: "center", marginBottom: 32 }}>Además, ya estas participando en un sorteo</Typography>

              <Button onClick={this.onBotonActividadClick} size="small" variant="contained" color="primary">
                {evento.conActividades == false ? 'Ver el evento' : 'Ver la actividad'}
              </Button>
            </div>

            <Footer evento={evento} />


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

let componente = Inscripcion;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
