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
import memoize from "memoize-one";
import _ from "lodash";

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

  onBotonBackClick = () => {
    this.props.redirect("/Evento/" + this.state.idEvento);
  };

  getEvento = memoize((data, idEvento) => {
    data = data || {};
    let eventos = data.eventos || [];
    return _.find(eventos, x => x.id == idEvento);
  });

  getActividad = memoize((data, idEvento, idActividad) => {
    data = data || {};
    let eventos = data.eventos || [];
    let evento = _.find(eventos, x => x.id == idEvento);
    if (evento == undefined) return undefined;

    let actividades = evento.actividades || [];
    return _.find(actividades, x => x.id == idActividad);
  });

  render() {
    const { usuario, data, dataCargando, dataReady } = this.props;
    const { idEvento, idActividad } = this.state;

    const evento = this.getEvento(data, idEvento);
    const actividad = this.getActividad(data, idEvento, idActividad);

    return (
      <MiPagina
        cargando={dataCargando || false}
        toolbarTitulo={evento ? evento.nombre : "..."}
        toolbarLeftIconVisible={true}
        toolbarLeftIconClick={this.onBotonBackClick}
      >
        {dataReady == true && (
          <React.Fragment>
            {/* La actividad no existe */}
            {actividad == undefined && <Typography>La actividad no existe </Typography>}

            {/* La actividad existe */}
            {actividad && (
              <React.Fragment>
                <div style={{ width: "100%" }}>
                  <img src={evento.logo} style={{ maxWidth: "100%", objectFit: "contain", maxHeight: 100, marginBottom: 16 }} />
                </div>

                <div
                  style={{
                    display: "flex",
                    padding: 8,
                    alignItems: "center",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: 16,
                    width: "fit-content",
                    marginBottom: 16
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 16, backgroundColor: actividad.color, marginRight: 8 }} />
                  <Typography>{actividad.grupo}</Typography>
                </div>

                {/* Info de la actividad */}
                <Typography variant="h5">{actividad.nombre}</Typography>
                <Typography variant="body2">{actividad.descripcion}</Typography>

                {/* Inscripto  */}
                <div style={{ marginTop: 16 }} />

                {actividad.inscripto == true && <Typography>Te inscribiste a esta actividad</Typography>}

                {actividad.inscripto != true && <Typography>No estás inscripto en esta actividad</Typography>}
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
