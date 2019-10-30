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

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    evento: state.Evento.data,
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
      idActividad: props.match.params.idActividad
    };
  }

  onBotonBackClick = () => {
    const { evento } = this.props;
    this.props.redirect(`/${evento.id}`);
  };

  onTituloClick = () => {
    const { evento } = this.props;
    this.props.redirect(`/${evento.id}`);
  }

  getActividad = memoize((evento, idActividad) => {
    let actividades = evento.actividades || [];
    return _.find(actividades, x => x.id == idActividad);
  });

  estaInscriptoEnActividad = memoize((inscripciones, idActividad) => {
    if (inscripciones == undefined || idActividad == undefined) return false;
    return inscripciones.indexOf(idActividad) != -1;
  });

  render() {
    const { evento, inscripciones } = this.props;
    const { idActividad } = this.state;
    if (evento == undefined) return <div />;

    const actividad = this.getActividad(evento, idActividad);
    const estaInscripto = this.estaInscriptoEnActividad(inscripciones, idActividad);

    return (
      <MiPagina
        toolbarLeftIconVisible={true}
        onToolbarLeftIconClick={this.onBotonBackClick}
        onToolbarTituloClick={this.onTituloClick}
      >
        {evento && (
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
