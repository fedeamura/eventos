import Usuario from "./usuario";
import Data from "./data";

import { connectRouter } from "connected-react-router";
import { combineReducers } from "redux";

const createRootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    Usuario,
    Data
  });

export default createRootReducer;
