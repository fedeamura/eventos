import { 
    EVENTOS_SET, 
    EVENTOS_INIT, 
    EVENTOS_GANADORES_SET,
    EVENTOS_MENSAJES_SET
} from "@Redux/Constants/index";

export const setEventos = data => ({ type: EVENTOS_SET, payload: data });
export const setInit = () => ({ type: EVENTOS_INIT });
export const setGanadores = (id, ganadores) => ({ type: EVENTOS_GANADORES_SET, payload: { id, ganadores } });
export const setMensajes = (id, mensajes) => ({ type: EVENTOS_MENSAJES_SET, payload: { id, mensajes } });
