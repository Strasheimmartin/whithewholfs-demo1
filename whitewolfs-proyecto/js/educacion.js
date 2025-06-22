document.addEventListener("DOMContentLoaded", () => {
  const TEMAS = [
    {
      titulo: "¿Qué es el dinero?",
      icono: "💸",
      html: `
        <p>El dinero es un medio de intercambio y depósito de valor, normalmente aceptado por todos.<br>
        No es el papel lo que vale, sino lo que representa: confianza y liquidez.</p>
        <span class="ejemplo">Ejemplo: $100 sirven para comprar, pero no valen por sí solos.</span>
        <a href="https://www.youtube.com/watch?v=WJF0ZoWiNeY" target="_blank" class="video-link">
          ¿Qué es el dinero y cómo usarlo a tu favor? (Dimitri Uralov)
        </a>
      `
    },
    {
      titulo: "Diferencia entre ingreso y gasto",
      icono: "🔄",
      html: `
        <p>Ingresos son lo que entra (salario, ventas); gastos, lo que sale (servicios, compras).<br>
        Registrar ambos es clave.</p>
        <span class="ejemplo">Ej.: ingreso $100.000, gasto $80.000 → queda $20.000 de ahorro.</span>
        <a href="https://www.youtube.com/watch?v=YgxAZrdnfuI" target="_blank" class="video-link">
          Cómo Gastar, Ahorrar e Invertir el Dinero (Sin Remordimientos)
        </a>
      `
    },
    {
      titulo: "¿Qué es un presupuesto y para qué sirve?",
      icono: "🗂️",
      html: `
        <p>Es un plan que organiza ingresos y gastos, ayudándote a ahorrar y evitar sorpresas.</p>
        <span class="ejemplo">Ej.: asigná $20.000 a ahorro, $50.000 a gastos esenciales.</span>
        <a href="https://www.youtube.com/watch?v=Py3e-JgylYU" target="_blank" class="video-link">
          Presupuestar Como El 1%: Cómo Ahorrar, Invertir Y Gastar Como Los Ricos
        </a>
      `
    },
    {
      titulo: "¿Qué es un activo y un pasivo?",
      icono: "🏦",
      html: `
        <p>Activo: genera dinero (inmueble alquilado). Pasivo: consume dinero (auto sin uso).</p>
        <span class="ejemplo">Ej.: un departamento alquilado es un activo; un auto solo para salidas, un pasivo.</span>
        <a href="https://www.youtube.com/watch?v=jt_hGmpSpag" target="_blank" class="video-link">
          Aprende a Invertir y Gestionar tu Dinero este 2025
        </a>
      `
    },
    {
      titulo: "Errores financieros comunes",
      icono: "⚠️",
      html: `
        <ul>
          <li>No registrar gastos</li>
          <li>Turismo de deuda (tarjetas/plásticos)</li>
          <li>No diferenciar necesidades de deseos</li>
          <li>Invertir sin formarse</li>
        </ul>
        <span class="ejemplo">Evitar estos errores mejora tu salud financiera.</span>
      `
    },
    {
      titulo: "¿Qué es ahorrar? Estrategias",
      icono: "💰",
      html: `
        <p>Separar dinero para objetivos, invertir o emergencias. Regla 50‑30‑20.</p>
        <span class="ejemplo">Destiná 20% de tus ingresos a ahorro antes de gastar.</span>
        <a href="https://www.youtube.com/watch?v=LE02rjclk9I" target="_blank" class="video-link">
          El método que te ayudará a ahorrar, invertir y disfrutar tu dinero
        </a>
      `
    },
    {
      titulo: "Introducción a la inversión",
      icono: "📈",
      html: `
        <p>Invertir permite protegerte de la inflación y hacer crecer tu dinero.</p>
        <a href="https://www.youtube.com/watch?v=ykTLxcDlqb0" target="_blank" class="video-link">
          Cómo Empezar a Ahorrar e Invertir con Bajos Ingresos
        </a>
      `
    },
    {
      titulo: "Instrumentos de inversión básicos",
      icono: "🏦",
      html: `
        <ul>
          <li>Plazo fijo</li><li>Fondos comunes</li><li>Acciones</li><li>Bonos</li>
        </ul>
        <a href="https://www.youtube.com/watch?v=jt_hGmpSpag" target="_blank" class="video-link">
          Aprende a Invertir y Gestionar tu Dinero este 2025
        </a>
      `
    },
    {
      titulo: "Mentalidad financiera y metas",
      icono: "🧠",
      html: `
        <p>El dinero es 80% mentalidad. Definir metas y mantener disciplina es clave.</p>
        <a href="https://www.youtube.com/watch?v=YgxAZrdnfuI" target="_blank" class="video-link">
          Cómo Gastar, Ahorrar e Invertir el Dinero (Sin Remordimientos)
        </a>
      `
    }
  ];

  const acordeon = document.getElementById("acordeonFinanciero");
  TEMAS.forEach((tema) => {
    const item = document.createElement("div");
    item.className = "acordeon-item";
    item.innerHTML = `
      <div class="acordeon-titulo" tabindex="0"><span class="icono">${tema.icono}</span>${tema.titulo}<span class="arrow">▶</span></div>
      <div class="acordeon-contenido">${tema.html}</div>`;
    acordeon.appendChild(item);
    const title = item.querySelector(".acordeon-titulo");
    title.onclick = () => item.classList.toggle("abierto");
    title.onkeydown = e => { if (e.key === "Enter"||e.key===" ") item.classList.toggle("abierto"); };
  });
});
