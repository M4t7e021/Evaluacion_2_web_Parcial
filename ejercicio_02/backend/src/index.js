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

// ==========================================
// ENDPOINT 1: GET /api/menu
// Propósito: Devuelve la lista completa de alimentos disponibles hoy.
// ==========================================
app.get('/api/menu', (req, res) => {
  res.json(menuInventario);
});

// (Opcional complementario para que tus compañeros puedan avanzar)
// GET /api/reserva: Devuelve los detalles de la reserva activa y saldo.
app.get('/api/reserva', (req, res) => {
  const totalReserva = reservaUsuario.itemsReservados.reduce((acc, item) => {
    const plato = menuInventario.find(p => p.id === item.id);
    return acc + (plato ? plato.precio * item.cantidad : 0);
  }, 0);

  res.json({
    saldo: reservaUsuario.saldo,
    itemsReservados: reservaUsuario.itemsReservados,
    total: Number(totalReserva.toFixed(2))
  });
});

// ==========================================
// ENDPOINT 3: POST /api/reserva/agregar
// Propósito: Añade temporalmente un plato a la reserva validando el stock.
// ==========================================
app.post('/api/reserva/agregar', (req, res) => {
  const { alimentoId, cantidad } = req.body;
  const cantSolicitada = Number(cantidad) || 1;

  // Buscar el alimento en el inventario general
  const plato = menuInventario.find(p => p.id === Number(alimentoId));

  if (!plato) {
    return res.status(404).json({ mensaje: "El alimento no existe en el menú." });
  }

  // Validación estricta de stock: Si el stock es menor a lo solicitado, responde 400 Bad Request
  if (plato.stock < cantSolicitada) {
    return res.status(400).json({ mensaje: "Stock insuficiente" });
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

  // Calcular el total actual de la reserva
  const totalReserva = reservaUsuario.itemsReservados.reduce((acc, item) => {
    const p = menuInventario.find(prod => prod.id === item.id);
    return acc + (p ? p.precio * item.cantidad : 0);
  }, 0);

  return res.json({
    mensaje: "Plato agregado exitosamente a la reserva",
    reserva: {
      saldo: reservaUsuario.saldo,
      itemsReservados: reservaUsuario.itemsReservados,
      total: Number(totalReserva.toFixed(2))
    },
    menuActualizado: menuInventario
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de Food DEI S.A. de R.L. corriendo en el puerto ${PORT}`);
});