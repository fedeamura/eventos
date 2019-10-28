import { GESTION_EVENTOS_SET, GESTION_EVENTOS_INIT } from "@Redux/Constants/index";

export const setEventos = data => ({ type: GESTION_EVENTOS_SET, payload: data });
export const setInit = () => ({ type: GESTION_EVENTOS_INIT });
