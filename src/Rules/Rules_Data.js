import { setInscripciones } from "@Redux/Actions/usuario";
import { setEvento, setGanadores, setMensajes } from "@Redux/Actions/evento";
import { MiStore as store } from '../index';

const ERROR_CRITICO_EVENTO_NO_EXISTE = 'ERROR_CRITICO_EVENTO_NO_EXISTE';
const ERROR_CRITICO_ERROR_LEYENDO = 'ERROR_CRITICO_ERROR_LEYENDO';

const metodos = {
    escuchar: async (idEvento, uid, callback, callbackError) => {

        if (this.listenerEvento == undefined) {

            const db = window.firebase.firestore();

            this.listenerEvento = await db
                .collection('eventos')
                .doc(idEvento)
                .onSnapshot((dataEvento) => {
                    if (!dataEvento.exists) {
                        metodos.dejarDeEscuchar();
                        callbackError(ERROR_CRITICO_EVENTO_NO_EXISTE);
                        return;
                    }

                    const evento = dataEvento.data();
                    evento.actividades = Object.keys(evento.actividades || {}).map((keyActividad) => {
                        return evento.actividades[keyActividad];
                    });

                    // console.log('Evento', evento);
                    store.dispatch(setEvento(evento));

                    //Leo inscripciones
                    if (this.listenerInscripciones == undefined) {
                        this.listenerInscripciones = db
                            .collection("info")
                            .doc("inscripciones")
                            .collection("porUsuario")
                            .doc(uid)
                            .onSnapshot(dataInscripciones => {
                                const infoInscripciones = dataInscripciones.data() || {};
                                const infoInscripcionesEventos = infoInscripciones.eventos || {};
                                const infoInscripcionesEnEventoActual = infoInscripcionesEventos[idEvento] || {};
                                const inscripciones = [];
                                Object.keys(infoInscripcionesEnEventoActual.actividades || {}).forEach(keyInscripcionActividaid => {
                                    const infoInscripcionActividad = infoInscripcionesEnEventoActual.actividades[keyInscripcionActividaid];
                                    if (infoInscripcionActividad && infoInscripcionActividad.inscripto == true) {
                                        inscripciones.push(keyInscripcionActividaid);
                                    }
                                });

                                // console.log('Inscripciones', inscripciones);
                                store.dispatch(setInscripciones(inscripciones));

                                //Leo mensajes
                                if (this.listenerMensajes == undefined) {
                                    this.listenerMensajes = db
                                        .collection('info')
                                        .doc('mensajes')
                                        .collection('porEvento')
                                        .doc(idEvento)
                                        .onSnapshot((dataMensajes) => {

                                            let mensajes = [];
                                            if (dataMensajes.exists) {
                                                const infoMensajes = dataMensajes.data();

                                                let infoMensajesData = infoMensajes.mensajes || {};
                                                mensajes = Object.keys(infoMensajesData).map((keyMensaje) => {
                                                    return infoMensajesData[keyMensaje + ''];
                                                });
                                            }

                                            // console.log('Mensajes', mensajes);
                                            store.dispatch(setMensajes(mensajes));

                                            //Leo ganadores
                                            if (this.listenerGanadores == undefined) {

                                                this.listenerGanadores = db
                                                    .collection('info')
                                                    .doc('ganadores')
                                                    .collection('porEvento')
                                                    .doc(idEvento)
                                                    .onSnapshot((dataGanadores) => {
                                                        let ganadores = [];
                                                        if (dataGanadores.exists) {
                                                            const infoGanadores = dataGanadores.data();
                                                            let inforGanadoresData = infoGanadores.ganadores || {};
                                                            ganadores = Object.keys(inforGanadoresData).map((x) => {
                                                                return inforGanadoresData[x];
                                                            });
                                                        }

                                                        // console.log('Ganadores', ganadores);
                                                        store.dispatch(setGanadores(ganadores));

                                                        callback();
                                                    }, () => {
                                                        metodos.dejarDeEscuchar();
                                                        callbackError(ERROR_CRITICO_ERROR_LEYENDO);
                                                    });
                                            }
                                        }, () => {
                                            metodos.dejarDeEscuchar();
                                            callbackError(ERROR_CRITICO_ERROR_LEYENDO);
                                        });
                                }
                            }, () => {
                                metodos.dejarDeEscuchar();
                                callbackError(ERROR_CRITICO_ERROR_LEYENDO);
                            });
                    }

                }, () => {
                    metodos.dejarDeEscuchar();
                    callbackError(ERROR_CRITICO_ERROR_LEYENDO);
                });
        }
    },
    dejarDeEscuchar: () => {
        this.listenerEvento && this.listenerEvento();
        this.listenerInscripciones && this.listenerInscripciones();
        this.listenerMensajes && this.listenerMensajes();
        this.listenerGanadores && this.listenerGanadores();
        this.listenerEvento = undefined;
        this.listenerInscripciones = undefined;
        this.listenerMensajes = undefined;
        this.listenerGanadores = undefined;
    }
};
export default metodos;