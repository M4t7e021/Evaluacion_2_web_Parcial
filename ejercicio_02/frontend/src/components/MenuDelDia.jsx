import { Row, Col, Card, CardBody, CardTitle, CardSubtitle, Badge, Button } from 'reactstrap';

// Cuadrícula del menú del día. Cada plato es una Card; el botón se desactiva si no hay stock.
function MenuDelDia({ menu, onAgregar, cargando }) {
  return (
    <Row>
      {menu.map((plato) => {
        const agotado = plato.stock === 0;
        return (
          <Col md="4" xs="12" key={plato.id}>
            <Card className="mb-3 h-100">
              <CardBody className="d-flex flex-column">
                <CardTitle tag="h5">{plato.nombre}</CardTitle>
                <CardSubtitle className="mb-2 text-muted">{plato.categoria}</CardSubtitle>
                <div className="mb-2">
                  <Badge color="success" className="fs-6">
                    ${plato.precio.toFixed(2)}
                  </Badge>
                </div>
                <p className="mb-3">Stock disponible: <strong>{plato.stock}</strong></p>
                <Button
                  className="mt-auto"
                  color={agotado ? 'secondary' : 'primary'}
                  disabled={agotado || cargando}
                  onClick={() => onAgregar(plato.id)}
                >
                  {agotado ? 'Agotado' : 'Añadir a la Reserva'}
                </Button>
              </CardBody>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default MenuDelDia;
