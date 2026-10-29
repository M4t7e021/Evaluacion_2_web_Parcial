import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, UncontrolledAlert } from 'reactstrap';
import PanelSuperior from './components/PanelSuperior';
import MenuDelDia from './components/MenuDelDia';
import BandejaReserva from './components/BandejaReserva';
import { obtenerMenu, obtenerReserva, agregarAlimento, actualizarPorciones, eliminarAlimento,} from './services/api';

function App() {
  const [menu, setMenu] = useState([]);
  const [reserva, setReserva] = useState({ saldo: 0, itemsReservados: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial: menú (Endpoint 1) y reserva (Endpoint 2) en paralelo
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [menuData, reservaData] = await Promise.all([obtenerMenu(), obtenerReserva()]);
        setMenu(menuData);
        setReserva(reservaData);
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
  const ejecutarAccion = async (accion) => {
    setCargando(true);
    setError(null);
    try {
      const data = await accion();
      setReserva(data.reserva);
      setMenu(data.menuActualizado);
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

  return (
    <>
      <PanelSuperior saldo={reserva.saldo} total={reserva.total} />
      <Container style={{ paddingTop: '90px' }}>
                {/* Captura de errores: se muestra cuando una regla de negocio falla */}
        {error && (
          <UncontrolledAlert color="warning" toggle={() => setError(null)}>
            ⚠️ {error}
          </UncontrolledAlert>
        )}
        <Row>
          <Col md="8">
            <h3 className="mb-3">Menú del Día {cargando && <Spinner size="sm" color="primary" />}</h3>
            <MenuDelDia menu={menu} onAgregar={manejarAgregar} cargando={cargando} />
          </Col>
          <Col md="4">
            <div style={{ position: 'sticky', top: '90px' }}>
              <BandejaReserva
                items={reserva.itemsReservados}
                menu={menu}
                onCambiarPorciones={manejarCambiarPorciones}
                onEliminar={manejarEliminar}
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
