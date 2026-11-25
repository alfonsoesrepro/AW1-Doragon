import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validarNombre, validarEmail, validarDni, validarDireccion,
  validarTarjeta, validarVencimiento, validarCvv, validarNumeroPedido
} from "../src/js/utilidades/validaciones.js";

test("validarNombre acepta letras y rechaza números o textos cortos", () => {
  assert.equal(validarNombre("Nahuel Ferreyra"), "");
  assert.equal(validarNombre("José Núñez"), "");
  assert.notEqual(validarNombre("Al"), "");
  assert.notEqual(validarNombre("R2D2"), "");
});

test("validarEmail", () => {
  assert.equal(validarEmail("tu@email.com"), "");
  assert.notEqual(validarEmail("tu@email"), "");
  assert.notEqual(validarEmail("sin-arroba.com"), "");
});

test("validarDni pide 7 u 8 números sin puntos", () => {
  assert.equal(validarDni("12345678"), "");
  assert.notEqual(validarDni("12.345.678"), "");
  assert.notEqual(validarDni("123"), "");
});

test("validarDireccion exige calle y altura", () => {
  assert.equal(validarDireccion("Av. Colón 1234"), "");
  assert.notEqual(validarDireccion("Av. Colón"), "");
});

test("validarTarjeta pide 16 dígitos, con o sin espacios", () => {
  assert.equal(validarTarjeta("4111 1111 1111 1111"), "");
  assert.notEqual(validarTarjeta("4111 1111"), "");
});

test("validarVencimiento rechaza tarjetas vencidas", () => {
  const hoy = new Date(2026, 10, 25);
  assert.equal(validarVencimiento("11/26", hoy), "");
  assert.equal(validarVencimiento("01/30", hoy), "");
  assert.notEqual(validarVencimiento("10/26", hoy), "");
  assert.notEqual(validarVencimiento("13/30", hoy), "");
});

test("validarCvv y validarNumeroPedido", () => {
  assert.equal(validarCvv("123"), "");
  assert.notEqual(validarCvv("12"), "");
  assert.equal(validarNumeroPedido(""), "");
  assert.equal(validarNumeroPedido("DR-12345"), "");
  assert.notEqual(validarNumeroPedido("DR-12"), "");
});
