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
import memoize from "memoize-one";
import _ from "lodash";

//Mis componentes
import MiPagina from "@UI/_MiPagina";

//Icons
import MdiIcon from "@mdi/react";
import { mdiQrcodeScan } from "@mdi/js";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    data: state.Data.data,
    dataCargando: state.Data.cargando,
    dataReady: state.Data.ready
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

  onEventoClick = data => {
    this.props.redirect("/Evento/" + data.id);
  };

  onBotonScanClick = () => {
    this.props.redirect("/ScanQR");
  };

  getEventos = memoize(data => {
    data = data || {};
    let eventos = data.eventos || [];
    return _.filter(eventos, x => x.inscripto == true);
  });

  render() {
    const { classes, data, dataReady, dataCargando } = this.props;
    const eventos = this.getEventos(data);

    return (
      <MiPagina cargando={dataCargando || false} toolbarLeftIconVisible={false}>
        {/* Sin eventos */}
        {dataReady == true && eventos != undefined && eventos.length == 0 && (
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
        {dataReady == true && eventos != undefined && eventos.length != 0 && (
          <div>
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
                    <Typography>{evento.nombre}</Typography>
                  </Card>
                );
              })}

            {/* Boton escanear */}
            <Fab color="primary" onClick={this.onBotonScanClick} style={{ position: "absolute", right: 16, bottom: 16 }}>
              <MdiIcon path={mdiQrcodeScan} title="Escanear código QR" size={1} color="white" />
            </Fab>
          </div>
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
