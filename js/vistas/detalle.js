import { formatoPrecio } from "../utilidades/formato.js";
import { agregarAlCarrito } from "../servicios/carrito.js";
import { mostrarAviso } from "../componentes/aviso.js";

const ventana = document.querySelector("#detalle");
let productos = [];
let probabilidades = {};
let colecciones = [];
let producto = null;
let cantidad = 1;

function crearProbabilidades() {
  const tabla = probabilidades[producto.id];

  if (!tabla) {
    return `<p class="subtitulo">Venta directa: sin azar, recibís exactamente la carta publicada.</p>`;
  }

  return `
    <div class="probabilidades">
      <h3>Probabilidades por rareza</h3>
      <ul>
        ${tabla.map((opcion) => `
          <li>
            <span>${opcion.rareza}★</span>
            <progress class="barra" max="100" value="${opcion.porcentaje}">${opcion.porcentaje}%</progress>
            <span>${opcion.porcentaje}%</span>
          </li>`).join("")}
      </ul>
    </div>`;
}

function crearAcciones() {
  if (producto.stock === 0) {
    return `<a class="boton tenue" href="nosotros.html#contacto">Avisame cuando vuelva</a>`;
  }

  const comprar = producto.tipo === "sobres"
    ? `<a class="boton primario" href="tirada.html">Comprar y abrir</a>`
    : `<button class="boton primario" type="button" data-accion="comprar">Comprar</button>`;

  return `
    ${comprar}
    <button class="boton secundario" type="button" data-accion="agregar">Agregar al carrito</button>`;
}

function crearContenido() {
  const coleccion = colecciones.find((item) => item.id === producto.coleccion);
  const stock = producto.stock === 0 ? "Sin stock" : producto.stock + " disponibles";
  const bloqueado = producto.stock === 0 ? "disabled" : "";

  return `
    <div class="contenido-detalle">
      <img src="${producto.imagen}" alt="${producto.nombre}" width="134" height="184">

      <div class="informacion">
        <button class="cerrar" type="button" data-accion="cerrar" aria-label="Cerrar detalle">×</button>

        <p class="etiquetas">
          <span class="etiqueta">Colección ${coleccion.nombre}</span>
          <span class="etiqueta">${producto.rareza}★ posible</span>
        </p>

        <h2 id="detalle-titulo">${producto.nombre}</h2>
        <p class="subtitulo">${producto.descripcion}</p>

        ${crearProbabilidades()}

        <p class="stock">${stock}</p>

        <div class="compra">
          <p class="total" aria-live="polite" data-total>${formatoPrecio(producto.precio)}</p>

          <div class="cantidad">
            <button type="button" data-accion="menos" aria-label="Restar uno" ${bloqueado}>−</button>
            <label class="solo-lectores" for="detalle-cantidad">Cantidad</label>
            <input type="number" id="detalle-cantidad" min="1" max="${Math.max(producto.stock, 1)}" value="1" ${bloqueado}>
            <button type="button" data-accion="mas" aria-label="Sumar uno" ${bloqueado}>+</button>
          </div>

          ${crearAcciones()}
        </div>

        <p class="mensaje" role="status"></p>
      </div>
    </div>`;
}

function cambiarCantidad(nueva) {
  const maximo = Math.max(producto.stock, 1);
  cantidad = Math.min(Math.max(nueva || 1, 1), maximo);

  ventana.querySelector("#detalle-cantidad").value = cantidad;
  ventana.querySelector("[data-total]").textContent = formatoPrecio(producto.precio * cantidad);
}

function agregar() {
  const agregadas = agregarAlCarrito(producto, cantidad);
  const texto = agregadas > 0
    ? `Agregaste ${agregadas} × ${producto.nombre} al carrito.`
    : `Ya tenés en el carrito todo el stock disponible de ${producto.nombre}.`;

  ventana.querySelector(".mensaje").textContent = texto;
  mostrarAviso(texto, agregadas > 0 ? "exito" : "error");
}

export function prepararDetalle(datos) {
  productos = datos.productos;
  probabilidades = datos.probabilidades;
  colecciones = datos.colecciones;
}

export function abrirDetalle(id) {
  producto = productos.find((item) => item.id === id);
  cantidad = 1;
  ventana.innerHTML = crearContenido();
  ventana.showModal();
}

ventana.addEventListener("click", (evento) => {
  if (evento.target === ventana) {
    ventana.close();
    return;
  }

  const boton = evento.target.closest("[data-accion]");

  if (!boton) {
    return;
  }

  const accion = boton.dataset.accion;

  if (accion === "cerrar") {
    ventana.close();
  } else if (accion === "mas") {
    cambiarCantidad(cantidad + 1);
  } else if (accion === "menos") {
    cambiarCantidad(cantidad - 1);
  } else if (accion === "agregar") {
    agregar();
  } else if (accion === "comprar") {
    agregar();
    window.location.href = "carrito.html";
  }
});

ventana.addEventListener("change", (evento) => {
  if (evento.target.id === "detalle-cantidad") {
    cambiarCantidad(Number(evento.target.value));
  }
});
