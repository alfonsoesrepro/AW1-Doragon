// Reglas de validación en JavaScript. Cada función devuelve "" si el valor es válido
// o el mensaje de error a mostrar. Son puras para poder probarlas con node --test.

const soloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]+$/;
const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarNombre(valor) {
  const texto = valor.trim();

  if (texto.length < 3) {
    return "Ingresá al menos 3 letras.";
  }

  if (!soloLetras.test(texto)) {
    return "El nombre solo puede tener letras y espacios.";
  }

  return "";
}

export function validarEmail(valor) {
  return formatoEmail.test(valor.trim()) ? "" : "Ingresá un email válido, por ejemplo nombre@correo.com.";
}

export function validarDni(valor) {
  return /^\d{7,8}$/.test(valor.trim()) ? "" : "El DNI tiene que tener 7 u 8 números, sin puntos.";
}

export function validarDireccion(valor) {
  const texto = valor.trim();

  if (texto.length < 5) {
    return "Ingresá la calle y el número.";
  }

  return /\d/.test(texto) ? "" : "Falta la altura (número) de la dirección.";
}

export function validarTarjeta(valor) {
  const digitos = valor.replace(/\s/g, "");
  return /^\d{16}$/.test(digitos) ? "" : "El número de tarjeta tiene que tener 16 dígitos.";
}

export function validarVencimiento(valor, hoy = new Date()) {
  const partes = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(valor.trim());

  if (!partes) {
    return "Usá el formato MM/AA.";
  }

  const mes = Number(partes[1]);
  const anio = 2000 + Number(partes[2]);
  const finDelMes = new Date(anio, mes, 0, 23, 59, 59);

  return finDelMes >= hoy ? "" : "La tarjeta está vencida.";
}

export function validarCvv(valor) {
  return /^\d{3,4}$/.test(valor.trim()) ? "" : "El CVV tiene 3 o 4 números.";
}

export function validarMensaje(valor) {
  return valor.trim().length >= 10 ? "" : "Contanos un poco más (mínimo 10 caracteres).";
}

export function validarNumeroPedido(valor) {
  const texto = valor.trim();
  return texto === "" || /^DR-\d{5}$/.test(texto) ? "" : "Usá el formato DR-00000.";
}
