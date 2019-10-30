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
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";

//Mis componentes
import MiPagina from "@UI/_MiPagina";

//Icons
import MdiIcon from "@mdi/react";
import { mdiQrcodeScan } from "@mdi/js";
import { ButtonBase } from "@material-ui/core";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    inscripciones: state.Usuario.inscripciones,
    eventos: state.Eventos.data,
    eventosCargando: state.Eventos.cargando,
    eventosReady: state.Eventos.ready,
  };
};

const mapDispatchToProps = dispatch => ({
  redirect: url => {
    dispatch(push(url));
  }
});

class Inicio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
  }

  onEventoClick = data => {
    this.props.redirect(data.id);
  };

  onBotonScanClick = () => {
    this.props.redirect("/ScanQR");
  };

  render() {
    const { classes, eventos, eventosReady, eventosCargando } = this.props;

    return (
      <MiPagina
        cargando={eventosCargando || false}
        toolbarLeftIconVisible={false}>

        {eventosReady && (

          <React.Fragment>

            {/* Sin eventos */}
            {(eventos == undefined || eventos.length == 0) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  justifyItems: "center",
                  flexDirection: "column"
                }}
              >
                <Typography variant="h5" style={{ textAlign: "center", margin: 16, marginBottom: 32, marginTop: 32 }}>
                  Escanéa alguno de los codigos QR para empezar
                </Typography>

                <Button variant="contained" color="primary" onClick={this.onBotonScanClick}>
                  Escanear
                </Button>
              </div>
            )}

            {/* Con eventos */}
            {eventos != undefined && eventos.length != 0 && (
              <div>
                <Typography variant="subtitle2" style={{ marginBottom: 16, marginLeft: 4 }}>
                  Eventos disponibles
                </Typography>
                {/* Listado de eventos */}
                {eventos &&
                  eventos.map((evento, index) => {
                    return (
                      <Card
                        key={index}
                        className={classes.evento}
                        onClick={() => {
                          this.onEventoClick(evento);
                        }}
                      >
                        <ButtonBase className="content">
                          <Typography>{evento.nombre}</Typography>
                        </ButtonBase>
                      </Card>
                    );
                  })}

                {/* Boton escanear */}
                <Fab
                  variant="extended"
                  color="primary" onClick={this.onBotonScanClick} style={{ position: "absolute", right: 16, bottom: 16 }}>
                  <MdiIcon path={mdiQrcodeScan} title="Escanear código QR" size={1} color="black" style={{ marginRight: 8 }} />
                  Escanear QR
                </Fab>
              </div>
            )}

          </React.Fragment>
        )}

      </MiPagina>
    );
  }
}

let componente = Inicio;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
