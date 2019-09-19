import React from "react";

//Styles
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import styles from "./styles";

//Compontes
import _ from "lodash";
import { Typography, Grid, Button, TextField } from "@material-ui/core";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import LinearProgress from "@material-ui/core/LinearProgress";

//Mis componentes
import MiBaner from "../MiBaner";

class DialogoForm extends React.Component {
  constructor(props) {
    super(props);

    let inputs = {};

    Object.keys(props.inputs || {}).forEach((e, key) => {
      inputs[props.inputs[key].key] = props.inputs[key].value || "";
    });

    this.state = {
      inputs: inputs,
      mostrarBaner: props.mostrarBaner || false,
      textoBaner: props.textoBaner || ""
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible != this.props.visible && nextProps.visible) {
      let inputs = {};

      Object.keys(nextProps.inputs || {}).forEach((e, key) => {
        inputs[nextProps.inputs[key].key] = nextProps.inputs[key].value || "";
      });

      this.setState({ inputs: inputs });
    }
  }

  onClose = e => {
    this.props.onClose && this.props.onClose(e);
  };

  onChange = e => {
    this.setState({
      inputs: {
        ...this.state.inputs,
        [e.currentTarget.name]: e.currentTarget.value
      }
    });
  };

  onKeyPress = ev => {
    if (this.props.multiline == true) return;
    if (ev.key === "Enter") {
      ev.preventDefault();
      this.onBotonSiClick();
    }
  };

  onBotonNoClick = () => {
    this.props.onBotonNoClick && this.props.onBotonNoClick();
    let cerrar = !("autoCerrarBotonNo" in this.props) || this.props.autoCerrarBotonNo != false;
    cerrar && this.onClose();
  };

  onBotonSiClick = () => {
    this.props.onBotonSiClick && this.props.onBotonSiClick(this.state.inputs);
    let cerrar = !("autoCerrarBotonSi" in this.props) || this.props.autoCerrarBotonSi != false;
    cerrar && this.onClose();
  };

  render() {
    const { classes, inputs } = this.props;

    let botonNoVisible = !("botonNoVisible" in this.props) || this.props.botonNoVisible != false;
    let botonSiVisible = !("botonSiVisible" in this.props) || this.props.botonSiVisible != false;

    return (
      <React.Fragment>
        <Dialog open={this.props.visible} onClose={this.onClose} aria-labelledby="responsive-dialog-title">
          <MiBaner
            visible={this.props.mostrarBaner}
            mensaje={this.props.textoBaner}
            mostrarBoton={this.props.mostrarBotonBaner}
            modo={this.props.modoBaner || "error"}
            onBotonClick={this.props.onBotonBanerClick}
          />

          {this.props.titulo && <DialogTitle id="responsive-dialog-title">{this.props.titulo}</DialogTitle>}
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {this.props.mensaje && <Typography variant="body1">{this.props.mensaje}</Typography>}
              </Grid>
              {this.props.mensajeChildren != undefined && (
                <Grid item xs={12}>
                  {this.props.mensajeChildren}
                </Grid>
              )}
              {inputs &&
                inputs.map((input, index) => {
                  return (
                    <Grid item xs={12} key={index}>
                      {input.inputType != "radio" && (
                        <TextField
                          fullWidth
                          variant="outlined"
                          id={input.key}
                          label={input.label}
                          value={this.state.inputs[input.key] || ""}
                          name={input.key}
                          type={input.type || "text"}
                          autoComplete={input.autoComplete || "off"}
                          margin={input.margin || "dense"}
                          multiline={input.multiline || false}
                          onChange={this.onChange}
                          placeholder={input.placeholder}
                          onKeyPress={this.onKeyPress}
                        />
                      )}
                      {input.inputType == "radio" && (
                        <React.Fragment>
                          {input.label && <FormLabel component="legend">{input.label}</FormLabel>}
                          <RadioGroup name={input.key} value={this.state.inputs[input.key] || ""} onChange={this.onChange}>
                            {input.items.map((item, index) => {
                              return <FormControlLabel key={index} value={item.value} control={<Radio />} label={item.label} />;
                            })}
                          </RadioGroup>
                        </React.Fragment>
                      )}
                    </Grid>
                  );
                })}
            </Grid>
            {this.props.children}
          </DialogContent>
          <DialogActions>
            {botonNoVisible && <Button onClick={this.onBotonNoClick}>{this.props.textoNo || "No"}</Button>}
            {botonSiVisible && (
              <Button color="primary" onClick={this.onBotonSiClick}>
                {this.props.textoSi || "Si"}
              </Button>
            )}
          </DialogActions>

          <div className={classNames(classes.contentOverlayCargando, this.props.cargando && classes.contentOverlayCargandoVisible)} />

          <div className={classNames(classes.contenedorCargando, this.props.cargando === true && classes.contenedorCargandoVisible)}>
            <LinearProgress color="secondary" />
          </div>
        </Dialog>
      </React.Fragment>
    );
  }
}

let componente = DialogoForm;
componente = withStyles(styles)(componente);
export default componente;
