import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, UncontrolledAlert } from 'reactstrap';
import PanelSuperior from './components/PanelSuperior';
import MenuDelDia from './components/MenuDelDia';
import { obtenerMenu, obtenerReserva, agregarAlimento } from './services/api';

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

  // Endpoint 3: el backend devuelve la reserva y el menú ya actualizados
  const manejarAgregar = async (alimentoId) => {
    setCargando(true);
    setError(null);
    try {
      const data = await agregarAlimento(alimentoId, 1);
      setReserva(data.reserva);
      setMenu(data.menuActualizado);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <PanelSuperior saldo={reserva.saldo} total={reserva.total} />
      <Container style={{ paddingTop: '90px' }}>
        {/* INTEGRANTE 4: reemplazar/mejorar este bloque con el manejo de errores definitivo */}
        {error && (
          <UncontrolledAlert color="warning" key={error + Date.now()}>
            {error}
          </UncontrolledAlert>
        )}
        <Row>
          <Col md="8">
            <h3 className="mb-3">Menú del Día {cargando && <Spinner size="sm" color="primary" />}</h3>
            <MenuDelDia menu={menu} onAgregar={manejarAgregar} cargando={cargando} />
          </Col>
          <Col md="4">
            {/* INTEGRANTE 4: aquí va la bandeja de reserva (ListGroup + ButtonGroup) */}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
