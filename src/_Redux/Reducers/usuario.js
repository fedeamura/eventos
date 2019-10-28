import {
  USUARIO_LOGIN,
  USUARIO_CERRAR_SESION,
  USUARIO_INSCRIPCIONES_SET
} from "@Redux/Constants/index";

const initialState = {
  usuario: undefined,
  inscripciones: undefined,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case USUARIO_LOGIN: {
      sessionStorage.setItem("usuario", JSON.stringify(action.payload));
      return { ...state, usuario: action.payload };
    }
    case USUARIO_CERRAR_SESION: {
      sessionStorage.setItem("usuario", undefined);
      return { ...state, usuario: undefined };
    }

    case USUARIO_INSCRIPCIONES_SET: {
      return { ...state, inscripciones: action.payload };
    }




    default:
      return state;
  }
};
export default reducer;
