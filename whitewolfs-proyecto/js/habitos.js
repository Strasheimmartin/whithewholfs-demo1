document.addEventListener("DOMContentLoaded", () => {
  // ------ XP y niveles ------
  function getXP() {
    return parseInt(localStorage.getItem('xpHabitos') || '0', 10);
  }
  function setXP(xp) {
    localStorage.setItem('xpHabitos', xp);
  }
  function xpToLevel(xp) {
    return Math.floor(Math.sqrt(xp) / 2) + 1;
  }
  function xpProgreso(xp) {
    let nivel = xpToLevel(xp);
    let next = (2*(nivel)*(nivel));
    let prev = (2*(nivel-1)*(nivel-1));
    let actual = xp - prev;
    let total = next - prev;
    return { nivel, actual, total, porcentaje: Math.round(100*actual/total) };
  }

  // ------ Frecuencia ------
  function tocaHoy(habito) {
    const freq = habito.freq || "diario";
    const inicio = habito.fechaInicio ? new Date(habito.fechaInicio) : null;
    const hoy = new Date();
    if (!inicio) return true;
    const diffDays = Math.floor((hoy - inicio) / (1000*60*60*24));
    if (freq === "diario") return true;
    if (freq === "cada2") return diffDays % 2 === 0;
    if (freq === "cada3") return diffDays % 3 === 0;
    if (freq === "cada7") return diffDays % 7 === 0;
    if (freq === "cada15") return diffDays % 15 === 0;
    if (freq === "semanal") return hoy.getDay() === inicio.getDay();
    return true;
  }

  // ------ Motivación ------
  const MOTIVACION = [
    "¡Hoy sumás otro ladrillo a tu mejor versión!",
    "Constancia = Alpha. ¿Listo para cumplir tu hábito?",
    "Cada vez que cumplís, tu lobezno evoluciona.",
    "Hoy es un gran día para avanzar, ¡vamos Alpha!",
    "La disciplina es la libertad. ¡Cumplilo hoy!"
  ];

  // ------ DOM ------
  const habitForm = document.getElementById('habitForm');
  const habitName = document.getElementById('habitName');
  const habitFreq = document.getElementById('habitFreq');
  const habitList = document.getElementById('habitList');
  const aywaFrase = document.getElementById('aywaFrase');
  const btnRecomendados = document.getElementById('btnRecomendados');
  const recoPanel = document.getElementById('recoPanel');
  const lobeznoBar = document.getElementById('lobeznoBar');
  const emojiLobezno = document.getElementById('emojiLobezno');
  const fraseLobezno = document.getElementById('fraseLobezno');
  const habitosIzqLista = document.getElementById('habitosIzqLista');
  const toggleRecordatorio = document.getElementById('toggleRecordatorio');
  const recordatorioStatus = document.getElementById('recordatorioStatus');
  const recordatorioAudio = document.getElementById('recordatorioAudio');

  // XP barra
  let xpBar = document.createElement("div");
  xpBar.style.marginBottom = "10px";
  habitList.parentNode.insertBefore(xpBar, habitList);

  // Hora para recordatorio
  if (!localStorage.getItem('horaRecordatorio')) {
    localStorage.setItem('horaRecordatorio', '08:00');
  }
  let horaRecordatorio = localStorage.getItem('horaRecordatorio') || '08:00';

  // ------ Storage helpers ------
  function getHabits() {
    return JSON.parse(localStorage.getItem('habitos') || '[]');
  }
  function saveHabits(habits) {
    localStorage.setItem('habitos', JSON.stringify(habits));
  }

  // ------ Historial ------
  function getHistorial(h) {
    return h.historial || [];
  }
  function updateHistorial(h, cumplido) {
    let hoy = today();
    let historial = h.historial || [];
    if (historial.length && historial[historial.length - 1].fecha === hoy) {
      historial[historial.length - 1].cumplido = cumplido;
    } else {
      historial.push({fecha: hoy, cumplido});
      if(historial.length > 7) historial = historial.slice(historial.length - 7);
    }
    h.historial = historial;
    return historial;
  }

  // ------ Columna izquierda ------
  function renderHabitosIzq() {
    if (!habitosIzqLista) return;
    const habits = getHabits();
    if (!habits.length) {
      habitosIzqLista.innerHTML = "<li style='color:#ffe066;'>Sin hábitos activos.</li>";
      return;
    }
    habitosIzqLista.innerHTML = habits.map((h, idx) => {
      const historial = getHistorial(h);
      const marcadoHoy = historial.length && historial[historial.length-1].fecha === today() && historial[historial.length-1].cumplido;
      let icono = "⭐";
      return `
        <li class="habito-izq-item${marcadoHoy ? ' cumplido' : ''}">
          <span class="icono">${icono}</span>
          <span>${h.name}</span>
          <span class="habit-tipo">${
            h.freq === "diario" ? "Diario" :
            h.freq === "cada2" ? "Cada 2 días" :
            h.freq === "cada3" ? "Cada 3 días" :
            h.freq === "cada7" ? "Cada 7 días" :
            h.freq === "cada15" ? "Cada 15 días" :
            h.freq
          }</span>
          <button class="btn-mark${marcadoHoy ? ' cumplido' : ''}" title="Marcar como realizado" data-idx="${idx}">${marcadoHoy ? '✔️' : '✔'}</button>
          <button class="btn-del" title="Eliminar" data-delidx="${idx}">🗑️</button>
        </li>
      `;
    }).join('');

    habitosIzqLista.querySelectorAll('.btn-mark').forEach(btn=>{
      btn.onclick = function(){
        let idx = parseInt(this.getAttribute('data-idx'));
        marcarHabit(idx);
      };
    });
    habitosIzqLista.querySelectorAll('.btn-del').forEach(btn=>{
      btn.onclick = function(){
        let idx = parseInt(this.getAttribute('data-delidx'));
        eliminarHabit(idx);
      };
    });
  }

  // ------ Panel central ------
  function renderXP() {
    let xp = getXP();
    let prog = xpProgreso(xp);
    xpBar.innerHTML = `<div style="font-weight:bold;color:#ffe066;font-size:1.09em;">Nivel ${prog.nivel} — XP: ${xp} <span style="float:right;">${prog.actual}/${prog.total}</span></div>
    <div style="background:#263136;border-radius:9px;height:16px;width:100%;overflow:hidden;">
      <div style="background:#19ffc9;height:16px;border-radius:9px;width:${prog.porcentaje}%;transition:width .5s;"></div>
    </div>`;
  }

  function renderHabits() {
    renderXP();
    const habits = getHabits();
    habitList.innerHTML = '';
    if (!habits.length) {
      habitList.innerHTML = "<p style='color:#ffe066;'>Aún no tienes hábitos registrados.</p>";
      lobeznoBar.style.display = "none";
      aywaFrase.textContent = "AYWA: ¡Agregá tu primer hábito o explorá los recomendados para comenzar la transformación!";
      renderHabitosIzq();
      return;
    }
    let allDone = true, hayRacha = false;
    habits.forEach((h, idx) => {
      const historial = getHistorial(h);
      let historialHTML = '<span class="historial">';
      for(let i=0;i<7;i++){
        const dia = historial[historial.length-7+i];
        if(!dia) {
          historialHTML += `<span class="hist-dia hist-pendiente">-</span>`;
        } else if(dia.cumplido) {
          historialHTML += `<span class="hist-dia hist-cumplido">✔</span>`;
        } else {
          historialHTML += `<span class="hist-dia hist-fallido">✗</span>`;
        }
      }
      historialHTML += '</span>';
      const marcadoHoy = historial.length && historial[historial.length-1].fecha === today() && historial[historial.length-1].cumplido;
      if(!marcadoHoy && tocaHoy(h)) allDone = false;
      if(h.racha >= 3) hayRacha = true;
      const div = document.createElement('div');
      div.className = 'habit-item' + (marcadoHoy ? ' cumplido' : '');
      div.innerHTML = `
        <span class="info">
          <span class="habit-name">${h.name}</span>
          <span class="habit-freq">${
            h.freq === "diario" ? "Diario" :
            h.freq === "cada2" ? "Cada 2 días" :
            h.freq === "cada3" ? "Cada 3 días" :
            h.freq === "cada7" ? "Cada 7 días" :
            h.freq === "cada15" ? "Cada 15 días" : h.freq
          }</span>
          <span class="racha">🔥 Racha: ${h.racha || 0}</span>
          ${historialHTML}
        </span>
        <span>
          <button class="btn-done${marcadoHoy ? ' cumplido' : ''}" onclick="marcarHabit(${idx})">${marcadoHoy ? '✔' : 'Cumplir'}</button>
          <button class="btn-del" onclick="eliminarHabit(${idx})">Eliminar</button>
          <button class="btn-ics" onclick="descargarICS(${idx})" title="Agregar a mi calendario">📅</button>
        </span>
      `;
      habitList.appendChild(div);
    });
    lobeznoBar.style.display = "flex";
    if(allDone){
      emojiLobezno.textContent = "🐺✨";
      fraseLobezno.textContent = "¡Lobezno Alpha celebra tu constancia! Todas las tareas están cumplidas hoy.";
    } else if(hayRacha) {
      emojiLobezno.textContent = "🐺🔥";
      fraseLobezno.textContent = "¡Vas en racha, Alpha! Tu lobo interior está creciendo fuerte.";
    } else {
      emojiLobezno.textContent = "🐺😴";
      fraseLobezno.textContent = "El lobezno espera tu acción. ¡Hoy podés avanzar!";
    }
    let frases = [
      "La constancia es el músculo secreto de todo Alpha.",
      "Si caés, levantate. AYWA cree en vos.",
      "Hoy es un gran día para sumar un paso más.",
      "Tu futuro depende de los hábitos que construís hoy.",
      "El éxito es la suma de pequeñas victorias diarias."
    ];
    aywaFrase.textContent = frases[Math.floor(Math.random()*frases.length)];
    renderHabitosIzq();
  }

  // ------ Marcar y eliminar ------
  window.marcarHabit = function(idx) {
    const habits = getHabits();
    let h = habits[idx];
    let historial = updateHistorial(h, true);
    if(historial.length && historial[historial.length-1].fecha === today() && historial[historial.length-1].cumplido){
    } else {
      h.racha = (h.racha || 0) + 1;
      let xp = getXP();
      setXP(xp + 10); // suma 10 xp por cada cumplimiento
    }
    saveHabits(habits);
    renderHabits();
  };

  window.eliminarHabit = function(idx) {
    if (!confirm("¿Seguro que querés eliminar este hábito?")) return;
    const habits = getHabits();
    habits.splice(idx, 1);
    saveHabits(habits);
    renderHabits();
  };

  // ------ Agregar hábito manual ------
  function agregarHabitoManual(nombre, frecuencia) {
    let habits = getHabits();
    if(habits.some(x => x.name.toLowerCase() === nombre.toLowerCase())) {
      alert("Ya tenés ese hábito en tu lista.");
      return false;
    }
    habits.push({
      name: nombre,
      freq: frecuencia,
      racha: 0,
      historial: [],
      fechaInicio: today() // importante para la frecuencia
    });
    saveHabits(habits);
    renderHabits();
    return true;
  }

  habitForm.onsubmit = function(e) {
    e.preventDefault();
    if(agregarHabitoManual(habitName.value.trim(), habitFreq.value.trim())){
      habitName.value = '';
    }
  };

  // ------ Selector de hora para recordatorio ------
  let horaSelector = document.createElement("input");
  horaSelector.type = "time";
  horaSelector.value = horaRecordatorio;
  horaSelector.style.marginLeft = "14px";
  horaSelector.style.background = "#252e36";
  horaSelector.style.color = "#ffe066";
  horaSelector.style.border = "none";
  horaSelector.style.padding = "6px 10px";
  horaSelector.style.borderRadius = "7px";
  horaSelector.style.fontWeight = "bold";
  horaSelector.style.fontSize = "1em";
  toggleRecordatorio.parentNode.insertBefore(horaSelector, toggleRecordatorio.nextSibling);

  horaSelector.onchange = function() {
    horaRecordatorio = horaSelector.value;
    localStorage.setItem('horaRecordatorio', horaRecordatorio);
    actualizarToggleRecordatorio();
  };

  // ------ Recomendados con frecuencia seleccionable ------
  btnRecomendados.onclick = function() {
    if(recoPanel.style.display==='block'){
      recoPanel.style.display='none';
      return;
    }
    let HABITOS_RECO = [
      { nombre: "Tomar 2L de agua", desc: "Mantenerse hidratado." },
      { nombre: "30 minutos de ejercicio", desc: "Mover el cuerpo, sentirse mejor." },
      { nombre: "Leer 10 páginas", desc: "Nutrir la mente cada día." },
      { nombre: "No consumir azúcar refinada hoy", desc: "Descanso al organismo, evitá azúcares agregados." },
      { nombre: "Agradecer 3 cosas al despertar", desc: "Comenzá tu día con gratitud." }
    ];
    let freqs = [
      {val:"diario", txt:"Diario"},
      {val:"cada2", txt:"Cada 2 días"},
      {val:"cada3", txt:"Cada 3 días"},
      {val:"cada7", txt:"Cada 7 días"},
      {val:"cada15", txt:"Cada 15 días"}
    ];
    let html = "";
    HABITOS_RECO.forEach((h, idx) => {
      let freqOptions = freqs.map(f=>`<option value="${f.val}">${f.txt}</option>`).join('');
      html += `
      <div class="reco-hab">
        <div class="reco-titulo">${h.nombre}</div>
        <div class="reco-desc">${h.desc}</div>
        <select id="freq-reco-${idx}" style="margin-top:5px;margin-bottom:7px;">${freqOptions}</select>
        <button class="reco-btn-add" data-add="${idx}">Agregar hábito</button>
      </div>
      `;
    });
    recoPanel.innerHTML = html;
    recoPanel.style.display='block';
    recoPanel.querySelectorAll('.reco-btn-add').forEach(btn=>{
      btn.onclick = function(){
        let idx = this.getAttribute('data-add');
        let freqSel = document.getElementById('freq-reco-'+idx).value;
        agregarHabitoManual(HABITOS_RECO[idx].nombre, freqSel);
        recoPanel.style.display='none';
        setTimeout(()=>alert("¡Hábito agregado con éxito!"),350);
      };
    });
  };

  // ------ Exportar a calendario ------
  window.descargarICS = function(idx) {
    const habits = getHabits();
    const h = habits[idx];
    const freqMap = {
      "diario": "DAILY",
      "cada2": "DAILY;INTERVAL=2",
      "cada3": "DAILY;INTERVAL=3",
      "cada7": "WEEKLY",
      "cada15": "WEEKLY;INTERVAL=2",
      "semanal": "WEEKLY"
    };
    const rrule = freqMap[h.freq] || "DAILY";
    const start = new Date();
    const yyyy = start.getFullYear();
    const mm = (start.getMonth()+1).toString().padStart(2,"0");
    const dd = start.getDate().toString().padStart(2,"0");
    const dt = `${yyyy}${mm}${dd}T${(horaRecordatorio||'08:00').replace(':','')}00`;
    const content = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${h.name}
DTSTART:${dt}
RRULE:FREQ=${rrule}
DESCRIPTION:Hábitos White Wolfs
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([content], {type:"text/calendar"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${h.name.replace(/\s+/g,"_")}.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},200);
  };

  // ------ Recordatorios ------
  let recordatoriosOn = localStorage.getItem('recordatoriosHabitos') === '1';

  function actualizarToggleRecordatorio() {
    if (recordatoriosOn) {
      toggleRecordatorio.classList.add("on");
      toggleRecordatorio.textContent = "🔔 Recordatorios ACTIVOS";
      recordatorioStatus.textContent = "Tus hábitos de hoy te enviarán recordatorio con sonido a las "+(horaRecordatorio||'08:00')+".";
    } else {
      toggleRecordatorio.classList.remove("on");
      toggleRecordatorio.textContent = "🔕 Activar recordatorios";
      recordatorioStatus.textContent = "Recordatorios desactivados.";
    }
  }

  toggleRecordatorio.onclick = function() {
    recordatoriosOn = !recordatoriosOn;
    localStorage.setItem('recordatoriosHabitos', recordatoriosOn ? '1' : '0');
    actualizarToggleRecordatorio();
    if (recordatoriosOn) pedirPermisoNotificacion();
  };

  function pedirPermisoNotificacion() {
    if (Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }

  // Lanzar recordatorios solo para hábitos del día
  function lanzarRecordatorioHabitosDelDia() {
    if (!recordatoriosOn) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const habits = getHabits();
    let hayHabitoHoy = false;
    habits.forEach((h) => {
      if (tocaHoy(h)) {
        hayHabitoHoy = true;
        setTimeout(() => {
          recordatorioAudio.play();
          new Notification(
            "¡Recordatorio de White Wolfs!",
            {
              body: `${h.name} · ${MOTIVACION[Math.floor(Math.random()*MOTIVACION.length)]}`,
              icon: "https://cdn-icons-png.flaticon.com/512/616/616494.png"
            }
          );
        }, 1500 + Math.random()*2000);
      }
    });
  }

  // Lanzar recordatorio a la hora seleccionada
  function scheduleNextNotification() {
    if (!recordatoriosOn) return;
    let [h,m] = (horaRecordatorio||'08:00').split(':').map(Number);
    let now = new Date();
    let next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    if (now > next) next.setDate(next.getDate()+1);
    let ms = next - now;
    setTimeout(()=>{
      lanzarRecordatorioHabitosDelDia();
      scheduleNextNotification();
    }, ms);
  }

  // ------ Utilidad ------
  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
  function resetRachas() {
    let habits = getHabits();
    const t = today();
    habits.forEach(h => {
      let historial = h.historial || [];
      if(historial.length){
        let ult = historial[historial.length-1];
        if(ult.fecha !== t && ult.cumplido){
        }
        else if(ult.fecha !== t && !ult.cumplido){
          h.racha = 0;
        }
      }
    });
    saveHabits(habits);
  }
  resetRachas();
  renderHabits();
  actualizarToggleRecordatorio();

  // Atajo para volver al menú desde la consola
  window.irMenuPrincipal = function() {
    window.location.href = "index.html";
  };

  // Lanzar recordatorio a la hora seleccionada
  scheduleNextNotification();
});

// Formatea una fecha al formato ICS: YYYYMMDDTHHmmssZ
function formatDateICS(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
}

// Genera un UUID (identificador único) para cada evento
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Función para descargar el archivo ICS correspondiente a un hábito
function descargarICS(idx) {
  // Obtén el arreglo de hábitos almacenados en localStorage
  const habits = JSON.parse(localStorage.getItem('habitos') || '[]');
  const habit = habits[idx];
  if (!habit) return;

  // Define la fecha de inicio y fin del evento (en este ejemplo, 30 minutos de duración).
  // Puedes ajustar estos valores según tus necesidades o usar una fecha específica del hábito.
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minutos de duración

  // Formatea las fechas al formato requerido (UTC) para el ICS
  const dtStamp = formatDateICS(new Date());
  const dtStart = formatDateICS(startDate);
  const dtEnd = formatDateICS(endDate);

  // Genera un UID único para el evento
  const uid = uuidv4();

  // Crea el contenido del archivo ICS
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TuEmpresa//TuApp//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${habit.name}
DESCRIPTION:Frecuencia: ${habit.freq}
END:VEVENT
END:VCALENDAR`;

  // Crea un Blob con el contenido y fuerza la descarga
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${habit.name}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Exponer la función de descarga de ICS de forma global para que sea accesible desde el HTML
window.descargarICS = descargarICS;

