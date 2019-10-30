import {
    EVENTO_SET,
    EVENTO_GANADORES_SET,
    EVENTO_MENSAJES_SET
} from "@Redux/Constants/index";

export const setEvento = data => ({ type: EVENTO_SET, payload: data });
export const setGanadores = (ganadores) => ({ type: EVENTO_GANADORES_SET, payload: ganadores });
export const setMensajes = (mensajes) => ({ type: EVENTO_MENSAJES_SET, payload: mensajes });
