import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from '@Componentes/MiDialogoMensaje';

//Icons
import MdiIcon from '@mdi/react'
import { mdiQrcodeScan } from '@mdi/js';

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

class Inicio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: undefined,
      cargando: true
    };
  }

  componentDidMount() {
    this.buscarDatos();
  }

  buscarDatos = async () => {
    try {
      this.setState({
        data: undefined,
        cargando: true
      });

      var db = window.firebase.firestore();

      let data = await db
        .collection("evento")
        .where("inscriptos." + this.props.usuario.uid, "==", true)
        .get();

      let docs = data.docs.map(x => {
        return x.data();
      });

      this.setState({ data: docs, cargando: false });
    } catch (ex) {
      this.setState({ cargando: false, data: undefined });

      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.mostrarDialogoMensaje({
        autoCerrar: false,
        botonSiMensaje: 'Reintenar',
        onBotonSiClick: () => {
          this.setState({ cargando: true });
          setTimeout(() => {
            this.buscarDatos();
          }, 400);
        },
        mensaje: mensaje
      });
    }
  };

  onEventoClick = data => {
    this.props.redirect("/Evento/" + data.id);
  };

  onBotonScanClick = () => {
    this.props.redirect('/ScanQR');
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
    const { classes } = this.props;
    const { data } = this.state;

    return (
      <MiPagina
        cargando={this.state.cargando || false}
        toolbarLeftIconVisible={false}>

        <input type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={(ref) => {
            this.filePicker = ref;
          }}
          onChange={this.onFile} />


        {data && data.length == 0 && (
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


        {data && data.length != 0 && (
          <div>
            {data && data.map((evento, index) => {
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


            <Fab
              color="primary"
              onClick={this.onBotonScanClick}
              style={{ position: 'absolute', right: 16, bottom: 16 }}>

              <MdiIcon path={mdiQrcodeScan}
                title="Escanear código QR"
                size={1}
                color="white"
              />

            </Fab>

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

let componente = Inicio;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
