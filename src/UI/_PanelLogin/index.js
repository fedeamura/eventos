import React from "react";

//Styles
import { withStyles } from "@material-ui/core/styles";
import styles from "./styles";
import { Typography, Button } from "@material-ui/core";

class PanelLogin extends React.Component {
  onBotonGoogleClick = () => {
    this.setState({ cargando: true });
    var provider = new window.firebase.auth.GoogleAuthProvider();
    window.firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        this.setState({ cargando: false });

        var token = result.credential.accessToken;
        var user = result.user;
        console.log("user", user);
      })
      .catch(function(error) {
        this.setState({ cargando: false });

        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log("Error", error);
      });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Typography variant="h5">Debe iniciar sesion para continuar</Typography>
        <div className="botones">
          <Button className="boton" variant="outlined" size="small" onClick={this.onBotonGoogleClick}>
            Google
          </Button>
          <Button className="boton" variant="outlined" size="small">
            Facebook
          </Button>
          <Button className="boton" variant="outlined" size="small">
            E-Mail
          </Button>
        </div>
      </div>
    );
  }
}

let componente = PanelLogin;
componente = withStyles(styles)(componente);
export default componente;
