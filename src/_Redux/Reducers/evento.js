import {
  EVENTO_SET,
  EVENTO_GANADORES_SET,
  EVENTO_MENSAJES_SET
} from "@Redux/Constants/index";

const initialState = {
  data: undefined,
  ganadores: [],
  mensajes: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case EVENTO_SET: {
      return { ...state, data: action.payload };
    }

    case EVENTO_GANADORES_SET: {
      return {
        ...state, ganadores: action.payload
      };
    }

    case EVENTO_MENSAJES_SET: {
      return {
        ...state, mensajes: action.payload
      };
    }

    default:
      return state;
  }
};
export default reducer;
