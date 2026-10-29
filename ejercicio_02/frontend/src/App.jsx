import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner, UncontrolledAlert } from 'reactstrap';
import PanelSuperior from './components/PanelSuperior';
import MenuDelDia from './components/MenuDelDia';
import BandejaReserva from './components/BandejaReserva';
import {
  obtenerMenu,
  obtenerReserva,
  agregarAlimento,
  actualizarPorciones,
  eliminarAlimento,
  confirmarReserva,
} from './services/api';

function App() {
  const [menu, setMenu] = useState([]);
  const [reserva, setReserva] = useState({ saldo: 0, itemsReservados: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);           // mensaje de confirmación de reserva
  const [finReserva, setFinReserva] = useState(null); // momento (ms) en que vence la reserva

  // Guarda la reserva y calcula cuándo vence a partir de los segundos que informa el backend
  // (se usan segundos restantes y no una hora exacta para no depender del reloj del cliente)
  const aplicarReserva = (r) => {
    setReserva(r);
    setFinReserva(r.segundosRestantes != null ? Date.now() + r.segundosRestantes * 1000 : null);
  };

  // Carga inicial: menú (Endpoint 1) y reserva (Endpoint 2) en paralelo
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [menuData, reservaData] = await Promise.all([obtenerMenu(), obtenerReserva()]);
        setMenu(menuData);
        aplicarReserva(reservaData);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);


    // Ejecuta cualquier acción contra la API con el mismo flujo:
  // cargando -> llamar -> guardar respuesta -> (si falla) mostrar error -> quitar cargando
  const ejecutarAccion = async (accion, mostrarExito = false) => {
    setCargando(true);
    setError(null);
    setExito(null);
    try {
      const data = await accion();
      aplicarReserva(data.reserva);
      setMenu(data.menuActualizado);
      if (mostrarExito) setExito(data.mensaje);
    } catch (err) {
      setError(err.message); // aquí llega "Stock insuficiente" o "Saldo insuficiente..."
    } finally {
      setCargando(false);
    }
  };

  // Endpoint 3
  const manejarAgregar = (alimentoId) =>
    ejecutarAccion(() => agregarAlimento(alimentoId, 1));

  // Endpoint 4
  const manejarCambiarPorciones = (id, nuevaCantidad) =>
    ejecutarAccion(() => actualizarPorciones(id, nuevaCantidad));

  // Endpoint 5
  const manejarEliminar = (id) =>
    ejecutarAccion(() => eliminarAlimento(id));

  // Endpoint extra: confirmar (cobra el saldo y bloquea el stock)
  const manejarConfirmar = () => ejecutarAccion(confirmarReserva, true);

  // Se llama cuando el temporizador llega a 0: el backend ya cerró la reserva y devolvió
  // el stock, así que se recarga todo y se invita al usuario a empezar de nuevo.
  const manejarExpiracion = useCallback(async () => {
    try {
      const [menuData, reservaData] = await Promise.all([obtenerMenu(), obtenerReserva()]);
      setMenu(menuData);
      aplicarReserva(reservaData);
      if (reservaData.itemsReservados.length === 0) {
        setExito(null);
        setError('⏱️ Se terminó el tiempo y tu reserva se cerró. Los platos volvieron al menú: ¡inicia tu reserva nuevamente!');
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return (
    <>
      <PanelSuperior saldo={reserva.saldo} total={reserva.total} />
      <Container className="fd-main">
        {/* Captura de errores: se muestra cuando una regla de negocio falla */}
        {error && (
          <UncontrolledAlert color="warning" className="fd-aviso" toggle={() => setError(null)}>
            ⚠️ {error}
          </UncontrolledAlert>
        )}
        {/* Confirmación exitosa de la reserva */}
        {exito && (
          <UncontrolledAlert color="success" className="fd-aviso" toggle={() => setExito(null)}>
            ✅ {exito}
          </UncontrolledAlert>
        )}
        <Row>
          <Col md="8">
            <div className="fd-seccion">
              <h2 className="fd-seccion__titulo">
                Menú del Día {cargando && <Spinner size="sm" color="success" />}
              </h2>
              <p className="fd-seccion__texto">Porciones limitadas: reserva antes de que se agoten.</p>
            </div>
            <MenuDelDia menu={menu} onAgregar={manejarAgregar} cargando={cargando} />
          </Col>
          <Col md="4">
            <div className="fd-lateral">
              <BandejaReserva
                items={reserva.itemsReservados}
                menu={menu}
                saldo={reserva.saldo}
                finReserva={finReserva}
                duracionSegundos={reserva.duracionSegundos}
                onCambiarPorciones={manejarCambiarPorciones}
                onEliminar={manejarEliminar}
                onConfirmar={manejarConfirmar}
                onExpirar={manejarExpiracion}
                cargando={cargando}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
