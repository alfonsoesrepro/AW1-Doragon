import { obtenerJSON, mostrarError } from "../servicios/datos.js";
import { crearTarjeta } from "../componentes/tarjeta.js";

const destacados = document.querySelector("#destacados");

async function iniciar() {
  try {
    const productos = await obtenerJSON("productos");

    destacados.innerHTML = productos
      .filter((producto) => producto.destacado)
      .map((producto) => crearTarjeta(producto, false))
      .join("");
  } catch (error) {
    mostrarError(destacados, "No pudimos cargar los productos destacados.", error);
  }
}

iniciar();
