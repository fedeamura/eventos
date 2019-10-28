import { GESTION_EVENTOS_SET, GESTION_EVENTOS_INIT } from "@Redux/Constants/index";

const initialState = {
  eventos: undefined,
  eventosReady: false,
  eventosCargando: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GESTION_EVENTOS_SET: {
      return { ...state, eventos: action.payload, eventosReady: true, eventosCargando: false };
    }
    case GESTION_EVENTOS_INIT: {
      return { ...state, eventos: undefined, eventosReady: false, eventosCargando: true };
    }
    default:
      return state;
  }
};
export default reducer;
