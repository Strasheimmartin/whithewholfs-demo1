// EXP Global para toda la app
window.expwolfs = {
  nivelactual: 0,
  expactual: 0,
  exppornivel: [100,200,300,400,500,600,700,800,900,1000,1200,1400,1600,1800,2000,2200,2500,2700,3000,3500],
  sumarexp: function(origen, cantidad) {
    this.expactual += cantidad;
    while (this.expactual >= this.exppornivel[this.nivelactual] && this.nivelactual < 19) {
      this.expactual -= this.exppornivel[this.nivelactual];
      this.nivelactual++;
    }

    // BLOQUE para verificar si está activado el x2:
    let cantidadfinal = cantidad;
    let inicio = parseInt(localStorage.getItem("expx2inicio") || "0");
    if (inicio) {
      let ahora = Date.now();
      if (ahora - inicio <= 86400000) { // 24 horas
        cantidadfinal *= 2;
      }
    }

    // Sumar la experiencia en localStorage usuario
    let expusuario = parseInt(localStorage.getItem("expusuario") || "0");
    expusuario += cantidadfinal;
    localStorage.setItem("expusuario", expusuario);

    // Guardar el estado global del lobo
    localStorage.setItem("expwolfs", JSON.stringify({
      nivel: this.nivelactual,
      exp: this.expactual
    }));
  },
  getnivel: function() { return this.nivelactual + 1; },
  getexp: function() { return this.expactual; },
  getexptonext: function() { return this.exppornivel[this.nivelactual] || 100; }
};

// Cargar si existe experiencia previa
if(localStorage.getItem("expwolfs")) {
  let guardado = JSON.parse(localStorage.getItem("expwolfs"));
  window.expwolfs.nivelactual = guardado.nivel;
  window.expwolfs.expactual = guardado.exp;
}
