import { USUARIO_LOGIN, USUARIO_CERRAR_SESION } from "@Redux/Constants/index";

const initialState = {
  usuario: undefined,
  // usuario: {
  //   uid: 'Fdl03qs8YcXnhUCVLz7LHuKHUoQ2',
  //   nombre: 'Federico Amura',
  //   photoURL: 'https://lh3.googleusercontent.com/a-/AAuE7mCoUPencicspA9_22Sb9OMneSJN1mrszRaR79G7a9E'
  // }
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
    default:
      return state;
  }
};
export default reducer;
