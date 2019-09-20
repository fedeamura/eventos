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
import memoize from 'memoize-one';
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

class ActividadSorteo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idEvento: props.match.params.idEvento,
      idActividad: props.match.params.idActividad,
      cargando: false
    };
  }

  componentWillReceiveProps(nextProps) {
    let idEvento = nextProps.match.params.idEvento;
    let idActividad = nextProps.match.params.idActividad;
    if (idEvento != this.state.idEvento) {
      this.setState({ idEvento });
    }

    if (idActividad != this.state.idActividad) {
      this.setState({ idActividad });
    }
  }

  onSorteoClick = async () => {
    try {
      const { idEvento, idActividad } = this.state;

      this.setState({ cargando: true });

      var db = window.firebase.firestore();

      let doc = await db
        .collection('info')
        .doc('inscripciones')
        .collection('porUsuario')
        .where(idEvento + '.' + idActividad, '==', true).get()

      let data = doc.docs.map(x => {
        return x.data().usuario;
      });
      if (data.length == 0) {
        this.setState({ cargando: false });
        return;
      }

      var ganador = data[Math.floor(Math.random() * data.length)];
      await db
        .collection("info")
        .doc('eventos')
        .update({
          [`info.${idEvento}.actividades.${idActividad}.ganadorSorteo`]: { uid: ganador.uid, nombre: ganador.nombre, photoURL: ganador.photoURL }
        });

      this.setState({ cargando: false });
    } catch (ex) {
      let mensaje = typeof ex === "object" ? ex.message : ex;
      this.setState({ error: mensaje, cargando: false });
    }
  };

  getActividad = memoize((data, idEvento, idActividad) => {
    data = data || {};
    let eventos = data.eventos || [];
    let evento = _.find(eventos, (x) => x.id == idEvento);
    if (evento == undefined) return undefined;

    let actividades = evento.actividades || [];
    return _.find(actividades, (x) => x.id == idActividad);
  });

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
    const { idEvento, idActividad, cargando } = this.state;
    const { data, dataCargando, dataReady } = this.props;

    let actividad = this.getActividad(data, idEvento, idActividad);

    return (
      <MiPagina
        cargando={dataCargando || false}
        toolbarTitulo="Sorteo" toolbarLeftIconVisible={true}>

        {/* Info lista */}
        {dataReady == true && (

          <React.Fragment>

            {cargando == true && (
              <Typography>Realizando sorteo...</Typography>
            )}

            {cargando == false && (
              <React.Fragment>
                {/* No existe la actividad */}
                {actividad == undefined && (
                  <React.Fragment>
                    <Typography>La actividad indicada no existe</Typography>
                  </React.Fragment>
                )}

                {/* Hay actividad */}
                {actividad && (
                  <React.Fragment>
                    <Typography variant="h5">{actividad.nombre}</Typography>
                    <Typography variant="body2">{actividad.descripcion}</Typography>

                    <Card style={{ padding: 16, marginTop: 16, borderRadius: 16 }}>
                      <Typography variant="subtitle2">Ganador del sorteo</Typography>
                      {actividad.ganadorSorteo == undefined && <Typography>Aun nadie</Typography>}
                      {actividad.ganadorSorteo && <Typography>{actividad.ganadorSorteo.nombre}</Typography>}
                    </Card>
                    <Button onClick={this.onSorteoClick} style={{ marginTop: 16 }} variant="contained" color="primary">
                      Realizar sorteo
                </Button>
                  </React.Fragment>
                )}
              </React.Fragment>
            )}

          </React.Fragment>
        )}

        {/* Dialogo mensaje */}
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

let componente = ActividadSorteo;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
