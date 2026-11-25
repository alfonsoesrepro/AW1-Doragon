// Validación de formularios combinando las restricciones HTML (required, pattern,
// minlength, type="email") con reglas extra escritas en JavaScript.

function mensajeHTML(campo) {
  const validez = campo.validity;

  if (validez.valid) {
    return "";
  }

  if (validez.valueMissing) {
    return campo.type === "checkbox" ? "Tenés que aceptar para continuar." : "Este campo es obligatorio.";
  }

  if (validez.typeMismatch) {
    return "El formato no es válido.";
  }

  if (validez.tooShort) {
    return `Ingresá al menos ${campo.minLength} caracteres.`;
  }

  if (validez.patternMismatch) {
    return campo.title || "El formato no es válido.";
  }

  return campo.validationMessage;
}

function elementoError(campo) {
  const id = (campo.id || campo.name) + "-error";
  let error = document.getElementById(id);

  if (!error) {
    error = document.createElement("p");
    error.id = id;
    error.className = "error-campo";
    error.hidden = true;

    const ancla = campo.closest(".casilla, .campos") || campo;
    ancla.after(error);
    campo.setAttribute("aria-describedby", id);
  }

  return error;
}

function validarCampo(campo, reglas) {
  campo.setCustomValidity("");

  const regla = reglas[campo.name];
  const mensaje = mensajeHTML(campo) || (regla && campo.value !== "" ? regla(campo.value) : "");
  const error = elementoError(campo);

  campo.setCustomValidity(mensaje);
  campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
  error.textContent = mensaje;
  error.hidden = mensaje === "";

  return mensaje === "";
}

function camposDe(formulario) {
  return [...formulario.elements].filter((campo) =>
    ["INPUT", "SELECT", "TEXTAREA"].includes(campo.tagName) &&
    !campo.disabled &&
    !["submit", "button", "radio", "hidden"].includes(campo.type)
  );
}

export function validarFormulario(formulario, reglas = {}) {
  const invalidos = camposDe(formulario).filter((campo) => !validarCampo(campo, reglas));

  if (invalidos.length > 0) {
    invalidos[0].focus();
  }

  return invalidos.length === 0;
}

export function limpiarErrores(formulario) {
  formulario.querySelectorAll(".error-campo").forEach((error) => {
    error.hidden = true;
  });

  camposDe(formulario).forEach((campo) => {
    campo.setCustomValidity("");
    campo.removeAttribute("aria-invalid");
  });
}

// Desactiva los globos nativos del navegador (los mensajes los muestra JS) y
// vuelve a validar cada campo a medida que el usuario lo completa o corrige.
export function activarValidacion(formulario, reglas = {}) {
  formulario.noValidate = true;

  formulario.addEventListener("input", (evento) => {
    if (evento.target.getAttribute("aria-invalid") === "true") {
      validarCampo(evento.target, reglas);
    }
  });

  formulario.addEventListener("focusout", (evento) => {
    const campo = evento.target;

    if (camposDe(formulario).includes(campo) && campo.value !== "") {
      validarCampo(campo, reglas);
    }
  });
}
