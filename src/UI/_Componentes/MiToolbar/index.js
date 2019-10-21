import React from "react";

//Styles
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import styles from "./styles";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Componentes
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Avatar from "@material-ui/core/Avatar";
import LinearProgress from "@material-ui/core/LinearProgress";
import IconChevronRightOutlined from "@material-ui/icons/ChevronRightOutlined";

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario
  };
};

const mapDispatchToProps = dispatch => {
  return {
    redirigir: url => {
      dispatch(push(url));
    }
  };
};

class MiToolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorPopupUsuario: undefined
    };
  }

  componentDidMount() {}

  onUsuarioPress = event => {
    if (this.props.cargando) return;
    this.setState({ anchorPopupUsuario: event.currentTarget });
  };

  onUsuarioMenuClose = () => {
    if (this.props.cargando) return;
    this.setState({ anchorPopupUsuario: null });
  };

  onBotonCerrarSesionPress = () => {
    if (this.props.cargando) return;
    this.setState({ anchorPopupUsuario: null });
    this.props.onCerrarSesionClick && this.props.onCerrarSesionClick();
  };

  render() {
    let { classes, titulo, usuario, subtitulo, mostrarUsuario, breadcrumbs } = this.props;

    mostrarUsuario = mostrarUsuario == undefined || mostrarUsuario != false;

    return (
      <AppBar position="absolute" className={classNames(classes.appBar)}>
        <Toolbar disableGutters={true} className={classNames(classes.toolbar, this.props.className)}>
          {this.props.renderLeftIcon !== undefined && this.props.renderLeftIcon()}

          {this.props.leftIconVisible == true && (
            <React.Fragment>
              {this.props.renderLeftIcon === undefined && this.props.leftIcon !== undefined && (
                <IconButton
                  className={this.props.leftIconClassName}
                  color="inherit"
                  aria-label={this.props.leftIconHint || "Boton del toolbar"}
                  onClick={this.props.leftIconClick}
                >
                  {this.props.leftIcon}
                </IconButton>
              )}
            </React.Fragment>
          )}

          {/* Logo muni */}
          {this.props.renderLogo}

          {/* Cuerpo */}
          <div className={classes.contenedorCuerpo}>
            <div className={classes.contenedorTitulo}>
              <Typography
                variant="h6"
                color="inherit"
                className={"titulo"}
                noWrap
                onClick={this.props.onTituloClick}
                style={{ cursor: "pointer" }}
              >
                {titulo}
              </Typography>
              {subtitulo && (
                <Typography className="subtitulo" variant="subtitle1" color="inherit" noWrap>
                  {subtitulo}
                </Typography>
              )}
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length != 0 && (
              <div className={classes.contenedorBreadcrumbs}>
                {breadcrumbs.map((bread, index) => {
                  return (
                    <div className="breadcrumb">
                      <Typography variant="subtitle1" className="texto" noWrap>
                        {bread.texto}
                      </Typography>
                      {index != breadcrumbs.length - 1 && <IconChevronRightOutlined className="icono" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {this.props.children}

          {/* Icono del usuario */}
          {mostrarUsuario && usuario && (
            <IconButton onClick={this.onUsuarioPress} className={classes.botonUsuario} color="inherit">
              <Avatar alt="Menu del usuario" src={this.props.usuario.photoURL} className={classNames(classes.icono)} />
            </IconButton>
          )}
        </Toolbar>

        {mostrarUsuario && usuario && (
          <Menu
            id="simple-menu"
            anchorEl={this.state.anchorPopupUsuario}
            getContentAnchorEl={null}
            className={classes.menuUsuario}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={Boolean(this.state.anchorPopupUsuario)}
            onClose={this.onUsuarioMenuClose}
          >
            <div className={classes.menuUsuarioInfo} style={{ display: "flex", minWidth: 200, maxWidth: 300 }}>
              <Avatar alt="Menu del usuario" src={this.props.usuario.photoURL} className={classNames(classes.icono)} />
              <Typography align="center" variant="subtitle1" color="inherit">
                {this.props.usuario.nombre}
              </Typography>
            </div>

            <MenuItem onClick={this.onBotonCerrarSesionPress}>Cerrar sesión</MenuItem>
          </Menu>
        )}

        <div className={classNames(classes.contenedorCargando, this.props.cargando === true && classes.contenedorCargandoVisible)}>
          <LinearProgress color="secondary" />
        </div>
      </AppBar>
    );
  }
}

let componente = undefined;
componente = withStyles(styles)(MiToolbar);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
