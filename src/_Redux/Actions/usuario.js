import {
    USUARIO_LOGIN,
    USUARIO_CERRAR_SESION,
    USUARIO_INSCRIPCIONES_SET
} from "@Redux/Constants/index";

export const login = usuario => ({ type: USUARIO_LOGIN, payload: usuario });
export const cerrarSesion = () => ({ type: USUARIO_CERRAR_SESION });
export const setInscripciones = (data) => ({ type: USUARIO_INSCRIPCIONES_SET, payload: data });
