import { DATA_SET, DATA_CARGANDO, DATA_READY } from "@Redux/Constants/index";

export const setData = data => ({ type: DATA_SET, payload: data });
export const setCargando = data => ({ type: DATA_CARGANDO, payload: data });
export const setReady = data => ({ type: DATA_READY, payload: data });
