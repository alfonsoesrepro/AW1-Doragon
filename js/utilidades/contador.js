const contador = document.querySelector(".cabecera .contador");
const textoOculto = document.querySelector(".cabecera .icono.carrito .solo-lectores");

export function fijarContador(cantidad) {
  if (!contador || !textoOculto) {
    return;
  }

  contador.textContent = cantidad;
  textoOculto.textContent = "Carrito, " + cantidad + " productos";
}
