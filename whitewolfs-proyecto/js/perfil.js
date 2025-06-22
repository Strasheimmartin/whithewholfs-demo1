document.addEventListener("DOMContentLoaded", () => {
  // --- Datos de usuario
  let usuario = localStorage.getItem("usuario") || "Alpha";
  let nivel = (window.expwolfs && typeof window.expwolfs.getnivel === "function") ? window.expwolfs.getnivel() : 1;
  let exp = (window.expwolfs && typeof window.expwolfs.getexp === "function") ? window.expwolfs.getexp() : 44; // %

  // Imagen por nivel
  function getLoboByNivel(nivel) {
    if (nivel <= 1) return "assets/img/evolucion/nivel_1__beb_col_rico.jpg";
    if (nivel == 2) return "assets/img/evolucion/nivel_2__joven_col_rico.jpg";
    if (nivel == 3) return "assets/img/evolucion/nivel_3__lider_col_rico.jpg";
    if (nivel == 4) return "assets/img/evolucion/nivel_4__alpha_eidos_col_rico.jpg";
    return "assets/img/evolucion/nivel_5__loba_celestial_de_la_conciencia_colerico.jpg";
  }

  // --- Mostrar datos perfil
  document.getElementById("nivelUsuario").textContent = "Nivel " + nivel;
  document.getElementById("nombreUsuario").textContent = usuario;
  document.getElementById("barraExp").style.width = exp + "%";
  document.getElementById("expDetalle").textContent = exp + "% EXP para subir de nivel";
  document.getElementById("avatarLobo").src = getLoboByNivel(nivel);

  // --- Logros (Desafíos completados)
  let logros = [];
  ["finanzas", "salud", "habitos"].forEach(cat => {
    let arr = JSON.parse(localStorage.getItem("desafios_" + cat)) || [];
    arr.forEach(d => {
      if (d.completado) logros.push("[" + capitalize(cat) + "] " + d.texto);
    });
  });
  let ulLogros = document.getElementById("listaLogros");
  if (logros.length === 0) {
    ulLogros.innerHTML = "<li>No completaste desafíos todavía… ¡Es hora de brillar!</li>";
  } else {
    ulLogros.innerHTML = "";
    logros.slice(0, 8).forEach(l => {
      let li = document.createElement("li");
      li.textContent = l;
      ulLogros.appendChild(li);
    });
    if (logros.length > 8) {
      let li = document.createElement("li");
      li.innerHTML = `<span style="color:#fde047;">…y ${logros.length - 8} más</span>`;
      ulLogros.appendChild(li);
    }
  }

  // --- Hábitos del día cumplidos ---
  // Ejemplo: supongamos que localStorage guarda "habitos_diarios" = [{texto: "...", completado: true, fecha: "2025-06-19"}, ...]
  let habitosHoy = [];
  const hoy = new Date().toISOString().slice(0,10);
  let arrHab = JSON.parse(localStorage.getItem("habitos_diarios") || "[]");
  arrHab.forEach(h => {
    if (h.completado && h.fecha === hoy) habitosHoy.push(h.texto);
  });
  let ulHab = document.getElementById("listaHabitos");
  if (habitosHoy.length === 0) {
    ulHab.innerHTML = "<li>No completaste ningún hábito hoy.</li>";
  } else {
    ulHab.innerHTML = "";
    habitosHoy.forEach(h => {
      let li = document.createElement("li");
      li.textContent = h;
      ulHab.appendChild(li);
    });
  }

  function capitalize(txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }
});
