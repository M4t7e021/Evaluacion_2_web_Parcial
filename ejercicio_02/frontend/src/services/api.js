// Capa de comunicación con el backend de Food DEI.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const peticion = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  const datos = await respuesta.json();

  // Un 400 (stock/saldo insuficiente) no lanza error en fetch: lo lanzamos nosotros
  // para que el catch de React reciba el mensaje de la regla de negocio.
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Error inesperado del servidor');
  }
  return datos;
};

// Endpoint 1: GET /api/menu
export const obtenerMenu = () => peticion('/api/menu');

// Endpoint 2: GET /api/reserva
export const obtenerReserva = () => peticion('/api/reserva');

// Endpoint 3: POST /api/reserva/agregar
export const agregarAlimento = (alimentoId, cantidad = 1) =>
  peticion('/api/reserva/agregar', {
    method: 'POST',
    body: JSON.stringify({ alimentoId, cantidad }),
  });

// Endpoint 4: PUT /api/reserva/actualizar-porciones/:id  (Integrante 4)
export const actualizarPorciones = (id, cantidad) =>
  peticion(`/api/reserva/actualizar-porciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ cantidad }),
  });

// Endpoint 5: DELETE /api/reserva/eliminar/:id  (Integrante 4)
export const eliminarAlimento = (id) =>
  peticion(`/api/reserva/eliminar/${id}`, { method: 'DELETE' });
