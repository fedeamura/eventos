import React from "react";

//Styles
import classNames from "classnames";
import { withStyles, withTheme } from "@material-ui/core/styles";
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

//Icons
import MdiIcon from "@mdi/react";
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { Typography, IconButton } from "../../../node_modules/@material-ui/core";

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

  onToolbarLeftIconClick = () => {
    const { onToolbarLeftIconClick } = this.props;
    if (onToolbarLeftIconClick) {
      onToolbarLeftIconClick();
    } else {
      this.props.goBack();
    }
  }

  onToolbarTituloClick = () => {
    const { onToolbarTituloClick } = this.props;
    if (onToolbarTituloClick) {
      onToolbarTituloClick();
    } else {
      this.props.redirigir("/");
    }
  };

  onCerrarSesionClick = () => {
    window.firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.cerrarSesion();
      })
      .catch(() => { });
  };

  onBreadcrumbClick = url => {
    this.props.redirigir(url);
  };

  render() {
    const { classes } = this.props;


    return (
      <React.Fragment>
        <MiPagina
          cargando={this.props.cargando}
          onBreadcrumbClick={this.onBreadcrumbClick}
          toolbarBreadcrumbs={this.props.toolbarBreadcrumbs || []}
          breadcrumbs={this.props.breadcrumbs || []}
          toolbarClassName={classes.toolbar}
          toolbarLeftIconRender={this.renderLeftIcon()}
          toolbarChildren={this.renderChildren()}
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

  renderLeftIcon = () => {
    const { toolbarLeftIcon, toolbarLeftIconVisible } = this.props;

    if (toolbarLeftIconVisible == true) {
      let icon = toolbarLeftIcon || <IconArrowBackOutlined style={{ fontSize: 16 }} />;
      return (
        <IconButton onClick={this.onToolbarLeftIconClick}>
          {icon}
        </IconButton>
      );
    } else {
      return (
        <IconButton style={{ opacity: 0, pointerEvents: 'none' }}>
          <IconArrowBackOutlined style={{ fontSize: 16 }} />
        </IconButton>
      );
    }
  }

  renderChildren = () => {
    const { toolbarChildren, classes, theme } = this.props;
    return (
      <div
        className={classes.children}
        onClick={this.onToolbarTituloClick}
      >
        <MdiIcon
          className={"icono"}
          path={mdiCheckboxMarkedCircle} title="Logo" size={1} color={theme.palette.primary.main} />

        <Typography
          variant="h6"
          color="inherit"
          className={"titulo"}
          noWrap
        >
          {window.Config.NOMBRE_SISTEMA}
        </Typography>

        {toolbarChildren}
      </div>
    );
  }
}

let componente = _MiPagina;
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
componente = withStyles(styles)(componente);
componente = withTheme(componente);
componente = withWidth()(componente);
componente = withRouter(componente);
export default componente;
