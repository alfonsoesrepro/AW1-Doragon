// Envoltorio de localStorage: guarda y lee valores como JSON.
// Si el navegador bloquea el almacenamiento o el dato está corrupto, devuelve el valor por defecto.
export const CLAVES = {
  carrito: "doragon:carrito",
  codigo: "doragon:codigo",
  pedido: "doragon:ultimo-pedido",
  inventario: "doragon:inventario"
};

export function leer(clave, porDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    return texto === null ? porDefecto : JSON.parse(texto);
  } catch (error) {
    console.warn(`No se pudo leer "${clave}" de localStorage.`, error);
    return porDefecto;
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.warn(`No se pudo guardar "${clave}" en localStorage.`, error);
    return false;
  }
}

export function borrar(clave) {
  try {
    localStorage.removeItem(clave);
  } catch (error) {
    console.warn(`No se pudo borrar "${clave}" de localStorage.`, error);
  }
}
