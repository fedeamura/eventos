import React from "react";

//Styles
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

//Componentes
import memoize from "memoize-one";
import Tooltip from "@material-ui/core/Tooltip";

class Footer extends React.PureComponent {
  getSponsors = memoize(evento => {
    if (evento == undefined) return undefined;
    const sponsors = [];
    Object.keys(evento.sponsors || {}).forEach(x => {
      sponsors.push(evento.sponsors[x]);
    });
    return sponsors;
  });

  render() {
    const { evento } = this.props;
    if (evento == undefined) return null;

    const sponsors = this.getSponsors(evento);

    return (
      <React.Fragment>
        {sponsors && sponsors.length != 0 && (
          <div style={{ marginTop: 56, display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            {sponsors.map((x, index) => {
              return (
                <Tooltip key={index} title={x.nombre || ""} disableFocusListener={true}>
                  <div
                    onClick={() => {
                      var win = window.open(x.url, "_blank");
                      win.focus();
                    }}
                    style={{
                      margin: 8,
                      cursor: "pointer"
                    }}
                  >
                    <img src={x.logo} style={{ objectFit: "contain", maxHeight: 70, minHeight: 70 }} />
                  </div>
                </Tooltip>
              );
            })}
          </div>
        )}
      </React.Fragment>
    );
  }
}

let componente = Footer;
componente = withStyles(styles)(componente);
export default componente;
