import { useState } from 'react';
import GuessForm from './components/GuessForm';
import { reiniciarJuego } from './services/api';
import './App.css';

// NOTA PARA INTEGRANTE 4: este App.jsx es una integración mínima para que el formulario
// funcione. Aquí van el estado global (mensaje, ganó), el historial y el botón "Jugar de nuevo".
function App() {
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [gano, setGano] = useState(false);

  const manejarResultado = (intento, respuesta) => {
    setHistorial((prev) => [...prev, { intento, resultado: respuesta.resultado }]);
    setMensaje(respuesta.mensaje);
    setGano(respuesta.resultado === 'correcto');
  };

  const jugarDeNuevo = async () => {
    try {
      const r = await reiniciarJuego();
      setHistorial([]);
      setGano(false);
      setMensaje(r.mensaje);
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <main className="juego">
      <h1>Adivina el Número</h1>
      <GuessForm onResultado={manejarResultado} onError={setMensaje} deshabilitado={gano} />
      {mensaje && <p className="juego__mensaje">{mensaje}</p>}
      {gano && <button onClick={jugarDeNuevo}>Jugar de nuevo</button>}
      <ul>
        {historial.map((h, i) => (
          <li key={i}>{h.intento} → {h.resultado}</li>
        ))}
      </ul>
    </main>
  );
}

export default App;
