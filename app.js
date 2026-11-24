// Link de la "Aplicación web" de Apps Script (la que guarda en el Google Sheets).
const URL_PLANILLA = "https://script.google.com/macros/s/AKfycbwblONk_OhM9HaVBrwZgE4piLeYtwRTlMqiiMrvKfy9klMc9m5VeHiEf0YG3PJVHtGC7w/exec";

const lista = document.getElementById("invitados");
const tpl = document.getElementById("tpl-invitado");
const form = document.getElementById("form");
const error = document.getElementById("error");
const enviar = document.getElementById("enviar");
const listo = document.getElementById("listo");

function renumerar() {
  lista.querySelectorAll(".invitado").forEach((f, i) => {
    f.querySelector(".num").textContent = i + 1;
  });
}

function agregarInvitado(enfocar) {
  const nodo = tpl.content.firstElementChild.cloneNode(true);
  nodo.querySelector(".quitar").addEventListener("click", () => {
    nodo.remove();
    renumerar();
  });
  nodo.querySelector("input[name=nombre]").addEventListener("input", (e) => {
    e.target.classList.remove("invalido");
  });
  lista.appendChild(nodo);
  renumerar();
  if (enfocar) nodo.querySelector("input[name=nombre]").focus();
}

document.getElementById("agregar").addEventListener("click", () => agregarInvitado(true));

document.getElementById("otra").addEventListener("click", () => {
  form.reset();
  lista.innerHTML = "";
  agregarInvitado(false);
  listo.hidden = true;
  form.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

function mostrarError(msg) {
  error.textContent = msg;
  error.hidden = !msg;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarError("");

  const invitados = [];
  let primeroVacio = null;
  lista.querySelectorAll(".invitado").forEach((f) => {
    const nombre = f.querySelector("[name=nombre]");
    const valor = nombre.value.trim().replace(/\s+/g, " ");
    if (!valor) {
      nombre.classList.add("invalido");
      primeroVacio = primeroVacio || nombre;
      return;
    }
    invitados.push({
      nombre: valor,
      whatsapp: f.querySelector("[name=whatsapp]").value.trim(),
      pool: f.querySelector("[name=pool]").checked,
      bus: f.querySelector("[name=bus]").checked,
      boliche: f.querySelector("[name=boliche]").checked,
    });
  });

  if (primeroVacio) {
    mostrarError("Falta el nombre y apellido de algún invitado.");
    primeroVacio.focus();
    return;
  }
  if (!URL_PLANILLA) {
    mostrarError("Todavía no está conectada la planilla. Probá de nuevo en un rato.");
    return;
  }

  const datos = {
    invitados,
    comentario: form.comentario.value.trim(),
  };

  enviar.disabled = true;
  enviar.textContent = "Enviando…";
  try {
    // text/plain + no-cors: así Apps Script lo recibe sin bloqueos del navegador.
    await fetch(URL_PLANILLA, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(datos),
    });
    const nombres = invitados.map((i) => i.nombre);
    document.getElementById("listo-nombres").textContent =
      (nombres.length > 1 ? "Quedaron anotados: " : "Quedó anotado/a: ") + nombres.join(", ") + ".";
    form.hidden = true;
    listo.hidden = false;
    listo.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (err) {
    mostrarError("No se pudo enviar. Revisá tu conexión y probá de nuevo.");
  } finally {
    enviar.disabled = false;
    enviar.textContent = "Confirmar";
  }
});

agregarInvitado(false);
