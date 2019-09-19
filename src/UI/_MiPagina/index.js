import React from "react";

//Styles
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import styles from "./styles";

//Router
import { withRouter } from "react-router-dom";

//REDUX
import { connect } from "react-redux";
import { goBack, push } from "connected-react-router";
import { cerrarSesion } from "@Redux/Actions/usuario";

//Iconos
import IconArrowBackOutlined from "@material-ui/icons/ArrowBackOutlined";

//Mis componentes
import MiPagina from "@Componentes/MiPagina";
import MiContent from "@Componentes/MiContent";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario
  };
};

const mapDispatchToProps = dispatch => ({
  goBack: () => {
    dispatch(goBack());
  },
  redirigir: url => {
    dispatch(push(url));
  },
  cerrarSesion: () => {
    dispatch(cerrarSesion());
  }
});

class _MiPagina extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  onToolbarTituloClick = () => {
    this.props.redirigir("/");
  };

  onCerrarSesionClick = () => {
    window.firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.cerrarSesion();
      })
      .catch(() => {});
  };

  onBreadcrumbClick = url => {
    this.props.redirigir(url);
  };

  render() {
    const { classes } = this.props;

    let toolbarLeftIconVisible = this.props.toolbarLeftIconVisible !== false;
    let toolbarLeftIcon = undefined;
    if (toolbarLeftIconVisible === true) {
      toolbarLeftIcon = this.props.toolbarLeftIcon || <IconArrowBackOutlined style={{ fontSize: 16 }} />;
    }

    return (
      <React.Fragment>
        <MiPagina
          cargando={this.props.cargando}
          onBreadcrumbClick={this.onBreadcrumbClick}
          toolbarTitulo={this.props.toolbarTitulo || window.Config.NOMBRE_SISTEMA}
          toolbarSubtitulo={this.props.toolbarSubtitulo || ""}
          toolbarBreadcrumbs={this.props.toolbarBreadcrumbs || []}
          breadcrumbs={this.props.breadcrumbs || []}
          toolbarClassName={classes.toolbar}
          toolbarLeftIcon={toolbarLeftIcon}
          toolbarLeftIconClick={this.props.toolbarLeftIconClick || this.props.goBack}
          toolbarLeftIconVisible={this.props.toolbarLeftIconVisible}
          toolbarChildren={this.props.toolbarChildren}
          onToolbarTituloClick={this.props.onToolbarTituloClick || this.onToolbarTituloClick}
          onToolbarCerrarSesionClick={this.onCerrarSesionClick}
          contentClassName={classNames(classes.paginaContent, this.props.contentClassName)}
        >
          <MiContent
            rootClassName={classNames(classes.miContentRootClassName, this.props.miContentRootClassName)}
            contentClassName={classNames(classes.miContentContentClassName, this.props.miContentContentClassName)}
            full={this.props.full || false}
          >
            {this.props.children}
          </MiContent>
        </MiPagina>
      </React.Fragment>
    );
  }
}

let componente = _MiPagina;
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
componente = withStyles(styles)(componente);
componente = withWidth()(componente);
componente = withRouter(componente);
export default componente;
