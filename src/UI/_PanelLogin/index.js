import React from "react";

//Styles
import { withStyles } from "@material-ui/core/styles";
import styles from "./styles";
import classNames from "classnames";

//Componentes
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";

//Mis componentes
import DialogoMensaje from "@Componentes/MiDialogoMensaje";

//Recursos
import logo from '../../_Resources/imagenes/logo.png';

//Icons
import MdiIcon from "@mdi/react";
import { mdiGoogle, mdiFacebook, mdiTwitter, mdiGithubCircle } from "@mdi/js";

class PanelLogin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() { }

  onBotonGoogleClick = async () => {
    try {
      this.setState({ cargando: true });
      var provider = new window.firebase.auth.GoogleAuthProvider();
      await window.firebase.auth().signInWithPopup(provider);
      this.setState({ cargando: false, error: undefined });
    } catch (ex) {
      console.log("Error logeando", ex);
      this.setState({ cargando: false });

      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.mostrarDialogoMensaje({ titulo: "Error procesando la solicitud", mensaje: mensaje });
    }
  };

  onBotonFacebookClick = async () => {
    try {
      this.setState({ cargando: true });
      var provider = new window.firebase.auth.FacebookAuthProvider();
      await window.firebase.auth().signInWithPopup(provider);
      this.setState({ cargando: false });
    } catch (ex) {
      console.log("Error logeando", ex);
      this.setState({ cargando: false });

      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.mostrarDialogoMensaje({ titulo: "Error procesando la solicitud", mensaje: mensaje });
    }
  };

  onBotonTwitterClick = async () => {
    try {
      this.setState({ cargando: true });
      var provider = new window.firebase.auth.TwitterAuthProvider();
      await window.firebase.auth().signInWithPopup(provider);
      this.setState({ cargando: false });
    } catch (ex) {
      console.log("Error logeando", ex);
      this.setState({ cargando: false });

      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.mostrarDialogoMensaje({ titulo: "Error procesando la solicitud", mensaje: mensaje });
    }
  };

  onBotonGitHubClick = async () => {
    try {
      this.setState({ cargando: true });
      var provider = new window.firebase.auth.GithubAuthProvider();
      await window.firebase.auth().signInWithPopup(provider);
      this.setState({ cargando: false });
    } catch (ex) {
      console.log("Error logeando", ex);
      this.setState({ cargando: false });

      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.mostrarDialogoMensaje({ titulo: "Error procesando la solicitud", mensaje: mensaje });
    }
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
    const { classes } = this.props;
    const { cargando } = this.state;

    return (
      <div className={classes.root}>

        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <img
            src={logo}
            style={{ maxWidth: "100%", objectFit: "contain", maxHeight: 100 }}
          />
        </div>

        <Typography variant="h5" style={{ textAlign: "center" }}>
          Debe iniciar sesion para continuar
        </Typography>
        <div className="botones">
          <Button
            style={{ backgroundColor: '#4285F4', color: 'white' }}
            className="boton" variant="outlined" size="small" onClick={this.onBotonGoogleClick}>
            <MdiIcon path={mdiGoogle} title="Google" size={1} style={{ marginRight: 8 }} color="white" />
            <div style={{ width: 80 }}>
              Google
            </div>
          </Button>
          <Button
            style={{ backgroundColor: '#4267B2', color: 'white' }}
            className="boton" variant="outlined" size="small" onClick={this.onBotonFacebookClick}>
            <MdiIcon path={mdiFacebook} title="Facebook" size={1} style={{ marginRight: 8 }} color="white" />
            <div style={{ width: 80 }}>
              Facebook
            </div>
          </Button>
          <Button
            style={{ backgroundColor: '#1DA1F2', color: 'white' }}
            className="boton" variant="outlined" size="small" onClick={this.onBotonTwitterClick}>
            <MdiIcon path={mdiTwitter} title="Twitter" size={1} style={{ marginRight: 8 }} color="white" />
            <div style={{ width: 80 }}>
              Twitter
            </div>
          </Button>

          <Button
            style={{ backgroundColor: '#24292e', color: 'white' }}
            className="boton" variant="outlined" size="small" onClick={this.onBotonGitHubClick}>
            <MdiIcon path={mdiGithubCircle} title="GitHub" size={1} style={{ marginRight: 8 }} color="white" />
            <div style={{ width: 80 }}>
              GitHub
            </div>
          </Button>
        </div>

        <div className={classNames(classes.contenedorCargando, cargando == true && "visible")}>
          <CircularProgress />
        </div>

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
      </div>
    );
  }
}

let componente = PanelLogin;
componente = withStyles(styles)(componente);
export default componente;
