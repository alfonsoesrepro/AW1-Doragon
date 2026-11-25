import { test } from "node:test";
import assert from "node:assert/strict";
import { generarNumeroPedido, describirPago, crearMensajePedido, crearEnlaceWhatsapp } from "../src/js/utilidades/pedido.js";
import { sortearRareza } from "../src/js/utilidades/sorteo.js";
import { formatoPrecio } from "../src/js/utilidades/formato.js";

const pedido = {
  numero: "DR-12345",
  cliente: { nombre: "Nahuel Ferreyra", direccion: "Av. Colón 1234", ciudad: "Córdoba" },
  pago: "Tarjeta terminada en 1111",
  items: [{ nombre: "Sobre Namek", precio: 4200, cantidad: 2 }],
  codigo: "DORAGON10",
  totales: { subtotal: 8400, drop: 900, codigo: 750, total: 6750 }
};

test("generarNumeroPedido tiene formato DR-00000", () => {
  assert.match(generarNumeroPedido(), /^DR-\d{5}$/);
  assert.equal(generarNumeroPedido(() => 0), "DR-10000");
});

test("describirPago muestra solo los últimos 4 dígitos de la tarjeta", () => {
  assert.equal(describirPago("tarjeta", "4111 1111 1111 1234"), "Tarjeta terminada en 1234");
  assert.equal(describirPago("transferencia"), "Transferencia bancaria");
});

test("crearMensajePedido incluye número, productos y total", () => {
  const mensaje = crearMensajePedido(pedido);

  assert.match(mensaje, /DR-12345/);
  assert.match(mensaje, /Sobre Namek x2/);
  assert.match(mensaje, new RegExp(`Total: \\${formatoPrecio(6750)}`));
  assert.match(mensaje, /Código DORAGON10/);
});

test("crearEnlaceWhatsapp codifica el texto y limpia el número", () => {
  const enlace = crearEnlaceWhatsapp("+54 9 351 000-0000", "Hola mundo & más");
  assert.equal(enlace, "https://wa.me/5493510000000?text=Hola%20mundo%20%26%20m%C3%A1s");
});

test("sortearRareza respeta la tabla de probabilidades", () => {
  const tabla = [{ rareza: 5, porcentaje: 0 }, { rareza: 2, porcentaje: 100 }];

  for (let i = 0; i < 50; i++) {
    assert.equal(sortearRareza(tabla), 2);
  }
});
