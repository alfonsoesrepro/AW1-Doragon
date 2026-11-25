import { obtenerJSON, mostrarError } from "../servicios/datos.js";
import { leer, CLAVES } from "../servicios/almacenamiento.js";
import { numeroCarta } from "../utilidades/formato.js";

const filtro = document.querySelector("#filtro-inventario");
const lista = document.querySelector("#lista-inventario");
const vacio = document.querySelector("#inventario-vacio");

let cartas = [];
let colecciones = [];

function crearCarta(item) {
  const carta = cartas.find((registro) => registro.id === item.id);
  const coleccion = colecciones.find((registro) => registro.id === carta.coleccion);
  const repetida = item.cantidad > 1;
  const cantidad = repetida ? ` · x${item.cantidad}` : "";

  return `
    <li class="tarjeta-carta vertical" data-rareza="${carta.rareza}" data-duplicada="${repetida}">
      <img src="${carta.imagen}" alt="Carta de ${carta.nombre}" width="293" height="210">
      <h3 class="nombre">${carta.nombre}</h3>
      <p class="detalle">${carta.rareza}★ · ${numeroCarta(carta.numero, coleccion.total)}${cantidad}</p>
    </li>`;
}

function mostrarCartas() {
  const elegido = filtro.querySelector("input:checked").value;
  let visibles = 0;

  [...lista.children].forEach((carta) => {
    let mostrar = true;

    if (elegido === "duplicadas") {
      mostrar = carta.dataset.duplicada === "true";
    } else if (elegido !== "todas") {
      mostrar = carta.dataset.rareza === elegido;
    }

    carta.hidden = !mostrar;

    if (mostrar) {
      visibles++;
    }
  });

  vacio.hidden = visibles > 0;
}

async function iniciar() {
  try {
    const [datosCartas, categorias] = await Promise.all([
      obtenerJSON("cartas"),
      obtenerJSON("categorias")
    ]);

    cartas = datosCartas.cartas;
    colecciones = categorias.colecciones;

    // El inventario se guarda en localStorage cuando se abren sobres en la tirada.
    const inventario = leer(CLAVES.inventario, datosCartas.inventarioInicial)
      .filter((item) => cartas.some((carta) => carta.id === item.id));

    lista.innerHTML = inventario.map(crearCarta).join("");
    filtro.addEventListener("input", mostrarCartas);
    mostrarCartas();
  } catch (error) {
    mostrarError(lista, "No pudimos cargar tu inventario.", error);
  }
}

iniciar();
