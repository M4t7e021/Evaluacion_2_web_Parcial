const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 1. Estructura de datos en memoria para el Inventario y la Reserva del Usuario
let menuInventario = [
  { id: 101, nombre: "Menú Ejecutivo (Pollo)", precio: 5.50, stock: 12, categoria: "Fuerte" },
  { id: 102, nombre: "Sopa de Res Tradicional", precio: 4.00, stock: 8, categoria: "Entrada" },
  { id: 103, nombre: "Ensalada César con Pollo", precio: 4.75, stock: 5, categoria: "Saludable" },
  { id: 104, nombre: "Pasta Alfredo", precio: 6.00, stock: 10, categoria: "Fuerte" }
];

// Tiempo máximo para completar una reserva (en segundos). Se puede cambiar con TIEMPO_RESERVA_SEG en el .env
const TIEMPO_RESERVA_SEG = Number(process.env.TIEMPO_RESERVA_SEG) || 120;

// Estado de la reserva activa del usuario y su saldo inicial
let reservaUsuario = {
  saldo: 25.00,
  itemsReservados: [], // Ejemplo: [{ id: 101, cantidad: 2 }]
  inicio: null         // Momento (ms) en que se añadió el primer plato; null si no hay reserva activa
};

function calcularTotal() {
  const total = reservaUsuario.itemsReservados.reduce((acumulado, item) => {
    const plato = menuInventario.find(p => p.id === item.id);

    return acumulado + (plato ? plato.precio * item.cantidad : 0);
  }, 0);

  return Number(total.toFixed(2));
}

// Segundos que le quedan a la reserva activa (null si no hay reserva)
function segundosRestantes() {
  if (!reservaUsuario.inicio) return null;
  const msRestantes = reservaUsuario.inicio + TIEMPO_RESERVA_SEG * 1000 - Date.now();
  return Math.max(0, Math.ceil(msRestantes / 1000));
}

function obtenerReserva() {
  return {
    saldo: Number(reservaUsuario.saldo.toFixed(2)),
    itemsReservados: reservaUsuario.itemsReservados,
    total: calcularTotal(),
    segundosRestantes: segundosRestantes(),
    duracionSegundos: TIEMPO_RESERVA_SEG
  };
}

// Cierra la reserva activa: devuelve las porciones al stock y la vacía
function liberarReserva() {
  reservaUsuario.itemsReservados.forEach((item) => {
    const plato = menuInventario.find((p) => p.id === item.id);
    if (plato) plato.stock += item.cantidad;
  });
  reservaUsuario.itemsReservados = [];
  reservaUsuario.inicio = null;
}

// Si se acabó el tiempo, la reserva se cierra y el stock vuelve al menú
function verificarExpiracion() {
  if (reservaUsuario.inicio && segundosRestantes() === 0) {
    liberarReserva();
  }
}

// Antes de atender CUALQUIER endpoint se revisa si la reserva ya expiró
app.use('/api', (req, res, next) => {
  verificarExpiracion();
  next();
});

// Compara dinero en centavos para evitar errores de decimales (ej: 25.000000000000004 > 25)
function superaSaldo(total) {
  return Math.round(total * 100) > Math.round(reservaUsuario.saldo * 100);
}

// ENDPOINT 1: GET /api/menu
// Propósito: Devuelve la lista completa de alimentos disponibles hoy.
app.get('/api/menu', (req, res) => {
  res.json(menuInventario);
});

// ENDPOINT 2: GET /api/reserva
app.get('/api/reserva', (req, res) => {
  res.json(obtenerReserva());
});



// ==========================================
// ENDPOINT 3: POST /api/reserva/agregar
// Propósito: Añade temporalmente un plato a la reserva validando el stock.
// ==========================================
app.post('/api/reserva/agregar', (req, res) => {
  const { alimentoId, cantidad } = req.body;
  const cantSolicitada = cantidad === undefined ? 1 : Number(cantidad);

  // La cantidad debe ser un entero positivo (si no, un número negativo "regalaría" stock)
  if (!Number.isInteger(cantSolicitada) || cantSolicitada < 1) {
    return res.status(400).json({ mensaje: "La cantidad debe ser un entero mayor que cero." });
  }

  // Buscar el alimento en el inventario general
  const plato = menuInventario.find(p => p.id === Number(alimentoId));

  if (!plato) {
    return res.status(404).json({ mensaje: "El alimento no existe en el menú." });
  }

  // Validación estricta de stock: Si el stock es menor a lo solicitado, responde 400 Bad Request
  if (plato.stock < cantSolicitada) {
    return res.status(400).json({ mensaje: "Stock insuficiente" });
  }

  // Validación de saldo: el total de la reserva no puede superar el saldo del usuario
  if (superaSaldo(calcularTotal() + plato.precio * cantSolicitada)) {
    return res.status(400).json({ mensaje: "Saldo insuficiente para esta cantidad" });
  }

  // Buscar si ya está en la reserva del usuario para actualizar o agregar
  const itemExistente = reservaUsuario.itemsReservados.find(i => i.id === Number(alimentoId));

  // El temporizador arranca al añadir el primer plato de una reserva nueva
  if (!reservaUsuario.inicio) {
    reservaUsuario.inicio = Date.now();
  }

  if (itemExistente) {
    itemExistente.cantidad += cantSolicitada;
  } else {
    reservaUsuario.itemsReservados.push({ id: plato.id, cantidad: cantSolicitada });
  }

  // Descontar temporalmente del stock del menú general
  plato.stock -= cantSolicitada;

  return res.json({
    mensaje: "Plato agregado exitosamente a la reserva",
    reserva: obtenerReserva(),
    menuActualizado: menuInventario
  });
});

app.put('/api/reserva/actualizar-porciones/:id', (req, res) => {
  const id = Number(req.params.id);
  const nuevaCantidad = Number(req.body.cantidad);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      mensaje: "El ID del alimento no es válido."
    });
  }

  if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
    return res.status(400).json({
      mensaje: "La cantidad debe ser un entero mayor que cero."
    });
  }

  const itemReservado = reservaUsuario.itemsReservados.find(i => i.id === id);

  if (!itemReservado) {
    return res.status(404).json({
      mensaje: "El alimento no está en la reserva."
    });
  }

  const plato = menuInventario.find(p => p.id === id);

  if (!plato) {
    return res.status(404).json({
      mensaje: "El alimento no existe en el menú."
    });
  }

  const diferencia = nuevaCantidad - itemReservado.cantidad;
  const nuevoTotal = calcularTotal() + diferencia * plato.precio;

  if (superaSaldo(nuevoTotal)) {
    return res.status(400).json({
      mensaje: "Saldo insuficiente para esta cantidad"
    });
  }

  if (diferencia > 0 && plato.stock < diferencia) {
    return res.status(400).json({
      mensaje: "Stock insuficiente"
    });
  }

  plato.stock -= diferencia;
  itemReservado.cantidad = nuevaCantidad;

  return res.json({
    mensaje: "Porciones actualizadas exitosamente",
    reserva: obtenerReserva(),
    menuActualizado: menuInventario
  });
});

app.delete('/api/reserva/eliminar/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      mensaje: "El ID del alimento no es válido."
    });
  }

  const indice = reservaUsuario.itemsReservados.findIndex(i => i.id === id);

  if (indice === -1) {
    return res.status(404).json({
      mensaje: "El alimento no está en la reserva."
    });
  }

  const itemEliminado = reservaUsuario.itemsReservados[indice];
  const plato = menuInventario.find(p => p.id === id);

  if (plato) {
    plato.stock += itemEliminado.cantidad;
  }

  reservaUsuario.itemsReservados.splice(indice, 1);

  // Sin platos ya no hay reserva activa, así que el temporizador se detiene
  if (reservaUsuario.itemsReservados.length === 0) {
    reservaUsuario.inicio = null;
  }

  return res.json({
    mensaje: "Plato eliminado de la reserva",
    reserva: obtenerReserva(),
    menuActualizado: menuInventario
  });
});

// ==========================================
// ENDPOINT EXTRA: POST /api/reserva/confirmar
// Propósito: Confirma la reserva. Descuenta el total del saldo y deja el stock
// definitivamente bloqueado (ya no se devuelve al menú). La reserva queda vacía.
// ==========================================
app.post('/api/reserva/confirmar', (req, res) => {
  if (reservaUsuario.itemsReservados.length === 0) {
    return res.status(400).json({ mensaje: "No tienes platos en la reserva para confirmar." });
  }

  const total = calcularTotal();

  if (superaSaldo(total)) {
    return res.status(400).json({ mensaje: "Saldo insuficiente para esta cantidad" });
  }

  const resumen = reservaUsuario.itemsReservados.map((item) => {
    const plato = menuInventario.find((p) => p.id === item.id);
    return { nombre: plato.nombre, cantidad: item.cantidad, subtotal: Number((plato.precio * item.cantidad).toFixed(2)) };
  });

  // Se cobra y se cierra la reserva SIN devolver stock
  reservaUsuario.saldo = Number((reservaUsuario.saldo - total).toFixed(2));
  reservaUsuario.itemsReservados = [];
  reservaUsuario.inicio = null;

  return res.json({
    mensaje: `¡Reserva confirmada! Se descontaron $${total.toFixed(2)} de tu saldo.`,
    resumen,
    reserva: obtenerReserva(),
    menuActualizado: menuInventario
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de Food DEI S.A. de R.L. corriendo en el puerto ${PORT}`);
});