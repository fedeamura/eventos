import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//Componentes
import Typography from "@material-ui/core/Typography";

class Header extends React.PureComponent {
  render() {
    const { evento } = this.props;
    if (evento == undefined) return null;

    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={evento.logo} style={{ maxWidth: "100%", objectFit: "contain", maxHeight: 100, minHeight: 100, marginBottom: 16 }} />
        </div>

        {/* <Typography variant="h5">{evento.nombre}</Typography> */}
        <Typography style={{ textAlign: "center" }}>{evento.descripcion}</Typography>
      </div>
    );
  }
}

let componente = Header;
componente = withStyles(styles)(componente);
export default componente;
