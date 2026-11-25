// Carga los archivos JSON de la carpeta data/ con fetch.
// Guarda cada respuesta en memoria para no pedir dos veces el mismo archivo.
const cache = new Map();

export async function obtenerJSON(nombre) {
  if (cache.has(nombre)) {
    return cache.get(nombre);
  }

  try {
    const respuesta = await fetch(`data/${nombre}.json`);

    if (!respuesta.ok) {
      throw new Error(`el servidor respondió ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    cache.set(nombre, datos);
    return datos;
  } catch (error) {
    throw new Error(`No se pudo cargar data/${nombre}.json (${error.message})`);
  }
}

export function mostrarError(contenedor, texto, error) {
  console.error(error);

  const etiqueta = contenedor.tagName === "UL" || contenedor.tagName === "OL" ? "li" : "p";
  contenedor.innerHTML = `<${etiqueta} class="vacio error-carga" role="alert">${texto} Probá recargar la página.</${etiqueta}>`;
}
