// Pegar este código en la planilla: Extensiones → Apps Script.
// Guarda una fila por invitado en la primera hoja de la planilla.

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const datos = JSON.parse(e.postData.contents);
    const invitados = (datos.invitados || []).slice(0, 20);
    const comentario = String(datos.comentario || "").slice(0, 500);
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const fecha = new Date();
    const nombres = invitados.map(function (i) { return limpiar(i.nombre, 80); });

    const filas = invitados.map(function (inv, idx) {
      const otros = nombres.filter(function (_, j) { return j !== idx; }).join(", ");
      return [
        fecha,
        nombres[idx],
        limpiar(inv.whatsapp, 30),
        inv.pool ? "Sí" : "No",
        inv.bus ? "Sí" : "No",
        inv.boliche ? "Sí" : "No",
        limpiar(comentario, 500),
        otros,
      ];
    }).filter(function (f) { return f[1]; });

    if (filas.length) {
      hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true, filas: filas.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Evita que un texto que empiece con = + - @ se tome como fórmula.
function limpiar(valor, max) {
  let s = String(valor || "").trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
