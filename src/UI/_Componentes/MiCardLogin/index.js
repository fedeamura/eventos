import React from "react";

//Styles
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import styles from "./styles";

//Router
import { withRouter } from "react-router-dom";

//REDUX
import { connect } from "react-redux";
import { push } from "connected-react-router";

//Compontentes
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";

//Mis componentes
import MiCard from "@Componentes/MiCard";

const mapDispatchToProps = dispatch => ({
  redireccionar: url => {
    dispatch(push(url));
  }
});

const mapStateToProps = state => {
  return {};
};

class MiCardLogin extends React.PureComponent {
  onBotonContactoClick = () => {
    this.props.redireccionar("/Contacto");
  };

  onBotonAyudaClick = () => {
    window.location.href = window.Config.URL_AYUDA;
  };

  render() {
    const { classes } = this.props;

    let headerVisible = !"headerVisible" in this.props || this.props.headerVisible != false;
    return (
      <MiCard
        padding={false}
        styleCardContent={this.props.styleCardContent}
        styleRoot={this.props.styleRoot}
        rootClassName={classNames(
          classes.cardRoot,
          this.props.rootClassName,
          this.props.modoApp == true && "modoApp",
          this.props.visible && "visible"
        )}
        className={classNames(classes.cardContent)}
        footer={this.renderFooter()}
      >
        <LinearProgress className={classNames(classes.progress, this.props.cargando && "visible")} style={this.props.styleCargando} />

        {headerVisible == true && (
          <div className={classes.header}>
            <div className={classes.imagenLogoMuni} />
            <div className={classes.imagenLogoMuniOnline} />
          </div>
        )}

        {this.renderContent()}
        <div className={classNames(classes.overlayCargando, this.props.cargando && "visible")} />
      </MiCard>
    );
  }

  renderContent() {
    const { classes } = this.props;

    return <div className={classes.root}>{this.props.children}</div>;
  }

  renderFooter() {
    const { classes } = this.props;
    if (this.props.modoApp == true) return null;

    return (
      <div className={classes.footerInfo}>
        <Typography variant="body2" className="link" onClick={this.onBotonAyudaClick}>
          Ayuda
        </Typography>
        <div className="separador" />
        <Typography variant="body2" className="link" onClick={this.onBotonContactoClick}>
          Contacto
        </Typography>
      </div>
    );
  }
}

let componente = MiCardLogin;
componente = withStyles(styles)(componente);
componente = withRouter(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
export default componente;
