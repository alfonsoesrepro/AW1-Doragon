// Notificación flotante ("toast") para avisarle al usuario el resultado de una acción.
export function mostrarAviso(texto, tipo = "exito", duracion = 5000) {
  // Si hay un <dialog> abierto, el aviso va adentro para no quedar detrás del fondo del modal.
  const contenedor = document.querySelector("dialog[open]") || document.body;
  let zona = contenedor.querySelector(":scope > .avisos");

  if (!zona) {
    zona = document.createElement("div");
    zona.className = "avisos";
    zona.setAttribute("aria-live", "polite");
    contenedor.append(zona);
  }

  const aviso = document.createElement("p");
  aviso.className = `aviso-flotante ${tipo}`;
  aviso.setAttribute("role", tipo === "error" ? "alert" : "status");
  aviso.textContent = texto;
  zona.append(aviso);

  setTimeout(() => aviso.remove(), duracion);
}
