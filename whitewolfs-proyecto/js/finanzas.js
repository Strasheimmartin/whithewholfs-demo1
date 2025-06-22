document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIG Y CONSTANTES ---
  const consejos = [
    { min: 0.49, max: 0.51, texto: "¡Perfecto! Mantenés el flujo ideal. Sigue así, Alpha.", estado: "balanceado" },
    { min: 0, max: 0.49, texto: "¡Ojo! Estás destinando poco a activos. Incrementá tus inversiones para crecer.", estado: "poco_activos" },
    { min: 0.51, max: 1, texto: "¡Atento! El gasto en ocio/necesidades está alto. Revisa tu presupuesto.", estado: "mucho_gasto" }
  ];
  const frasesLobezno = {
    balanceado: "Tu economía está en equilibrio. El camino es claro.",
    poco_activos: "Dale más fuerza a tus inversiones y crecerás.",
    mucho_gasto: "Cuidado Alpha, ¡no descuides el control del dinero!"
  };

  // --- ELEMENTOS DOM ---
  const montoInput = document.getElementById('monto');
  const tipoMovimiento = document.getElementById('tipoMovimiento');
  const categoriaSelect = document.getElementById('categoria');
  const form = document.getElementById('registroForm');
  const filtroMes = document.getElementById('filtroMes');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const resumenDiv = document.getElementById('resumenFlujo');
  const tabla = document.getElementById('tablaHistorial').getElementsByTagName('tbody')[0];
  const imgLobezno = document.getElementById('imgLobezno');
  const fraseLobezno = document.getElementById('fraseLobezno');
  
  // --- Sugerencias debajo del resumen, antes de la tabla ---
  let sugerenciasDiv = document.createElement("div");
  sugerenciasDiv.id = "sugerenciasFinancieras";
  sugerenciasDiv.style.margin = "10px 0 22px 0";
  resumenDiv.parentNode.insertBefore(sugerenciasDiv, resumenDiv.nextSibling);

  // --- STORAGE ---
  function obtenerMovimientos() {
    return JSON.parse(localStorage.getItem('movimientos') || "[]");
  }
  function guardarMovimientos(movs) {
    localStorage.setItem('movimientos', JSON.stringify(movs));
  }

  // --- DESAFÍO FINANCIERO (PERSISTENTE) ---
  function guardarDesafio(desafio) {
    localStorage.setItem('desafioFinanciero', JSON.stringify(desafio));
  }
  function obtenerDesafio() {
    return JSON.parse(localStorage.getItem('desafioFinanciero') || "null");
  }

  // --- AGREGAR MOVIMIENTO ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const monto = parseFloat(montoInput.value);
    if (isNaN(monto) || monto <= 0) return;
    const mov = {
      monto,
      tipo: tipoMovimiento.value,
      categoria: categoriaSelect.value,
      fecha: new Date().toISOString()
    };
    const movs = obtenerMovimientos();
    movs.unshift(mov);
    guardarMovimientos(movs);
    montoInput.value = "";
    renderizar();
  });

  // --- FILTROS ---
  filtroMes.addEventListener("change", renderizar);
  filtroCategoria.addEventListener("change", renderizar);

  // --- RENDERIZAR TODO ---
  function renderizar() {
    const movs = obtenerMovimientos();
    renderResumen(movs);
    renderSugerenciasFinancieras(movs); // Ahora debajo del resumen, antes de la tabla
    renderTabla(movs);
    renderGrafico(movs);
    renderGraficoEvolucionSaldo(movs);
    renderLobezno(movs);
  }

  // --- SUGERENCIAS Y DESAFÍO FINANCIERO INTELIGENTE ---
  function calcularTotales(movs) {
    let totales = {
      ingreso: 0,
      gasto: 0,
      ahorro: 0,
      categorias: {}
    };
    movs.forEach(m => {
      if(!totales.categorias[m.categoria]) totales.categorias[m.categoria] = {ingreso:0,gasto:0};
      if (m.tipo === "ingreso") {
        totales.ingreso += m.monto;
        totales.categorias[m.categoria].ingreso += m.monto;
      } else {
        totales.gasto += m.monto;
        totales.categorias[m.categoria].gasto += m.monto;
      }
    });
    totales.ahorro = totales.ingreso - totales.gasto;
    return totales;
  }

  function generarSugerenciasFinancieras(movs) {
    let tot = calcularTotales(movs);
    let sugerencias = [];
    let desafio = obtenerDesafio();
    let desafioGenerado = null;

    // --- Sugerencias inteligentes, ranking y desafíos por situación ---
    for (let cat in tot.categorias) {
      let cg = tot.categorias[cat].gasto;
      if (tot.ingreso > 0 && cg / tot.ingreso > 0.3) {
        sugerencias.push(`Este mes, tus gastos en <b>${cat}</b> representan el <b>${Math.round(cg / tot.ingreso * 100)}%</b> de tus ingresos. ¿Probás un desafío de 7 días sin gastar en esa categoría?`);
      }
    }
    if (tot.ahorro <= 0) {
      sugerencias.push("Gastaste más de lo que ingresaste este mes. ¿Te gustaría revisar tus gastos fijos o buscar ingresos extra?");
    } else if (tot.ingreso > 0 && tot.ahorro / tot.ingreso < 0.1) {
      sugerencias.push("Tu ahorro es menor al 10% de tus ingresos. Tip: automatizá una transferencia a tu cuenta de ahorro apenas cobrás.");
    } else if (tot.ahorro / tot.ingreso > 0.2) {
      sugerencias.push("¡Felicitaciones! Ahorraste más del 20% de tus ingresos este mes. ¿Pensaste en invertir ese dinero?");
    }
    if (movs.some(m => m.categoria.toLowerCase().includes("deuda") || m.categoria.toLowerCase().includes("tarjeta"))) {
      sugerencias.push("Detectamos pagos frecuentes a tarjetas o préstamos. ¿Querés un plan para salir de deudas?");
    }
    let ocio = tot.categorias["ocio"] ? tot.categorias["ocio"].gasto : 0;
    if (tot.ingreso > 0 && ocio / tot.ingreso > 0.2) {
      sugerencias.push("El gasto en ocio es superior al 20% de tus ingresos. Probá actividades gratuitas esta semana.");
    }
    let delivery = tot.categorias["delivery"] ? tot.categorias["delivery"].gasto : 0;
    if (tot.ingreso > 0 && delivery / tot.ingreso > 0.1) {
      sugerencias.push("¡Ojo! Estás gastando mucho en delivery. ¿Probás cocinar en casa esta semana?");
    }
    let ingresosExtras = movs.filter(m => m.tipo === "ingreso" && !["Sueldo", "Salario", "Ingreso principal"].includes(m.categoria)).reduce((a,b)=>a+b.monto,0);
    if (ingresosExtras > 0) {
      sugerencias.push("Recibiste ingresos extra este mes. ¿Qué tal si el 50% va directo al ahorro o inversión?");
    }
    if (!tot.categorias["educación"] && !tot.categorias["inversión"]) {
      sugerencias.push("No registrás gastos en educación o inversión este mes. ¿Probás hacer una inversión o anotarte a un curso?");
    }

    // --- DESAFÍO MENSUAL AUTOMÁTICO ---
    let mesActual = (new Date()).getMonth();
    if (!desafio || desafio.mes !== mesActual) {
      let maxCat = null, maxVal = 0;
      for (let cat in tot.categorias) {
        if (tot.categorias[cat].gasto > maxVal) {
          maxVal = tot.categorias[cat].gasto;
          maxCat = cat;
        }
      }
      if (maxCat && tot.ingreso > 0 && maxVal / tot.ingreso > 0.15) {
        desafioGenerado = {
          texto: `Este mes, intentá reducir tu gasto en <b>${maxCat}</b> en al menos un 10% respecto al mes anterior.<br>
          Si lo lográs, ¡EIDOS/Aywa te premia!`,
          categoria: maxCat,
          objetivo: Math.round(maxVal * 0.9),
          actual: maxVal,
          aceptado: false,
          mes: mesActual
        };
      } else {
        desafioGenerado = {
          texto: "Desafío: Intentá ahorrar al menos el 10% de tus ingresos este mes. Si lo cumplís, ¡recompensa desbloqueada!",
          categoria: "ahorro",
          objetivo: Math.round(tot.ingreso * 0.1),
          actual: tot.ahorro,
          aceptado: false,
          mes: mesActual
        };
      }
      guardarDesafio(desafioGenerado);
      desafio = desafioGenerado;
    }

    // Más logros/insignias inteligentes (puedes sumar más aquí)
    if (tot.ingreso > 0 && tot.ahorro / tot.ingreso > 0.25) {
      sugerencias.unshift("🏅 ¡Logro desbloqueado! Ahorrador PRO: superaste el 25% de tus ingresos en ahorro.");
    }
    if (tot.categorias["activos"] && tot.categorias["activos"].ingreso > tot.ingreso * 0.33) {
      sugerencias.unshift("🥇 Premiado por invertir más del 33% de tus ingresos en activos.");
    }

    return { sugerencias: sugerencias.slice(0, 3), desafio };
  }

  function renderSugerenciasFinancieras(movs) {
    let { sugerencias, desafio } = generarSugerenciasFinancieras(movs);
    let html = '';
    if (sugerencias.length > 0) {
      html += `<div style="background:#22282d;border-radius:14px;padding:13px 18px 8px 18px;margin-bottom:15px;box-shadow:0 1px 10px #0005;">
        <h2 style="color:#ffef80;font-size:1.12em;margin-bottom:9px;letter-spacing:.2px;">💡 Sugerencias inteligentes</h2>
        <ul style="list-style:none;padding-left:0;margin-bottom:6px;">${sugerencias.map(s=>`<li style="margin-bottom:7px;font-size:1.03em;color:#e7ffeb;">${s}</li>`).join('')}</ul>
      </div>`;
    }
    if (desafio) {
      let progreso = '';
      if (desafio.aceptado) {
        let cumple = false;
        if (desafio.categoria === "ahorro") {
          let tot = calcularTotales(movs);
          cumple = tot.ahorro >= desafio.objetivo;
          progreso = `
            <div style="margin-top:7px;font-size:.98em;">
              Progreso: <b style="color:#6df;">$${Math.round(tot.ahorro)}/${desafio.objetivo}</b> 
              <span style="margin-left:7px;color:${cumple ? '#35e189':'#ffd666'};font-weight:bold;">${cumple ? '¡Desafío cumplido! 🏆' : '¡Seguís en carrera!'}</span>
            </div>`;
        } else {
          let movsCat = movs.filter(m=>m.categoria===desafio.categoria && m.tipo==="gasto");
          let totalCat = movsCat.reduce((a,b)=>a+b.monto,0);
          cumple = totalCat <= desafio.objetivo;
          progreso = `
            <div style="margin-top:7px;font-size:.98em;">
              Gasto en <b>${desafio.categoria}:</b> <span style="color:#f9f;">$${Math.round(totalCat)}/${desafio.objetivo}</span>
              <span style="margin-left:7px;color:${cumple ? '#35e189':'#ffd666'};font-weight:bold;">${cumple ? '¡Desafío cumplido! 🏆' : '¡Aún podés lograrlo!'}</span>
            </div>`;
        }
      }
      html += `<div style="background:#263345;border-radius:13px;padding:11px 16px;margin-bottom:14px;font-size:1.09em;color:#ffd666;font-weight:600;box-shadow:0 1px 10px #0004;">
        ⚡ <b style="color:#ffd666;">Desafío financiero mensual:</b><br>${desafio.texto}
        ${desafio.aceptado ? progreso : `<br><button id="btnAceptarDesafio" style="margin-top:9px;padding:7px 19px;background:#2fd3b7;color:#252c33;font-weight:bold;border:none;border-radius:7px;cursor:pointer;font-size:.98em;box-shadow:0 2px 5px #0002;">¡Acepto el desafío!</button>`}
      </div>`;
    }
    sugerenciasDiv.innerHTML = html;

    // Si desafío no está aceptado, agrega el event listener
    if (desafio && !desafio.aceptado) {
      const btnAceptar = document.getElementById('btnAceptarDesafio');
      if (btnAceptar) {
        btnAceptar.onclick = () => {
          desafio.aceptado = true;
          guardarDesafio(desafio);
          renderizar();
        };
      }
    }
  }

  // --- RESUMEN Y CONSEJO EYWA ---
  function renderResumen(movs) {
    let ingresos = 0, gastos = 0, activos = 0, necesidades = 0, ocio = 0, salario = 0, extra = 0;
    movs.forEach(mov => {
      if (mov.tipo === "ingreso") ingresos += mov.monto;
      else gastos += mov.monto;
      if (mov.categoria === "activos") activos += mov.monto;
      else if (mov.categoria === "necesidades") necesidades += mov.monto;
      else if (mov.categoria === "ocio") ocio += mov.monto;
      else if (mov.categoria === "salario") salario += mov.monto;
      else if (mov.categoria === "extra") extra += mov.monto;
    });
    const saldo = ingresos - gastos;
    resumenDiv.innerHTML = `
      <span style="color:#00ff90">Ingresos: $${ingresos} | Gasto: $${gastos} | Saldo: $${saldo}</span>
      <br>
      <span style="color:#61ff05;font-weight:bold;">${darConsejoEYWA(activos, necesidades, ocio, ingresos, gastos)}</span>
    `;
  }
  function darConsejoEYWA(activos, necesidades, ocio, ingresos, gastos) {
    if (ingresos === 0) return "¡Comienza registrando tus ingresos!";
    const pActivos = activos / ingresos;
    const pNecesidades = necesidades / ingresos;
    const pOcio = ocio / ingresos;
    if (pActivos >= 0.45 && pActivos <= 0.55) {
      return "Consejo EYWA: Excelente distribución. Estás apalancando tu futuro.";
    } else if (pActivos < 0.3) {
      return "Consejo EYWA: Sube la inversión en activos para que tu dinero trabaje por vos.";
    } else if ((pOcio + pNecesidades) > 0.7) {
      return "Consejo EYWA: Demasiado gasto en ocio y necesidades. Busca balancear más.";
    } else {
      return "Consejo EYWA: Revisa tu flujo, puedes mejorar la distribución.";
    }
  }

  // --- TABLA DE HISTORIAL ---
  function renderTabla(movs) {
    const mesFiltro = filtroMes.value;
    const catFiltro = filtroCategoria.value;
    tabla.innerHTML = "";
    movs.filter(mov => {
      const fecha = new Date(mov.fecha);
      const mes = fecha.getMonth();
      let ok = true;
      if (mesFiltro !== "todos" && parseInt(mesFiltro) !== mes) ok = false;
      if (catFiltro !== "todos" && mov.categoria !== catFiltro) ok = false;
      return ok;
    }).forEach((mov, idx) => {
      const fecha = new Date(mov.fecha);
      const row = tabla.insertRow();
      row.innerHTML = `
        <td>$${mov.monto}</td>
        <td>${mov.tipo}</td>
        <td>${mov.categoria}</td>
        <td>${fecha.toLocaleDateString("es-AR")}</td>
        <td>
          <button style="background:#ff5050;color:#fff;padding:2px 8px;border:none;border-radius:5px;cursor:pointer;" onclick="borrarMov(${idx})">Eliminar</button>
        </td>
      `;
    });
  }

  // --- ELIMINAR MOVIMIENTO ---
  window.borrarMov = function(idx) {
    let movs = obtenerMovimientos();
    movs.splice(idx, 1);
    guardarMovimientos(movs);
    renderizar();
  }

  // --- GRÁFICO DE TORTA: Disponible vs. Gastado ---
  let chart = null;
  function renderGrafico(movs) {
    const ctx = document.getElementById('graficoFinanzas').getContext('2d');
    const totalIngresos = movs.filter(m => m.tipo === "ingreso").reduce((s, m) => s + m.monto, 0);
    const totalGastos = movs.filter(m => m.tipo === "gasto").reduce((s, m) => s + m.monto, 0);
    let disponible = totalIngresos - totalGastos;
    if (disponible < 0) disponible = 0;
    let gastado = totalGastos;
    let data, labels, backgroundColors;
    if (totalIngresos === 0 && totalGastos === 0) {
      data = [1];
      labels = ["Sin datos"];
      backgroundColors = ["#2e3440"];
    } else if (totalIngresos === 0) {
      data = [gastado];
      labels = ["Gastado"];
      backgroundColors = ["#ff4060"];
    } else if (totalGastos === 0) {
      data = [disponible];
      labels = ["Disponible"];
      backgroundColors = ["#09ffc8"];
    } else {
      data = [disponible, gastado];
      labels = ["Disponible", "Gastado"];
      backgroundColors = ["#09ffc8", "#ff4060"];
    }

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 3,
        }]
      },
      options: {
        cutout: "62%",
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#fde047', font: { size: 13 } } },
        }
      }
    });
  }

  // --- LOBOZNO ESTADO ---
  function renderLobezno(movs) {
    const ingresos = movs.filter(m => m.tipo === "ingreso").reduce((s, m) => s + m.monto, 0);
    const activos = movs.filter(m => m.categoria === "activos").reduce((s, m) => s + m.monto, 0);
    let estado = "balanceado";
    if (ingresos === 0) estado = "balanceado";
    else if (activos / ingresos < 0.3) estado = "poco_activos";
    else if (activos / ingresos > 0.6) estado = "mucho_gasto";
    imgLobezno.src = `assets/img/lobezno-${estado}.png`;
    fraseLobezno.textContent = frasesLobezno[estado];
  }

  // --- INICIALIZAR ---
  renderizar();
});

// === GRÁFICO DE EVOLUCIÓN DE SALDO ===
let chartSaldo = null;
function renderGraficoEvolucionSaldo(movs) {
  const ctx = document.getElementById('graficoEvolucionSaldo').getContext('2d');
  const movsAsc = [...movs].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  let saldo = 0;
  const dataSaldo = [];
  const labels = [];
  movsAsc.forEach((mov, idx) => {
    if (mov.tipo === "ingreso") saldo += mov.monto;
    else saldo -= mov.monto;
    dataSaldo.push(saldo);
    if (idx === 0 || idx === movsAsc.length - 1 || idx % 5 === 0) {
      const fecha = new Date(mov.fecha);
      labels.push(`${fecha.getDate()}/${fecha.getMonth() + 1}`);
    } else {
      labels.push("");
    }
  });

  if (chartSaldo) chartSaldo.destroy();
  chartSaldo = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: "Evolución de Saldo",
        data: dataSaldo,
        borderWidth: 2.5,
        tension: 0.26,
        pointRadius: 2.5,
        borderColor: "#fde047",
        backgroundColor: "rgba(253,224,71,0.11)",
        fill: true,
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: "#aee7fa", font: { size: 11 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#fde047", font: { size: 12 } },
          grid: { color: "#2e3544" }
        }
      }
    }
  });
}
