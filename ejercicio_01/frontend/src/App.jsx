import { useState, useEffect } from 'react';
import GuessForm from './components/GuessForm';
import { reiniciarJuego } from './services/api';
import './App.css';

// Símbolo que acompaña a cada resultado en el historial
const ICONO = { mayor: '↑', menor: '↓', correcto: '✓' };

function App() {

  const [historial, setHistorial] = useState([]);              
  const [intentosFallidos, setIntentosFallidos] = useState(0); 
  const [mensaje, setMensaje] = useState('');                  
  const [gano, setGano] = useState(false);                     

  // Al cargar la página se empieza una partida nueva. Así el servidor y la pantalla siempre
  // están sincronizados (si se recargaba tras ganar, el servidor seguía "terminado" y el
  // usuario quedaba bloqueado sin botón de "Jugar de nuevo").
  useEffect(() => {
    reiniciarJuego().catch((error) => setMensaje(error.message));
  }, []);

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
      <h1 className="juego__titulo">Adivina el Número</h1>
      <p className="juego__intro">Estoy pensando en un número del 1 al 100.</p>

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

      <p className="juego__intentos">Intentos fallidos: <strong>{intentosFallidos}</strong></p>

      {/* El botón solo existe cuando gano === true */}
      {gano && (
        <button className="juego__reiniciar" onClick={jugarDeNuevo}>
          Jugar de nuevo
        </button>
      )}

      <h2 className="juego__subtitulo">Historial de intentos</h2>
      {historial.length === 0 ? (
        <p className="juego__vacio">Aún no has intentado ningún número.</p>
      ) : (
        <ol className="historial">
          {historial.map((h, i) => (
            <li key={i} className={`historial__item historial__item--${h.resultado}`}>
              <strong>{h.intento}</strong> {ICONO[h.resultado]} {h.resultado}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

export default App;