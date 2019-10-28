import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { setEventos as setEventosGestion, setInit as setEventosGestionInit } from '@Redux/Actions/gestion';

//Componentes
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import ButtonBase from "@material-ui/core/ButtonBase";
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

class Gestion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    try {

      if (this.props.eventos == undefined) {
        this.props.setEventosGestionInit();

        const db = window.firebase.firestore();
        let data = await db
          .collection('eventos')
          .where('roles.' + this.props.usuario.uid, '>=', 2)
          .get();


        let eventos = data.docs.map(x => x.data());
        this.props.setEventosGestion(eventos);
      }
    } catch (ex) {
      let mensaje = typeof ex === 'object' ? ex.message : ex;
      this.props.setEventosGestion(undefined);
    }
  }

  onEventoClick = (evento) => {
    this.props.redirect('/Gestion/Panel/' + evento.id)
  }

  getRolEnEvento = memoize((data, uid) => {
    if (data == undefined || uid == undefined) return undefined;
    let rol = (data.roles || {})[uid];
    if (rol == undefined) return undefined;
    if (rol == 1) return 'Operador';
    if (rol == 2) return 'Supervisor';
    if (rol == 3) return 'Administrador';
    return undefined;
  });

  render() {
    const { classes, usuario, eventos, eventosCargando, eventosReady } = this.props;

    return (
      <MiPagina
        cargando={eventosCargando || false}
        toolbarSubtitulo={"Gestion de eventos"}
        toolbarLeftIconVisible={true}
        toolbarLeftIconClick={this.onBotonBackClick}
      >
        {eventosReady && (

          <React.Fragment>

            {/* Sin eventos */}
            {eventos && eventos.length == 0 && (
              <Typography>No tiene el permiso necesario para gestionar ningun evento</Typography>
            )}


            {/* Listado de eventos */}
            {eventos && eventos.length != 0 &&
              eventos.map((evento, index) => {

                const rol = this.getRolEnEvento(evento, usuario.uid);

                return (
                  <Card
                    key={index}
                    className={classes.evento}
                    onClick={() => {
                      this.onEventoClick(evento);
                    }}
                  >
                    <ButtonBase className="content">
                      <div>

                        <Typography>{evento.nombre}</Typography>
                        {rol && (
                          <Typography variant="caption">{`Rol: ${rol}`}</Typography>
                        )}
                      </div>
                    </ButtonBase>
                  </Card>
                );
              })}
          </React.Fragment>
        )}

      </MiPagina>
    );
  }
}

let componente = Gestion;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
