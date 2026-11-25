import { obtenerJSON, mostrarError } from "../servicios/datos.js";
import { obtenerCarrito, guardarCarrito, agregarAlCarrito, obtenerCodigo, guardarCodigo } from "../servicios/carrito.js";
import { cambiarCantidadItem, quitarItem as quitarDeLista, contarUnidades, calcularTotales } from "../utilidades/carrito.js";
import { formatoPrecio } from "../utilidades/formato.js";
import { mostrarAviso } from "../componentes/aviso.js";

let productos = [];
let tienda = { descuentoDrop: 0, codigosDescuento: {} };
let items = [];
let codigoAplicado = "";

const lista = document.querySelector("#lista-carrito");
const titulo = document.querySelector("#cantidad-items");
const vacio = document.querySelector("#carrito-vacio");
const totales = document.querySelector("#totales");
const irAlPago = document.querySelector("#ir-pago");
const formularioDescuento = document.querySelector("#form-descuento");
const campoCodigo = document.querySelector("#codigo");
const mensajeDescuento = document.querySelector("#mensaje-descuento");

function buscarProducto(id) {
  return productos.find((producto) => producto.id === id);
}

function crearItem(item) {
  const producto = buscarProducto(item.id);

  return `
    <li class="item" data-id="${producto.id}">
      <img src="${producto.imagen}" alt="${producto.nombre}" width="134" height="184">
      <div>
        <h3>${producto.nombre}</h3>
        <p class="detalle">${producto.detalle}</p>
      </div>
      <div class="campo">
        <label class="solo-lectores" for="cantidad-${producto.id}">Cantidad de ${producto.nombre}</label>
        <input type="number" id="cantidad-${producto.id}" min="1" max="${producto.stock}" value="${item.cantidad}">
      </div>
      <div class="importe">
        <p class="precio">${formatoPrecio(producto.precio * item.cantidad)}</p>
        <button class="boton secundario chico" type="button" data-accion="quitar" data-id="${producto.id}">Quitar</button>
      </div>
    </li>`;
}

function porcentajeCodigo() {
  return tienda.codigosDescuento[codigoAplicado] || 0;
}

function mostrarTotales() {
  const resumen = calcularTotales(items, productos, {
    descuentoDrop: tienda.descuentoDrop,
    porcentajeCodigo: porcentajeCodigo()
  });

  const lineaDrop = resumen.drop > 0
    ? `<div><dt>Descuento drop</dt><dd>−${formatoPrecio(resumen.drop)}</dd></div>`
    : "";

  const lineaCodigo = codigoAplicado !== "" && resumen.codigo > 0
    ? `<div><dt>Código ${codigoAplicado}</dt><dd>−${formatoPrecio(resumen.codigo)}</dd></div>`
    : "";

  totales.innerHTML = `
    <div><dt>Subtotal</dt><dd>${formatoPrecio(resumen.subtotal)}</dd></div>
    <div><dt>Envío</dt><dd>Gratis</dd></div>
    ${lineaDrop}
    ${lineaCodigo}
    <div class="total"><dt>Total</dt><dd>${formatoPrecio(resumen.total)}</dd></div>`;

  titulo.textContent = contarUnidades(items);
  vacio.hidden = items.length > 0;
  irAlPago.hidden = items.length === 0;
}

function guardarYMostrar() {
  guardarCarrito(items);
  mostrarTotales();
}

function cambiarCantidad(id, valor) {
  const producto = buscarProducto(id);
  items = cambiarCantidadItem(items, id, valor, producto.stock);

  const item = items.find((registro) => registro.id === id);
  const fila = lista.querySelector(`[data-id="${id}"]`);
  fila.querySelector("input").value = item.cantidad;
  fila.querySelector(".precio").textContent = formatoPrecio(producto.precio * item.cantidad);

  if (item.cantidad < valor) {
    mostrarAviso(`Solo hay ${producto.stock} unidades de ${producto.nombre}.`, "error");
  }

  guardarYMostrar();
}

function quitarItem(id) {
  const producto = buscarProducto(id);
  items = quitarDeLista(items, id);
  lista.querySelector(`[data-id="${id}"]`).remove();
  mostrarAviso(`Quitaste ${producto.nombre} del carrito.`);
  guardarYMostrar();
}

function aplicarCodigo(evento) {
  evento.preventDefault();

  const codigo = campoCodigo.value.trim().toUpperCase();

  if (codigo === "") {
    mensajeDescuento.textContent = "Escribí un código para aplicarlo.";
    campoCodigo.focus();
    return;
  }

  if (tienda.codigosDescuento[codigo]) {
    codigoAplicado = codigo;
    mensajeDescuento.textContent = `Código aplicado: ${tienda.codigosDescuento[codigo] * 100}% de descuento.`;
  } else {
    codigoAplicado = "";
    mensajeDescuento.textContent = "El código no es válido.";
  }

  guardarCodigo(codigoAplicado);
  mostrarTotales();
}

// Los botones "Comprar" de las tarjetas llevan a carrito.html?agregar=<id>.
function agregarDesdeEnlace() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get("agregar");

  if (!id) {
    return;
  }

  const producto = buscarProducto(id);

  if (producto && producto.stock > 0) {
    const agregadas = agregarAlCarrito(producto, 1);
    mostrarAviso(agregadas > 0
      ? `Agregaste ${producto.nombre} al carrito.`
      : `Ya tenés todo el stock disponible de ${producto.nombre}.`, agregadas > 0 ? "exito" : "error");
  }

  // Se limpia la URL para que recargar la página no vuelva a sumar el producto.
  history.replaceState(null, "", "carrito.html");
}

function registrarEventos() {
  lista.addEventListener("change", (evento) => {
    const fila = evento.target.closest("[data-id]");

    if (fila && evento.target.type === "number") {
      cambiarCantidad(fila.dataset.id, Number(evento.target.value));
    }
  });

  lista.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-accion='quitar']");

    if (boton) {
      quitarItem(boton.dataset.id);
    }
  });

  formularioDescuento.noValidate = true;
  formularioDescuento.addEventListener("submit", aplicarCodigo);
}

async function iniciar() {
  try {
    [productos, tienda] = await Promise.all([obtenerJSON("productos"), obtenerJSON("tienda")]);
  } catch (error) {
    mostrarError(lista, "No pudimos cargar tu carrito.", error);
    irAlPago.hidden = true;
    return;
  }

  agregarDesdeEnlace();

  // Se descartan productos que ya no existen en el catálogo.
  items = obtenerCarrito().filter((item) => buscarProducto(item.id));
  codigoAplicado = tienda.codigosDescuento[obtenerCodigo()] ? obtenerCodigo() : "";

  if (codigoAplicado) {
    campoCodigo.value = codigoAplicado;
    mensajeDescuento.textContent = `Código aplicado: ${porcentajeCodigo() * 100}% de descuento.`;
  }

  lista.innerHTML = items.map(crearItem).join("");
  registrarEventos();
  guardarYMostrar();
}

iniciar();
