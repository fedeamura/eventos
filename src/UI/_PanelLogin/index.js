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

class PanelLogin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

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
        {this.state.error && <Typography>{this.state.error}</Typography>}

        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <img
            src="http://oniet.ubp.edu.ar/wp-content/uploads/2018/10/logoonietubp.png"
            style={{ maxWidth: "100%", objectFit: "contain", maxHeight: 100 }}
          />
        </div>

        <Typography variant="h5" style={{ textAlign: "center" }}>
          Debe iniciar sesion para continuar
        </Typography>
        <div className="botones">
          <Button className="boton" variant="outlined" size="small" onClick={this.onBotonGoogleClick}>
            Google
          </Button>
          <Button className="boton" variant="outlined" size="small" onClick={this.onBotonFacebookClick}>
            Facebook
          </Button>
          <Button className="boton" variant="outlined" size="small" onClick={this.onBotonTwitterClick}>
            Twitter
          </Button>

          <Button className="boton" variant="outlined" size="small" onClick={this.onBotonGitHubClick}>
            GitHub
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
