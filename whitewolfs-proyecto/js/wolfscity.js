// =================== ESTADO GLOBAL ===================
const usuario = {
    nombre: "Martín",
    nivel: 2,
    saldo: 5000,
    energia: 80,
    activos: 1,
    misiones: 0,
    historial: [],
};
const cuentas = {
    gastos: 2000,
    ahorro: 2000,
    ocio: 1000,
};
let movimientos = JSON.parse(localStorage.getItem("movimientos") || "[]");

// =================== AVATAR DINÁMICO ===================
document.addEventListener('DOMContentLoaded', () => {
    const imglobezno = localStorage.getItem("imglobezno");
    document.getElementById('loboAvatar').src = imglobezno || "assets/img/evolucion/nivel_1__beb_col_rico.jpg";
    // Tooltips
    const tooltip = document.getElementById('tooltipCiudad');
    document.querySelectorAll('.lugar').forEach(lugar => {
        lugar.addEventListener('mouseenter', function() {
            tooltip.textContent = this.dataset.tooltip;
            tooltip.style.display = 'block';
        });
        lugar.addEventListener('mousemove', function(e) {
            tooltip.style.left = (e.clientX + 14) + 'px';
            tooltip.style.top  = (e.clientY - 8) + 'px';
        });
        lugar.addEventListener('mouseleave', function() {
            tooltip.style.display = 'none';
        });
    });
    actualizarPanelResumen();
});

// =================== FUNCION UNIVERSAL DE REGISTRO ===================
function registrarMovimiento({tipo, categoria, sector, monto, comentario}) {
    const mov = {
        tipo,
        categoria,
        sector,
        monto: Number(monto),
        comentario: comentario || "",
        // -- ACA EL CAMBIO: fecha SIEMPRE en formato ISO --
        fecha: new Date().toISOString(),
    };
    movimientos.push(mov);
    localStorage.setItem("movimientos", JSON.stringify(movimientos));
    // Actualiza usuario/cuentas según sector y tipo
    if (tipo === "gasto") usuario.saldo -= mov.monto;
    if (tipo === "ingreso") usuario.saldo += mov.monto;
    if (sector === "super" || categoria === "super") cuentas.gastos -= mov.monto;
    if (sector === "vivienda") cuentas.gastos -= mov.monto;
    if (sector === "oficina" && tipo === "ingreso") {
        if (categoria === "salario") cuentas.gastos += mov.monto;
        if (categoria === "extra") cuentas.ocio += mov.monto;
        if (categoria === "activo") cuentas.ahorro += mov.monto;
    }
    if (sector === "activos" && tipo === "gasto") cuentas.ahorro -= mov.monto;
    if (sector === "activos" && tipo === "ingreso") cuentas.ahorro += mov.monto;
    actualizarPanelResumen();
}

// =================== PANEL RESUMEN GLOBAL ===================
function actualizarPanelResumen() {
    // Refresca los movimientos desde storage (por si hay nuevos desde Finanzas)
    movimientos = JSON.parse(localStorage.getItem("movimientos") || "[]");
    document.getElementById('saldoActual').textContent = "$" + usuario.saldo;
    document.getElementById('energiaActual').textContent = usuario.energia;
    document.getElementById('activosActual').textContent = usuario.activos;
    document.getElementById('misionesActual').textContent = usuario.misiones;

    let saldosCajitas = `<hr style='margin:10px 0 7px 0;border:.5px solid #283;'/><div style='font-size:.98em'>🟩 Gastos: $${cuentas.gastos}<br>🟦 Ahorro: $${cuentas.ahorro}<br>🟨 Ocio: $${cuentas.ocio}</div>`;
    document.getElementById('panelResumen').innerHTML =
        `<div>💵 Saldo: <span id="saldoActual">$${usuario.saldo}</span></div>
        <div>🔋 Energía: <span id="energiaActual">${usuario.energia}</span></div>
        <div>📈 Activos: <span id="activosActual">${usuario.activos}</span></div>
        <div>🎯 Misiones: <span id="misionesActual">${usuario.misiones}</span></div>
        ${saldosCajitas}`;
}

// ============= REFRESCO AUTOMÁTICO DEL PANEL RESUMEN ============
window.addEventListener("storage", function(e) {
    if (e.key === "movimientos") {
        actualizarPanelResumen();
    }
});

// =================== MODAL GENÉRICO ===================
function mostrarModalCiudad(titulo, contenidoHtml, onAccion) {
    document.getElementById("contenidoModalCiudad").innerHTML = `
        <button class="btn-cerrar-modal" onclick="cerrarModalCiudad()">✖</button>
        <h2>${titulo}</h2>
        ${contenidoHtml}
        <div id="fraseeywa" class="frase-eywa"></div>
    `;
    document.getElementById("modalCiudad").style.display = "block";
    document.getElementById("modalFondo").style.display = "block";
    if (typeof onAccion === "function") {
        document.getElementById("btnmodalaccion").onclick = onAccion;
    }
}
function cerrarModalCiudad() {
    document.getElementById("modalCiudad").style.display = "none";
    document.getElementById("modalFondo").style.display = "none";
}

// =================== SECTORES INTEGRADOS ===================

function abrirModalSuper() {
    mostrarModalCiudad(
        "Registro de Gasto en Supermercado",
        `<label>Monto gastado:</label><br>
        <input type="number" id="montogastosuper" placeholder="$"><br>
        <label>Comentario (opcional):</label><br>
        <input type="text" id="comentariosuper" maxlength="40"><br>
        <button id="btnmodalaccion" class="btn-modal-accion">Registrar Gasto</button>`,
        function () {
            const monto = Number(document.getElementById("montogastosuper").value);
            const comentario = document.getElementById("comentariosuper").value;
            if (monto > 0 && monto <= usuario.saldo) {
                registrarMovimiento({ tipo: "gasto", categoria: "super", sector: "super", monto, comentario });
                document.getElementById("fraseeywa").textContent = "🦊 EYWA: ¡Gasto registrado en supermercado!";
            } else {
                document.getElementById("fraseeywa").textContent = "🦊 EYWA: Ingresá un monto válido menor a tu saldo.";
            }
        }
    );
}

function abrirModalVivienda() {
    mostrarModalCiudad(
        "Registrar Gasto de Vivienda",
        `<label>Tipo de gasto:</label><br>
        <select id="tipogastovivienda">
            <option value="alquiler">Alquiler</option>
            <option value="expensas">Expensas/Servicios</option>
            <option value="mejora">Mejoras/Hogar</option>
        </select><br>
        <label>Monto:</label><br>
        <input type="number" id="montogastovivienda" placeholder="$"><br>
        <label>Comentario (opcional):</label><br>
        <input type="text" id="comentariovivienda" maxlength="40"><br>
        <button id="btnmodalaccion" class="btn-modal-accion">Registrar Gasto</button>`,
        function () {
            const tipo = document.getElementById("tipogastovivienda").value;
            const monto = Number(document.getElementById("montogastovivienda").value);
            const comentario = document.getElementById("comentariovivienda").value;
            if (monto > 0 && monto <= usuario.saldo) {
                registrarMovimiento({ tipo: "gasto", categoria: tipo, sector: "vivienda", monto, comentario });
                let frase = "¡Pago registrado!";
                if (tipo === "alquiler") frase = "🦊 EYWA: Pagá antes y obtené intereses con tu capital.";
                if (tipo === "mejora") frase = "🦊 EYWA: Mejoras en tu vivienda aumentan tu bienestar.";
                document.getElementById("fraseeywa").textContent = frase;
            } else {
                document.getElementById("fraseeywa").textContent = "🦊 EYWA: Ingresá un monto válido menor a tu saldo.";
            }
        }
    );
}

function abrirModalOficina() {
    mostrarModalCiudad(
        "Registrar Ingreso en Oficina",
        `<label>Tipo de ingreso:</label><br>
        <select id="tipoingresooficina">
            <option value="salario">Salario</option>
            <option value="extra">Ingreso Extra</option>
            <option value="activo">Ingreso por Activo</option>
        </select><br>
        <label>Monto recibido:</label><br>
        <input type="number" id="montoingresooficina" placeholder="$"><br>
        <label>Comentario (opcional):</label><br>
        <input type="text" id="comentariooficina" maxlength="40"><br>
        <button id="btnmodalaccion" class="btn-modal-accion">Registrar Ingreso</button>`,
        function () {
            const tipo = document.getElementById("tipoingresooficina").value;
            const monto = Number(document.getElementById("montoingresooficina").value);
            const comentario = document.getElementById("comentariooficina").value;
            if (monto > 0) {
                if(tipo === "activo") usuario.activos += 1;
                registrarMovimiento({ tipo: "ingreso", categoria: tipo, sector: "oficina", monto, comentario });
                let frase = "";
                if (tipo === "salario") frase = "🦊 EYWA: ¡Salario cobrado!";
                if (tipo === "extra") frase = "🦊 EYWA: Ingreso extra. ¡Invertí en activos!";
                if (tipo === "activo") frase = "🦊 EYWA: ¡Suma de activo!";
                document.getElementById("fraseeywa").textContent = frase;
            } else {
                document.getElementById("fraseeywa").textContent = "🦊 EYWA: Ingresá un monto válido mayor a cero.";
            }
        }
    );
}

function abrirModalActivos() {
    mostrarModalCiudad(
        "Gestión de Activos",
        `<label>Acción:</label><br>
        <select id="accionactivo">
            <option value="compra">Comprar Activo</option>
            <option value="venta">Vender Activo</option>
            <option value="ingreso">Registrar Ingreso por Activo</option>
        </select><br>
        <label>Monto:</label><br>
        <input type="number" id="montoactivo" placeholder="$"><br>
        <label>Comentario (opcional):</label><br>
        <input type="text" id="comentarioactivo" maxlength="40"><br>
        <button id="btnmodalaccion" class="btn-modal-accion">Registrar Acción</button>`,
        function () {
            const accion = document.getElementById("accionactivo").value;
            const monto = Number(document.getElementById("montoactivo").value);
            const comentario = document.getElementById("comentarioactivo").value;
            let frase = "";
            if (accion === "compra") {
                if (monto > 0 && monto <= usuario.saldo) {
                    usuario.activos += 1;
                    registrarMovimiento({ tipo: "gasto", categoria: "compra-activo", sector: "activos", monto, comentario });
                    frase = "🦊 EYWA: ¡Invertiste en un activo! Gastar en activos es 'gasto bueno'.";
                } else frase = "🦊 EYWA: Ingresá un monto válido menor o igual a tu saldo.";
            }
            if (accion === "venta") {
                if (monto > 0 && usuario.activos > 0) {
                    usuario.activos -= 1;
                    registrarMovimiento({ tipo: "ingreso", categoria: "venta-activo", sector: "activos", monto, comentario });
                    frase = "🦊 EYWA: Vendiste un activo. Reinvertí para potenciar tu cashflow.";
                } else frase = "🦊 EYWA: Debés tener al menos 1 activo para vender y el monto debe ser mayor a cero.";
            }
            if (accion === "ingreso") {
                if (monto > 0 && usuario.activos > 0) {
                    registrarMovimiento({ tipo: "ingreso", categoria: "ingreso-activo", sector: "activos", monto, comentario });
                    frase = "🦊 EYWA: ¡Ingreso pasivo registrado!";
                } else frase = "🦊 EYWA: Necesitás al menos 1 activo registrado y un monto mayor a cero.";
            }
            document.getElementById("fraseeywa").textContent = frase;
        }
    );
}

function abrirModalBanco() {
    mostrarModalCiudad(
        "Banco y Transferencias Inteligentes",
        `<label>De:</label><br>
        <select id="origenbanco">
            <option value="gastos">Gastos</option>
            <option value="ahorro">Ahorro/Inversión</option>
            <option value="ocio">Ocio/Gustos</option>
        </select><br>
        <label>A:</label><br>
        <select id="destinobanco">
            <option value="gastos">Gastos</option>
            <option value="ahorro">Ahorro/Inversión</option>
            <option value="ocio">Ocio/Gustos</option>
        </select><br>
        <label>Monto a transferir:</label><br>
        <input type="number" id="montotransferbanco" placeholder="$"><br>
        <button id="btnmodalaccion" class="btn-modal-accion">Transferir</button>`,
        function () {
            const origen = document.getElementById("origenbanco").value;
            const destino = document.getElementById("destinobanco").value;
            const monto = Number(document.getElementById("montotransferbanco").value);
            if (origen === destino) {
                document.getElementById("fraseeywa").textContent = "🦊 EYWA: Seleccioná cuentas distintas para transferir.";
                return;
            }
            if (monto > 0 && cuentas[origen] >= monto) {
                cuentas[origen] -= monto;
                cuentas[destino] += monto;
                if (destino === "ahorro") {
                    const interes = Math.round(monto * 0.01);
                    cuentas["ahorro"] += interes;
                    usuario.historial.push({ tipo: "interes", monto: interes, comentario: "Interés generado por transferir a Ahorro." });
                }
                actualizarPanelResumen();
                document.getElementById("fraseeywa").textContent =
                    destino === "ahorro"
                        ? "🦊 EYWA: ¡Tu plata en Ahorro/Inversión ya está generando intereses! Así se optimiza el flujo antes de grandes pagos."
                        : "🦊 EYWA: Transferencia realizada. Usá tus cajitas para anticiparte y nunca quedarte sin fondo.";
            } else {
                document.getElementById("fraseeywa").textContent = "🦊 EYWA: Monto inválido o fondos insuficientes en la cuenta origen.";
            }
        }
    );
}

function abrirModalGym() {
    mostrarModalCiudad(
        "Entrenamiento en Gimnasio",
        `<label>Tipo de entrenamiento:</label><br>
        <select id="tipogym">
            <option value="fisico">Físico</option>
            <option value="mental">Mental</option>
            <option value="mixto">Mixto</option>
        </select><br>
        <label>Duración (minutos):</label><br>
        <input type="number" id="minutosgym" placeholder="Min"><br>
        <button id="btnmodalaccion" class="btn-modal-accion">Entrenar</button>`,
        function () {
            const tipo = document.getElementById("tipogym").value;
            const minutos = Number(document.getElementById("minutosgym").value);
            if (minutos > 0) {
                let energiaGanada = Math.floor(minutos / 15);
                usuario.energia += energiaGanada;
                usuario.historial.push({ tipo: "gym", subtipo: tipo, minutos, energiaGanada });
                actualizarPanelResumen();
                let frase = "";
                if (tipo === "fisico") frase = `🦊 EYWA: ¡Entrenamiento físico! Ganaste ${energiaGanada} puntos de energía.`;
                else if (tipo === "mental") frase = `🦊 EYWA: ¡Mental! Energía y foco extra.`;
                else frase = `🦊 EYWA: ¡Sesión mixta! Energía a tope.`;
                document.getElementById("fraseeywa").textContent = frase;
            } else {
                document.getElementById("fraseeywa").textContent = "🦊 EYWA: Ingresá minutos válidos para sumar energía.";
            }
        }
    );
}

function abrirModalBiblioteca() {
    mostrarModalCiudad(
        "Sesión de Biblioteca",
        `<label>Actividad:</label><br>
        <select id="actividadbiblio">
            <option value="leer">Lectura</option>
            <option value="estudiar">Estudio</option>
            <option value="reflexionar">Reflexión Guiada</option>
        </select><br>
        <label>Minutos dedicados:</label><br>
        <input type="number" id="minutosbiblio" placeholder="Min"><br>
        <button id="btnmodalaccion" class="btn-modal-accion">Registrar</button>`,
        function () {
            const actividad = document.getElementById("actividadbiblio").value;
            const minutos = Number(document.getElementById("minutosbiblio").value);
            if (minutos > 0) {
                let mision = false;
                if (actividad === "leer" && minutos >= 20) mision = true;
                usuario.historial.push({ tipo: "biblioteca", actividad, minutos });
                if (mision) usuario.misiones += 1;
                actualizarPanelResumen();
                let frase = "";
                if (actividad === "leer") frase = "🦊 EYWA: Cada página te acerca a tu mejor versión.";
                else if (actividad === "estudiar") frase = "🦊 EYWA: Aprender es la mejor inversión.";
                else frase = "🦊 EYWA: Reflexionar es afilar el hacha.";
                if (mision) frase += " 🎯 Misión diaria completada.";
                document.getElementById("fraseeywa").textContent = frase;
            } else {
                document.getElementById("fraseeywa").textContent = "🦊 EYWA: Ingresá minutos válidos para sumar progreso.";
            }
        }
    );
}

// =================== INICIALIZACIÓN ===================
window.onload = () => {
    document.getElementById('contenido').style.display = 'none';
    document.querySelector('.wolfscity-mapa').style.display = 'block';
    actualizarPanelResumen();
    // Plus: refresca cada 2 segundos por si hay cambios locales
    setInterval(actualizarPanelResumen, 2000);
};
