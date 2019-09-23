import { DATA_SET, DATA_CARGANDO, DATA_READY } from "@Redux/Constants/index";

const initialState = {
  data: undefined,
  cargando: false,
  ready: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case DATA_SET: {
      return { ...state, data: action.payload };
    }
    case DATA_CARGANDO: {
      return { ...state, cargando: action.payload };
    }
    case DATA_READY: {
      return { ...state, ready: action.payload };
    }
    default:
      return state;
  }
};
export default reducer;
