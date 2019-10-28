import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { setEventos as setEventosGestion, setInit as setEventosGestionInit } from "@Redux/Actions/gestion";

//Componentes
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import ButtonBase from "@material-ui/core/ButtonBase";
import Grid from "@material-ui/core/Grid";
import memoize from "memoize-one";
import _ from "lodash";

//Mis componentes
import MiPagina from "@UI/_MiPagina";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    eventos: state.Gestion.eventos,
    eventosCargando: state.Gestion.eventosCargando,
    eventosReady: state.Gestion.eventosReady
  };
};

const mapDispatchToProps = dispatch => ({
  redirect: url => {
    dispatch(push(url));
  },
  setEventosGestion: data => {
    dispatch(setEventosGestion(data));
  },
  setEventosGestionInit: () => {
    dispatch(setEventosGestionInit());
  }
});

class GestionPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.idEvento
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    let id = nextProps.match.params.id;
    if (id != this.state.id) {
      this.setState({ id });
    }
  }

  onBotonBackClick = () => {
    this.props.redirect("/Gestion");
  };

  onBotonSortearClick = () => {
    this.props.redirect("/Gestion/Sorteo/" + this.state.id);
  };

  onBotonInscriptosClick = () => {
    this.props.redirect("/Gestion/Inscriptos/" + this.state.id);
  };

  onBotonMensajeClick = () => {
    this.props.redirect("/Gestion/Mensajes/" + this.state.id);
  };

  render() {
    const { classes } = this.props;

    return (
      <MiPagina
        cargando={false}
        toolbarSubtitulo={"Panel de gestión"}
        toolbarLeftIconVisible={true}
        toolbarLeftIconClick={this.onBotonBackClick}
      >
        <Grid spacing={2} container>
          <Grid item xs={12} md={6}>
            <ButtonBase className={classes.boton} onClick={this.onBotonSortearClick}>
              <Typography>Sortear</Typography>
            </ButtonBase>
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonBase className={classes.boton} onClick={this.onBotonInscriptosClick}>
              <Typography>Inscriptos</Typography>
            </ButtonBase>
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonBase className={classes.boton} onClick={this.onBotonMensajeClick}>
              <Typography>Mensajes</Typography>
            </ButtonBase>
          </Grid>
        </Grid>
      </MiPagina>
    );
  }
}

let componente = GestionPanel;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
