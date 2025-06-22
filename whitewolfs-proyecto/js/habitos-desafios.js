// ==== DATA PRINCIPAL ====
let habitos = JSON.parse(localStorage.getItem("habitos")) || [];
let desafios = JSON.parse(localStorage.getItem("desafios")) || [];
let xp = Number(localStorage.getItem("xp") || 0);
let nivel = Number(localStorage.getItem("nivel") || 1);

// ==== HÁBITOS ====
function renderHabitos() {
  const ul = document.getElementById("listahabitos");
  ul.innerHTML = "";
  if (!habitos.length) ul.innerHTML = "<li>No hay hábitos. Agregá uno!</li>";
  habitos.forEach((h, i) => {
    const li = document.createElement("li");
    li.style.marginBottom = "9px";
    li.innerHTML = `
      <input type="checkbox" ${h.cumplido ? "checked" : ""} onchange="toggleHabito(${i})" />
      <span style="color:#fde047;font-weight:600;">${h.nombre}</span>
      <span style="font-size:.89em;color:#aee7fa;">[${h.categoria}]</span>
      <button onclick="eliminarHabito(${i})" style="margin-left:14px;padding:2px 8px;border-radius:7px;background:#1a2838;color:#fde047;border:none;cursor:pointer;">Eliminar</button>
    `;
    ul.appendChild(li);
  });
  actualizarProgresoHabitos();
}

window.toggleHabito = function(i) {
  habitos[i].cumplido = !habitos[i].cumplido;
  if(habitos[i].cumplido) sumarXP(5); // Cada hábito suma 5 XP
  localStorage.setItem("habitos", JSON.stringify(habitos));
  renderHabitos();
};

window.eliminarHabito = function(i) {
  habitos.splice(i, 1);
  localStorage.setItem("habitos", JSON.stringify(habitos));
  renderHabitos();
};

document.getElementById("formnuevohabito").onsubmit = function(e) {
  e.preventDefault();
  const nombre = document.getElementById("inputnombrehabito").value.trim();
  const categoria = document.getElementById("inputcategoriahabito").value;
  if (!nombre) return;
  habitos.push({ nombre, categoria, cumplido: false });
  localStorage.setItem("habitos", JSON.stringify(habitos));
  this.reset();
  renderHabitos();
};

function actualizarProgresoHabitos() {
  const total = habitos.length;
  const cumplidos = habitos.filter(h => h.cumplido).length;
  const porcentaje = total ? Math.round((cumplidos / total) * 100) : 0;
  document.getElementById("progresohabitos").value = porcentaje;
  document.getElementById("txtprogresohabitos").textContent = `Hábitos cumplidos: ${cumplidos} de ${total} (${porcentaje}%)`;
  actualizarLobezno();
}

// ==== DESAFÍOS ====
function renderDesafios() {
  const ul = document.getElementById("listadesafios");
  ul.innerHTML = "";
  if (!desafios.length) ul.innerHTML = "<li>No hay desafíos. Agregá uno!</li>";
  desafios.forEach((d, i) => {
    const li = document.createElement("li");
    li.style.marginBottom = "9px";
    li.innerHTML = `
      <input type="checkbox" ${d.cumplido ? "checked" : ""} onchange="toggleDesafio(${i})" />
      <span style="color:#7ee787;font-weight:600;">${d.nombre}</span>
      <span style="font-size:.89em;color:#74aefb;">[${d.categoria}]</span>
      <button onclick="eliminarDesafio(${i})" style="margin-left:14px;padding:2px 8px;border-radius:7px;background:#1a2838;color:#7ee787;border:none;cursor:pointer;">Eliminar</button>
    `;
    ul.appendChild(li);
  });
  actualizarProgresoDesafios();
}

window.toggleDesafio = function(i) {
  desafios[i].cumplido = !desafios[i].cumplido;
  if(desafios[i].cumplido) sumarXP(12); // Cada desafío suma 12 XP
  localStorage.setItem("desafios", JSON.stringify(desafios));
  renderDesafios();
};

window.eliminarDesafio = function(i) {
  desafios.splice(i, 1);
  localStorage.setItem("desafios", JSON.stringify(desafios));
  renderDesafios();
};

document.getElementById("formnuevodesafio").onsubmit = function(e) {
  e.preventDefault();
  const nombre = document.getElementById("inputnombredesafio").value.trim();
  const categoria = document.getElementById("inputcategoriadesafio").value;
  if (!nombre) return;
  desafios.push({ nombre, categoria, cumplido: false });
  localStorage.setItem("desafios", JSON.stringify(desafios));
  this.reset();
  renderDesafios();
};

function actualizarProgresoDesafios() {
  const total = desafios.length;
  const cumplidos = desafios.filter(d => d.cumplido).length;
  const porcentaje = total ? Math.round((cumplidos / total) * 100) : 0;
  document.getElementById("progresodesafios").value = porcentaje;
  document.getElementById("txtprogresodesafios").textContent = `Desafíos completados: ${cumplidos} de ${total} (${porcentaje}%)`;
  actualizarLobezno();
}

// ==== XP y Niveles ====
function sumarXP(cantidad) {
  xp += cantidad;
  if(xp >= 100) {
    xp -= 100;
    nivel++;
    mensajeLobezno("¡Subiste de nivel! Ahora sos nivel " + nivel + ".");
  }
  localStorage.setItem("xp", xp);
  localStorage.setItem("nivel", nivel);
  renderXP();
}

function renderXP() {
  document.getElementById("xpbar").value = xp;
  document.getElementById("xptext").textContent = xp + " / 100 XP";
  document.getElementById("xpnivel").textContent = "Nivel " + nivel;
}
function mensajeLobezno(msg) {
  document.getElementById("fraselobezno").textContent = msg;
  setTimeout(() => actualizarLobezno(), 2800);
}

// ==== LOBEZNO ====
function actualizarLobezno() {
  // Estado global
  const porcHabitos = habitos.length ? habitos.filter(h => h.cumplido).length / habitos.length : 0;
  const porcDesafios = desafios.length ? desafios.filter(d => d.cumplido).length / desafios.length : 0;
  let estado = "";
  let img = "assets/img/lobezno-balanceado.png";
  if (porcHabitos === 1 && porcDesafios === 1 && habitos.length && desafios.length) {
    estado = "¡Perfecto! Sos un lobo imparable.";
    img = "assets/img/lobezno-imparable.png";
  } else if (porcHabitos >= 0.7 || porcDesafios >= 0.7) {
    estado = "¡Buen trabajo! Seguí así y evolucionás.";
    img = "assets/img/lobezno-balanceado.png";
  } else if (porcHabitos > 0 || porcDesafios > 0) {
    estado = "Vas en camino. ¡No te detengas!";
    img = "assets/img/lobezno-normal.png";
  } else {
    estado = "Hoy podés cambiar tu historia.";
    img = "assets/img/lobezno-triste.png";
  }
  document.getElementById("fraselobezno").textContent = estado;
  document.getElementById("imglobezno").src = img;
}

// ==== RESET ====
window.resetearHabitos = function() {
  habitos.forEach(h => h.cumplido = false);
  localStorage.setItem("habitos", JSON.stringify(habitos));
  renderHabitos();
};
window.resetearDesafios = function() {
  desafios.forEach(d => d.cumplido = false);
  localStorage.setItem("desafios", JSON.stringify(desafios));
  renderDesafios();
};

// ==== INICIALIZACIÓN ====
window.onload = () => {
  renderHabitos();
  renderDesafios();
  renderXP();
  actualizarLobezno();
};
