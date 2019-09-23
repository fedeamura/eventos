import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import Typography from "@material-ui/core/Typography";
import memoize from 'memoize-one';
import _ from 'lodash';

//componentes
import Card from '@material-ui/core/Card';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Checkbox from '@material-ui/core/Checkbox';

//Mis componentes
import MiPagina from "@UI/_MiPagina";

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

class Evento extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.id,
    };
  }

  componentWillReceiveProps(nextProps) {
    let id = nextProps.match.params.id;
    if (id != this.state.id) {
      this.setState({ id });
    }
  }

  onActividadClick = a => {
    this.props.redirect("/Actividad/" + this.state.id + "/" + a.id);
  };

  getEvento = memoize((data, id) => {
    data = data || {};
    let eventos = data.eventos || [];
    return _.find(eventos, (x) => x.id == id);
  })

  render() {
    const { data, dataCargando, dataReady } = this.props;
    const { id } = this.state;

    let evento = this.getEvento(data, id);

    return (
      <MiPagina
        cargando={dataCargando || false}
        toolbarTitulo="Evento" toolbarLeftIconVisible={true}>

        {/* Cargue los eventos  */}
        {dataReady && (
          <React.Fragment>

            {/* Evento no existente  */}
            {evento == undefined && (
              <Typography>No existe</Typography>
            )}

            {/* Evento existente */}
            {evento && (
              <React.Fragment>
                <Typography variant="h5">{evento.nombre}</Typography>
                <Typography variant="body2">{evento.descripcion}</Typography>

                {/* Actividades  */}
                {evento.actividades && Object.keys(evento.actividades).length != 0 && (
                  <Card style={{ marginTop: 16, borderRadius: 16 }}>
                    <Typography style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }} variant="subtitle2">Actividades</Typography>
                    <List>
                      {Object.keys(evento.actividades || {}).map((key) => {
                        let actividad = (evento.actividades || {})[key];

                        return (
                          <ListItem
                            key={key}
                            button
                            onClick={() => {
                              this.onActividadClick(actividad);
                            }}
                          >
                            <ListItemText primary={actividad.nombre}></ListItemText>
                            <ListItemSecondaryAction>
                              <Checkbox checked={actividad.inscripto == true} />
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Card>
                )}

              </React.Fragment>
            )}
          </React.Fragment>
        )}

      </MiPagina>
    );
  }
}

let componente = Evento;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
