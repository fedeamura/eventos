import _ from "lodash";
const KEY_INFO_PUBLICA = "UIYAUISYNQNNWSDSS";

const metodos = {
  registrar: async comando => {
    comando.urlServidor = window.location.origin + window.Config.BASE_URL + "/#/ProcesarActivacionUsuario";
    const url = window.Config.BASE_URL_WS + "/v3/Usuario";

    let data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  registrarConQR: async comando => {
    comando.urlServidor = window.location.origin + window.Config.BASE_URL + "/#/ProcesarActivacionUsuario";
    const url = window.Config.BASE_URL_WS + "/v3/Usuario/QR";

    let data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  registrarConDatosQR: async comando => {
    comando.urlServidor = window.location.origin + window.Config.BASE_URL + "/#/ProcesarActivacionUsuario";
    const url = window.Config.BASE_URL_WS + "/v3/Usuario/DatosQR";

    let data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  getInfoPublica: async username => {
    let url = window.Config.BASE_URL_WS + "/v1/Usuario/InfoPublica";

    let data = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        key: KEY_INFO_PUBLICA
      })
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  acceder: async (username, password) => {
    let url = window.Config.BASE_URL_WS + "/v1/Usuario/IniciarSesion";

    let data = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  generarCuil: async comando => {
    const url = window.Config.BASE_URL_WS + "/v1/Usuario/GenerarCuil?dni=" + comando.dni + "&sexoMasculino=" + comando.sexoMasculino;

    let data = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  validarRenaper: async comando => {
    const url = window.Config.BASE_URL_WS + "/v2/Usuario/ValidarRenaper";

    let data = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  validarUsername: async username => {
    const url = window.Config.BASE_URL_WS + "/v1/Usuario/ExisteUsername?username=" + username;

    let data = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  //Usuario activado
  validarUsuarioActivadoByUsername: async username => {
    let url = window.Config.BASE_URL_WS + "/v2/Usuario/ActivacionCuenta/Validar/Username?username=" + username;

    let data = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  validarUsuarioActivadoByUserPass: async (username, password) => {
    let url = window.Config.BASE_URL_WS + "/v1/Usuario/ActivacionCuenta/Validar";

    let data = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: username, password: password })
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  iniciarActivacion: async comando => {
    const url = window.Config.BASE_URL_WS + "/v2/Usuario/ActivacionCuenta";
    comando.urlServidor = window.location.origin + window.Config.BASE_URL + "/#/ProcesarActivacionUsuario";

    let data = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  iniciarActivacionByNumeroTramite: async comando => {
    const url = window.Config.BASE_URL_WS + "/v3/Usuario/ActivacionCuenta/NumeroTramite";
    comando.urlServidor = window.location.origin + window.Config.BASE_URL + "/#/ProcesarActivacionUsuario";

    let data = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  procesarActivacionUsuario: async codigo => {
    const url = window.Config.BASE_URL_WS + "/v2/Usuario/ActivacionCuenta/Procesar?codigo=" + codigo;

    let data = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  //Recuperacion cuenta
  iniciarRecuperarPassword: async comando => {
    const url = window.Config.BASE_URL_WS + "/v1/Usuario/RecuperacionCuenta/Iniciar";
    comando.urlServidor = window.location.origin + window.Config.BASE_URL + "/#/ProcesarRecuperarPassword";

    let data = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  procesarRecuperarPassword: async comando => {
    const url = window.Config.BASE_URL_WS + "/v1/Usuario/RecuperacionCuenta/Procesar";

    let data = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  getRecuperacionCuenta: async codigo => {
    const url = window.Config.BASE_URL_WS + "/v1/Usuario/RecuperacionCuenta/Datos?codigo=" + codigo;

    let data = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  //Usuario reciente
  guardarUsuarioReciente: infoGlobal => {
    infoGlobal.fecha = new Date();

    let usuarios = metodos.getUsuariosRecientes();

    usuarios = _.filter(usuarios, user => {
      return user.username !== infoGlobal.username;
    });
    usuarios.unshift(infoGlobal);
    usuarios.slice(0, 5);
    localStorage.setItem("usuariosRecientes", JSON.stringify(usuarios));
  },
  getUsuariosRecientes: () => {
    let usuarios = localStorage.getItem("usuariosRecientes");
    if (usuarios === undefined || usuarios === "undefined") {
      usuarios = [];
    } else {
      usuarios = JSON.parse(usuarios);
    }

    return usuarios;
  },
  borrarUsuarioReciente: username => {
    let usuarios = localStorage.getItem("usuariosRecientes");
    if (usuarios === undefined || usuarios === "undefined") {
      usuarios = [];
    } else {
      usuarios = JSON.parse(usuarios);
    }

    usuarios = _.filter(usuarios, item => {
      return item.username !== username;
    });
    localStorage.setItem("usuariosRecientes", JSON.stringify(usuarios));
  },
  iniciarNuevoUsuarioQR: async comando => {
    const url = window.Config.BASE_URL_WS + "/v2/Usuario/QR/IniciarNuevoUsuario";

    let data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: comando })
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  iniciarNuevoUsuarioByDataQR: async comando => {
    const url = window.Config.BASE_URL_WS + "/v2/Usuario/DatosQR/IniciarNuevoUsuario";

    let data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  },
  contacto: async comando => {
    const url = window.Config.BASE_URL_WS + "/v2/Usuario/Contacto";

    let data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comando)
    });

    if (data.ok != true) {
      throw Error(data.statusText || "Error procesando la solicitud");
    }

    data = await data.json();
    if (data.ok != true) {
      throw Error(data.error || "Error procesando la solicitud");
    }

    return data.return;
  }
  // validarPassword: async password => {
  //   const url = `${window.Config.BASE_URL_WS}/v3/Usuario/ValidarPasword?password=${password}`;

  //   let data = await fetch(url, {
  //     method: "PUT",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify(data)
  //   });

  //   console.log(data);
  //   if (data.ok != true) {
  //     throw Error(data.statusText);
  //   }

  //   data = await data.json();
  //   console.log(data);
  //   if (data.ok != true) {
  //     throw Error(data.error || "Error procesando la solicitud");
  //   }

  //   return data.return;
  // }
};

export default metodos;
