import {
  EVENTOS_SET,
  EVENTOS_INIT,
  EVENTOS_GANADORES_SET,
  EVENTOS_MENSAJES_SET
} from "@Redux/Constants/index";

const initialState = {
  data: undefined,
  ready: false,
  cargando: false,
  ganadores: {},
  mensajes: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case EVENTOS_SET: {
      return { ...state, data: action.payload, ready: true, cargando: false };
    }

    case EVENTOS_INIT: {
      return { ...state, data: undefined, ready: false, cargando: true };
    }

    case EVENTOS_GANADORES_SET: {
      return {
        ...state, ganadores: {
          ...initialState.ganadores,
          [action.payload.id]: [...action.payload.ganadores]
        }
      };
    }

    case EVENTOS_MENSAJES_SET: {
      return {
        ...state, mensajes: {
          ...initialState.mensajes,
          [action.payload.id]: [...action.payload.mensajes]
        }
      };
    }

    default:
      return state;
  }
};
export default reducer;
