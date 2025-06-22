document.addEventListener("DOMContentLoaded", () => {
  // Preguntas del test
  const preguntastest = [
  {
    pregunta: "¿Cuál es tu fuente principal de ingresos?",
    opciones: [
      { texto: "Trabajo en relación de dependencia", valor: "empleado" },
      { texto: "Emprendimiento o negocio propio", valor: "emprendedor" },
      { texto: "Rentas/Dividendos/Inversiones", valor: "inversor" }
    ]
  },
  {
    pregunta: "¿Cómo registrás tus gastos e ingresos?",
    opciones: [
      { texto: "No registro, gasto según entra", valor: "gastador" },
      { texto: "Anoto en papel/app sólo los gastos grandes", valor: "cauteloso" },
      { texto: "Llevo todo organizado en planilla o app", valor: "ordenado" }
    ]
  },
  {
    pregunta: "¿Tenés algún ahorro para emergencias?",
    opciones: [
      { texto: "No, vivo el día a día", valor: "gastador" },
      { texto: "Sí, pero poco", valor: "cauteloso" },
      { texto: "Sí, al menos 3 meses de gastos", valor: "ordenado" }
    ]
  },
  {
    pregunta: "¿En qué invertís actualmente?",
    opciones: [
      { texto: "No invierto, me da miedo/perdí dinero", valor: "cauteloso" },
      { texto: "En plazo fijo/dólar/cosas seguras", valor: "conservador" },
      { texto: "Acciones, cripto, bienes raíces, fondos", valor: "inversor" }
    ]
  },
  {
    pregunta: "¿Cómo te sentís ante el riesgo financiero?",
    opciones: [
      { texto: "Prefiero no arriesgar nada", valor: "conservador" },
      { texto: "Arriesgo un poco, pero con límites", valor: "cauteloso" },
      { texto: "Me gusta el riesgo si puedo ganar más", valor: "arriesgado" }
    ]
  },
  {
    pregunta: "¿Te educás sobre finanzas y economía?",
    opciones: [
      { texto: "Casi nunca, no me interesa", valor: "gastador" },
      { texto: "Sólo si lo necesito", valor: "cauteloso" },
      { texto: "Siempre busco aprender más", valor: "inversor" }
    ]
  },
  {
    pregunta: "Si recibís un ingreso inesperado (ej: aguinaldo), ¿qué hacés?",
    opciones: [
      { texto: "Me lo gasto en gustos", valor: "gastador" },
      { texto: "Ahorro una parte y gasto otra", valor: "cauteloso" },
      { texto: "Lo uso para invertir o pagar deudas", valor: "ordenado" }
    ]
  }
];
  const resultadostest =  {
  gastador: {
    titulo: "Perfil Gastador",
    mensaje: "Te gusta disfrutar el presente, pero deberías empezar a controlar tus gastos y separar al menos un pequeño porcentaje de tus ingresos para el ahorro y la inversión. ¡El equilibrio es la clave!"
  },
  cauteloso: {
    titulo: "Perfil Cauteloso",
    mensaje: "Tenés conciencia financiera, pero aún te cuesta organizarte o arriesgarte a invertir. Seguí aprendiendo, organizando tus cuentas y dando pequeños pasos hacia la inversión."
  },
  ordenado: {
    titulo: "Perfil Ordenado",
    mensaje: "Manejás bien tus ingresos y gastos. ¡Felicitaciones! Si aún no invertís, podés comenzar a hacerlo en productos simples para multiplicar tu capital."
  },
  conservador: {
    titulo: "Perfil Conservador",
    mensaje: "Cuidás mucho tu dinero y evitás el riesgo. No está mal, pero recordá que el exceso de seguridad puede impedirte crecer. Probá inversiones con bajo riesgo y seguí aprendiendo."
  },
  inversor: {
    titulo: "Perfil Inversor",
    mensaje: "Pensás a largo plazo, aprendés y buscás siempre crecer. Seguí diversificando y aumentando tus conocimientos para obtener mejores resultados."
  },
  emprendedor: {
    titulo: "Perfil Emprendedor",
    mensaje: "Sos independiente y te gusta crear. No te olvides de separar ahorros, diversificar y profesionalizar tu educación financiera."
  },
  arriesgado: {
    titulo: "Perfil Arriesgado",
    mensaje: "No le tenés miedo al riesgo y eso puede darte grandes recompensas, pero ¡ojo! Equilibrá tu portafolio y evitá apuestas innecesarias."
  },
  empleado: {
    titulo: "Perfil Empleado",
    mensaje: "Recibís ingresos fijos y seguros. Es un buen momento para aprender a invertir, salir del ciclo del sueldo y aprovechar nuevas oportunidades."
  }
};
  let respuestas = [];
  let actual = 0;

  function mostrarPregunta() {
    const container = document.getElementById('testcontainer');
    const resultadoDiv = document.getElementById('resultadotest');
    resultadoDiv.classList.add('hidden');
    if (actual >= preguntastest.length) {
      mostrarResultado();
      return;
    }
    const p = preguntastest[actual];
    container.innerHTML = `<p><strong>${p.pregunta}</strong></p>` +
      p.opciones.map((op, idx) =>
        `<button class="opciontest" data-valor="${op.valor}">${op.texto}</button>`
      ).join('<br><br>');
    Array.from(container.getElementsByClassName('opciontest')).forEach(btn => {
      btn.onclick = (e) => {
        respuestas.push(btn.dataset.valor);
        actual++;
        mostrarPregunta();
      };
    });
  }

  function mostrarResultado() {
    const container = document.getElementById('testcontainer');
    const resultadoDiv = document.getElementById('resultadotest');
    container.innerHTML = "";
    resultadoDiv.classList.remove('hidden');

    // Conteo simple del perfil más elegido
    const conteo = {};
    respuestas.forEach(v => { conteo[v] = (conteo[v] || 0) + 1; });
    const perfil = Object.entries(conteo).sort((a,b)=>b[1]-a[1])[0][0];
    const resultado = resultadostest[perfil] || { titulo: "Perfil Indefinido", mensaje: "¡Ups! No pudimos determinar tu perfil. Probá de nuevo." };
    resultadoDiv.innerHTML = `<h3>${resultado.titulo}</h3><p>${resultado.mensaje}</p>`;

    // Guardar resultado en localStorage
    localStorage.setItem('perfilfinanciero', perfil);

    // Mostrar botón para ir a finanzas
    document.getElementById('btnirfinanzas').classList.remove('hidden');
  }

  mostrarPregunta();

  // Ir al dashboard de finanzas
  document.getElementById('btnirfinanzas').onclick = function() {
    window.location.href = "finanzas.html";
  };
});
