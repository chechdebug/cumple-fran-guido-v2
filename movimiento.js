// Cuenta regresiva + entradas al hacer scroll. No toca el formulario (eso está en app.js).
document.documentElement.classList.add("js");

// Sábado 5/12/2026, 11:00 hora Argentina
const INICIO = new Date("2026-12-05T11:00:00-03:00").getTime();
const cuenta = document.getElementById("cuenta");
const celdas = {};
cuenta.querySelectorAll("[data-u]").forEach((b) => (celdas[b.dataset.u] = b));
const dos = (n) => String(n).padStart(2, "0");
const frase = document.getElementById("frase-dias");

function tic() {
  const resta = INICIO - Date.now();
  if (resta <= 0) {
    cuenta.classList.add("ya");
    cuenta.innerHTML = "<div><b>¡Es hoy!</b><span>nos vemos en la pile</span></div>";
    frase.textContent = "¡Es hoy!";
    return;
  }
  const s = Math.floor(resta / 1000);
  const dias = Math.floor(s / 86400);
  celdas.d.textContent = dias;
  frase.textContent = dias === 1 ? "1 día falta" : dias + " días faltan";
  celdas.h.textContent = dos(Math.floor((s % 86400) / 3600));
  celdas.m.textContent = dos(Math.floor((s % 3600) / 60));
  celdas.s.textContent = dos(s % 60);
  setTimeout(tic, 1000 - (Date.now() % 1000));
}
tic();

// Entradas: cada elemento aparece una vez; los hermanos se escalonan.
const elementos = document.querySelectorAll(".revela");
const verlo = (el) => el.classList.add("visible");

if (!("IntersectionObserver" in window)) {
  elementos.forEach(verlo);
} else {
  elementos.forEach((el) => {
    const hermanos = [...el.parentElement.children].filter((h) => h.classList.contains("revela"));
    el.style.setProperty("--d", hermanos.indexOf(el) * 80 + "ms");
  });
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { verlo(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  elementos.forEach((el) => obs.observe(el));
}
