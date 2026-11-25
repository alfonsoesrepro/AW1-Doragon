import { obtenerJSON, mostrarError } from "../servicios/datos.js";
import { leer, guardar, CLAVES } from "../servicios/almacenamiento.js";
import { sortearRareza, elegirAlAzar } from "../utilidades/sorteo.js";
import { numeroCarta } from "../utilidades/formato.js";
import { mostrarAviso } from "../componentes/aviso.js";

const principal = document.querySelector("main");
const cartasPorSobre = 5;

const apertura = document.querySelector("#apertura");
const resultado = document.querySelector("#resultado");
const botonAbrir = document.querySelector("#abrir");

let sobre = null;
let tabla = [];
let cartas = [];
let colecciones = [];
let nombresRareza = {};
let inventario = [];

function cantidadEnInventario(id) {
  const item = inventario.find((registro) => registro.id === id);
  return item ? item.cantidad : 0;
}

// Suma las cartas obtenidas al inventario y lo guarda en localStorage.
function acreditarCartas(obtenidas) {
  obtenidas.forEach(({ carta }) => {
    const item = inventario.find((registro) => registro.id === carta.id);

    if (item) {
      item.cantidad++;
    } else {
      inventario.push({ id: carta.id, cantidad: 1 });
    }
  });

  if (!guardar(CLAVES.inventario, inventario)) {
    mostrarAviso("No pudimos guardar las cartas en tu inventario.", "error");
  }
}

function sortearCarta() {
  const rareza = sortearRareza(tabla);
  const candidatas = cartas.filter((carta) => carta.rareza === rareza && carta.coleccion === sobre.coleccion);
  return elegirAlAzar(candidatas);
}

function abrirSobre() {
  const obtenidas = [];

  for (let i = 0; i < cartasPorSobre; i++) {
    const carta = sortearCarta();
    const repetidas = obtenidas.filter((item) => item.carta.id === carta.id).length;
    const duplicada = cantidadEnInventario(carta.id) + repetidas > 0;
    obtenidas.push({ carta, duplicada });
  }

  return obtenidas;
}

function elegirPrincipal(obtenidas) {
  let mejor = obtenidas[0];

  obtenidas.forEach((item) => {
    if (item.carta.rareza > mejor.carta.rareza) {
      mejor = item;
    }
  });

  return mejor;
}

function crearPrincipal(item, obtenidas) {
  const carta = item.carta;
  const coleccion = colecciones.find((registro) => registro.id === carta.coleccion);
  const porcentaje = tabla.find((opcion) => opcion.rareza === carta.rareza).porcentaje;
  const enInventario = cantidadEnInventario(carta.id) + obtenidas.filter((registro) => registro.carta.id === carta.id).length;
  const estado = item.duplicada ? "Duplicada" : "Nueva en tu colección";
  const descripcion = item.duplicada
    ? "Ya tenías esta carta. No tiene reembolso del 100%, pero podés canjearla por crédito parcial."
    : "Ya está acreditada en tu inventario y podés pedir el envío cuando completes la colección.";

  return `
    <section class="revelacion" aria-labelledby="reveal-titulo">
      <div class="texto">
        <h2 id="reveal-titulo" tabindex="-1">¡Obtuviste una ${carta.rareza}★!</h2>
        <h3>${carta.nombre}</h3>
        <p class="rasgos">${nombresRareza[carta.rareza]} · ${coleccion.nombre} · ${numeroCarta(carta.numero, coleccion.total)} · ${estado.toLowerCase()}</p>
        <p class="descripcion">${descripcion}</p>

        <dl class="datos">
          <div>
            <dt>En inventario</dt>
            <dd>${enInventario}</dd>
          </div>
          <div>
            <dt>Colección</dt>
            <dd>${coleccion.nombre}</dd>
          </div>
          <div>
            <dt>Rareza</dt>
            <dd>${porcentaje}%</dd>
          </div>
          <div>
            <dt>N° de carta</dt>
            <dd>${numeroCarta(carta.numero, coleccion.total)}</dd>
          </div>
        </dl>

        <p class="acciones">
          <button class="boton amarillo" type="button" data-accion="otro">Abrir otro sobre</button>
          <a class="enlace" href="cuenta.html#inventario">Ver mi inventario</a>
        </p>
      </div>

      <img src="${carta.imagen}" alt="Carta de ${carta.nombre}" width="172" height="316">
    </section>`;
}

function crearResto(resto, obtenidas) {
  const duplicadas = obtenidas.filter((item) => item.duplicada).length;
  const acreditadas = obtenidas.length - duplicadas;

  return `
    <section class="resto seccion" aria-labelledby="resto-titulo">
      <div class="encabezado">
        <h2 id="resto-titulo">Resto del sobre</h2>
        <p class="subtitulo">${acreditadas} acreditadas · ${duplicadas} duplicadas entre las ${obtenidas.length} cartas del sobre.</p>
      </div>

      <ul class="grilla">
        ${resto.map((item) => `
          <li class="tarjeta-carta">
            <img src="${item.carta.imagen}" alt="Carta de ${item.carta.nombre}" width="293" height="210">
            <h3 class="nombre">${item.carta.nombre}</h3>
            <p class="detalle">${item.carta.rareza}★ · ${item.duplicada ? "duplicada" : "acreditada"}</p>
          </li>`).join("")}
      </ul>
    </section>`;
}

function mostrarResultado() {
  const obtenidas = abrirSobre();
  const destacada = elegirPrincipal(obtenidas);
  const resto = obtenidas.filter((item) => item !== destacada);
  const numeroPedido = "DR-" + Math.floor(10000 + Math.random() * 90000);

  resultado.innerHTML = `
    <section class="estado tarjeta" aria-labelledby="estado-titulo">
      <p class="etiqueta naranja">Apertura completada</p>
      <h2 id="estado-titulo">Sobre #${numeroPedido}</h2>
      <p class="subtitulo">${sobre.nombre}</p>
    </section>
    ${crearPrincipal(destacada, obtenidas)}
    ${crearResto(resto, obtenidas)}`;

  acreditarCartas(obtenidas);

  apertura.hidden = true;
  resultado.hidden = false;
  resultado.querySelector("#reveal-titulo").focus();
}

async function iniciar() {
  botonAbrir.disabled = true;

  try {
    const [productos, probabilidades, datosCartas, categorias] = await Promise.all([
      obtenerJSON("productos"),
      obtenerJSON("probabilidades"),
      obtenerJSON("cartas"),
      obtenerJSON("categorias")
    ]);

    sobre = productos.find((producto) => producto.id === principal.dataset.sobre);
    tabla = probabilidades[sobre.id];
    cartas = datosCartas.cartas;
    colecciones = categorias.colecciones;
    nombresRareza = categorias.nombresRareza;
    inventario = leer(CLAVES.inventario, datosCartas.inventarioInicial);
  } catch (error) {
    mostrarError(resultado, "No pudimos preparar la apertura del sobre.", error);
    resultado.hidden = false;
    return;
  }

  botonAbrir.disabled = false;
  botonAbrir.addEventListener("click", mostrarResultado);

  resultado.addEventListener("click", (evento) => {
    if (evento.target.dataset.accion === "otro") {
      mostrarResultado();
    }
  });
}

iniciar();
