import { setGanadores, setMensajes } from "@Redux/Actions/eventos";
import { MiStore as store } from '../index';

const metodos = {
    escucharGanadores: (id) => {
        if (this.listenerGanadores && this.listenerGanadores[id]) return;

        // console.log('Empiezo a escuchar los ganadores del evento', id);

        const db = window.firebase.firestore();
        if (this.listenerGanadores == undefined) this.listenerGanadores = {};
        this.listenerGanadores[id] = db
            .collection('info')
            .doc('ganadores')
            .collection('porEvento')
            .doc(id)
            .onSnapshot((data) => {
                if (!data.exists) {
                    store.dispatch(setGanadores(id, []));
                    return;
                }

                const info = data.data();
                let ganadores = info.ganadores || {};
                ganadores = Object.keys(ganadores).map((x) => {
                    return ganadores[x];
                });

                store.dispatch(setGanadores(id, ganadores));
            });
    },
    dejarDeEscucharGanadores: (id) => {
        if (this.listenerGanadores == undefined || this.listenerGanadores[id] == undefined) return;
        this.listenerGanadores[id]();
    },
    escucharMensajes: (id) => {
        if (this.listenerMensajes && this.listenerMensajes[id]) return;

        // console.log('Empiezo a escuchar los mensajes del evento', id);

        const db = window.firebase.firestore();
        if (this.listenerMensajes == undefined) this.listenerMensajes = {};
        this.listenerMensajes[id] = db
            .collection('info')
            .doc('mensajes')
            .collection('porEvento')
            .doc(id)
            .onSnapshot((data) => {
                if (!data.exists) {
                    store.dispatch(setMensajes(id, []));
                    return;
                }

                const info = data.data();
                let mensajes = info.mensajes || {};
                mensajes = Object.keys(mensajes).map((x) => {
                    return mensajes[x];
                });

                store.dispatch(setMensajes(id, mensajes));
            });
    },
    dejarDeEscucharMensajes: (id) => {
        if (this.listenerMensajes == undefined || this.listenerMensajes[id] == undefined) return;
        this.listenerMensajes[id]();
    }
};
export default metodos;