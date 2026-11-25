import { obtenerJSON, mostrarError } from "../servicios/datos.js";
import { obtenerCarrito, obtenerCodigo, vaciarCarrito } from "../servicios/carrito.js";
import { guardar, CLAVES } from "../servicios/almacenamiento.js";
import { calcularTotales } from "../utilidades/carrito.js";
import { formatoPrecio } from "../utilidades/formato.js";
import { generarNumeroPedido, describirPago, crearMensajePedido, crearEnlaceWhatsapp } from "../utilidades/pedido.js";
import {
  validarNombre, validarDni, validarDireccion, validarTarjeta, validarVencimiento, validarCvv
} from "../utilidades/validaciones.js";
import { activarValidacion, validarFormulario } from "../componentes/formulario.js";
import { mostrarAviso } from "../componentes/aviso.js";

const formulario = document.querySelector("#pago");
const bloques = formulario.querySelectorAll("[data-metodo]");
const filas = document.querySelector("#pedido-filas");
const totales = document.querySelector("#pedido-totales");
const botonConfirmar = document.querySelector("#confirmar-pago");

// Reglas JS que complementan los atributos HTML (required, pattern, minlength).
const reglas = {
  nombre: validarNombre,
  documento: validarDni,
  direccion: validarDireccion,
  numero_tarjeta: validarTarjeta,
  vencimiento: validarVencimiento,
  cvv: validarCvv
};

let productos = [];
let tienda = null;
let items = [];
let codigo = "";
let resumen = null;

function mostrarMetodo() {
  const elegido = formulario.querySelector("input[name='metodo-pago']:checked").value;

  bloques.forEach((bloque) => {
    const activo = bloque.dataset.metodo === elegido;

    bloque.hidden = !activo;

    bloque.querySelectorAll("input").forEach((campo) => {
      campo.disabled = !activo;
    });
  });
}

function buscarProducto(id) {
  return productos.find((producto) => producto.id === id);
}

function mostrarPedido() {
  if (items.length === 0) {
    filas.innerHTML = `<li class="vacio">Tu carrito está vacío. <a href="catalogo.html">Mirá el catálogo</a>.</li>`;
    totales.innerHTML = "";
    botonConfirmar.disabled = true;
    return;
  }

  filas.innerHTML = items.map((item) => {
    const producto = buscarProducto(item.id);
    return `
      <li>
        <span>${producto.nombre} x${item.cantidad}</span>
        <span class="precio">${formatoPrecio(producto.precio * item.cantidad)}</span>
      </li>`;
  }).join("");

  const lineaDescuentos = resumen.drop + resumen.codigo > 0
    ? `<div><dt>Descuentos</dt><dd>−${formatoPrecio(resumen.drop + resumen.codigo)}</dd></div>`
    : "";

  totales.innerHTML = `
    ${lineaDescuentos}
    <div class="total"><dt>Total</dt><dd>${formatoPrecio(resumen.total)}</dd></div>`;

  botonConfirmar.disabled = false;
}

function crearPedido() {
  const datos = new FormData(formulario);
  const metodo = datos.get("metodo-pago");

  return {
    numero: generarNumeroPedido(),
    fecha: new Date().toISOString(),
    cliente: {
      nombre: datos.get("nombre").trim(),
      direccion: datos.get("direccion").trim(),
      ciudad: datos.get("ciudad").trim()
    },
    // Nunca se guarda ni se envía el número completo de la tarjeta.
    pago: describirPago(metodo, datos.get("numero_tarjeta") || ""),
    items: items.map((item) => {
      const producto = buscarProducto(item.id);
      return { id: item.id, nombre: producto.nombre, precio: producto.precio, cantidad: item.cantidad };
    }),
    codigo,
    totales: resumen,
    entregaDias: tienda.envioDias
  };
}

function confirmarPedido(evento) {
  evento.preventDefault();

  if (items.length === 0) {
    mostrarAviso("Tu carrito está vacío.", "error");
    return;
  }

  if (!validarFormulario(formulario, reglas)) {
    mostrarAviso("Revisá los campos marcados en rojo.", "error");
    return;
  }

  const pedido = crearPedido();
  pedido.enlaceWhatsapp = crearEnlaceWhatsapp(tienda.whatsapp, crearMensajePedido(pedido));

  // Se abre WhatsApp en otra pestaña dentro del mismo evento de envío
  // para que el navegador no lo bloquee como ventana emergente.
  const ventana = window.open(pedido.enlaceWhatsapp, "_blank");
  pedido.enviadoPorWhatsapp = ventana !== null;

  if (ventana) {
    ventana.opener = null;
  }
  pedido.recienCreado = true;

  if (!guardar(CLAVES.pedido, pedido)) {
    mostrarAviso("No pudimos guardar el pedido en este navegador.", "error");
    return;
  }

  vaciarCarrito();
  window.location.href = "confirmacion.html";
}

async function iniciar() {
  formulario.addEventListener("change", (evento) => {
    if (evento.target.name === "metodo-pago") {
      mostrarMetodo();
    }
  });

  mostrarMetodo();
  activarValidacion(formulario, reglas);
  botonConfirmar.disabled = true;

  try {
    [productos, tienda] = await Promise.all([obtenerJSON("productos"), obtenerJSON("tienda")]);
  } catch (error) {
    mostrarError(filas, "No pudimos cargar tu pedido.", error);
    return;
  }

  items = obtenerCarrito().filter((item) => buscarProducto(item.id));
  codigo = tienda.codigosDescuento[obtenerCodigo()] ? obtenerCodigo() : "";
  resumen = calcularTotales(items, productos, {
    descuentoDrop: tienda.descuentoDrop,
    porcentajeCodigo: tienda.codigosDescuento[codigo] || 0
  });

  mostrarPedido();
  formulario.addEventListener("submit", confirmarPedido);
}

iniciar();
