import Usuario from "./usuario";
import Gestion from "./gestion";
import Eventos from "./eventos";

import { connectRouter } from "connected-react-router";
import { combineReducers } from "redux";

const createRootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    Usuario,
    Gestion,
    Eventos
  });

export default createRootReducer;
