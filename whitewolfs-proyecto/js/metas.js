// metas.js - Lógica del Tablero de Sueños White Wolfs

// --- IMÁGENES SUGERIDAS PARA PREMIOS ---
const premiosGaleria = [
  {nombre: "Viaje", src: "assets/metas/viaje.jpg"},
  {nombre: "Auto", src: "assets/metas/auto.jpg"},
  {nombre: "Notebook", src: "assets/metas/notebook.jpg"},
  {nombre: "Casa propia", src: "assets/metas/casa.jpg"},
  {nombre: "Cámara Pro", src: "assets/metas/camara.jpg"},
  {nombre: "PlayStation", src: "assets/metas/play.jpg"},
  {nombre: "Emprendimiento", src: "assets/metas/empresa.jpg"},
];

// --- ELEMENTOS DOM ---
const metaForm = document.getElementById('metaForm');
const inputMetaNombre = document.getElementById('inputMetaNombre');
const inputMetaMonto = document.getElementById('inputMetaMonto');
const inputMetaDesc = document.getElementById('inputMetaDesc');
const inputMetaImg = document.getElementById('inputMetaImg');
const galeriaPremios = document.getElementById('galeriaPremios');
const metaTitulo = document.getElementById('metaTitulo');
const metaDescripcion = document.getElementById('metaDescripcion');
const metaImagen = document.getElementById('metaImagen');
const barraProgreso = document.getElementById('barraProgreso');
const progresoTexto = document.getElementById('progresoTexto');
const aportesForm = document.getElementById('aportesForm');
const inputAporte = document.getElementById('inputAporte');
const aportesLista = document.getElementById('aportesLista');
const minidesafiosForm = document.getElementById('minidesafiosForm');
const inputMiniDesafio = document.getElementById('inputMiniDesafio');
const minidesafiosLista = document.getElementById('minidesafiosLista');
const desafiosSugeridos = document.getElementById('desafiosSugeridos');
const celebracionAywa = document.getElementById('celebracionAywa');

// --- GUARDAR Y LEER META ---
function guardarMeta(meta) {
  localStorage.setItem('metaGrande', JSON.stringify(meta));
}
function cargarMeta() {
  return JSON.parse(localStorage.getItem('metaGrande') || "null");
}

// --- GUARDAR Y LEER APORTES ---
function guardarAportes(arr) {
  localStorage.setItem('metaAportes', JSON.stringify(arr));
}
function cargarAportes() {
  return JSON.parse(localStorage.getItem('metaAportes') || "[]");
}

// --- GUARDAR Y LEER MINIDESAFIOS ---
function guardarMinidesafios(arr) {
  localStorage.setItem('metaMinidesafios', JSON.stringify(arr));
}
function cargarMinidesafios() {
  return JSON.parse(localStorage.getItem('metaMinidesafios') || "[]");
}

// --- GUARDAR IMG PERSONALIZADA ---
function guardarImgPersonalizada(img64) {
  localStorage.setItem('metaImgPersonalizada', img64);
}
function cargarImgPersonalizada() {
  return localStorage.getItem('metaImgPersonalizada') || null;
}

// --- ESTADO SELECCIÓN PREMIO ---
let premioSeleccionado = null; // {src, nombre} o base64

// --- CARGA GALERÍA ---
function renderGaleriaPremios() {
  galeriaPremios.innerHTML = premiosGaleria.map((premio, idx) => `
    <img src="${premio.src}" class="premio-select-img${premioSeleccionado && premioSeleccionado.src === premio.src ? ' selected' : ''}" data-galidx="${idx}" title="${premio.nombre}" />
  `).join('');
  galeriaPremios.querySelectorAll('.premio-select-img').forEach(img => {
    img.onclick = function() {
      galeriaPremios.querySelectorAll('.premio-select-img').forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
      premioSeleccionado = premiosGaleria[parseInt(this.getAttribute('data-galidx'))];
      metaImagen.src = premioSeleccionado.src;
      metaImagen.style.display = "block";
      guardarImgPersonalizada(""); // Borrar personalizada si elige galería
    };
  });
}
renderGaleriaPremios();

// --- CARGA DE IMAGEN PERSONALIZADA ---
inputMetaImg.onchange = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    metaImagen.src = evt.target.result;
    metaImagen.style.display = "block";
    premioSeleccionado = { src: evt.target.result, nombre: "Personalizada" };
    galeriaPremios.querySelectorAll('.premio-select-img').forEach(i => i.classList.remove('selected'));
    guardarImgPersonalizada(evt.target.result);
  };
  reader.readAsDataURL(file);
};

// --- GUARDAR META ---
metaForm.onsubmit = function(e) {
  e.preventDefault();
  const nombre = inputMetaNombre.value.trim();
  const monto = parseInt(inputMetaMonto.value);
  const desc = inputMetaDesc.value.trim();
  let imagen = premioSeleccionado && premioSeleccionado.src ? premioSeleccionado.src : cargarImgPersonalizada();
  if (!imagen) imagen = premiosGaleria[0].src;
  const meta = { nombre, monto, desc, imagen };
  guardarMeta(meta);
  celebracionAywa.style.display = "none";
  renderMeta();
};

// --- RENDER META Y PROGRESO ---
function renderMeta() {
  const meta = cargarMeta();
  const aportes = cargarAportes();
  const minidesafios = cargarMinidesafios();

  if (!meta) {
    metaTitulo.textContent = "¡Tu Gran Meta!";
    metaDescripcion.textContent = "¿Cuál es tu sueño más importante? Definí tu objetivo, tu premio y ¡alcanzalo paso a paso!";
    metaImagen.style.display = "none";
    barraProgreso.style.width = "0%";
    barraProgreso.textContent = "0%";
    progresoTexto.textContent = "";
    aportesLista.innerHTML = "";
    minidesafiosLista.innerHTML = "";
    desafiosSugeridos.innerHTML = "";
    celebracionAywa.style.display = "none";
    return;
  }
  metaTitulo.textContent = meta.nombre;
  metaDescripcion.textContent = meta.desc || "¡Definí tu objetivo y avanzá paso a paso!";
  metaImagen.src = meta.imagen;
  metaImagen.style.display = "block";

  // Progreso
  const totalAportado = aportes.reduce((a,b)=>a+b.monto,0);
  let porcentaje = Math.min(100, Math.round(100*totalAportado/meta.monto));
  barraProgreso.style.width = `${porcentaje}%`;
  barraProgreso.textContent = `${porcentaje}%`;
  progresoTexto.textContent = `Llevás $${totalAportado} de $${meta.monto} (${meta.monto-totalAportado>0?"faltan $"+(meta.monto-totalAportado):"¡META CUMPLIDA!"})`;

  // Celebración si completó
  if (porcentaje === 100) {
    celebracionAywa.innerHTML = `
      🎉 <b>¡ALPHA, LOGRASTE TU META!</b><br>
      <span style="color:#19ffc9">Hoy tu mentalidad y tus finanzas evolucionaron.</span><br>
      <i>"Recordá: cada meta lograda es una nueva versión de vos."</i><br>
      <br><b>EIDOS</b>: “No es solo el premio, es la persona en la que te convertiste.”`;
    celebracionAywa.style.display = "block";
    barraProgreso.style.background = "#ffd969";
    setTimeout(()=>{ celebracionAywa.scrollIntoView({behavior:"smooth"}); },400);
  } else {
    celebracionAywa.style.display = "none";
    barraProgreso.style.background = "#09ffc8";
  }

  // RENDER APORTES
  aportesLista.innerHTML = aportes.length
    ? aportes.map((ap,idx) => `<li>
      <b>$${ap.monto}</b> — <span style="color:#e7ffab;">${ap.descripcion||'Aporte'}</span>
      <button onclick="borrarAporte(${idx})" style="margin-left:7px;background:#ff5d7c;color:#fff;border:none;padding:2px 7px;border-radius:7px;cursor:pointer;">Eliminar</button>
    </li>`).join('')
    : "<li style='color:#ffe066'>Sin aportes aún. ¡Sumá el primero!</li>";

  // RENDER MINIDESAFIOS
  minidesafiosLista.innerHTML = minidesafios.length
    ? minidesafios.map((m,i)=>`
      <li>
        <input type="checkbox" ${m.cumplido?'checked':''} onchange="cumplirMinidesafio(${i})"/>
        <span style="${m.cumplido?'text-decoration:line-through;opacity:0.7;':''}">${m.texto}</span>
        <button onclick="borrarMinidesafio(${i})" style="margin-left:7px;background:#ec7ad1;color:#fff;border:none;padding:2px 7px;border-radius:7px;cursor:pointer;">Eliminar</button>
      </li>
    `).join('')
    : "<li style='color:#ffe066'>Agregá tu primer mini-desafío para avanzar.</li>";

  // --- SUGERENCIAS AUTOMÁTICAS ---
  desafiosSugeridos.innerHTML = "";
  if (meta.monto > 0 && totalAportado < meta.monto) {
    const sugerencias = sugerirMinidesafios(meta, totalAportado, minidesafios);
    if (sugerencias.length) {
      desafiosSugeridos.innerHTML = `
      <div style="background:#27344a;padding:14px 9px;border-radius:9px;margin:14px 0 6px 0;">
        <b style="color:#19ffc9;font-size:1.1em;">Mini-desafíos sugeridos por EIDOS:</b>
        <ul style="margin-top:5px;margin-bottom:0;">${
          sugerencias.map((s,idx)=>
            `<li style="margin-bottom:6px;">
              <button onclick="agregarMiniDesafioSugerido('${s.replace(/'/g,"\\'")}')" style="background:#ffe066;border:none;color:#1a1a1a;font-weight:bold;border-radius:7px;padding:3px 9px;font-size:.99em;cursor:pointer;margin-right:7px;">+ Añadir</button>
              <span>${s}</span>
            </li>`).join('')
        }</ul>
      </div>`;
    }
  }
}

// --- SUGERENCIAS AUTOMÁTICAS INTELIGENTES ---
function sugerirMinidesafios(meta, aportado, minidesafios) {
  const faltante = meta.monto - aportado;
  let lista = [];
  if (!minidesafios.some(d=>d.texto.toLowerCase().includes("no pedir delivery"))) lista.push("No pedir delivery por 7 días y sumar el ahorro a la meta");
  if (!minidesafios.some(d=>d.texto.toLowerCase().includes("ahorrar $"))) lista.push(`Ahorrar $${Math.ceil(faltante/5)} esta semana`);
  if (!minidesafios.some(d=>d.texto.toLowerCase().includes("vender algo"))) lista.push("Vender algo que no usás y sumar el dinero a la meta");
  if (!minidesafios.some(d=>d.texto.toLowerCase().includes("gasto innecesario"))) lista.push("Detectar y eliminar un gasto innecesario este mes");
  if (faltante <= 100000 && !minidesafios.some(d=>d.texto.toLowerCase().includes("ahorrar lo que queda"))) lista.push("Ahorrar lo que queda y cumplir la meta");
  return lista;
}
window.agregarMiniDesafioSugerido = function(txt) {
  const minidesafios = cargarMinidesafios();
  minidesafios.push({texto: txt, cumplido: false});
  guardarMinidesafios(minidesafios);
  renderMeta();
};

// --- APORTES ---
aportesForm.onsubmit = function(e) {
  e.preventDefault();
  const monto = parseInt(inputAporte.value);
  if (isNaN(monto) || monto <= 0) return;
  const descripcion = prompt("¿Breve descripción del aporte? (opcional)", "");
  const aportes = cargarAportes();
  aportes.push({ monto, descripcion });
  guardarAportes(aportes);

  // INTEGRACIÓN AUTOMÁTICA CON FINANZAS
  let movimientos = JSON.parse(localStorage.getItem('movimientos') || '[]');
  movimientos.unshift({
    monto: monto,
    tipo: "gasto",
    categoria: "Meta",
    fecha: new Date().toISOString(),
    descripcion: descripcion || "Aporte a sueño"
  });
  localStorage.setItem('movimientos', JSON.stringify(movimientos));

  inputAporte.value = "";
  renderMeta();
};
window.borrarAporte = function(idx) {
  if (!confirm("¿Seguro de eliminar el aporte?")) return;
  const aportes = cargarAportes();
  aportes.splice(idx, 1);
  guardarAportes(aportes);
  renderMeta();
};

// --- MINIDESAFIOS ---
minidesafiosForm.onsubmit = function(e) {
  e.preventDefault();
  const texto = inputMiniDesafio.value.trim();
  if (!texto) return;
  const minidesafios = cargarMinidesafios();
  minidesafios.push({ texto, cumplido: false });
  guardarMinidesafios(minidesafios);
  inputMiniDesafio.value = "";
  renderMeta();
};
window.borrarMinidesafio = function(idx) {
  if (!confirm("¿Seguro de eliminar el mini-desafío?")) return;
  const minidesafios = cargarMinidesafios();
  minidesafios.splice(idx, 1);
  guardarMinidesafios(minidesafios);
  renderMeta();
};
window.cumplirMinidesafio = function(idx) {
  const minidesafios = cargarMinidesafios();
  minidesafios[idx].cumplido = !minidesafios[idx].cumplido;
  guardarMinidesafios(minidesafios);
  renderMeta();
};

// --- INICIAR ---
renderMeta();
