// Arma el pedido y el mensaje que se envía por WhatsApp. Funciones puras.
import { formatoPrecio } from "./formato.js";

const nombresMetodo = {
  tarjeta: "Tarjeta",
  billetera: "Billetera virtual",
  transferencia: "Transferencia bancaria"
};

export function generarNumeroPedido(azar = Math.random) {
  return "DR-" + Math.floor(10000 + azar() * 90000);
}

export function describirPago(metodo, numeroTarjeta = "") {
  const nombre = nombresMetodo[metodo] || metodo;

  if (metodo === "tarjeta" && numeroTarjeta) {
    return `${nombre} terminada en ${numeroTarjeta.replace(/\s/g, "").slice(-4)}`;
  }

  return nombre;
}

export function crearMensajePedido(pedido) {
  const lineas = [
    `¡Hola Doragon! Quiero confirmar mi pedido ${pedido.numero}.`,
    "",
    `Cliente: ${pedido.cliente.nombre}`,
    `Envío a: ${pedido.cliente.direccion}, ${pedido.cliente.ciudad}`,
    `Pago: ${pedido.pago}`,
    "",
    "Productos:",
    ...pedido.items.map((item) => `• ${item.nombre} x${item.cantidad} — ${formatoPrecio(item.precio * item.cantidad)}`),
    "",
    `Subtotal: ${formatoPrecio(pedido.totales.subtotal)}`
  ];

  if (pedido.totales.drop > 0) {
    lineas.push(`Descuento drop: −${formatoPrecio(pedido.totales.drop)}`);
  }

  if (pedido.totales.codigo > 0) {
    lineas.push(`Código ${pedido.codigo}: −${formatoPrecio(pedido.totales.codigo)}`);
  }

  lineas.push(`Total: ${formatoPrecio(pedido.totales.total)}`);

  return lineas.join("\n");
}

export function crearEnlaceWhatsapp(numero, texto) {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
}
