document.addEventListener("DOMContentLoaded", () => {
  // SIMULADOR: Cambia esto por tu sistema expwolfs real
  function getExp() {
    if (window.expwolfs && typeof window.expwolfs.getexptotal === "function") {
      return window.expwolfs.getexptotal();
    }
    // Fallback demo:
    return parseInt(localStorage.getItem("expusuario") || "0");
  }
  function descontarExp(cant) {
    let exp = getExp();
    exp = Math.max(0, exp - cant);
    if (window.expwolfs && typeof window.expwolfs.setexptotal === "function") {
      window.expwolfs.setexptotal(exp);
    } else {
      localStorage.setItem("expusuario", exp);
    }
    return exp;
  }

  // Recompensas disponibles
  const recompensas = [
    {
      id: "pro",
      titulo: "Desbloquear Desafíos Avanzados",
      desc: "Activa la sección de desafíos PRO en el área de Desafíos.",
      img: "assets/img/tienda/desafios-pro.png",
      cost: 80,
      estadoKey: "r_pro",
      requiere: null,
      btn: "Canjear",
      get estado() { return localStorage.getItem(this.estadoKey) || "disponible"; }
    },
    {
      id: "exp-x2",
      titulo: "Multiplicador de EXP x2 (24 hs)",
      desc: "Ganá el doble de experiencia por todas tus acciones durante 24 horas.",
      img: "assets/img/tienda/exp-x2.png",
      cost: 100,
      estadoKey: "r_exp_x2",
      requiere: null,
      btn: "Activar",
      get estado() { return localStorage.getItem(this.estadoKey) || "disponible"; }
    },
    {
      id: "calc",
      titulo: "Calculadora Avanzada de Inversiones",
      desc: "Desbloquea una calculadora PRO con funciones extra en el menú.",
      img: "assets/img/tienda/calculadora.png",
      cost: 120,
      estadoKey: "r_calc",
      requiere: null,
      btn: "Desbloquear",
      get estado() { return localStorage.getItem(this.estadoKey) || "disponible"; }
    },
    {
      id: "eywa",
      titulo: "Mensaje diario de EYWA (7 días)",
      desc: "Recibí cada mañana una frase personalizada de EYWA, la conciencia de White Wolfs.",
      img: "assets/img/tienda/eywa.png",
      cost: 50,
      estadoKey: "r_eywa",
      requiere: null,
      btn: "Recibir",
      get estado() { return localStorage.getItem(this.estadoKey) || "disponible"; }
    }
  ];

  // Render recompensas
  function renderRecompensas() {
    document.getElementById("expactual").textContent = getExp();
    const lista = document.getElementById("listarecompensas");
    lista.innerHTML = "";
    recompensas.forEach(r => {
      let li = document.createElement("li");
      li.className = "reward-item";
      let estado = r.estado;
      let disabled = "";
      let stateText = "";

      if (estado === "canjeado") {
        disabled = "disabled";
        stateText = '<span class="reward-state">¡YA OBTENIDO!</span>';
      } else if (getExp() < r.cost) {
        disabled = "disabled";
        stateText = '<span class="reward-state" style="color:#f87171">EXP insuficiente</span>';
      } else {
        stateText = "";
      }
      li.innerHTML = `
        <img src="${r.img}" alt="${r.titulo}" class="reward-img"/>
        <div class="reward-info">
          <div class="reward-title">${r.titulo}</div>
          <div class="reward-desc">${r.desc}</div>
          <span class="reward-cost">Costo: ${r.cost} EXP</span>
          <button class="btn-canjear" data-id="${r.id}" ${disabled}>${r.btn}</button>
          ${stateText}
        </div>
      `;
      lista.appendChild(li);
    });

    // Eventos de canje
    document.querySelectorAll(".btn-canjear").forEach(btn => {
      btn.onclick = function() {
        const id = this.dataset.id;
        canjearRecompensa(id);
      };
    });
  }

  // Lógica de canje y desbloqueo
  function canjearRecompensa(id) {
    const r = recompensas.find(x => x.id === id);
    if (!r) return;
    if (getExp() < r.cost) {
      alert("No tenés suficiente EXP.");
      return;
    }
    descontarExp(r.cost);
    localStorage.setItem(r.estadoKey, "canjeado");
    // Acción/desbloqueo especial
    if (id === "pro") {
      localStorage.setItem("desafiosprodesbloqueado", "1");
      alert("¡Desafíos PRO desbloqueados!\nAhora tenés acceso a nuevos retos.");
    } else if (id === "exp-x2") {
      let fechaAct = Date.now();
      localStorage.setItem("expx2inicio", fechaAct);
      alert("¡EXP x2 activada!\nTus acciones suman doble EXP durante 24 hs.");
    } else if (id === "calc") {
      localStorage.setItem("calcavanzada", "1");
      alert("¡Calculadora avanzada desbloqueada!\nLa verás disponible en tu menú.");
    } else if (id === "eywa") {
      let hoy = new Date().toISOString().slice(0,10);
      localStorage.setItem("eywamsginicio", hoy);
      alert("¡Ahora recibirás un mensaje especial de EYWA durante 7 días!");
    }
    renderRecompensas();
  }

  renderRecompensas();
});
