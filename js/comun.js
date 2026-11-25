import { obtenerCarrito } from "./servicios/carrito.js";
import { CLAVES } from "./servicios/almacenamiento.js";
import { contarUnidades } from "./utilidades/carrito.js";
import { fijarContador } from "./utilidades/contador.js";
import { activarValidacion, validarFormulario, limpiarErrores } from "./componentes/formulario.js";
import { validarNombre, validarEmail, validarMensaje, validarNumeroPedido } from "./utilidades/validaciones.js";

const formularios = document.querySelectorAll("form[data-mensaje]");
const contadores = document.querySelectorAll("[data-contador-de]");
const actualizadores = [];

// Reglas JS que se suman a las validaciones HTML de cada formulario.
const reglas = {
  nombre: validarNombre,
  email: validarEmail,
  mensaje: validarMensaje,
  pedido: validarNumeroPedido
};

function actualizarContadorCarrito() {
  fijarContador(contarUnidades(obtenerCarrito()));
}

formularios.forEach((formulario) => {
  activarValidacion(formulario, reglas);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    let mensaje = formulario.querySelector(".mensaje");

    if (!mensaje) {
      mensaje = document.createElement("p");
      mensaje.className = "mensaje";
      mensaje.setAttribute("role", "status");
      formulario.append(mensaje);
    }

    if (!validarFormulario(formulario, reglas)) {
      mensaje.textContent = "";
      return;
    }

    mensaje.textContent = formulario.dataset.mensaje;
    formulario.reset();
    limpiarErrores(formulario);
    actualizadores.forEach((actualizar) => actualizar());
  });
});

contadores.forEach((contador) => {
  const campo = document.querySelector("#" + contador.dataset.contadorDe);

  function actualizar() {
    contador.textContent = campo.value.length + " / " + campo.maxLength;
  }

  campo.addEventListener("input", actualizar);
  actualizadores.push(actualizar);
  actualizar();
});

// El contador del carrito se lee de localStorage en todas las páginas
// y se actualiza si el carrito cambia en otra pestaña.
actualizarContadorCarrito();

window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVES.carrito) {
    actualizarContadorCarrito();
  }
});
