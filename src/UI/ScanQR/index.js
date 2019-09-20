import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import Webcam from "react-webcam";
import QrcodeDecoder from 'qrcode-decoder';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from '@Componentes/MiDialogoMensaje';


//Icons
import MdiIcon from '@mdi/react'
import { mdiCameraPartyMode } from '@mdi/js';

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

class ScanQR extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: undefined,
      camaras: undefined,
      frente: false
    };

    this.webcam = React.createRef();
    this.contenedor = React.createRef()
  }

  componentDidMount() {

    this.init();
  }


  init = async () => {

    try {
      let dispositivos = await navigator.mediaDevices.enumerateDevices();
      let camaras = [];

      dispositivos.forEach((d) => {
        if (d.kind == 'videoinput') {
          camaras.push(d);
        }
      });


      console.log(camaras);
      if (camaras.length == 0) {
        throw Error('Su dispositivo no tiene ninguna camara');
      }

      this.setState({ camaras });

      this.intervalo = setInterval(async () => {
        try {
          this.setState({ width: this.contenedor.current.offsetWidth });

          if (this.webcam && this.webcam.current) {
            const imagen = this.webcam.current.getScreenshot();
            const qr = new QrcodeDecoder();
            const result = await qr.decodeFromImage(imagen);

            if (result != false) {
              clearInterval(this.intervalo);
              let data = result.data;
              this.props.redirect('/Inscripcion/' + data);
            }
          }
        } catch (ex) {

        }
      }, 500);

    } catch (ex) {
      this.setState({ error: 'Error comunicándose con las cámaras del dispositivo' })
    }
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
    const { frente, camaras, error } = this.state;

    let videoConstraints;

    if (frente == true) {
      videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
      };
    } else {
      videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "environment"
      };
    }

    return (
      <MiPagina
        cargando={this.state.cargando || false}
        toolbarTitulo="Escanear código QR"
        toolbarLeftIconVisible={true}>


        {error != undefined && (
          <Typography>{error}</Typography>
        )}


        {error == undefined && camaras != undefined && camaras.length != 0 && (

          <div ref={this.contenedor}>

            <div style={{
              width: '100%',

              justifyContent: 'center',
              display: 'flex', alignItems: 'center', alignContent: 'center'
            }}>

              <Button
                variant="outlined"
                size="small"
                style={{ marginBottom: 16 }}
                onClick={() => {
                  this.setState({
                    width: undefined,
                    frente: !this.state.frente
                  })
                }}>


                <MdiIcon path={mdiCameraPartyMode}
                  title="Cambiar cámara"
                  size={1}
                  style={{ marginRight: 8 }}
                  color="black"
                />
                Cambiar cámara</Button>
            </div>

            {this.state.width && (
              <React.Fragment>

                <Webcam
                  videoConstraints={videoConstraints}
                  ref={this.webcam}
                  width={this.state.width}
                  audio={false}
                />

                <Typography style={{ textAlign: 'center' }}>Apunte al código QR</Typography>
              </React.Fragment>
            )}
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

let componente = ScanQR;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
