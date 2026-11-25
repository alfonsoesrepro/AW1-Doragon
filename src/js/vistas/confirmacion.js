import { leer, guardar, CLAVES } from "../servicios/almacenamiento.js";
import { formatoPrecio } from "../utilidades/formato.js";
import { mostrarAviso } from "../componentes/aviso.js";

const titulo = document.querySelector("#confirmacion-titulo");
const subtitulo = document.querySelector("#confirmacion-subtitulo");
const resumen = document.querySelector("#confirmacion-resumen");
const productos = document.querySelector("#confirmacion-productos");
const whatsapp = document.querySelector("#enviar-whatsapp");

function fechaEntrega(pedido) {
  const fecha = new Date(pedido.fecha);
  fecha.setDate(fecha.getDate() + (pedido.entregaDias || 4));
  return fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

function mostrarPedido(pedido) {
  subtitulo.textContent = pedido.enviadoPorWhatsapp
    ? "Abrimos WhatsApp con el detalle de tu pedido: enviá el mensaje para que lo preparemos. Tus sobres ya están disponibles en Mi cuenta."
    : "Tu navegador bloqueó la ventana de WhatsApp. Tocá «Enviar por WhatsApp» para mandarnos el detalle del pedido.";

  resumen.innerHTML = `
    <div><dt>N° de pedido</dt><dd>${pedido.numero}</dd></div>
    <div><dt>Total</dt><dd>${formatoPrecio(pedido.totales.total)}</dd></div>
    <div><dt>Entrega estimada</dt><dd>${fechaEntrega(pedido)}</dd></div>`;

  productos.innerHTML = pedido.items
    .map((item) => `<li><span>${item.nombre} x${item.cantidad}</span><span class="precio">${formatoPrecio(item.precio * item.cantidad)}</span></li>`)
    .join("");
  productos.hidden = false;

  whatsapp.href = pedido.enlaceWhatsapp;
  whatsapp.hidden = false;
  whatsapp.textContent = pedido.enviadoPorWhatsapp ? "Reenviar por WhatsApp" : "Enviar por WhatsApp";

  if (pedido.recienCreado) {
    mostrarAviso(pedido.enviadoPorWhatsapp
      ? `Pedido ${pedido.numero} confirmado y enviado a WhatsApp.`
      : `Pedido ${pedido.numero} confirmado. Falta enviarlo por WhatsApp.`,
    pedido.enviadoPorWhatsapp ? "exito" : "error");

    // El aviso se muestra una sola vez: al recargar ya no aparece.
    guardar(CLAVES.pedido, { ...pedido, recienCreado: false });
  }
}

const pedido = leer(CLAVES.pedido, null);

if (pedido && Array.isArray(pedido.items)) {
  mostrarPedido(pedido);
} else {
  titulo.textContent = "Todavía no hiciste ningún pedido";
  subtitulo.textContent = "Cuando confirmes una compra vas a ver acá el resumen.";
  resumen.hidden = true;
}
