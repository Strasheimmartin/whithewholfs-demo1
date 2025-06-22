// --- LOGIN SENCILLO (email/clave) ---

const usuariosDemo = [
  { email: "martin@demo.com", pass: "libertad123" },
  { email: "test@demo.com", pass: "pro123" }
];

function renderizarLogin() {
  const box = document.getElementById('loginBox');
  box.innerHTML = `
    <div class="login-card">
      <h3>Ingresá a tu cuenta</h3>
      <input type="email" id="loginEmail" placeholder="Email" autocomplete="username" required>
      <input type="password" id="loginPass" placeholder="Contraseña" autocomplete="current-password" required>
      <button id="btnLogin">Ingresar</button>
      <div id="loginError" class="login-error"></div>
      <div style="font-size:.97em;color:#7ee;">Usuario demo: martin@demo.com / libertad123</div>
    </div>
  `;
  document.getElementById('btnLogin').onclick = validarLogin;
}

function validarLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  let usuarios = JSON.parse(localStorage.getItem('usuariosLibertad')) || usuariosDemo;
  const existe = usuarios.find(u => u.email === email && u.pass === pass);
  const error = document.getElementById('loginError');
  if (existe) {
    localStorage.setItem('usuarioLogueadoLibertad', email);
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById('simuladorBox').classList.remove('hidden');
    inicializarSimulador();
  } else {
    error.innerText = "Email o contraseña incorrectos.";
  }
}

function checkLogin() {
  const email = localStorage.getItem('usuarioLogueadoLibertad');
  if (email) {
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById('simuladorBox').classList.remove('hidden');
    inicializarSimulador();
  } else {
    renderizarLogin();
  }
}

// --- NIVELES Y DESBLOQUEOS ---

const INSTRUMENTOS = [
  {
    clave: "plazo_fijo",
    nombre: "Plazo Fijo ARS",
    tasa: 0.08,
    nivel: 1,
    descripcion: "Bajo riesgo, tasa fija mensual.",
    info: "Clásico en Argentina. Simula la tasa actualizada. Ideal para empezar.",
    req: null // siempre disponible
  },
  {
    clave: "dolar",
    nombre: "Dólar MEP",
    tasa: 0.025,
    nivel: 1,
    descripcion: "Apreciación mensual promedio.",
    info: "Simula compra de dólar MEP. Refugio clásico argentino.",
    req: null
  },
  {
    clave: "money_market",
    nombre: "Fondo Money Market",
    tasa: 0.045,
    nivel: 1,
    descripcion: "Fondo conservador, bajo riesgo.",
    info: "Rendimiento estable, muy líquido. Bueno para aprender.",
    req: null
  },
  {
    clave: "acciones",
    nombre: "Acciones (CEDEARs)",
    tasa: 0.085,
    nivel: 2,
    descripcion: "Volatilidad media, promedio histórico.",
    info: "Simula Apple, Coca-Cola, Petrobras, etc.",
    req: "Desbloqueá completando el desafío '¿Qué es un CEDEAR?' en educación."
  },
  {
    clave: "bonos",
    nombre: "Bonos Soberanos",
    tasa: 0.053,
    nivel: 2,
    descripcion: "Riesgo medio, renta fija.",
    info: "Ejemplo: AL30, GD30. Aprende sobre bonos y riesgo país.",
    req: "Validá que leíste la guía de bonos."
  },
  {
    clave: "cripto",
    nombre: "Criptomonedas (BTC/ETH)",
    tasa: 0.13,
    nivel: 3,
    descripcion: "Alta volatilidad y riesgo.",
    info: "Aptos para quienes se educan sobre volatilidad y riesgo.",
    req: "Completá el minitest de cripto y validá aquí."
  },
  {
    clave: "etf",
    nombre: "ETF S&P500 (VOO/SPY)",
    tasa: 0.069,
    nivel: 3,
    descripcion: "Acciones globales diversificadas.",
    info: "Ideal para diversificación internacional.",
    req: "Completá el desafío '¿Qué es un ETF?' en educación y validá."
  },
  {
    clave: "oro",
    nombre: "Oro/Commodities",
    tasa: 0.025,
    nivel: 3,
    descripcion: "Refugio tradicional ante crisis.",
    info: "Aprendé por qué los ricos aman el oro.",
    req: "Validá cuando completes la guía de oro."
  }
];

// Estado de desbloqueo manual, por usuario:
function getDesbloqueados() {
  const email = localStorage.getItem('usuarioLogueadoLibertad') || "";
  let datos = JSON.parse(localStorage.getItem('desbloqueos_' + email)) || {};
  INSTRUMENTOS.forEach(inst => {
    if (!(inst.clave in datos)) datos[inst.clave] = inst.nivel === 1; // básicos liberados
  });
  return datos;
}

function setDesbloqueado(clave) {
  const email = localStorage.getItem('usuarioLogueadoLibertad') || "";
  let datos = getDesbloqueados();
  datos[clave] = true;
  localStorage.setItem('desbloqueos_' + email, JSON.stringify(datos));
  animarDesbloqueo(instPorClave(clave));
  renderizarSimulador();
}

function instPorClave(clave) {
  return INSTRUMENTOS.find(inst => inst.clave === clave);
}

function renderizarBarraNiveles() {
  const cont = document.getElementById('progresoNiveles');
  const desbloq = getDesbloqueados();
  const niveles = [1, 2, 3];
  let html = `<div><b>Instrumentos desbloqueados:</b> `;
  INSTRUMENTOS.forEach(inst => {
    html += `<span class="nivel-ins ${desbloq[inst.clave] ? 'desbloq' : 'bloq'}">${inst.nombre}</span> `;
  });
  html += `</div>`;
  cont.innerHTML = html;
}

// --- SIMULADOR ---

function renderizarSimulador() {
  renderizarBarraNiveles();
  const desbloq = getDesbloqueados();
  const cont = document.getElementById('simuladorContainer');
  let capital = parseFloat(localStorage.getItem('creadorlibertadCapital')) || 100000;
  cont.innerHTML = `
    <div>
      <b>Capital virtual actual:</b> $${capital.toLocaleString("es-AR")}
      <br><br>
      <label>Monto a invertir: <input type="number" id="montoInvertir" value="10000" min="1000" step="1000" max="${capital}" /></label>
      <br><br>
      <label>Instrumento:
        <select id="instrumentoInvertir">
          ${INSTRUMENTOS.map((inst, i) => `
            <option value="${inst.clave}" ${!desbloq[inst.clave] ? 'disabled style="color:#aaa;"' : ''}>
              ${inst.nombre} ${!desbloq[inst.clave] ? '🔒' : ''}
            </option>
          `).join("")}
        </select>
      </label>
      <br>
      ${INSTRUMENTOS.map(inst => `
        <div class="info-instrumento" id="info_${inst.clave}" style="display:none;">
          <span class="desc-ins">${inst.descripcion}.</span>
          <span style="font-size:.98em;">${inst.info}</span>
          ${!desbloq[inst.clave] && inst.req ? `<div class="cartel-bloqueo">${inst.req}
          <button class="btn-validar-desbloq" data-clave="${inst.clave}">Validar desbloqueo</button></div>` : ""}
        </div>
      `).join("")}
      <br>
      <label>Plazo (meses):
        <select id="plazoInvertir">
          <option value="1">1</option>
          <option value="3">3</option>
          <option value="6">6</option>
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="36">36</option>
        </select>
      </label>
      <br><br>
      <button id="btnSimularInversion">Simular</button>
    </div>
  `;

  // Mostrar info del instrumento seleccionado
  const sel = document.getElementById('instrumentoInvertir');
  function showInfo() {
    INSTRUMENTOS.forEach(inst => {
      document.getElementById('info_' + inst.clave).style.display = "none";
    });
    const clave = sel.value;
    if (clave) document.getElementById('info_' + clave).style.display = "block";
  }
  sel.onchange = showInfo;
  showInfo();

  // Validar desbloqueos manuales
  document.querySelectorAll('.btn-validar-desbloq').forEach(btn => {
    btn.onclick = () => {
      if (confirm("¿Realmente completaste el desafío/guía de este instrumento? Si es así, ¡podrás simularlo ya!")) {
        setDesbloqueado(btn.dataset.clave);
      }
    }
  });

  document.getElementById('btnSimularInversion').onclick = simularInversion;
}

function animarDesbloqueo(inst) {
  const div = document.getElementById('festejoDesbloqueo');
  div.innerHTML = `
    <div class="desbloqueo-anim">
      <span class="desbloqueo-estrella">&#11088;</span>
      <h3>¡Instrumento desbloqueado!</h3>
      <div class="desbloqueo-nombre">${inst.nombre}</div>
      <p>¡Ahora podés simularlo libremente!</p>
    </div>
  `;
  setTimeout(() => { div.innerHTML = ""; }, 2600);
}

// ---- SIMULACIÓN Y HISTORIAL ----

function simularInversion() {
  const monto = parseFloat(document.getElementById('montoInvertir').value);
  const clave = document.getElementById('instrumentoInvertir').value;
  const meses = parseInt(document.getElementById('plazoInvertir').value);
  let capital = parseFloat(localStorage.getItem('creadorlibertadCapital')) || 100000;

  const inst = instPorClave(clave);
  const desbloq = getDesbloqueados();
  if (!desbloq[clave]) {
    alert("Desbloqueá este instrumento antes.");
    return;
  }
  if (isNaN(monto) || monto < 1000 || monto > capital) {
    alert("Ingresá un monto válido.");
    return;
  }

  // Simulación compuesta
  let resultado = monto * Math.pow(1 + inst.tasa, meses);
  resultado = Math.round(resultado);

  // Update capital virtual
  capital -= monto;
  capital += resultado;
  localStorage.setItem('creadorlibertadCapital', capital);

  // Guardar historial de simulador PRO
  const email = localStorage.getItem('usuarioLogueadoLibertad') || "";
  let historial = JSON.parse(localStorage.getItem('historialSimuladorLibertad_' + email)) || [];
  historial.unshift({
    fecha: new Date().toLocaleString(),
    instrumento: inst.nombre,
    clave,
    monto,
    meses,
    resultado
  });
  localStorage.setItem('historialSimuladorLibertad_' + email, JSON.stringify(historial));

  mostrarResultadoSimulador(inst, monto, meses, resultado);
  renderizarSimulador();
  renderizarHistorialSimulador();
  renderizarGraficos();
}

function mostrarResultadoSimulador(inst, monto, meses, resultado) {
  const res = document.getElementById('resultadoSimulador');
  res.innerHTML = `
    <div class="simulador-resultado">
      <h4>¡Simulación completada!</h4>
      <p>Instrumento: <b>${inst.nombre}</b><br>
      Monto inicial: <b>$${monto.toLocaleString("es-AR")}</b><br>
      Plazo: <b>${meses} meses</b><br>
      <b>Total final:</b> $${resultado.toLocaleString("es-AR")}</p>
    </div>
  `;
  res.classList.remove("hidden");
}

function renderizarHistorialSimulador() {
  const email = localStorage.getItem('usuarioLogueadoLibertad') || "";
  const hist = document.getElementById('historialSimulador');
  let historial = JSON.parse(localStorage.getItem('historialSimuladorLibertad_' + email)) || [];
  if (!hist) return;
  if (historial.length === 0) {
    hist.innerHTML = "<p>No realizaste simulaciones aún.</p>";
    return;
  }
  let html = "<h4>Historial de simulaciones</h4><ul>";
  historial.slice(0, 10).forEach((h) => {
    html += `<li>
      [${h.fecha}] Invertiste <b>$${h.monto.toLocaleString("es-AR")}</b> en <b>${h.instrumento}</b> por <b>${h.meses} meses</b> → <b>$${h.resultado.toLocaleString("es-AR")}</b>
    </li>`;
  });
  html += "</ul>";
  hist.innerHTML = html;
}

// ---- GRAFICOS CHART.JS ----

let graficoBarras, graficoLineas;

function renderizarGraficos() {
  const email = localStorage.getItem('usuarioLogueadoLibertad') || "";
  let historial = JSON.parse(localStorage.getItem('historialSimuladorLibertad_' + email)) || [];

  // --- Barras comparativas (última simulación)
  if (graficoBarras) graficoBarras.destroy();
  if (historial.length === 0) return;
  const ultimos = historial.slice(0, 6).reverse(); // máximo 6 barras
  const ctxBarras = document.getElementById('graficoBarras').getContext('2d');
  graficoBarras = new Chart(ctxBarras, {
    type: 'bar',
    data: {
      labels: ultimos.map(h => h.instrumento),
      datasets: [{
        label: 'Monto final',
        data: ultimos.map(h => h.resultado),
        backgroundColor: [
          '#00ffae', '#ffb800', '#20b2ff', '#e94fff', '#fa6c32', '#72fa55'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#fff" }
        },
        x: {
          ticks: { color: "#fff" }
        }
      }
    }
  });

  // --- Líneas (evolución histórica)
  document.getElementById('btnVerEvolucion').onclick = function() {
    document.getElementById('graficoLineas').classList.toggle('hidden');
    renderizarGraficoLineas();
  };
}

function renderizarGraficoLineas() {
  const email = localStorage.getItem('usuarioLogueadoLibertad') || "";
  let historial = JSON.parse(localStorage.getItem('historialSimuladorLibertad_' + email)) || [];
  if (graficoLineas) graficoLineas.destroy();
  if (historial.length === 0) return;
  const ctx = document.getElementById('graficoLineas').getContext('2d');
  const datos = historial.slice(0, 10).reverse();
  graficoLineas = new Chart(ctx, {
    type: 'line',
    data: {
      labels: datos.map(h => h.instrumento + " (" + h.fecha.split(" ")[0] + ")"),
      datasets: [{
        label: 'Monto final',
        data: datos.map(h => h.resultado),
        borderColor: "#00ffae",
        backgroundColor: "#00ffae22",
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { color: "#fff" } },
        x: { ticks: { color: "#fff" } }
      }
    }
  });
}

// ---- RESET ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('resetSimuladorBtn').onclick = () => {
    if (confirm("¿Seguro que querés resetear el simulador?")) {
      const email = localStorage.getItem('usuarioLogueadoLibertad') || "";
      localStorage.removeItem('creadorlibertadCapital');
      localStorage.removeItem('historialSimuladorLibertad_' + email);
      // Resetea desbloqueos salvo los básicos
      const desbloq = {};
      INSTRUMENTOS.forEach(inst => {
        desbloq[inst.clave] = inst.nivel === 1;
      });
      localStorage.setItem('desbloqueos_' + email, JSON.stringify(desbloq));
      renderizarSimulador();
      renderizarHistorialSimulador();
      renderizarGraficos();
    }
  };
  checkLogin();
});

// --- Inicializar (tras login) ---
function inicializarSimulador() {
  renderizarSimulador();
  renderizarHistorialSimulador();
  renderizarGraficos();
}
