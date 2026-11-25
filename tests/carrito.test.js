import { test } from "node:test";
import assert from "node:assert/strict";
import { agregarItem, cambiarCantidadItem, quitarItem, contarUnidades, calcularTotales } from "../src/js/utilidades/carrito.js";

const productos = [
  { id: "a", precio: 1000, stock: 5 },
  { id: "b", precio: 2500, stock: 2 }
];

test("agregarItem suma un producto nuevo al carrito", () => {
  assert.deepEqual(agregarItem([], "a", 2, 5), [{ id: "a", cantidad: 2 }]);
});

test("agregarItem acumula la cantidad sin pasar el stock", () => {
  const items = [{ id: "b", cantidad: 1 }];
  assert.deepEqual(agregarItem(items, "b", 5, 2), [{ id: "b", cantidad: 2 }]);
});

test("agregarItem no modifica la lista original", () => {
  const items = [{ id: "a", cantidad: 1 }];
  agregarItem(items, "a", 1, 5);
  assert.deepEqual(items, [{ id: "a", cantidad: 1 }]);
});

test("cambiarCantidadItem limita entre 1 y el stock", () => {
  const items = [{ id: "a", cantidad: 2 }];
  assert.equal(cambiarCantidadItem(items, "a", 0, 5)[0].cantidad, 1);
  assert.equal(cambiarCantidadItem(items, "a", 99, 5)[0].cantidad, 5);
});

test("quitarItem y contarUnidades", () => {
  const items = [{ id: "a", cantidad: 2 }, { id: "b", cantidad: 1 }];
  assert.deepEqual(quitarItem(items, "a"), [{ id: "b", cantidad: 1 }]);
  assert.equal(contarUnidades(items), 3);
});

test("calcularTotales aplica descuento drop y código", () => {
  const items = [{ id: "a", cantidad: 2 }, { id: "b", cantidad: 2 }];
  const resultado = calcularTotales(items, productos, { descuentoDrop: 1000, porcentajeCodigo: 0.1 });

  assert.deepEqual(resultado, { subtotal: 7000, drop: 1000, codigo: 700, total: 5300 });
});

test("calcularTotales con carrito vacío da todo en cero", () => {
  assert.deepEqual(
    calcularTotales([], productos, { descuentoDrop: 900 }),
    { subtotal: 0, drop: 0, codigo: 0, total: 0 }
  );
});
