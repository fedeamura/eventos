import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import Typography from "@material-ui/core/Typography";
import memoize from "memoize-one";
import _ from "lodash";

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import Header from "@UI/_Header";
import Footer from "@UI/_Footer";

//Iconos
import IconCheckBox from "@material-ui/icons/CheckBox";
import IconCheckBoxBlank from "@material-ui/icons/CheckBoxOutlineBlank";
import { green } from "@material-ui/core/colors";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    eventos: state.Eventos.data,
    eventosReady: state.Eventos.ready,
    eventosCargando: state.Eventos.cargando,
    inscripciones: state.Usuario.inscripciones
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
    if (data == undefined || idEvento == undefined) return undefined;
    return _.find(data, x => x.id == idEvento);
  });

  getActividad = memoize((data, idEvento, idActividad) => {
    let evento = this.getEvento(data, idEvento);
    if (evento == undefined) return undefined;

    let actividades = evento.actividades || [];
    return _.find(actividades, x => x.id == idActividad);
  });

  estaInscriptoEnActividad = memoize((inscripciones, idEvento, idActividad) => {
    if (inscripciones == undefined || idEvento == undefined || idActividad == undefined) return false;

    let inscripcionesDeEvento = inscripciones[idEvento];
    if (inscripcionesDeEvento == undefined) return false;
    return inscripcionesDeEvento.indexOf(idActividad) != -1;
  });

  render() {
    const { eventos, eventosReady, eventosCargando, inscripciones } = this.props;
    const { idEvento, idActividad } = this.state;

    const evento = this.getEvento(eventos, idEvento);
    if (evento && evento.conActividades == false) {
      console.log("lalala");

      this.props.redirect("/Evento" + idEvento);
    }
    const actividad = this.getActividad(eventos, idEvento, idActividad);
    const estaInscripto = this.estaInscriptoEnActividad(inscripciones, idEvento, idActividad);

    return (
      <MiPagina
        cargando={eventosCargando || false}
        toolbarSubtitulo={evento ? evento.nombre : "..."}
        toolbarLeftIconVisible={true}
        toolbarLeftIconClick={this.onBotonBackClick}
      >
        {eventosReady == true && (
          <React.Fragment>
            {/* La actividad no existe */}
            {actividad == undefined && <Typography>La actividad no existe </Typography>}

            {/* La actividad existe */}
            {actividad && (
              <React.Fragment>
                <Header evento={evento} />

                {(actividad.grupo || "").trim() != "" && (
                  <div
                    style={{
                      marginTop: 32,
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
                )}

                {/* Info de la actividad */}
                <Typography variant="h5">{actividad.nombre}</Typography>
                <Typography variant="body2">{actividad.descripcion}</Typography>

                {/* Inscripto  */}
                <div style={{ marginTop: 16 }} />

                {estaInscripto == true && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconCheckBox style={{ marginRight: 8, color: "rgba(0,0,0,0.5)" }} />
                    <Typography style={{ color: "rgba(0,0,0,0.5)" }}>Te inscribiste a esta actividad</Typography>
                  </div>
                )}

                {estaInscripto != true && (
                  <div style={{ display: "flex" }}>
                    <IconCheckBoxBlank style={{ marginRight: 8, color: "rgba(0,0,0,0.5)" }} />
                    <Typography style={{ color: "rgba(0,0,0,0.5)" }}>No estás inscripto en esta actividad</Typography>
                  </div>
                )}

                <Footer evento={evento} />
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
