import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import Typography from "@material-ui/core/Typography";

//componentes
import Card from '@material-ui/core/Card';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';

//Mis componentes
import MiPagina from "@UI/_MiPagina";
import DialogoMensaje from '@Componentes/MiDialogoMensaje';


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

class Evento extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.id,
      data: undefined,
      cargando: true
    };
  }

  componentDidMount() {
    this.buscarInfo();
  }

  buscarInfo = async () => {
    try {
      this.setState({ cargando: true, data: undefined });

      var db = window.firebase.firestore();
      let refEvento = db.collection("evento").doc(this.state.id);

      let doc = await refEvento.get();
      let data = doc.data();
      if (data == undefined) {
        this.setState({ cargando: false });
        this.mostrarDialogoMensaje({
          autoCerrar: false,
          mensaje: 'El evento indicado no existe.',
          botonNoVisible: true,
          botonNoMensaje: 'Volver',
          onBotonNoClick: () => {
            setTimeout(() => {
              this.props.redirect('/');
            }, 300)
          },
          botonSiMensaje: 'Reintentar',
          onBotonSiClick: () => {
            this.setState({ cargando: true });
            setTimeout(() => {
              this.buscarInfo();
            }, 300)
          }
        })
        return;
      }

      this.setState({ data, cargando: false });
    } catch (ex) {
      this.setState({ cargando: false });

      this.mostrarDialogoMensaje({
        autoCerrar: false,
        mensaje: 'Ocurrió un error. Por favor intente nuevamente',
        botonNoVisible: true,
        botonNoMensaje: 'Volver',
        onBotonNoClick: () => {
          setTimeout(() => {
            this.props.redirect('/');
          }, 300)
        },
        botonSiMensaje: 'Reintentar',
        onBotonSiClick: () => {
          this.setState({ cargando: true });
          setTimeout(() => {
            this.buscarInfo();
          }, 300)
        }
      })
    }
  };

  onActividadClick = a => {
    this.props.redirect("/Actividad/" + this.state.id + "/" + a.id);
  };

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
    const { data } = this.state;

    return (
      <MiPagina
        cargando={this.state.cargando || false}
        toolbarTitulo="Evento" toolbarLeftIconVisible={true}>

        {data && (
          <React.Fragment>
            <Typography variant="h5">{data.nombre}</Typography>
            <Typography variant="body2">{data.descripcion}</Typography>

            <Card style={{ marginTop: 16, borderRadius: 16 }}>
              <Typography style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }} variant="subtitle2">Actividades</Typography>
              <List>
                {(data.actividades || []).map((a, index) => {
                  return (
                    <ListItem
                      key={index}
                      button
                      onClick={() => {
                        this.onActividadClick(a);
                      }}
                    >
                      <ListItemText primary={a.nombre}></ListItemText>
                    </ListItem>
                  );
                })}
              </List>
            </Card>
          </React.Fragment>
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

let componente = Evento;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
