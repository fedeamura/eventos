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
import memoize from 'memoize-one';
import _ from 'lodash';

//Colores
import green from "@material-ui/core/colors/green";

//Mis componentes
import MiPagina from "@UI/_MiPagina";

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

class Actividad extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idEvento: props.match.params.idEvento,
      idActividad: props.match.params.idActividad
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

  getActividad = memoize((data, idEvento, idActividad) => {
    data = data || {};
    let eventos = data.eventos || [];
    let evento = _.find(eventos, (x) => x.id == idEvento);
    if (evento == undefined) return undefined;

    let actividades = evento.actividades || [];
    return _.find(actividades, (x) => x.id == idActividad);
  });

  render() {
    const { usuario, data, dataCargando, dataReady } = this.props;
    const { idEvento, idActividad } = this.state;

    let actividad = this.getActividad(data, idEvento, idActividad);

    return (
      <MiPagina
        cargando={dataCargando || false}
        toolbarTitulo="Actividad" toolbarLeftIconVisible={true}>

        {dataReady == true && (
          <React.Fragment>


            {/* La actividad no existe */}
            {actividad == undefined && (
              <Typography>La actividad no existe </Typography>
            )}

            {/* La actividad existe */}
            {actividad && (
              <React.Fragment>

                {/* Ganador de la actividad */}
                {actividad.ganadorSorteo && actividad.ganadorSorteo.uid == usuario.uid && (
                  <Card style={{
                    borderRadius: 16,
                    padding: 16,
                    backgroundColor: green["500"],
                    marginBottom: 32
                  }}>
                    <Typography variant="body1" style={{ color: "white" }}>
                      ¡Ganaste el sorteo!
                    </Typography>
                    <Typography variant="body2" style={{ color: "white" }}>
                      Mostrá esta pantalla a algun disertante del evento para recibir tu premio
                    </Typography>
                  </Card>
                )}

                {/* Info de la actividad */}
                <Typography variant="h5">{actividad.nombre}</Typography>
                <Typography variant="body2">{actividad.descripcion}</Typography>


                {/* Inscripto  */}
                <div style={{ marginTop: 16 }} />

                {actividad.inscripto == true && (
                  <Typography>Te inscribiste a esta actividad</Typography>
                )}

                {actividad.inscripto != true && (
                  <Typography>No estás inscripto en esta actividad</Typography>
                )}

              </React.Fragment>
            )}

          </React.Fragment>
        )}

      </MiPagina>
    );
  }

}

let componente = Actividad;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
