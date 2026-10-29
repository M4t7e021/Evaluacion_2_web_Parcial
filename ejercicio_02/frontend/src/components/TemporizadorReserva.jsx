import { useState, useEffect } from 'react';
import { Badge, Progress } from 'reactstrap';

const segundosHasta = (fin) => Math.max(0, Math.ceil((fin - Date.now()) / 1000));
const formatear = (seg) =>
  `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;

// Cuenta regresiva de la reserva. Calcula el tiempo restante contra el reloj (Date.now),
// así sigue siendo exacta aunque la pestaña esté en segundo plano.
// Cuando llega a 0 avisa al padre con onExpirar().
function TemporizadorReserva({ finReserva, duracionSegundos, onExpirar }) {
  const [restante, setRestante] = useState(() => segundosHasta(finReserva));

  useEffect(() => {
    const actualizar = () => {
      const r = segundosHasta(finReserva);
      setRestante(r);
      return r;
    };

    actualizar();
    const id = setInterval(() => {
      if (actualizar() <= 0) {
        clearInterval(id);
        onExpirar();
      }
    }, 1000);

    return () => clearInterval(id); // limpieza al desmontar o cuando cambia la hora de vencimiento
  }, [finReserva, onExpirar]);

  const urgente = restante <= 60;
  const porcentaje = duracionSegundos ? (restante / duracionSegundos) * 100 : 0;

  return (
    <div className={`temporizador ${urgente ? 'temporizador--urgente' : ''}`}>
      <div className="temporizador__fila">
        <span>⏱️ Tiempo para confirmar</span>
        <Badge color={urgente ? 'danger' : 'dark'} pill className="temporizador__reloj">
          {formatear(restante)}
        </Badge>
      </div>
      <Progress value={porcentaje} className="temporizador__barra" aria-label="Tiempo restante de la reserva" />
    </div>
  );
}

export default TemporizadorReserva;
