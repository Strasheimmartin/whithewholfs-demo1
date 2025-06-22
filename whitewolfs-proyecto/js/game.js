document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startbtn");
  const panel = document.getElementById("habitspanel");
  const checkboxes = document.querySelectorAll("#habitspanel input[type='checkbox']");
  const lobezno = document.querySelector(".lobezno");
  const fraseEywa = document.querySelector(".eywa");

  startBtn.addEventListener("click", () => {
    panel.classList.remove("hidden");
    startBtn.innerText = "Seguí avanzando";
  });

  // Botón para ingresar a Finanzas (inicialmente oculto)
  const finanzasBtn = document.createElement("button");
  finanzasBtn.textContent = "Ingresar a Finanzas Conscientes";
  finanzasBtn.classList.add("finanzas-btn");
  finanzasBtn.style.display = "none";
  document.querySelector(".container").appendChild(finanzasBtn);

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const completados = Array.from(checkboxes).filter(cb => cb.checked).length;
      if (completados === checkboxes.length) {
        lobezno.src = "assets/img/lobezno-nivel2.png";
        fraseEywa.innerText = "Tu esfuerzo ha despertado el segundo fuego interior. Sigue caminando, Alpha.\nLa energía que dominas dentro de ti... ahora dominará también el flujo del dinero.";
        finanzasBtn.style.display = "inline-block";
      }
    });
  });

  finanzasBtn.addEventListener("click", () => {
    window.location.href = "finanzas.html";
  });
});
