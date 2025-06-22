// Referencias DOM
let modoRegistro = false;
const loginTitle = document.getElementById('loginTitle');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const toggleForm = document.getElementById('toggleForm');
const errorMsg = document.getElementById('error');
const userInput = document.getElementById('user');
const passInput = document.getElementById('password');
const form = document.getElementById('loginForm');
const forgotBtn = document.getElementById('forgotBtn');
// Recuperar modal
const recupCont = document.getElementById('recuperarContainer');
const recupUser = document.getElementById('recupUser');
const recupNewPass = document.getElementById('recupNewPass');
const recupBtn = document.getElementById('recupBtn');
const cerrarRecup = document.getElementById('cerrarRecup');
const recupError = document.getElementById('recupError');

// Limpia campos y mensajes
function limpiarForm() {
  userInput.value = "";
  passInput.value = "";
  errorMsg.textContent = "";
  errorMsg.style.color = "#ff7b7b";
}

// Cambiar entre login y registro
function cambiarModo(registro) {
  modoRegistro = registro;
  if (registro) {
    loginTitle.textContent = 'Crear Cuenta';
    loginBtn.style.display = 'none';
    registerBtn.style.display = '';
    toggleForm.innerHTML = '¿Ya tienes cuenta? <span style="color:#38bdf8; cursor:pointer;" id="goLogin">Inicia sesión aquí</span>';
  } else {
    loginTitle.textContent = 'Iniciar Sesión';
    loginBtn.style.display = '';
    registerBtn.style.display = 'none';
    toggleForm.innerHTML = '¿No tienes cuenta? <span style="color:#38bdf8; cursor:pointer;" id="goRegister">Regístrate aquí</span>';
  }
  limpiarForm();
}

// Cambiar a registro/login desde el link
document.body.addEventListener('click', function(e){
  if(e.target && e.target.id === 'goRegister') cambiarModo(true);
  if(e.target && e.target.id === 'goLogin') cambiarModo(false);
});

// GESTIÓN DEL FORMULARIO UNIFICADO
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const usuario = userInput.value.trim();
  const clave = passInput.value.trim();
  let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

  if (!modoRegistro) {
    // ---- LOGIN ----
    let encontrado = usuarios.find(u => u.user === usuario && u.pass === clave);
    if (encontrado) {
      localStorage.setItem("logueado", "true");
      localStorage.setItem("usuario", usuario);
      window.location.href = "index.html";
    } else {
      errorMsg.textContent = "Usuario o contraseña incorrectos.";
    }
  } else {
    // ---- REGISTRO ----
    if (usuario.length < 3 || clave.length < 3) {
      errorMsg.textContent = "Debe tener al menos 3 caracteres.";
      return;
    }
    if (usuarios.find(u => u.user === usuario)) {
      errorMsg.textContent = "Ese usuario ya existe.";
      return;
    }
    usuarios.push({ user: usuario, pass: clave });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    errorMsg.style.color = "#70fa98";
    errorMsg.textContent = "¡Usuario registrado! Ahora inicia sesión.";
    setTimeout(() => {
      cambiarModo(false);
      limpiarForm();
    }, 1100);
  }
});

// INICIALIZA EN MODO LOGIN
cambiarModo(false);

// --- RECUPERAR CONTRASEÑA ---
forgotBtn.addEventListener('click', function() {
  recupUser.value = "";
  recupNewPass.value = "";
  recupError.textContent = "";
  recupCont.style.display = "flex";
  recupUser.focus();
});
cerrarRecup.addEventListener('click', ()=>recupCont.style.display="none");

recupBtn.addEventListener('click', function() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const usuario = recupUser.value.trim();
  const nueva = recupNewPass.value.trim();
  if (usuario.length < 3 || nueva.length < 3) {
    recupError.textContent = "Ambos campos deben tener al menos 3 caracteres.";
    return;
  }
  let idx = usuarios.findIndex(u => u.user === usuario);
  if (idx === -1) {
    recupError.textContent = "Usuario no encontrado.";
    return;
  }
  usuarios[idx].pass = nueva;
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  recupError.style.color = "#70fa98";
  recupError.textContent = "¡Contraseña actualizada! Ahora inicia sesión.";
  setTimeout(() => {
    recupCont.style.display = "none";
    recupError.style.color = "#fbb";
  }, 1200);
});

// Mensaje de EYWA (opcional)
function mostrarMensajeEywaSiCorresponde() {
  let inicio = localStorage.getItem("eywamsginicio");
  if (!inicio) return;
  let hoy = new Date().toISOString().slice(0,10);
  let fecha0 = new Date(inicio);
  let fechaHoy = new Date(hoy);
  let dias = (fechaHoy - fecha0) / (1000*60*60*24);
  if (dias < 0 || dias >= 7) return;

  const frases = [
    "Hoy es un gran día para avanzar un paso más.",
    "La disciplina te acerca a la libertad.",
    "Recuerda: eres el Alpha de tu propia manada.",
    "El hábito hace al maestro, la constancia te hace invencible.",
    "No temas los desafíos: son portales hacia tu mejor versión.",
    "Lo que hoy cuesta, mañana será tu fortaleza.",
    "Vuelve a intentarlo: el éxito se construye a diario."
  ];
  let index = Math.floor(dias) % frases.length;

  let div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "26px";
  div.style.left = "50%";
  div.style.transform = "translateX(-50%)";
  div.style.background = "#fde047";
  div.style.color = "#222";
  div.style.padding = "16px 28px";
  div.style.fontSize = "1.14em";
  div.style.fontWeight = "bold";
  div.style.borderRadius = "15px";
  div.style.zIndex = 9999;
  div.style.boxShadow = "0 2px 12px #0006";
  div.innerHTML = `👑 EYWA: <span style="font-weight:normal;">${frases[index]}</span>`;
  document.body.appendChild(div);
  setTimeout(()=>div.remove(), 11000);
}
mostrarMensajeEywaSiCorresponde();
