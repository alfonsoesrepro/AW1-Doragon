// Estado del carrito guardado en localStorage, compartido entre todas las páginas.
import { leer, guardar, borrar, CLAVES } from "./almacenamiento.js";
import { agregarItem, contarUnidades } from "../utilidades/carrito.js";
import { fijarContador } from "../utilidades/contador.js";

function esItemValido(item) {
  return item && typeof item.id === "string" && Number.isInteger(item.cantidad) && item.cantidad > 0;
}

export function obtenerCarrito() {
  const items = leer(CLAVES.carrito, []);
  return Array.isArray(items) ? items.filter(esItemValido) : [];
}

export function guardarCarrito(items) {
  guardar(CLAVES.carrito, items);
  fijarContador(contarUnidades(items));
}

// Devuelve cuántas unidades se agregaron realmente (0 si ya se llegó al stock).
export function agregarAlCarrito(producto, cantidad) {
  const antes = obtenerCarrito();
  const despues = agregarItem(antes, producto.id, cantidad, producto.stock);
  guardarCarrito(despues);
  return contarUnidades(despues) - contarUnidades(antes);
}

export function vaciarCarrito() {
  borrar(CLAVES.carrito);
  borrar(CLAVES.codigo);
  fijarContador(0);
}

export function obtenerCodigo() {
  return leer(CLAVES.codigo, "");
}

export function guardarCodigo(codigo) {
  if (codigo) {
    guardar(CLAVES.codigo, codigo);
  } else {
    borrar(CLAVES.codigo);
  }
}
