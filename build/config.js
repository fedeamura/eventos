const DEPLOY = 1;
const TEST = 2;
const LOCAL = 3;
// const ENTORNO = LOCAL;
const ENTORNO = DEPLOY;

//WS Turnero
const intranet = false;
const URL_WS_LOCAL = intranet ? "http://localhost:7294" : "http://localhost:1868";
const URL_WS_TEST = "https://srv-dev04.cordoba.local/WSVecinoVirtual_Bridge";
const URL_WS_DEPLOY = "https://servicios2.cordoba.gov.ar/WSVecinoVirtual_Bridge";
let URL_WS = URL_WS_DEPLOY;

//Segun el entorno, cargo las variables
switch (ENTORNO) {
  case LOCAL:
    {
      URL_WS = URL_WS_LOCAL;
    }
    break;
  case TEST:
    {
      URL_WS = URL_WS_TEST;
    }
    break;
  case DEPLOY:
    {
      URL_WS = URL_WS_DEPLOY;
    }
    break;
}

var Config = {
  BASE_URL: "/MuniOnlineLogin",
  BASE_URL_WS: URL_WS,
  URL_VALIDAR_RENAPER: "https://servicios2.cordoba.gov.ar/VecinoVirtual/Utils/ValidarRenaper",
  WS_CORDOBA_GEO: "https://servicios2.cordoba.gov.ar/CordobaGeoApi",
  NOMBRE_SISTEMA: "Muni Online",
  URL_DEFAULT: "Login/Panel",
  URL_AYUDA: "https://servicios2.cordoba.gov.ar/MuniOnlineAyuda"
};

try {
  module.exports = Config;
} catch (ex) {}
