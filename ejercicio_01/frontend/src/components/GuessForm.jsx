import { useState } from 'react';
import { enviarIntento } from '../services/api';

const MIN = 1;
const MAX = 100;

/**
 * Formulario para enviar un intento al servidor.
 *
 * Props:
 *  - onResultado(intento, respuesta): se llama cuando el servidor responde bien.
 *    El componente padre (Integrante 4) usa esto para guardar historial y mensajes.
 *  - onError(mensaje): se llama si el servidor rechaza el intento o falla la red.
 *  - deshabilitado: true cuando el usuario ya ganó (bloquea el formulario).
 */
function GuessForm({ onResultado, onError, deshabilitado = false }) {
  // El input se guarda como string para poder dejarlo vacío
  const [valor, setValor] = useState('');
  const [enviando, setEnviando] = useState(false);

  const numero = Number(valor);
  const esValido = valor !== '' && Number.isInteger(numero) && numero >= MIN && numero <= MAX;
  const puedeEnviar = esValido && !enviando && !deshabilitado;

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    if (!puedeEnviar) return;

    setEnviando(true);
    try {
      const respuesta = await enviarIntento(numero);
      onResultado(numero, respuesta);
      setValor(''); // limpiar para el siguiente intento
    } catch (error) {
      onError?.(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="guess-form" onSubmit={manejarEnvio}>
      <label htmlFor="intento">Ingresa un número entre {MIN} y {MAX}</label>
      <div className="guess-form__fila">
        <input
          id="intento"
          type="number"
          min={MIN}
          max={MAX}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          disabled={deshabilitado || enviando}
          placeholder="Ej: 42"
          autoFocus
        />
        <button type="submit" disabled={!puedeEnviar}>
          {enviando ? 'Enviando...' : 'Adivinar'}
        </button>
      </div>
      {valor !== '' && !esValido && (
        <small className="guess-form__ayuda">Debe ser un entero entre {MIN} y {MAX}.</small>
      )}
    </form>
  );
}

export default GuessForm;
