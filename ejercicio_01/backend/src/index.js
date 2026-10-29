const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

// Generar número aleatorio inicial entre 1 y 100
let numeroOculto = Math.floor(Math.random() * 100) + 1;
let intentosFallidos = 0;
let juegoTerminado = false;

// Ruta para adivinar el número
app.post('/guess', (req, res) => {
  const { numero } = req.body;

if (
  numero === undefined ||
  numero === null ||
  String(numero).trim() === '' ||
  !Number.isInteger(Number(numero)) ||
  Number(numero) < 1 ||
  Number(numero) > 100
) {
  return res.status(400).json({
    mensaje: 'Por favor ingresa un número entero válido entre 1 y 100.'
  });
}

const intento = Number(numero);    

if (juegoTerminado) {
  return res.status(400).json({
    mensaje: 'El juego terminó. Reinicia para jugar nuevamente.'
  });
}

  if (intento === numeroOculto) {
    juegoTerminado = true;
    return res.json({ resultado: 'correcto', mensaje: '¡Felicidades! Adivinaste el número.' });
  } else if (intento < numeroOculto) {
    intentosFallidos++;
    return res.json({ resultado: 'mayor', mensaje: 'El número oculto es mayor.' });
  } else {
    intentosFallidos++;
    return res.json({ resultado: 'menor', mensaje: 'El número oculto es menor.' });
  }
});

// Ruta para reiniciar el juego y generar un nuevo número
app.post('/reset', (req, res) => {
  numeroOculto = Math.floor(Math.random() * 100) + 1;
  intentosFallidos = 0;
  juegoTerminado = false;
  res.json({ mensaje: 'Se ha generado un nuevo número aleatorio. ¡A jugar de nuevo!' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});