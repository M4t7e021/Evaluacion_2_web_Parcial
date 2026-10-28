// Capa de comunicación con el backend (Express).
// Todas las funciones devuelven promesas y lanzan Error si el servidor responde con código != 2xx.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const peticion = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  const datos = await respuesta.json();

  // fetch NO lanza error con un 400, así que lo hacemos manualmente
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Error inesperado del servidor');
  }
  return datos;
};

// POST /guess -> { resultado: 'mayor' | 'menor' | 'correcto', mensaje }
export const enviarIntento = (numero) =>
  peticion('/guess', { method: 'POST', body: JSON.stringify({ numero }) });

// POST /reset -> { mensaje }
export const reiniciarJuego = () => peticion('/reset', { method: 'POST' });
