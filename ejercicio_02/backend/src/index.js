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

// Estado de la reserva activa del usuario y su saldo inicial
let reservaUsuario = {
  saldo: 25.00,
  itemsReservados: [] // Ejemplo: [{ id: 101, cantidad: 2 }]
};

function calcularTotal() {
  const total = reservaUsuario.itemsReservados.reduce((acumulado, item) => {
    const plato = menuInventario.find(p => p.id === item.id);

    return acumulado + (plato ? plato.precio * item.cantidad : 0);
  }, 0);

  return Number(total.toFixed(2));
}

function obtenerReserva() {
  return {
    saldo: Number(reservaUsuario.saldo.toFixed(2)),
    itemsReservados: reservaUsuario.itemsReservados,
    total: calcularTotal()
  };
}

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

  return res.json({
    mensaje: "Plato eliminado de la reserva",
    reserva: obtenerReserva(),
    menuActualizado: menuInventario
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de Food DEI S.A. de R.L. corriendo en el puerto ${PORT}`);
});