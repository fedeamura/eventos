import React from "react";

//Styles
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import styles from "./styles";

//Componentes
import Typography from "@material-ui/core/Typography";

//Iconos
import IconChevronRightOutlined from "@material-ui/icons/ChevronRightOutlined";

//Mis componentes
import MiToolbar from "../MiToolbar";

class MiPagina extends React.PureComponent {
  onBreadcrumbClick = e => {
    var url = e.currentTarget.attributes["data-url"].value;
    if (url == "") return;
    this.props.onBreadcrumbClick && this.props.onBreadcrumbClick(url);
  };

  render() {
    let { classes, breadcrumbs } = this.props;

    return (
      <React.Fragment>
        <div className={classes.root}>
          <MiToolbar
            leftIconClick={this.props.toolbarLeftIconClick}
            leftIcon={this.props.toolbarLeftIcon}
            leftIconClassName={this.props.toolbarLeftIconClassName}
            leftIconVisible={this.props.toolbarLeftIconVisible}
            breadcrumbs={this.props.toolbarBreadcrumbs || []}
            cargando={this.props.cargando}
            className={this.props.toolbarClassName}
            renderLogo={this.props.toolbarRenderLogo}
            titulo={this.props.toolbarTitulo}
            subtitulo={this.props.toolbarSubtitulo}
            onTituloClick={this.props.onToolbarTituloClick}
            mostrarUsuario={this.props.toolbarMostrarUsuario}
            onCerrarSesionClick={this.props.onToolbarCerrarSesionClick}
          >
            {this.props.toolbarChildren}
          </MiToolbar>

          {/* Contenido */}
          <div className={classes.main}>
            <div className={classes.separadorToolbar} />

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length != 0 && (
              <div className={classes.contenedorBreadcrumbs}>
                {breadcrumbs.map((bread, index) => {
                  return (
                    <div key={index} className="breadcrumb" data-url={bread.url || ""} onClick={this.onBreadcrumbClick}>
                      <div className="textos">
                        <Typography variant="caption" className="texto" noWrap style={{ fontWeight: 500 }}>
                          {bread.titulo}
                        </Typography>
                        <Typography variant="caption" className="texto" noWrap>
                          {bread.texto}
                        </Typography>
                      </div>

                      {index != breadcrumbs.length - 1 && <IconChevronRightOutlined className="icono" />}
                    </div>
                  );
                })}
              </div>
            )}

            <div className={classNames(classes.content, this.props.contentClassName)}>{this.props.children}</div>
          </div>

          <div
            className={classNames(classes.contentOverlayCargando, this.props.cargando == true && classes.contentOverlayCargandoVisible)}
          />
        </div>
      </React.Fragment>
    );
  }
}

let componente = MiPagina;
componente = withStyles(styles)(componente);
export default componente;
