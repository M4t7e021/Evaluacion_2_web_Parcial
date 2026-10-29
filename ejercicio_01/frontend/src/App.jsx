import { useState } from 'react';
import GuessForm from './components/GuessForm';
import { reiniciarJuego } from './services/api';
import './App.css';

function App() {

  const [historial, setHistorial] = useState([]);              
  const [intentosFallidos, setIntentosFallidos] = useState(0); 
  const [mensaje, setMensaje] = useState('');                  
  const [gano, setGano] = useState(false);                     

  // Se ejecuta cuando GuessForm recibe una respuesta correcta del servidor
  const manejarResultado = (intento, respuesta) => {
    const acerto = respuesta.resultado === 'correcto';

    setHistorial((prev) => [...prev, { intento, resultado: respuesta.resultado }]);
    if (!acerto) {
      setIntentosFallidos((prev) => prev + 1);
    }
    setMensaje(respuesta.mensaje);
    setGano(acerto);
  };

  // Llama a POST /reset y deja todo el estado como al inicio
  const jugarDeNuevo = async () => {
    try {
      const r = await reiniciarJuego();
      setHistorial([]);
      setIntentosFallidos(0);
      setGano(false);
      setMensaje(r.mensaje);
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <main className="juego">
      <h1>Adivina el Número</h1>

      <GuessForm
        onResultado={manejarResultado}
        onError={setMensaje}
        deshabilitado={gano}
      />

      {mensaje && (
        <p className={`juego__mensaje ${gano ? 'juego__mensaje--ganaste' : ''}`}>
          {mensaje}
        </p>
      )}

      <p>Intentos fallidos: <strong>{intentosFallidos}</strong></p>

      {/* El botón solo existe cuando gano === true */}
      {gano && (
        <button className="juego__reiniciar" onClick={jugarDeNuevo}>
          Jugar de nuevo
        </button>
      )}

      <h2>Historial de intentos</h2>
      {historial.length === 0 ? (
        <p className="juego__vacio">Aún no has intentado ningún número.</p>
      ) : (
        <ol className="historial">
          {historial.map((h, i) => (
            <li key={i}>
              <strong>{h.intento}</strong> → {h.resultado}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

export default App;