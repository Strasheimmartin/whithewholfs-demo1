document.addEventListener("DOMContentLoaded", () => {
  // Listas de desafíos por semana
  const DESAFIOS_SEMANALES = [
    [
      { nombre: "7 días sin azúcar", desc: "No consumas nada con azúcar agregada durante una semana." },
      { nombre: "10.000 pasos diarios", desc: "Caminá 10.000 pasos cada día durante 7 días seguidos." },
      { nombre: "No gastar en comida rápida", desc: "No compres comida rápida durante 5 días seguidos." },
    ],
    [
      { nombre: "Leer 30 min diarios", desc: "Dedica al menos 30 minutos a la lectura todos los días por una semana." },
      { nombre: "Levantarme antes de las 7AM", desc: "Durante 3 días consecutivos, despertate antes de las 7 de la mañana." },
      { nombre: "1 hora sin celular antes de dormir", desc: "No uses el celular una hora antes de dormir por 5 noches seguidas." }
    ],
    [
      { nombre: "Sin redes sociales hasta las 10am", desc: "No abras ninguna red social hasta después de las 10 de la mañana." },
      { nombre: "Ahorrar el 10% de tus ingresos", desc: "Reservá el 10% de tu dinero recibido esta semana." },
      { nombre: "Anotar cada gasto", desc: "Anotá absolutamente todos tus gastos durante 7 días." }
    ],
    [
      { nombre: "No tomar bebidas azucaradas", desc: "Solo agua, té o mate, nada de gaseosas o jugos industriales por una semana." },
      { nombre: "Realizar 2 actos de generosidad", desc: "Ayudá a alguien, regalá algo o compartí tu tiempo al menos 2 veces esta semana." },
      { nombre: "No quejarme en 48 horas", desc: "Intentá pasar 2 días sin quejarte por nada. Si te sale, sumás doble XP." }
    ]
  ];

  // Devuelve el set de desafíos de esta semana (cambia cada lunes)
  function getDesafiosRecomendados() {
    const hoy = new Date();
    // Semana ISO (lunes como primer día)
    const año = hoy.getFullYear();
    const inicioAno = new Date(año, 0, 1);
    const dias = Math.floor((hoy - inicioAno) / (1000 * 60 * 60 * 24));
    const semana = Math.floor((dias + inicioAno.getDay()) / 7) % DESAFIOS_SEMANALES.length;
    return DESAFIOS_SEMANALES[semana];
  }

  const desafioForm = document.getElementById('desafioForm');
  const nombreDesafio = document.getElementById('nombreDesafio');
  const descDesafio = document.getElementById('descDesafio');
  const listaDesafios = document.getElementById('listaDesafios');
  const aywaDesafio = document.getElementById('aywaDesafio');
  const btnRecomendados = document.getElementById('btnRecomendados');
  const recoPanel = document.getElementById('recoPanel');

  // --- Storage helpers ---
  function getDesafios() {
    return JSON.parse(localStorage.getItem('desafios') || '[]');
  }
  function saveDesafios(ds) {
    localStorage.setItem('desafios', JSON.stringify(ds));
  }

  // --- Render desafíos activos ---
  function renderDesafios() {
    const ds = getDesafios();
    listaDesafios.innerHTML = '';
    if (!ds.length) {
      listaDesafios.innerHTML = "<p style='color:#ffe066;'>Aún no hay desafíos activos.</p>";
      aywaDesafio.textContent = "Tip: ¡Probá un desafío recomendado para empezar!";
      return;
    }
    ds.forEach((d, idx) => {
      const div = document.createElement('div');
      div.className = 'habit-item';
      div.innerHTML = `
        <span>
          <span class="habit-name">${d.nombre}</span>
          ${d.desc ? `<span class="racha">${d.desc}</span>` : ''}
        </span>
        <span>
          <button class="btn-done" onclick="marcarDesafio(${idx})">${d.cumplido ? '✔' : 'Cumplir'}</button>
          <button class="btn-del" onclick="eliminarDesafio(${idx})">Eliminar</button>
        </span>
      `;
      listaDesafios.appendChild(div);
    });
    aywaDesafio.textContent = "AYWA: Los desafíos construyen disciplina, ¡elegí uno y avanzá!";
  }

  // --- Marcar desafío cumplido (sólo ejemplo visual) ---
  window.marcarDesafio = function(idx) {
    let ds = getDesafios();
    ds[idx].cumplido = true;
    saveDesafios(ds);
    renderDesafios();
  };
  window.eliminarDesafio = function(idx) {
    let ds = getDesafios();
    ds.splice(idx, 1);
    saveDesafios(ds);
    renderDesafios();
  };

  // --- Agregar desafío manual ---
  desafioForm.onsubmit = function(e) {
    e.preventDefault();
    let ds = getDesafios();
    ds.push({ nombre: nombreDesafio.value, desc: descDesafio.value || '', cumplido: false });
    saveDesafios(ds);
    nombreDesafio.value = '';
    descDesafio.value = '';
    renderDesafios();
  };

  // --- Recomendados (panel) ---
  btnRecomendados.onclick = function() {
    if (recoPanel.style.display === 'block') {
      recoPanel.style.display = 'none';
      return;
    }
    let html = '';
    getDesafiosRecomendados().forEach((d, idx) => {
      html += `
        <div class="reco-desafio">
          <div class="reco-titulo">${d.nombre}</div>
          <div class="reco-desc">${d.desc}</div>
          <button class="reco-btn-add" data-add="${idx}">Agregar desafío</button>
        </div>
      `;
    });
    recoPanel.innerHTML = html;
    recoPanel.style.display = 'block';

    recoPanel.querySelectorAll('.reco-btn-add').forEach(btn => {
      btn.onclick = function() {
        let idx = parseInt(this.getAttribute('data-add'));
        agregarDesafioRecomendado(idx);
      };
    });
  };

  function agregarDesafioRecomendado(idx) {
    let ds = getDesafios();
    const recomendados = getDesafiosRecomendados();
    let d = recomendados[idx];
    if (ds.some(x => x.nombre.toLowerCase() === d.nombre.toLowerCase())) {
      alert("Ya agregaste este desafío.");
      return;
    }
    ds.push({ nombre: d.nombre, desc: d.desc, cumplido: false });
    saveDesafios(ds);
    recoPanel.style.display = 'none';
    renderDesafios();
    setTimeout(() => alert("¡Desafío agregado!"), 200);
  }

  renderDesafios();
});
