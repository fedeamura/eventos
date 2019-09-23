
const metodos = {
  get: async () => {
    var db = window.firebase.firestore();
    let doc = await db.collection('info').doc('eventos').get();

    let data = doc.data();
    if (data == undefined) {
      console.log('El documento que contiene los eventos no existe');
      return [];
    }

    let map = data.info || {};
    return Object.keys(map).map((key) => {
      let data = map[key];
      return data;
    })
  },
};

export default metodos;
